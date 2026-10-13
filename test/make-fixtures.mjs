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

// ---- Helper: assemble a classic-xref PDF from a list of object bodies -----
// objects is { num: Buffer|string }, rootNum names the /Catalog.
function buildPdf(objects, rootNum, version = '1.4') {
  const header = Buffer.from(`%PDF-${version}\n%\xE2\xE3\xCF\xD3\n`, 'latin1');
  const chunks = [header];
  const offsets = {};
  let pos = header.length;
  const nums = Object.keys(objects).map(Number).sort((a, b) => a - b);
  for (const n of nums) {
    offsets[n] = pos;
    const body = Buffer.isBuffer(objects[n]) ? objects[n] : Buffer.from(objects[n], 'latin1');
    const b = Buffer.concat([
      Buffer.from(`${n} 0 obj\n`, 'latin1'),
      body,
      Buffer.from('\nendobj\n', 'latin1'),
    ]);
    chunks.push(b);
    pos += b.length;
  }
  const maxNum = nums[nums.length - 1];
  const xrefStart = pos;
  let xref = `xref\n0 ${maxNum + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= maxNum; i++) {
    const off = offsets[i];
    xref += off === undefined
      ? '0000000000 65535 f \n'
      : `${String(off).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${maxNum + 1} /Root ${rootNum} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  chunks.push(Buffer.from(xref, 'latin1'));
  return Buffer.concat(chunks);
}

function stream(dictStr, data) {
  const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data, 'latin1');
  return Buffer.concat([
    Buffer.from(`<< ${dictStr} /Length ${bytes.length} >>\nstream\n`, 'latin1'),
    bytes,
    Buffer.from('\nendstream', 'latin1'),
  ]);
}

// Every code 500/1000 em wide, so advances are exactly 0.5 * fontSize.
const UNIFORM_WIDTHS = `/FirstChar 0 /Widths [${Array(256).fill(500).join(' ')}]`;

// ---- 5. Encodings: WinAnsi + /Differences, and a Type0 CMap font ---------
{
  const toUnicodeCMap = `/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CMapName /Test-UCS2 def
/CMapType 2 def
1 begincodespacerange
<0000> <FFFF>
endcodespacerange
6 beginbfchar
<0001> <041F>
<0002> <0440>
<0003> <0438>
<0004> <0432>
<0005> <0435>
<0006> <0442>
endbfchar
endcmap
CMapName currentdict /CMap defineresource pop
end
end`;

  // F1: WinAnsi base with /Differences remapping codes 200 and 201.
  // F2: Type0 / Identity-H, two-byte codes resolved through /ToUnicode.
  const content = [
    'BT /F1 12 Tf 72 700 Td (WinAnsi high byte: \\351) Tj ET',       // 0xE9 -> e-acute
    'BT /F1 12 Tf 72 680 Td (Differences: \\310\\311) Tj ET',        // 200,201 -> bullet, eacute
    'BT /F2 14 Tf 72 650 Td <000100020003000400050006> Tj ET',      // CID -> Privet (Cyrillic)
  ].join('\n');

  const pdf = buildPdf({
    1: '<< /Type /Catalog /Pages 2 0 R >>',
    2: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    3: '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    4: stream('', content),
    5: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica ${UNIFORM_WIDTHS} /Encoding << /BaseEncoding /WinAnsiEncoding /Differences [200 /bullet /eacute] >> >>`,
    6: '<< /Type /Font /Subtype /Type0 /BaseFont /TestCID /Encoding /Identity-H /DescendantFonts [7 0 R] /ToUnicode 8 0 R >>',
    7: '<< /Type /Font /Subtype /CIDFontType2 /BaseFont /TestCID /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 1000 >>',
    8: stream('', toUnicodeCMap),
  }, 1, '1.4');
  writeFileSync(out('encodings.pdf'), pdf);
  console.log('wrote encodings.pdf', pdf.length, 'bytes');
}

// ---- 6. Layout: TJ gaps, Tm placement, Form XObject, two pages -----------
{
  // Page 1: a TJ array with a kerning nudge (should NOT add a space) and a
  // wide gap (should). Then two columns placed with Tm, and a form XObject.
  const page1 = [
    // kerning nudge of -20/1000 em: too small to be a space
    'BT /F1 10 Tf 72 700 Td [(Kern) -20 (ed)] TJ ET',
    // -2000/1000 em = 2 em gap at 10pt = 20pt: clearly a space
    'BT /F1 10 Tf 72 680 Td [(Wide) -2000 (gap)] TJ ET',
    // two columns on the same baseline, placed absolutely
    'BT /F1 10 Tf 1 0 0 1 72 660 Tm (Left column) Tj ET',
    'BT /F1 10 Tf 1 0 0 1 300 660 Tm (Right column) Tj ET',
    // leading + T* produces the next line
    'BT /F1 10 Tf 14 TL 72 640 Td (First line) Tj T* (Second line) Tj ET',
    // a form XObject, translated down by cm
    'q 1 0 0 1 72 600 cm /Fx Do Q',
  ].join('\n');

  const formContent = 'BT /F1 10 Tf 0 0 Td (Inside a form XObject) Tj ET';
  const page2 = 'BT /F1 10 Tf 72 700 Td (This is page two) Tj ET';

  const pdf = buildPdf({
    1: '<< /Type /Catalog /Pages 2 0 R >>',
    2: '<< /Type /Pages /Kids [3 0 R 9 0 R] /Count 2 /Resources << /Font << /F1 5 0 R >> >> >>',
    3: '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> /XObject << /Fx 6 0 R >> >> /Contents 4 0 R >>',
    4: stream('', page1),
    5: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica ${UNIFORM_WIDTHS} /Encoding /WinAnsiEncoding >>`,
    6: stream('/Type /XObject /Subtype /Form /BBox [0 0 300 20] /Resources << /Font << /F1 5 0 R >> >>', formContent),
    // page 2 inherits /Resources from the page tree node (object 2)
    9: '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 10 0 R >>',
    10: stream('', page2),
  }, 1, '1.4');
  writeFileSync(out('layout.pdf'), pdf);
  console.log('wrote layout.pdf', pdf.length, 'bytes');
}

// ---- 7. AcroForm fields + annotations (links and a text note) ------------
// Hand-built so the test needs no external producer: two text fields with
// values, a link annotation with a URI, and a text-note annotation. Also an
// XMP /Metadata stream in attribute form to exercise the XMP reader.
{
  const xmp = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
    xmlns:xmp="http://ns.adobe.com/xap/1.0/"
    pdf:Producer="revirseing-fixtures"
    xmp:CreateDate="2026-01-02T03:04:05Z">
   <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">
    <rdf:Alt><rdf:li xml:lang="x-default">Fixture Form</rdf:li></rdf:Alt>
   </dc:title>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  const content = 'BT /F1 12 Tf 72 740 Td (Form fixture) Tj ET';
  const pdf = buildPdf({
    1: '<< /Type /Catalog /Pages 2 0 R /AcroForm 20 0 R /Metadata 21 0 R >>',
    2: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    3: '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R /Annots [11 0 R 12 0 R 13 0 R] >>',
    4: stream('', content),
    5: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica ${UNIFORM_WIDTHS} >>`,
    // widget/field: full_name text field with a value
    11: '<< /Type /Annot /Subtype /Widget /FT /Tx /T (full_name) /V (Ada Lovelace) /Rect [150 685 350 703] /Ff 2 >>',
    // link annotation with a URI action
    12: '<< /Type /Annot /Subtype /Link /Rect [130 714 320 730] /A << /S /URI /URI (https://example.org/signup) >> >>',
    // text note annotation with contents
    13: '<< /Type /Annot /Subtype /Text /Rect [400 700 420 720] /Contents (Reviewer note: check domain) >>',
    // AcroForm with a second (choice) field as a direct child
    20: '<< /Fields [11 0 R 14 0 R] >>',
    14: '<< /FT /Ch /T (country) /V (UK) /Opt [[(UK) (United Kingdom)] [(US) (United States)]] >>',
    21: stream('/Type /Metadata /Subtype /XML', xmp),
  }, 1, '1.4');
  writeFileSync(out('forms.pdf'), pdf);
  console.log('wrote forms.pdf', pdf.length, 'bytes');
}
