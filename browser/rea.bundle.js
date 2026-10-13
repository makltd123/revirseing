var REA = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err2) => function __init() {
    if (err2) throw err2[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err2 = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/base64-js/index.js"(exports) {
      "use strict";
      init_buffer_inject();
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1) validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num2) {
        return lookup[num2 >> 18 & 63] + lookup[num2 >> 12 & 63] + lookup[num2 >> 6 & 63] + lookup[num2 & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output.push(tripletToBase64(tmp));
        }
        return output.join("");
      }
      function fromByteArray(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/ieee754/index.js"(exports) {
      init_buffer_inject();
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // node_modules/buffer/index.js
  var require_buffer = __commonJS({
    "node_modules/buffer/index.js"(exports) {
      "use strict";
      init_buffer_inject();
      var base64 = require_base64_js();
      var ieee754 = require_ieee754();
      var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer3;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
        console.error(
          "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
        );
      }
      function typedArraySupport() {
        try {
          const arr = new Uint8Array(1);
          const proto = { foo: function() {
            return 42;
          } };
          Object.setPrototypeOf(proto, Uint8Array.prototype);
          Object.setPrototypeOf(arr, proto);
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer3.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer3.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function Buffer3(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }
      Buffer3.poolSize = 8192;
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value);
        }
        if (value == null) {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
          );
        }
        if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        }
        const valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer3.from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
          return Buffer3.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      Buffer3.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer3, Uint8Array);
      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
      }
      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== void 0) {
          return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }
      Buffer3.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer3.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer3.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        const length = byteLength(string, encoding) | 0;
        let buf = createBuffer(length);
        const actual = buf.write(string, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function fromArrayLike(array) {
        const length = array.length < 0 ? 0 : checked(array.length) | 0;
        const buf = createBuffer(length);
        for (let i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
        }
        return buf;
      }
      function fromArrayView(arrayView) {
        if (isInstance(arrayView, Uint8Array)) {
          const copy = new Uint8Array(arrayView);
          return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
        }
        return fromArrayLike(arrayView);
      }
      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds');
        }
        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds');
        }
        let buf;
        if (byteOffset === void 0 && length === void 0) {
          buf = new Uint8Array(array);
        } else if (length === void 0) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer3.isBuffer(obj)) {
          const len = checked(obj.length) | 0;
          const buf = createBuffer(len);
          if (buf.length === 0) {
            return buf;
          }
          obj.copy(buf, 0, 0, len);
          return buf;
        }
        if (obj.length !== void 0) {
          if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
            return createBuffer(0);
          }
          return fromArrayLike(obj);
        }
        if (obj.type === "Buffer" && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data);
        }
      }
      function checked(length) {
        if (length >= K_MAX_LENGTH) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
        }
        return length | 0;
      }
      function SlowBuffer(length) {
        if (+length != length) {
          length = 0;
        }
        return Buffer3.alloc(+length);
      }
      Buffer3.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer3.prototype;
      };
      Buffer3.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer3.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer3.from(b, b.offset, b.byteLength);
        if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        let x = a.length;
        let y = b.length;
        for (let i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer3.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer3.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer3.alloc(0);
        }
        let i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        const buffer = Buffer3.allocUnsafe(length);
        let pos = 0;
        for (i = 0; i < list.length; ++i) {
          let buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf);
              buf.copy(buffer, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              );
            }
          } else if (!Buffer3.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer, pos);
          }
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer3.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        const len = string.length;
        const mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0) return 0;
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
              return utf8ToBytes(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        let loweredCase = false;
        if (start === void 0 || start < 0) {
          start = 0;
        }
        if (start > this.length) {
          return "";
        }
        if (end === void 0 || end > this.length) {
          end = this.length;
        }
        if (end <= 0) {
          return "";
        }
        end >>>= 0;
        start >>>= 0;
        if (end <= start) {
          return "";
        }
        if (!encoding) encoding = "utf8";
        while (true) {
          switch (encoding) {
            case "hex":
              return hexSlice(this, start, end);
            case "utf8":
            case "utf-8":
              return utf8Slice(this, start, end);
            case "ascii":
              return asciiSlice(this, start, end);
            case "latin1":
            case "binary":
              return latin1Slice(this, start, end);
            case "base64":
              return base64Slice(this, start, end);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.prototype._isBuffer = true;
      function swap(b, n, m) {
        const i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer3.prototype.swap16 = function swap16() {
        const len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (let i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer3.prototype.swap32 = function swap32() {
        const len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (let i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer3.prototype.swap64 = function swap64() {
        const len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (let i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer3.prototype.toString = function toString2() {
        const length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
      Buffer3.prototype.equals = function equals(b) {
        if (!Buffer3.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer3.compare(this, b) === 0;
      };
      Buffer3.prototype.inspect = function inspect() {
        let str = "";
        const max = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max) str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
      }
      Buffer3.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer3.from(target, target.offset, target.byteLength);
        }
        if (!Buffer3.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
          );
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        let x = thisEnd - thisStart;
        let y = end - start;
        const len = Math.min(x, y);
        const thisCopy = this.slice(thisStart, thisEnd);
        const targetCopy = target.slice(start, end);
        for (let i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0) return -1;
        if (typeof byteOffset === "string") {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 2147483647) {
          byteOffset = 2147483647;
        } else if (byteOffset < -2147483648) {
          byteOffset = -2147483648;
        }
        byteOffset = +byteOffset;
        if (numberIsNaN(byteOffset)) {
          byteOffset = dir ? 0 : buffer.length - 1;
        }
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;
          else return -1;
        }
        if (typeof val === "string") {
          val = Buffer3.from(val, encoding);
        }
        if (Buffer3.isBuffer(val)) {
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === "number") {
          val = val & 255;
          if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        let indexSize = 1;
        let arrLength = arr.length;
        let valLength = val.length;
        if (encoding !== void 0) {
          encoding = String(encoding).toLowerCase();
          if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i2) {
          if (indexSize === 1) {
            return buf[i2];
          } else {
            return buf.readUInt16BE(i2 * indexSize);
          }
        }
        let i;
        if (dir) {
          let foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            let found = true;
            for (let j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer3.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer3.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        const remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        const strLen = string.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        let i;
        for (i = 0; i < length; ++i) {
          const parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer3.prototype.write = function write(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === void 0) encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        const remaining = this.length - offset;
        if (length === void 0 || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding) encoding = "utf8";
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer3.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        const res = [];
        let i = start;
        while (i < end) {
          const firstByte = buf[i];
          let codePoint = null;
          let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                  if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }
          if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        const len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints);
        }
        let res = "";
        let i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        const len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        let out = "";
        for (let i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        const bytes = buf.slice(start, end);
        let res = "";
        for (let i = 0; i < bytes.length - 1; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }
      Buffer3.prototype.slice = function slice(start, end) {
        const len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start) end = start;
        const newBuf = this.subarray(start, end);
        Object.setPrototypeOf(newBuf, Buffer3.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul2 = 1;
        let i = 0;
        while (++i < byteLength2 && (mul2 *= 256)) {
          val += this[offset + i] * mul2;
        }
        return val;
      };
      Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        let val = this[offset + --byteLength2];
        let mul2 = 1;
        while (byteLength2 > 0 && (mul2 *= 256)) {
          val += this[offset + --byteLength2] * mul2;
        }
        return val;
      };
      Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
        const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
        return BigInt(lo) + (BigInt(hi) << BigInt(32));
      });
      Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
        return (BigInt(hi) << BigInt(32)) + BigInt(lo);
      });
      Buffer3.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul2 = 1;
        let i = 0;
        while (++i < byteLength2 && (mul2 *= 256)) {
          val += this[offset + i] * mul2;
        }
        mul2 *= 128;
        if (val >= mul2) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let i = byteLength2;
        let mul2 = 1;
        let val = this[offset + --i];
        while (i > 0 && (mul2 *= 256)) {
          val += this[offset + --i] * mul2;
        }
        mul2 *= 128;
        if (val >= mul2) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer3.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
        return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
      });
      Buffer3.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = (first << 24) + // Overflow
        this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
      });
      Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer3.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let mul2 = 1;
        let i = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul2 *= 256)) {
          this[offset + i] = value / mul2 & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let i = byteLength2 - 1;
        let mul2 = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul2 *= 256)) {
          this[offset + i] = value / mul2 & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      function wrtBigUInt64LE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        return offset;
      }
      function wrtBigUInt64BE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset + 7] = lo;
        lo = lo >> 8;
        buf[offset + 6] = lo;
        lo = lo >> 8;
        buf[offset + 5] = lo;
        lo = lo >> 8;
        buf[offset + 4] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset + 3] = hi;
        hi = hi >> 8;
        buf[offset + 2] = hi;
        hi = hi >> 8;
        buf[offset + 1] = hi;
        hi = hi >> 8;
        buf[offset] = hi;
        return offset + 8;
      }
      Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = 0;
        let mul2 = 1;
        let sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul2 *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul2 >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = byteLength2 - 1;
        let mul2 = 1;
        let sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul2 *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul2 >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };
      Buffer3.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer3.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer3.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer3.isBuffer(target)) throw new TypeError("argument should be a Buffer");
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        const len = end - start;
        if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
          this.copyWithin(targetStart, start, end);
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          );
        }
        return len;
      };
      Buffer3.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") {
              val = code;
            }
          }
        } else if (typeof val === "number") {
          val = val & 255;
        } else if (typeof val === "boolean") {
          val = Number(val);
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val) val = 0;
        let i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
          const len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      var errors = {};
      function E(sym, getMessage, Base) {
        errors[sym] = class NodeError extends Base {
          constructor() {
            super();
            Object.defineProperty(this, "message", {
              value: getMessage.apply(this, arguments),
              writable: true,
              configurable: true
            });
            this.name = `${this.name} [${sym}]`;
            this.stack;
            delete this.name;
          }
          get code() {
            return sym;
          }
          set code(value) {
            Object.defineProperty(this, "code", {
              configurable: true,
              enumerable: true,
              value,
              writable: true
            });
          }
          toString() {
            return `${this.name} [${sym}]: ${this.message}`;
          }
        };
      }
      E(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function(name) {
          if (name) {
            return `${name} is outside of buffer bounds`;
          }
          return "Attempt to access memory outside buffer bounds";
        },
        RangeError
      );
      E(
        "ERR_INVALID_ARG_TYPE",
        function(name, actual) {
          return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
        },
        TypeError
      );
      E(
        "ERR_OUT_OF_RANGE",
        function(str, range, input) {
          let msg = `The value of "${str}" is out of range.`;
          let received = input;
          if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
            received = addNumericalSeparator(String(input));
          } else if (typeof input === "bigint") {
            received = String(input);
            if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
              received = addNumericalSeparator(received);
            }
            received += "n";
          }
          msg += ` It must be ${range}. Received ${received}`;
          return msg;
        },
        RangeError
      );
      function addNumericalSeparator(val) {
        let res = "";
        let i = val.length;
        const start = val[0] === "-" ? 1 : 0;
        for (; i >= start + 4; i -= 3) {
          res = `_${val.slice(i - 3, i)}${res}`;
        }
        return `${val.slice(0, i)}${res}`;
      }
      function checkBounds(buf, offset, byteLength2) {
        validateNumber(offset, "offset");
        if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
          boundsError(offset, buf.length - (byteLength2 + 1));
        }
      }
      function checkIntBI(value, min, max, buf, offset, byteLength2) {
        if (value > max || value < min) {
          const n = typeof min === "bigint" ? "n" : "";
          let range;
          if (byteLength2 > 3) {
            if (min === 0 || min === BigInt(0)) {
              range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
              range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
            }
          } else {
            range = `>= ${min}${n} and <= ${max}${n}`;
          }
          throw new errors.ERR_OUT_OF_RANGE("value", range, value);
        }
        checkBounds(buf, offset, byteLength2);
      }
      function validateNumber(value, name) {
        if (typeof value !== "number") {
          throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
        }
      }
      function boundsError(value, length, type) {
        if (Math.floor(value) !== value) {
          validateNumber(value, type);
          throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
        }
        if (length < 0) {
          throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
        }
        throw new errors.ERR_OUT_OF_RANGE(
          type || "offset",
          `>= ${type ? 1 : 0} and <= ${length}`,
          value
        );
      }
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = str.split("=")[0];
        str = str.trim().replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) {
          str = str + "=";
        }
        return str;
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        let codePoint;
        const length = string.length;
        let leadSurrogate = null;
        const bytes = [];
        for (let i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(
              codePoint >> 6 | 192,
              codePoint & 63 | 128
            );
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else {
            throw new Error("Invalid code point");
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        let c, hi, lo;
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        let i;
        for (i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      var hexSliceLookupTable = (function() {
        const alphabet = "0123456789abcdef";
        const table = new Array(256);
        for (let i = 0; i < 16; ++i) {
          const i16 = i * 16;
          for (let j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet[i] + alphabet[j];
          }
        }
        return table;
      })();
      function defineBigIntMethod(fn) {
        return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
      }
      function BufferBigIntNotDefined() {
        throw new Error("BigInt not supported");
      }
    }
  });

  // browser/buffer-inject.js
  var import_buffer;
  var init_buffer_inject = __esm({
    "browser/buffer-inject.js"() {
      import_buffer = __toESM(require_buffer(), 1);
    }
  });

  // browser/entry.js
  var entry_exports = {};
  __export(entry_exports, {
    PDFDocument: () => PDFDocument,
    extractText: () => extractText,
    readDocument: () => readDocument,
    readMetadata: () => readMetadata
  });
  init_buffer_inject();

  // src/text.js
  init_buffer_inject();

  // src/document.js
  init_buffer_inject();

  // src/parser.js
  init_buffer_inject();

  // src/lexer.js
  init_buffer_inject();
  var WS = /* @__PURE__ */ new Set([0, 9, 10, 12, 13, 32]);
  var DELIM = /* @__PURE__ */ new Set([
    40,
    41,
    // ( )
    60,
    62,
    // < >
    91,
    93,
    // [ ]
    123,
    125,
    // { }
    47,
    37
    // / %
  ]);
  function isWhitespace(b) {
    return WS.has(b);
  }
  function isDelimiter(b) {
    return DELIM.has(b);
  }
  function isRegular(b) {
    return b !== void 0 && !isWhitespace(b) && !isDelimiter(b);
  }
  var TokenType = {
    NUMBER: "number",
    STRING: "string",
    // literal or hex, value is a Buffer
    NAME: "name",
    DICT_OPEN: "dict_open",
    // <<
    DICT_CLOSE: "dict_close",
    // >>
    ARRAY_OPEN: "array_open",
    // [
    ARRAY_CLOSE: "array_close",
    // ]
    KEYWORD: "keyword",
    // obj endobj stream R true false null xref trailer ...
    EOF: "eof"
  };
  var Lexer = class {
    constructor(buf, pos = 0) {
      this.buf = buf;
      this.pos = pos;
    }
    _skipWhitespaceAndComments() {
      const { buf } = this;
      while (this.pos < buf.length) {
        const b = buf[this.pos];
        if (isWhitespace(b)) {
          this.pos++;
        } else if (b === 37) {
          while (this.pos < buf.length && buf[this.pos] !== 10 && buf[this.pos] !== 13) {
            this.pos++;
          }
        } else {
          break;
        }
      }
    }
    next() {
      this._skipWhitespaceAndComments();
      const { buf } = this;
      if (this.pos >= buf.length) return { type: TokenType.EOF, pos: this.pos };
      const start = this.pos;
      const b = buf[this.pos];
      if (b === 60) {
        if (buf[this.pos + 1] === 60) {
          this.pos += 2;
          return { type: TokenType.DICT_OPEN, pos: start };
        }
        return this._readHexString(start);
      }
      if (b === 62) {
        if (buf[this.pos + 1] === 62) {
          this.pos += 2;
          return { type: TokenType.DICT_CLOSE, pos: start };
        }
        throw new SyntaxError(`Unexpected '>' at offset ${start}`);
      }
      if (b === 91) {
        this.pos++;
        return { type: TokenType.ARRAY_OPEN, pos: start };
      }
      if (b === 93) {
        this.pos++;
        return { type: TokenType.ARRAY_CLOSE, pos: start };
      }
      if (b === 40) return this._readLiteralString(start);
      if (b === 47) return this._readName(start);
      if (b === 43 || b === 45 || b === 46 || b >= 48 && b <= 57) {
        return this._readNumber(start);
      }
      return this._readKeyword(start);
    }
    _readNumber(start) {
      const { buf } = this;
      let s = this.pos;
      if (buf[this.pos] === 43 || buf[this.pos] === 45) this.pos++;
      let sawDigit = false;
      let sawDot = false;
      while (this.pos < buf.length) {
        const b = buf[this.pos];
        if (b >= 48 && b <= 57) {
          sawDigit = true;
          this.pos++;
        } else if (b === 46 && !sawDot) {
          sawDot = true;
          this.pos++;
        } else {
          break;
        }
      }
      const text = buf.toString("latin1", s, this.pos);
      if (!sawDigit) {
        this.pos = start;
        return this._readKeyword(start);
      }
      return { type: TokenType.NUMBER, value: Number(text), pos: start };
    }
    _readName(start) {
      const { buf } = this;
      this.pos++;
      const bytes = [];
      while (this.pos < buf.length && isRegular(buf[this.pos])) {
        let b = buf[this.pos];
        if (b === 35 && this.pos + 2 < buf.length) {
          const hex = buf.toString("latin1", this.pos + 1, this.pos + 3);
          const code = parseInt(hex, 16);
          if (!Number.isNaN(code)) {
            bytes.push(code);
            this.pos += 3;
            continue;
          }
        }
        bytes.push(b);
        this.pos++;
      }
      return { type: TokenType.NAME, value: import_buffer.Buffer.from(bytes).toString("latin1"), pos: start };
    }
    _readLiteralString(start) {
      const { buf } = this;
      this.pos++;
      const out = [];
      let depth = 1;
      while (this.pos < buf.length) {
        let b = buf[this.pos++];
        if (b === 92) {
          const e = buf[this.pos++];
          switch (e) {
            case 110:
              out.push(10);
              break;
            // \n
            case 114:
              out.push(13);
              break;
            // \r
            case 116:
              out.push(9);
              break;
            // \t
            case 98:
              out.push(8);
              break;
            // \b
            case 102:
              out.push(12);
              break;
            // \f
            case 40:
              out.push(40);
              break;
            // \(
            case 41:
              out.push(41);
              break;
            // \)
            case 92:
              out.push(92);
              break;
            // backslash
            case 13:
              if (buf[this.pos] === 10) this.pos++;
              break;
            case 10:
              break;
            default:
              if (e >= 48 && e <= 55) {
                let oct = e - 48;
                for (let i = 0; i < 2; i++) {
                  const d = buf[this.pos];
                  if (d >= 48 && d <= 55) {
                    oct = oct * 8 + (d - 48);
                    this.pos++;
                  } else break;
                }
                out.push(oct & 255);
              } else {
                out.push(e);
              }
          }
        } else if (b === 40) {
          depth++;
          out.push(b);
        } else if (b === 41) {
          depth--;
          if (depth === 0) break;
          out.push(b);
        } else {
          out.push(b);
        }
      }
      return { type: TokenType.STRING, value: import_buffer.Buffer.from(out), hex: false, pos: start };
    }
    _readHexString(start) {
      const { buf } = this;
      this.pos++;
      const nibbles = [];
      while (this.pos < buf.length) {
        const b = buf[this.pos++];
        if (b === 62) break;
        if (isWhitespace(b)) continue;
        const n = hexVal(b);
        if (n < 0) throw new SyntaxError(`Bad hex digit in string at offset ${this.pos - 1}`);
        nibbles.push(n);
      }
      if (nibbles.length % 2 === 1) nibbles.push(0);
      const out = import_buffer.Buffer.alloc(nibbles.length / 2);
      for (let i = 0; i < out.length; i++) out[i] = nibbles[2 * i] << 4 | nibbles[2 * i + 1];
      return { type: TokenType.STRING, value: out, hex: true, pos: start };
    }
    _readKeyword(start) {
      const { buf } = this;
      let s = this.pos;
      while (this.pos < buf.length && isRegular(buf[this.pos])) this.pos++;
      if (this.pos === s) {
        this.pos++;
      }
      return { type: TokenType.KEYWORD, value: buf.toString("latin1", s, this.pos), pos: start };
    }
  };
  function hexVal(b) {
    if (b >= 48 && b <= 57) return b - 48;
    if (b >= 65 && b <= 70) return b - 65 + 10;
    if (b >= 97 && b <= 102) return b - 97 + 10;
    return -1;
  }

  // src/model.js
  init_buffer_inject();
  var Name = (name) => ({ kind: "name", name });
  var Str = (bytes, hex = false) => ({ kind: "string", bytes, hex });
  var Ref = (num2, gen) => ({ kind: "ref", num: num2, gen });
  var Dict = (map = /* @__PURE__ */ new Map()) => ({ kind: "dict", map });
  var PdfArray = (items = []) => ({ kind: "array", items });
  var Stream = (dict, raw) => ({ kind: "stream", dict, raw });
  var Null = () => ({ kind: "null" });
  function isRef(o) {
    return o != null && typeof o === "object" && o.kind === "ref";
  }
  function isDict(o) {
    return o != null && typeof o === "object" && o.kind === "dict";
  }
  function isStream(o) {
    return o != null && typeof o === "object" && o.kind === "stream";
  }
  function isName(o) {
    return o != null && typeof o === "object" && o.kind === "name";
  }
  function isArray(o) {
    return o != null && typeof o === "object" && o.kind === "array";
  }
  function dictGet(dict, key) {
    if (!isDict(dict)) return void 0;
    const k = key.startsWith("/") ? key.slice(1) : key;
    return dict.map.get(k);
  }

  // src/parser.js
  var Parser = class {
    constructor(buf, pos = 0) {
      this.buf = buf;
      this.lexer = new Lexer(buf, pos);
      this._peeked = null;
    }
    get pos() {
      return this._peeked ? this._peeked.pos : this.lexer.pos;
    }
    _next() {
      if (this._peeked) {
        const t = this._peeked;
        this._peeked = null;
        return t;
      }
      return this.lexer.next();
    }
    _peek() {
      if (!this._peeked) this._peeked = this.lexer.next();
      return this._peeked;
    }
    // Parse one object starting at the current position.
    parseObject() {
      const t = this._next();
      switch (t.type) {
        case TokenType.NUMBER:
          return this._parseNumberOrRef(t);
        case TokenType.STRING:
          return Str(t.value, t.hex);
        case TokenType.NAME:
          return Name(t.value);
        case TokenType.ARRAY_OPEN:
          return this._parseArray();
        case TokenType.DICT_OPEN:
          return this._parseDictOrStream();
        case TokenType.KEYWORD:
          if (t.value === "true") return true;
          if (t.value === "false") return false;
          if (t.value === "null") return Null();
          return { kind: "keyword", value: t.value, pos: t.pos };
        case TokenType.EOF:
          throw new SyntaxError("Unexpected EOF while parsing object");
        default:
          throw new SyntaxError(`Unexpected token ${t.type} at offset ${t.pos}`);
      }
    }
    _parseNumberOrRef(first) {
      if (Number.isInteger(first.value) && first.value >= 0) {
        const save = { pos: this.lexer.pos, peeked: this._peeked };
        const t2 = this._peek();
        if (t2.type === TokenType.NUMBER && Number.isInteger(t2.value)) {
          this._next();
          const t3 = this._peek();
          if (t3.type === TokenType.KEYWORD && t3.value === "R") {
            this._next();
            return Ref(first.value, t2.value);
          }
          if (t3.type === TokenType.KEYWORD && t3.value === "obj") {
            this._next();
            const inner = this.parseObject();
            const after = this._peek();
            if (after.type === TokenType.KEYWORD && after.value === "endobj") this._next();
            return { kind: "indirect", num: first.value, gen: t2.value, value: inner };
          }
          this.lexer.pos = save.pos;
          this._peeked = save.peeked;
        }
      }
      return first.value;
    }
    _parseArray() {
      const items = [];
      for (; ; ) {
        const t = this._peek();
        if (t.type === TokenType.ARRAY_CLOSE) {
          this._next();
          break;
        }
        if (t.type === TokenType.EOF) throw new SyntaxError("Unterminated array");
        items.push(this.parseObject());
      }
      return PdfArray(items);
    }
    _parseDictOrStream() {
      const map = /* @__PURE__ */ new Map();
      for (; ; ) {
        const t2 = this._next();
        if (t2.type === TokenType.DICT_CLOSE) break;
        if (t2.type === TokenType.EOF) throw new SyntaxError("Unterminated dictionary");
        if (t2.type !== TokenType.NAME) {
          throw new SyntaxError(`Expected name key in dict at offset ${t2.pos}, got ${t2.type}`);
        }
        const value = this.parseObject();
        map.set(t2.value, value);
      }
      const dict = Dict(map);
      const t = this._peek();
      if (t.type === TokenType.KEYWORD && t.value === "stream") {
        this._next();
        return this._readStreamBody(dict);
      }
      return dict;
    }
    _readStreamBody(dict) {
      const { buf } = this;
      let p = this.lexer.pos;
      if (buf[p] === 13 && buf[p + 1] === 10) p += 2;
      else if (buf[p] === 10) p += 1;
      else if (buf[p] === 13) p += 1;
      const dataStart = p;
      const lengthObj = dict.map.get("Length");
      let raw = null;
      if (typeof lengthObj === "number" && Number.isInteger(lengthObj) && lengthObj >= 0) {
        const end = dataStart + lengthObj;
        if (end <= buf.length) {
          raw = buf.subarray(dataStart, end);
          let q = end;
          while (q < buf.length && (buf[q] === 13 || buf[q] === 10 || buf[q] === 32)) q++;
          if (buf.toString("latin1", q, q + 9) === "endstream") q += 9;
          this.lexer.pos = q;
          this._peeked = null;
          return Stream(dict, raw);
        }
      }
      const marker = import_buffer.Buffer.from("endstream", "latin1");
      let idx = buf.indexOf(marker, dataStart);
      if (idx < 0) idx = buf.length;
      let dataEnd = idx;
      if (dataEnd > dataStart && buf[dataEnd - 1] === 10) dataEnd--;
      if (dataEnd > dataStart && buf[dataEnd - 1] === 13) dataEnd--;
      raw = buf.subarray(dataStart, dataEnd);
      this.lexer.pos = Math.min(idx + marker.length, buf.length);
      this._peeked = null;
      return Stream(dict, raw);
    }
  };
  function parseIndirectAt(buf, offset) {
    const p = new Parser(buf, offset);
    const obj = p.parseObject();
    if (obj && obj.kind === "indirect") return obj;
    return { kind: "indirect", num: null, gen: null, value: obj };
  }

  // src/filters.js
  init_buffer_inject();

  // browser/shim-zlib.js
  init_buffer_inject();

  // node_modules/pako/dist/pako.mjs
  init_buffer_inject();
  var Z_FIXED = 4;
  var Z_BINARY = 0;
  var Z_TEXT = 1;
  var Z_UNKNOWN = 2;
  function zero$1(buf) {
    let len = buf.length;
    while (--len >= 0) buf[len] = 0;
  }
  var STORED_BLOCK = 0;
  var STATIC_TREES = 1;
  var DYN_TREES = 2;
  var LENGTH_CODES = 29;
  var LITERALS = 256;
  var L_CODES = 286;
  var D_CODES = 30;
  var BL_CODES = 19;
  var HEAP_SIZE$1 = 573;
  var MAX_BITS = 15;
  var Buf_size = 16;
  var MAX_BL_BITS = 7;
  var END_BLOCK = 256;
  var REP_3_6 = 16;
  var REPZ_3_10 = 17;
  var REPZ_11_138 = 18;
  var extra_lbits = new Uint8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    4,
    4,
    4,
    4,
    5,
    5,
    5,
    5,
    0
  ]);
  var extra_dbits = new Uint8Array([
    0,
    0,
    0,
    0,
    1,
    1,
    2,
    2,
    3,
    3,
    4,
    4,
    5,
    5,
    6,
    6,
    7,
    7,
    8,
    8,
    9,
    9,
    10,
    10,
    11,
    11,
    12,
    12,
    13,
    13
  ]);
  var extra_blbits = new Uint8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    3,
    7
  ]);
  var bl_order = new Uint8Array([
    16,
    17,
    18,
    0,
    8,
    7,
    9,
    6,
    10,
    5,
    11,
    4,
    12,
    3,
    13,
    2,
    14,
    1,
    15
  ]);
  var DIST_CODE_LEN = 512;
  var static_ltree = new Array(288 * 2);
  zero$1(static_ltree);
  var static_dtree = new Array(D_CODES * 2);
  zero$1(static_dtree);
  var _dist_code = new Array(DIST_CODE_LEN);
  zero$1(_dist_code);
  var _length_code = new Array(256);
  zero$1(_length_code);
  var base_length = new Array(LENGTH_CODES);
  zero$1(base_length);
  var base_dist = new Array(D_CODES);
  zero$1(base_dist);
  var StaticTreeDesc = class {
    constructor(static_tree, extra_bits, extra_base, elems, max_length) {
      this.static_tree = static_tree;
      this.extra_bits = extra_bits;
      this.extra_base = extra_base;
      this.elems = elems;
      this.max_length = max_length;
      this.has_stree = static_tree && static_tree.length;
    }
  };
  var static_l_desc;
  var static_d_desc;
  var static_bl_desc;
  var TreeDesc = class {
    constructor(dyn_tree, stat_desc) {
      this.dyn_tree = dyn_tree;
      this.max_code = 0;
      this.stat_desc = stat_desc;
    }
  };
  var d_code = (dist) => {
    return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
  };
  var put_short = (s, w) => {
    s.pending_buf[s.pending++] = w & 255;
    s.pending_buf[s.pending++] = w >>> 8 & 255;
  };
  var send_bits = (s, value, length) => {
    if (s.bi_valid > Buf_size - length) {
      s.bi_buf |= value << s.bi_valid & 65535;
      put_short(s, s.bi_buf);
      s.bi_buf = value >> Buf_size - s.bi_valid;
      s.bi_valid += length - Buf_size;
    } else {
      s.bi_buf |= value << s.bi_valid & 65535;
      s.bi_valid += length;
    }
  };
  var send_code = (s, c, tree) => {
    send_bits(s, tree[c * 2], tree[c * 2 + 1]);
  };
  var bi_reverse = (code, len) => {
    let res = 0;
    do {
      res |= code & 1;
      code >>>= 1;
      res <<= 1;
    } while (--len > 0);
    return res >>> 1;
  };
  var bi_flush = (s) => {
    if (s.bi_valid === 16) {
      put_short(s, s.bi_buf);
      s.bi_buf = 0;
      s.bi_valid = 0;
    } else if (s.bi_valid >= 8) {
      s.pending_buf[s.pending++] = s.bi_buf & 255;
      s.bi_buf >>= 8;
      s.bi_valid -= 8;
    }
  };
  var gen_bitlen = (s, desc) => {
    const tree = desc.dyn_tree;
    const max_code = desc.max_code;
    const stree = desc.stat_desc.static_tree;
    const has_stree = desc.stat_desc.has_stree;
    const extra = desc.stat_desc.extra_bits;
    const base = desc.stat_desc.extra_base;
    const max_length = desc.stat_desc.max_length;
    let h;
    let n, m;
    let bits;
    let xbits;
    let f;
    let overflow = 0;
    for (bits = 0; bits <= MAX_BITS; bits++) s.bl_count[bits] = 0;
    tree[s.heap[s.heap_max] * 2 + 1] = 0;
    for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
      n = s.heap[h];
      bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
      if (bits > max_length) {
        bits = max_length;
        overflow++;
      }
      tree[n * 2 + 1] = bits;
      if (n > max_code) continue;
      s.bl_count[bits]++;
      xbits = 0;
      if (n >= base) xbits = extra[n - base];
      f = tree[n * 2];
      s.opt_len += f * (bits + xbits);
      if (has_stree) s.static_len += f * (stree[n * 2 + 1] + xbits);
    }
    if (overflow === 0) return;
    do {
      bits = max_length - 1;
      while (s.bl_count[bits] === 0) bits--;
      s.bl_count[bits]--;
      s.bl_count[bits + 1] += 2;
      s.bl_count[max_length]--;
      overflow -= 2;
    } while (overflow > 0);
    for (bits = max_length; bits !== 0; bits--) {
      n = s.bl_count[bits];
      while (n !== 0) {
        m = s.heap[--h];
        if (m > max_code) continue;
        if (tree[m * 2 + 1] !== bits) {
          s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
          tree[m * 2 + 1] = bits;
        }
        n--;
      }
    }
  };
  var gen_codes = (tree, max_code, bl_count) => {
    const next_code = new Array(16);
    let code = 0;
    let bits;
    let n;
    for (bits = 1; bits <= MAX_BITS; bits++) {
      code = code + bl_count[bits - 1] << 1;
      next_code[bits] = code;
    }
    for (n = 0; n <= max_code; n++) {
      let len = tree[n * 2 + 1];
      if (len === 0) continue;
      tree[n * 2] = bi_reverse(next_code[len]++, len);
    }
  };
  var tr_static_init = () => {
    let n;
    let bits;
    let length;
    let code;
    let dist;
    const bl_count = new Array(16);
    length = 0;
    for (code = 0; code < LENGTH_CODES - 1; code++) {
      base_length[code] = length;
      for (n = 0; n < 1 << extra_lbits[code]; n++) _length_code[length++] = code;
    }
    _length_code[length - 1] = code;
    dist = 0;
    for (code = 0; code < 16; code++) {
      base_dist[code] = dist;
      for (n = 0; n < 1 << extra_dbits[code]; n++) _dist_code[dist++] = code;
    }
    dist >>= 7;
    for (; code < D_CODES; code++) {
      base_dist[code] = dist << 7;
      for (n = 0; n < 1 << extra_dbits[code] - 7; n++) _dist_code[256 + dist++] = code;
    }
    for (bits = 0; bits <= MAX_BITS; bits++) bl_count[bits] = 0;
    n = 0;
    while (n <= 143) {
      static_ltree[n * 2 + 1] = 8;
      n++;
      bl_count[8]++;
    }
    while (n <= 255) {
      static_ltree[n * 2 + 1] = 9;
      n++;
      bl_count[9]++;
    }
    while (n <= 279) {
      static_ltree[n * 2 + 1] = 7;
      n++;
      bl_count[7]++;
    }
    while (n <= 287) {
      static_ltree[n * 2 + 1] = 8;
      n++;
      bl_count[8]++;
    }
    gen_codes(static_ltree, 287, bl_count);
    for (n = 0; n < D_CODES; n++) {
      static_dtree[n * 2 + 1] = 5;
      static_dtree[n * 2] = bi_reverse(n, 5);
    }
    static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, 257, L_CODES, MAX_BITS);
    static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
    static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
  };
  var init_block = (s) => {
    let n;
    for (n = 0; n < L_CODES; n++) s.dyn_ltree[n * 2] = 0;
    for (n = 0; n < D_CODES; n++) s.dyn_dtree[n * 2] = 0;
    for (n = 0; n < BL_CODES; n++) s.bl_tree[n * 2] = 0;
    s.dyn_ltree[END_BLOCK * 2] = 1;
    s.opt_len = s.static_len = 0;
    s.sym_next = s.matches = 0;
  };
  var bi_windup = (s) => {
    if (s.bi_valid > 8) put_short(s, s.bi_buf);
    else if (s.bi_valid > 0) s.pending_buf[s.pending++] = s.bi_buf;
    s.bi_buf = 0;
    s.bi_valid = 0;
  };
  var smaller = (tree, n, m, depth) => {
    const _n2 = n * 2;
    const _m2 = m * 2;
    return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
  };
  var pqdownheap = (s, tree, k) => {
    const v = s.heap[k];
    let j = k << 1;
    while (j <= s.heap_len) {
      if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) j++;
      if (smaller(tree, v, s.heap[j], s.depth)) break;
      s.heap[k] = s.heap[j];
      k = j;
      j <<= 1;
    }
    s.heap[k] = v;
  };
  var compress_block = (s, ltree, dtree) => {
    let dist;
    let lc;
    let sx = 0;
    let code;
    let extra;
    if (s.sym_next !== 0) do {
      dist = s.pending_buf[s.sym_buf + sx++] & 255;
      dist += (s.pending_buf[s.sym_buf + sx++] & 255) << 8;
      lc = s.pending_buf[s.sym_buf + sx++];
      if (dist === 0) send_code(s, lc, ltree);
      else {
        code = _length_code[lc];
        send_code(s, code + LITERALS + 1, ltree);
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);
        }
        dist--;
        code = d_code(dist);
        send_code(s, code, dtree);
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);
        }
      }
    } while (sx < s.sym_next);
    send_code(s, END_BLOCK, ltree);
  };
  var build_tree = (s, desc) => {
    const tree = desc.dyn_tree;
    const stree = desc.stat_desc.static_tree;
    const has_stree = desc.stat_desc.has_stree;
    const elems = desc.stat_desc.elems;
    let n, m;
    let max_code = -1;
    let node;
    s.heap_len = 0;
    s.heap_max = HEAP_SIZE$1;
    for (n = 0; n < elems; n++) if (tree[n * 2] !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;
    } else tree[n * 2 + 1] = 0;
    while (s.heap_len < 2) {
      node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
      tree[node * 2] = 1;
      s.depth[node] = 0;
      s.opt_len--;
      if (has_stree) s.static_len -= stree[node * 2 + 1];
    }
    desc.max_code = max_code;
    for (n = s.heap_len >> 1; n >= 1; n--) pqdownheap(s, tree, n);
    node = elems;
    do {
      n = s.heap[1];
      s.heap[1] = s.heap[s.heap_len--];
      pqdownheap(s, tree, 1);
      m = s.heap[1];
      s.heap[--s.heap_max] = n;
      s.heap[--s.heap_max] = m;
      tree[node * 2] = tree[n * 2] + tree[m * 2];
      s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
      tree[n * 2 + 1] = tree[m * 2 + 1] = node;
      s.heap[1] = node++;
      pqdownheap(s, tree, 1);
    } while (s.heap_len >= 2);
    s.heap[--s.heap_max] = s.heap[1];
    gen_bitlen(s, desc);
    gen_codes(tree, max_code, s.bl_count);
  };
  var scan_tree = (s, tree, max_code) => {
    let n;
    let prevlen = -1;
    let curlen;
    let nextlen = tree[1];
    let count = 0;
    let max_count = 7;
    let min_count = 4;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }
    tree[(max_code + 1) * 2 + 1] = 65535;
    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1];
      if (++count < max_count && curlen === nextlen) continue;
      else if (count < min_count) s.bl_tree[curlen * 2] += count;
      else if (curlen !== 0) {
        if (curlen !== prevlen) s.bl_tree[curlen * 2]++;
        s.bl_tree[REP_3_6 * 2]++;
      } else if (count <= 10) s.bl_tree[REPZ_3_10 * 2]++;
      else s.bl_tree[REPZ_11_138 * 2]++;
      count = 0;
      prevlen = curlen;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen === nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  };
  var send_tree = (s, tree, max_code) => {
    let n;
    let prevlen = -1;
    let curlen;
    let nextlen = tree[1];
    let count = 0;
    let max_count = 7;
    let min_count = 4;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;
    }
    for (n = 0; n <= max_code; n++) {
      curlen = nextlen;
      nextlen = tree[(n + 1) * 2 + 1];
      if (++count < max_count && curlen === nextlen) continue;
      else if (count < min_count) do
        send_code(s, curlen, s.bl_tree);
      while (--count !== 0);
      else if (curlen !== 0) {
        if (curlen !== prevlen) {
          send_code(s, curlen, s.bl_tree);
          count--;
        }
        send_code(s, REP_3_6, s.bl_tree);
        send_bits(s, count - 3, 2);
      } else if (count <= 10) {
        send_code(s, REPZ_3_10, s.bl_tree);
        send_bits(s, count - 3, 3);
      } else {
        send_code(s, REPZ_11_138, s.bl_tree);
        send_bits(s, count - 11, 7);
      }
      count = 0;
      prevlen = curlen;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      } else if (curlen === nextlen) {
        max_count = 6;
        min_count = 3;
      } else {
        max_count = 7;
        min_count = 4;
      }
    }
  };
  var build_bl_tree = (s) => {
    let max_blindex;
    scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
    scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
    build_tree(s, s.bl_desc);
    for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) break;
    s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
    return max_blindex;
  };
  var send_all_trees = (s, lcodes, dcodes, blcodes) => {
    let rank2;
    send_bits(s, lcodes - 257, 5);
    send_bits(s, dcodes - 1, 5);
    send_bits(s, blcodes - 4, 4);
    for (rank2 = 0; rank2 < blcodes; rank2++) send_bits(s, s.bl_tree[bl_order[rank2] * 2 + 1], 3);
    send_tree(s, s.dyn_ltree, lcodes - 1);
    send_tree(s, s.dyn_dtree, dcodes - 1);
  };
  var detect_data_type = (s) => {
    let block_mask = 4093624447;
    let n;
    for (n = 0; n <= 31; n++, block_mask >>>= 1) if (block_mask & 1 && s.dyn_ltree[n * 2] !== 0) return Z_BINARY;
    if (s.dyn_ltree[18] !== 0 || s.dyn_ltree[20] !== 0 || s.dyn_ltree[26] !== 0) return Z_TEXT;
    for (n = 32; n < LITERALS; n++) if (s.dyn_ltree[n * 2] !== 0) return Z_TEXT;
    return Z_BINARY;
  };
  var static_init_done = false;
  var _tr_init = (s) => {
    if (!static_init_done) {
      tr_static_init();
      static_init_done = true;
    }
    s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
    s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
    s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
    s.bi_buf = 0;
    s.bi_valid = 0;
    init_block(s);
  };
  var _tr_stored_block = (s, buf, stored_len, last) => {
    send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
    bi_windup(s);
    put_short(s, stored_len);
    put_short(s, ~stored_len);
    if (stored_len) s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
    s.pending += stored_len;
  };
  var _tr_align = (s) => {
    send_bits(s, STATIC_TREES << 1, 3);
    send_code(s, END_BLOCK, static_ltree);
    bi_flush(s);
  };
  var _tr_flush_block = (s, buf, stored_len, last) => {
    let opt_lenb, static_lenb;
    let max_blindex = 0;
    if (s.level > 0) {
      if (s.strm.data_type === Z_UNKNOWN) s.strm.data_type = detect_data_type(s);
      build_tree(s, s.l_desc);
      build_tree(s, s.d_desc);
      max_blindex = build_bl_tree(s);
      opt_lenb = s.opt_len + 3 + 7 >>> 3;
      static_lenb = s.static_len + 3 + 7 >>> 3;
      if (static_lenb <= opt_lenb || s.strategy === Z_FIXED) opt_lenb = static_lenb;
    } else opt_lenb = static_lenb = stored_len + 5;
    if (stored_len + 4 <= opt_lenb && buf !== -1) _tr_stored_block(s, buf, stored_len, last);
    else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
      send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
      compress_block(s, static_ltree, static_dtree);
    } else {
      send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
      send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
      compress_block(s, s.dyn_ltree, s.dyn_dtree);
    }
    init_block(s);
    if (last) bi_windup(s);
  };
  var _tr_tally = (s, dist, lc) => {
    s.pending_buf[s.sym_buf + s.sym_next++] = dist;
    s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
    s.pending_buf[s.sym_buf + s.sym_next++] = lc;
    if (dist === 0) s.dyn_ltree[lc * 2]++;
    else {
      s.matches++;
      dist--;
      s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
      s.dyn_dtree[d_code(dist) * 2]++;
    }
    return s.sym_next === s.sym_end;
  };
  var adler32 = (adler, buf, len, pos) => {
    let s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
    while (len !== 0) {
      n = len > 2e3 ? 2e3 : len;
      len -= n;
      do {
        s1 = s1 + buf[pos++] | 0;
        s2 = s2 + s1 | 0;
      } while (--n);
      s1 %= 65521;
      s2 %= 65521;
    }
    return s1 | s2 << 16 | 0;
  };
  var makeTable = () => {
    let c, table = [];
    for (var n = 0; n < 256; n++) {
      c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      table[n] = c;
    }
    return table;
  };
  var crcTable = new Uint32Array(makeTable());
  var crc32 = (crc, buf, len, pos) => {
    const t = crcTable;
    const end = pos + len;
    crc ^= -1;
    for (let i = pos; i < end; i++) crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
    return crc ^ -1;
  };
  var messages_default = {
    2: "need dictionary",
    1: "stream end",
    0: "",
    "-1": "file error",
    "-2": "stream error",
    "-3": "data error",
    "-4": "insufficient memory",
    "-5": "buffer error",
    "-6": "incompatible version"
  };
  var MAX_MEM_LEVEL = 9;
  var HEAP_SIZE = 573;
  var MIN_MATCH = 3;
  var MAX_MATCH = 258;
  var MIN_LOOKAHEAD = 262;
  var PRESET_DICT = 32;
  var INIT_STATE = 42;
  var GZIP_STATE = 57;
  var EXTRA_STATE = 69;
  var NAME_STATE = 73;
  var COMMENT_STATE = 91;
  var HCRC_STATE = 103;
  var BUSY_STATE = 113;
  var FINISH_STATE = 666;
  var BS_NEED_MORE = 1;
  var BS_BLOCK_DONE = 2;
  var BS_FINISH_STARTED = 3;
  var BS_FINISH_DONE = 4;
  var OS_CODE = 3;
  var err = (strm, errorCode) => {
    strm.msg = messages_default[errorCode];
    return errorCode;
  };
  var rank = (f) => {
    return f * 2 - (f > 4 ? 9 : 0);
  };
  var zero = (buf) => {
    let len = buf.length;
    while (--len >= 0) buf[len] = 0;
  };
  var slide_hash = (s) => {
    let n, m;
    let p;
    let wsize = s.w_size;
    n = s.hash_size;
    p = n;
    do {
      m = s.head[--p];
      s.head[p] = m >= wsize ? m - wsize : 0;
    } while (--n);
    n = wsize;
    p = n;
    do {
      m = s.prev[--p];
      s.prev[p] = m >= wsize ? m - wsize : 0;
    } while (--n);
  };
  var HASH = (s, prev, data) => (prev << s.hash_shift ^ data) & s.hash_mask;
  var INSERT_STRING = (s, str) => {
    let h;
    if (s.legacy_hash) h = s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
    else {
      const w = s.window;
      const value = w[str] | w[str + 1] << 8 | w[str + 2] << 16 | w[str + 3] << 24;
      h = s.ins_h = Math.imul(value, 66521) + 66521 >>> 16 & s.hash_mask;
    }
    const hash_head = s.prev[str & s.w_mask] = s.head[h];
    s.head[h] = str;
    return hash_head;
  };
  var flush_pending = (strm) => {
    const s = strm.state;
    let len = s.pending;
    if (len > strm.avail_out) len = strm.avail_out;
    if (len === 0) return;
    strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
    strm.next_out += len;
    s.pending_out += len;
    strm.total_out += len;
    strm.avail_out -= len;
    s.pending -= len;
    if (s.pending === 0) s.pending_out = 0;
  };
  var flush_block_only = (s, last) => {
    _tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
    s.block_start = s.strstart;
    flush_pending(s.strm);
  };
  var put_byte = (s, b) => {
    s.pending_buf[s.pending++] = b;
  };
  var putShortMSB = (s, b) => {
    s.pending_buf[s.pending++] = b >>> 8 & 255;
    s.pending_buf[s.pending++] = b & 255;
  };
  var read_buf = (strm, buf, start, size) => {
    let len = strm.avail_in;
    if (len > size) len = size;
    if (len === 0) return 0;
    strm.avail_in -= len;
    buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
    if (strm.state.wrap === 1) strm.adler = adler32(strm.adler, buf, len, start);
    else if (strm.state.wrap === 2) strm.adler = crc32(strm.adler, buf, len, start);
    strm.next_in += len;
    strm.total_in += len;
    return len;
  };
  var longest_match = (s, cur_match) => {
    let chain_length = s.max_chain_length;
    let scan = s.strstart;
    let match;
    let len;
    let best_len = s.prev_length;
    let nice_match = s.nice_match;
    const limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
    const _win = s.window;
    const wmask = s.w_mask;
    const prev = s.prev;
    const strend = s.strstart + MAX_MATCH;
    let scan_end1 = _win[scan + best_len - 1];
    let scan_end = _win[scan + best_len];
    if (s.prev_length >= s.good_match) chain_length >>= 2;
    if (nice_match > s.lookahead) nice_match = s.lookahead;
    do {
      match = cur_match;
      if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) continue;
      scan += 2;
      match++;
      do
        ;
      while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
      len = MAX_MATCH - (strend - scan);
      scan = strend - MAX_MATCH;
      if (len > best_len) {
        s.match_start = cur_match;
        best_len = len;
        if (len >= nice_match) break;
        scan_end1 = _win[scan + best_len - 1];
        scan_end = _win[scan + best_len];
      }
    } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
    if (best_len <= s.lookahead) return best_len;
    return s.lookahead;
  };
  var fill_window = (s) => {
    const _w_size = s.w_size;
    let n, more, str;
    do {
      more = s.window_size - s.lookahead - s.strstart;
      if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
        s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
        s.match_start -= _w_size;
        s.strstart -= _w_size;
        s.block_start -= _w_size;
        if (s.insert > s.strstart) s.insert = s.strstart;
        slide_hash(s);
        more += _w_size;
      }
      if (s.strm.avail_in === 0) break;
      n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
      s.lookahead += n;
      if (!s.legacy_hash) {
        if (s.lookahead + s.insert > MIN_MATCH) {
          str = s.strstart - s.insert;
          while (s.insert) {
            INSERT_STRING(s, str);
            str++;
            s.insert--;
            if (s.lookahead + s.insert <= MIN_MATCH) break;
          }
        }
      } else if (s.lookahead + s.insert >= MIN_MATCH) {
        str = s.strstart - s.insert;
        s.ins_h = s.window[str];
        s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
        while (s.insert) {
          INSERT_STRING(s, str);
          str++;
          s.insert--;
          if (s.lookahead + s.insert < MIN_MATCH) break;
        }
      }
    } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
  };
  var deflate_stored = (s, flush) => {
    let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;
    let len, left, have, last = 0;
    let used = s.strm.avail_in;
    do {
      len = 65535;
      have = s.bi_valid + 42 >> 3;
      if (s.strm.avail_out < have) break;
      have = s.strm.avail_out - have;
      left = s.strstart - s.block_start;
      if (len > left + s.strm.avail_in) len = left + s.strm.avail_in;
      if (len > have) len = have;
      if (len < min_block && (len === 0 && flush !== 4 || flush === 0 || len !== left + s.strm.avail_in)) break;
      last = flush === 4 && len === left + s.strm.avail_in ? 1 : 0;
      _tr_stored_block(s, 0, 0, last);
      s.pending_buf[s.pending - 4] = len;
      s.pending_buf[s.pending - 3] = len >> 8;
      s.pending_buf[s.pending - 2] = ~len;
      s.pending_buf[s.pending - 1] = ~len >> 8;
      flush_pending(s.strm);
      if (left) {
        if (left > len) left = len;
        s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
        s.strm.next_out += left;
        s.strm.avail_out -= left;
        s.strm.total_out += left;
        s.block_start += left;
        len -= left;
      }
      if (len) {
        read_buf(s.strm, s.strm.output, s.strm.next_out, len);
        s.strm.next_out += len;
        s.strm.avail_out -= len;
        s.strm.total_out += len;
      }
    } while (last === 0);
    used -= s.strm.avail_in;
    if (used) {
      if (used >= s.w_size) {
        s.matches = 2;
        s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
        s.strstart = s.w_size;
        s.insert = s.strstart;
      } else {
        if (s.window_size - s.strstart <= used) {
          s.strstart -= s.w_size;
          s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
          if (s.matches < 2) s.matches++;
          if (s.insert > s.strstart) s.insert = s.strstart;
        }
        s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
        s.strstart += used;
        s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
      }
      s.block_start = s.strstart;
    }
    if (s.high_water < s.strstart) s.high_water = s.strstart;
    if (last) return BS_FINISH_DONE;
    if (flush !== 0 && flush !== 4 && s.strm.avail_in === 0 && s.strstart === s.block_start) return BS_BLOCK_DONE;
    have = s.window_size - s.strstart;
    if (s.strm.avail_in > have && s.block_start >= s.w_size) {
      s.block_start -= s.w_size;
      s.strstart -= s.w_size;
      s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
      if (s.matches < 2) s.matches++;
      have += s.w_size;
      if (s.insert > s.strstart) s.insert = s.strstart;
    }
    if (have > s.strm.avail_in) have = s.strm.avail_in;
    if (have) {
      read_buf(s.strm, s.window, s.strstart, have);
      s.strstart += have;
      s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
    }
    if (s.high_water < s.strstart) s.high_water = s.strstart;
    have = s.bi_valid + 42 >> 3;
    have = s.pending_buf_size - have > 65535 ? 65535 : s.pending_buf_size - have;
    min_block = have > s.w_size ? s.w_size : have;
    left = s.strstart - s.block_start;
    if (left >= min_block || (left || flush === 4) && flush !== 0 && s.strm.avail_in === 0 && left <= have) {
      len = left > have ? have : left;
      last = flush === 4 && s.strm.avail_in === 0 && len === left ? 1 : 0;
      _tr_stored_block(s, s.block_start, len, last);
      s.block_start += len;
      flush_pending(s.strm);
    }
    return last ? BS_FINISH_STARTED : BS_NEED_MORE;
  };
  var deflate_fast = (s, flush) => {
    let hash_head;
    let bflush;
    for (; ; ) {
      if (s.lookahead < MIN_LOOKAHEAD) {
        fill_window(s);
        if (s.lookahead < MIN_LOOKAHEAD && flush === 0) return BS_NEED_MORE;
        if (s.lookahead === 0) break;
      }
      hash_head = 0;
      if (s.lookahead >= MIN_MATCH) hash_head = INSERT_STRING(s, s.strstart);
      if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) s.match_length = longest_match(s, hash_head);
      if (s.match_length >= MIN_MATCH) {
        bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
        s.lookahead -= s.match_length;
        if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
          s.match_length--;
          do {
            s.strstart++;
            hash_head = INSERT_STRING(s, s.strstart);
          } while (--s.match_length !== 0);
          s.strstart++;
        } else {
          s.strstart += s.match_length;
          s.match_length = 0;
          if (s.legacy_hash) {
            s.ins_h = s.window[s.strstart];
            s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);
          }
        }
      } else {
        bflush = _tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
      }
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) return BS_NEED_MORE;
      }
    }
    s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
    if (flush === 4) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
      return BS_FINISH_DONE;
    }
    if (s.sym_next) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) return BS_NEED_MORE;
    }
    return BS_BLOCK_DONE;
  };
  var deflate_slow = (s, flush) => {
    let hash_head;
    let bflush;
    let max_insert;
    for (; ; ) {
      if (s.lookahead < MIN_LOOKAHEAD) {
        fill_window(s);
        if (s.lookahead < MIN_LOOKAHEAD && flush === 0) return BS_NEED_MORE;
        if (s.lookahead === 0) break;
      }
      hash_head = 0;
      if (s.lookahead >= MIN_MATCH) hash_head = INSERT_STRING(s, s.strstart);
      s.prev_length = s.match_length;
      s.prev_match = s.match_start;
      s.match_length = MIN_MATCH - 1;
      if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
        s.match_length = longest_match(s, hash_head);
        if (s.match_length <= 5 && (s.strategy === 1 || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) s.match_length = MIN_MATCH - 1;
      }
      if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
        max_insert = s.strstart + s.lookahead - MIN_MATCH;
        bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
        s.lookahead -= s.prev_length - 1;
        s.prev_length -= 2;
        do
          if (++s.strstart <= max_insert) hash_head = INSERT_STRING(s, s.strstart);
        while (--s.prev_length !== 0);
        s.match_available = 0;
        s.match_length = MIN_MATCH - 1;
        s.strstart++;
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) return BS_NEED_MORE;
        }
      } else if (s.match_available) {
        bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
        if (bflush)
          flush_block_only(s, false);
        s.strstart++;
        s.lookahead--;
        if (s.strm.avail_out === 0) return BS_NEED_MORE;
      } else {
        s.match_available = 1;
        s.strstart++;
        s.lookahead--;
      }
    }
    if (s.match_available) {
      bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
      s.match_available = 0;
    }
    s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
    if (flush === 4) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
      return BS_FINISH_DONE;
    }
    if (s.sym_next) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) return BS_NEED_MORE;
    }
    return BS_BLOCK_DONE;
  };
  var deflate_rle = (s, flush) => {
    let bflush;
    let prev;
    let scan, strend;
    const _win = s.window;
    for (; ; ) {
      if (s.lookahead <= MAX_MATCH) {
        fill_window(s);
        if (s.lookahead <= MAX_MATCH && flush === 0) return BS_NEED_MORE;
        if (s.lookahead === 0) break;
      }
      s.match_length = 0;
      if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
        scan = s.strstart - 1;
        prev = _win[scan];
        if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
          strend = s.strstart + MAX_MATCH;
          do
            ;
          while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
          s.match_length = MAX_MATCH - (strend - scan);
          if (s.match_length > s.lookahead) s.match_length = s.lookahead;
        }
      }
      if (s.match_length >= MIN_MATCH) {
        bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);
        s.lookahead -= s.match_length;
        s.strstart += s.match_length;
        s.match_length = 0;
      } else {
        bflush = _tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
      }
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) return BS_NEED_MORE;
      }
    }
    s.insert = 0;
    if (flush === 4) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
      return BS_FINISH_DONE;
    }
    if (s.sym_next) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) return BS_NEED_MORE;
    }
    return BS_BLOCK_DONE;
  };
  var deflate_huff = (s, flush) => {
    let bflush;
    for (; ; ) {
      if (s.lookahead === 0) {
        fill_window(s);
        if (s.lookahead === 0) {
          if (flush === 0) return BS_NEED_MORE;
          break;
        }
      }
      s.match_length = 0;
      bflush = _tr_tally(s, 0, s.window[s.strstart]);
      s.lookahead--;
      s.strstart++;
      if (bflush) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) return BS_NEED_MORE;
      }
    }
    s.insert = 0;
    if (flush === 4) {
      flush_block_only(s, true);
      if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
      return BS_FINISH_DONE;
    }
    if (s.sym_next) {
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) return BS_NEED_MORE;
    }
    return BS_BLOCK_DONE;
  };
  var Config = class {
    constructor(good_length, max_lazy, nice_length, max_chain, func) {
      this.good_length = good_length;
      this.max_lazy = max_lazy;
      this.nice_length = nice_length;
      this.max_chain = max_chain;
      this.func = func;
    }
  };
  var configuration_table = [
    new Config(0, 0, 0, 0, deflate_stored),
    new Config(4, 4, 8, 4, deflate_fast),
    new Config(4, 5, 16, 8, deflate_fast),
    new Config(4, 6, 32, 32, deflate_fast),
    new Config(4, 4, 16, 16, deflate_slow),
    new Config(8, 16, 32, 32, deflate_slow),
    new Config(8, 16, 128, 128, deflate_slow),
    new Config(8, 32, 128, 256, deflate_slow),
    new Config(32, 128, 258, 1024, deflate_slow),
    new Config(32, 258, 258, 4096, deflate_slow)
  ];
  var lm_init = (s) => {
    s.window_size = 2 * s.w_size;
    zero(s.head);
    s.max_lazy_match = configuration_table[s.level].max_lazy;
    s.good_match = configuration_table[s.level].good_length;
    s.nice_match = configuration_table[s.level].nice_length;
    s.max_chain_length = configuration_table[s.level].max_chain;
    s.strstart = 0;
    s.block_start = 0;
    s.lookahead = 0;
    s.insert = 0;
    s.match_length = s.prev_length = MIN_MATCH - 1;
    s.match_available = 0;
    s.ins_h = 0;
  };
  var DeflateState = class {
    constructor() {
      this.strm = null;
      this.status = 0;
      this.pending_buf = null;
      this.pending_buf_size = 0;
      this.pending_out = 0;
      this.pending = 0;
      this.wrap = 0;
      this.gzhead = null;
      this.gzindex = 0;
      this.method = 8;
      this.last_flush = -1;
      this.w_size = 0;
      this.w_bits = 0;
      this.w_mask = 0;
      this.window = null;
      this.window_size = 0;
      this.prev = null;
      this.head = null;
      this.ins_h = 0;
      this.legacy_hash = 0;
      this.hash_size = 0;
      this.hash_bits = 0;
      this.hash_mask = 0;
      this.hash_shift = 0;
      this.block_start = 0;
      this.match_length = 0;
      this.prev_match = 0;
      this.match_available = 0;
      this.strstart = 0;
      this.match_start = 0;
      this.lookahead = 0;
      this.prev_length = 0;
      this.max_chain_length = 0;
      this.max_lazy_match = 0;
      this.level = 0;
      this.strategy = 0;
      this.good_match = 0;
      this.nice_match = 0;
      this.dyn_ltree = new Uint16Array(HEAP_SIZE * 2);
      this.dyn_dtree = /* @__PURE__ */ new Uint16Array(122);
      this.bl_tree = /* @__PURE__ */ new Uint16Array(78);
      zero(this.dyn_ltree);
      zero(this.dyn_dtree);
      zero(this.bl_tree);
      this.l_desc = null;
      this.d_desc = null;
      this.bl_desc = null;
      this.bl_count = /* @__PURE__ */ new Uint16Array(16);
      this.heap = /* @__PURE__ */ new Uint16Array(573);
      zero(this.heap);
      this.heap_len = 0;
      this.heap_max = 0;
      this.depth = /* @__PURE__ */ new Uint16Array(573);
      zero(this.depth);
      this.sym_buf = 0;
      this.lit_bufsize = 0;
      this.sym_next = 0;
      this.sym_end = 0;
      this.opt_len = 0;
      this.static_len = 0;
      this.matches = 0;
      this.insert = 0;
      this.bi_buf = 0;
      this.bi_valid = 0;
    }
  };
  var deflateStateCheck = (strm) => {
    if (!strm) return 1;
    const s = strm.state;
    if (!s || s.strm !== strm || s.status !== INIT_STATE && s.status !== GZIP_STATE && s.status !== EXTRA_STATE && s.status !== NAME_STATE && s.status !== COMMENT_STATE && s.status !== HCRC_STATE && s.status !== BUSY_STATE && s.status !== FINISH_STATE) return 1;
    return 0;
  };
  var deflateResetKeep = (strm) => {
    if (deflateStateCheck(strm)) return err(strm, -2);
    strm.total_in = strm.total_out = 0;
    strm.data_type = 2;
    const s = strm.state;
    s.pending = 0;
    s.pending_out = 0;
    if (s.wrap < 0) s.wrap = -s.wrap;
    s.status = s.wrap === 2 ? GZIP_STATE : s.wrap ? INIT_STATE : BUSY_STATE;
    strm.adler = s.wrap === 2 ? 0 : 1;
    s.last_flush = -2;
    _tr_init(s);
    return 0;
  };
  var deflateReset = (strm) => {
    const ret = deflateResetKeep(strm);
    if (ret === 0) lm_init(strm.state);
    return ret;
  };
  var deflateInit2 = (strm, level, method, windowBits, memLevel, strategy, legacyHash) => {
    if (!strm) return -2;
    let wrap = 1;
    if (level === -1) level = 6;
    if (windowBits < 0) {
      wrap = 0;
      windowBits = -windowBits;
    } else if (windowBits > 15) {
      wrap = 2;
      windowBits -= 16;
    }
    if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== 8 || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > 4 || windowBits === 8 && wrap !== 1) return err(strm, -2);
    if (windowBits === 8) windowBits = 9;
    const s = new DeflateState();
    strm.state = s;
    s.strm = strm;
    s.status = INIT_STATE;
    s.wrap = wrap;
    s.gzhead = null;
    s.w_bits = windowBits;
    s.w_size = 1 << s.w_bits;
    s.w_mask = s.w_size - 1;
    s.legacy_hash = legacyHash ? 1 : 0;
    s.hash_bits = memLevel + 7;
    if (!s.legacy_hash && s.hash_bits < 15) s.hash_bits = 15;
    s.hash_size = 1 << s.hash_bits;
    s.hash_mask = s.hash_size - 1;
    s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
    s.window = new Uint8Array(s.w_size * 2);
    s.head = new Uint16Array(s.hash_size);
    s.prev = new Uint16Array(s.w_size);
    s.lit_bufsize = 1 << memLevel + 6;
    s.pending_buf_size = s.lit_bufsize * 4;
    s.pending_buf = new Uint8Array(s.pending_buf_size);
    s.sym_buf = s.lit_bufsize;
    s.sym_end = (s.lit_bufsize - 1) * 3;
    s.level = level;
    s.strategy = strategy;
    s.method = method;
    return deflateReset(strm);
  };
  var deflate$1 = (strm, flush) => {
    if (deflateStateCheck(strm) || flush > 5 || flush < 0) return strm ? err(strm, -2) : -2;
    const s = strm.state;
    if (!strm.output || strm.avail_in !== 0 && !strm.input || s.status === FINISH_STATE && flush !== 4) return err(strm, strm.avail_out === 0 ? -5 : -2);
    const old_flush = s.last_flush;
    s.last_flush = flush;
    if (s.pending !== 0) {
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        return 0;
      }
    } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== 4) return err(strm, -5);
    if (s.status === FINISH_STATE && strm.avail_in !== 0) return err(strm, -5);
    if (s.status === INIT_STATE && s.wrap === 0) s.status = BUSY_STATE;
    if (s.status === INIT_STATE) {
      let header = 8 + (s.w_bits - 8 << 4) << 8;
      let level_flags = -1;
      if (s.strategy >= 2 || s.level < 2) level_flags = 0;
      else if (s.level < 6) level_flags = 1;
      else if (s.level === 6) level_flags = 2;
      else level_flags = 3;
      header |= level_flags << 6;
      if (s.strstart !== 0) header |= PRESET_DICT;
      header += 31 - header % 31;
      putShortMSB(s, header);
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 65535);
      }
      strm.adler = 1;
      s.status = BUSY_STATE;
      flush_pending(strm);
      if (s.pending !== 0) {
        s.last_flush = -1;
        return 0;
      }
    }
    if (s.status === GZIP_STATE) {
      strm.adler = 0;
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) {
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 : s.strategy >= 2 || s.level < 2 ? 4 : 0);
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
        flush_pending(strm);
        if (s.pending !== 0) {
          s.last_flush = -1;
          return 0;
        }
      } else {
        put_byte(s, (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16));
        put_byte(s, s.gzhead.time & 255);
        put_byte(s, s.gzhead.time >> 8 & 255);
        put_byte(s, s.gzhead.time >> 16 & 255);
        put_byte(s, s.gzhead.time >> 24 & 255);
        put_byte(s, s.level === 9 ? 2 : s.strategy >= 2 || s.level < 2 ? 4 : 0);
        put_byte(s, s.gzhead.os & 255);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 255);
          put_byte(s, s.gzhead.extra.length >> 8 & 255);
        }
        if (s.gzhead.hcrc) strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    }
    if (s.status === EXTRA_STATE) {
      if (s.gzhead.extra) {
        let beg = s.pending;
        let left = (s.gzhead.extra.length & 65535) - s.gzindex;
        while (s.pending + left > s.pending_buf_size) {
          let copy = s.pending_buf_size - s.pending;
          s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
          s.pending = s.pending_buf_size;
          if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          s.gzindex += copy;
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return 0;
          }
          beg = 0;
          left -= copy;
        }
        let gzhead_extra = new Uint8Array(s.gzhead.extra);
        s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
        s.pending += left;
        if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        s.gzindex = 0;
      }
      s.status = NAME_STATE;
    }
    if (s.status === NAME_STATE) {
      if (s.gzhead.name) {
        let beg = s.pending;
        let val;
        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            flush_pending(strm);
            if (s.pending !== 0) {
              s.last_flush = -1;
              return 0;
            }
            beg = 0;
          }
          if (s.gzindex < s.gzhead.name.length) val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
          else val = 0;
          put_byte(s, val);
        } while (val !== 0);
        if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
        s.gzindex = 0;
      }
      s.status = COMMENT_STATE;
    }
    if (s.status === COMMENT_STATE) {
      if (s.gzhead.comment) {
        let beg = s.pending;
        let val;
        do {
          if (s.pending === s.pending_buf_size) {
            if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            flush_pending(strm);
            if (s.pending !== 0) {
              s.last_flush = -1;
              return 0;
            }
            beg = 0;
          }
          if (s.gzindex < s.gzhead.comment.length) val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
          else val = 0;
          put_byte(s, val);
        } while (val !== 0);
        if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      s.status = HCRC_STATE;
    }
    if (s.status === HCRC_STATE) {
      if (s.gzhead.hcrc) {
        if (s.pending + 2 > s.pending_buf_size) {
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return 0;
          }
        }
        put_byte(s, strm.adler & 255);
        put_byte(s, strm.adler >> 8 & 255);
        strm.adler = 0;
      }
      s.status = BUSY_STATE;
      flush_pending(strm);
      if (s.pending !== 0) {
        s.last_flush = -1;
        return 0;
      }
    }
    if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== 0 && s.status !== FINISH_STATE) {
      let bstate = s.level === 0 ? deflate_stored(s, flush) : s.strategy === 2 ? deflate_huff(s, flush) : s.strategy === 3 ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
      if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) s.status = FINISH_STATE;
      if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
        if (strm.avail_out === 0) s.last_flush = -1;
        return 0;
      }
      if (bstate === BS_BLOCK_DONE) {
        if (flush === 1) _tr_align(s);
        else if (flush !== 5) {
          _tr_stored_block(s, 0, 0, false);
          if (flush === 3) {
            zero(s.head);
            if (s.lookahead === 0) {
              s.strstart = 0;
              s.block_start = 0;
              s.insert = 0;
            }
          }
        }
        flush_pending(strm);
        if (strm.avail_out === 0) {
          s.last_flush = -1;
          return 0;
        }
      }
    }
    if (flush !== 4) return 0;
    if (s.wrap <= 0) return 1;
    if (s.wrap === 2) {
      put_byte(s, strm.adler & 255);
      put_byte(s, strm.adler >> 8 & 255);
      put_byte(s, strm.adler >> 16 & 255);
      put_byte(s, strm.adler >> 24 & 255);
      put_byte(s, strm.total_in & 255);
      put_byte(s, strm.total_in >> 8 & 255);
      put_byte(s, strm.total_in >> 16 & 255);
      put_byte(s, strm.total_in >> 24 & 255);
    } else {
      putShortMSB(s, strm.adler >>> 16);
      putShortMSB(s, strm.adler & 65535);
    }
    flush_pending(strm);
    if (s.wrap > 0) s.wrap = -s.wrap;
    return s.pending !== 0 ? 0 : 1;
  };
  var deflateEnd = (strm) => {
    if (deflateStateCheck(strm)) return -2;
    const status = strm.state.status;
    strm.state = null;
    return status === BUSY_STATE ? err(strm, -3) : 0;
  };
  var deflateSetDictionary = (strm, dictionary) => {
    let dictLength = dictionary.length;
    if (deflateStateCheck(strm)) return -2;
    const s = strm.state;
    const wrap = s.wrap;
    if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) return -2;
    if (wrap === 1) strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
    s.wrap = 0;
    if (dictLength >= s.w_size) {
      if (wrap === 0) {
        zero(s.head);
        s.strstart = 0;
        s.block_start = 0;
        s.insert = 0;
      }
      let tmpDict = new Uint8Array(s.w_size);
      tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
      dictionary = tmpDict;
      dictLength = s.w_size;
    }
    const avail = strm.avail_in;
    const next = strm.next_in;
    const input = strm.input;
    strm.avail_in = dictLength;
    strm.next_in = 0;
    strm.input = dictionary;
    fill_window(s);
    while (s.lookahead >= MIN_MATCH) {
      let str = s.strstart;
      let n = s.lookahead - (MIN_MATCH - 1);
      do {
        INSERT_STRING(s, str);
        str++;
      } while (--n);
      s.strstart = str;
      s.lookahead = MIN_MATCH - 1;
      fill_window(s);
    }
    s.strstart += s.lookahead;
    s.block_start = s.strstart;
    s.insert = s.lookahead;
    s.lookahead = 0;
    s.match_length = s.prev_length = MIN_MATCH - 1;
    s.match_available = 0;
    strm.next_in = next;
    strm.input = input;
    strm.avail_in = avail;
    s.wrap = wrap;
    return 0;
  };
  var BAD$1 = 16209;
  var TYPE$1 = 16191;
  function inflate_fast(strm, start) {
    let _in;
    let last;
    let _out;
    let beg;
    let end;
    let dmax;
    let wsize;
    let whave;
    let wnext;
    let s_window;
    let hold;
    let bits;
    let lcode;
    let dcode;
    let lmask;
    let dmask;
    let here;
    let op;
    let len;
    let dist;
    let from;
    let from_source;
    let input, output;
    const state = strm.state;
    _in = strm.next_in;
    input = strm.input;
    last = _in + (strm.avail_in - 5);
    _out = strm.next_out;
    output = strm.output;
    beg = _out - (start - strm.avail_out);
    end = _out + (strm.avail_out - 257);
    dmax = state.dmax;
    wsize = state.wsize;
    whave = state.whave;
    wnext = state.wnext;
    s_window = state.window;
    hold = state.hold;
    bits = state.bits;
    lcode = state.lencode;
    dcode = state.distcode;
    lmask = (1 << state.lenbits) - 1;
    dmask = (1 << state.distbits) - 1;
    top: do {
      if (bits < 15) {
        hold += input[_in++] << bits;
        bits += 8;
        hold += input[_in++] << bits;
        bits += 8;
      }
      here = lcode[hold & lmask];
      dolen: for (; ; ) {
        op = here >>> 24;
        hold >>>= op;
        bits -= op;
        op = here >>> 16 & 255;
        if (op === 0) output[_out++] = here & 65535;
        else if (op & 16) {
          len = here & 65535;
          op &= 15;
          if (op) {
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
            }
            len += hold & (1 << op) - 1;
            hold >>>= op;
            bits -= op;
          }
          if (bits < 15) {
            hold += input[_in++] << bits;
            bits += 8;
            hold += input[_in++] << bits;
            bits += 8;
          }
          here = dcode[hold & dmask];
          dodist: for (; ; ) {
            op = here >>> 24;
            hold >>>= op;
            bits -= op;
            op = here >>> 16 & 255;
            if (op & 16) {
              dist = here & 65535;
              op &= 15;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
                if (bits < op) {
                  hold += input[_in++] << bits;
                  bits += 8;
                }
              }
              dist += hold & (1 << op) - 1;
              if (dist > dmax) {
                strm.msg = "invalid distance too far back";
                state.mode = BAD$1;
                break top;
              }
              hold >>>= op;
              bits -= op;
              op = _out - beg;
              if (dist > op) {
                op = dist - op;
                if (op > whave) {
                  if (state.sane) {
                    strm.msg = "invalid distance too far back";
                    state.mode = BAD$1;
                    break top;
                  }
                }
                from = 0;
                from_source = s_window;
                if (wnext === 0) {
                  from += wsize - op;
                  if (op < len) {
                    len -= op;
                    do
                      output[_out++] = s_window[from++];
                    while (--op);
                    from = _out - dist;
                    from_source = output;
                  }
                } else if (wnext < op) {
                  from += wsize + wnext - op;
                  op -= wnext;
                  if (op < len) {
                    len -= op;
                    do
                      output[_out++] = s_window[from++];
                    while (--op);
                    from = 0;
                    if (wnext < len) {
                      op = wnext;
                      len -= op;
                      do
                        output[_out++] = s_window[from++];
                      while (--op);
                      from = _out - dist;
                      from_source = output;
                    }
                  }
                } else {
                  from += wnext - op;
                  if (op < len) {
                    len -= op;
                    do
                      output[_out++] = s_window[from++];
                    while (--op);
                    from = _out - dist;
                    from_source = output;
                  }
                }
                while (len > 2) {
                  output[_out++] = from_source[from++];
                  output[_out++] = from_source[from++];
                  output[_out++] = from_source[from++];
                  len -= 3;
                }
                if (len) {
                  output[_out++] = from_source[from++];
                  if (len > 1) output[_out++] = from_source[from++];
                }
              } else {
                from = _out - dist;
                do {
                  output[_out++] = output[from++];
                  output[_out++] = output[from++];
                  output[_out++] = output[from++];
                  len -= 3;
                } while (len > 2);
                if (len) {
                  output[_out++] = output[from++];
                  if (len > 1) output[_out++] = output[from++];
                }
              }
            } else if ((op & 64) === 0) {
              here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
              continue dodist;
            } else {
              strm.msg = "invalid distance code";
              state.mode = BAD$1;
              break top;
            }
            break;
          }
        } else if ((op & 64) === 0) {
          here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
          continue dolen;
        } else if (op & 32) {
          state.mode = TYPE$1;
          break top;
        } else {
          strm.msg = "invalid literal/length code";
          state.mode = BAD$1;
          break top;
        }
        break;
      }
    } while (_in < last && _out < end);
    len = bits >> 3;
    _in -= len;
    bits -= len << 3;
    hold &= (1 << bits) - 1;
    strm.next_in = _in;
    strm.next_out = _out;
    strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
    strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
    state.hold = hold;
    state.bits = bits;
  }
  var MAXBITS = 15;
  var ENOUGH_LENS$1 = 852;
  var ENOUGH_DISTS$1 = 592;
  var CODES$1 = 0;
  var LENS$1 = 1;
  var DISTS$1 = 2;
  var lbase = new Uint16Array([
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    13,
    15,
    17,
    19,
    23,
    27,
    31,
    35,
    43,
    51,
    59,
    67,
    83,
    99,
    115,
    131,
    163,
    195,
    227,
    258,
    0,
    0
  ]);
  var lext = new Uint8Array([
    16,
    16,
    16,
    16,
    16,
    16,
    16,
    16,
    17,
    17,
    17,
    17,
    18,
    18,
    18,
    18,
    19,
    19,
    19,
    19,
    20,
    20,
    20,
    20,
    21,
    21,
    21,
    21,
    16,
    199,
    75
  ]);
  var dbase = new Uint16Array([
    1,
    2,
    3,
    4,
    5,
    7,
    9,
    13,
    17,
    25,
    33,
    49,
    65,
    97,
    129,
    193,
    257,
    385,
    513,
    769,
    1025,
    1537,
    2049,
    3073,
    4097,
    6145,
    8193,
    12289,
    16385,
    24577,
    0,
    0
  ]);
  var dext = new Uint8Array([
    16,
    16,
    16,
    16,
    17,
    17,
    18,
    18,
    19,
    19,
    20,
    20,
    21,
    21,
    22,
    22,
    23,
    23,
    24,
    24,
    25,
    25,
    26,
    26,
    27,
    27,
    28,
    28,
    29,
    29,
    64,
    64
  ]);
  var inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) => {
    const bits = opts.bits;
    let len = 0;
    let sym = 0;
    let min = 0, max = 0;
    let root = 0;
    let curr = 0;
    let drop = 0;
    let left = 0;
    let used = 0;
    let huff = 0;
    let incr;
    let fill;
    let low;
    let mask;
    let next;
    let base = null;
    let match;
    const count = /* @__PURE__ */ new Uint16Array(16);
    const offs = /* @__PURE__ */ new Uint16Array(16);
    let extra = null;
    let here_bits, here_op, here_val;
    for (len = 0; len <= MAXBITS; len++) count[len] = 0;
    for (sym = 0; sym < codes; sym++) count[lens[lens_index + sym]]++;
    root = bits;
    for (max = MAXBITS; max >= 1; max--) if (count[max] !== 0) break;
    if (root > max) root = max;
    if (max === 0) {
      table[table_index++] = 20971520;
      table[table_index++] = 20971520;
      opts.bits = 1;
      return 0;
    }
    for (min = 1; min < max; min++) if (count[min] !== 0) break;
    if (root < min) root = min;
    left = 1;
    for (len = 1; len <= MAXBITS; len++) {
      left <<= 1;
      left -= count[len];
      if (left < 0) return -1;
    }
    if (left > 0 && (type === CODES$1 || max !== 1)) return -1;
    offs[1] = 0;
    for (len = 1; len < MAXBITS; len++) offs[len + 1] = offs[len] + count[len];
    for (sym = 0; sym < codes; sym++) if (lens[lens_index + sym] !== 0) work[offs[lens[lens_index + sym]]++] = sym;
    if (type === CODES$1) {
      base = extra = work;
      match = 20;
    } else if (type === LENS$1) {
      base = lbase;
      extra = lext;
      match = 257;
    } else {
      base = dbase;
      extra = dext;
      match = 0;
    }
    huff = 0;
    sym = 0;
    len = min;
    next = table_index;
    curr = root;
    drop = 0;
    low = -1;
    used = 1 << root;
    mask = used - 1;
    if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) return 1;
    for (; ; ) {
      here_bits = len - drop;
      if (work[sym] + 1 < match) {
        here_op = 0;
        here_val = work[sym];
      } else if (work[sym] >= match) {
        here_op = extra[work[sym] - match];
        here_val = base[work[sym] - match];
      } else {
        here_op = 96;
        here_val = 0;
      }
      incr = 1 << len - drop;
      fill = 1 << curr;
      min = fill;
      do {
        fill -= incr;
        table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
      } while (fill !== 0);
      incr = 1 << len - 1;
      while (huff & incr) incr >>= 1;
      if (incr !== 0) {
        huff &= incr - 1;
        huff += incr;
      } else huff = 0;
      sym++;
      if (--count[len] === 0) {
        if (len === max) break;
        len = lens[lens_index + work[sym]];
      }
      if (len > root && (huff & mask) !== low) {
        if (drop === 0) drop = root;
        next += min;
        curr = len - drop;
        left = 1 << curr;
        while (curr + drop < max) {
          left -= count[curr + drop];
          if (left <= 0) break;
          curr++;
          left <<= 1;
        }
        used += 1 << curr;
        if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) return 1;
        low = huff & mask;
        table[low] = root << 24 | curr << 16 | next - table_index | 0;
      }
    }
    if (huff !== 0) table[next + huff] = len - drop << 24 | 4194304;
    opts.bits = root;
    return 0;
  };
  var CODES = 0;
  var LENS = 1;
  var DISTS = 2;
  var HEAD = 16180;
  var FLAGS = 16181;
  var TIME = 16182;
  var OS = 16183;
  var EXLEN = 16184;
  var EXTRA = 16185;
  var NAME = 16186;
  var COMMENT = 16187;
  var HCRC = 16188;
  var DICTID = 16189;
  var DICT = 16190;
  var TYPE = 16191;
  var TYPEDO = 16192;
  var STORED = 16193;
  var COPY_ = 16194;
  var COPY = 16195;
  var TABLE = 16196;
  var LENLENS = 16197;
  var CODELENS = 16198;
  var LEN_ = 16199;
  var LEN = 16200;
  var LENEXT = 16201;
  var DIST = 16202;
  var DISTEXT = 16203;
  var MATCH = 16204;
  var LIT = 16205;
  var CHECK = 16206;
  var LENGTH = 16207;
  var DONE = 16208;
  var BAD = 16209;
  var MEM = 16210;
  var SYNC = 16211;
  var ENOUGH_LENS = 852;
  var ENOUGH_DISTS = 592;
  var zswap32 = (q) => {
    return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
  };
  var InflateState = class {
    constructor() {
      this.strm = null;
      this.mode = 0;
      this.last = false;
      this.wrap = 0;
      this.havedict = false;
      this.flags = 0;
      this.dmax = 0;
      this.check = 0;
      this.total = 0;
      this.head = null;
      this.wbits = 0;
      this.wsize = 0;
      this.whave = 0;
      this.wnext = 0;
      this.window = null;
      this.hold = 0;
      this.bits = 0;
      this.length = 0;
      this.offset = 0;
      this.extra = 0;
      this.lencode = null;
      this.distcode = null;
      this.lenbits = 0;
      this.distbits = 0;
      this.ncode = 0;
      this.nlen = 0;
      this.ndist = 0;
      this.have = 0;
      this.next = null;
      this.lens = /* @__PURE__ */ new Uint16Array(320);
      this.work = /* @__PURE__ */ new Uint16Array(288);
      this.lendyn = null;
      this.distdyn = null;
      this.sane = 0;
      this.back = 0;
      this.was = 0;
    }
  };
  var inflateStateCheck = (strm) => {
    if (!strm) return 1;
    const state = strm.state;
    if (!state || state.strm !== strm || state.mode < HEAD || state.mode > SYNC) return 1;
    return 0;
  };
  var inflateResetKeep = (strm) => {
    if (inflateStateCheck(strm)) return -2;
    const state = strm.state;
    strm.total_in = strm.total_out = state.total = 0;
    strm.msg = "";
    if (state.wrap) strm.adler = state.wrap & 1;
    state.mode = HEAD;
    state.last = 0;
    state.havedict = 0;
    state.flags = -1;
    state.dmax = 32768;
    state.head = null;
    state.hold = 0;
    state.bits = 0;
    state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
    state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);
    state.sane = 1;
    state.back = -1;
    return 0;
  };
  var inflateReset = (strm) => {
    if (inflateStateCheck(strm)) return -2;
    const state = strm.state;
    state.wsize = 0;
    state.whave = 0;
    state.wnext = 0;
    return inflateResetKeep(strm);
  };
  var inflateReset2 = (strm, windowBits) => {
    let wrap;
    if (inflateStateCheck(strm)) return -2;
    const state = strm.state;
    if (windowBits < 0) {
      wrap = 0;
      windowBits = -windowBits;
    } else {
      wrap = (windowBits >> 4) + 5;
      if (windowBits < 48) windowBits &= 15;
    }
    if (windowBits && (windowBits < 8 || windowBits > 15)) return -2;
    if (state.window !== null && state.wbits !== windowBits) state.window = null;
    state.wrap = wrap;
    state.wbits = windowBits;
    return inflateReset(strm);
  };
  var inflateInit2 = (strm, windowBits) => {
    if (!strm) return -2;
    const state = new InflateState();
    strm.state = state;
    state.strm = strm;
    state.window = null;
    state.mode = HEAD;
    const ret = inflateReset2(strm, windowBits);
    if (ret !== 0) strm.state = null;
    return ret;
  };
  var virgin = true;
  var lenfix;
  var distfix;
  var fixedtables = (state) => {
    if (virgin) {
      lenfix = /* @__PURE__ */ new Int32Array(512);
      distfix = /* @__PURE__ */ new Int32Array(32);
      let sym = 0;
      while (sym < 144) state.lens[sym++] = 8;
      while (sym < 256) state.lens[sym++] = 9;
      while (sym < 280) state.lens[sym++] = 7;
      while (sym < 288) state.lens[sym++] = 8;
      inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
      sym = 0;
      while (sym < 32) state.lens[sym++] = 5;
      inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
      virgin = false;
    }
    state.lencode = lenfix;
    state.lenbits = 9;
    state.distcode = distfix;
    state.distbits = 5;
  };
  var updatewindow = (strm, src, end, copy) => {
    let dist;
    const state = strm.state;
    if (state.window === null) state.window = new Uint8Array(1 << state.wbits);
    if (state.wsize === 0) {
      state.wsize = 1 << state.wbits;
      state.wnext = 0;
      state.whave = 0;
    }
    if (copy >= state.wsize) {
      state.window.set(src.subarray(end - state.wsize, end), 0);
      state.wnext = 0;
      state.whave = state.wsize;
    } else {
      dist = state.wsize - state.wnext;
      if (dist > copy) dist = copy;
      state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
      copy -= dist;
      if (copy) {
        state.window.set(src.subarray(end - copy, end), 0);
        state.wnext = copy;
        state.whave = state.wsize;
      } else {
        state.wnext += dist;
        if (state.wnext === state.wsize) state.wnext = 0;
        if (state.whave < state.wsize) state.whave += dist;
      }
    }
    return 0;
  };
  var inflate$1 = (strm, flush) => {
    let state;
    let input, output;
    let next;
    let put;
    let have, left;
    let hold;
    let bits;
    let _in, _out;
    let copy;
    let from;
    let from_source;
    let here = 0;
    let here_bits, here_op, here_val;
    let last_bits, last_op, last_val;
    let len;
    let ret;
    const hbuf = /* @__PURE__ */ new Uint8Array(4);
    let opts;
    let n;
    const order = new Uint8Array([
      16,
      17,
      18,
      0,
      8,
      7,
      9,
      6,
      10,
      5,
      11,
      4,
      12,
      3,
      13,
      2,
      14,
      1,
      15
    ]);
    if (inflateStateCheck(strm) || !strm.output || !strm.input && strm.avail_in !== 0) return -2;
    state = strm.state;
    if (state.mode === TYPE) state.mode = TYPEDO;
    put = strm.next_out;
    output = strm.output;
    left = strm.avail_out;
    next = strm.next_in;
    input = strm.input;
    have = strm.avail_in;
    hold = state.hold;
    bits = state.bits;
    _in = have;
    _out = left;
    ret = 0;
    inf_leave: for (; ; ) switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        while (bits < 16) {
          if (have === 0) break inf_leave;
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        if (state.wrap & 2 && hold === 35615) {
          if (state.wbits === 0) state.wbits = 15;
          state.check = 0;
          hbuf[0] = hold & 255;
          hbuf[1] = hold >>> 8 & 255;
          state.check = crc32(state.check, hbuf, 2, 0);
          hold = 0;
          bits = 0;
          state.mode = FLAGS;
          break;
        }
        if (state.head) state.head.done = false;
        if (!(state.wrap & 1) || (((hold & 255) << 8) + (hold >> 8)) % 31) {
          strm.msg = "incorrect header check";
          state.mode = BAD;
          break;
        }
        if ((hold & 15) !== 8) {
          strm.msg = "unknown compression method";
          state.mode = BAD;
          break;
        }
        hold >>>= 4;
        bits -= 4;
        len = (hold & 15) + 8;
        if (state.wbits === 0) state.wbits = len;
        if (len > 15 || len > state.wbits) {
          strm.msg = "invalid window size";
          state.mode = BAD;
          break;
        }
        state.dmax = 1 << state.wbits;
        state.flags = 0;
        strm.adler = state.check = 1;
        state.mode = hold & 512 ? DICTID : TYPE;
        hold = 0;
        bits = 0;
        break;
      case FLAGS:
        while (bits < 16) {
          if (have === 0) break inf_leave;
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        state.flags = hold;
        if ((state.flags & 255) !== 8) {
          strm.msg = "unknown compression method";
          state.mode = BAD;
          break;
        }
        if (state.flags & 57344) {
          strm.msg = "unknown header flags set";
          state.mode = BAD;
          break;
        }
        if (state.head) state.head.text = hold >> 8 & 1;
        if (state.flags & 512 && state.wrap & 4) {
          hbuf[0] = hold & 255;
          hbuf[1] = hold >>> 8 & 255;
          state.check = crc32(state.check, hbuf, 2, 0);
        }
        hold = 0;
        bits = 0;
        state.mode = TIME;
      case TIME:
        while (bits < 32) {
          if (have === 0) break inf_leave;
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        if (state.head) state.head.time = hold >>> 0;
        if (state.flags & 512 && state.wrap & 4) {
          hbuf[0] = hold & 255;
          hbuf[1] = hold >>> 8 & 255;
          hbuf[2] = hold >>> 16 & 255;
          hbuf[3] = hold >>> 24 & 255;
          state.check = crc32(state.check, hbuf, 4, 0);
        }
        hold = 0;
        bits = 0;
        state.mode = OS;
      case OS:
        while (bits < 16) {
          if (have === 0) break inf_leave;
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        if (state.head) {
          state.head.xflags = hold & 255;
          state.head.os = hold >> 8;
        }
        if (state.flags & 512 && state.wrap & 4) {
          hbuf[0] = hold & 255;
          hbuf[1] = hold >>> 8 & 255;
          state.check = crc32(state.check, hbuf, 2, 0);
        }
        hold = 0;
        bits = 0;
        state.mode = EXLEN;
      case EXLEN:
        if (state.flags & 1024) {
          while (bits < 16) {
            if (have === 0) break inf_leave;
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.length = hold;
          if (state.head) state.head.extra_len = hold;
          if (state.flags & 512 && state.wrap & 4) {
            hbuf[0] = hold & 255;
            hbuf[1] = hold >>> 8 & 255;
            state.check = crc32(state.check, hbuf, 2, 0);
          }
          hold = 0;
          bits = 0;
        } else if (state.head) state.head.extra = null;
        state.mode = EXTRA;
      case EXTRA:
        if (state.flags & 1024) {
          copy = state.length;
          if (copy > have) copy = have;
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) state.head.extra = new Uint8Array(state.head.extra_len);
              state.head.extra.set(input.subarray(next, next + copy), len);
            }
            if (state.flags & 512 && state.wrap & 4) state.check = crc32(state.check, input, copy, next);
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) break inf_leave;
        }
        state.length = 0;
        state.mode = NAME;
      case NAME:
        if (state.flags & 2048) {
          if (have === 0) break inf_leave;
          copy = 0;
          do {
            len = input[next + copy++];
            if (state.head && len && state.length < 65536) state.head.name += String.fromCharCode(len);
          } while (len && copy < have);
          if (state.flags & 512 && state.wrap & 4) state.check = crc32(state.check, input, copy, next);
          have -= copy;
          next += copy;
          if (len) break inf_leave;
        } else if (state.head) state.head.name = null;
        state.length = 0;
        state.mode = COMMENT;
      case COMMENT:
        if (state.flags & 4096) {
          if (have === 0) break inf_leave;
          copy = 0;
          do {
            len = input[next + copy++];
            if (state.head && len && state.length < 65536) state.head.comment += String.fromCharCode(len);
          } while (len && copy < have);
          if (state.flags & 512 && state.wrap & 4) state.check = crc32(state.check, input, copy, next);
          have -= copy;
          next += copy;
          if (len) break inf_leave;
        } else if (state.head) state.head.comment = null;
        state.mode = HCRC;
      case HCRC:
        if (state.flags & 512) {
          while (bits < 16) {
            if (have === 0) break inf_leave;
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state.wrap & 4 && hold !== (state.check & 65535)) {
            strm.msg = "header crc mismatch";
            state.mode = BAD;
            break;
          }
          hold = 0;
          bits = 0;
        }
        if (state.head) {
          state.head.hcrc = state.flags >> 9 & 1;
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE;
        break;
      case DICTID:
        while (bits < 32) {
          if (have === 0) break inf_leave;
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        strm.adler = state.check = zswap32(hold);
        hold = 0;
        bits = 0;
        state.mode = DICT;
      case DICT:
        if (state.havedict === 0) {
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          return 2;
        }
        strm.adler = state.check = 1;
        state.mode = TYPE;
      case TYPE:
        if (flush === 5 || flush === 6) break inf_leave;
      case TYPEDO:
        if (state.last) {
          hold >>>= bits & 7;
          bits -= bits & 7;
          state.mode = CHECK;
          break;
        }
        while (bits < 3) {
          if (have === 0) break inf_leave;
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        state.last = hold & 1;
        hold >>>= 1;
        bits -= 1;
        switch (hold & 3) {
          case 0:
            state.mode = STORED;
            break;
          case 1:
            fixedtables(state);
            state.mode = LEN_;
            if (flush === 6) {
              hold >>>= 2;
              bits -= 2;
              break inf_leave;
            }
            break;
          case 2:
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = "invalid block type";
            state.mode = BAD;
        }
        hold >>>= 2;
        bits -= 2;
        break;
      case STORED:
        hold >>>= bits & 7;
        bits -= bits & 7;
        while (bits < 32) {
          if (have === 0) break inf_leave;
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
          strm.msg = "invalid stored block lengths";
          state.mode = BAD;
          break;
        }
        state.length = hold & 65535;
        hold = 0;
        bits = 0;
        state.mode = COPY_;
        if (flush === 6) break inf_leave;
      case COPY_:
        state.mode = COPY;
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) copy = have;
          if (copy > left) copy = left;
          if (copy === 0) break inf_leave;
          output.set(input.subarray(next, next + copy), put);
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        state.mode = TYPE;
        break;
      case TABLE:
        while (bits < 14) {
          if (have === 0) break inf_leave;
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        state.nlen = (hold & 31) + 257;
        hold >>>= 5;
        bits -= 5;
        state.ndist = (hold & 31) + 1;
        hold >>>= 5;
        bits -= 5;
        state.ncode = (hold & 15) + 4;
        hold >>>= 4;
        bits -= 4;
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = "too many length or distance symbols";
          state.mode = BAD;
          break;
        }
        state.have = 0;
        state.mode = LENLENS;
      case LENLENS:
        while (state.have < state.ncode) {
          while (bits < 3) {
            if (have === 0) break inf_leave;
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.lens[order[state.have++]] = hold & 7;
          hold >>>= 3;
          bits -= 3;
        }
        while (state.have < 19) state.lens[order[state.have++]] = 0;
        state.lencode = state.lendyn;
        state.lenbits = 7;
        opts = { bits: state.lenbits };
        ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;
        if (ret) {
          strm.msg = "invalid code lengths set";
          state.mode = BAD;
          break;
        }
        state.have = 0;
        state.mode = CODELENS;
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (; ; ) {
            here = state.lencode[hold & (1 << state.lenbits) - 1];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (here_bits <= bits) break;
            if (have === 0) break inf_leave;
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (here_val < 16) {
            hold >>>= here_bits;
            bits -= here_bits;
            state.lens[state.have++] = here_val;
          } else {
            if (here_val === 16) {
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) break inf_leave;
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              if (state.have === 0) {
                strm.msg = "invalid bit length repeat";
                state.mode = BAD;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 3);
              hold >>>= 2;
              bits -= 2;
            } else if (here_val === 17) {
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) break inf_leave;
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              len = 0;
              copy = 3 + (hold & 7);
              hold >>>= 3;
              bits -= 3;
            } else {
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) break inf_leave;
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              len = 0;
              copy = 11 + (hold & 127);
              hold >>>= 7;
              bits -= 7;
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = "invalid bit length repeat";
              state.mode = BAD;
              break;
            }
            while (copy--) state.lens[state.have++] = len;
          }
        }
        if (state.mode === BAD) break;
        if (state.lens[256] === 0) {
          strm.msg = "invalid code -- missing end-of-block";
          state.mode = BAD;
          break;
        }
        state.lenbits = 9;
        opts = { bits: state.lenbits };
        ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;
        if (ret) {
          strm.msg = "invalid literal/lengths set";
          state.mode = BAD;
          break;
        }
        state.distbits = 6;
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        state.distbits = opts.bits;
        if (ret) {
          strm.msg = "invalid distances set";
          state.mode = BAD;
          break;
        }
        state.mode = LEN_;
        if (flush === 6) break inf_leave;
      case LEN_:
        state.mode = LEN;
      case LEN:
        if (have >= 6 && left >= 258) {
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          inflate_fast(strm, _out);
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          if (state.mode === TYPE) state.back = -1;
          break;
        }
        state.back = 0;
        for (; ; ) {
          here = state.lencode[hold & (1 << state.lenbits) - 1];
          here_bits = here >>> 24;
          here_op = here >>> 16 & 255;
          here_val = here & 65535;
          if (here_bits <= bits) break;
          if (have === 0) break inf_leave;
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        if (here_op && (here_op & 240) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (; ; ) {
            here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (last_bits + here_bits <= bits) break;
            if (have === 0) break inf_leave;
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          hold >>>= last_bits;
          bits -= last_bits;
          state.back += last_bits;
        }
        hold >>>= here_bits;
        bits -= here_bits;
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          state.back = -1;
          state.mode = TYPE;
          break;
        }
        if (here_op & 64) {
          strm.msg = "invalid literal/length code";
          state.mode = BAD;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
      case LENEXT:
        if (state.extra) {
          n = state.extra;
          while (bits < n) {
            if (have === 0) break inf_leave;
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.length += hold & (1 << state.extra) - 1;
          hold >>>= state.extra;
          bits -= state.extra;
          state.back += state.extra;
        }
        state.was = state.length;
        state.mode = DIST;
      case DIST:
        for (; ; ) {
          here = state.distcode[hold & (1 << state.distbits) - 1];
          here_bits = here >>> 24;
          here_op = here >>> 16 & 255;
          here_val = here & 65535;
          if (here_bits <= bits) break;
          if (have === 0) break inf_leave;
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        if ((here_op & 240) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (; ; ) {
            here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
            here_bits = here >>> 24;
            here_op = here >>> 16 & 255;
            here_val = here & 65535;
            if (last_bits + here_bits <= bits) break;
            if (have === 0) break inf_leave;
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          hold >>>= last_bits;
          bits -= last_bits;
          state.back += last_bits;
        }
        hold >>>= here_bits;
        bits -= here_bits;
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = "invalid distance code";
          state.mode = BAD;
          break;
        }
        state.offset = here_val;
        state.extra = here_op & 15;
        state.mode = DISTEXT;
      case DISTEXT:
        if (state.extra) {
          n = state.extra;
          while (bits < n) {
            if (have === 0) break inf_leave;
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          state.offset += hold & (1 << state.extra) - 1;
          hold >>>= state.extra;
          bits -= state.extra;
          state.back += state.extra;
        }
        if (state.offset > state.dmax) {
          strm.msg = "invalid distance too far back";
          state.mode = BAD;
          break;
        }
        state.mode = MATCH;
      case MATCH:
        if (left === 0) break inf_leave;
        copy = _out - left;
        if (state.offset > copy) {
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = "invalid distance too far back";
              state.mode = BAD;
              break;
            }
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          } else from = state.wnext - copy;
          if (copy > state.length) copy = state.length;
          from_source = state.window;
        } else {
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) copy = left;
        left -= copy;
        state.length -= copy;
        do
          output[put++] = from_source[from++];
        while (--copy);
        if (state.length === 0) state.mode = LEN;
        break;
      case LIT:
        if (left === 0) break inf_leave;
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          while (bits < 32) {
            if (have === 0) break inf_leave;
            have--;
            hold |= input[next++] << bits;
            bits += 8;
          }
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if (state.wrap & 4 && _out) strm.adler = state.check = state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
          _out = left;
          if (state.wrap & 4 && (state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = "incorrect data check";
            state.mode = BAD;
            break;
          }
          hold = 0;
          bits = 0;
        }
        state.mode = LENGTH;
      case LENGTH:
        if (state.wrap && state.flags) {
          while (bits < 32) {
            if (have === 0) break inf_leave;
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          if (state.wrap & 4 && hold !== (state.total & 4294967295)) {
            strm.msg = "incorrect length check";
            state.mode = BAD;
            break;
          }
          hold = 0;
          bits = 0;
        }
        state.mode = DONE;
      case DONE:
        ret = 1;
        break inf_leave;
      case BAD:
        ret = -3;
        break inf_leave;
      case MEM:
        return -4;
      case SYNC:
      default:
        return -2;
    }
    strm.next_out = put;
    strm.avail_out = left;
    strm.next_in = next;
    strm.avail_in = have;
    state.hold = hold;
    state.bits = bits;
    if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== 4)) {
      if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
        state.mode = MEM;
        return -4;
      }
    }
    _in -= strm.avail_in;
    _out -= strm.avail_out;
    strm.total_in += _in;
    strm.total_out += _out;
    state.total += _out;
    if (state.wrap & 4 && _out) strm.adler = state.check = state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
    strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
    if ((_in === 0 && _out === 0 || flush === 4) && ret === 0) ret = -5;
    return ret;
  };
  var inflateEnd = (strm) => {
    if (inflateStateCheck(strm)) return -2;
    let state = strm.state;
    if (state.window) state.window = null;
    strm.state = null;
    return 0;
  };
  var inflateSetDictionary = (strm, dictionary) => {
    const dictLength = dictionary.length;
    let state;
    let dictid;
    let ret;
    if (inflateStateCheck(strm)) return -2;
    state = strm.state;
    if (state.wrap !== 0 && state.mode !== DICT) return -2;
    if (state.mode === DICT) {
      dictid = 1;
      dictid = adler32(dictid, dictionary, dictLength, 0);
      if (dictid !== state.check) return -3;
    }
    ret = updatewindow(strm, dictionary, dictLength, dictLength);
    if (ret) {
      state.mode = MEM;
      return -4;
    }
    state.havedict = 1;
    return 0;
  };
  var ZStream = class {
    constructor() {
      this.input = null;
      this.next_in = 0;
      this.avail_in = 0;
      this.total_in = 0;
      this.output = null;
      this.next_out = 0;
      this.avail_out = 0;
      this.total_out = 0;
      this.msg = "";
      this.state = null;
      this.data_type = 2;
      this.adler = 0;
    }
  };
  var flattenChunks = (chunks) => {
    const result = new Uint8Array(chunks.reduce((len, chunk2) => len + chunk2.length, 0));
    let pos = 0;
    for (const chunk2 of chunks) {
      result.set(chunk2, pos);
      pos += chunk2.length;
    }
    return result;
  };
  var toString$1 = Object.prototype.toString;
  var defaultOptions$1 = {
    level: -1,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: 0,
    raw: false,
    gzip: false,
    legacyHash: false,
    dictionary: /* @__PURE__ */ new Uint8Array(0)
  };
  var Deflate = class {
    options;
    /**
    * Error code after deflate finishes. {@link Z_OK} on success.
    * You will not need it in real life, because deflate errors
    * are possible only on wrong options or bad custom `onData` / `onEnd`
    * handlers.
    */
    err;
    /** Error message, if {@link Deflate.err} is not {@link Z_OK}. */
    msg;
    ended;
    started;
    /**
    * Chunks of output data, if {@link Deflate.onData} not overridden.
    * @internal
    */
    chunks;
    strm;
    /**
    * Compressed result, generated by default {@link Deflate.onData}
    * and {@link Deflate.onEnd} handlers. Filled after you push last chunk
    * (call {@link Deflate.push} with {@link Z_FINISH} / `true` param).
    */
    result;
    /**
    * Creates a new deflator instance with the specified params. Throws an
    * exception on bad params. See {@link DeflateOptions} for the list of
    * supported options.
    *
    * @example
    * ```javascript
    * import { Deflate } from 'pako'
    *
    * const chunk1 = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9])
    * const chunk2 = new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
    *
    * const deflate = new Deflate({ level: 3 })
    *
    * deflate.push(chunk1, false)
    * deflate.push(chunk2, true)  // true -> last chunk
    *
    * if (deflate.err) throw new Error(deflate.err)
    *
    * console.log(deflate.result)
    * ```
    */
    constructor(options = {}) {
      this.options = Object.assign({}, defaultOptions$1, options);
      const opt = this.options;
      if (opt.raw && opt.windowBits > 0) opt.windowBits = -opt.windowBits;
      else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) opt.windowBits += 16;
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.started = false;
      this.chunks = [];
      this.result = /* @__PURE__ */ new Uint8Array(0);
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      let status = deflateInit2(this.strm, opt.level, 8, opt.windowBits, opt.memLevel, opt.strategy, opt.legacyHash);
      if (status !== 0) throw new Error(messages_default[status]);
      if (toString$1.call(opt.dictionary) === "[object ArrayBuffer]") opt.dictionary = new Uint8Array(opt.dictionary);
      const dictionary = opt.dictionary;
      if (dictionary.length) {
        if (opt.gzip) throw new Error("dictionary is not supported with gzip");
        status = deflateSetDictionary(this.strm, dictionary);
        if (status !== 0) throw new Error(messages_default[status]);
      }
    }
    /**
    * Sends input data to the deflate pipe, generating {@link Deflate.onData} calls
    * with new compressed chunks. Returns `true` on success. The last data block must
    * have `flush_mode` {@link Z_FINISH} (or `true`). That will flush the internal
    * pending buffers and call {@link Deflate.onEnd}.
    *
    * On failure, calls {@link Deflate.onEnd} with the error code and returns false.
    *
    * @param data input data. Strings will be converted to utf8 byte sequence.
    * @param flush_mode 0..6 for corresponding {@link Z_NO_FLUSH}..{@link Z_TREES} modes.
    *   See constants. Skipped or `false` means {@link Z_NO_FLUSH}, `true` means {@link Z_FINISH}.
    *
    * @example
    * ```javascript
    * push(chunk, false) // push one of data chunks
    * ...
    * push(chunk, true)  // push last chunk
    * ```
    */
    push(data, flush_mode = false) {
      const strm = this.strm;
      const chunkSize = this.options.chunkSize;
      let status;
      let _flush_mode;
      if (this.ended) return false;
      if (typeof flush_mode === "number") _flush_mode = flush_mode;
      else _flush_mode = flush_mode === true ? 4 : 0;
      if (typeof data === "string") strm.input = new TextEncoder().encode(data);
      else if (toString$1.call(data) === "[object ArrayBuffer]") strm.input = new Uint8Array(data);
      else strm.input = data;
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      if (!this.started) {
        this.started = true;
        this.onStart(strm);
      }
      for (; ; ) {
        if (strm.avail_out === 0) {
          strm.output = new Uint8Array(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        if ((_flush_mode === 2 || _flush_mode === 3) && strm.avail_out <= 6) {
          this.onData(strm.output.subarray(0, strm.next_out));
          strm.avail_out = 0;
          continue;
        }
        status = deflate$1(strm, _flush_mode);
        if (status === -2) break;
        if (status === 1) {
          if (strm.next_out > 0) this.onData(strm.output.subarray(0, strm.next_out));
          status = deflateEnd(this.strm);
          break;
        }
        if (strm.avail_out === 0) {
          this.onData(strm.output);
          continue;
        }
        if (_flush_mode > 0 && strm.next_out > 0) {
          this.onData(strm.output.subarray(0, strm.next_out));
          strm.avail_out = 0;
          continue;
        }
        if (strm.avail_in === 0) return true;
      }
      this.err = status;
      this.msg = strm.msg || messages_default[status];
      this.ended = true;
      this.onEnd(status);
      return status === 0;
    }
    /**
    * Called once before the first low-level deflate call.
    */
    onStart(strm) {
    }
    /**
    * By default, stores data blocks in the {@link Deflate.chunks} property and glues
    * them in {@link Deflate.onEnd}. Override this handler if you need another behaviour.
    */
    onData(chunk2) {
      this.chunks.push(chunk2);
    }
    /**
    * Called once after you tell deflate that the input stream is
    * complete ({@link Z_FINISH}). By default, joins the collected {@link Deflate.chunks}
    * into the {@link Deflate.result} property.
    *
    * @param status deflate status. {@link Z_OK} on success, other if not.
    */
    onEnd(status) {
      if (status === 0) this.result = flattenChunks(this.chunks);
      this.chunks = [];
    }
  };
  function deflate(input, options = {}) {
    const deflator = new Deflate(options);
    deflator.push(input, true);
    if (deflator.err) throw new Error(deflator.msg);
    return deflator.result;
  }
  var toString = Object.prototype.toString;
  var defaultOptions = {
    chunkSize: 1024 * 64,
    windowBits: 15,
    raw: false,
    dictionary: /* @__PURE__ */ new Uint8Array(0)
  };
  var Inflate = class {
    options;
    /**
    * Error code after inflate finishes. {@link Z_OK} on success.
    * Should be checked when broken data is possible.
    */
    err;
    /** Error message, if {@link Inflate.err} is not {@link Z_OK}. */
    msg;
    /**
    * `true` once the compressed stream has ended. A stream may end before the
    * caller's data does (trailing bytes), so check this to know when to stop
    * pushing - further {@link Inflate.push} calls are no-ops.
    */
    ended;
    started;
    /**
    * Chunks of output data, if {@link Inflate.onData} not overridden.
    * @internal
    */
    chunks;
    strm;
    /**
    * Uncompressed result, generated by default {@link Inflate.onData}
    * and {@link Inflate.onEnd} handlers. Filled after you push last chunk
    * (call {@link Inflate.push} with {@link Z_FINISH} / `true` param).
    */
    result;
    /**
    * Creates a new inflator instance with the specified params. Throws an
    * exception on bad params. See {@link InflateOptions} for the list of
    * supported options.
    *
    * By default, when no options are set, the deflate/gzip data format is
    * autodetected via the wrapper header.
    *
    * @example
    * ```javascript
    * import { Inflate } from 'pako'
    *
    * const chunk1 = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9])
    * const chunk2 = new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
    *
    * const inflate = new Inflate({ level: 3 })
    *
    * inflate.push(chunk1, false)
    * inflate.push(chunk2, true)  // true -> last chunk
    *
    * if (inflate.err) throw new Error(inflate.err)
    *
    * console.log(inflate.result)
    * ```
    */
    constructor(options = {}) {
      this.options = Object.assign({}, defaultOptions, options);
      const opt = this.options;
      if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
        opt.windowBits = -opt.windowBits;
        if (opt.windowBits === 0) opt.windowBits = -15;
      }
      if (opt.windowBits >= 0 && opt.windowBits < 16 && !options.windowBits) opt.windowBits += 32;
      if (opt.windowBits > 15 && opt.windowBits < 48) {
        if ((opt.windowBits & 15) === 0) opt.windowBits |= 15;
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.started = false;
      this.chunks = [];
      this.result = /* @__PURE__ */ new Uint8Array(0);
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      let status = inflateInit2(this.strm, opt.windowBits);
      if (status !== 0) throw new Error(messages_default[status]);
      if (toString.call(opt.dictionary) === "[object ArrayBuffer]") opt.dictionary = new Uint8Array(opt.dictionary);
      const dictionary = opt.dictionary;
      if (opt.raw && dictionary.length) {
        status = inflateSetDictionary(this.strm, dictionary);
        if (status !== 0) throw new Error(messages_default[status]);
      }
    }
    /**
    * Sends input data to the inflate pipe, generating {@link Inflate.onData} calls
    * with new output chunks. Returns `true` on success. If end of stream is
    * detected, {@link Inflate.onEnd} will be called.
    *
    * `flush_mode` is not needed for normal operation, because end of stream
    * is detected automatically. Pass {@link Z_SYNC_FLUSH} to force the decoder
    * to emit all currently available output — handy when you need to decode
    * data frame-by-frame from a long-running stream.
    *
    * On failure, calls {@link Inflate.onEnd} with the error code and returns false.
    *
    * Once the stream has ended (a compressed stream may end before your data
    * does), further `push` calls are no-ops and return whether the decode
    * finished successfully. The final outcome is in {@link Inflate.result},
    * {@link Inflate.err} and {@link Inflate.msg}.
    *
    * @param flush_mode 0..6 for corresponding {@link Z_NO_FLUSH}..{@link Z_TREES}
    *   flush modes. See constants. Skipped or `false` means {@link Z_NO_FLUSH},
    *   `true` means {@link Z_FINISH}.
    *
    * @example
    * ```javascript
    * push(chunk, false) // push one of data chunks
    * ...
    * push(chunk, true)  // push last chunk
    * ```
    */
    push(data, flush_mode = false) {
      const strm = this.strm;
      const chunkSize = this.options.chunkSize;
      let status;
      let _flush_mode;
      let last_avail_out;
      if (this.ended) return this.err === 0;
      if (typeof flush_mode === "number") _flush_mode = flush_mode;
      else _flush_mode = flush_mode === true ? 4 : 0;
      if (toString.call(data) === "[object ArrayBuffer]") strm.input = new Uint8Array(data);
      else strm.input = data;
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      if (!this.started) {
        this.started = true;
        this.onStart(strm);
      }
      for (; ; ) {
        if (strm.avail_out === 0) {
          strm.output = new Uint8Array(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status = inflate$1(strm, _flush_mode);
        if (status === 2) {
          const dictionary = this.options.dictionary;
          if (dictionary.length) {
            status = inflateSetDictionary(strm, dictionary);
            if (status === 0) status = inflate$1(strm, _flush_mode);
            else if (status === -3) status = 2;
          }
        }
        while (strm.avail_in > 0 && status === 1 && strm.state.wrap & 2 && strm.state.flags !== 0 && strm.input[strm.next_in] !== 0) {
          inflateReset(strm);
          status = inflate$1(strm, _flush_mode);
        }
        if (status === -2 || status === -3 || status === 2 || status === -4) break;
        last_avail_out = strm.avail_out;
        if (strm.next_out) {
          if (strm.avail_out === 0 || status === 1 || _flush_mode > 0) {
            this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
            strm.avail_out = 0;
            strm.next_out = 0;
          }
        }
        if ((status === 0 || status === -5) && last_avail_out === 0) continue;
        if (status === 1) {
          status = inflateEnd(this.strm);
          break;
        }
        if (strm.avail_in === 0) {
          if (_flush_mode === 4) {
            status = inflateEnd(this.strm);
            if (status === 0) status = -5;
            break;
          }
          return true;
        }
      }
      this.err = status;
      this.msg = strm.msg || messages_default[status];
      this.ended = true;
      this.onEnd(status);
      return status === 0;
    }
    /**
    * Called once before the first low-level inflate call.
    *
    * Override this handler to attach low-level inflate state, for example to read
    * gzip header metadata:
    *
    * ```javascript
    * import { Inflate, GZheader, zlibInflateGetHeader } from 'pako'
    *
    * const inflator = new Inflate()
    *
    * inflator.onStart = function (strm) {
    *   this.header = new GZheader()
    *   zlibInflateGetHeader(strm, this.header)
    * }
    *
    * inflator.push(data, true)
    * console.log(inflator.header.name)
    * ```
    */
    onStart(strm) {
    }
    /**
    * By default, stores data blocks in the {@link Inflate.chunks} property and glues
    * them in {@link Inflate.onEnd}. Override this handler if you need another behaviour.
    *
    * @param chunk output data.
    */
    onData(chunk2) {
      this.chunks.push(chunk2);
    }
    /**
    * Called after you tell inflate that the input stream is
    * complete ({@link Z_FINISH}). By default, joins the collected {@link Inflate.chunks},
    * frees memory and fills the {@link Inflate.result} property.
    *
    * @param status inflate status. {@link Z_OK} on success, other if not.
    */
    onEnd(status) {
      if (status === 0) this.result = flattenChunks(this.chunks);
      this.chunks = [];
    }
  };
  function inflate(input, options = {}) {
    const inflator = new Inflate(options);
    inflator.push(input, true);
    if (inflator.err) throw new Error(inflator.msg);
    const result = inflator.result;
    return options.toText ? new TextDecoder().decode(result) : result;
  }
  function inflateRaw(input, options = {}) {
    return inflate(input, {
      ...options,
      raw: true
    });
  }

  // browser/shim-zlib.js
  function inflateSync(buf) {
    return import_buffer.Buffer.from(inflate(toU8(buf)));
  }
  function inflateRawSync(buf) {
    return import_buffer.Buffer.from(inflateRaw(toU8(buf)));
  }
  function deflateSync(buf) {
    return import_buffer.Buffer.from(deflate(toU8(buf)));
  }
  function toU8(buf) {
    return buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  }
  var shim_zlib_default = { inflateSync, inflateRawSync, deflateSync };

  // src/filters.js
  function decodeStream(stream, resolve = (x) => x) {
    let data = import_buffer.Buffer.from(stream.raw);
    const filters = normalizeToList(resolve(dictGet(stream.dict, "Filter")), resolve);
    const parmsList = normalizeToList(resolve(dictGet(stream.dict, "DecodeParms")), resolve);
    const steps = [];
    for (let i = 0; i < filters.length; i++) {
      const f = filters[i];
      if (!isName(f)) throw new Error(`Unsupported /Filter entry: ${describe(f)}`);
      const parms = resolve(parmsList[i]);
      data = applyFilter(f.name, data, parms, resolve);
      steps.push(f.name);
    }
    return { data, filters: steps };
  }
  function normalizeToList(obj, resolve) {
    if (obj == null) return [];
    if (isArray(obj)) return obj.items.map(resolve);
    return [obj];
  }
  function applyFilter(name, data, parms, resolve) {
    switch (name) {
      case "FlateDecode":
      case "Fl":
        return applyPredictor(inflate2(data), parms, resolve);
      case "LZWDecode":
      case "LZW":
        return applyPredictor(lzwDecode(data, predictorEarlyChange(parms, resolve)), parms, resolve);
      case "ASCIIHexDecode":
      case "AHx":
        return asciiHexDecode(data);
      case "ASCII85Decode":
      case "A85":
        return ascii85Decode(data);
      case "RunLengthDecode":
      case "RL":
        return runLengthDecode(data);
      default:
        throw new Error(`Filter not decoded: ${name}`);
    }
  }
  function inflate2(data) {
    try {
      return shim_zlib_default.inflateSync(data);
    } catch {
      try {
        return shim_zlib_default.inflateRawSync(data);
      } catch {
        return shim_zlib_default.inflateSync(data.subarray(1));
      }
    }
  }
  function num(obj, resolve, dflt) {
    const v = resolve(obj);
    return typeof v === "number" ? v : dflt;
  }
  function predictorEarlyChange(parms, resolve) {
    if (!isDict(parms)) return 1;
    return num(dictGet(parms, "EarlyChange"), resolve, 1);
  }
  function applyPredictor(data, parms, resolve) {
    if (!isDict(parms)) return data;
    const predictor = num(dictGet(parms, "Predictor"), resolve, 1);
    if (predictor <= 1) return data;
    const colors = num(dictGet(parms, "Colors"), resolve, 1);
    const bpc = num(dictGet(parms, "BitsPerComponent"), resolve, 8);
    const columns = num(dictGet(parms, "Columns"), resolve, 1);
    const bytesPerPixel = Math.max(1, Math.ceil(colors * bpc / 8));
    const rowLen = Math.ceil(colors * bpc * columns / 8);
    if (predictor === 2) return tiffPredictor(data, rowLen, bytesPerPixel);
    return pngPredictor(data, rowLen, bytesPerPixel);
  }
  function pngPredictor(data, rowLen, bpp) {
    const out = [];
    let prev = import_buffer.Buffer.alloc(rowLen);
    let p = 0;
    while (p + 1 + rowLen <= data.length) {
      const type = data[p++];
      const row = import_buffer.Buffer.from(data.subarray(p, p + rowLen));
      p += rowLen;
      for (let i = 0; i < rowLen; i++) {
        const a = i >= bpp ? row[i - bpp] : 0;
        const b = prev[i];
        const c = i >= bpp ? prev[i - bpp] : 0;
        let v = row[i];
        switch (type) {
          case 0:
            break;
          // None
          case 1:
            v = v + a & 255;
            break;
          // Sub
          case 2:
            v = v + b & 255;
            break;
          // Up
          case 3:
            v = v + (a + b >> 1) & 255;
            break;
          // Average
          case 4:
            v = v + paeth(a, b, c) & 255;
            break;
          // Paeth
          default:
            break;
        }
        row[i] = v;
      }
      out.push(row);
      prev = row;
    }
    return import_buffer.Buffer.concat(out);
  }
  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  }
  function tiffPredictor(data, rowLen, bpp) {
    const out = import_buffer.Buffer.from(data);
    for (let r = 0; r + rowLen <= out.length; r += rowLen) {
      for (let i = bpp; i < rowLen; i++) {
        out[r + i] = out[r + i] + out[r + i - bpp] & 255;
      }
    }
    return out;
  }
  function asciiHexDecode(data) {
    const nibbles = [];
    for (const b of data) {
      if (b === 62) break;
      if (b === 32 || b === 9 || b === 10 || b === 13 || b === 12 || b === 0) continue;
      const n = parseInt(String.fromCharCode(b), 16);
      if (Number.isNaN(n)) throw new Error("ASCIIHexDecode: bad digit");
      nibbles.push(n);
    }
    if (nibbles.length % 2) nibbles.push(0);
    const out = import_buffer.Buffer.alloc(nibbles.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = nibbles[2 * i] << 4 | nibbles[2 * i + 1];
    return out;
  }
  function ascii85Decode(data) {
    const out = [];
    let tuple = [];
    let i = 0;
    if (data[0] === 60 && data[1] === 126) i = 2;
    for (; i < data.length; i++) {
      const b = data[i];
      if (b === 126) break;
      if (b === 32 || b === 9 || b === 10 || b === 13 || b === 12 || b === 0) continue;
      if (b === 122 && tuple.length === 0) {
        out.push(0, 0, 0, 0);
        continue;
      }
      tuple.push(b - 33);
      if (tuple.length === 5) {
        let v = 0;
        for (const t of tuple) v = v * 85 + t;
        out.push(v >>> 24 & 255, v >>> 16 & 255, v >>> 8 & 255, v & 255);
        tuple = [];
      }
    }
    if (tuple.length > 0) {
      const n = tuple.length;
      while (tuple.length < 5) tuple.push(84);
      let v = 0;
      for (const t of tuple) v = v * 85 + t;
      const bytes = [v >>> 24 & 255, v >>> 16 & 255, v >>> 8 & 255, v & 255];
      for (let k = 0; k < n - 1; k++) out.push(bytes[k]);
    }
    return import_buffer.Buffer.from(out);
  }
  function runLengthDecode(data) {
    const out = [];
    let i = 0;
    while (i < data.length) {
      const len = data[i++];
      if (len === 128) break;
      if (len < 128) {
        for (let j = 0; j <= len && i < data.length; j++) out.push(data[i++]);
      } else {
        const b = data[i++];
        for (let j = 0; j < 257 - len; j++) out.push(b);
      }
    }
    return import_buffer.Buffer.from(out);
  }
  function lzwDecode(data, earlyChange = 1) {
    const out = [];
    let table = [];
    const reset = () => {
      table = [];
      for (let i = 0; i < 256; i++) table.push([i]);
      table.push(null);
      table.push(null);
    };
    reset();
    let codeWidth = 9;
    let prev = null;
    let bitBuf = 0;
    let bitCnt = 0;
    let p = 0;
    for (; ; ) {
      while (bitCnt < codeWidth && p < data.length) {
        bitBuf = bitBuf << 8 | data[p++];
        bitCnt += 8;
      }
      if (bitCnt < codeWidth) break;
      const code = bitBuf >> bitCnt - codeWidth & (1 << codeWidth) - 1;
      bitCnt -= codeWidth;
      if (code === 256) {
        reset();
        codeWidth = 9;
        prev = null;
        continue;
      }
      if (code === 257) break;
      let entry;
      if (code < table.length && table[code]) {
        entry = table[code];
      } else if (prev) {
        entry = prev.concat(prev[0]);
      } else {
        break;
      }
      for (const b of entry) out.push(b);
      if (prev) {
        table.push(prev.concat(entry[0]));
      }
      prev = entry;
      if (table.length + earlyChange - 1 >= 1 << codeWidth && codeWidth < 12) codeWidth++;
    }
    return import_buffer.Buffer.from(out);
  }
  function describe(obj) {
    if (obj == null) return String(obj);
    if (typeof obj === "object" && obj.kind) return obj.kind + (obj.name ? ` /${obj.name}` : "");
    return String(obj);
  }

  // src/crypt.js
  init_buffer_inject();

  // browser/shim-crypto.js
  init_buffer_inject();
  function unavailable() {
    throw new Error("crypto unavailable in the browser reader");
  }
  function createHash() {
    unavailable();
  }
  function createDecipheriv() {
    unavailable();
  }
  function createCipheriv() {
    unavailable();
  }
  var shim_crypto_default = { createHash, createDecipheriv, createCipheriv };

  // src/crypt.js
  var PAD = import_buffer.Buffer.from([
    40,
    191,
    78,
    94,
    78,
    117,
    138,
    65,
    100,
    0,
    78,
    86,
    255,
    250,
    1,
    8,
    46,
    46,
    0,
    182,
    208,
    104,
    62,
    128,
    47,
    12,
    169,
    254,
    100,
    83,
    105,
    122
  ]);
  var StandardSecurity = class {
    constructor(doc, password = "") {
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
      const enc = this.doc.resolve(dictGet(this.doc.trailer, "Encrypt"));
      if (!isDict(enc)) throw new Error("no /Encrypt dictionary");
      const filter = this.doc.resolve(dictGet(enc, "Filter"));
      if (!isName(filter) || filter.name !== "Standard") {
        throw new Error(`unsupported security handler /${filter && filter.name}`);
      }
      this.V = numOf(this.doc.resolve(dictGet(enc, "V")), 0);
      this.R = numOf(this.doc.resolve(dictGet(enc, "R")), 0);
      this.P = numOf(this.doc.resolve(dictGet(enc, "P")), 0) | 0;
      this.length = numOf(this.doc.resolve(dictGet(enc, "Length")), 40);
      this.O = strBytes(this.doc.resolve(dictGet(enc, "O")));
      this.U = strBytes(this.doc.resolve(dictGet(enc, "U")));
      this.encryptMetadata = this.doc.resolve(dictGet(enc, "EncryptMetadata")) !== false;
      const idArr = this.doc.resolve(dictGet(this.doc.trailer, "ID"));
      this.idBytes = isArray(idArr) && idArr.items[0]?.kind === "string" ? import_buffer.Buffer.from(idArr.items[0].bytes) : import_buffer.Buffer.alloc(0);
      this.strCipher = "rc4";
      this.stmCipher = "rc4";
      if (this.V >= 4) this._readCryptFilters(enc);
      if (this.V === 5 || this.R >= 5) {
        this._initAES256(enc, password);
      } else {
        this._initClassic(password);
      }
      this.ok = true;
    }
    _readCryptFilters(enc) {
      const cf = this.doc.resolve(dictGet(enc, "CF"));
      const resolveFilter = (nameObj) => {
        const name = isName(nameObj) ? nameObj.name : "Identity";
        if (name === "Identity") return "identity";
        const f = isDict(cf) ? this.doc.resolve(dictGet(cf, name)) : null;
        const cfm = f && this.doc.resolve(dictGet(f, "CFM"));
        const m = isName(cfm) ? cfm.name : null;
        if (m === "AESV2") return "aes128";
        if (m === "AESV3") return "aes256";
        if (m === "V2") return "rc4";
        return "rc4";
      };
      this.stmCipher = resolveFilter(this.doc.resolve(dictGet(enc, "StmF")));
      this.strCipher = resolveFilter(this.doc.resolve(dictGet(enc, "StrF")));
    }
    // --- Classic key derivation (R2..R4), Algorithm 2 -----------------------
    _initClassic(password) {
      const n = this.R === 2 ? 5 : Math.floor(this.length / 8);
      const pw = padPassword(password);
      const parts = [pw, this.O.subarray(0, 32), p32le(this.P), this.idBytes];
      if (this.R >= 4 && !this.encryptMetadata) parts.push(import_buffer.Buffer.from([255, 255, 255, 255]));
      let key = md5(import_buffer.Buffer.concat(parts));
      if (this.R >= 3) {
        for (let i = 0; i < 50; i++) key = md5(key.subarray(0, n));
      }
      this.fileKey = key.subarray(0, n);
      if (!this._verifyUserPassword()) {
        throw new Error("user password required (empty password did not match)");
      }
    }
    // Algorithm 4/5: recompute U and compare.
    _verifyUserPassword() {
      if (this.R === 2) {
        const u = rc4(this.fileKey, PAD);
        return constEq(u, this.U.subarray(0, 32));
      }
      const h = md5(import_buffer.Buffer.concat([PAD, this.idBytes]));
      let enc = rc4(this.fileKey, h);
      for (let i = 1; i <= 19; i++) {
        enc = rc4(xorKey(this.fileKey, i), enc);
      }
      return constEq(enc.subarray(0, 16), this.U.subarray(0, 16));
    }
    // --- AES-256 (R5/R6), Algorithm 2.A -------------------------------------
    _initAES256(enc, password) {
      const UE = strBytes(this.doc.resolve(dictGet(enc, "UE")));
      const pw = import_buffer.Buffer.from(password, "utf8").subarray(0, 127);
      const U = this.U;
      const validationSalt = U.subarray(32, 40);
      const keySalt = U.subarray(40, 48);
      const hash = this.R === 6 ? hashR6(pw, validationSalt, import_buffer.Buffer.alloc(0)) : sha256(import_buffer.Buffer.concat([pw, validationSalt]));
      if (!constEq(hash, U.subarray(0, 32))) {
        throw new Error("user password required (empty password did not match)");
      }
      const ikHash = this.R === 6 ? hashR6(pw, keySalt, import_buffer.Buffer.alloc(0)) : sha256(import_buffer.Buffer.concat([pw, keySalt]));
      const dec = shim_crypto_default.createDecipheriv("aes-256-cbc", ikHash, import_buffer.Buffer.alloc(16));
      dec.setAutoPadding(false);
      this.fileKey = import_buffer.Buffer.concat([dec.update(UE), dec.final()]);
      this.stmCipher = "aes256";
      this.strCipher = "aes256";
    }
    // --- Per-object decryption ----------------------------------------------
    objectKey(num2, gen) {
      if (this.V === 5 || this.R >= 5) return this.fileKey;
      const ext = import_buffer.Buffer.concat([
        this.fileKey,
        import_buffer.Buffer.from([num2 & 255, num2 >> 8 & 255, num2 >> 16 & 255, gen & 255, gen >> 8 & 255])
      ]);
      const salted = this.stmCipher === "aes128" || this.strCipher === "aes128" ? import_buffer.Buffer.concat([ext, import_buffer.Buffer.from("sAlT", "latin1")]) : ext;
      const n = Math.min(this.fileKey.length + 5, 16);
      return md5(salted).subarray(0, n);
    }
    decrypt(bytes, num2, gen, which) {
      const cipher = which === "str" ? this.strCipher : this.stmCipher;
      if (cipher === "identity") return bytes;
      const key = this.objectKey(num2, gen);
      if (cipher === "aes128" || cipher === "aes256") {
        return aesCbcDecrypt(key, bytes);
      }
      return rc4(key, bytes);
    }
  };
  function rc4(key, data) {
    const s = new Uint8Array(256);
    for (let i = 0; i < 256; i++) s[i] = i;
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = j + s[i] + key[i % key.length] & 255;
      [s[i], s[j]] = [s[j], s[i]];
    }
    const out = import_buffer.Buffer.alloc(data.length);
    let a = 0;
    let b = 0;
    for (let k = 0; k < data.length; k++) {
      a = a + 1 & 255;
      b = b + s[a] & 255;
      [s[a], s[b]] = [s[b], s[a]];
      out[k] = data[k] ^ s[s[a] + s[b] & 255];
    }
    return out;
  }
  function aesCbcDecrypt(key, bytes) {
    if (bytes.length < 16) return import_buffer.Buffer.alloc(0);
    const iv = bytes.subarray(0, 16);
    const body = bytes.subarray(16);
    if (body.length === 0 || body.length % 16 !== 0) {
      const usable = body.subarray(0, body.length - body.length % 16);
      const algo2 = key.length === 32 ? "aes-256-cbc" : "aes-128-cbc";
      const dec2 = shim_crypto_default.createDecipheriv(algo2, key, iv);
      dec2.setAutoPadding(false);
      return import_buffer.Buffer.concat([dec2.update(usable), dec2.final()]);
    }
    const algo = key.length === 32 ? "aes-256-cbc" : "aes-128-cbc";
    const dec = shim_crypto_default.createDecipheriv(algo, key, iv);
    dec.setAutoPadding(false);
    const out = import_buffer.Buffer.concat([dec.update(body), dec.final()]);
    const pad = out[out.length - 1];
    if (pad >= 1 && pad <= 16 && pad <= out.length) return out.subarray(0, out.length - pad);
    return out;
  }
  function hashR6(password, salt, udata) {
    let K = sha256(import_buffer.Buffer.concat([password, salt, udata]));
    for (let round2 = 0; ; round2++) {
      const K1parts = [];
      const block = import_buffer.Buffer.concat([password, K, udata]);
      for (let i = 0; i < 64; i++) K1parts.push(block);
      const K1 = import_buffer.Buffer.concat(K1parts);
      const cipher = shim_crypto_default.createCipheriv("aes-128-cbc", K.subarray(0, 16), K.subarray(16, 32));
      cipher.setAutoPadding(false);
      const E = import_buffer.Buffer.concat([cipher.update(K1), cipher.final()]);
      let mod = 0;
      for (let i = 0; i < 16; i++) mod += E[i];
      mod %= 3;
      K = mod === 0 ? sha256(E) : mod === 1 ? sha384(E) : sha512(E);
      if (round2 >= 63 && E[E.length - 1] <= round2 - 32) break;
    }
    return K.subarray(0, 32);
  }
  function padPassword(pw) {
    const b = import_buffer.Buffer.from(pw, "latin1");
    if (b.length >= 32) return b.subarray(0, 32);
    return import_buffer.Buffer.concat([b, PAD.subarray(0, 32 - b.length)]);
  }
  function xorKey(key, b) {
    const out = import_buffer.Buffer.from(key);
    for (let i = 0; i < out.length; i++) out[i] ^= b;
    return out;
  }
  function md5(b) {
    return shim_crypto_default.createHash("md5").update(b).digest();
  }
  function sha256(b) {
    return shim_crypto_default.createHash("sha256").update(b).digest();
  }
  function sha384(b) {
    return shim_crypto_default.createHash("sha384").update(b).digest();
  }
  function sha512(b) {
    return shim_crypto_default.createHash("sha512").update(b).digest();
  }
  function p32le(n) {
    const b = import_buffer.Buffer.alloc(4);
    b.writeInt32LE(n | 0, 0);
    return b;
  }
  function numOf(v, d) {
    return typeof v === "number" ? v : d;
  }
  function strBytes(v) {
    return v && v.kind === "string" ? import_buffer.Buffer.from(v.bytes) : import_buffer.Buffer.alloc(0);
  }
  function constEq(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  }

  // src/document.js
  var PDFDocument = class _PDFDocument {
    constructor(buf) {
      this.buf = buf;
      this.xref = /* @__PURE__ */ new Map();
      this.trailer = null;
      this.cache = /* @__PURE__ */ new Map();
      this._objStmCache = /* @__PURE__ */ new Map();
      this.recovered = false;
      this.version = null;
      this.warnings = [];
      this.security = null;
      this.encryptObjNum = null;
      this.password = "";
      this.startxrefType = null;
    }
    static load(buf, { password = "" } = {}) {
      if (typeof import_buffer.Buffer !== "undefined" && !import_buffer.Buffer.isBuffer(buf)) buf = import_buffer.Buffer.from(buf);
      const doc = new _PDFDocument(buf);
      doc.password = password;
      doc._readVersion();
      try {
        doc._readXref();
        if (!doc.trailer || !dictGet(doc.trailer, "Root")) {
          doc._recoverByScan();
        }
      } catch (e) {
        doc.warnings.push(`xref parse failed: ${e.message}; recovering by scan`);
        doc._recoverByScan();
      }
      doc._setupSecurity();
      return doc;
    }
    _setupSecurity() {
      const encRef = this.trailer && dictGet(this.trailer, "Encrypt");
      if (!encRef) return;
      if (isRef(encRef)) this.encryptObjNum = encRef.num;
      const sec = new StandardSecurity(this, this.password);
      if (sec.ok) {
        this.security = sec;
        this.cache.clear();
        this._objStmCache.clear();
      } else {
        this.warnings.push(`encrypted: ${sec.reason || "could not derive key"}`);
      }
    }
    // Walk a freshly parsed indirect object and decrypt its strings and stream
    // bytes with the key for this object. Objects pulled from an object stream
    // are already plaintext (the stream was decrypted as a whole), so only
    // type-1 direct objects pass through here.
    _decryptValue(value, num2, gen) {
      const sec = this.security;
      if (!sec) return value;
      const walk = (v) => {
        if (v == null || typeof v !== "object") return v;
        switch (v.kind) {
          case "string":
            v.bytes = sec.decrypt(v.bytes, num2, gen, "str");
            return v;
          case "array":
            v.items.forEach(walk);
            return v;
          case "dict":
            for (const val of v.map.values()) walk(val);
            return v;
          case "stream": {
            for (const val of v.dict.map.values()) walk(val);
            const typ = v.dict.map.get("Type");
            const isMeta = typ && typ.kind === "name" && typ.name === "Metadata";
            if (!(isMeta && !sec.encryptMetadata)) {
              v.raw = sec.decrypt(v.raw, num2, gen, "stm");
            }
            return v;
          }
          default:
            return v;
        }
      };
      return walk(value);
    }
    _readVersion() {
      const head = this.buf.toString("latin1", 0, 32);
      const m = head.match(/%PDF-(\d+\.\d+)/);
      if (m) this.version = m[1];
      else this.warnings.push("No %PDF- header found");
    }
    // ---- Cross-reference loading -------------------------------------------
    _findStartxref() {
      const tail = this.buf.subarray(Math.max(0, this.buf.length - 2048));
      const text = tail.toString("latin1");
      const idx = text.lastIndexOf("startxref");
      if (idx < 0) throw new Error("startxref not found");
      const after = text.slice(idx + "startxref".length);
      const m = after.match(/\s*(\d+)/);
      if (!m) throw new Error("startxref offset unreadable");
      return parseInt(m[1], 10);
    }
    _readXref() {
      const seen = /* @__PURE__ */ new Set();
      let offset = this._findStartxref();
      while (offset != null && !seen.has(offset)) {
        seen.add(offset);
        if (offset < 0 || offset >= this.buf.length) throw new Error(`xref offset out of range: ${offset}`);
        const trailer = this._readXrefSection(offset);
        if (!this.trailer) this.trailer = trailer;
        else this._mergeTrailer(trailer);
        const xrefStm = dictGet(trailer, "XRefStm");
        if (typeof xrefStm === "number" && !seen.has(xrefStm)) {
          this._readXrefSection(xrefStm);
        }
        const prev = dictGet(trailer, "Prev");
        offset = typeof prev === "number" ? prev : null;
      }
    }
    _mergeTrailer(t) {
      if (!isDict(t)) return;
      for (const [k, v] of t.map) {
        if (!this.trailer.map.has(k)) this.trailer.map.set(k, v);
      }
    }
    _readXrefSection(offset) {
      const lex = new Lexer(this.buf, offset);
      const t = lex.next();
      const isClassic = t.type === TokenType.KEYWORD && t.value === "xref";
      if (this.startxrefType === null) this.startxrefType = isClassic ? "classic" : "stream";
      if (isClassic) return this._readClassicXref(lex.pos);
      return this._readXrefStream(offset);
    }
    _readClassicXref(pos) {
      const { buf } = this;
      const lex = new Lexer(buf, pos);
      for (; ; ) {
        const save = lex.pos;
        const a = lex.next();
        if (a.type === TokenType.KEYWORD && a.value === "trailer") break;
        if (a.type !== TokenType.NUMBER) {
          lex.pos = save;
          break;
        }
        const b = lex.next();
        const start = a.value;
        const count = b.value;
        for (let i = 0; i < count; i++) {
          const off = lex.next();
          const gen = lex.next();
          const kind = lex.next();
          const num2 = start + i;
          if (kind.value === "n" && !this.xref.has(num2)) {
            this.xref.set(num2, { type: 1, offset: off.value, gen: gen.value });
          }
        }
      }
      const p = new Parser(buf, lex.pos);
      const trailer = p.parseObject();
      return isDict(trailer) ? trailer : null;
    }
    _readXrefStream(offset) {
      const ind = parseIndirectAt(this.buf, offset);
      const stream = ind.value;
      if (!isStream(stream)) throw new Error("xref stream expected");
      const { data } = decodeStream(stream, (x) => this.resolve(x));
      const dict = stream.dict;
      const W = dictGet(dict, "W");
      if (!isArray(W)) throw new Error("xref stream missing /W");
      const [w0, w1, w2] = W.items.map((n) => n);
      const size = dictGet(dict, "Size");
      const index = dictGet(dict, "Index");
      const ranges = isArray(index) ? chunk(index.items, 2) : [[0, size]];
      let p = 0;
      const rowLen = w0 + w1 + w2;
      for (const [start, count] of ranges) {
        for (let i = 0; i < count; i++) {
          if (p + rowLen > data.length) break;
          const f0 = w0 === 0 ? 1 : readBE(data, p, w0);
          const f1 = readBE(data, p + w0, w1);
          const f2 = readBE(data, p + w0 + w1, w2);
          p += rowLen;
          const num2 = start + i;
          if (this.xref.has(num2)) continue;
          if (f0 === 1) this.xref.set(num2, { type: 1, offset: f1, gen: f2 });
          else if (f0 === 2) this.xref.set(num2, { type: 2, streamNum: f1, index: f2 });
        }
      }
      return dict;
    }
    // ---- Recovery ----------------------------------------------------------
    _recoverByScan() {
      this.recovered = true;
      const { buf } = this;
      const re = /(\d+)\s+(\d+)\s+obj\b/g;
      const text = buf.toString("latin1");
      let m;
      while (m = re.exec(text)) {
        const num2 = parseInt(m[1], 10);
        const gen = parseInt(m[2], 10);
        this.xref.set(num2, { type: 1, offset: m.index, gen });
      }
      if (!this.trailer || !dictGet(this.trailer, "Root")) {
        this.trailer = this._findTrailerByScan() || this.trailer;
      }
      if (!this.trailer || !dictGet(this.trailer, "Root")) {
        const root = this._findCatalog();
        if (root) {
          const { Dict: Dict2, Ref: Ref2 } = _model();
          const map = /* @__PURE__ */ new Map();
          map.set("Root", Ref2(root, 0));
          this.trailer = Dict2(map);
        }
      }
    }
    _findTrailerByScan() {
      const text = this.buf.toString("latin1");
      let idx = text.lastIndexOf("trailer");
      while (idx >= 0) {
        try {
          const lex = new Lexer(this.buf, idx + "trailer".length);
          const p = new Parser(this.buf, lex.pos);
          const d = p.parseObject();
          if (isDict(d) && dictGet(d, "Root")) return d;
        } catch {
        }
        idx = text.lastIndexOf("trailer", idx - 1);
      }
      return null;
    }
    _findCatalog() {
      for (const num2 of this.xref.keys()) {
        try {
          const v = this.resolve({ kind: "ref", num: num2, gen: 0 });
          if (isDict(v)) {
            const t = dictGet(v, "Type");
            if (isName(t) && t.name === "Catalog") return num2;
          }
        } catch {
        }
      }
      return null;
    }
    // ---- Resolution --------------------------------------------------------
    resolve(obj) {
      if (!isRef(obj)) return obj;
      if (this.cache.has(obj.num)) return this.cache.get(obj.num);
      const entry = this.xref.get(obj.num);
      let value = null;
      try {
        if (!entry) {
          value = null;
        } else if (entry.type === 1) {
          const ind = parseIndirectAt(this.buf, entry.offset);
          value = ind.value;
          if (this.security && obj.num !== this.encryptObjNum) {
            value = this._decryptValue(value, obj.num, entry.gen || 0);
          }
        } else if (entry.type === 2) {
          value = this._resolveFromObjStm(entry.streamNum, entry.index, obj.num);
        }
      } catch (e) {
        this.warnings.push(`resolve ${obj.num} ${obj.gen} R failed: ${e.message}`);
        value = null;
      }
      this.cache.set(obj.num, value);
      return value;
    }
    _resolveFromObjStm(streamNum, index, wantNum) {
      let parsed = this._objStmCache.get(streamNum);
      if (!parsed) {
        const stmObj = this.resolve({ kind: "ref", num: streamNum, gen: 0 });
        if (!isStream(stmObj)) throw new Error(`object stream ${streamNum} not a stream`);
        const { data } = decodeStream(stmObj, (x) => this.resolve(x));
        const n = this.resolve(dictGet(stmObj.dict, "N"));
        const first = this.resolve(dictGet(stmObj.dict, "First"));
        const lex = new Lexer(data, 0);
        const entries = [];
        for (let i = 0; i < n; i++) {
          const num2 = lex.next().value;
          const off = lex.next().value;
          entries.push({ num: num2, off });
        }
        parsed = { data, first, entries };
        this._objStmCache.set(streamNum, parsed);
      }
      const slot = parsed.entries[index] || parsed.entries.find((e) => e.num === wantNum);
      if (!slot) throw new Error(`object ${wantNum} not in stream ${streamNum}`);
      const p = new Parser(parsed.data, parsed.first + slot.off);
      return p.parseObject();
    }
    // Deep-resolve one level of refs in a value (for display/convenience).
    deref(obj) {
      return isRef(obj) ? this.resolve(obj) : obj;
    }
    getCatalog() {
      const root = this.trailer && dictGet(this.trailer, "Root");
      return root ? this.resolve(root) : null;
    }
    // Walk the page tree into a flat array of page dicts.
    getPages() {
      const catalog = this.getCatalog();
      if (!catalog) return [];
      const pagesRoot = this.resolve(dictGet(catalog, "Pages"));
      const pages = [];
      const seen = /* @__PURE__ */ new Set();
      const walk = (node, inherited) => {
        if (!isDict(node)) return;
        const type = dictGet(node, "Type");
        const merged = { ...inherited };
        for (const key of ["Resources", "MediaBox", "CropBox", "Rotate"]) {
          const v = dictGet(node, key);
          if (v !== void 0) merged[key] = v;
        }
        if (isName(type) && type.name === "Page") {
          pages.push({ dict: node, inherited: merged });
          return;
        }
        const kids = this.resolve(dictGet(node, "Kids"));
        if (isArray(kids)) {
          for (const kid of kids.items) {
            if (isRef(kid)) {
              if (seen.has(kid.num)) continue;
              seen.add(kid.num);
            }
            walk(this.resolve(kid), merged);
          }
        }
      };
      walk(pagesRoot, {});
      return pages;
    }
    objectNumbers() {
      return [...this.xref.keys()].sort((a, b) => a - b);
    }
  };
  function chunk(arr, n) {
    const out = [];
    for (let i = 0; i + n <= arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  }
  function readBE(buf, pos, width) {
    let v = 0;
    for (let i = 0; i < width; i++) v = v * 256 + buf[pos + i];
    return v;
  }
  function _model() {
    return { Dict: (m) => ({ kind: "dict", map: m }), Ref: (num2, gen) => ({ kind: "ref", num: num2, gen }) };
  }

  // src/content.js
  init_buffer_inject();

  // src/font.js
  init_buffer_inject();

  // src/encodings.js
  init_buffer_inject();
  function asciiBase() {
    const m = /* @__PURE__ */ new Map();
    for (let c = 32; c <= 126; c++) m.set(c, String.fromCharCode(c));
    return m;
  }
  var WIN_ANSI_HIGH = {
    128: 8364,
    130: 8218,
    131: 402,
    132: 8222,
    133: 8230,
    134: 8224,
    135: 8225,
    136: 710,
    137: 8240,
    138: 352,
    139: 8249,
    140: 338,
    142: 381,
    145: 8216,
    146: 8217,
    147: 8220,
    148: 8221,
    149: 8226,
    150: 8211,
    151: 8212,
    152: 732,
    153: 8482,
    154: 353,
    155: 8250,
    156: 339,
    158: 382,
    159: 376
  };
  function winAnsi() {
    const m = asciiBase();
    for (const [code, cp] of Object.entries(WIN_ANSI_HIGH)) {
      m.set(Number(code), String.fromCodePoint(cp));
    }
    for (let c = 160; c <= 255; c++) m.set(c, String.fromCodePoint(c));
    return m;
  }
  var MAC_ROMAN_HIGH = [
    196,
    197,
    199,
    201,
    209,
    214,
    220,
    225,
    224,
    226,
    228,
    227,
    229,
    231,
    233,
    232,
    234,
    235,
    237,
    236,
    238,
    239,
    241,
    243,
    242,
    244,
    246,
    245,
    250,
    249,
    251,
    252,
    8224,
    176,
    162,
    163,
    167,
    8226,
    182,
    223,
    174,
    169,
    8482,
    180,
    168,
    8800,
    198,
    216,
    8734,
    177,
    8804,
    8805,
    165,
    181,
    8706,
    8721,
    8719,
    960,
    8747,
    170,
    186,
    937,
    230,
    248,
    191,
    161,
    172,
    8730,
    402,
    8776,
    8710,
    171,
    187,
    8230,
    160,
    192,
    195,
    213,
    338,
    339,
    8211,
    8212,
    8220,
    8221,
    8216,
    8217,
    247,
    9674,
    255,
    376,
    8260,
    8364,
    8249,
    8250,
    64257,
    64258,
    8225,
    183,
    8218,
    8222,
    8240,
    194,
    202,
    193,
    203,
    200,
    205,
    206,
    207,
    204,
    211,
    212,
    63743,
    210,
    218,
    219,
    217,
    305,
    710,
    732,
    175,
    728,
    729,
    730,
    184,
    733,
    731,
    711
  ];
  function macRoman() {
    const m = asciiBase();
    MAC_ROMAN_HIGH.forEach((cp, i) => m.set(128 + i, String.fromCodePoint(cp)));
    return m;
  }
  var STANDARD_HIGH = {
    39: 8217,
    96: 8216,
    161: 161,
    162: 162,
    163: 163,
    164: 8260,
    165: 165,
    166: 402,
    167: 167,
    168: 164,
    169: 39,
    170: 8220,
    171: 171,
    172: 8249,
    173: 8250,
    174: 64257,
    175: 64258,
    177: 8211,
    178: 8224,
    179: 8225,
    180: 183,
    182: 182,
    183: 8226,
    184: 8218,
    185: 8222,
    186: 8221,
    187: 187,
    188: 8230,
    189: 8240,
    191: 191,
    193: 96,
    194: 180,
    195: 710,
    196: 732,
    197: 175,
    198: 728,
    199: 729,
    200: 168,
    202: 730,
    203: 184,
    205: 733,
    206: 731,
    207: 711,
    208: 8212,
    225: 198,
    227: 170,
    232: 321,
    233: 216,
    234: 338,
    235: 186,
    241: 230,
    245: 305,
    248: 322,
    249: 248,
    250: 339,
    251: 223
  };
  function standard() {
    const m = asciiBase();
    for (const [code, cp] of Object.entries(STANDARD_HIGH)) {
      m.set(Number(code), String.fromCodePoint(cp));
    }
    return m;
  }
  var Encodings = {
    WinAnsiEncoding: winAnsi(),
    MacRomanEncoding: macRoman(),
    StandardEncoding: standard(),
    PDFDocEncoding: winAnsi()
    // close enough for text extraction
  };
  var AGL = {
    space: 32,
    exclam: 33,
    quotedbl: 34,
    numbersign: 35,
    dollar: 36,
    percent: 37,
    ampersand: 38,
    quotesingle: 39,
    parenleft: 40,
    parenright: 41,
    asterisk: 42,
    plus: 43,
    comma: 44,
    hyphen: 45,
    period: 46,
    slash: 47,
    zero: 48,
    one: 49,
    two: 50,
    three: 51,
    four: 52,
    five: 53,
    six: 54,
    seven: 55,
    eight: 56,
    nine: 57,
    colon: 58,
    semicolon: 59,
    less: 60,
    equal: 61,
    greater: 62,
    question: 63,
    at: 64,
    bracketleft: 91,
    backslash: 92,
    bracketright: 93,
    asciicircum: 94,
    underscore: 95,
    grave: 96,
    braceleft: 123,
    bar: 124,
    braceright: 125,
    asciitilde: 126,
    // punctuation and symbols
    quoteleft: 8216,
    quoteright: 8217,
    quotedblleft: 8220,
    quotedblright: 8221,
    quotesinglbase: 8218,
    quotedblbase: 8222,
    endash: 8211,
    emdash: 8212,
    bullet: 8226,
    ellipsis: 8230,
    dagger: 8224,
    daggerdbl: 8225,
    perthousand: 8240,
    guilsinglleft: 8249,
    guilsinglright: 8250,
    guillemotleft: 171,
    guillemotright: 187,
    fraction: 8260,
    florin: 402,
    Euro: 8364,
    trademark: 8482,
    degree: 176,
    plusminus: 177,
    multiply: 215,
    divide: 247,
    minus: 8722,
    periodcentered: 183,
    paragraph: 182,
    section: 167,
    copyright: 169,
    registered: 174,
    currency: 164,
    cent: 162,
    sterling: 163,
    yen: 165,
    brokenbar: 166,
    dieresis: 168,
    ordfeminine: 170,
    logicalnot: 172,
    macron: 175,
    acute: 180,
    mu: 181,
    cedilla: 184,
    ordmasculine: 186,
    onequarter: 188,
    onehalf: 189,
    threequarters: 190,
    questiondown: 191,
    exclamdown: 161,
    germandbls: 223,
    fi: 64257,
    fl: 64258,
    circumflex: 710,
    tilde: 732,
    breve: 728,
    dotaccent: 729,
    ring: 730,
    hungarumlaut: 733,
    ogonek: 731,
    caron: 711,
    dotlessi: 305,
    Lslash: 321,
    lslash: 322,
    OE: 338,
    oe: 339,
    Scaron: 352,
    scaron: 353,
    Zcaron: 381,
    zcaron: 382,
    Ydieresis: 376,
    AE: 198,
    ae: 230,
    Oslash: 216,
    oslash: 248,
    Thorn: 222,
    thorn: 254,
    Eth: 208,
    eth: 240,
    nbspace: 160,
    space_: 32
  };
  var ACCENTS = {
    acute: { A: 193, E: 201, I: 205, O: 211, U: 218, Y: 221, a: 225, e: 233, i: 237, o: 243, u: 250, y: 253 },
    grave: { A: 192, E: 200, I: 204, O: 210, U: 217, a: 224, e: 232, i: 236, o: 242, u: 249 },
    circumflex: { A: 194, E: 202, I: 206, O: 212, U: 219, a: 226, e: 234, i: 238, o: 244, u: 251 },
    tilde: { A: 195, N: 209, O: 213, a: 227, n: 241, o: 245 },
    dieresis: { A: 196, E: 203, I: 207, O: 214, U: 220, Y: 376, a: 228, e: 235, i: 239, o: 246, u: 252, y: 255 },
    ring: { A: 197, a: 229 },
    cedilla: { C: 199, c: 231 }
  };
  function glyphToUnicode(name) {
    if (!name) return null;
    if (Object.hasOwn(AGL, name)) return String.fromCodePoint(AGL[name]);
    if (/^[A-Za-z]$/.test(name)) return name;
    for (const [accent, table] of Object.entries(ACCENTS)) {
      if (name.length > accent.length && name.endsWith(accent)) {
        const base = name.slice(0, name.length - accent.length);
        if (Object.hasOwn(table, base)) return String.fromCodePoint(table[base]);
      }
    }
    let m = /^uni([0-9A-Fa-f]{4,})$/.exec(name);
    if (m && m[1].length % 4 === 0) {
      let out = "";
      for (let i = 0; i < m[1].length; i += 4) out += String.fromCharCode(parseInt(m[1].slice(i, i + 4), 16));
      return out;
    }
    m = /^u([0-9A-Fa-f]{4,6})$/.exec(name);
    if (m) return String.fromCodePoint(parseInt(m[1], 16));
    return null;
  }

  // src/font.js
  var Font = class {
    constructor(doc, fontDict) {
      this.doc = doc;
      this.dict = fontDict;
      this.subtype = nameOf(doc.resolve(dictGet(fontDict, "Subtype")));
      this.baseFont = nameOf(doc.resolve(dictGet(fontDict, "BaseFont")));
      this.isType0 = this.subtype === "Type0";
      this.codeBytes = 1;
      this.toUnicode = null;
      this.encodingMap = null;
      this.widths = /* @__PURE__ */ new Map();
      this.defaultWidth = 500;
      this._loadToUnicode();
      if (this.isType0) this._loadType0();
      else this._loadSimple();
    }
    _loadToUnicode() {
      const tu = this.doc.resolve(dictGet(this.dict, "ToUnicode"));
      if (!isStream(tu)) return;
      try {
        const { data } = decodeStream(tu, (x) => this.doc.resolve(x));
        const parsed = parseCMap(data);
        this.toUnicode = parsed.map;
        if (parsed.codeBytes) this.codeBytes = parsed.codeBytes;
      } catch {
        this.toUnicode = null;
      }
    }
    _loadSimple() {
      this.codeBytes = 1;
      const enc = this.doc.resolve(dictGet(this.dict, "Encoding"));
      let base = null;
      let differences = null;
      if (isName(enc)) {
        base = Encodings[enc.name] || null;
      } else if (isDict(enc)) {
        const be = this.doc.resolve(dictGet(enc, "BaseEncoding"));
        if (isName(be)) base = Encodings[be.name] || null;
        const diff = this.doc.resolve(dictGet(enc, "Differences"));
        if (isArray(diff)) differences = diff.items;
      }
      if (!base) {
        base = Encodings.StandardEncoding;
      }
      const map = new Map(base);
      if (differences) {
        let code = 0;
        for (const item of differences) {
          const v = this.doc.resolve(item);
          if (typeof v === "number") {
            code = v;
          } else if (isName(v)) {
            const u = glyphToUnicode(v.name);
            if (u !== null) map.set(code, u);
            else map.delete(code);
            code++;
          }
        }
      }
      this.encodingMap = map;
      const firstChar = this.doc.resolve(dictGet(this.dict, "FirstChar"));
      const widths = this.doc.resolve(dictGet(this.dict, "Widths"));
      if (isArray(widths) && typeof firstChar === "number") {
        widths.items.forEach((w, i) => {
          const v = this.doc.resolve(w);
          if (typeof v === "number") this.widths.set(firstChar + i, v);
        });
      }
      const fd = this.doc.resolve(dictGet(this.dict, "FontDescriptor"));
      if (isDict(fd)) {
        const mw = this.doc.resolve(dictGet(fd, "MissingWidth"));
        if (typeof mw === "number") this.defaultWidth = mw;
      }
      if (this.widths.size === 0) {
        this.defaultWidth = /Courier|Mono/i.test(this.baseFont || "") ? 600 : 500;
      }
    }
    _loadType0() {
      const enc = this.doc.resolve(dictGet(this.dict, "Encoding"));
      if (isName(enc)) {
        this.codeBytes = /^Identity-[HV]$/.test(enc.name) ? 2 : 2;
      } else if (isStream(enc)) {
        try {
          const { data } = decodeStream(enc, (x) => this.doc.resolve(x));
          const parsed = parseCMap(data);
          if (parsed.codeBytes) this.codeBytes = parsed.codeBytes;
          else this.codeBytes = 2;
        } catch {
          this.codeBytes = 2;
        }
      } else {
        this.codeBytes = 2;
      }
      const desc = this.doc.resolve(dictGet(this.dict, "DescendantFonts"));
      const cidFont = isArray(desc) ? this.doc.resolve(desc.items[0]) : null;
      if (isDict(cidFont)) {
        const dw = this.doc.resolve(dictGet(cidFont, "DW"));
        this.defaultWidth = typeof dw === "number" ? dw : 1e3;
        const W = this.doc.resolve(dictGet(cidFont, "W"));
        if (isArray(W)) this._parseCidWidths(W.items);
      } else {
        this.defaultWidth = 1e3;
      }
    }
    // /W is [ c [w w ...] | cFirst cLast w ]*
    _parseCidWidths(items) {
      let i = 0;
      const res = (x) => this.doc.resolve(x);
      while (i < items.length) {
        const a = res(items[i]);
        if (typeof a !== "number") {
          i++;
          continue;
        }
        const b = res(items[i + 1]);
        if (isArray(b)) {
          b.items.forEach((w, k) => {
            const v = res(w);
            if (typeof v === "number") this.widths.set(a + k, v);
          });
          i += 2;
        } else if (typeof b === "number") {
          const w = res(items[i + 2]);
          if (typeof w === "number") {
            const span = Math.min(b - a, 65535);
            for (let c = 0; c <= span; c++) this.widths.set(a + c, w);
          }
          i += 3;
        } else {
          i++;
        }
      }
    }
    // Split a PDF string into codes according to this font's code width.
    codes(bytes) {
      const out = [];
      if (this.codeBytes === 2) {
        for (let i = 0; i + 1 < bytes.length; i += 2) out.push(bytes[i] << 8 | bytes[i + 1]);
        if (bytes.length % 2 === 1) out.push(bytes[bytes.length - 1]);
      } else {
        for (const b of bytes) out.push(b);
      }
      return out;
    }
    // Unicode text for one code ('' when the code maps to nothing).
    unicodeFor(code) {
      if (this.toUnicode) {
        const u = this.toUnicode.get(code);
        if (u !== void 0) return u;
      }
      if (this.encodingMap) {
        const u = this.encodingMap.get(code);
        if (u !== void 0) return u;
      }
      if (this.isType0) return "";
      if (code >= 32 && code < 127) return String.fromCharCode(code);
      return "";
    }
    // Width of one code, in text-space units (em fractions).
    widthFor(code) {
      const w = this.widths.get(code);
      return (typeof w === "number" ? w : this.defaultWidth) / 1e3;
    }
  };
  function parseCMap(data) {
    const map = /* @__PURE__ */ new Map();
    let codeBytes = 0;
    const lex = new Lexer(data, 0);
    const stack = [];
    const hexToInt = (buf) => {
      let v = 0;
      for (const b of buf) v = v * 256 + b;
      return v;
    };
    const hexToStr = (buf) => {
      if (buf.length === 0) return "";
      if (buf.length === 1) return String.fromCharCode(buf[0]);
      let s = "";
      for (let i = 0; i + 1 < buf.length; i += 2) s += String.fromCharCode(buf[i] << 8 | buf[i + 1]);
      if (buf.length % 2 === 1) s += String.fromCharCode(buf[buf.length - 1]);
      return s;
    };
    for (; ; ) {
      const t = lex.next();
      if (t.type === TokenType.EOF) break;
      if (t.type === TokenType.KEYWORD) {
        switch (t.value) {
          case "endcodespacerange": {
            for (const item of stack) {
              if (item && item.type === TokenType.STRING) {
                codeBytes = Math.max(codeBytes, item.value.length);
              }
            }
            stack.length = 0;
            continue;
          }
          case "endbfchar": {
            for (let i = 0; i + 1 < stack.length; i += 2) {
              const src = stack[i];
              const dst = stack[i + 1];
              if (src?.type === TokenType.STRING && dst?.type === TokenType.STRING) {
                map.set(hexToInt(src.value), hexToStr(dst.value));
                codeBytes = Math.max(codeBytes, src.value.length);
              }
            }
            stack.length = 0;
            continue;
          }
          case "endbfrange": {
            for (let i = 0; i + 2 < stack.length; i += 3) {
              const lo = stack[i];
              const hi = stack[i + 1];
              const dst = stack[i + 2];
              if (lo?.type !== TokenType.STRING || hi?.type !== TokenType.STRING) continue;
              const a = hexToInt(lo.value);
              const b = hexToInt(hi.value);
              codeBytes = Math.max(codeBytes, lo.value.length);
              const span = Math.min(b - a, 65535);
              if (dst?.type === TokenType.STRING) {
                const base = hexToStr(dst.value);
                for (let c = 0; c <= span; c++) {
                  if (base.length === 0) continue;
                  const head = base.slice(0, -1);
                  const tail = base.charCodeAt(base.length - 1) + c;
                  map.set(a + c, head + String.fromCharCode(tail & 65535));
                }
              } else if (dst?.array) {
                dst.array.forEach((item, k) => {
                  if (item?.type === TokenType.STRING) map.set(a + k, hexToStr(item.value));
                });
              }
            }
            stack.length = 0;
            continue;
          }
          case "begincodespacerange":
          case "beginbfchar":
          case "beginbfrange":
            stack.length = 0;
            continue;
          default:
            continue;
        }
      }
      if (t.type === TokenType.ARRAY_OPEN) {
        const arr = [];
        for (; ; ) {
          const u = lex.next();
          if (u.type === TokenType.ARRAY_CLOSE || u.type === TokenType.EOF) break;
          arr.push(u);
        }
        stack.push({ array: arr });
        continue;
      }
      if (t.type === TokenType.STRING || t.type === TokenType.NUMBER) {
        stack.push(t);
        if (stack.length > 3e4) stack.length = 0;
      }
    }
    return { map, codeBytes };
  }
  function nameOf(obj) {
    return isName(obj) ? obj.name : null;
  }

  // src/content.js
  var IDENTITY = [1, 0, 0, 1, 0, 0];
  function mul(m, n) {
    return [
      m[0] * n[0] + m[1] * n[2],
      m[0] * n[1] + m[1] * n[3],
      m[2] * n[0] + m[3] * n[2],
      m[2] * n[1] + m[3] * n[3],
      m[4] * n[0] + m[5] * n[2] + n[4],
      m[4] * n[1] + m[5] * n[3] + n[5]
    ];
  }
  var TextExtractor = class {
    constructor(doc, { maxDepth = 8 } = {}) {
      this.doc = doc;
      this.maxDepth = maxDepth;
      this.fontCache = /* @__PURE__ */ new Map();
      this.items = [];
      this.warnings = [];
    }
    // Concatenate a page's /Contents (it may be an array of streams) and run it.
    runPage(page) {
      const contents = this.doc.resolve(dictGet(page.dict, "Contents"));
      const resources = this.doc.resolve(
        dictGet(page.dict, "Resources") ?? page.inherited.Resources
      );
      const buffers = [];
      const collect = (obj) => {
        const v = this.doc.resolve(obj);
        if (isStream(v)) {
          try {
            buffers.push(decodeStream(v, (x) => this.doc.resolve(x)).data);
          } catch (e) {
            this.warnings.push(`content stream decode failed: ${e.message}`);
          }
        } else if (isArray(v)) {
          for (const item of v.items) collect(item);
        }
      };
      collect(contents);
      if (buffers.length === 0) return [];
      const data = import_buffer.Buffer.concat(
        buffers.flatMap((b, i) => i === 0 ? [b] : [import_buffer.Buffer.from("\n"), b])
      );
      this.items = [];
      this.execute(data, resources, IDENTITY, 0);
      return this.items;
    }
    execute(data, resources, baseCTM, depth) {
      if (depth > this.maxDepth) {
        this.warnings.push("XObject nesting limit reached");
        return;
      }
      const lex = new Lexer(data, 0);
      let operands = [];
      let ctm = baseCTM;
      const gsStack = [];
      let font = null;
      let fontSize = 0;
      let charSpacing = 0;
      let wordSpacing = 0;
      let hScale = 1;
      let leading = 0;
      let rise = 0;
      let renderMode = 0;
      let tm = IDENTITY;
      let tlm = IDENTITY;
      const num2 = (v) => typeof v === "number" ? v : 0;
      const showString = (bytes) => {
        if (!font) {
          this.warnings.push("text shown with no font selected");
          return;
        }
        const codes = font.codes(bytes);
        let text = "";
        let advance = 0;
        for (const code of codes) {
          text += font.unicodeFor(code);
          const w0 = font.widthFor(code);
          const isSpaceByte = font.codeBytes === 1 && code === 32;
          const tx = (w0 * fontSize + charSpacing + (isSpaceByte ? wordSpacing : 0)) * hScale;
          advance += tx;
        }
        const trm = mul(mul([fontSize * hScale, 0, 0, fontSize, 0, rise], tm), ctm);
        const [x, y] = [trm[4], trm[5]];
        const scale = Math.hypot(trm[0], trm[1]) / (fontSize || 1) || 1;
        if (text.length > 0 && renderMode !== 3 && renderMode !== 7) {
          this.items.push({
            x,
            y,
            text,
            width: advance * scale,
            fontSize: Math.hypot(trm[0], trm[1]) || fontSize,
            spaceWidth: (font.widthFor(32) || 0.5) * fontSize * hScale * scale
          });
        }
        tm = mul([1, 0, 0, 1, advance, 0], tm);
      };
      const adjustTJ = (amount) => {
        const tx = -amount / 1e3 * fontSize * hScale;
        tm = mul([1, 0, 0, 1, tx, 0], tm);
      };
      const nextLine = (tx, ty) => {
        tlm = mul([1, 0, 0, 1, tx, ty], tlm);
        tm = tlm;
      };
      for (; ; ) {
        const t = lex.next();
        if (t.type === TokenType.EOF) break;
        if (t.type === TokenType.NUMBER) {
          operands.push(t.value);
          continue;
        }
        if (t.type === TokenType.STRING) {
          operands.push({ kind: "string", bytes: t.value });
          continue;
        }
        if (t.type === TokenType.NAME) {
          operands.push({ kind: "name", name: t.value });
          continue;
        }
        if (t.type === TokenType.ARRAY_OPEN) {
          const p = new Parser(data, t.pos);
          try {
            operands.push(p.parseObject());
            lex.pos = p.pos;
          } catch {
            operands = [];
          }
          continue;
        }
        if (t.type === TokenType.DICT_OPEN) {
          const p = new Parser(data, t.pos);
          try {
            operands.push(p.parseObject());
            lex.pos = p.pos;
          } catch {
            operands = [];
          }
          continue;
        }
        if (t.type === TokenType.ARRAY_CLOSE || t.type === TokenType.DICT_CLOSE) continue;
        const op = t.value;
        switch (op) {
          // --- graphics state ---
          case "q":
            gsStack.push({ ctm, font, fontSize, charSpacing, wordSpacing, hScale, leading, rise, renderMode });
            break;
          case "Q": {
            const s = gsStack.pop();
            if (s) {
              ({ ctm, font, fontSize, charSpacing, wordSpacing, hScale, leading, rise, renderMode } = s);
            }
            break;
          }
          case "cm": {
            const [a, b, c, d, e, f] = operands.slice(-6).map(num2);
            if (operands.length >= 6) ctm = mul([a, b, c, d, e, f], ctm);
            break;
          }
          // --- text object ---
          case "BT":
            tm = IDENTITY;
            tlm = IDENTITY;
            break;
          case "ET":
            break;
          // --- text state ---
          case "Tf": {
            const size = num2(operands[operands.length - 1]);
            const nameOp = operands[operands.length - 2];
            fontSize = size;
            font = this._lookupFont(resources, nameOp && nameOp.name);
            break;
          }
          case "Tc":
            charSpacing = num2(operands[operands.length - 1]);
            break;
          case "Tw":
            wordSpacing = num2(operands[operands.length - 1]);
            break;
          case "Tz":
            hScale = num2(operands[operands.length - 1]) / 100 || 1;
            break;
          case "TL":
            leading = num2(operands[operands.length - 1]);
            break;
          case "Ts":
            rise = num2(operands[operands.length - 1]);
            break;
          case "Tr":
            renderMode = num2(operands[operands.length - 1]);
            break;
          // --- text positioning ---
          case "Td": {
            const ty = num2(operands[operands.length - 1]);
            const tx = num2(operands[operands.length - 2]);
            nextLine(tx, ty);
            break;
          }
          case "TD": {
            const ty = num2(operands[operands.length - 1]);
            const tx = num2(operands[operands.length - 2]);
            leading = -ty;
            nextLine(tx, ty);
            break;
          }
          case "Tm": {
            if (operands.length >= 6) {
              const [a, b, c, d, e, f] = operands.slice(-6).map(num2);
              tlm = [a, b, c, d, e, f];
              tm = tlm;
            }
            break;
          }
          case "T*":
            nextLine(0, -leading);
            break;
          // --- text showing ---
          case "Tj": {
            const s = operands[operands.length - 1];
            if (s && s.kind === "string") showString(s.bytes);
            break;
          }
          case "TJ": {
            const arr = operands[operands.length - 1];
            if (arr && arr.kind === "array") {
              for (const el of arr.items) {
                if (el && el.kind === "string") showString(el.bytes);
                else if (typeof el === "number") adjustTJ(el);
              }
            }
            break;
          }
          case "'": {
            const s = operands[operands.length - 1];
            nextLine(0, -leading);
            if (s && s.kind === "string") showString(s.bytes);
            break;
          }
          case '"': {
            const s = operands[operands.length - 1];
            wordSpacing = num2(operands[operands.length - 3]);
            charSpacing = num2(operands[operands.length - 2]);
            nextLine(0, -leading);
            if (s && s.kind === "string") showString(s.bytes);
            break;
          }
          // --- XObjects ---
          case "Do": {
            const nameOp = operands[operands.length - 1];
            this._runXObject(resources, nameOp && nameOp.name, ctm, depth);
            break;
          }
          // --- inline images: skip the binary payload ---
          case "BI": {
            lex.pos = skipInlineImage(data, lex.pos);
            break;
          }
          default:
            break;
        }
        operands = [];
      }
    }
    _lookupFont(resources, name) {
      if (!name || !isDict(resources)) return null;
      const fonts = this.doc.resolve(dictGet(resources, "Font"));
      if (!isDict(fonts)) return null;
      const ref = dictGet(fonts, name);
      const key = ref && ref.kind === "ref" ? `r${ref.num}` : `${name}@${resourceId(resources)}`;
      if (this.fontCache.has(key)) return this.fontCache.get(key);
      const fontDict = this.doc.resolve(ref);
      if (!isDict(fontDict)) return null;
      let f = null;
      try {
        f = new Font(this.doc, fontDict);
      } catch (e) {
        this.warnings.push(`font ${name} failed to load: ${e.message}`);
      }
      this.fontCache.set(key, f);
      return f;
    }
    _runXObject(resources, name, ctm, depth) {
      if (!name || !isDict(resources)) return;
      const xobjects = this.doc.resolve(dictGet(resources, "XObject"));
      if (!isDict(xobjects)) return;
      const xobj = this.doc.resolve(dictGet(xobjects, name));
      if (!isStream(xobj)) return;
      const subtype = this.doc.resolve(dictGet(xobj.dict, "Subtype"));
      if (!isName(subtype) || subtype.name !== "Form") return;
      let data;
      try {
        data = decodeStream(xobj, (x) => this.doc.resolve(x)).data;
      } catch (e) {
        this.warnings.push(`form XObject ${name} decode failed: ${e.message}`);
        return;
      }
      const matrix = this.doc.resolve(dictGet(xobj.dict, "Matrix"));
      let formCTM = ctm;
      if (isArray(matrix) && matrix.items.length >= 6) {
        const m = matrix.items.map((v) => typeof v === "number" ? v : 0);
        formCTM = mul(m, ctm);
      }
      const ownRes = this.doc.resolve(dictGet(xobj.dict, "Resources")) ?? resources;
      this.execute(data, ownRes, formCTM, depth + 1);
    }
  };
  function skipInlineImage(data, pos) {
    const idIdx = data.indexOf(import_buffer.Buffer.from("ID", "latin1"), pos);
    if (idIdx < 0) return data.length;
    let p = idIdx + 2;
    if (p < data.length && (data[p] === 32 || data[p] === 10 || data[p] === 13)) p++;
    for (let i = p; i + 1 < data.length; i++) {
      if (data[i] === 69 && data[i + 1] === 73) {
        const before = i === 0 ? 32 : data[i - 1];
        const after = i + 2 < data.length ? data[i + 2] : 32;
        const isWs = (b) => b === 32 || b === 10 || b === 13 || b === 9 || b === 0 || b === 12;
        if (isWs(before) && (isWs(after) || i + 2 >= data.length)) return i + 2;
      }
    }
    return data.length;
  }
  var resourceCounter = 0;
  var resourceIds = /* @__PURE__ */ new WeakMap();
  function resourceId(res) {
    if (!resourceIds.has(res)) resourceIds.set(res, ++resourceCounter);
    return resourceIds.get(res);
  }

  // src/text.js
  function extractText(buf, { pageNumbers = null, layout = false, password = "" } = {}) {
    const doc = PDFDocument.load(buf, { password });
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
        text: layout ? layoutText(items) : lines.map((l) => l.text).join("\n"),
        itemCount: items.length
      });
    });
    return {
      pages: out,
      warnings: [...doc.warnings, ...extractor.warnings],
      encrypted: isEncrypted(doc)
    };
  }
  function isEncrypted(doc) {
    if (!doc.trailer) return false;
    return doc.trailer.map.has("Encrypt");
  }
  function assembleLines(items) {
    if (items.length === 0) return [];
    const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
    const lines = [];
    let current = null;
    for (const item of sorted) {
      const tol = Math.max(1, (item.fontSize || 10) * 0.4);
      if (current && Math.abs(item.y - current.y) <= tol) {
        current.items.push(item);
        current.y = (current.y * (current.items.length - 1) + item.y) / current.items.length;
      } else {
        current = { y: item.y, items: [item] };
        lines.push(current);
      }
    }
    return lines.map((line) => {
      line.items.sort((a, b) => a.x - b.x);
      let text = "";
      let prevEnd = null;
      for (const it of line.items) {
        if (prevEnd !== null) {
          const gap = it.x - prevEnd;
          const space = it.spaceWidth || (it.fontSize || 10) * 0.25;
          if (gap > space * 0.3 && !/\s$/.test(text) && !/^\s/.test(it.text)) {
            text += gap > space * 2.5 ? "  " : " ";
          }
        }
        text += it.text;
        prevEnd = it.x + it.width;
      }
      return {
        y: round(line.y),
        x: round(line.items[0].x),
        text: text.replace(/\s+$/, "")
      };
    }).filter((l) => l.text.length > 0);
  }
  function round(n) {
    return Math.round(n * 100) / 100;
  }
  function layoutText(items, { charWidth = null } = {}) {
    if (items.length === 0) return "";
    const advances = items.filter((it) => it.text.length > 0).map((it) => it.width / it.text.length).filter((w) => w > 0).sort((a, b) => a - b);
    const cell = charWidth || (advances.length ? advances[Math.floor(advances.length / 2)] : 5) || 5;
    const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
    const rows = [];
    let current = null;
    for (const item of sorted) {
      const tol = Math.max(1, (item.fontSize || 10) * 0.4);
      if (current && Math.abs(item.y - current.y) <= tol) {
        current.items.push(item);
      } else {
        current = { y: item.y, fontSize: item.fontSize || 10, items: [item] };
        rows.push(current);
      }
    }
    const minX = Math.min(...items.map((it) => it.x));
    const out = [];
    let prevY = null;
    for (const row of rows) {
      if (prevY !== null) {
        const gap = prevY - row.y;
        const lh = row.fontSize * 1.2;
        const blanks = Math.min(5, Math.max(0, Math.round(gap / lh) - 1));
        for (let i = 0; i < blanks; i++) out.push("");
      }
      prevY = row.y;
      row.items.sort((a, b) => a.x - b.x);
      let line = "";
      for (const it of row.items) {
        const col = Math.max(0, Math.round((it.x - minX) / cell));
        if (col > line.length) line += " ".repeat(col - line.length);
        line += (line.length > 0 && col <= line.length && !/\s$/.test(line) ? " " : "") + it.text;
      }
      out.push(line.replace(/\s+$/, ""));
    }
    return out.join("\n");
  }

  // src/metadata.js
  init_buffer_inject();
  var INFO_KEYS = ["Title", "Author", "Subject", "Keywords", "Creator", "Producer", "CreationDate", "ModDate", "Trapped"];
  function readMetadata(doc) {
    return {
      info: readInfo(doc),
      xmp: readXmp(doc)
    };
  }
  function readInfo(doc) {
    const info = doc.resolve(doc.trailer && dictGet(doc.trailer, "Info"));
    if (!isDict(info)) return null;
    const out = {};
    for (const key of INFO_KEYS) {
      const v = doc.resolve(dictGet(info, key));
      if (v === void 0) continue;
      if (v && v.kind === "string") out[key] = decodeTextString(v.bytes, key);
      else if (isName(v)) out[key] = `/${v.name}`;
      else if (v === true || v === false) out[key] = v;
    }
    for (const [k] of info.map) {
      if (INFO_KEYS.includes(k) || Object.hasOwn(out, k)) continue;
      const v = doc.resolve(dictGet(info, k));
      if (v && v.kind === "string") out[k] = decodeTextString(v.bytes, k);
    }
    return Object.keys(out).length ? out : null;
  }
  function readXmp(doc) {
    const catalog = doc.getCatalog();
    const meta = doc.resolve(catalog && dictGet(catalog, "Metadata"));
    if (!isStream(meta)) return null;
    let xml;
    try {
      xml = decodeStream(meta, (x) => doc.resolve(x)).data.toString("utf8");
    } catch {
      return null;
    }
    const fields = {};
    const add = (label, value) => {
      if (value && !(label in fields)) fields[label] = value;
    };
    const SIMPLE = [
      "xmp:CreatorTool",
      "xmp:CreateDate",
      "xmp:ModifyDate",
      "xmp:MetadataDate",
      "pdf:Producer",
      "pdf:Keywords",
      "xmpMM:DocumentID",
      "xmpMM:InstanceID"
    ];
    const RDF = ["dc:title", "dc:creator", "dc:description", "dc:subject", "dc:rights"];
    for (const tag of RDF) add(tag, rdfText(xml, tag));
    for (const tag of SIMPLE) add(tag, tagText(xml, tag) || attrVal(xml, tag));
    return {
      bytes: import_buffer.Buffer.byteLength(xml, "utf8"),
      fields: Object.keys(fields).length ? fields : null
    };
  }
  function decodeTextString(bytes, key) {
    let s;
    if (bytes.length >= 2 && bytes[0] === 254 && bytes[1] === 255) {
      s = import_buffer.Buffer.from(bytes.subarray(2)).swap16().toString("utf16le");
    } else if (bytes.length >= 3 && bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191) {
      s = bytes.subarray(3).toString("utf8");
    } else {
      s = bytes.toString("latin1");
    }
    if (/Date$/.test(key)) return formatPdfDate(s) || s;
    return s;
  }
  function formatPdfDate(s) {
    const m = /^D?:?(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?([Z+-])?(\d{2})?'?(\d{2})?'?/.exec(s);
    if (!m) return null;
    const [, y, mo = "01", d = "01", h = "00", mi = "00", se = "00", tzSign, tzH, tzM] = m;
    let out = `${y}-${mo}-${d} ${h}:${mi}:${se}`;
    if (tzSign === "Z") out += " UTC";
    else if (tzSign && tzH) out += ` ${tzSign}${tzH}:${tzM || "00"}`;
    return out;
  }
  function tagText(xml, tag) {
    const m = new RegExp(`<${escapeTag(tag)}[^>]*>([\\s\\S]*?)</${escapeTag(tag)}>`).exec(xml);
    return m ? m[1].trim() : null;
  }
  function rdfText(xml, tag) {
    const block = tagText(xml, tag);
    if (!block) return null;
    const li = /<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>/.exec(block);
    return (li ? li[1] : block).trim() || null;
  }
  function attrVal(xml, prop) {
    const m = new RegExp(`\\b${escapeTag(prop)}\\s*=\\s*"([^"]*)"`).exec(xml);
    return m ? m[1].trim() || null : null;
  }
  function escapeTag(t) {
    return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // browser/entry.js
  function readDocument(data) {
    const buf = import_buffer.Buffer.from(data);
    const doc = PDFDocument.load(buf);
    const meta = readMetadata(doc);
    const title = meta.info && meta.info.Title || meta.xmp && meta.xmp.fields && meta.xmp.fields["dc:title"] || null;
    const extractor = new TextExtractor(doc);
    const pages = doc.getPages().map((page, i) => {
      let items = [];
      try {
        items = extractor.runPage(page);
      } catch (e) {
        extractor.warnings.push(`page ${i + 1}: ${e.message}`);
      }
      const lines = assembleLines(items);
      return { page: i + 1, lines };
    });
    return {
      title,
      author: meta.info && meta.info.Author,
      pages,
      encrypted: !!(doc.trailer && doc.trailer.map.has("Encrypt")),
      decryptable: !!doc.security,
      recovered: doc.recovered,
      warnings: [...doc.warnings, ...extractor.warnings]
    };
  }
  return __toCommonJS(entry_exports);
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/
