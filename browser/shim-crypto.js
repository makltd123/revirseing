// Browser stub for node:crypto. The reading-mode app does not decrypt; an
// encrypted document is detected and reported instead. These throw so the
// security handler reports "unavailable" rather than silently misbehaving.
function unavailable() {
  throw new Error('crypto unavailable in the browser reader');
}
export function createHash() { unavailable(); }
export function createDecipheriv() { unavailable(); }
export function createCipheriv() { unavailable(); }
export default { createHash, createDecipheriv, createCipheriv };
