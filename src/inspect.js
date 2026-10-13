// The `inspect` command: summarize a PDF's anatomy — version, trailer,
// cross-reference contents, per-object catalog, and page count.

import { PDFDocument } from './document.js';
import {
  isStream, isDict, isName, isArray, dictGet,
} from './model.js';
import { decodeStream } from './filters.js';
import { short, pretty, classify } from './format.js';
import { readMetadata } from './metadata.js';
import { extractFormFields, extractAnnotations } from './annotations.js';

function safe(fn) { try { return fn(); } catch { return null; } }

export function inspect(buf, { password = '' } = {}) {
  const doc = PDFDocument.load(buf, { password });
  const report = {
    version: doc.version,
    fileSize: buf.length,
    recovered: doc.recovered,
    warnings: doc.warnings,
    trailer: summarizeTrailer(doc),
    metadata: readMetadata(doc),
    xref: summarizeXref(doc),
    objects: summarizeObjects(doc),
    pages: summarizePages(doc),
    decryption: doc.trailer && dictGet(doc.trailer, 'Encrypt')
      ? (doc.security ? 'decrypted (standard handler)' : 'LOCKED — password required')
      : null,
  };
  const fields = safe(() => extractFormFields(doc));
  const annots = safe(() => extractAnnotations(doc));
  report.formFields = fields ? fields.length : 0;
  report.annotations = annots ? annots.length : 0;
  return { doc, report };
}

function summarizeTrailer(doc) {
  if (!doc.trailer) return null;
  const t = doc.trailer;
  const out = {};
  for (const key of ['Root', 'Info', 'Size', 'ID', 'Encrypt']) {
    const v = dictGet(t, key);
    if (v !== undefined) out[key] = short(v);
  }
  out.encrypted = dictGet(t, 'Encrypt') !== undefined;
  return out;
}

function summarizeXref(doc) {
  let direct = 0;
  let inObjStm = 0;
  for (const e of doc.xref.values()) {
    if (e.type === 1) direct++;
    else if (e.type === 2) inObjStm++;
  }
  return { total: doc.xref.size, direct, inObjectStreams: inObjStm };
}

function summarizeObjects(doc) {
  const rows = [];
  for (const num of doc.objectNumbers()) {
    let obj;
    try {
      obj = doc.resolve({ kind: 'ref', num, gen: 0 });
    } catch (e) {
      rows.push({ num, type: 'error', detail: e.message });
      continue;
    }
    const row = { num, type: classify(obj) };
    if (isStream(obj)) {
      row.rawBytes = obj.raw.length;
      const filter = dictGet(obj.dict, 'Filter');
      if (filter) row.filter = short(filter);
      const length = dictGet(obj.dict, 'Length');
      if (length !== undefined) row.length = short(length);
    } else {
      row.detail = short(obj);
    }
    rows.push(row);
  }
  return rows;
}

function summarizePages(doc) {
  try {
    const pages = doc.getPages();
    return pages.map((p, i) => {
      const mediaBox = p.inherited.MediaBox || dictGet(p.dict, 'MediaBox');
      const contents = dictGet(p.dict, 'Contents');
      return {
        index: i,
        mediaBox: mediaBox ? short(mediaBox) : null,
        hasContents: contents !== undefined,
      };
    });
  } catch (e) {
    return { error: e.message };
  }
}

// Resolve + fully show one object by number (for `inspect --object N`).
export function inspectObject(buf, num, { password = '' } = {}) {
  const doc = PDFDocument.load(buf, { password });
  const obj = doc.resolve({ kind: 'ref', num, gen: 0 });
  const out = { num, type: classify(obj), rendered: pretty(obj) };
  if (isStream(obj)) {
    try {
      const { data, filters } = decodeStream(obj, (x) => doc.resolve(x));
      out.decodedBytes = data.length;
      out.filters = filters;
      out.preview = previewBytes(data);
    } catch (e) {
      out.decodeError = e.message;
      out.preview = previewBytes(obj.raw);
    }
  }
  return out;
}

function previewBytes(buf, max = 400) {
  const slice = buf.subarray(0, max);
  const printable = slice.every((b) => b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127));
  const text = printable
    ? slice.toString('latin1')
    : slice.toString('hex').replace(/(..)/g, '$1 ').trim();
  return (buf.length > max ? text + '\n…' : text);
}


export function readForms(buf, { password = '' } = {}) {
  const doc = PDFDocument.load(buf, { password });
  return {
    fields: extractFormFields(doc) || [],
    annotations: extractAnnotations(doc) || [],
    warnings: doc.warnings,
  };
}
