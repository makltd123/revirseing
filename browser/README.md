# Quiet Reader — browser build

A reading-mode PDF app that runs the `revirseing` engine entirely in the
browser. Drop a PDF and read its extracted text, with search and copy. The
file never leaves the page — there is no server and no upload.

## Files

| File | Role |
| --- | --- |
| `index.html` | The reading-mode app (UI, search, theming) |
| `entry.js` | Bundle entry — exposes the engine as the global `REA` |
| `shim-zlib.js` | `node:zlib` → `pako` (FlateDecode in the browser) |
| `shim-crypto.js` | `node:crypto` stub (the reader does not decrypt) |
| `buffer-inject.js` | Provides `Buffer` to the bundled engine |
| `rea.bundle.js` | The built bundle (engine + pako + Buffer polyfill) |

## Build

```bash
npm install            # dev deps: esbuild, pako, buffer
npm run build:browser  # -> browser/rea.bundle.js
```

The same `src/` engine powers the CLI and this bundle; only the zlib and
crypto bindings differ. The bundle is checked against the Node build and in a
headless browser.
