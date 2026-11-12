// PNG RGBA minimal (écriture et lecture), sans dépendance.
import { deflateSync, inflateSync } from 'node:zlib';

const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0); out.write(type, 4, 'ascii'); data.copy(out, 8);
    out.writeUInt32BE(crc(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
}
/** rgba : Uint8Array de w*h*4 octets. */
export function encodePng(w, h, rgba) {
    const raw = Buffer.alloc((w * 4 + 1) * h);
    for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
    const head = Buffer.alloc(13); head.writeUInt32BE(w, 0); head.writeUInt32BE(h, 4); head[8] = 8; head[9] = 6;
    return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
/** Lit un PNG non entrelacé de 1 à 8 bits par canal (RGBA, RGB, palette, gris) → { w, h, rgba }. */
export function decodePng(buf) {
    let pos = 8, w = 0, h = 0, type = 0, depth = 8, plte = null, trns = null; const idat = [];
    while (pos < buf.length) {
        const len = buf.readUInt32BE(pos), t = buf.toString('ascii', pos + 4, pos + 8), d = buf.subarray(pos + 8, pos + 8 + len);
        if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; type = d[9]; if (depth > 8 || d[12] !== 0) throw new Error('PNG non géré (profondeur ' + depth + ', entrelacement ' + d[12] + ')'); }
        else if (t === 'PLTE') plte = d; else if (t === 'tRNS') trns = d; else if (t === 'IDAT') idat.push(d);
        pos += 12 + len;
    }
    const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type];
    const bpp = Math.max(1, channels * depth / 8), stride = Math.ceil(w * channels * depth / 8), raw = inflateSync(Buffer.concat(idat)), px = Buffer.alloc(stride * h);
    for (let y = 0; y < h; y++) {
        const f = raw[y * (stride + 1)];
        for (let x = 0; x < stride; x++) {
            const a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0;
            let v = raw[y * (stride + 1) + 1 + x];
            if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
            else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
            px[y * stride + x] = v & 255;
        }
    }
    // Valeur du canal n du pixel (x, y) ; en dessous de 8 bits, les valeurs sont tassées dans les octets
    const sample = (x, y, n) => {
        if (depth === 8) return px[y * stride + x * channels + n];
        const bit = x * depth, byte = px[y * stride + (bit >> 3)];
        return (byte >> (8 - depth - (bit & 7))) & ((1 << depth) - 1);
    };
    const full = (v) => (depth === 8 ? v : Math.round(v * 255 / ((1 << depth) - 1)));
    const rgba = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (type === 6) for (let n = 0; n < 4; n++) rgba[i + n] = sample(x, y, n);
        else if (type === 2) { for (let n = 0; n < 3; n++) rgba[i + n] = sample(x, y, n); rgba[i + 3] = 255; }
        else if (type === 3) { const k = sample(x, y, 0); rgba.set(plte.subarray(k * 3, k * 3 + 3), i); rgba[i + 3] = trns && k < trns.length ? trns[k] : 255; }
        else if (type === 0) { rgba.fill(full(sample(x, y, 0)), i, i + 3); rgba[i + 3] = 255; }
        else { rgba.fill(sample(x, y, 0), i, i + 3); rgba[i + 3] = sample(x, y, 1); }
    }
    return { w, h, rgba };
}
