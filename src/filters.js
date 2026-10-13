// Stream filters. PDF stream data is encoded with zero or more filters named
// in the stream dict's /Filter entry; to see the real bytes you reverse them
// in order. FlateDecode (zlib) is by far the most common, often paired with a
// PNG/TIFF predictor that must also be undone.

import zlib from 'node:zlib';
import { isName, isArray, isDict, dictGet } from './model.js';

export function decodeStream(stream, resolve = (x) => x) {
  let data = Buffer.from(stream.raw);
  const filters = normalizeToList(resolve(dictGet(stream.dict, 'Filter')), resolve);
  const parmsList = normalizeToList(resolve(dictGet(stream.dict, 'DecodeParms')), resolve);

  const steps = [];
  for (let i = 0; i < filters.length; i++) {
    const f = filters[i];
    if (!isName(f)) throw new Error(`Unsupported /Filter entry: ${describe(f)}`);
    const parms = resolve(parmsList[i]);
    data = applyFilter(f.name, data, parms, resolve);
    steps.push(f.name);
  }
  return { data, filters: steps };
}

function normalizeToList(obj, resolve) {
  if (obj == null) return [];
  if (isArray(obj)) return obj.items.map(resolve);
  return [obj];
}

function applyFilter(name, data, parms, resolve) {
  switch (name) {
    case 'FlateDecode':
    case 'Fl':
      return applyPredictor(inflate(data), parms, resolve);
    case 'LZWDecode':
    case 'LZW':
      return applyPredictor(lzwDecode(data, predictorEarlyChange(parms, resolve)), parms, resolve);
    case 'ASCIIHexDecode':
    case 'AHx':
      return asciiHexDecode(data);
    case 'ASCII85Decode':
    case 'A85':
      return ascii85Decode(data);
    case 'RunLengthDecode':
    case 'RL':
      return runLengthDecode(data);
    default:
      // Image filters (DCT/JPX/CCITT/JBIG2) are left raw; we report the name.
      throw new Error(`Filter not decoded: ${name}`);
  }
}

function inflate(data) {
  try {
    return zlib.inflateSync(data);
  } catch {
    // Some producers omit the zlib header or leave garbage; try raw inflate
    // and a one-byte-skewed start before giving up.
    try {
      return zlib.inflateRawSync(data);
    } catch {
      return zlib.inflateSync(data.subarray(1));
    }
  }
}

// ---- Predictors (PDF spec 7.4.4.4) ---------------------------------------

function num(obj, resolve, dflt) {
  const v = resolve(obj);
  return typeof v === 'number' ? v : dflt;
}

function predictorEarlyChange(parms, resolve) {
  if (!isDict(parms)) return 1;
  return num(dictGet(parms, 'EarlyChange'), resolve, 1);
}

function applyPredictor(data, parms, resolve) {
  if (!isDict(parms)) return data;
  const predictor = num(dictGet(parms, 'Predictor'), resolve, 1);
  if (predictor <= 1) return data;

  const colors = num(dictGet(parms, 'Colors'), resolve, 1);
  const bpc = num(dictGet(parms, 'BitsPerComponent'), resolve, 8);
  const columns = num(dictGet(parms, 'Columns'), resolve, 1);
  const bytesPerPixel = Math.max(1, Math.ceil((colors * bpc) / 8));
  const rowLen = Math.ceil((colors * bpc * columns) / 8);

  if (predictor === 2) return tiffPredictor(data, rowLen, bytesPerPixel);
  return pngPredictor(data, rowLen, bytesPerPixel);
}

function pngPredictor(data, rowLen, bpp) {
  const out = [];
  let prev = Buffer.alloc(rowLen);
  let p = 0;
  while (p + 1 + rowLen <= data.length) {
    const type = data[p++];
    const row = Buffer.from(data.subarray(p, p + rowLen));
    p += rowLen;
    for (let i = 0; i < rowLen; i++) {
      const a = i >= bpp ? row[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let v = row[i];
      switch (type) {
        case 0: break; // None
        case 1: v = (v + a) & 0xff; break; // Sub
        case 2: v = (v + b) & 0xff; break; // Up
        case 3: v = (v + ((a + b) >> 1)) & 0xff; break; // Average
        case 4: v = (v + paeth(a, b, c)) & 0xff; break; // Paeth
        default: break;
      }
      row[i] = v;
    }
    out.push(row);
    prev = row;
  }
  return Buffer.concat(out);
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function tiffPredictor(data, rowLen, bpp) {
  const out = Buffer.from(data);
  for (let r = 0; r + rowLen <= out.length; r += rowLen) {
    for (let i = bpp; i < rowLen; i++) {
      out[r + i] = (out[r + i] + out[r + i - bpp]) & 0xff;
    }
  }
  return out;
}

// ---- Simple ASCII / RLE filters ------------------------------------------

function asciiHexDecode(data) {
  const nibbles = [];
  for (const b of data) {
    if (b === 0x3e) break; // '>'
    if (b === 0x20 || b === 0x09 || b === 0x0a || b === 0x0d || b === 0x0c || b === 0x00) continue;
    const n = parseInt(String.fromCharCode(b), 16);
    if (Number.isNaN(n)) throw new Error('ASCIIHexDecode: bad digit');
    nibbles.push(n);
  }
  if (nibbles.length % 2) nibbles.push(0);
  const out = Buffer.alloc(nibbles.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = (nibbles[2 * i] << 4) | nibbles[2 * i + 1];
  return out;
}

function ascii85Decode(data) {
  const out = [];
  let tuple = [];
  let i = 0;
  if (data[0] === 0x3c && data[1] === 0x7e) i = 2; // optional <~ prefix
  for (; i < data.length; i++) {
    const b = data[i];
    if (b === 0x7e) break; // '~' end
    if (b === 0x20 || b === 0x09 || b === 0x0a || b === 0x0d || b === 0x0c || b === 0x00) continue;
    if (b === 0x7a && tuple.length === 0) {
      out.push(0, 0, 0, 0); // 'z' shorthand for four zero bytes
      continue;
    }
    tuple.push(b - 0x21);
    if (tuple.length === 5) {
      let v = 0;
      for (const t of tuple) v = v * 85 + t;
      out.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
      tuple = [];
    }
  }
  if (tuple.length > 0) {
    const n = tuple.length;
    while (tuple.length < 5) tuple.push(84);
    let v = 0;
    for (const t of tuple) v = v * 85 + t;
    const bytes = [(v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];
    for (let k = 0; k < n - 1; k++) out.push(bytes[k]);
  }
  return Buffer.from(out);
}

function runLengthDecode(data) {
  const out = [];
  let i = 0;
  while (i < data.length) {
    const len = data[i++];
    if (len === 128) break; // EOD
    if (len < 128) {
      for (let j = 0; j <= len && i < data.length; j++) out.push(data[i++]);
    } else {
      const b = data[i++];
      for (let j = 0; j < 257 - len; j++) out.push(b);
    }
  }
  return Buffer.from(out);
}

// ---- LZWDecode (PDF variant of TIFF LZW) ---------------------------------

function lzwDecode(data, earlyChange = 1) {
  const out = [];
  let table = [];
  const reset = () => {
    table = [];
    for (let i = 0; i < 256; i++) table.push([i]);
    table.push(null); // 256 clear
    table.push(null); // 257 eod
  };
  reset();
  let codeWidth = 9;
  let prev = null;
  let bitBuf = 0;
  let bitCnt = 0;
  let p = 0;
  for (;;) {
    while (bitCnt < codeWidth && p < data.length) {
      bitBuf = (bitBuf << 8) | data[p++];
      bitCnt += 8;
    }
    if (bitCnt < codeWidth) break;
    const code = (bitBuf >> (bitCnt - codeWidth)) & ((1 << codeWidth) - 1);
    bitCnt -= codeWidth;

    if (code === 256) {
      reset();
      codeWidth = 9;
      prev = null;
      continue;
    }
    if (code === 257) break;

    let entry;
    if (code < table.length && table[code]) {
      entry = table[code];
    } else if (prev) {
      entry = prev.concat(prev[0]);
    } else {
      break;
    }
    for (const b of entry) out.push(b);
    if (prev) {
      table.push(prev.concat(entry[0]));
    }
    prev = entry;
    if (table.length + earlyChange - 1 >= (1 << codeWidth) && codeWidth < 12) codeWidth++;
  }
  return Buffer.from(out);
}

function describe(obj) {
  if (obj == null) return String(obj);
  if (typeof obj === 'object' && obj.kind) return obj.kind + (obj.name ? ` /${obj.name}` : '');
  return String(obj);
}
