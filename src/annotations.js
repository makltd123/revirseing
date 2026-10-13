// Form fields and annotations — the text that lives outside page content
// streams. Interactive forms (AcroForm) store their field names and values in
// a tree under the catalog; annotations (links, text notes, highlights) hang
// off each page's /Annots array and carry their own /Contents and link URIs.

import {
  isDict, isArray, isName, isStream, dictGet,
} from './model.js';
import { decodeTextString } from './metadata.js';

const FIELD_TYPES = { Tx: 'text', Btn: 'button', Ch: 'choice', Sig: 'signature' };

// Walk the AcroForm field tree into a flat list. Fields can nest: a parent
// holds the partial name, children inherit it as a dotted path, and widget
// leaves may merge the field and its on-page annotation into one dict.
export function extractFormFields(doc) {
  const catalog = doc.getCatalog();
  const acro = doc.resolve(catalog && dictGet(catalog, 'AcroForm'));
  if (!isDict(acro)) return null;
  const fields = doc.resolve(dictGet(acro, 'Fields'));
  if (!isArray(fields)) return null;

  const out = [];
  const seen = new Set();
  const walk = (ref, parentName, inheritedFT, depth) => {
    if (depth > 50) return;
    if (ref && ref.kind === 'ref') {
      if (seen.has(ref.num)) return;
      seen.add(ref.num);
    }
    const node = doc.resolve(ref);
    if (!isDict(node)) return;

    const partial = textVal(doc, dictGet(node, 'T'));
    const name = partial != null
      ? (parentName ? `${parentName}.${partial}` : partial)
      : parentName;

    const ftName = nameOf(doc.resolve(dictGet(node, 'FT'))) || inheritedFT;
    const kids = doc.resolve(dictGet(node, 'Kids'));
    const kidItems = isArray(kids) ? kids.items : [];
    // A node with named kids is an internal field; recurse.
    const hasNamedKids = kidItems.some((k) => {
      const kd = doc.resolve(k);
      return isDict(kd) && dictGet(kd, 'T') !== undefined;
    });

    if (hasNamedKids) {
      for (const kid of kidItems) walk(kid, name, ftName, depth + 1);
      return;
    }

    // Leaf field (possibly a widget). Emit it if it names a field type.
    if (ftName) {
      out.push(describeField(doc, node, name, ftName));
    } else {
      // No type here or inherited: still recurse into widget kids.
      for (const kid of kidItems) walk(kid, name, ftName, depth + 1);
    }
  };

  for (const f of fields.items) walk(f, '', null, 0);
  return out.length ? out : null;
}

function describeField(doc, node, name, ftName) {
  const field = { name: name || '(unnamed)', type: FIELD_TYPES[ftName] || ftName };
  const v = doc.resolve(dictGet(node, 'V'));
  if (v !== undefined) field.value = fieldValue(doc, v);
  const dv = doc.resolve(dictGet(node, 'DV'));
  if (dv !== undefined) field.default = fieldValue(doc, dv);

  if (ftName === 'Ch') {
    const opt = doc.resolve(dictGet(node, 'Opt'));
    if (isArray(opt)) {
      field.options = opt.items.map((o) => {
        const ro = doc.resolve(o);
        if (ro && ro.kind === 'string') return decodeTextString(ro.bytes, '');
        if (isArray(ro)) {
          // [export, display] pair
          const disp = doc.resolve(ro.items[1]);
          return disp && disp.kind === 'string' ? decodeTextString(disp.bytes, '') : null;
        }
        return null;
      }).filter(Boolean);
    }
  }
  // Flags that matter for reading a form.
  const ff = doc.resolve(dictGet(node, 'Ff'));
  if (typeof ff === 'number') {
    const flags = [];
    if (ftName === 'Tx' && (ff & (1 << 12))) flags.push('multiline');
    if (ftName === 'Tx' && (ff & (1 << 13))) flags.push('password');
    if (ff & (1 << 0)) flags.push('readonly');
    if (ff & (1 << 1)) flags.push('required');
    if (flags.length) field.flags = flags;
  }
  return field;
}

function fieldValue(doc, v) {
  if (v == null) return null;
  if (v.kind === 'string') return decodeTextString(v.bytes, '');
  if (isName(v)) return `/${v.name}`; // e.g. checkbox /On or /Off
  if (isArray(v)) {
    return v.items.map((i) => {
      const ri = doc.resolve(i);
      return ri && ri.kind === 'string' ? decodeTextString(ri.bytes, '') : null;
    }).filter(Boolean);
  }
  if (isStream(v)) return '(stream value)';
  return String(v);
}

// Per-page annotations: links (with URIs), text notes, and the like.
export function extractAnnotations(doc) {
  const pages = doc.getPages();
  const out = [];
  pages.forEach((page, i) => {
    const annots = doc.resolve(dictGet(page.dict, 'Annots'));
    if (!isArray(annots)) return;
    for (const a of annots.items) {
      const an = doc.resolve(a);
      if (!isDict(an)) continue;
      const subtype = nameOf(doc.resolve(dictGet(an, 'Subtype')));
      const entry = { page: i + 1, subtype: subtype || 'Annot' };
      const contents = doc.resolve(dictGet(an, 'Contents'));
      if (contents && contents.kind === 'string') {
        const t = decodeTextString(contents.bytes, '');
        if (t) entry.contents = t;
      }
      // Link target: /A /URI, a bare /URI, or a named/explicit destination.
      const action = doc.resolve(dictGet(an, 'A'));
      const uri = doc.resolve(isDict(action) ? dictGet(action, 'URI') : dictGet(an, 'URI'));
      if (uri && uri.kind === 'string') entry.uri = decodeTextString(uri.bytes, '');
      const rect = doc.resolve(dictGet(an, 'Rect'));
      if (isArray(rect) && rect.items.length === 4) {
        entry.rect = rect.items.map((n) => (typeof n === 'number' ? Math.round(n) : n));
      }
      // Skip empty Widget annots that only exist for form rendering.
      if (subtype === 'Widget' && !entry.contents && !entry.uri) continue;
      if (entry.contents || entry.uri || subtype !== 'Link') out.push(entry);
      else if (entry.uri) out.push(entry);
    }
  });
  return out.length ? out : null;
}

function textVal(doc, obj) {
  const v = doc.resolve(obj);
  return v && v.kind === 'string' ? decodeTextString(v.bytes, '') : null;
}
function nameOf(obj) { return isName(obj) ? obj.name : null; }
