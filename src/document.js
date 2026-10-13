// PDFDocument ties the pieces together: find the cross-reference data, build a
// map from object number to byte offset (or to a slot in an object stream),
// and resolve indirect references on demand. Handles both classic xref tables
// with a trailer and the xref streams / object streams introduced in PDF 1.5.
// If the cross-reference data is broken, it falls back to scanning the whole
// file for `N G obj` headers so the inspector still works on damaged files.

import { Parser, parseIndirectAt } from './parser.js';
import { Lexer, TokenType } from './lexer.js';
import {
  isRef, isDict, isStream, isArray, isName, dictGet,
} from './model.js';
import { decodeStream } from './filters.js';

export class PDFDocument {
  constructor(buf) {
    this.buf = buf;
    this.xref = new Map(); // num -> { type:1, offset, gen } | { type:2, streamNum, index }
    this.trailer = null;
    this.cache = new Map(); // num -> resolved value
    this._objStmCache = new Map();
    this.recovered = false;
    this.version = null;
    this.warnings = [];
  }

  static load(buf) {
    const doc = new PDFDocument(buf);
    doc._readVersion();
    try {
      doc._readXref();
      if (!doc.trailer || !dictGet(doc.trailer, 'Root')) {
        doc._recoverByScan();
      }
    } catch (e) {
      doc.warnings.push(`xref parse failed: ${e.message}; recovering by scan`);
      doc._recoverByScan();
    }
    return doc;
  }

  _readVersion() {
    const head = this.buf.toString('latin1', 0, 32);
    const m = head.match(/%PDF-(\d+\.\d+)/);
    if (m) this.version = m[1];
    else this.warnings.push('No %PDF- header found');
  }

  // ---- Cross-reference loading -------------------------------------------

  _findStartxref() {
    const tail = this.buf.subarray(Math.max(0, this.buf.length - 2048));
    const text = tail.toString('latin1');
    const idx = text.lastIndexOf('startxref');
    if (idx < 0) throw new Error('startxref not found');
    const after = text.slice(idx + 'startxref'.length);
    const m = after.match(/\s*(\d+)/);
    if (!m) throw new Error('startxref offset unreadable');
    return parseInt(m[1], 10);
  }

  _readXref() {
    const seen = new Set();
    let offset = this._findStartxref();
    while (offset != null && !seen.has(offset)) {
      seen.add(offset);
      if (offset < 0 || offset >= this.buf.length) throw new Error(`xref offset out of range: ${offset}`);
      const trailer = this._readXrefSection(offset);
      if (!this.trailer) this.trailer = trailer;
      else this._mergeTrailer(trailer);
      // Follow /XRefStm (hybrid) then /Prev.
      const xrefStm = dictGet(trailer, 'XRefStm');
      if (typeof xrefStm === 'number' && !seen.has(xrefStm)) {
        this._readXrefSection(xrefStm);
      }
      const prev = dictGet(trailer, 'Prev');
      offset = typeof prev === 'number' ? prev : null;
    }
  }

  _mergeTrailer(t) {
    if (!isDict(t)) return;
    for (const [k, v] of t.map) {
      if (!this.trailer.map.has(k)) this.trailer.map.set(k, v);
    }
  }

  _readXrefSection(offset) {
    // Classic table begins with the keyword `xref`; otherwise it's an xref stream.
    const lex = new Lexer(this.buf, offset);
    const t = lex.next();
    if (t.type === TokenType.KEYWORD && t.value === 'xref') {
      return this._readClassicXref(lex.pos);
    }
    return this._readXrefStream(offset);
  }

  _readClassicXref(pos) {
    const { buf } = this;
    const lex = new Lexer(buf, pos);
    for (;;) {
      const save = lex.pos;
      const a = lex.next();
      if (a.type === TokenType.KEYWORD && a.value === 'trailer') break;
      if (a.type !== TokenType.NUMBER) {
        lex.pos = save;
        break;
      }
      const b = lex.next(); // count
      const start = a.value;
      const count = b.value;
      for (let i = 0; i < count; i++) {
        const off = lex.next();
        const gen = lex.next();
        const kind = lex.next(); // 'n' or 'f'
        const num = start + i;
        if (kind.value === 'n' && !this.xref.has(num)) {
          this.xref.set(num, { type: 1, offset: off.value, gen: gen.value });
        }
      }
    }
    // parse trailer dict
    const p = new Parser(buf, lex.pos);
    const trailer = p.parseObject();
    return isDict(trailer) ? trailer : null;
  }

  _readXrefStream(offset) {
    const ind = parseIndirectAt(this.buf, offset);
    const stream = ind.value;
    if (!isStream(stream)) throw new Error('xref stream expected');
    const { data } = decodeStream(stream, (x) => this.resolve(x));
    const dict = stream.dict;
    const W = dictGet(dict, 'W');
    if (!isArray(W)) throw new Error('xref stream missing /W');
    const [w0, w1, w2] = W.items.map((n) => n);
    const size = dictGet(dict, 'Size');
    const index = dictGet(dict, 'Index');
    const ranges = isArray(index)
      ? chunk(index.items, 2)
      : [[0, size]];

    let p = 0;
    const rowLen = w0 + w1 + w2;
    for (const [start, count] of ranges) {
      for (let i = 0; i < count; i++) {
        if (p + rowLen > data.length) break;
        const f0 = w0 === 0 ? 1 : readBE(data, p, w0);
        const f1 = readBE(data, p + w0, w1);
        const f2 = readBE(data, p + w0 + w1, w2);
        p += rowLen;
        const num = start + i;
        if (this.xref.has(num)) continue;
        if (f0 === 1) this.xref.set(num, { type: 1, offset: f1, gen: f2 });
        else if (f0 === 2) this.xref.set(num, { type: 2, streamNum: f1, index: f2 });
      }
    }
    return dict;
  }

  // ---- Recovery ----------------------------------------------------------

  _recoverByScan() {
    this.recovered = true;
    const { buf } = this;
    const re = /(\d+)\s+(\d+)\s+obj\b/g;
    const text = buf.toString('latin1');
    let m;
    while ((m = re.exec(text))) {
      const num = parseInt(m[1], 10);
      const gen = parseInt(m[2], 10);
      // Last definition wins (incremental updates append newer objects).
      this.xref.set(num, { type: 1, offset: m.index, gen });
    }
    if (!this.trailer || !dictGet(this.trailer, 'Root')) {
      this.trailer = this._findTrailerByScan() || this.trailer;
    }
    if (!this.trailer || !dictGet(this.trailer, 'Root')) {
      // Last resort: find any /Type /Catalog object and synthesize a trailer.
      const root = this._findCatalog();
      if (root) {
        const { Dict, Ref } = _model();
        const map = new Map();
        map.set('Root', Ref(root, 0));
        this.trailer = Dict(map);
      }
    }
  }

  _findTrailerByScan() {
    const text = this.buf.toString('latin1');
    let idx = text.lastIndexOf('trailer');
    while (idx >= 0) {
      try {
        const lex = new Lexer(this.buf, idx + 'trailer'.length);
        const p = new Parser(this.buf, lex.pos);
        const d = p.parseObject();
        if (isDict(d) && dictGet(d, 'Root')) return d;
      } catch { /* keep looking */ }
      idx = text.lastIndexOf('trailer', idx - 1);
    }
    return null;
  }

  _findCatalog() {
    for (const num of this.xref.keys()) {
      try {
        const v = this.resolve({ kind: 'ref', num, gen: 0 });
        if (isDict(v)) {
          const t = dictGet(v, 'Type');
          if (isName(t) && t.name === 'Catalog') return num;
        }
      } catch { /* ignore */ }
    }
    return null;
  }

  // ---- Resolution --------------------------------------------------------

  resolve(obj) {
    if (!isRef(obj)) return obj;
    if (this.cache.has(obj.num)) return this.cache.get(obj.num);
    const entry = this.xref.get(obj.num);
    let value = null;
    try {
      if (!entry) {
        value = null;
      } else if (entry.type === 1) {
        const ind = parseIndirectAt(this.buf, entry.offset);
        value = ind.value;
      } else if (entry.type === 2) {
        value = this._resolveFromObjStm(entry.streamNum, entry.index, obj.num);
      }
    } catch (e) {
      this.warnings.push(`resolve ${obj.num} ${obj.gen} R failed: ${e.message}`);
      value = null;
    }
    this.cache.set(obj.num, value);
    return value;
  }

  _resolveFromObjStm(streamNum, index, wantNum) {
    let parsed = this._objStmCache.get(streamNum);
    if (!parsed) {
      const stmObj = this.resolve({ kind: 'ref', num: streamNum, gen: 0 });
      if (!isStream(stmObj)) throw new Error(`object stream ${streamNum} not a stream`);
      const { data } = decodeStream(stmObj, (x) => this.resolve(x));
      const n = this.resolve(dictGet(stmObj.dict, 'N'));
      const first = this.resolve(dictGet(stmObj.dict, 'First'));
      // header: N pairs of "objNum offset"
      const lex = new Lexer(data, 0);
      const entries = [];
      for (let i = 0; i < n; i++) {
        const num = lex.next().value;
        const off = lex.next().value;
        entries.push({ num, off });
      }
      parsed = { data, first, entries };
      this._objStmCache.set(streamNum, parsed);
    }
    const slot = parsed.entries[index] || parsed.entries.find((e) => e.num === wantNum);
    if (!slot) throw new Error(`object ${wantNum} not in stream ${streamNum}`);
    const p = new Parser(parsed.data, parsed.first + slot.off);
    return p.parseObject();
  }

  // Deep-resolve one level of refs in a value (for display/convenience).
  deref(obj) {
    return isRef(obj) ? this.resolve(obj) : obj;
  }

  getCatalog() {
    const root = this.trailer && dictGet(this.trailer, 'Root');
    return root ? this.resolve(root) : null;
  }

  // Walk the page tree into a flat array of page dicts.
  getPages() {
    const catalog = this.getCatalog();
    if (!catalog) return [];
    const pagesRoot = this.resolve(dictGet(catalog, 'Pages'));
    const pages = [];
    const seen = new Set();
    const walk = (node, inherited) => {
      if (!isDict(node)) return;
      const type = dictGet(node, 'Type');
      const merged = { ...inherited };
      for (const key of ['Resources', 'MediaBox', 'CropBox', 'Rotate']) {
        const v = dictGet(node, key);
        if (v !== undefined) merged[key] = v;
      }
      if (isName(type) && type.name === 'Page') {
        pages.push({ dict: node, inherited: merged });
        return;
      }
      const kids = this.resolve(dictGet(node, 'Kids'));
      if (isArray(kids)) {
        for (const kid of kids.items) {
          if (isRef(kid)) {
            if (seen.has(kid.num)) continue;
            seen.add(kid.num);
          }
          walk(this.resolve(kid), merged);
        }
      }
    };
    walk(pagesRoot, {});
    return pages;
  }

  objectNumbers() {
    return [...this.xref.keys()].sort((a, b) => a - b);
  }
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i + n <= arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function readBE(buf, pos, width) {
  let v = 0;
  for (let i = 0; i < width; i++) v = v * 256 + buf[pos + i];
  return v;
}

// Lazy import to avoid a cycle at module top-level.
function _model() {
  // eslint-disable-next-line
  return { Dict: (m) => ({ kind: 'dict', map: m }), Ref: (num, gen) => ({ kind: 'ref', num, gen }) };
}
