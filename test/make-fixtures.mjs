// Generate PDF fixtures to exercise the parser's main paths. These are written
// by hand (not by a PDF library) so the bytes are fully known and the test is
// a real end-to-end check of our reader against the format.

import { writeFileSync, mkdirSync } from 'node:fs';
import zlib from 'node:zlib';

mkdirSync(new URL('./fixtures/', import.meta.url), { recursive: true });
const out = (name) => new URL(`./fixtures/${name}`, import.meta.url);

// ---- 1. Minimal classic PDF: uncompressed, classic xref table ------------
{
  const objects = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  objects[3] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>';
  const content = 'BT /F1 24 Tf 72 700 Td (Hello, revirseing!) Tj ET';
  objects[4] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [];
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = Buffer.byteLength(pdf, 'latin1');
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  writeFileSync(out('simple.pdf'), Buffer.from(pdf, 'latin1'));
  console.log('wrote simple.pdf', Buffer.byteLength(pdf, 'latin1'), 'bytes');
}

// ---- 2. FlateDecode content stream, classic xref -------------------------
{
  const content = Buffer.from('BT /F1 18 Tf 72 700 Td (Compressed stream line one) Tj 0 -24 Td (and line two) Tj ET', 'latin1');
  const deflated = zlib.deflateSync(content);

  const header = Buffer.from('%PDF-1.5\n%\xE2\xE3\xCF\xD3\n', 'latin1');
  const chunks = [header];
  const offsets = [];
  let pos = header.length;
  const push = (num, body) => {
    offsets[num] = pos;
    const b = Buffer.concat([Buffer.from(`${num} 0 obj\n`, 'latin1'), body, Buffer.from('\nendobj\n', 'latin1')]);
    chunks.push(b);
    pos += b.length;
  };
  push(1, Buffer.from('<< /Type /Catalog /Pages 2 0 R >>', 'latin1'));
  push(2, Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>', 'latin1'));
  push(3, Buffer.from('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>', 'latin1'));
  push(4, Buffer.concat([
    Buffer.from(`<< /Length ${deflated.length} /Filter /FlateDecode >>\nstream\n`, 'latin1'),
    deflated,
    Buffer.from('\nendstream', 'latin1'),
  ]));
  push(5, Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', 'latin1'));

  const xrefStart = pos;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  chunks.push(Buffer.from(xref, 'latin1'));
  writeFileSync(out('flate.pdf'), Buffer.concat(chunks));
  console.log('wrote flate.pdf', Buffer.concat(chunks).length, 'bytes');
}

// ---- 3. PDF 1.5 with an xref STREAM and an OBJECT STREAM ------------------
{
  const header = Buffer.from('%PDF-1.5\n%\xE2\xE3\xCF\xD3\n', 'latin1');
  const chunks = [header];
  const offsets = {};
  let pos = header.length;
  const pushRaw = (num, body) => {
    offsets[num] = pos;
    const b = Buffer.concat([Buffer.from(`${num} 0 obj\n`, 'latin1'), body, Buffer.from('\nendobj\n', 'latin1')]);
    chunks.push(b);
    pos += b.length;
  };

  // Page content (object 4), FlateDecode.
  const content = Buffer.from('BT /F1 20 Tf 72 700 Td (Object stream + xref stream) Tj ET', 'latin1');
  const deflated = zlib.deflateSync(content);
  pushRaw(4, Buffer.concat([
    Buffer.from(`<< /Length ${deflated.length} /Filter /FlateDecode >>\nstream\n`, 'latin1'),
    deflated,
    Buffer.from('\nendstream', 'latin1'),
  ]));

  // Object stream (object 6) holding objects 1,2,3,5 (the dicts).
  const objBodies = {
    1: '<< /Type /Catalog /Pages 2 0 R >>',
    2: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    3: '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    5: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  };
  const order = [1, 2, 3, 5];
  let bodyStr = '';
  const headerPairs = [];
  for (const n of order) {
    headerPairs.push(`${n} ${bodyStr.length}`);
    bodyStr += objBodies[n] + ' ';
  }
  const headerStr = headerPairs.join(' ') + ' ';
  const objstmPlain = Buffer.from(headerStr + bodyStr, 'latin1');
  const objstmDeflated = zlib.deflateSync(objstmPlain);
  const first = headerStr.length;
  pushRaw(6, Buffer.concat([
    Buffer.from(`<< /Type /ObjStm /N ${order.length} /First ${first} /Length ${objstmDeflated.length} /Filter /FlateDecode >>\nstream\n`, 'latin1'),
    objstmDeflated,
    Buffer.from('\nendstream', 'latin1'),
  ]));

  // Xref stream (object 7) describing all objects. W = [1,2,1].
  const xrefStreamOffset = pos;
  // entries: 0 free; 1,2,3,5 in objstm 6; 4 and 7 direct.
  const entries = {
    0: [0, 0, 255],
    1: [2, 6, 0],
    2: [2, 6, 1],
    3: [2, 6, 2],
    4: [1, offsets[4], 0],
    5: [2, 6, 3],
    6: [1, offsets[6], 0],
    7: [1, xrefStreamOffset, 0],
  };
  const size = 8;
  const rows = [];
  for (let i = 0; i < size; i++) {
    const [f0, f1, f2] = entries[i];
    rows.push(Buffer.from([f0, (f1 >> 8) & 0xff, f1 & 0xff, f2 & 0xff]));
  }
  const xrefPlain = Buffer.concat(rows);
  const xrefDeflated = zlib.deflateSync(xrefPlain);
  const xrefDict = `<< /Type /XRef /Size ${size} /Root 1 0 R /W [1 2 1] /Filter /FlateDecode /Length ${xrefDeflated.length} >>`;
  const xrefObj = Buffer.concat([
    Buffer.from(`7 0 obj\n${xrefDict}\nstream\n`, 'latin1'),
    xrefDeflated,
    Buffer.from('\nendstream\nendobj\n', 'latin1'),
  ]);
  chunks.push(xrefObj);

  chunks.push(Buffer.from(`startxref\n${xrefStreamOffset}\n%%EOF`, 'latin1'));
  writeFileSync(out('xrefstream.pdf'), Buffer.concat(chunks));
  console.log('wrote xrefstream.pdf', Buffer.concat(chunks).length, 'bytes');
}

// ---- 4. Broken xref: valid objects, but startxref points nowhere ---------
{
  // Reuse the simple layout but corrupt the startxref offset to force recovery.
  const objects = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  objects[3] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>';
  const content = 'BT (recovered) Tj ET';
  objects[4] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  let pdf = '%PDF-1.4\n';
  for (let i = 1; i < objects.length; i++) pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  pdf += `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n999999\n%%EOF`;
  writeFileSync(out('broken-xref.pdf'), Buffer.from(pdf, 'latin1'));
  console.log('wrote broken-xref.pdf', Buffer.byteLength(pdf, 'latin1'), 'bytes');
}
