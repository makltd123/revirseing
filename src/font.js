// Turning byte codes in a content stream into text.
//
// A PDF string is a sequence of character *codes*, not characters. What a code
// means depends entirely on the font that was selected with Tf:
//
//   * a simple font uses one byte per code, mapped through a base encoding
//     (WinAnsi/MacRoman/Standard) and optional /Differences;
//   * a composite (Type0) font uses a CMap — usually Identity-H, i.e. two
//     bytes per code;
//   * either kind may carry a /ToUnicode CMap, which is the authoritative
//     code -> Unicode mapping and takes precedence when present.
//
// Widths matter too: without them we cannot tell a kerning nudge from a space.

import { Lexer, TokenType } from './lexer.js';
import { decodeStream } from './filters.js';
import {
  isDict, isStream, isName, isArray, dictGet,
} from './model.js';
import { Encodings, glyphToUnicode } from './encodings.js';

export class Font {
  constructor(doc, fontDict) {
    this.doc = doc;
    this.dict = fontDict;
    this.subtype = nameOf(doc.resolve(dictGet(fontDict, 'Subtype')));
    this.baseFont = nameOf(doc.resolve(dictGet(fontDict, 'BaseFont')));
    this.isType0 = this.subtype === 'Type0';
    this.codeBytes = 1;
    this.toUnicode = null; // Map<code, string>
    this.encodingMap = null; // Map<code, string> for simple fonts
    this.widths = new Map(); // code -> width in glyph space (1/1000 em)
    this.defaultWidth = 500;

    this._loadToUnicode();
    if (this.isType0) this._loadType0();
    else this._loadSimple();
  }

  _loadToUnicode() {
    const tu = this.doc.resolve(dictGet(this.dict, 'ToUnicode'));
    if (!isStream(tu)) return;
    try {
      const { data } = decodeStream(tu, (x) => this.doc.resolve(x));
      const parsed = parseCMap(data);
      this.toUnicode = parsed.map;
      if (parsed.codeBytes) this.codeBytes = parsed.codeBytes;
    } catch {
      this.toUnicode = null;
    }
  }

  _loadSimple() {
    this.codeBytes = 1;
    // Base encoding, then /Differences on top.
    const enc = this.doc.resolve(dictGet(this.dict, 'Encoding'));
    let base = null;
    let differences = null;
    if (isName(enc)) {
      base = Encodings[enc.name] || null;
    } else if (isDict(enc)) {
      const be = this.doc.resolve(dictGet(enc, 'BaseEncoding'));
      if (isName(be)) base = Encodings[be.name] || null;
      const diff = this.doc.resolve(dictGet(enc, 'Differences'));
      if (isArray(diff)) differences = diff.items;
    }
    if (!base) {
      // Symbolic fonts often declare no encoding; StandardEncoding is the
      // spec's fallback and matches ASCII for the printable range.
      base = Encodings.StandardEncoding;
    }
    const map = new Map(base);
    if (differences) {
      let code = 0;
      for (const item of differences) {
        const v = this.doc.resolve(item);
        if (typeof v === 'number') {
          code = v;
        } else if (isName(v)) {
          const u = glyphToUnicode(v.name);
          if (u !== null) map.set(code, u);
          else map.delete(code);
          code++;
        }
      }
    }
    this.encodingMap = map;

    // Widths: /FirstChar + /Widths.
    const firstChar = this.doc.resolve(dictGet(this.dict, 'FirstChar'));
    const widths = this.doc.resolve(dictGet(this.dict, 'Widths'));
    if (isArray(widths) && typeof firstChar === 'number') {
      widths.items.forEach((w, i) => {
        const v = this.doc.resolve(w);
        if (typeof v === 'number') this.widths.set(firstChar + i, v);
      });
    }
    const fd = this.doc.resolve(dictGet(this.dict, 'FontDescriptor'));
    if (isDict(fd)) {
      const mw = this.doc.resolve(dictGet(fd, 'MissingWidth'));
      if (typeof mw === 'number') this.defaultWidth = mw;
    }
    if (this.widths.size === 0) {
      // No /Widths (e.g. a standard 14 font). Approximate: Courier is
      // monospaced at 600; the others average near 500.
      this.defaultWidth = /Courier|Mono/i.test(this.baseFont || '') ? 600 : 500;
    }
  }

  _loadType0() {
    // Encoding is a predefined CMap name or an embedded CMap stream.
    const enc = this.doc.resolve(dictGet(this.dict, 'Encoding'));
    if (isName(enc)) {
      this.codeBytes = /^Identity-[HV]$/.test(enc.name) ? 2 : 2;
    } else if (isStream(enc)) {
      try {
        const { data } = decodeStream(enc, (x) => this.doc.resolve(x));
        const parsed = parseCMap(data);
        if (parsed.codeBytes) this.codeBytes = parsed.codeBytes;
        else this.codeBytes = 2;
      } catch {
        this.codeBytes = 2;
      }
    } else {
      this.codeBytes = 2;
    }

    // Descendant CIDFont holds the widths.
    const desc = this.doc.resolve(dictGet(this.dict, 'DescendantFonts'));
    const cidFont = isArray(desc) ? this.doc.resolve(desc.items[0]) : null;
    if (isDict(cidFont)) {
      const dw = this.doc.resolve(dictGet(cidFont, 'DW'));
      this.defaultWidth = typeof dw === 'number' ? dw : 1000;
      const W = this.doc.resolve(dictGet(cidFont, 'W'));
      if (isArray(W)) this._parseCidWidths(W.items);
    } else {
      this.defaultWidth = 1000;
    }
  }

  // /W is [ c [w w ...] | cFirst cLast w ]*
  _parseCidWidths(items) {
    let i = 0;
    const res = (x) => this.doc.resolve(x);
    while (i < items.length) {
      const a = res(items[i]);
      if (typeof a !== 'number') { i++; continue; }
      const b = res(items[i + 1]);
      if (isArray(b)) {
        b.items.forEach((w, k) => {
          const v = res(w);
          if (typeof v === 'number') this.widths.set(a + k, v);
        });
        i += 2;
      } else if (typeof b === 'number') {
        const w = res(items[i + 2]);
        if (typeof w === 'number') {
          // Guard against absurd ranges in malformed files.
          const span = Math.min(b - a, 65535);
          for (let c = 0; c <= span; c++) this.widths.set(a + c, w);
        }
        i += 3;
      } else {
        i++;
      }
    }
  }

  // Split a PDF string into codes according to this font's code width.
  codes(bytes) {
    const out = [];
    if (this.codeBytes === 2) {
      for (let i = 0; i + 1 < bytes.length; i += 2) out.push((bytes[i] << 8) | bytes[i + 1]);
      if (bytes.length % 2 === 1) out.push(bytes[bytes.length - 1]);
    } else {
      for (const b of bytes) out.push(b);
    }
    return out;
  }

  // Unicode text for one code ('' when the code maps to nothing).
  unicodeFor(code) {
    if (this.toUnicode) {
      const u = this.toUnicode.get(code);
      if (u !== undefined) return u;
    }
    if (this.encodingMap) {
      const u = this.encodingMap.get(code);
      if (u !== undefined) return u;
    }
    if (this.isType0) return ''; // CID with no ToUnicode: not recoverable
    // Last resort for single-byte codes in the printable ASCII range.
    if (code >= 32 && code < 127) return String.fromCharCode(code);
    return '';
  }

  // Width of one code, in text-space units (em fractions).
  widthFor(code) {
    const w = this.widths.get(code);
    return (typeof w === 'number' ? w : this.defaultWidth) / 1000;
  }
}

// --- CMap parsing ----------------------------------------------------------
// Handles the subset a /ToUnicode or embedded CMap uses: codespacerange,
// bfchar and bfrange.
export function parseCMap(data) {
  const map = new Map();
  let codeBytes = 0;
  const lex = new Lexer(data, 0);
  const stack = [];

  const hexToInt = (buf) => {
    let v = 0;
    for (const b of buf) v = v * 256 + b;
    return v;
  };
  const hexToStr = (buf) => {
    // A bfchar/bfrange destination is UTF-16BE.
    if (buf.length === 0) return '';
    if (buf.length === 1) return String.fromCharCode(buf[0]);
    let s = '';
    for (let i = 0; i + 1 < buf.length; i += 2) s += String.fromCharCode((buf[i] << 8) | buf[i + 1]);
    if (buf.length % 2 === 1) s += String.fromCharCode(buf[buf.length - 1]);
    return s;
  };

  for (;;) {
    const t = lex.next();
    if (t.type === TokenType.EOF) break;

    if (t.type === TokenType.KEYWORD) {
      switch (t.value) {
        case 'endcodespacerange': {
          // pairs of hex strings; their byte length is the code width
          for (const item of stack) {
            if (item && item.type === TokenType.STRING) {
              codeBytes = Math.max(codeBytes, item.value.length);
            }
          }
          stack.length = 0;
          continue;
        }
        case 'endbfchar': {
          for (let i = 0; i + 1 < stack.length; i += 2) {
            const src = stack[i];
            const dst = stack[i + 1];
            if (src?.type === TokenType.STRING && dst?.type === TokenType.STRING) {
              map.set(hexToInt(src.value), hexToStr(dst.value));
              codeBytes = Math.max(codeBytes, src.value.length);
            }
          }
          stack.length = 0;
          continue;
        }
        case 'endbfrange': {
          for (let i = 0; i + 2 < stack.length; i += 3) {
            const lo = stack[i];
            const hi = stack[i + 1];
            const dst = stack[i + 2];
            if (lo?.type !== TokenType.STRING || hi?.type !== TokenType.STRING) continue;
            const a = hexToInt(lo.value);
            const b = hexToInt(hi.value);
            codeBytes = Math.max(codeBytes, lo.value.length);
            const span = Math.min(b - a, 65535);
            if (dst?.type === TokenType.STRING) {
              const base = hexToStr(dst.value);
              for (let c = 0; c <= span; c++) {
                // Increment the last UTF-16 unit across the range.
                if (base.length === 0) continue;
                const head = base.slice(0, -1);
                const tail = base.charCodeAt(base.length - 1) + c;
                map.set(a + c, head + String.fromCharCode(tail & 0xffff));
              }
            } else if (dst?.array) {
              dst.array.forEach((item, k) => {
                if (item?.type === TokenType.STRING) map.set(a + k, hexToStr(item.value));
              });
            }
          }
          stack.length = 0;
          continue;
        }
        case 'begincodespacerange':
        case 'beginbfchar':
        case 'beginbfrange':
          stack.length = 0;
          continue;
        default:
          continue;
      }
    }

    if (t.type === TokenType.ARRAY_OPEN) {
      // Collect an inline array of destinations for bfrange.
      const arr = [];
      for (;;) {
        const u = lex.next();
        if (u.type === TokenType.ARRAY_CLOSE || u.type === TokenType.EOF) break;
        arr.push(u);
      }
      stack.push({ array: arr });
      continue;
    }

    if (t.type === TokenType.STRING || t.type === TokenType.NUMBER) {
      stack.push(t);
      // Guard against runaway growth in malformed CMaps.
      if (stack.length > 30000) stack.length = 0;
    }
  }

  return { map, codeBytes };
}

function nameOf(obj) {
  return isName(obj) ? obj.name : null;
}
