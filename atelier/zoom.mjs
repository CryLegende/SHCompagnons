// Agrandit les six faces de têtes existantes (textures.minecraft.net) pour les regarder de près.
// Usage : node zoom.mjs <sortie.png> <empreinte> [<empreinte> ...]
import { writeFileSync } from 'node:fs';
import { encodePng } from './png.mjs';
import { texture } from './modeles/_aides.mjs';

const [out, ...hashes] = process.argv.slice(2);
const K = 20, FACES = [[8, 8], [16, 8], [24, 8], [0, 8], [8, 0], [16, 0]];   // face, +x, dos, -x, dessus, dessous
const W = FACES.length * (8 * K + 6) + 6, H = hashes.length * (8 * K + 6) + 6;
const px = new Uint8Array(W * H * 4).fill(255);
for (const [row, hash] of hashes.entries()) {
    const img = await texture(hash);
    for (const [col, [fx, fy]] of FACES.entries()) {
        for (let y = 0; y < 8 * K; y++) for (let x = 0; x < 8 * K; x++) {
            const s = ((fy + Math.floor(y / K)) * 64 + fx + Math.floor(x / K)) * 4;
            const d = ((6 + row * (8 * K + 6) + y) * W + 6 + col * (8 * K + 6) + x) * 4;
            px[d] = img[s]; px[d + 1] = img[s + 1]; px[d + 2] = img[s + 2]; px[d + 3] = 255;
        }
    }
}
writeFileSync(out, encodePng(W, H, px));
