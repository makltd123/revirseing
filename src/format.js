// Render COS objects as short, readable strings for the inspector.

import { isRef, isDict, isStream, isArray, isName } from './model.js';

export function short(obj, { maxArray = 8, maxStr = 40 } = {}) {
  if (obj === null || obj === undefined) return 'null';
  if (obj === true) return 'true';
  if (obj === false) return 'false';
  if (typeof obj === 'number') return String(obj);
  if (typeof obj !== 'object') return String(obj);

  switch (obj.kind) {
    case 'null': return 'null';
    case 'name': return `/${obj.name}`;
    case 'ref': return `${obj.num} ${obj.gen} R`;
    case 'string': {
      const printable = obj.bytes.every((b) => b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127));
      if (printable) {
        const s = obj.bytes.toString('latin1');
        return `(${s.length > maxStr ? s.slice(0, maxStr) + '…' : s})`;
      }
      const hex = obj.bytes.toString('hex');
      return `<${hex.length > maxStr ? hex.slice(0, maxStr) + '…' : hex}>`;
    }
    case 'array': {
      const items = obj.items.slice(0, maxArray).map((x) => short(x, { maxArray, maxStr }));
      const more = obj.items.length > maxArray ? `, …(${obj.items.length})` : '';
      return `[${items.join(' ')}${more}]`;
    }
    case 'dict':
      return `<< ${dictKeys(obj)} >>`;
    case 'stream':
      return `stream(${obj.raw.length} bytes) << ${dictKeys(obj.dict)} >>`;
    default:
      return JSON.stringify(obj);
  }
}

function dictKeys(dict) {
  const keys = [...dict.map.keys()];
  const shown = keys.slice(0, 10).map((k) => `/${k}`).join(' ');
  return keys.length > 10 ? `${shown} …(${keys.length})` : shown;
}

// A fuller multi-line rendering of a dict for `inspect --object`.
export function pretty(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  if (isDict(obj) || isStream(obj)) {
    const dict = isStream(obj) ? obj.dict : obj;
    const lines = [`${isStream(obj) ? 'stream ' : ''}<<`];
    for (const [k, v] of dict.map) {
      lines.push(`${pad}  /${k} ${inline(v)}`);
    }
    lines.push(`${pad}>>`);
    if (isStream(obj)) lines.push(`${pad}  (raw stream: ${obj.raw.length} bytes)`);
    return lines.join('\n');
  }
  return inline(obj);
}

function inline(v) {
  if (isArray(v)) return `[${v.items.map(inline).join(' ')}]`;
  return short(v, { maxArray: 16, maxStr: 60 });
}

// Classify an object for the summary table.
export function classify(obj) {
  if (isStream(obj)) {
    const t = obj.dict.map.get('Type');
    return isName(t) ? `stream /${t.name}` : 'stream';
  }
  if (isDict(obj)) {
    const t = obj.dict ? obj.dict.map.get('Type') : obj.map.get('Type');
    return isName(t) ? `dict /${t.name}` : 'dict';
  }
  if (isArray(obj)) return 'array';
  if (isName(obj)) return 'name';
  if (obj && obj.kind === 'string') return 'string';
  if (typeof obj === 'number') return 'number';
  if (obj === true || obj === false) return 'boolean';
  return 'other';
}
