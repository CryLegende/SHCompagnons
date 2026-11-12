// Agrandit des images PNG (pixels nets) et les range côte à côte, pour regarder de près une texture de référence.
// Usage : node agrandir.mjs <sortie.png> <facteur> <image.png | url> [...]
import { readFileSync, writeFileSync } from 'node:fs';
import { decodePng, encodePng } from './png.mjs';

const [out, factor, ...sources] = process.argv.slice(2);
const K = Number(factor), images = [];
for (const src of sources) {
    const buf = /^https?:/.test(src) ? Buffer.from(await (await fetch(src, { headers: { 'User-Agent': 'Mozilla/5.0' } })).arrayBuffer()) : readFileSync(src);
    try { images.push(decodePng(buf)); } catch (e) { console.log('illisible : ' + src + ' (' + e.message + ')'); }
}
const W = images.reduce((n, i) => n + i.w * K + 8, 8), H = Math.max(...images.map((i) => i.h * K)) + 16;
const px = new Uint8Array(W * H * 4);
for (let i = 0; i < W * H; i++) { px[i * 4] = 110; px[i * 4 + 1] = 130; px[i * 4 + 2] = 150; px[i * 4 + 3] = 255; }
let x0 = 8;
for (const img of images) {
    for (let y = 0; y < img.h * K; y++) for (let x = 0; x < img.w * K; x++) {
        const s = (Math.floor(y / K) * img.w + Math.floor(x / K)) * 4, d = ((8 + y) * W + x0 + x) * 4, a = img.rgba[s + 3] / 255;
        for (let c = 0; c < 3; c++) px[d + c] = Math.round(img.rgba[s + c] * a + px[d + c] * (1 - a));
    }
    x0 += img.w * K + 8;
}
writeFileSync(out, encodePng(W, H, px));
console.log(out, W + 'x' + H);
