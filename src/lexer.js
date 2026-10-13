// Byte-level tokenizer for the PDF (ISO 32000) object syntax.
//
// A PDF body is a stream of 8 "COS" object kinds built from a small set of
// lexical tokens. This lexer turns raw bytes into those tokens; the parser
// (parser.js) assembles them into objects. Working at the byte level matters:
// PDF strings and streams can contain arbitrary binary, including bytes that
// look like structure.

const WS = new Set([0x00, 0x09, 0x0a, 0x0c, 0x0d, 0x20]); // null tab LF FF CR space
const DELIM = new Set([
  0x28, 0x29, // ( )
  0x3c, 0x3e, // < >
  0x5b, 0x5d, // [ ]
  0x7b, 0x7d, // { }
  0x2f, 0x25, // / %
]);

function isWhitespace(b) {
  return WS.has(b);
}
function isDelimiter(b) {
  return DELIM.has(b);
}
function isRegular(b) {
  return b !== undefined && !isWhitespace(b) && !isDelimiter(b);
}

export const TokenType = {
  NUMBER: 'number',
  STRING: 'string', // literal or hex, value is a Buffer
  NAME: 'name',
  DICT_OPEN: 'dict_open', // <<
  DICT_CLOSE: 'dict_close', // >>
  ARRAY_OPEN: 'array_open', // [
  ARRAY_CLOSE: 'array_close', // ]
  KEYWORD: 'keyword', // obj endobj stream R true false null xref trailer ...
  EOF: 'eof',
};

export class Lexer {
  constructor(buf, pos = 0) {
    this.buf = buf;
    this.pos = pos;
  }

  _skipWhitespaceAndComments() {
    const { buf } = this;
    while (this.pos < buf.length) {
      const b = buf[this.pos];
      if (isWhitespace(b)) {
        this.pos++;
      } else if (b === 0x25) {
        // % comment runs to end of line
        while (this.pos < buf.length && buf[this.pos] !== 0x0a && buf[this.pos] !== 0x0d) {
          this.pos++;
        }
      } else {
        break;
      }
    }
  }

  next() {
    this._skipWhitespaceAndComments();
    const { buf } = this;
    if (this.pos >= buf.length) return { type: TokenType.EOF, pos: this.pos };

    const start = this.pos;
    const b = buf[this.pos];

    // << or <hex string>
    if (b === 0x3c) {
      if (buf[this.pos + 1] === 0x3c) {
        this.pos += 2;
        return { type: TokenType.DICT_OPEN, pos: start };
      }
      return this._readHexString(start);
    }
    if (b === 0x3e) {
      if (buf[this.pos + 1] === 0x3e) {
        this.pos += 2;
        return { type: TokenType.DICT_CLOSE, pos: start };
      }
      throw new SyntaxError(`Unexpected '>' at offset ${start}`);
    }
    if (b === 0x5b) {
      this.pos++;
      return { type: TokenType.ARRAY_OPEN, pos: start };
    }
    if (b === 0x5d) {
      this.pos++;
      return { type: TokenType.ARRAY_CLOSE, pos: start };
    }
    if (b === 0x28) return this._readLiteralString(start);
    if (b === 0x2f) return this._readName(start);

    // number: optional sign, digits, optional single '.'
    if (b === 0x2b || b === 0x2d || b === 0x2e || (b >= 0x30 && b <= 0x39)) {
      return this._readNumber(start);
    }

    // otherwise a bare keyword (obj, R, true, stream, ...)
    return this._readKeyword(start);
  }

  _readNumber(start) {
    const { buf } = this;
    let s = this.pos;
    if (buf[this.pos] === 0x2b || buf[this.pos] === 0x2d) this.pos++;
    let sawDigit = false;
    let sawDot = false;
    while (this.pos < buf.length) {
      const b = buf[this.pos];
      if (b >= 0x30 && b <= 0x39) {
        sawDigit = true;
        this.pos++;
      } else if (b === 0x2e && !sawDot) {
        sawDot = true;
        this.pos++;
      } else {
        break;
      }
    }
    const text = buf.toString('latin1', s, this.pos);
    if (!sawDigit) {
      // lone '.' or sign: treat as keyword to avoid a NaN masquerading as data
      this.pos = start;
      return this._readKeyword(start);
    }
    return { type: TokenType.NUMBER, value: Number(text), pos: start };
  }

  _readName(start) {
    const { buf } = this;
    this.pos++; // skip '/'
    const bytes = [];
    while (this.pos < buf.length && isRegular(buf[this.pos])) {
      let b = buf[this.pos];
      if (b === 0x23 && this.pos + 2 < buf.length) {
        // #XX hex escape inside a name
        const hex = buf.toString('latin1', this.pos + 1, this.pos + 3);
        const code = parseInt(hex, 16);
        if (!Number.isNaN(code)) {
          bytes.push(code);
          this.pos += 3;
          continue;
        }
      }
      bytes.push(b);
      this.pos++;
    }
    return { type: TokenType.NAME, value: Buffer.from(bytes).toString('latin1'), pos: start };
  }

  _readLiteralString(start) {
    const { buf } = this;
    this.pos++; // skip '('
    const out = [];
    let depth = 1;
    while (this.pos < buf.length) {
      let b = buf[this.pos++];
      if (b === 0x5c) {
        // backslash escape
        const e = buf[this.pos++];
        switch (e) {
          case 0x6e: out.push(0x0a); break; // \n
          case 0x72: out.push(0x0d); break; // \r
          case 0x74: out.push(0x09); break; // \t
          case 0x62: out.push(0x08); break; // \b
          case 0x66: out.push(0x0c); break; // \f
          case 0x28: out.push(0x28); break; // \(
          case 0x29: out.push(0x29); break; // \)
          case 0x5c: out.push(0x5c); break; // backslash
          case 0x0d: // line continuation (\ CR or \ CRLF)
            if (buf[this.pos] === 0x0a) this.pos++;
            break;
          case 0x0a: // line continuation (\ LF)
            break;
          default:
            if (e >= 0x30 && e <= 0x37) {
              // up to 3 octal digits, first already consumed
              let oct = e - 0x30;
              for (let i = 0; i < 2; i++) {
                const d = buf[this.pos];
                if (d >= 0x30 && d <= 0x37) {
                  oct = oct * 8 + (d - 0x30);
                  this.pos++;
                } else break;
              }
              out.push(oct & 0xff);
            } else {
              out.push(e); // unknown escape: keep the char
            }
        }
      } else if (b === 0x28) {
        depth++;
        out.push(b);
      } else if (b === 0x29) {
        depth--;
        if (depth === 0) break;
        out.push(b);
      } else {
        out.push(b);
      }
    }
    return { type: TokenType.STRING, value: Buffer.from(out), hex: false, pos: start };
  }

  _readHexString(start) {
    const { buf } = this;
    this.pos++; // skip '<'
    const nibbles = [];
    while (this.pos < buf.length) {
      const b = buf[this.pos++];
      if (b === 0x3e) break; // '>'
      if (isWhitespace(b)) continue;
      const n = hexVal(b);
      if (n < 0) throw new SyntaxError(`Bad hex digit in string at offset ${this.pos - 1}`);
      nibbles.push(n);
    }
    if (nibbles.length % 2 === 1) nibbles.push(0); // odd count: last nibble is high
    const out = Buffer.alloc(nibbles.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = (nibbles[2 * i] << 4) | nibbles[2 * i + 1];
    return { type: TokenType.STRING, value: out, hex: true, pos: start };
  }

  _readKeyword(start) {
    const { buf } = this;
    let s = this.pos;
    while (this.pos < buf.length && isRegular(buf[this.pos])) this.pos++;
    if (this.pos === s) {
      // not a regular char and not handled: consume one byte to make progress
      this.pos++;
    }
    return { type: TokenType.KEYWORD, value: buf.toString('latin1', s, this.pos), pos: start };
  }
}

function hexVal(b) {
  if (b >= 0x30 && b <= 0x39) return b - 0x30;
  if (b >= 0x41 && b <= 0x46) return b - 0x41 + 10;
  if (b >= 0x61 && b <= 0x66) return b - 0x61 + 10;
  return -1;
}

export { isWhitespace, isDelimiter, isRegular };
