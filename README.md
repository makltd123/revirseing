# revirseing

A from-scratch PDF toolkit. It reads a PDF the way the format actually works —
parsing the byte-level object syntax, the cross-reference data, the stream
filters, the content-stream operators and the font encodings by hand — then
reports the file's structure, extracts its text, fills form fields, and saves
the result.

No PDF library is used. The only runtime dependency is Node's built-in `zlib`
(for FlateDecode); the browser build swaps in [pako](https://github.com/nodeca/pako).

- **Read** — structure, metadata, text, forms and annotations
- **Write** — fill AcroForm fields, saved as a safe incremental update
- **Decrypt** — the standard security handler (RC4, AES-128, AES-256)
- **In the browser** — [Quiet Reader](browser/), a private reading-mode app
  that runs entirely client-side; your file never leaves the page

## Requirements

Node.js 22 or newer. No dependencies to install for the CLI.

## Install

```bash
git clone https://github.com/makltd123/revirseing
cd revirseing

# run directly
node bin/revirseing.js inspect file.pdf

# or install the command
npm install --global .
revirseing inspect file.pdf
```

## Commands

### `inspect` — the anatomy of a file

```
revirseing inspect file.pdf              # version, trailer, metadata, counts, pages
revirseing inspect file.pdf --objects    # also list every object
revirseing inspect file.pdf --object 4   # one object, with its stream decoded
```

Reports the PDF version, the trailer, `/Info` and XMP metadata, how the
cross-reference is stored, form-field and annotation counts, whether the file
is encrypted, and the page tree.

### `text` — extract text

```
revirseing text file.pdf                 # all text, page by page
revirseing text file.pdf --page 1,3-5    # selected pages
revirseing text file.pdf --layout        # keep columns and vertical spacing
revirseing text file.pdf --quiet         # text only, no headers
```

A content stream has no notion of lines or words, so reading order is
reconstructed from geometry: fragments are clustered by baseline, ordered left
to right, and a space is inserted where the horizontal gap is wide enough to be
one.

### `forms` — fields and annotations

```
revirseing forms file.pdf                # field names, values, link URIs, notes
```

### `fill` — fill a form and save

```
revirseing fill file.pdf --set name="Grace Hopper" --set subscribe=true --out out.pdf
```

Writes an **incremental update**: the original bytes are preserved untouched and
new object versions are appended, so the edit is reversible and never corrupts
the source.

### Shared options

- `--json` — machine-readable output (every command)
- `--password <pw>` — open an encrypted PDF (`inspect`, `text`, `forms`);
  the empty password is tried by default, which opens most owner-locked files

## Quiet Reader (browser)

`browser/` holds a reading-mode app that runs this engine entirely in the
browser: drop a PDF and read its text, with search, page navigation, adjustable
size and a light/dark theme. Nothing is uploaded — there is no server.

```bash
npm install            # dev deps: esbuild, pako, buffer
npm run build:browser  # -> browser/rea.bundle.js
```

Then open `browser/index.html`. See [browser/README.md](browser/README.md).

## What it understands

- **Object syntax** — all eight COS object kinds, indirect objects, references
- **Cross-reference** — classic `xref` tables and PDF 1.5 xref streams / object
  streams, with `/Prev` chains and hybrid files; recovery by scanning for
  `N G obj` headers when the xref is broken
- **Filters** — FlateDecode (with PNG/TIFF predictors), LZW, ASCIIHex, ASCII85,
  RunLength
- **Content streams** — the text-placing operators, the `cm`/`q`/`Q` graphics
  state, Form XObjects, and inline-image skipping
- **Fonts** — `/ToUnicode` CMaps, WinAnsi/MacRoman/Standard encodings,
  `/Differences`, and composite Type0 fonts with two-byte CIDs; glyph widths
  from `/Widths` or a CIDFont's `/W`
- **Metadata** — `/Info` and XMP (element and attribute forms)
- **Encryption** — the standard security handler (V1/V2 RC4, V4 RC4/AES-128,
  V5/R6 AES-256); it runs the documented key derivation with the user password
  and never breaks a cipher
- **Writing** — COS serialization and incremental updates, in both classic and
  xref-stream form

## Architecture

| File | Responsibility |
| --- | --- |
| `src/lexer.js` | Byte-level tokenizer |
| `src/parser.js` | Recursive-descent COS parser |
| `src/model.js` | The object model |
| `src/filters.js` | Stream filters and predictors |
| `src/document.js` | Cross-reference, resolution, decryption, page tree |
| `src/crypt.js` | Standard security handler |
| `src/encodings.js` | Base encodings and glyph-name mapping |
| `src/font.js` | Font decoding, CMap parsing, widths |
| `src/content.js` | Content-stream interpreter |
| `src/text.js` | Line assembly, layout mode |
| `src/metadata.js` | `/Info` and XMP |
| `src/annotations.js` | Form fields and annotations |
| `src/writer.js` | Serialization and incremental updates |
| `src/fill.js` | Form filling |
| `bin/revirseing.js` | CLI |
| `browser/` | Quiet Reader (browser build) |

## Tests

```bash
npm test
```

39 tests. Fixtures are generated by `test/make-fixtures.mjs` (hand-written PDFs
with fully known bytes) rather than checked in as opaque blobs; the encrypted
fixtures come from pypdf, an independent producer, so decryption is tested
against bytes this project did not itself encrypt.

### Checked against other implementations

Text extraction and form filling were cross-checked with **pypdf** on PDFs from
four unrelated producers — a 10-page themed document, LibreOffice 7, ReportLab,
and headless Chromium (Skia). The multiset of extracted words was identical in
every case, and after `fill` pypdf reads the new values with no recovery
warnings. The browser build is checked in headless Chromium.

## Limitations

- Encrypted documents are detected and decrypted but not re-encrypted, so `fill`
  refuses them.
- Reading order is geometric; rotated or overlapping text may not group the way
  a person reads it.
- CID fonts without `/ToUnicode` carry no recoverable Unicode.
- Image filters (DCT, JPX, CCITT, JBIG2) are reported but not decoded — there is
  no text in them.
- Filled values rely on the viewer honoring `/NeedAppearances`; appearance
  streams are not generated yet.

## License

[MIT](LICENSE). Built against the public ISO 32000 (PDF) specification, for
lawful analysis of PDFs you own or are authorized to examine.
