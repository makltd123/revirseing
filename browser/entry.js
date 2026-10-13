// Browser entry: expose the text/structure engine as a global REA.
import { extractText, assembleLines } from '../src/text.js';
import { TextExtractor } from '../src/content.js';
import { PDFDocument } from '../src/document.js';
import { readMetadata } from '../src/metadata.js';

// One-call reader: parse once, return title, per-page text lines, warnings.
function readDocument(data) {
  const buf = Buffer.from(data);
  const doc = PDFDocument.load(buf);
  const meta = readMetadata(doc);
  const title = (meta.info && meta.info.Title)
    || (meta.xmp && meta.xmp.fields && meta.xmp.fields['dc:title'])
    || null;
  const extractor = new TextExtractor(doc);
  const pages = doc.getPages().map((page, i) => {
    let items = [];
    try { items = extractor.runPage(page); } catch (e) { extractor.warnings.push(`page ${i + 1}: ${e.message}`); }
    const lines = assembleLines(items);
    return { page: i + 1, lines };
  });
  return {
    title,
    author: meta.info && meta.info.Author,
    pages,
    encrypted: !!(doc.trailer && doc.trailer.map.has('Encrypt')),
    decryptable: !!doc.security,
    recovered: doc.recovered,
    warnings: [...doc.warnings, ...extractor.warnings],
  };
}

export { extractText, readDocument, PDFDocument, readMetadata };
