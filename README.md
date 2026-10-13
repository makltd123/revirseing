# revirseing

A from-scratch PDF toolkit. It reads a PDF the way the format actually works —
parsing the byte-level object syntax, the cross-reference data, the stream
filters, the content-stream operators and the font encodings by hand — then
reports the file's structure, extracts its text, and can fill form fields and
save the result. No PDF library is used; the only external code is Node's
built-in `zlib` for FlateDecode.

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

revirseing text <file.pdf>               Extract text, page by page
revirseing text <file.pdf> --page 2      One page (also 1,3-5)
revirseing text <file.pdf> --quiet       Text only, no headers or warnings
revirseing text <file.pdf> --json        Text with per-line positions
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

### Text extraction

```
$ revirseing text report.pdf --page 1
Chromium Skia Producer
Body text with bold, italic and monospace runs inline.
Column A  Column B
Alpha content here.  Beta content here.
Key  Value
Ratio  3.14159
```

A content stream has no notion of lines or words, so reading order is
reconstructed from geometry: fragments are clustered by baseline, ordered left
to right, and a space is inserted where the horizontal gap is wide enough to be
one. A small `TJ` kerning nudge therefore stays inside a word, while a real gap
becomes a space.

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
- **Metadata** — the `/Info` dictionary and the `/Metadata` XMP stream (element
  and attribute forms, nested Dublin Core), with PDF text strings decoded from
  UTF-16BE or PDFDocEncoding and dates normalized.
- **Forms and annotations** — the AcroForm field tree (text, choice, button and
  signature fields, with values, defaults, choice options and flags such as
  required/readonly/multiline) and page annotations (link URIs, text notes).
- **Encryption** — the standard security handler: V1/V2 (RC4), V4 (RC4 or
  AES-128 via crypt filters) and V5/R6 (AES-256). It runs the documented key
  derivation with the user password (empty by default, or `--password`), so a
  document that opens without a password in any reader opens here too, and
  reports `LOCKED` when the password is needed and not supplied. It recovers no
  password and breaks no cipher.
- **Page tree** — walks `/Pages` into a flat list of pages with inherited
  attributes.
- **Content streams** — the operators that place text: `BT`/`ET`, `Tf`, `Td`,
  `TD`, `Tm`, `T*`, `TL`, `Tc`, `Tw`, `Tz`, `Ts`, `Tr`, `Tj`, `TJ`, `'`, `"`,
  the `cm` / `q` / `Q` graphics state, recursion into Form XObjects via `Do`,
  and skipping inline-image payloads (`BI`…`ID`…`EI`).
- **Fonts and encodings** — `/ToUnicode` CMaps (`bfchar` and `bfrange`), the
  WinAnsi, MacRoman and Standard base encodings, `/Encoding` `/Differences`
  with an Adobe Glyph List subset plus the algorithmic `uniXXXX` forms, and
  composite Type0 fonts with two-byte CID codes. Glyph widths come from
  `/Widths` or a CIDFont's `/W` and `/DW`, with a fallback for the standard 14
  fonts that ship no widths.

## Architecture

| File | Responsibility |
| --- | --- |
| `src/lexer.js` | Byte-level tokenizer for the PDF object syntax |
| `src/parser.js` | Recursive-descent parser assembling COS objects |
| `src/model.js` | The COS object model and small helpers |
| `src/filters.js` | Stream decode filters and predictors |
| `src/content.js` | Content-stream interpreter and text positioning |
| `src/font.js` | Font decoding, CMap parsing, glyph widths |
| `src/encodings.js` | Base encodings and glyph-name to Unicode mapping |
| `src/text.js` | Line assembly, `--layout` mode, and the `text` command |
| `src/metadata.js` | `/Info` and XMP metadata extraction |
| `src/crypt.js` | Standard security handler (RC4 / AES key derivation) |
| `src/annotations.js` | AcroForm fields and page annotations |
| `src/writer.js` | COS serialization and incremental-update writing |
| `src/fill.js` | Form-field filling |
| `src/document.js` | Cross-reference loading, resolution, page tree, recovery |
| `src/inspect.js` | The `inspect` command |
| `src/format.js` | Rendering objects for display |
| `bin/revirseing.js` | CLI entry point |

## Tests

```bash
npm test
```

Fixtures are generated (not checked in as opaque blobs) by
`test/make-fixtures.mjs`, which writes six PDFs by hand so the tests exercise
the reader end-to-end against known bytes:

| Fixture | What it covers |
| --- | --- |
| `simple.pdf` | minimal classic xref table and trailer |
| `flate.pdf` | a FlateDecode content stream |
| `xrefstream.pdf` | PDF 1.5 xref stream with objects inside an object stream |
| `broken-xref.pdf` | a deliberately broken `startxref`, forcing recovery |
| `encodings.pdf` | WinAnsi high bytes, `/Differences`, and a Type0 font whose two-byte codes resolve through a `/ToUnicode` CMap |
| `layout.pdf` | `TJ` kerning vs. word gaps, `Tm`-placed columns, `TL`/`T*` leading, a Form XObject, and a page inheriting `/Resources` |

A seventh fixture, `forms.pdf`, is hand-built with an AcroForm (a text field
and a choice field), link and text-note annotations, and an XMP metadata
stream in attribute form.

Three encrypted fixtures (`enc-rc4-empty.pdf`, `enc-aes128-empty.pdf`,
`enc-aes256-pw.pdf`) are produced by `test/make-encrypted-fixtures.py` using
**pypdf** — an independent producer — so decryption is checked against bytes
this project did not itself encrypt, not its own round-trip. They are committed
because regenerating them needs pypdf.

### Checked against other implementations

Text extraction was also run against PDFs from four unrelated producers — a
10-page themed document, LibreOffice 7 (PDF 1.7, CID fonts), ReportLab (PDF
1.3, standard-14 fonts with no `/Widths`), and headless Chromium (Skia) — and
compared with `pypdf`. The multiset of extracted words was **identical in every
case** (631, 47, 34 and 34 words respectively).

Decryption was validated the same way: the 10-page document was encrypted with
AES-256 (empty user password) by pypdf, and `revirseing` recovered all 631
words identically. Form-field extraction was cross-checked against pypdf's
`get_fields()` on a ReportLab-produced form — the field names and values match. RC4-128, AES-128 and AES-256 (with a supplied password) all
round-trip; a wrong password is rejected rather than producing garbage.

The one intended difference is reading order in multi-column blocks: `pypdf`
follows content-stream order, while `revirseing` groups fragments by baseline,
so text sharing a baseline shares a line. `--layout` keeps the spatial
arrangement instead: x-positions become character columns and vertical gaps
become blank lines, so side-by-side columns stay side by side.

## Limitations

- **Encryption** covers the standard security handler only; public-key
  (`/Filter /Adobe.PubSec`) and other custom handlers are reported but not
  opened.
- **Reading order** is geometric. Rotated text, and text set along a curve or
  in overlapping layers, will not group the way a human reads it.
- **CID fonts with no `/ToUnicode`** carry no recoverable Unicode; those codes
  are dropped rather than guessed.
- Image filters (`DCTDecode`, `JPXDecode`, `CCITTFaxDecode`, `JBIG2Decode`)
  are reported but not decoded — there is no text in them.
- Filled form values rely on the viewer honoring `/NeedAppearances`; `fill`
  does not yet generate appearance streams itself, and it refuses to edit an
  encrypted document (it does not re-encrypt).

## Roadmap

- Appearance-stream generation for filled fields (so `/NeedAppearances` is not
  required for the values to show).
- Public-key security handler (`/Adobe.PubSec`).
- Re-encrypting on save, so encrypted documents can be edited too.

## Browser reading mode

`browser/` contains **Quiet Reader**, a reading-mode app that runs this engine
entirely in the browser: drop a PDF and read its extracted text, with search
and copy, with nothing uploaded. The same `src/` code is bundled for the
browser with `node:zlib` swapped for `pako`; see [browser/README.md](browser/README.md)
to build it. Open `browser/index.html` after building, or serve the folder.

## License

[MIT](LICENSE). Node's `zlib` is used under its own license.
