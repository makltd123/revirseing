// Writing PDFs back out — serialization of COS objects, and incremental
// updates.
//
// An incremental update is the safe way to edit a PDF: the original bytes are
// left untouched and new object versions, a new cross-reference section and a
// new trailer are *appended*. A reader uses the last xref first and follows
// /Prev back, so the appended versions win while the original stays byte-for-
// byte intact (which also keeps any signatures over the original range valid).

import {
  isRef, isDict, isStream, isName, isArray,
} from './model.js';

// --- Serialization ---------------------------------------------------------

export function serialize(obj) {
  return Buffer.concat(serializeParts(obj));
}

function serializeParts(obj) {
  if (obj === null || obj === undefined) return [Buffer.from('null')];
  if (obj === true) return [Buffer.from('true')];
  if (obj === false) return [Buffer.from('false')];
  if (typeof obj === 'number') return [Buffer.from(formatNumber(obj))];
  if (typeof obj !== 'object') return [Buffer.from(String(obj))];

  switch (obj.kind) {
    case 'null': return [Buffer.from('null')];
    case 'name': return [Buffer.from('/' + escapeName(obj.name), 'latin1')];
    case 'ref': return [Buffer.from(`${obj.num} ${obj.gen} R`)];
    case 'string': return [serializeString(obj)];
    case 'array': {
      const parts = [Buffer.from('[')];
      obj.items.forEach((it, i) => {
        if (i > 0) parts.push(Buffer.from(' '));
        parts.push(...serializeParts(it));
      });
      parts.push(Buffer.from(']'));
      return parts;
    }
    case 'dict':
      return serializeDict(obj.map);
    case 'stream': {
      const raw = obj.raw;
      // Ensure /Length matches what we actually write.
      const map = new Map(obj.dict.map);
      map.set('Length', raw.length);
      return [
        ...serializeDict(map),
        Buffer.from('\nstream\n'),
        Buffer.from(raw),
        Buffer.from('\nendstream'),
      ];
    }
    default:
      return [Buffer.from('null')];
  }
}

function serializeDict(map) {
  const parts = [Buffer.from('<< ')];
  for (const [k, v] of map) {
    parts.push(Buffer.from('/' + escapeName(k) + ' ', 'latin1'));
    parts.push(...serializeParts(v));
    parts.push(Buffer.from(' '));
  }
  parts.push(Buffer.from('>>'));
  return parts;
}

function serializeString(obj) {
  const bytes = obj.bytes;
  // If every byte is Latin-1 printable, write a literal string with escapes.
  const printable = bytes.every((b) => b >= 0x20 && b < 0x7f);
  if (printable) {
    const out = [0x28]; // (
    for (const b of bytes) {
      if (b === 0x28 || b === 0x29 || b === 0x5c) out.push(0x5c); // escape ( ) backslash
      out.push(b);
    }
    out.push(0x29); // )
    return Buffer.from(out);
  }
  // Otherwise a hex string preserves arbitrary bytes exactly.
  return Buffer.from('<' + bytes.toString('hex') + '>', 'latin1');
}

// Build a PDF text string object for a JS string: Latin-1 literal when it
// fits, else UTF-16BE with a BOM (what viewers expect for /V, /T, etc.).
export function pdfTextString(str) {
  const fitsLatin1 = [...str].every((c) => c.charCodeAt(0) < 256);
  if (fitsLatin1) {
    return { kind: 'string', bytes: Buffer.from(str, 'latin1'), hex: false };
  }
  const u16 = Buffer.from('﻿' + str, 'utf16le').swap16();
  return { kind: 'string', bytes: u16, hex: true };
}

function formatNumber(n) {
  if (Number.isInteger(n)) return String(n);
  // Trim trailing zeros; PDF numbers are plain decimals (no exponent).
  return n.toFixed(6).replace(/\.?0+$/, '');
}

function escapeName(name) {
  let out = '';
  for (const ch of Buffer.from(name, 'latin1')) {
    const b = ch;
    if (b < 0x21 || b > 0x7e || b === 0x23 || b === 0x2f || b === 0x5b || b === 0x5d
        || b === 0x28 || b === 0x29 || b === 0x3c || b === 0x3e || b === 0x7b || b === 0x7d
        || b === 0x25) {
      out += '#' + b.toString(16).padStart(2, '0');
    } else {
      out += String.fromCharCode(b);
    }
  }
  return out;
}

// --- Incremental update ----------------------------------------------------

// changed: Map<number, { gen?, value }>. Returns a new Buffer: the original
// followed by the appended objects, a new xref (classic or stream, matching
// the original), and a trailer whose /Prev chains back to the old xref.
export function incrementalUpdate(doc, changed, extraTrailer = {}) {
  const orig = doc.buf;
  const chunks = [Buffer.from(orig)];
  let pos = orig.length;
  // Separate the appended section from the original with an EOL if needed.
  if (orig[orig.length - 1] !== 0x0a && orig[orig.length - 1] !== 0x0d) {
    chunks.push(Buffer.from('\n'));
    pos += 1;
  }

  const nums = [...changed.keys()].sort((a, b) => a - b);
  const offsets = new Map();
  const genOf = (n) => (changed.get(n)?.gen ?? 0);

  // The xref-stream case needs one more object number (the xref stream itself).
  const useStream = doc.startxrefType === 'stream';
  const maxExisting = Math.max(doc.trailer ? sizeOf(doc) - 1 : 0, ...nums);
  const xrefStreamNum = maxExisting + 1;

  for (const num of nums) {
    offsets.set(num, pos);
    const body = Buffer.concat([
      Buffer.from(`${num} ${genOf(num)} obj\n`),
      serialize(changed.get(num).value),
      Buffer.from('\nendobj\n'),
    ]);
    chunks.push(body);
    pos += body.length;
  }

  const prev = doc._findStartxref();
  const newSize = Math.max(sizeOf(doc), (useStream ? xrefStreamNum : maxExisting) + 1);
  const rootRef = doc.trailer && doc.trailer.map.get('Root');
  const infoRef = doc.trailer && doc.trailer.map.get('Info');
  const idArr = doc.trailer && doc.trailer.map.get('ID');

  if (!useStream) {
    const xrefOffset = pos;
    let xref = 'xref\n';
    for (const [start, count] of contiguousRuns(nums)) {
      xref += `${start} ${count}\n`;
      for (let i = 0; i < count; i++) {
        const n = start + i;
        xref += `${String(offsets.get(n)).padStart(10, '0')} ${String(genOf(n)).padStart(5, '0')} n \n`;
      }
    }
    const trailerMap = new Map();
    trailerMap.set('Size', newSize);
    if (rootRef) trailerMap.set('Root', rootRef);
    if (infoRef) trailerMap.set('Info', infoRef);
    if (idArr) trailerMap.set('ID', idArr);
    trailerMap.set('Prev', prev);
    for (const [k, v] of Object.entries(extraTrailer)) trailerMap.set(k, v);
    const section = Buffer.concat([
      Buffer.from(xref, 'latin1'),
      Buffer.from('trailer\n'),
      serialize({ kind: 'dict', map: trailerMap }),
      Buffer.from(`\nstartxref\n${xrefOffset}\n%%EOF\n`),
    ]);
    chunks.push(section);
    return Buffer.concat(chunks);
  }

  // xref-stream increment: describe the changed objects plus the xref stream.
  const xrefOffset = pos;
  offsets.set(xrefStreamNum, xrefOffset);
  const allNums = [...nums, xrefStreamNum].sort((a, b) => a - b);
  const rows = [];
  const index = [];
  for (const [start, count] of contiguousRuns(allNums)) {
    index.push(start, count);
    for (let i = 0; i < count; i++) {
      const n = start + i;
      const off = offsets.get(n);
      rows.push(Buffer.from([1, (off >> 24) & 0xff, (off >> 16) & 0xff, (off >> 8) & 0xff, off & 0xff, genOf(n) & 0xff]));
    }
  }
  const data = Buffer.concat(rows); // W = [1 4 1]
  const dictMap = new Map();
  dictMap.set('Type', { kind: 'name', name: 'XRef' });
  dictMap.set('Size', newSize);
  if (rootRef) dictMap.set('Root', rootRef);
  if (infoRef) dictMap.set('Info', infoRef);
  if (idArr) dictMap.set('ID', idArr);
  dictMap.set('Prev', prev);
  dictMap.set('W', { kind: 'array', items: [1, 4, 1] });
  dictMap.set('Index', { kind: 'array', items: index });
  dictMap.set('Length', data.length);
  for (const [k, v] of Object.entries(extraTrailer)) dictMap.set(k, v);
  const xrefObj = Buffer.concat([
    Buffer.from(`${xrefStreamNum} ${0} obj\n`),
    serialize({ kind: 'stream', dict: { kind: 'dict', map: dictMap }, raw: data }),
    Buffer.from(`\nendobj\nstartxref\n${xrefOffset}\n%%EOF\n`),
  ]);
  chunks.push(xrefObj);
  return Buffer.concat(chunks);
}

function sizeOf(doc) {
  const s = doc.trailer && doc.trailer.map.get('Size');
  return typeof s === 'number' ? s : 0;
}

function contiguousRuns(sortedNums) {
  const runs = [];
  let i = 0;
  while (i < sortedNums.length) {
    const start = sortedNums[i];
    let count = 1;
    while (i + count < sortedNums.length && sortedNums[i + count] === start + count) count++;
    runs.push([start, count]);
    i += count;
  }
  return runs;
}
