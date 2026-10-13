// Browser shim for node:zlib — only the inflate paths the PDF filters use,
// backed by pako. Returns Buffers so the rest of the engine is unchanged.
import * as pako from 'pako';

export function inflateSync(buf) {
  return Buffer.from(pako.inflate(toU8(buf)));
}
export function inflateRawSync(buf) {
  return Buffer.from(pako.inflateRaw(toU8(buf)));
}
export function deflateSync(buf) {
  return Buffer.from(pako.deflate(toU8(buf)));
}
function toU8(buf) {
  return buf instanceof Uint8Array ? buf : new Uint8Array(buf);
}
export default { inflateSync, inflateRawSync, deflateSync };
