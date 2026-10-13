// Assemble positioned text items into readable lines.
//
// The interpreter gives us fragments with device-space origins. A PDF has no
// notion of lines or words in its content stream, so reading order has to be
// reconstructed from geometry: cluster fragments by baseline, order them left
// to right, and insert a space wherever the horizontal gap between two
// fragments is wide enough to be one.

import { PDFDocument } from './document.js';
import { TextExtractor } from './content.js';

export function extractText(buf, { pageNumbers = null } = {}) {
  const doc = PDFDocument.load(buf);
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
      text: lines.map((l) => l.text).join('\n'),
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
