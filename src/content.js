// Content-stream interpreter.
//
// A page's content stream is postfix: operands are pushed, then an operator
// consumes them. To recover text we need to follow enough of the graphics
// machinery to know *where* each string lands:
//
//   CTM          current transformation matrix (cm, q/Q)
//   Tm / Tlm     the text matrix and the text line matrix (BT, Td, TD, Tm, T*)
//   text state   font + size (Tf), char/word spacing (Tc, Tw), horizontal
//                scale (Tz), leading (TL), rise (Ts)
//
// Each show operator (Tj, TJ, ', ") emits one item per string, carrying the
// device-space origin, the text, and how far the string advanced. Line
// assembly (text.js) uses those positions; without them the output would be
// one run-on blob.

import { Lexer, TokenType } from './lexer.js';
import { Parser } from './parser.js';
import { decodeStream } from './filters.js';
import {
  isDict, isStream, isName, isArray, dictGet,
} from './model.js';
import { Font } from './font.js';

const IDENTITY = [1, 0, 0, 1, 0, 0];

function mul(m, n) {
  // m × n, both [a b c d e f] affine matrices.
  return [
    m[0] * n[0] + m[1] * n[2],
    m[0] * n[1] + m[1] * n[3],
    m[2] * n[0] + m[3] * n[2],
    m[2] * n[1] + m[3] * n[3],
    m[4] * n[0] + m[5] * n[2] + n[4],
    m[4] * n[1] + m[5] * n[3] + n[5],
  ];
}

function apply(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

export class TextExtractor {
  constructor(doc, { maxDepth = 8 } = {}) {
    this.doc = doc;
    this.maxDepth = maxDepth;
    this.fontCache = new Map();
    this.items = [];
    this.warnings = [];
  }

  // Concatenate a page's /Contents (it may be an array of streams) and run it.
  runPage(page) {
    const contents = this.doc.resolve(dictGet(page.dict, 'Contents'));
    const resources = this.doc.resolve(
      dictGet(page.dict, 'Resources') ?? page.inherited.Resources,
    );
    const buffers = [];
    const collect = (obj) => {
      const v = this.doc.resolve(obj);
      if (isStream(v)) {
        try {
          buffers.push(decodeStream(v, (x) => this.doc.resolve(x)).data);
        } catch (e) {
          this.warnings.push(`content stream decode failed: ${e.message}`);
        }
      } else if (isArray(v)) {
        for (const item of v.items) collect(item);
      }
    };
    collect(contents);
    if (buffers.length === 0) return [];
    // Streams are joined with a newline so an operator cannot straddle them.
    const data = Buffer.concat(
      buffers.flatMap((b, i) => (i === 0 ? [b] : [Buffer.from('\n'), b])),
    );
    this.items = [];
    this.execute(data, resources, IDENTITY, 0);
    return this.items;
  }

  execute(data, resources, baseCTM, depth) {
    if (depth > this.maxDepth) {
      this.warnings.push('XObject nesting limit reached');
      return;
    }
    const lex = new Lexer(data, 0);
    let operands = [];

    // Graphics state
    let ctm = baseCTM;
    const gsStack = [];

    // Text state
    let font = null;
    let fontSize = 0;
    let charSpacing = 0;
    let wordSpacing = 0;
    let hScale = 1;
    let leading = 0;
    let rise = 0;
    let renderMode = 0;
    let tm = IDENTITY;
    let tlm = IDENTITY;

    const num = (v) => (typeof v === 'number' ? v : 0);

    const showString = (bytes) => {
      if (!font) {
        // No font selected: we cannot map codes to characters.
        this.warnings.push('text shown with no font selected');
        return;
      }
      const codes = font.codes(bytes);
      let text = '';
      let advance = 0;
      for (const code of codes) {
        text += font.unicodeFor(code);
        const w0 = font.widthFor(code);
        const isSpaceByte = font.codeBytes === 1 && code === 32;
        const tx = (w0 * fontSize + charSpacing + (isSpaceByte ? wordSpacing : 0)) * hScale;
        advance += tx;
      }
      const trm = mul(mul([fontSize * hScale, 0, 0, fontSize, 0, rise], tm), ctm);
      const [x, y] = [trm[4], trm[5]];
      // Scale factor of the text space in device space, for threshold maths.
      const scale = Math.hypot(trm[0], trm[1]) / (fontSize || 1) || 1;
      if (text.length > 0 && renderMode !== 3 && renderMode !== 7) {
        this.items.push({
          x, y, text,
          width: advance * scale,
          fontSize: Math.hypot(trm[0], trm[1]) || fontSize,
          spaceWidth: (font.widthFor(32) || 0.5) * fontSize * hScale * scale,
        });
      }
      tm = mul([1, 0, 0, 1, advance, 0], tm);
    };

    const adjustTJ = (amount) => {
      const tx = (-amount / 1000) * fontSize * hScale;
      tm = mul([1, 0, 0, 1, tx, 0], tm);
    };

    const nextLine = (tx, ty) => {
      tlm = mul([1, 0, 0, 1, tx, ty], tlm);
      tm = tlm;
    };

    for (;;) {
      const t = lex.next();
      if (t.type === TokenType.EOF) break;

      // Operands
      if (t.type === TokenType.NUMBER) { operands.push(t.value); continue; }
      if (t.type === TokenType.STRING) { operands.push({ kind: 'string', bytes: t.value }); continue; }
      if (t.type === TokenType.NAME) { operands.push({ kind: 'name', name: t.value }); continue; }
      if (t.type === TokenType.ARRAY_OPEN) {
        const p = new Parser(data, t.pos);
        try {
          operands.push(p.parseObject());
          lex.pos = p.pos;
        } catch {
          operands = [];
        }
        continue;
      }
      if (t.type === TokenType.DICT_OPEN) {
        const p = new Parser(data, t.pos);
        try {
          operands.push(p.parseObject());
          lex.pos = p.pos;
        } catch {
          operands = [];
        }
        continue;
      }
      if (t.type === TokenType.ARRAY_CLOSE || t.type === TokenType.DICT_CLOSE) continue;

      // Operator
      const op = t.value;
      switch (op) {
        // --- graphics state ---
        case 'q':
          gsStack.push({ ctm, font, fontSize, charSpacing, wordSpacing, hScale, leading, rise, renderMode });
          break;
        case 'Q': {
          const s = gsStack.pop();
          if (s) {
            ({ ctm, font, fontSize, charSpacing, wordSpacing, hScale, leading, rise, renderMode } = s);
          }
          break;
        }
        case 'cm': {
          const [a, b, c, d, e, f] = operands.slice(-6).map(num);
          if (operands.length >= 6) ctm = mul([a, b, c, d, e, f], ctm);
          break;
        }

        // --- text object ---
        case 'BT':
          tm = IDENTITY;
          tlm = IDENTITY;
          break;
        case 'ET':
          break;

        // --- text state ---
        case 'Tf': {
          const size = num(operands[operands.length - 1]);
          const nameOp = operands[operands.length - 2];
          fontSize = size;
          font = this._lookupFont(resources, nameOp && nameOp.name);
          break;
        }
        case 'Tc': charSpacing = num(operands[operands.length - 1]); break;
        case 'Tw': wordSpacing = num(operands[operands.length - 1]); break;
        case 'Tz': hScale = num(operands[operands.length - 1]) / 100 || 1; break;
        case 'TL': leading = num(operands[operands.length - 1]); break;
        case 'Ts': rise = num(operands[operands.length - 1]); break;
        case 'Tr': renderMode = num(operands[operands.length - 1]); break;

        // --- text positioning ---
        case 'Td': {
          const ty = num(operands[operands.length - 1]);
          const tx = num(operands[operands.length - 2]);
          nextLine(tx, ty);
          break;
        }
        case 'TD': {
          const ty = num(operands[operands.length - 1]);
          const tx = num(operands[operands.length - 2]);
          leading = -ty;
          nextLine(tx, ty);
          break;
        }
        case 'Tm': {
          if (operands.length >= 6) {
            const [a, b, c, d, e, f] = operands.slice(-6).map(num);
            tlm = [a, b, c, d, e, f];
            tm = tlm;
          }
          break;
        }
        case 'T*':
          nextLine(0, -leading);
          break;

        // --- text showing ---
        case 'Tj': {
          const s = operands[operands.length - 1];
          if (s && s.kind === 'string') showString(s.bytes);
          break;
        }
        case 'TJ': {
          const arr = operands[operands.length - 1];
          if (arr && arr.kind === 'array') {
            for (const el of arr.items) {
              if (el && el.kind === 'string') showString(el.bytes);
              else if (typeof el === 'number') adjustTJ(el);
            }
          }
          break;
        }
        case "'": {
          const s = operands[operands.length - 1];
          nextLine(0, -leading);
          if (s && s.kind === 'string') showString(s.bytes);
          break;
        }
        case '"': {
          const s = operands[operands.length - 1];
          wordSpacing = num(operands[operands.length - 3]);
          charSpacing = num(operands[operands.length - 2]);
          nextLine(0, -leading);
          if (s && s.kind === 'string') showString(s.bytes);
          break;
        }

        // --- XObjects ---
        case 'Do': {
          const nameOp = operands[operands.length - 1];
          this._runXObject(resources, nameOp && nameOp.name, ctm, depth);
          break;
        }

        // --- inline images: skip the binary payload ---
        case 'BI': {
          lex.pos = skipInlineImage(data, lex.pos);
          break;
        }

        default:
          break;
      }
      operands = [];
    }
  }

  _lookupFont(resources, name) {
    if (!name || !isDict(resources)) return null;
    const fonts = this.doc.resolve(dictGet(resources, 'Font'));
    if (!isDict(fonts)) return null;
    const ref = dictGet(fonts, name);
    const key = ref && ref.kind === 'ref' ? `r${ref.num}` : `${name}@${resourceId(resources)}`;
    if (this.fontCache.has(key)) return this.fontCache.get(key);
    const fontDict = this.doc.resolve(ref);
    if (!isDict(fontDict)) return null;
    let f = null;
    try {
      f = new Font(this.doc, fontDict);
    } catch (e) {
      this.warnings.push(`font ${name} failed to load: ${e.message}`);
    }
    this.fontCache.set(key, f);
    return f;
  }

  _runXObject(resources, name, ctm, depth) {
    if (!name || !isDict(resources)) return;
    const xobjects = this.doc.resolve(dictGet(resources, 'XObject'));
    if (!isDict(xobjects)) return;
    const xobj = this.doc.resolve(dictGet(xobjects, name));
    if (!isStream(xobj)) return;
    const subtype = this.doc.resolve(dictGet(xobj.dict, 'Subtype'));
    if (!isName(subtype) || subtype.name !== 'Form') return; // images carry no text
    let data;
    try {
      data = decodeStream(xobj, (x) => this.doc.resolve(x)).data;
    } catch (e) {
      this.warnings.push(`form XObject ${name} decode failed: ${e.message}`);
      return;
    }
    const matrix = this.doc.resolve(dictGet(xobj.dict, 'Matrix'));
    let formCTM = ctm;
    if (isArray(matrix) && matrix.items.length >= 6) {
      const m = matrix.items.map((v) => (typeof v === 'number' ? v : 0));
      formCTM = mul(m, ctm);
    }
    const ownRes = this.doc.resolve(dictGet(xobj.dict, 'Resources')) ?? resources;
    this.execute(data, ownRes, formCTM, depth + 1);
  }
}

// `BI <dict> ID <binary> EI` — the payload is not COS syntax, so find `EI`
// surrounded by whitespace and resume there.
function skipInlineImage(data, pos) {
  const idIdx = data.indexOf(Buffer.from('ID', 'latin1'), pos);
  if (idIdx < 0) return data.length;
  let p = idIdx + 2;
  if (p < data.length && (data[p] === 0x20 || data[p] === 0x0a || data[p] === 0x0d)) p++;
  for (let i = p; i + 1 < data.length; i++) {
    if (data[i] === 0x45 && data[i + 1] === 0x49) { // 'EI'
      const before = i === 0 ? 0x20 : data[i - 1];
      const after = i + 2 < data.length ? data[i + 2] : 0x20;
      const isWs = (b) => b === 0x20 || b === 0x0a || b === 0x0d || b === 0x09 || b === 0x00 || b === 0x0c;
      if (isWs(before) && (isWs(after) || i + 2 >= data.length)) return i + 2;
    }
  }
  return data.length;
}

let resourceCounter = 0;
const resourceIds = new WeakMap();
function resourceId(res) {
  if (!resourceIds.has(res)) resourceIds.set(res, ++resourceCounter);
  return resourceIds.get(res);
}

export { mul, apply, IDENTITY };
