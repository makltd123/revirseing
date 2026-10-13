// Filling AcroForm fields, saved as an incremental update.
//
// We locate each named field's indirect object, set its /V to the new value,
// drop any cached appearance stream (/AP) so a stale rendering is not shown,
// and set /NeedAppearances on the AcroForm so viewers regenerate the field
// appearances. The original bytes are preserved; only new object versions are
// appended (see writer.js).

import { PDFDocument } from './document.js';
import {
  isDict, isArray, isName, dictGet,
} from './model.js';
import { decodeTextString } from './metadata.js';
import { incrementalUpdate, pdfTextString } from './writer.js';

// Collect leaf fields with the object number that defines them.
function collectFields(doc) {
  const catalog = doc.getCatalog();
  const acro = doc.resolve(catalog && dictGet(catalog, 'AcroForm'));
  if (!isDict(acro)) return { acro: null, fields: [] };
  const fieldsArr = doc.resolve(dictGet(acro, 'Fields'));
  const fields = [];
  const seen = new Set();

  const walk = (ref, parentName, inheritedFT, depth) => {
    if (depth > 50) return;
    const num = ref && ref.kind === 'ref' ? ref.num : null;
    const gen = ref && ref.kind === 'ref' ? ref.gen : 0;
    if (num !== null) { if (seen.has(num)) return; seen.add(num); }
    const node = doc.resolve(ref);
    if (!isDict(node)) return;

    const partial = strVal(doc, dictGet(node, 'T'));
    const name = partial != null ? (parentName ? `${parentName}.${partial}` : partial) : parentName;
    const ft = nameOf(doc.resolve(dictGet(node, 'FT'))) || inheritedFT;
    const kids = doc.resolve(dictGet(node, 'Kids'));
    const kidItems = isArray(kids) ? kids.items : [];
    const hasNamedKids = kidItems.some((k) => {
      const kd = doc.resolve(k);
      return isDict(kd) && dictGet(kd, 'T') !== undefined;
    });
    if (hasNamedKids) {
      for (const kid of kidItems) walk(kid, name, ft, depth + 1);
      return;
    }
    if (ft && num !== null) {
      fields.push({ num, gen, name: name || '(unnamed)', ft, dict: node });
    } else {
      for (const kid of kidItems) walk(kid, name, ft, depth + 1);
    }
  };

  if (isArray(fieldsArr)) for (const f of fieldsArr.items) walk(f, '', null, 0);

  const acroRef = catalog && dictGet(catalog, 'AcroForm');
  return { acro, acroRef, catalogRef: doc.trailer && dictGet(doc.trailer, 'Root'), catalog, fields };
}

// values: { fieldName: string | boolean }. Returns { buffer, applied, missing }.
export function fillForm(buf, values, { password = '' } = {}) {
  const doc = PDFDocument.load(buf, { password });
  if (doc.security && !doc.securityWritable) {
    // We do not re-encrypt; refuse rather than write readable data into an
    // encrypted container.
    throw new Error('cannot fill an encrypted document (decryption is read-only here)');
  }
  const { acro, acroRef, catalogRef, catalog, fields } = collectFields(doc);
  if (!acro) throw new Error('no AcroForm in this document');

  const byName = new Map(fields.map((f) => [f.name, f]));
  const changed = new Map();
  const applied = [];
  const missing = [];

  for (const [name, raw] of Object.entries(values)) {
    const field = byName.get(name);
    if (!field) { missing.push(name); continue; }
    const newDict = cloneDict(field.dict);
    setFieldValue(newDict, field.ft, raw);
    newDict.map.delete('AP'); // drop stale appearance
    changed.set(field.num, { gen: field.gen, value: newDict });
    applied.push({ name, value: raw });
  }

  if (applied.length === 0) return { buffer: null, applied, missing };

  // Set /NeedAppearances true on the AcroForm so viewers redraw the values.
  if (acroRef && acroRef.kind === 'ref') {
    const newAcro = cloneDict(acro);
    newAcro.map.set('NeedAppearances', true);
    changed.set(acroRef.num, { gen: acroRef.gen || 0, value: newAcro });
  } else if (catalogRef && catalogRef.kind === 'ref' && isDict(catalog)) {
    // AcroForm is inline in the catalog; rewrite the catalog with it updated.
    const newCat = cloneDict(catalog);
    const newAcro = cloneDict(acro);
    newAcro.map.set('NeedAppearances', true);
    newCat.map.set('AcroForm', newAcro);
    changed.set(catalogRef.num, { gen: catalogRef.gen || 0, value: newCat });
  }

  const buffer = incrementalUpdate(doc, changed);
  return { buffer, applied, missing };
}

function setFieldValue(dict, ft, raw) {
  if (ft === 'Btn') {
    // Checkbox/radio: a name state. true -> the widget's "on" name, else /Off.
    let onName = 'Yes';
    const ap = dict.map.get('AP');
    // Best-effort: look for a non-Off key in /AP /N.
    if (isDict(ap)) {
      const n = ap.map.get('N');
      if (isDict(n)) {
        for (const k of n.map.keys()) if (k !== 'Off') { onName = k; break; }
      }
    }
    const state = raw === true || raw === 'on' || raw === onName ? onName : 'Off';
    dict.map.set('V', { kind: 'name', name: state });
    dict.map.set('AS', { kind: 'name', name: state });
    return;
  }
  // Text / choice: a string value.
  dict.map.set('V', pdfTextString(String(raw)));
}

function cloneDict(d) {
  return { kind: 'dict', map: new Map(d.map) };
}
function strVal(doc, obj) {
  const v = doc.resolve(obj);
  return v && v.kind === 'string' ? decodeTextString(v.bytes, '') : null;
}
function nameOf(obj) { return isName(obj) ? obj.name : null; }
