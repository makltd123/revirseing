#!/usr/bin/env node
// revirseing — a from-scratch PDF toolkit.
//
//   revirseing inspect <file.pdf> [--json] [--objects] [--object N]
//
// `inspect` reports a PDF's structure. More commands (text extraction) build
// on the same parser.

import { readFileSync } from 'node:fs';
import { inspect, inspectObject } from '../src/inspect.js';

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

  process.stderr.write(`Unknown command: ${cmd}\n`);
  printUsage();
  process.exit(1);
}

function cmdInspect(args) {
  const opts = parseOpts(args, {
    flags: ['json', 'objects'],
    values: ['object'],
  });
  const file = opts._[0];
  if (!file) {
    process.stderr.write('inspect: missing <file.pdf>\n');
    process.exit(1);
  }
  const buf = readFileSync(file);

  if (opts.object !== undefined) {
    const result = inspectObject(buf, parseInt(opts.object, 10));
    if (opts.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } else {
      renderObject(result);
    }
    return;
  }

  const { report } = inspect(buf);
  if (opts.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    renderReport(report, { objects: opts.objects });
  }
}

function renderReport(r, { objects }) {
  const L = (s = '') => process.stdout.write(s + '\n');
  L('PDF structure');
  L('═'.repeat(60));
  L(`  version       ${r.version ?? '(unknown)'}`);
  L(`  file size     ${r.fileSize} bytes`);
  L(`  xref source   ${r.recovered ? 'RECOVERED by scan (xref broken/absent)' : 'cross-reference table/stream'}`);
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
`);
}

main(process.argv);
