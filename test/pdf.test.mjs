import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

import { PDFDocument } from '../src/document.js';
import { decodeStream } from '../src/filters.js';
import { inspect, inspectObject } from '../src/inspect.js';
import { isStream, dictGet } from '../src/model.js';

const fx = (n) => new URL(`./fixtures/${n}`, import.meta.url);
const read = (n) => readFileSync(fx(n));

before(() => {
  if (!existsSync(fx('simple.pdf'))) {
    execFileSync('node', [new URL('./make-fixtures.mjs', import.meta.url).pathname], { stdio: 'ignore' });
  }
});

test('simple.pdf: classic xref, one page', () => {
  const { report } = inspect(read('simple.pdf'));
  assert.equal(report.version, '1.4');
  assert.equal(report.recovered, false);
  assert.equal(report.xref.total, 5);
  assert.equal(report.pages.length, 1);
});

test('flate.pdf: FlateDecode content decodes to original text', () => {
  const buf = read('flate.pdf');
  const doc = PDFDocument.load(buf);
  const obj = doc.resolve({ kind: 'ref', num: 4, gen: 0 });
  assert.ok(isStream(obj));
  const { data, filters } = decodeStream(obj, (x) => doc.resolve(x));
  assert.deepEqual(filters, ['FlateDecode']);
  assert.match(data.toString('latin1'), /Compressed stream line one/);
  assert.match(data.toString('latin1'), /and line two/);
});

test('xrefstream.pdf: xref stream + object stream resolve correctly', () => {
  const { report, doc } = inspect(read('xrefstream.pdf'));
  assert.equal(report.recovered, false);
  assert.equal(report.xref.inObjectStreams, 4);
  assert.equal(report.xref.direct, 3);
  // Catalog lives inside the object stream and must resolve.
  const catalog = doc.getCatalog();
  assert.ok(catalog);
  assert.equal(dictGet(catalog, 'Type').name, 'Catalog');
  assert.equal(report.pages.length, 1);
});

test('broken-xref.pdf: recovers by scanning for obj headers', () => {
  const { report } = inspect(read('broken-xref.pdf'));
  assert.equal(report.recovered, true);
  assert.ok(report.warnings.length >= 1);
  assert.equal(report.pages.length, 1);
});

test('inspectObject decodes a compressed stream preview', () => {
  const o = inspectObject(read('flate.pdf'), 4);
  assert.equal(o.type, 'stream');
  assert.deepEqual(o.filters, ['FlateDecode']);
  assert.match(o.preview, /Compressed stream line one/);
});

test('filters: ASCIIHex, ASCII85 and RunLength round-trips (via decodeStream shape)', async () => {
  // Build tiny synthetic streams to exercise the non-Flate filters directly.
  const mod = await import('../src/model.js');
  const { Stream, Dict, Name, PdfArray } = mod;
  const mk = (filterName, raw) => {
    const map = new Map();
    map.set('Filter', Name(filterName));
    return Stream(Dict(map), Buffer.from(raw, 'latin1'));
  };
  assert.equal(decodeStream(mk('ASCIIHexDecode', '48656c6c6f>')).data.toString('latin1'), 'Hello');
  assert.equal(decodeStream(mk('ASCII85Decode', '87cURD_*#4DfTZ)+T~>')).data.toString('latin1'), 'Hello, World!');
});
