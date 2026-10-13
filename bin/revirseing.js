#!/usr/bin/env node
// revirseing — a from-scratch PDF toolkit.
//
//   revirseing inspect <file.pdf> [--json] [--objects] [--object N]
//
// `inspect` reports a PDF's structure. More commands (text extraction) build
// on the same parser.

import { readFileSync } from 'node:fs';
import { inspect, inspectObject } from '../src/inspect.js';
import { extractText } from '../src/text.js';

function main(argv) {
  const args = argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printUsage();
    process.exit(cmd ? 0 : 1);
  }

  if (cmd === 'inspect') {
    return cmdInspect(args.slice(1));
  }

  if (cmd === 'text') {
    return cmdText(args.slice(1));
  }

  process.stderr.write(`Unknown command: ${cmd}\n`);
  printUsage();
  process.exit(1);
}

function cmdInspect(args) {
  const opts = parseOpts(args, {
    flags: ['json', 'objects'],
    values: ['object', 'password'],
  });
  const file = opts._[0];
  if (!file) {
    process.stderr.write('inspect: missing <file.pdf>\n');
    process.exit(1);
  }
  const buf = readFileSync(file);
  const password = opts.password || '';

  if (opts.object !== undefined) {
    const result = inspectObject(buf, parseInt(opts.object, 10), { password });
    if (opts.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } else {
      renderObject(result);
    }
    return;
  }

  const { report } = inspect(buf, { password });
  if (opts.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    renderReport(report, { objects: opts.objects });
  }
}

function cmdText(args) {
  const opts = parseOpts(args, {
    flags: ['json', 'quiet', 'layout'],
    values: ['page', 'password'],
  });
  const file = opts._[0];
  if (!file) {
    process.stderr.write('text: missing <file.pdf>\n');
    process.exit(1);
  }
  const buf = readFileSync(file);
  const pageNumbers = opts.page ? parsePageList(opts.page) : null;
  const result = extractText(buf, { pageNumbers, layout: opts.layout, password: opts.password || '' });

  if (opts.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return;
  }

  if (result.encrypted && !opts.quiet) {
    process.stderr.write('warning: document is encrypted; text may be unavailable\n');
  }
  for (const p of result.pages) {
    if (result.pages.length > 1 && !opts.quiet) {
      process.stdout.write(`\n=== page ${p.page} ===\n`);
    }
    process.stdout.write(p.text + '\n');
  }
  if (!opts.quiet && result.warnings.length) {
    for (const w of dedupe(result.warnings)) process.stderr.write(`warning: ${w}\n`);
  }
}

// "3" | "1,4,7" | "2-5" | "1,3-5"
function parsePageList(spec) {
  const out = new Set();
  for (const part of String(spec).split(',')) {
    const m = /^(\d+)\s*-\s*(\d+)$/.exec(part.trim());
    if (m) {
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.add(i);
    } else {
      const n = parseInt(part.trim(), 10);
      if (!Number.isNaN(n)) out.add(n);
    }
  }
  return [...out].sort((a, b) => a - b);
}

function dedupe(list) {
  const seen = new Set();
  const out = [];
  for (const x of list) {
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

function renderReport(r, { objects }) {
  const L = (s = '') => process.stdout.write(s + '\n');
  L('PDF structure');
  L('═'.repeat(60));
  L(`  version       ${r.version ?? '(unknown)'}`);
  L(`  file size     ${r.fileSize} bytes`);
  L(`  xref source   ${r.recovered ? 'RECOVERED by scan (xref broken/absent)' : 'cross-reference table/stream'}`);
  if (r.decryption) L(`  encryption    ${r.decryption}`);
  if (r.warnings.length) {
    L('  warnings:');
    for (const w of r.warnings) L(`    ! ${w}`);
  }
  L();
  L('Trailer');
  L('─'.repeat(60));
  if (r.trailer) {
    for (const [k, v] of Object.entries(r.trailer)) {
      if (k === 'encrypted') continue;
      L(`  /${k.padEnd(10)} ${v}`);
    }
    if (r.trailer.encrypted) L('  ⚠ document is ENCRYPTED (streams/strings may not decode)');
  } else {
    L('  (no trailer)');
  }
  L();
  if (r.metadata && (r.metadata.info || r.metadata.xmp)) {
    L('Metadata');
    L('─'.repeat(60));
    if (r.metadata.info) {
      for (const [k, v] of Object.entries(r.metadata.info)) {
        L(`  ${k.padEnd(14)} ${String(v)}`);
      }
    }
    if (r.metadata.xmp) {
      L(`  XMP            ${r.metadata.xmp.bytes} bytes${r.metadata.xmp.fields ? '' : ' (no mapped fields)'}`);
      if (r.metadata.xmp.fields) {
        for (const [k, v] of Object.entries(r.metadata.xmp.fields)) {
          L(`    ${k.padEnd(18)} ${v}`);
        }
      }
    }
    L();
  }
  L('Cross-reference');
  L('─'.repeat(60));
  L(`  objects       ${r.xref.total}`);
  L(`  direct        ${r.xref.direct}`);
  L(`  in objstm     ${r.xref.inObjectStreams}`);
  L();
  L('Pages');
  L('─'.repeat(60));
  if (Array.isArray(r.pages)) {
    L(`  page count    ${r.pages.length}`);
    for (const p of r.pages.slice(0, 20)) {
      L(`    page ${String(p.index).padStart(3)}  mediaBox ${p.mediaBox ?? '?'}  contents:${p.hasContents ? 'yes' : 'no'}`);
    }
    if (r.pages.length > 20) L(`    … (${r.pages.length - 20} more)`);
  } else {
    L(`  (page tree error: ${r.pages.error})`);
  }

  if (objects) {
    L();
    L('Objects');
    L('─'.repeat(60));
    for (const o of r.objects) {
      let line = `  ${String(o.num).padStart(5)}  ${o.type.padEnd(16)}`;
      if (o.rawBytes !== undefined) {
        line += ` raw:${o.rawBytes}`;
        if (o.filter) line += ` filter:${o.filter}`;
      } else if (o.detail) {
        line += ` ${o.detail}`;
      }
      L(line);
    }
  }
}

function renderObject(o) {
  const L = (s = '') => process.stdout.write(s + '\n');
  L(`Object ${o.num}  (${o.type})`);
  L('═'.repeat(60));
  L(o.rendered);
  if (o.filters) {
    L();
    L(`decoded: ${o.decodedBytes} bytes via [${o.filters.join(' → ')}]`);
  }
  if (o.decodeError) L(`decode error: ${o.decodeError}`);
  if (o.preview !== undefined) {
    L();
    L('preview');
    L('─'.repeat(60));
    L(o.preview);
  }
}

// Minimal option parser: --flag, --key value, positionals in _.
function parseOpts(args, { flags = [], values = [] }) {
  const out = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      if (flags.includes(key)) out[key] = true;
      else if (values.includes(key)) out[key] = args[++i];
      else out[key] = true;
    } else {
      out._.push(a);
    }
  }
  return out;
}

function printUsage() {
  process.stdout.write(`revirseing — a from-scratch PDF toolkit

Usage:
  revirseing inspect <file.pdf>            Summarize structure
  revirseing inspect <file.pdf> --objects  …and list every object
  revirseing inspect <file.pdf> --object N Show one object (decoded)
  revirseing inspect <file.pdf> --json     Machine-readable output

  revirseing text <file.pdf>               Extract text, page by page
  revirseing text <file.pdf> --page 2      One page (or 1,3-5)
  revirseing text <file.pdf> --layout      Keep page layout (columns, gaps)
  revirseing text <file.pdf> --quiet       Text only, no headers or warnings
  revirseing text <file.pdf> --json        Text with line positions
`);
}

main(process.argv);
