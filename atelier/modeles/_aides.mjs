// Aides communes aux modèles : cycles de textures, textures existantes relues et redécoupées.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng } from '../png.mjs';

const CACHE = join(dirname(fileURLToPath(import.meta.url)), '..', 'sortie', 'cache');

/**
 * Animation qui fait défiler des textures existantes sur des pièces : skins = [{ h: empreinte, t: ticks }, ...].
 * La première texture est celle de la pose de base.
 */
export function cycle(partIds, skins) {
    const keys = [];
    let t = 0;
    for (let i = 0; i < skins.length; i++) {
        if (i > 0) keys.push({ t, parts: Object.fromEntries(partIds.map((id) => [id, { skin: { url: skins[i].h } }])) });
        t += skins[i].t;
    }
    return { loop: t, keys };
}

/** Pixels RGBA (64x64) d'une texture de textures.minecraft.net ; une ancienne peau 64x32 est complétée par du vide. */
export async function texture(hash) {
    mkdirSync(CACHE, { recursive: true });
    const file = join(CACHE, hash + '.png');
    if (!existsSync(file)) {
        const r = await fetch('https://textures.minecraft.net/texture/' + hash);
        if (!r.ok) throw new Error('texture introuvable : ' + hash);
        writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    }
    const img = decodePng(readFileSync(file));
    const out = new Uint8Array(64 * 64 * 4);
    for (let y = 0; y < Math.min(64, img.h); y++) out.set(img.rgba.subarray(y * img.w * 4, y * img.w * 4 + 64 * 4), y * 64 * 4);
    return out;
}

const SIDES = [[0, 8], [8, 8], [16, 8], [24, 8]];
/**
 * Découpe une tête en n tranches horizontales (n divise 8) : rend n peaux, de haut en bas. Chaque tranche montre sa
 * part des quatre côtés, étirée sur toute la hauteur de sa face ; le dessus de la première et le dessous de la
 * dernière sont ceux de la tête, les faces cachées entre deux tranches prennent la couleur « inside » [r, v, b].
 */
export function slices(rgba, n, inside) {
    const rows = 8 / n, out = [];
    for (let k = 0; k < n; k++) {
        const px = new Uint8Array(64 * 64 * 4);
        const put = (x, y, c) => { const i = (y * 64 + x) * 4; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255; };
        const get = (x, y) => { const i = (y * 64 + x) * 4; return [rgba[i], rgba[i + 1], rgba[i + 2]]; };
        for (const [sx, sy] of SIDES) for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) put(sx + x, sy + y, get(sx + x, sy + k * rows + Math.floor(y / n)));
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
            const shade = 0.88 + 0.12 * (((x * 7 + y * 13 + k * 5) % 5) / 4);
            const inner = inside.map((v) => Math.round(v * shade));
            put(8 + x, y, k === 0 ? get(8 + x, y) : inner);
            put(16 + x, y, k === n - 1 ? get(16 + x, y) : inner);
        }
        out.push({ pixels: px });
    }
    return out;
}

/**
 * Peau unie : toutes les faces de la couleur [r, v, b], avec un grain (noise), des taches plus sombres ou plus claires
 * (spots, part des pixels) et un dégradé vers le bas (grad). La graine fixe le dessin d'une exécution à l'autre.
 */
export function plain(color, { noise = 0.05, spots = 0, grad = 0.1, seed = 1 } = {}) {
    const px = new Uint8Array(64 * 64 * 4);
    let state = (seed * 2654435761) >>> 0;
    const rnd = () => { state = (Math.imul(state ^ (state >>> 15), 2246822507) + 0x9e3779b9) >>> 0; return state / 4294967296; };
    for (const [ox, oy, vertical] of [[8, 0, 0], [16, 0, -1], [0, 8, 1], [8, 8, 1], [16, 8, 1], [24, 8, 1]]) {
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
            let k = 1 + noise * (rnd() * 2 - 1) + (vertical === 1 ? grad * (0.5 - y / 7) : vertical === -1 ? -grad : grad * 0.3);
            const r = rnd();
            if (r < spots) k *= 0.86; else if (r > 1 - spots) k *= 1.1;
            const i = ((oy + y) * 64 + ox + x) * 4;
            for (let c = 0; c < 3; c++) px[i + c] = Math.max(0, Math.min(255, Math.round(color[c] * k)));
            px[i + 3] = 255;
        }
    }
    return { pixels: px };
}

/** Couleur moyenne [r, v, b] d'une zone d'une texture. */
export function average(rgba, x0, y0, w, h) {
    const sum = [0, 0, 0];
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) for (let c = 0; c < 3; c++) sum[c] += rgba[(y * 64 + x) * 4 + c];
    return sum.map((v) => Math.round(v / (w * h)));
}

/**
 * Clignement des yeux d'une pièce : animation qui remplace quelques lignes de sa face avant pendant 4 ticks, à la fin
 * d'un cycle de « loop » ticks. rows : { numéro de ligne : nouvelle ligne de 8 caractères }.
 */
export function clin(def, partId, rows, loop) {
    const part = def.parts.find((p) => p.id === partId);
    if (!part || !Array.isArray(part.skin.front)) throw new Error('clin : pièce ' + partId + ' sans face avant dessinée');
    const front = part.skin.front.map((line, i) => rows[i] || line);
    return { loop, keys: [{ t: loop - 4, parts: { [partId]: { skin: { ...part.skin, front } } } }] };
}
