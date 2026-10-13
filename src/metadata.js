// Document metadata: the /Info dictionary (classic) and the /Metadata XMP
// stream (XML). Both are optional and may disagree; we report whichever are
// present, without trusting one over the other.

import {
  isDict, isStream, isName, dictGet,
} from './model.js';
import { decodeStream } from './filters.js';

const INFO_KEYS = ['Title', 'Author', 'Subject', 'Keywords', 'Creator', 'Producer', 'CreationDate', 'ModDate', 'Trapped'];

export function readMetadata(doc) {
  return {
    info: readInfo(doc),
    xmp: readXmp(doc),
  };
}

function readInfo(doc) {
  const info = doc.resolve(doc.trailer && dictGet(doc.trailer, 'Info'));
  if (!isDict(info)) return null;
  const out = {};
  for (const key of INFO_KEYS) {
    const v = doc.resolve(dictGet(info, key));
    if (v === undefined) continue;
    if (v && v.kind === 'string') out[key] = decodeTextString(v.bytes, key);
    else if (isName(v)) out[key] = `/${v.name}`;
    else if (v === true || v === false) out[key] = v;
  }
  // Any non-standard keys too, so nothing is silently hidden.
  for (const [k] of info.map) {
    if (INFO_KEYS.includes(k) || Object.hasOwn(out, k)) continue;
    const v = doc.resolve(dictGet(info, k));
    if (v && v.kind === 'string') out[k] = decodeTextString(v.bytes, k);
  }
  return Object.keys(out).length ? out : null;
}

function readXmp(doc) {
  const catalog = doc.getCatalog();
  const meta = doc.resolve(catalog && dictGet(catalog, 'Metadata'));
  if (!isStream(meta)) return null;
  let xml;
  try {
    xml = decodeStream(meta, (x) => doc.resolve(x)).data.toString('utf8');
  } catch {
    return null;
  }
  // Pull a handful of common Dublin Core / XMP fields without a full XML
  // parser: these are the ones that map to the /Info fields.
  const fields = {};
  const add = (label, value) => { if (value && !(label in fields)) fields[label] = value; };
  add('dc:title', rdfText(xml, 'dc:title'));
  add('dc:creator', rdfText(xml, 'dc:creator'));
  add('dc:description', rdfText(xml, 'dc:description'));
  add('xmp:CreatorTool', tagText(xml, 'xmp:CreatorTool'));
  add('xmp:CreateDate', tagText(xml, 'xmp:CreateDate'));
  add('xmp:ModifyDate', tagText(xml, 'xmp:ModifyDate'));
  add('pdf:Producer', tagText(xml, 'pdf:Producer'));
  return {
    bytes: Buffer.byteLength(xml, 'utf8'),
    fields: Object.keys(fields).length ? fields : null,
  };
}

// A PDF text string is either UTF-16BE (BOM FE FF) or PDFDocEncoding; dates
// use the "D:YYYYMMDDHHmmSS" form. We decode to a readable JS string.
export function decodeTextString(bytes, key) {
  let s;
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    s = Buffer.from(bytes.subarray(2)).swap16().toString('utf16le');
  } else if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    s = bytes.subarray(3).toString('utf8');
  } else {
    s = bytes.toString('latin1'); // PDFDocEncoding is Latin-1 in the printable range
  }
  if (/Date$/.test(key)) return formatPdfDate(s) || s;
  return s;
}

// "D:20240115093000+01'00'" -> "2024-01-15 09:30:00 +01:00"
function formatPdfDate(s) {
  const m = /^D?:?(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?([Z+-])?(\d{2})?'?(\d{2})?'?/.exec(s);
  if (!m) return null;
  const [, y, mo = '01', d = '01', h = '00', mi = '00', se = '00', tzSign, tzH, tzM] = m;
  let out = `${y}-${mo}-${d} ${h}:${mi}:${se}`;
  if (tzSign === 'Z') out += ' UTC';
  else if (tzSign && tzH) out += ` ${tzSign}${tzH}:${tzM || '00'}`;
  return out;
}

function tagText(xml, tag) {
  const m = new RegExp(`<${escapeTag(tag)}[^>]*>([\\s\\S]*?)</${escapeTag(tag)}>`).exec(xml);
  return m ? m[1].trim() : null;
}

// Dublin Core wraps values in <rdf:Alt>/<rdf:Seq><rdf:li>…</rdf:li>.
function rdfText(xml, tag) {
  const block = tagText(xml, tag);
  if (!block) return null;
  const li = /<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>/.exec(block);
  return (li ? li[1] : block).trim() || null;
}

function escapeTag(t) {
  return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
