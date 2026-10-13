// Standard security handler (ISO 32000, §7.6).
//
// An encrypted PDF stores its real string and stream bytes under a cipher.
// The file key is derived from a password (the *user* password, empty in the
// common "owner-locked" case) together with values from the /Encrypt dict and
// the file /ID. This is exactly what every PDF reader does to display a
// protected document; it recovers no password and breaks no cipher — it runs
// the documented key derivation with the password it is given (empty by
// default) and fails cleanly when that password is not the right one.
//
// Supported: V1/V2 (RC4), V4 (RC4 or AESV2/AES-128 via crypt filters), and
// V5/R6 (AESV3/AES-256). RC4 is implemented here; AES uses node:crypto.

import crypto from 'node:crypto';
import {
  isDict, isName, isArray, dictGet,
} from './model.js';

// The 32-byte padding string from the spec (Algorithm 2, step a).
const PAD = Buffer.from([
  0x28, 0xBF, 0x4E, 0x5E, 0x4E, 0x75, 0x8A, 0x41, 0x64, 0x00, 0x4E, 0x56,
  0xFF, 0xFA, 0x01, 0x08, 0x2E, 0x2E, 0x00, 0xB6, 0xD0, 0x68, 0x3E, 0x80,
  0x2F, 0x0C, 0xA9, 0xFE, 0x64, 0x53, 0x69, 0x7A,
]);

export class StandardSecurity {
  constructor(doc, password = '') {
    this.doc = doc;
    this.ok = false;
    this.reason = null;
    try {
      this._init(password);
    } catch (e) {
      this.reason = e.message;
    }
  }

  _init(password) {
    const enc = this.doc.resolve(dictGet(this.doc.trailer, 'Encrypt'));
    if (!isDict(enc)) throw new Error('no /Encrypt dictionary');
    const filter = this.doc.resolve(dictGet(enc, 'Filter'));
    if (!isName(filter) || filter.name !== 'Standard') {
      throw new Error(`unsupported security handler /${filter && filter.name}`);
    }
    this.V = numOf(this.doc.resolve(dictGet(enc, 'V')), 0);
    this.R = numOf(this.doc.resolve(dictGet(enc, 'R')), 0);
    this.P = numOf(this.doc.resolve(dictGet(enc, 'P')), 0) | 0; // signed 32-bit
    this.length = numOf(this.doc.resolve(dictGet(enc, 'Length')), 40);
    this.O = strBytes(this.doc.resolve(dictGet(enc, 'O')));
    this.U = strBytes(this.doc.resolve(dictGet(enc, 'U')));
    this.encryptMetadata = this.doc.resolve(dictGet(enc, 'EncryptMetadata')) !== false;

    const idArr = this.doc.resolve(dictGet(this.doc.trailer, 'ID'));
    this.idBytes = isArray(idArr) && idArr.items[0]?.kind === 'string'
      ? Buffer.from(idArr.items[0].bytes)
      : Buffer.alloc(0);

    // Determine the cipher for strings and streams.
    this.strCipher = 'rc4';
    this.stmCipher = 'rc4';
    if (this.V >= 4) this._readCryptFilters(enc);

    if (this.V === 5 || this.R >= 5) {
      this._initAES256(enc, password);
    } else {
      this._initClassic(password);
    }
    this.ok = true;
  }

  _readCryptFilters(enc) {
    const cf = this.doc.resolve(dictGet(enc, 'CF'));
    const resolveFilter = (nameObj) => {
      const name = isName(nameObj) ? nameObj.name : 'Identity';
      if (name === 'Identity') return 'identity';
      const f = isDict(cf) ? this.doc.resolve(dictGet(cf, name)) : null;
      const cfm = f && this.doc.resolve(dictGet(f, 'CFM'));
      const m = isName(cfm) ? cfm.name : null;
      if (m === 'AESV2') return 'aes128';
      if (m === 'AESV3') return 'aes256';
      if (m === 'V2') return 'rc4';
      return 'rc4';
    };
    this.stmCipher = resolveFilter(this.doc.resolve(dictGet(enc, 'StmF')));
    this.strCipher = resolveFilter(this.doc.resolve(dictGet(enc, 'StrF')));
  }

  // --- Classic key derivation (R2..R4), Algorithm 2 -----------------------
  _initClassic(password) {
    const n = this.R === 2 ? 5 : Math.floor(this.length / 8);
    const pw = padPassword(password);
    const parts = [pw, this.O.subarray(0, 32), p32le(this.P), this.idBytes];
    if (this.R >= 4 && !this.encryptMetadata) parts.push(Buffer.from([0xff, 0xff, 0xff, 0xff]));
    let key = md5(Buffer.concat(parts));
    if (this.R >= 3) {
      for (let i = 0; i < 50; i++) key = md5(key.subarray(0, n));
    }
    this.fileKey = key.subarray(0, n);

    if (!this._verifyUserPassword()) {
      throw new Error('user password required (empty password did not match)');
    }
  }

  // Algorithm 4/5: recompute U and compare.
  _verifyUserPassword() {
    if (this.R === 2) {
      const u = rc4(this.fileKey, PAD);
      return constEq(u, this.U.subarray(0, 32));
    }
    // R3/R4
    const h = md5(Buffer.concat([PAD, this.idBytes]));
    let enc = rc4(this.fileKey, h);
    for (let i = 1; i <= 19; i++) {
      enc = rc4(xorKey(this.fileKey, i), enc);
    }
    return constEq(enc.subarray(0, 16), this.U.subarray(0, 16));
  }

  // --- AES-256 (R5/R6), Algorithm 2.A -------------------------------------
  _initAES256(enc, password) {
    const UE = strBytes(this.doc.resolve(dictGet(enc, 'UE')));
    const pw = Buffer.from(password, 'utf8').subarray(0, 127);
    const U = this.U;
    const validationSalt = U.subarray(32, 40);
    const keySalt = U.subarray(40, 48);

    const hash = this.R === 6
      ? hashR6(pw, validationSalt, Buffer.alloc(0))
      : sha256(Buffer.concat([pw, validationSalt]));
    if (!constEq(hash, U.subarray(0, 32))) {
      throw new Error('user password required (empty password did not match)');
    }
    const ikHash = this.R === 6
      ? hashR6(pw, keySalt, Buffer.alloc(0))
      : sha256(Buffer.concat([pw, keySalt]));
    // Decrypt UE with AES-256-CBC, no padding, zero IV, to get the file key.
    const dec = crypto.createDecipheriv('aes-256-cbc', ikHash, Buffer.alloc(16));
    dec.setAutoPadding(false);
    this.fileKey = Buffer.concat([dec.update(UE), dec.final()]);
    this.stmCipher = 'aes256';
    this.strCipher = 'aes256';
  }

  // --- Per-object decryption ----------------------------------------------
  objectKey(num, gen) {
    if (this.V === 5 || this.R >= 5) return this.fileKey; // AES-256 uses the file key directly
    const ext = Buffer.concat([
      this.fileKey,
      Buffer.from([num & 0xff, (num >> 8) & 0xff, (num >> 16) & 0xff, gen & 0xff, (gen >> 8) & 0xff]),
    ]);
    const salted = this.stmCipher === 'aes128' || this.strCipher === 'aes128'
      ? Buffer.concat([ext, Buffer.from('sAlT', 'latin1')])
      : ext;
    const n = Math.min(this.fileKey.length + 5, 16);
    return md5(salted).subarray(0, n);
  }

  decrypt(bytes, num, gen, which /* 'stm' | 'str' */) {
    const cipher = which === 'str' ? this.strCipher : this.stmCipher;
    if (cipher === 'identity') return bytes;
    const key = this.objectKey(num, gen);
    if (cipher === 'aes128' || cipher === 'aes256') {
      return aesCbcDecrypt(key, bytes);
    }
    return rc4(key, bytes);
  }
}

// --- RC4 (hand-rolled; OpenSSL 3 drops it from the default provider) -------
export function rc4(key, data) {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) & 0xff;
    [s[i], s[j]] = [s[j], s[i]];
  }
  const out = Buffer.alloc(data.length);
  let a = 0;
  let b = 0;
  for (let k = 0; k < data.length; k++) {
    a = (a + 1) & 0xff;
    b = (b + s[a]) & 0xff;
    [s[a], s[b]] = [s[b], s[a]];
    out[k] = data[k] ^ s[(s[a] + s[b]) & 0xff];
  }
  return out;
}

function aesCbcDecrypt(key, bytes) {
  if (bytes.length < 16) return Buffer.alloc(0);
  const iv = bytes.subarray(0, 16);
  const body = bytes.subarray(16);
  if (body.length === 0 || body.length % 16 !== 0) {
    // Not a clean block count; decrypt what we can without padding checks.
    const usable = body.subarray(0, body.length - (body.length % 16));
    const algo = key.length === 32 ? 'aes-256-cbc' : 'aes-128-cbc';
    const dec = crypto.createDecipheriv(algo, key, iv);
    dec.setAutoPadding(false);
    return Buffer.concat([dec.update(usable), dec.final()]);
  }
  const algo = key.length === 32 ? 'aes-256-cbc' : 'aes-128-cbc';
  const dec = crypto.createDecipheriv(algo, key, iv);
  dec.setAutoPadding(false);
  const out = Buffer.concat([dec.update(body), dec.final()]);
  // Strip PKCS#7 padding if it looks valid.
  const pad = out[out.length - 1];
  if (pad >= 1 && pad <= 16 && pad <= out.length) return out.subarray(0, out.length - pad);
  return out;
}

// --- The R6 hardened hash (ISO 32000-2, Algorithm 2.B) ---------------------
function hashR6(password, salt, udata) {
  let K = sha256(Buffer.concat([password, salt, udata]));
  for (let round = 0; ; round++) {
    const K1parts = [];
    const block = Buffer.concat([password, K, udata]);
    for (let i = 0; i < 64; i++) K1parts.push(block);
    const K1 = Buffer.concat(K1parts);
    const cipher = crypto.createCipheriv('aes-128-cbc', K.subarray(0, 16), K.subarray(16, 32));
    cipher.setAutoPadding(false);
    const E = Buffer.concat([cipher.update(K1), cipher.final()]);
    let mod = 0;
    for (let i = 0; i < 16; i++) mod += E[i];
    mod %= 3;
    K = mod === 0 ? sha256(E) : mod === 1 ? sha384(E) : sha512(E);
    if (round >= 63 && E[E.length - 1] <= round - 32) break;
  }
  return K.subarray(0, 32);
}

// --- helpers ---------------------------------------------------------------
function padPassword(pw) {
  const b = Buffer.from(pw, 'latin1');
  if (b.length >= 32) return b.subarray(0, 32);
  return Buffer.concat([b, PAD.subarray(0, 32 - b.length)]);
}
function xorKey(key, b) {
  const out = Buffer.from(key);
  for (let i = 0; i < out.length; i++) out[i] ^= b;
  return out;
}
function md5(b) { return crypto.createHash('md5').update(b).digest(); }
function sha256(b) { return crypto.createHash('sha256').update(b).digest(); }
function sha384(b) { return crypto.createHash('sha384').update(b).digest(); }
function sha512(b) { return crypto.createHash('sha512').update(b).digest(); }
function p32le(n) {
  const b = Buffer.alloc(4);
  b.writeInt32LE(n | 0, 0);
  return b;
}
function numOf(v, d) { return typeof v === 'number' ? v : d; }
function strBytes(v) { return v && v.kind === 'string' ? Buffer.from(v.bytes) : Buffer.alloc(0); }
function constEq(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
