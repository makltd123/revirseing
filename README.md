# revirseing

A from-scratch PDF toolkit. It reads a PDF the way the format actually works —
parsing the byte-level object syntax, the cross-reference data, and the stream
filters by hand — and reports the file's structure. No PDF library is used for
parsing; the only external code is Node's built-in `zlib` for FlateDecode.

This is a learning-grade reverse-engineering tool aimed at an **open standard**
(ISO 32000 / the PDF format). Understanding and reimplementing a documented
file format is a legitimate, clean exercise: there is no proprietary software
to decompile and no protection to defeat.

## Requirements

Node.js 22 or newer. No dependencies.

## Install / run

```bash
# run directly from a checkout
node bin/revirseing.js inspect path/to/file.pdf

# or install the CLI
npm install --global .
revirseing inspect path/to/file.pdf
```

## Commands

```
revirseing inspect <file.pdf>            Summarize structure
revirseing inspect <file.pdf> --objects  …and list every object
revirseing inspect <file.pdf> --object N Show one object, decoding its stream
revirseing inspect <file.pdf> --json     Machine-readable output
```

### Example

```
$ revirseing inspect sample.pdf
PDF structure
════════════════════════════════════════════════════════════
  version       1.5
  file size     587 bytes
  xref source   cross-reference table/stream

Trailer
────────────────────────────────────────────────────────────
  /Root       1 0 R
  /Size       8

Cross-reference
────────────────────────────────────────────────────────────
  objects       7
  direct        3
  in objstm     4

Pages
────────────────────────────────────────────────────────────
  page count    1
    page   0  mediaBox [0 0 612 792]  contents:yes
```

## What it understands

- **Object syntax** — the 8 COS object kinds: null, boolean, number, string
  (literal `(...)` with escapes, and hex `<...>`), name, array, dictionary, and
  stream. Indirect objects (`N G obj … endobj`) and references (`N G R`).
- **Cross-reference** — both the classic `xref` table + `trailer`, and the
  **xref streams** and **object streams** introduced in PDF 1.5, including
  `/Prev` chains and hybrid `/XRefStm` files.
- **Stream filters** — `FlateDecode` (with PNG/TIFF predictors), `LZWDecode`,
  `ASCIIHexDecode`, `ASCII85Decode`, `RunLengthDecode`.
- **Recovery** — if the cross-reference data is broken or missing, it scans the
  file for `N G obj` headers and rebuilds the object map, so the inspector still
  works on damaged files.
- **Page tree** — walks `/Pages` into a flat list of pages with inherited
  attributes.

## Architecture

| File | Responsibility |
| --- | --- |
| `src/lexer.js` | Byte-level tokenizer for the PDF object syntax |
| `src/parser.js` | Recursive-descent parser assembling COS objects |
| `src/model.js` | The COS object model and small helpers |
| `src/filters.js` | Stream decode filters and predictors |
| `src/document.js` | Cross-reference loading, resolution, page tree, recovery |
| `src/inspect.js` | The `inspect` command |
| `src/format.js` | Rendering objects for display |
| `bin/revirseing.js` | CLI entry point |

## Tests

```bash
npm test
```

Fixtures are generated (not checked in as opaque blobs) by
`test/make-fixtures.mjs`, which writes four PDFs by hand — a minimal classic
file, a FlateDecode file, a PDF 1.5 file using an xref stream and an object
stream, and a file with a deliberately broken `startxref` — so the tests
exercise the reader end-to-end against known bytes.

## Roadmap

- `text` command: extract page text from content streams (`BT`/`Tj`/`TJ`/`ET`),
  resolving font encodings.
- Encrypted-document handling (RC4 / AES) for the standard security handler.
- `/Metadata` (XMP) and `/Info` dictionary reporting.

## License

[MIT](LICENSE). Node's `zlib` is used under its own license.
