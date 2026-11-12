// Atelier de compagnons : transforme la description d'un modèle (pièces = têtes de joueur texturées, étirées en
// boîtes, groupes articulés, animations par poses) en fichier de modèle SHCompagnons et en textures de têtes.
//
// Repère du modèle : unités en pixels (16 px = 1 bloc à l'échelle 1), y vers le haut, le modèle regarde vers +z,
// +x est à sa gauche (à droite de celui qui le regarde de face).
//
// Description (export default d'un fichier de modeles/) :
//   { name, title, palette: { car: '#rrggbb' | { c, n } }, noise, scale,
//     groups: { id: { pivot: [x,y,z], rot: [rx,ry,rz], move: [x,y,z], scale: k, stretch: [x,y,z], parent } },
//     parts:  [ { id, size: [l,h,p], pos: [x,y,z] (centre), rot: [rx,ry,rz], group, skin } ],
//     clips:  [ { loop: ticks, keys: [ { t, groups: { id: {...} }, parts: { id: { pos, rot, size, skin } } } ] } ],
//             un mouvement d'une clé à la suivante part et arrive en douceur (clés intermédiaires ajoutées dès qu'il
//             dure 8 ticks) ; « lineaire: true » sur l'animation, ou « sec: true » sur une clé, garde le trajet droit
//     frames: [ticks à montrer dans l'aperçu] }
// Une pose (clé) = la pose de base avec ses propres changements, pas ceux de la clé précédente.
//
// Texture d'une tête (skin) : { all, front, back, px, nx, sides, top, bottom, over: { mêmes clés } } où chaque face
// est un caractère de la palette (aplat) ou 8 lignes de 8 caractères ('.' = transparent, calque du dessus seulement).
//   front : vue de face ; back : vue de dos ; px / nx : vues de l'extérieur ; sides : px, repris en miroir pour nx ;
//   top : vu du dessus, l'avant en bas ; bottom : vu du dessous, l'avant en haut.
// Ou { url: '<empreinte textures.minecraft.net>' } pour une texture qui existe déjà, { pixels } pour une image 64x64.
// Une pièce peut aussi être un bloc ({ block: 'lime_stained_glass', size, pos }) ou un objet tenu, image plate
// ({ item: 'diamond_pickaxe', size: [côté en px], pos (centre), rot }).
import { createHash } from 'node:crypto';
import { encodePng } from './png.mjs';

// ---------------------------------------------------------------- maths
const RAD = Math.PI / 180;
export function qMul(a, b) {
    return [
        a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
        a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
        a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
        a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
}
const qAxis = (x, y, z, deg) => { const h = deg * RAD / 2, s = Math.sin(h); return [x * s, y * s, z * s, Math.cos(h)]; };
/** Rotation d'Euler en degrés, appliquée dans l'ordre z (roulis), x (tangage), y (lacet). */
export function qEuler([rx = 0, ry = 0, rz = 0] = []) {
    return qMul(qAxis(0, 1, 0, ry), qMul(qAxis(1, 0, 0, rx), qAxis(0, 0, 1, rz)));
}
export function qRot(q, v) {
    const [x, y, z, w] = q, [vx, vy, vz] = v;
    const tx = 2 * (y * vz - z * vy), ty = 2 * (z * vx - x * vz), tz = 2 * (x * vy - y * vx);
    return [vx + w * tx + y * tz - z * ty, vy + w * ty + z * tx - x * tz, vz + w * tz + x * ty - y * tx];
}
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

// ---------------------------------------------------------------- textures
function hash32(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rand(seed) { let t = (seed + 0x6d2b79f5) | 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function rgb(hex) { const h = hex.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length >= 8 ? parseInt(h.slice(6, 8), 16) : 255]; }

const REGION = { top: [8, 0], bottom: [16, 0], nx: [0, 8], front: [8, 8], px: [16, 8], back: [24, 8] };
const FACES = Object.keys(REGION);

function rows(face) {
    if (typeof face === 'string') return Array.from({ length: 8 }, () => face.repeat(8));
    if (!Array.isArray(face) || face.length !== 8 || face.some((r) => [...r].length !== 8)) throw new Error('face invalide (8 lignes de 8 caractères) : ' + JSON.stringify(face));
    return face;
}
const mirror = (face) => (typeof face === 'string' ? face : face.map((r) => [...r].reverse().join('')));

/** Dessine une couche (base ou calque) dans l'image de peau 64x64. */
function paintLayer(px, layer, ox, palette, noise, seed, opaque, grad) {
    for (const name of FACES) {
        let face = layer[name];
        if (face === undefined && name === 'px') face = layer.sides;
        if (face === undefined && name === 'nx' && layer.sides !== undefined) face = mirror(layer.sides);
        if (face === undefined) face = layer.all;
        if (face === undefined) { if (opaque) throw new Error('face ' + name + ' sans texture (ni all)'); continue; }
        let grid = rows(face);
        if (name === 'bottom') grid = grid.slice().reverse();
        const [rx, ry] = REGION[name];
        for (let y = 0; y < 8; y++) {
            const line = [...grid[y]];
            for (let x = 0; x < 8; x++) {
                const key = line[x];
                if (key === '.') { if (opaque) throw new Error('pixel transparent dans la couche de base'); continue; }
                const entry = palette[key];
                if (entry === undefined) throw new Error('couleur inconnue « ' + key + ' »');
                const color = rgb(typeof entry === 'string' ? entry : entry.c);
                const flat = typeof entry === 'object' && entry.n !== undefined;
                const amount = flat ? entry.n : noise;
                // Bruit par pixel, et dégradé : le haut des faces verticales un peu plus clair, le dessous plus sombre
                const shade = flat ? 0 : name === 'top' ? grad * 0.3 : name === 'bottom' ? -grad : grad * (0.5 - y / 7);
                const k = 1 + shade + amount * (rand(hash32(seed + name + x + ',' + y + key)) * 2 - 1);
                const i = ((ry + y) * 64 + rx + ox + x) * 4;
                for (let c = 0; c < 3; c++) px[i + c] = Math.max(0, Math.min(255, Math.round(color[c] * k)));
                px[i + 3] = opaque ? 255 : color[3];
            }
        }
    }
}

/** Peau 64x64 d'une tête → { png, sha } ; identique d'une exécution à l'autre (le bruit est fixé par la graine). */
export function skinPng(skin, palette, noise, seed, grad = 0.1) {
    // Peau déjà dessinée (image 64x64 en RGBA), par exemple découpée dans une texture existante
    if (skin.pixels) return { png: encodePng(64, 64, skin.pixels), sha: createHash('sha1').update(skin.pixels).digest('hex').slice(0, 20) };
    const px = new Uint8Array(64 * 64 * 4);
    const n = skin.noise !== undefined ? skin.noise : noise;
    const gr = skin.grad !== undefined ? skin.grad : grad;
    paintLayer(px, skin, 0, palette, n, skin.seed || seed, true, gr);
    if (skin.over) paintLayer(px, skin.over, 32, palette, n, (skin.seed || seed) + '+', false, gr);
    return { png: encodePng(64, 64, px), sha: createHash('sha1').update(px).digest('hex').slice(0, 20) };
}

// ---------------------------------------------------------------- pose → entités
const f = (v, d = 4) => { const s = (Math.round(v * 10 ** d) / 10 ** d).toString(); return (s === '-0' ? '0' : s) + 'f'; };

function posed(def, key) {
    const groups = {};
    for (const [id, g] of Object.entries(def.groups || {})) groups[id] = { ...g, ...((key && key.groups && key.groups[id]) || {}) };
    if (key && key.groups) for (const id of Object.keys(key.groups)) if (!groups[id]) throw new Error('pose : groupe inconnu ' + id);
    if (key && key.parts) for (const id of Object.keys(key.parts)) if (!def.parts.some((p) => p.id === id)) throw new Error('pose : pièce inconnue ' + id);
    return def.parts.map((base) => {
        const part = { ...base, ...((key && key.parts && key.parts[base.id]) || {}) };
        let c = part.pos.slice(), q = qEuler(part.rot), size = part.size.slice();
        for (let id = part.group; id; id = groups[id].parent) {
            const g = groups[id];
            if (!g) throw new Error('groupe inconnu ' + id);
            const pivot = g.pivot || [0, 0, 0], st = g.stretch || [1, 1, 1], u = g.scale === undefined ? 1 : g.scale, gq = qEuler(g.rot);
            let d = sub(c, pivot);
            d = [d[0] * st[0] * u, d[1] * st[1] * u, d[2] * st[2] * u];
            c = add(add(pivot, g.move || [0, 0, 0]), qRot(gq, d));
            q = qMul(gq, q);
            size = [size[0] * st[0] * u, size[1] * st[1] * u, size[2] * st[2] * u];
        }
        return { id: part.id, seedOf: part.seedOf, c, q, size, skin: part.skin, block: part.block, item: part.item };
    });
}

/** Construit un modèle : texte du fichier de modèle et peaux à téléverser. textures : sha de peau → empreinte Mojang. */
export function build(def, textures = {}) {
    const noise = def.noise === undefined ? 0.05 : def.noise;
    const skins = {};
    const value = (part) => {
        let hash;
        if (part.skin.url) hash = part.skin.url;
        else {
            const made = skinPng(part.skin, def.palette, noise, def.name + '/' + (part.seedOf || part.id), def.grad);
            skins[made.sha] = made.png;
            hash = textures[made.sha] || 'local-' + made.sha;
        }
        return Buffer.from('{"textures":{"SKIN":{"url":"http://textures.minecraft.net/texture/' + hash + '"}}}').toString('base64');
    };
    const summon = (key) => {
        const entities = posed(def, key).map((p) => {
            if (p.block) {
                // Bloc : cube de 0 à 1, mis à la taille de la boîte et ramené sur son centre
                const s = [p.size[0] / 16, p.size[1] / 16, p.size[2] / 16];
                const o = sub([p.c[0] / 16, p.c[1] / 16, p.c[2] / 16], qRot(p.q, [s[0] / 2, s[1] / 2, s[2] / 2]));
                return '{id:"minecraft:block_display",block_state:{Name:"minecraft:' + p.block + '"},transformation:{left_rotation:[' + p.q.map((v) => f(v, 5)).join(',') + '],right_rotation:[0f,0f,0f,1f],translation:[' + o.map((v) => f(v)).join(',') + '],scale:[' + s.map((v) => f(v)).join(',') + ']}}';
            }
            if (p.item) {
                // Objet tenu : image plate de 16 px de côté, centrée, mise à la taille size[0] (en pixels du modèle)
                const k = p.size[0] / 16;
                const left = qMul(p.q, [0, 1, 0, 0]);
                return '{id:"minecraft:item_display",item:{id:"minecraft:' + p.item + '",count:1},item_display:"none",transformation:{left_rotation:[' + left.map((v) => f(v, 5)).join(',') + '],right_rotation:[0f,0f,0f,1f],translation:[' + [p.c[0] / 16, p.c[1] / 16, p.c[2] / 16].map((v) => f(v)).join(',') + '],scale:[' + [k, k, k].map((v) => f(v)).join(',') + ']}}';
            }
            const scale = [p.size[0] / 8, p.size[1] / 8, p.size[2] / 8];
            const t = add([p.c[0] / 16, p.c[1] / 16, p.c[2] / 16], qRot(p.q, [0, scale[1] / 4, 0]));
            const left = qMul(p.q, [0, 1, 0, 0]);
            return '{id:"minecraft:item_display",item:{id:"minecraft:player_head",count:1,components:{"minecraft:profile":{properties:[{name:"textures",value:"' + value(p) + '"}]}}},item_display:"none",transformation:{left_rotation:[' + left.map((v) => f(v, 5)).join(',') + '],right_rotation:[0f,0f,0f,1f],translation:[' + t.map((v) => f(v)).join(',') + '],scale:[' + scale.map((v) => f(v)).join(',') + ']}}';
        });
        return '/summon block_display ~ ~ ~ {Passengers:[' + entities.join(',') + ']}';
    };
    const lines = ['# ' + (def.title || def.name) + ' — modèle SkyHand', summon(null)];
    for (const clip of def.clips || []) {
        lines.push('@animation loop=' + clip.loop);
        for (const key of eased(def, clip)) { lines.push('@pose ' + key.t); lines.push(summon(key)); }
    }
    return { text: lines.join('\n') + '\n', skins, parts: def.parts.length };
}

// ---------------------------------------------------------------- mouvements adoucis
const smooth = (x) => x * x * (3 - 2 * x);
const mix = (a, b, k) => (Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k);
/**
 * Clés d'une animation avec leurs clés intermédiaires. Le client va en ligne droite et à vitesse constante d'une clé
 * à la suivante : pour qu'un mouvement parte et arrive en douceur, il est découpé en trois ou quatre tronçons dont
 * l'avancée suit une courbe en S. Seuls les mouvements d'au moins 8 ticks sont découpés.
 */
export function eased(def, clip) {
    if (clip.lineaire) return clip.keys;
    const groupIds = new Set(), partIds = new Set();
    for (const key of clip.keys) { Object.keys(key.groups || {}).forEach((g) => groupIds.add(g)); Object.keys(key.parts || {}).forEach((p) => partIds.add(p)); }
    const group = (id, key) => { const g = (def.groups || {})[id]; if (!g) throw new Error('groupe inconnu ' + id); return { rot: g.rot || [0, 0, 0], move: g.move || [0, 0, 0], stretch: g.stretch || [1, 1, 1], scale: g.scale === undefined ? 1 : g.scale, ...((key && key.groups && key.groups[id]) || {}) }; };
    const part = (id, key) => { const p = def.parts.find((x) => x.id === id); if (!p) throw new Error('pièce inconnue ' + id); return { pos: p.pos, rot: p.rot || [0, 0, 0], size: p.size, skin: p.skin, ...((key && key.parts && key.parts[id]) || {}) }; };
    const state = (key) => ({ groups: Object.fromEntries([...groupIds].map((id) => [id, group(id, key)])), parts: Object.fromEntries([...partIds].map((id) => [id, part(id, key)])) });
    const shape = (s) => JSON.stringify([Object.values(s.groups), Object.values(s.parts).map((p) => [p.pos, p.rot, p.size])]);
    const stops = [{ t: 0, s: state(null) }, ...clip.keys.map((k) => ({ t: k.t, s: state(k), sec: k.sec })), { t: clip.loop, s: state(null) }];
    const out = [];
    for (let i = 0; i + 1 < stops.length; i++) {
        const a = stops[i], b = stops[i + 1], d = b.t - a.t;
        const n = b.sec || d < 8 || shape(a.s) === shape(b.s) ? 1 : d >= 16 ? 4 : 3;
        for (let j = 1; j < n; j++) {
            const k = smooth(j / n);
            out.push({
                t: a.t + Math.round(d * j / n),
                groups: Object.fromEntries(Object.entries(a.s.groups).map(([id, g]) => [id, { rot: mix(g.rot, b.s.groups[id].rot, k), move: mix(g.move, b.s.groups[id].move, k), stretch: mix(g.stretch, b.s.groups[id].stretch, k), scale: mix(g.scale, b.s.groups[id].scale, k) }])),
                // la texture reste celle de la clé de départ jusqu'à la clé d'arrivée
                parts: Object.fromEntries(Object.entries(a.s.parts).map(([id, p]) => [id, { pos: mix(p.pos, b.s.parts[id].pos, k), rot: mix(p.rot, b.s.parts[id].rot, k), size: mix(p.size, b.s.parts[id].size, k), skin: p.skin }])),
            });
        }
        if (i + 2 < stops.length) out.push({ t: b.t, groups: b.s.groups, parts: b.s.parts });
    }
    return out;
}

// ---------------------------------------------------------------- aides de dessin
/** Répète une ligne de 8 caractères sur 8 lignes, ou assemble des lignes « motif*n ». */
export function grid(...lines) {
    const out = [];
    for (const line of lines) { const m = /^(.{8})\*(\d)$/.exec(line); if (m) for (let i = 0; i < +m[2]; i++) out.push(m[1]); else out.push(line); }
    if (out.length !== 8) throw new Error('grid : ' + out.length + ' lignes au lieu de 8');
    return out;
}

const flip = (face) => (face === undefined || typeof face === 'string' ? face : face.map((r) => [...r].reverse().join('')));
function mirrorLayer(layer) {
    if (!layer || layer.url) return layer;
    const out = { ...layer, front: flip(layer.front), back: flip(layer.back), top: flip(layer.top), bottom: flip(layer.bottom), px: flip(layer.nx), nx: flip(layer.px) };
    for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
    if (layer.over) out.over = mirrorLayer(layer.over);
    return out;
}
const neg = (r) => (r ? [r[0] || 0, -(r[1] || 0), -(r[2] || 0)] : r);
/** Pièce symétrique par rapport au plan x = 0 (côté opposé du modèle), texture comprise. */
export function mirrored(part, id) {
    // Texture identique des deux côtés : la pièce jumelle garde la même peau, grain compris
    const same = symmetric(part.skin) && (!part.skin.over || symmetric(part.skin.over));
    return { ...part, id, pos: [-part.pos[0], part.pos[1], part.pos[2]], rot: neg(part.rot), ...(same ? { seedOf: part.seedOf || part.id } : { skin: mirrorLayer(part.skin) }), ...(part.group ? { group: part.group.replace(/G$/, 'D') } : {}) };
}
function symmetric(layer) {
    if (!layer || layer.url || layer.pixels || layer.px !== undefined || layer.nx !== undefined) return false;
    return ['front', 'back', 'top', 'bottom'].every((k) => layer[k] === undefined || typeof layer[k] === 'string' || layer[k].every((r) => r === [...r].reverse().join('')));
}
/** Groupe symétrique par rapport au plan x = 0. */
export function mirroredGroup(g) {
    return { ...g, pivot: g.pivot ? [-g.pivot[0], g.pivot[1], g.pivot[2]] : g.pivot, rot: neg(g.rot), move: g.move ? [-g.move[0], g.move[1], g.move[2]] : g.move };
}
/** Changements d'une pose pour le côté opposé : mêmes clés, rotations et déplacements symétriques. */
export function mirroredPose(change) {
    const out = { ...change };
    if (change.rot) out.rot = neg(change.rot);
    if (change.pos) out.pos = [-change.pos[0], change.pos[1], change.pos[2]];
    if (change.move) out.move = [-change.move[0], change.move[1], change.move[2]];
    return out;
}
