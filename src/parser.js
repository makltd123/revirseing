// Recursive-descent parser: assembles COS objects from the lexer's tokens.
//
// Handles the two context-sensitive cases PDF syntax has:
//   * "N G R"   -> an indirect reference
//   * "N G obj" -> the header of an indirect object
//   * a dict followed by the `stream` keyword -> a stream object, whose raw
//     bytes are delimited by the dict's /Length (or, as a fallback, by the
//     literal `endstream` marker).

import { Lexer, TokenType } from './lexer.js';
import { Name, Str, Ref, Dict, PdfArray, Stream, Null } from './model.js';

export class Parser {
  constructor(buf, pos = 0) {
    this.buf = buf;
    this.lexer = new Lexer(buf, pos);
    this._peeked = null;
  }

  get pos() {
    return this._peeked ? this._peeked.pos : this.lexer.pos;
  }

  _next() {
    if (this._peeked) {
      const t = this._peeked;
      this._peeked = null;
      return t;
    }
    return this.lexer.next();
  }

  _peek() {
    if (!this._peeked) this._peeked = this.lexer.next();
    return this._peeked;
  }

  // Parse one object starting at the current position.
  parseObject() {
    const t = this._next();
    switch (t.type) {
      case TokenType.NUMBER:
        return this._parseNumberOrRef(t);
      case TokenType.STRING:
        return Str(t.value, t.hex);
      case TokenType.NAME:
        return Name(t.value);
      case TokenType.ARRAY_OPEN:
        return this._parseArray();
      case TokenType.DICT_OPEN:
        return this._parseDictOrStream();
      case TokenType.KEYWORD:
        if (t.value === 'true') return true;
        if (t.value === 'false') return false;
        if (t.value === 'null') return Null();
        return { kind: 'keyword', value: t.value, pos: t.pos };
      case TokenType.EOF:
        throw new SyntaxError('Unexpected EOF while parsing object');
      default:
        throw new SyntaxError(`Unexpected token ${t.type} at offset ${t.pos}`);
    }
  }

  _parseNumberOrRef(first) {
    // Could be a plain number, or "N G R", or "N G obj".
    // Only integers can begin a reference / indirect-object header.
    if (Number.isInteger(first.value) && first.value >= 0) {
      const save = { pos: this.lexer.pos, peeked: this._peeked };
      const t2 = this._peek();
      if (t2.type === TokenType.NUMBER && Number.isInteger(t2.value)) {
        this._next(); // consume gen
        const t3 = this._peek();
        if (t3.type === TokenType.KEYWORD && t3.value === 'R') {
          this._next();
          return Ref(first.value, t2.value);
        }
        if (t3.type === TokenType.KEYWORD && t3.value === 'obj') {
          this._next();
          const inner = this.parseObject();
          // optional trailing 'endobj'
          const after = this._peek();
          if (after.type === TokenType.KEYWORD && after.value === 'endobj') this._next();
          return { kind: 'indirect', num: first.value, gen: t2.value, value: inner };
        }
        // not a ref/obj: roll back the consumed gen number
        this.lexer.pos = save.pos;
        this._peeked = save.peeked;
      }
    }
    return first.value;
  }

  _parseArray() {
    const items = [];
    for (;;) {
      const t = this._peek();
      if (t.type === TokenType.ARRAY_CLOSE) {
        this._next();
        break;
      }
      if (t.type === TokenType.EOF) throw new SyntaxError('Unterminated array');
      items.push(this.parseObject());
    }
    return PdfArray(items);
  }

  _parseDictOrStream() {
    const map = new Map();
    for (;;) {
      const t = this._next();
      if (t.type === TokenType.DICT_CLOSE) break;
      if (t.type === TokenType.EOF) throw new SyntaxError('Unterminated dictionary');
      if (t.type !== TokenType.NAME) {
        throw new SyntaxError(`Expected name key in dict at offset ${t.pos}, got ${t.type}`);
      }
      const value = this.parseObject();
      map.set(t.value, value);
    }
    const dict = Dict(map);

    // Is this dict actually a stream? Look for the `stream` keyword next.
    const t = this._peek();
    if (t.type === TokenType.KEYWORD && t.value === 'stream') {
      this._next();
      return this._readStreamBody(dict);
    }
    return dict;
  }

  _readStreamBody(dict) {
    // Per spec, `stream` is followed by CRLF or a single LF, then the data.
    const { buf } = this;
    let p = this.lexer.pos;
    if (buf[p] === 0x0d && buf[p + 1] === 0x0a) p += 2;
    else if (buf[p] === 0x0a) p += 1;
    else if (buf[p] === 0x0d) p += 1; // tolerate lone CR

    const dataStart = p;
    const lengthObj = dict.map.get('Length');
    let raw = null;

    if (typeof lengthObj === 'number' && Number.isInteger(lengthObj) && lengthObj >= 0) {
      const end = dataStart + lengthObj;
      if (end <= buf.length) {
        raw = buf.subarray(dataStart, end);
        // Advance lexer past the data and the trailing endstream.
        let q = end;
        // skip optional EOL before endstream
        while (q < buf.length && (buf[q] === 0x0d || buf[q] === 0x0a || buf[q] === 0x20)) q++;
        if (buf.toString('latin1', q, q + 9) === 'endstream') q += 9;
        this.lexer.pos = q;
        this._peeked = null;
        return Stream(dict, raw);
      }
    }

    // Fallback: /Length missing, indirect, or wrong — scan for `endstream`.
    const marker = Buffer.from('endstream', 'latin1');
    let idx = buf.indexOf(marker, dataStart);
    if (idx < 0) idx = buf.length;
    let dataEnd = idx;
    // trim one trailing EOL that belongs to the keyword, not the data
    if (dataEnd > dataStart && buf[dataEnd - 1] === 0x0a) dataEnd--;
    if (dataEnd > dataStart && buf[dataEnd - 1] === 0x0d) dataEnd--;
    raw = buf.subarray(dataStart, dataEnd);
    this.lexer.pos = Math.min(idx + marker.length, buf.length);
    this._peeked = null;
    return Stream(dict, raw);
  }
}

// Convenience: parse a single top-level indirect object at a byte offset.
export function parseIndirectAt(buf, offset) {
  const p = new Parser(buf, offset);
  const obj = p.parseObject();
  if (obj && obj.kind === 'indirect') return obj;
  // Some producers point directly at the value; wrap it.
  return { kind: 'indirect', num: null, gen: null, value: obj };
}
