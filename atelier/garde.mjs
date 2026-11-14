// Reprend un modèle de l'ancien format (fichier de modèle livré, pose de base) en cubes Blockbench : même géométrie,
// mêmes têtes. Sert aux compagnons que Cry a gardés tels qu'ils étaient (Steve, Alex, le zombie, R2-D2, le golem de
// cuivre) pour leur donner les états idle, walk et interact sans toucher à leur apparence.
// Usage : node garde.mjs <nom> [--demitour]
//   Écrit blockbench/garde/<nom>.json : une pièce par entité, dans l'ordre du fichier, avec from / to / pivot / rot
//   (repère Blockbench) et les six faces pixel par pixel ({ px }) lues dans la peau d'origine. Une description
//   blockbench/<nom>.mjs range ensuite ces pièces dans ses os et écrit ses animations.
//   Ajoute aussi à textures.json l'empreinte Mojang d'origine de chaque tête refaite : rien à téléverser, la tête
//   montrée en jeu reste exactement la même.
//   --demitour : le modèle d'origine regardait vers l'arrière (rotation y 170 dans la config) ; il est retourné.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng } from './png.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
const turn = process.argv.includes('--demitour');
if (!name) { console.log('Usage : node garde.mjs <nom> [--demitour]'); process.exit(1); }

const qMul = (a, b) => [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const qRot = (q, v) => {
    const [x, y, z, w] = q, [vx, vy, vz] = v;
    const tx = 2 * (y * vz - z * vy), ty = 2 * (z * vx - x * vz), tz = 2 * (x * vy - y * vx);
    return [vx + w * tx + y * tz - z * ty, vy + w * ty + z * tx - x * tz, vz + w * tz + x * ty - y * tx];
};
const Y180 = [0, 1, 0, 0], NOT_Y180 = [0, -1, 0, 0];
const r4 = (v) => Math.round(v * 1e4) / 1e4;
/** Angles d'Euler Blockbench (degrés, ordre ZYX) d'un quaternion du repère Blockbench. */
function euler(q) {
    const [x, y, z, w] = q;
    const m00 = 1 - 2 * (y * y + z * z), m10 = 2 * (x * y + z * w), m20 = 2 * (x * z - y * w), m21 = 2 * (y * z + x * w), m22 = 1 - 2 * (x * x + y * y);
    const D = 180 / Math.PI;
    return [Math.atan2(m21, m22) * D, Math.asin(Math.max(-1, Math.min(1, -m20))) * D, Math.atan2(m10, m00) * D].map(r4);
}

const text = readFileSync(join(HERE, '..', 'src/main/resources/models', name + '.txt'), 'utf8');
const base = text.split(/\n@/)[0];
const parts = [];
const nums = (s) => s.split(',').map((v) => parseFloat(v));
/** Fin (indice après l'accolade fermante) de l'objet NBT qui commence à start ; les chaînes sont sautées. */
function close(s, start) {
    let depth = 0, quote = false;
    for (let i = start; i < s.length; i++) {
        const ch = s[i];
        if (quote) { if (ch === '\\') i++; else if (ch === '"') quote = false; continue; }
        if (ch === '"') quote = true; else if (ch === '{' || ch === '[') depth++; else if (ch === '}' || ch === ']') { depth--; if (!depth) return i + 1; }
    }
    throw new Error('NBT non fermé');
}
/** Quaternion d'une matrice de rotation donnée par ses colonnes. */
function qFromColumns(c0, c1, c2) {
    const m00 = c0[0], m10 = c0[1], m20 = c0[2], m01 = c1[0], m11 = c1[1], m21 = c1[2], m02 = c2[0], m12 = c2[1], m22 = c2[2], tr = m00 + m11 + m22;
    let q;
    if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; q = [(m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, s / 4]; }
    else if (m00 > m11 && m00 > m22) { const s = Math.sqrt(1 + m00 - m11 - m22) * 2; q = [s / 4, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s]; }
    else if (m11 > m22) { const s = Math.sqrt(1 + m11 - m00 - m22) * 2; q = [(m01 + m10) / s, s / 4, (m12 + m21) / s, (m02 - m20) / s]; }
    else { const s = Math.sqrt(1 + m22 - m00 - m11) * 2; q = [(m02 + m20) / s, (m12 + m21) / s, s / 4, (m10 - m01) / s]; }
    const n = Math.hypot(...q);
    return q.map((v) => v / n);
}
// Chaque passager du premier /summon : transformation écrite en { left_rotation... } ou en matrice de 16 nombres
for (const m of base.matchAll(/\{id:"minecraft:(item_display|block_display)"/g)) {
    const body = base.slice(m.index, close(base, m.index));
    if (/Passengers:/.test(body)) continue;
    const item = /item:\{id:"minecraft:(\w+)"/.exec(body), value = /value:"([^"]+)"/.exec(body), block = /block_state:\{(?:Name|id):"minecraft:(\w+)"/.exec(body);
    let l, t, s;
    const split = /transformation:\{left_rotation:\[([^\]]*)\],right_rotation:\[([^\]]*)\],translation:\[([^\]]*)\],scale:\[([^\]]*)\]\}/.exec(body);
    const matrix = /transformation:\[([^\]]*)\]/.exec(body);
    if (split) {
        if (nums(split[2]).some((v, i) => Math.abs(v - [0, 0, 0, 1][i]) > 1e-4)) throw new Error('right_rotation non nulle : non géré');
        l = nums(split[1]); t = nums(split[3]); s = nums(split[4]);
    } else if (matrix) {
        const M = nums(matrix[1].replace(/f/g, ''));
        const cols = [0, 1, 2].map((c) => [M[c], M[4 + c], M[8 + c]]);
        s = cols.map((c) => Math.hypot(...c));
        const axes = cols.map((c, i) => c.map((v) => v / s[i]));
        const skew = Math.max(...[[0, 1], [0, 2], [1, 2]].map(([a, b]) => Math.abs(axes[a].reduce((n, v, k) => n + v * axes[b][k], 0))));
        if (skew > 1e-3) console.log('  ! matrice déformée en biais (' + skew.toFixed(4) + ') : forme approchée');
        l = qFromColumns(...axes); t = [M[3], M[7], M[11]];
    } else throw new Error('transformation illisible');
    parts.push({ entity: m[1], item: item && item[1], block: block && block[1], value: value && value[1], l, t, s });
}

const REGION = { front: [8, 8], back: [24, 8], px: [16, 8], nx: [0, 8], top: [8, 0], bottom: [16, 0] };
const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
const cache = join(HERE, 'sortie', 'cache');
mkdirSync(cache, { recursive: true });
const texFile = join(HERE, 'textures.json');
const textures = JSON.parse(readFileSync(texFile, 'utf8'));
let added = 0;

const out = [];
for (const [n, p] of parts.entries()) {
    let q, c, size;
    if (p.entity === 'block_display') {
        // Bloc : coin + rotation ; repris par sa boîte englobante, droit (le paratonnerre du golem, retourné deux fois)
        const corners = [];
        for (const x of [0, 1]) for (const y of [0, 1]) for (const z of [0, 1]) corners.push(qRot(p.l, [x * p.s[0], y * p.s[1], z * p.s[2]]).map((v, i) => v + p.t[i]));
        const lo = [0, 1, 2].map((i) => Math.min(...corners.map((k) => k[i]))), hi = [0, 1, 2].map((i) => Math.max(...corners.map((k) => k[i])));
        q = [0, 0, 0, 1]; c = lo.map((v, i) => (v + hi[i]) / 2 * 16); size = lo.map((v, i) => (hi[i] - v) * 16);
    } else if (p.item === 'player_head') {
        q = qMul(p.l, NOT_Y180);
        const lift = qRot(q, [0, p.s[1] / 4, 0]);
        c = p.t.map((v, i) => (v - lift[i]) * 16); size = p.s.map((v) => v * 8);
    } else {
        q = qMul(p.l, NOT_Y180);
        c = p.t.map((v) => v * 16); size = [p.s[0] * 16, p.s[0] * 16, 0.5];
    }
    if (turn) { c = [-c[0], c[1], -c[2]]; if (p.entity !== 'block_display') q = qMul(Y180, q); }
    // Repère de l'atelier (+z devant, +x à gauche) → Blockbench (demi-tour autour de la verticale)
    const centre = [-c[0], c[1], -c[2]], qb = [-q[0], q[1], -q[2], q[3]];
    const rot = euler(qb);
    const cube = {
        name: (p.entity === 'block_display' ? 'bloc:' + p.block : p.item === 'player_head' ? '' : 'objet:' + p.item) + '#' + n,
        from: centre.map((v, i) => r4(v - size[i] / 2)), to: centre.map((v, i) => r4(v + size[i] / 2)), pivot: centre.map(r4),
        ...(rot.some((v) => Math.abs(v) > 1e-3) ? { rot } : {}),
    };
    if (p.item === 'player_head') {
        const hash = JSON.parse(Buffer.from(p.value, 'base64').toString('utf8')).textures.SKIN.url.split('/').pop();
        const file = join(cache, hash + '.png');
        if (!existsSync(file)) { const r = await fetch('https://textures.minecraft.net/texture/' + hash); if (!r.ok) throw new Error('peau ' + hash + ' : ' + r.status); writeFileSync(file, Buffer.from(await r.arrayBuffer())); }
        const img = decodePng(readFileSync(file));
        const at = (x, y) => { const i = (y * img.w + x) * 4; return [img.rgba[i], img.rgba[i + 1], img.rgba[i + 2], img.rgba[i + 3]]; };
        // Calque du chapeau : il se verrait en jeu par-dessus la tête refaite, qui n'en a pas
        let hat = 0;
        for (let y = 0; y < 16; y++) for (let x = 32; x < 64; x++) if (at(x, y)[3] > 0) hat++;
        if (hat) console.log('  ! pièce ' + n + ' : ' + hat + ' pixels sur le calque du chapeau (perdus)');
        const region = (k) => { const [rx, ry] = REGION[k], o = []; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) o.push(at(rx + x, ry + y)); return o; };
        // Inverse de skinOf (bbmodel.mjs) : dessus rangé tourné d'un demi-tour, dessous tourné puis retourné
        const top = region('top').reverse(), bottomRegion = region('bottom'), bottom = [];
        for (let j = 0; j < 64; j++) { const k = 63 - j; bottom.push(bottomRegion[(7 - Math.floor(k / 8)) * 8 + (k % 8)]); }
        const faces = { north: region('front'), south: region('back'), west: region('px'), east: region('nx'), up: top, down: bottom };
        let clear = 0;
        for (const f of Object.values(faces)) for (const px of f) if (px[3] < 128) clear++;
        if (clear) console.log('  ! pièce ' + n + ' : ' + clear + ' pixels transparents');
        cube.faces = Object.fromEntries(Object.entries(faces).map(([k, f]) => [k, { px: f.map((v) => hex(v[0], v[1], v[2])) }]));
        // Peau que bbmodel.mjs refera de ces faces : même empreinte Mojang que l'originale
        const skin = new Uint8Array(64 * 64 * 4);
        for (const [k, [rx, ry]] of Object.entries(REGION)) for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
            const v = at(rx + x, ry + y), i = ((ry + y) * 64 + rx + x) * 4;
            skin[i] = v[0]; skin[i + 1] = v[1]; skin[i + 2] = v[2]; skin[i + 3] = 255;
        }
        const sha = createHash('sha1').update(skin).digest('hex').slice(0, 20);
        if (!textures[sha]) { textures[sha] = hash; added++; }
        cube.skin = sha;
    } else cube.faces = { all: { px: Array(64).fill(p.entity === 'block_display' ? '#c06b4f' : '#5ad8d0') } };
    out.push(cube);
}
mkdirSync(join(HERE, 'blockbench', 'garde'), { recursive: true });
writeFileSync(join(HERE, 'blockbench', 'garde', name + '.json'), JSON.stringify(out));
if (added) writeFileSync(texFile, JSON.stringify(textures, null, 1));
console.log(name + ' : ' + out.length + ' pièces' + (added ? ', ' + added + ' empreinte(s) ajoutée(s) à textures.json' : ''));
for (const c of out) console.log('  ' + c.name.padEnd(28) + ' from ' + c.from.join(',') + '  to ' + c.to.join(',') + (c.rot ? '  rot ' + c.rot.join(',') : ''));
