// The PDF object model ("COS" objects). Every value parsed from a PDF is one
// of these. We tag each with a `kind` so the resolver, inspector and text
// extractor can switch on it without guessing from JS types.

export const Name = (name) => ({ kind: 'name', name });
export const Str = (bytes, hex = false) => ({ kind: 'string', bytes, hex });
export const Ref = (num, gen) => ({ kind: 'ref', num, gen });
export const Dict = (map = new Map()) => ({ kind: 'dict', map });
export const PdfArray = (items = []) => ({ kind: 'array', items });
export const Stream = (dict, raw) => ({ kind: 'stream', dict, raw });
export const Null = () => ({ kind: 'null' });

export function isRef(o) {
  return o != null && typeof o === 'object' && o.kind === 'ref';
}
export function isDict(o) {
  return o != null && typeof o === 'object' && o.kind === 'dict';
}
export function isStream(o) {
  return o != null && typeof o === 'object' && o.kind === 'stream';
}
export function isName(o) {
  return o != null && typeof o === 'object' && o.kind === 'name';
}
export function isArray(o) {
  return o != null && typeof o === 'object' && o.kind === 'array';
}

// Look up a key in a dict by its name (accepts "Foo" or "/Foo").
export function dictGet(dict, key) {
  if (!isDict(dict)) return undefined;
  const k = key.startsWith('/') ? key.slice(1) : key;
  return dict.map.get(k);
}
