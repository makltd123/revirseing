// Assemble positioned text items into readable lines.
//
// The interpreter gives us fragments with device-space origins. A PDF has no
// notion of lines or words in its content stream, so reading order has to be
// reconstructed from geometry: cluster fragments by baseline, order them left
// to right, and insert a space wherever the horizontal gap between two
// fragments is wide enough to be one.

import { PDFDocument } from './document.js';
import { TextExtractor } from './content.js';

export function extractText(buf, { pageNumbers = null, layout = false, password = '' } = {}) {
  const doc = PDFDocument.load(buf, { password });
  const pages = doc.getPages();
  const extractor = new TextExtractor(doc);
  const out = [];

  pages.forEach((page, i) => {
    if (pageNumbers && !pageNumbers.includes(i + 1)) return;
    let items = [];
    try {
      items = extractor.runPage(page);
    } catch (e) {
      extractor.warnings.push(`page ${i + 1} failed: ${e.message}`);
    }
    const lines = assembleLines(items);
    out.push({
      page: i + 1,
      lines,
      text: layout ? layoutText(items) : lines.map((l) => l.text).join('\n'),
      itemCount: items.length,
    });
  });

  return {
    pages: out,
    warnings: [...doc.warnings, ...extractor.warnings],
    encrypted: isEncrypted(doc),
  };
}

function isEncrypted(doc) {
  if (!doc.trailer) return false;
  return doc.trailer.map.has('Encrypt');
}

// Cluster fragments into lines by baseline, then order and join each line.
export function assembleLines(items) {
  if (items.length === 0) return [];

  // Sort top-to-bottom (PDF y grows upward), then left-to-right.
  const sorted = [...items].sort((a, b) => (b.y - a.y) || (a.x - b.x));

  const lines = [];
  let current = null;
  for (const item of sorted) {
    const tol = Math.max(1, (item.fontSize || 10) * 0.4);
    if (current && Math.abs(item.y - current.y) <= tol) {
      current.items.push(item);
      // Track the dominant baseline as a running average.
      current.y = (current.y * (current.items.length - 1) + item.y) / current.items.length;
    } else {
      current = { y: item.y, items: [item] };
      lines.push(current);
    }
  }

  return lines.map((line) => {
    line.items.sort((a, b) => a.x - b.x);
    let text = '';
    let prevEnd = null;
    for (const it of line.items) {
      if (prevEnd !== null) {
        const gap = it.x - prevEnd;
        const space = it.spaceWidth || (it.fontSize || 10) * 0.25;
        if (gap > space * 0.3 && !/\s$/.test(text) && !/^\s/.test(it.text)) {
          // A gap wide enough to be a word break.
          text += gap > space * 2.5 ? '  ' : ' ';
        }
      }
      text += it.text;
      prevEnd = it.x + it.width;
    }
    return {
      y: round(line.y),
      x: round(line.items[0].x),
      text: text.replace(/\s+$/, ''),
    };
  }).filter((l) => l.text.length > 0);
}

function round(n) {
  return Math.round(n * 100) / 100;
}


// Spatial rendering: keep columns where they sit on the page by turning
// device-space x into character columns and vertical gaps into blank lines.
// Approximate by construction — fonts are proportional — but it preserves the
// side-by-side structure that assembleLines deliberately flattens.
export function layoutText(items, { charWidth = null } = {}) {
  if (items.length === 0) return '';

  // Estimate a character cell width from the median glyph advance.
  const advances = items
    .filter((it) => it.text.length > 0)
    .map((it) => it.width / it.text.length)
    .filter((w) => w > 0)
    .sort((a, b) => a - b);
  const cell = charWidth || (advances.length ? advances[Math.floor(advances.length / 2)] : 5) || 5;

  // Cluster into baseline rows (same tolerance as assembleLines).
  const sorted = [...items].sort((a, b) => (b.y - a.y) || (a.x - b.x));
  const rows = [];
  let current = null;
  for (const item of sorted) {
    const tol = Math.max(1, (item.fontSize || 10) * 0.4);
    if (current && Math.abs(item.y - current.y) <= tol) {
      current.items.push(item);
    } else {
      current = { y: item.y, fontSize: item.fontSize || 10, items: [item] };
      rows.push(current);
    }
  }

  const minX = Math.min(...items.map((it) => it.x));
  const out = [];
  let prevY = null;
  for (const row of rows) {
    // Blank lines for a vertical gap bigger than roughly one line height.
    if (prevY !== null) {
      const gap = prevY - row.y;
      const lh = row.fontSize * 1.2;
      const blanks = Math.min(5, Math.max(0, Math.round(gap / lh) - 1));
      for (let i = 0; i < blanks; i++) out.push('');
    }
    prevY = row.y;

    row.items.sort((a, b) => a.x - b.x);
    let line = '';
    for (const it of row.items) {
      const col = Math.max(0, Math.round((it.x - minX) / cell));
      if (col > line.length) line += ' '.repeat(col - line.length);
      // If the slot is occupied (overlap), fall back to a single space.
      line += (line.length > 0 && col <= line.length && !/\s$/.test(line) ? ' ' : '') + it.text;
    }
    out.push(line.replace(/\s+$/, ''));
  }
  return out.join('\n');
}
