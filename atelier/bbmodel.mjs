// Lit un projet Blockbench (.bbmodel, format « Generic Model ») et en fait un fichier de modèle SHCompagnons :
// chaque cube devient une tête de joueur étirée dont la peau reprend les six faces du cube, chaque animation devient
// un état (« idle », « walk », « interact »...) avec les images clés de chaque pièce.
//
// Ce qui est repris de Blockbench : cubes (from, to, origin, rotation, inflate, faces avec uv et rotation), groupes
// emboîtés (origin, rotation), textures du projet, animations des groupes (rotation, position, scale ; interpolation
// linear, step, catmullrom ; bezier lu comme linear). Le modèle Blockbench regarde vers le nord (-z).
//
// Une face de tête montre 8 x 8 pixels : une face de cube dessinée sur 1, 2, 4 ou 8 pixels de large ou de haut est
// reprise à l'identique, les autres largeurs sont rééchantillonnées au plus proche.
// Un cube nommé « bloc:<bloc>/<nom> » est rendu par ce bloc du jeu (verre teinté d'un slime...), un cube nommé
// « objet:<objet>/<nom> » par cet objet tenu à plat (une pioche) : sa texture Blockbench ne sert alors qu'à l'aperçu.
import { createHash } from 'node:crypto';
import { decodePng, encodePng } from './png.mjs';

// ---------------------------------------------------------------- maths (matrices 4x4 rangées ligne par ligne)
const RAD = Math.PI / 180;
const mul = (a, b) => { const o = new Array(16).fill(0); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let k = 0; k < 4; k++) o[r * 4 + c] += a[r * 4 + k] * b[k * 4 + c]; return o; };
const ID = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const translation = ([x, y, z]) => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
const scaling = ([x, y, z]) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
const rotX = (d) => { const c = Math.cos(d * RAD), s = Math.sin(d * RAD); return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]; };
const rotY = (d) => { const c = Math.cos(d * RAD), s = Math.sin(d * RAD); return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]; };
const rotZ = (d) => { const c = Math.cos(d * RAD), s = Math.sin(d * RAD); return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; };
/** Rotation d'un groupe ou d'un cube Blockbench : angles d'Euler en degrés, ordre ZYX. */
const euler = ([x, y, z]) => mul(rotZ(z), mul(rotY(y), rotX(x)));
const apply = (m, [x, y, z]) => [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7], m[8] * x + m[9] * y + m[10] * z + m[11]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => Math.hypot(a[0], a[1], a[2]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
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
/** Quaternion d'une rotation donnée par ses trois colonnes (vecteurs unitaires orthogonaux). */
function qFromColumns(c0, c1, c2) {
    const m00 = c0[0], m10 = c0[1], m20 = c0[2], m01 = c1[0], m11 = c1[1], m21 = c1[2], m02 = c2[0], m12 = c2[1], m22 = c2[2];
    const tr = m00 + m11 + m22;
    let q;
    if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; q = [(m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, s / 4]; }
    else if (m00 > m11 && m00 > m22) { const s = Math.sqrt(1 + m00 - m11 - m22) * 2; q = [s / 4, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s]; }
    else if (m11 > m22) { const s = Math.sqrt(1 + m11 - m00 - m22) * 2; q = [(m01 + m10) / s, s / 4, (m12 + m21) / s, (m02 - m20) / s]; }
    else { const s = Math.sqrt(1 + m22 - m00 - m11) * 2; q = [(m02 + m20) / s, (m12 + m21) / s, s / 4, (m10 - m01) / s]; }
    const n = Math.hypot(...q);
    return q.map((v) => v / n);
}
const qDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
function qSlerp(a, b, k) {
    let d = qDot(a, b), s = 1;
    if (d < 0) { d = -d; s = -1; }
    if (d > 0.9995) { const o = a.map((v, i) => v + (s * b[i] - v) * k), n = Math.hypot(...o); return o.map((v) => v / n); }
    const th = Math.acos(d), sn = Math.sin(th), ka = Math.sin((1 - k) * th) / sn, kb = s * Math.sin(k * th) / sn;
    return a.map((v, i) => v * ka + b[i] * kb);
}

// ---------------------------------------------------------------- projet
const num = (v) => { const n = typeof v === 'number' ? v : parseFloat(v); return Number.isFinite(n) ? n : 0; };
const vec = (p) => [num(p.x), num(p.y), num(p.z)];

/** Arbre des groupes et cubes d'un projet (formats 4.x : groupes dans outliner ; 5.x : tableau groups à part). */
function tree(bb, warn) {
    const groupData = Object.fromEntries((bb.groups || []).map((g) => [g.uuid, g]));
    const elements = Object.fromEntries((bb.elements || []).map((e) => [e.uuid, e]));
    const bones = [], cubes = [];
    const walk = (node, parent) => {
        if (typeof node === 'string') {
            const e = elements[node];
            if (!e || (e.type && e.type !== 'cube')) { if (e) warn('élément « ' + e.name + ' » de type ' + e.type + ' ignoré (seuls les cubes sont repris)'); return; }
            // Un cube nommé « hitbox » est la boîte de collision des modèles ModelEngine, pas une pièce à afficher
            if (e.visibility === false || e.export === false || /^hitbox$/i.test(e.name || '')) return;
            const special = /^(bloc|objet):([a-z0-9_]+)([/]|$)/.exec(e.name || '');
            cubes.push({ name: e.name, kind: special ? special[1] : 'tete', what: special ? special[2] : null, parent, from: e.from, to: e.to, origin: e.origin || [0, 0, 0], rotation: e.rotation || [0, 0, 0], inflate: e.inflate || 0, faces: e.faces || {} });
            return;
        }
        const g = { ...node, ...(groupData[node.uuid] || {}) };
        if (g.export === false || g.visibility === false) return;
        const bone = { uuid: g.uuid, name: g.name, parent, origin: g.origin || [0, 0, 0], rotation: g.rotation || [0, 0, 0] };
        bones.push(bone);
        for (const child of node.children || []) walk(child, bone);
    };
    for (const node of bb.outliner || []) walk(node, null);
    const free = !bb.meta?.model_format || bb.meta.model_format === 'free';
    if (!free && (bb.animations || []).length) warn('format « ' + bb.meta.model_format + ' » : animations lues avec les signes Bedrock, non vérifiés ; préférer « Generic Model »');
    return { bones, cubes, signs: free ? [1, 1, 1, 1, 1, 1] : [-1, -1, 1, -1, 1, 1] };
}

// ---------------------------------------------------------------- animations
/** Point de la courbe de THREE.SplineCurve (Catmull-Rom uniforme) dont Blockbench se sert pour « smooth ». */
function spline(values, t) {
    const p = (values.length - 1) * t, i = Math.floor(p), w = p - i;
    const p0 = values[i === 0 ? i : i - 1], p1 = values[i], p2 = values[i > values.length - 2 ? values.length - 1 : i + 1], p3 = values[i > values.length - 3 ? values.length - 1 : i + 2];
    const v0 = (p2 - p0) * 0.5, v1 = (p3 - p1) * 0.5, w2 = w * w, w3 = w * w2;
    return (2 * p1 - 2 * p2 + v0 + v1) * w3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * w2 + v0 * w + p1;
}
/** Valeur [x, y, z] d'un canal d'un groupe à l'instant time (secondes), calculée comme l'aperçu de Blockbench. */
function channelAt(keys, time, loops, fallback) {
    if (!keys.length) return fallback;
    const EPS = 1 / 1200;
    let before = null, after = null;
    for (const k of keys) {
        if (k.time < time) { if (!before || k.time > before.time) before = k; }
        else if (!after || k.time < after.time) after = k;
    }
    // Une image clé peut porter deux valeurs (avant, après) : la seconde vaut à partir de son instant
    const post = (k) => k.points[k.points.length - 1], pre = (k) => k.points[0];
    if (before && Math.abs(before.time - time) < EPS) return post(before);
    if (after && Math.abs(after.time - time) < EPS) return post(after);
    if (before && before.interpolation === 'step') return post(before);
    if (before && !after) return post(before);
    if (after && !before) return pre(after);
    const alpha = (time - before.time) / (after.time - before.time);
    if (before.interpolation === 'catmullrom' || after.interpolation === 'catmullrom') {
        const i = keys.indexOf(before);
        let beforePlus = keys[i - 1], afterPlus = keys[i + 2];
        if (loops && keys.length >= 3) { if (!beforePlus) beforePlus = keys.at(-2); if (!afterPlus) afterPlus = keys[1]; }
        return [0, 1, 2].map((axis) => {
            const values = [];
            if (beforePlus && before.points.length === 1) values.push(post(beforePlus)[axis]);
            values.push(post(before)[axis]);
            values.push(pre(after)[axis]);
            if (afterPlus && after.points.length === 1) values.push(pre(afterPlus)[axis]);
            const first = beforePlus && before.points.length === 1 ? 1 : 0;
            return spline(values, (alpha + first) / (values.length - 1));
        });
    }
    const a = post(before), b = pre(after);
    return a.map((v, i) => v + (b[i] - v) * alpha);
}

function animations(bb, bones, warn) {
    const known = new Set(bones.map((b) => b.uuid));
    return (bb.animations || []).map((a) => {
        const channels = {};
        for (const [uuid, animator] of Object.entries(a.animators || {})) {
            if (!known.has(uuid)) { if (animator.keyframes?.length) warn('animation « ' + a.name + ' » : groupe « ' + animator.name + ' » introuvable, ses images clés sont ignorées'); continue; }
            const byChannel = { rotation: [], position: [], scale: [] };
            for (const k of animator.keyframes || []) {
                if (!byChannel[k.channel]) continue;
                if (k.interpolation === 'bezier') warn('animation « ' + a.name + ' » : interpolation bezier lue comme linear');
                byChannel[k.channel].push({ time: num(k.time), interpolation: k.interpolation === 'bezier' ? 'linear' : k.interpolation || 'linear', points: (k.data_points || []).map(vec) });
            }
            for (const list of Object.values(byChannel)) list.sort((x, y) => x.time - y.time);
            channels[uuid] = byChannel;
        }
        return { name: String(a.name).toLowerCase().replace(/^animation\.[^.]*\./, ''), length: num(a.length), loop: a.loop === 'loop', hold: a.loop === 'hold', channels };
    });
}

// ---------------------------------------------------------------- pose
/** Pose de chaque cube : centre (pixels, repère de l'atelier : +z devant, +x à gauche du modèle), rotation, taille. */
function pose(model, anim, time, warn) {
    const world = new Map();
    const boneMatrix = (bone) => {
        if (!bone) return ID;
        if (world.has(bone)) return world.get(bone);
        let position = sub(bone.origin, bone.parent ? bone.parent.origin : [0, 0, 0]), rotation = bone.rotation, scale = [1, 1, 1];
        const ch = anim && anim.channels[bone.uuid];
        if (ch) {
            // Format « Generic Model » : les valeurs s'ajoutent telles quelles (vérifié sur Blockbench 5.2.2). Les
            // formats Bedrock inversent x et y de la rotation et x de la position.
            const r = channelAt(ch.rotation, time, anim.loop, [0, 0, 0]), p = channelAt(ch.position, time, anim.loop, [0, 0, 0]);
            const g = model.signs;
            rotation = [rotation[0] + g[0] * r[0], rotation[1] + g[1] * r[1], rotation[2] + g[2] * r[2]];
            position = [position[0] + g[3] * p[0], position[1] + g[4] * p[1], position[2] + g[5] * p[2]];
            scale = channelAt(ch.scale, time, anim.loop, [1, 1, 1]).map((v) => v || 0.00001);
        }
        const m = mul(boneMatrix(bone.parent), mul(translation(position), mul(euler(rotation), scaling(scale))));
        world.set(bone, m);
        return m;
    };
    return model.cubes.map((cube) => {
        const m = mul(boneMatrix(cube.parent), mul(translation(sub(cube.origin, cube.parent ? cube.parent.origin : [0, 0, 0])), euler(cube.rotation)));
        const lo = cube.from.map((v) => v - cube.inflate), hi = cube.to.map((v) => v + cube.inflate);
        const size = [0, 1, 2].map((i) => Math.max(0.05, hi[i] - lo[i]));
        const p = apply(m, sub([0, 1, 2].map((i) => (lo[i] + hi[i]) / 2), cube.origin));
        // Passage au repère de l'atelier : demi-tour autour de la verticale (x et z changent de signe)
        const flip = [-1, 1, -1];
        const cols = [0, 1, 2].map((c) => [0, 1, 2].map((r) => m[r * 4 + c] * flip[r] * flip[c]));
        const k = cols.map(norm);
        let axes = cols.map((c, i) => c.map((v) => v / k[i]));
        const skew = Math.max(Math.abs(dot(axes[0], axes[1])), Math.abs(dot(axes[0], axes[2])), Math.abs(dot(axes[1], axes[2])));
        if (skew > 2e-3) {
            warn('cube « ' + cube.name + ' » déformé en biais (groupe étiré puis enfant tourné) : forme approchée');
            const y = axes[1], x0 = sub(axes[0], y.map((v) => v * dot(axes[0], y))), x = x0.map((v) => v / norm(x0));
            axes = [x, y, cross(x, y)];
        }
        if (dot(cross(axes[0], axes[1]), axes[2]) < 0) { warn('cube « ' + cube.name + ' » retourné (échelle négative) : non géré'); axes[2] = axes[2].map((v) => -v); }
        return { c: [-p[0], p[1], -p[2]], q: qFromColumns(axes[0], axes[1], axes[2]), size: size.map((v, i) => v * k[i]) };
    });
}

/**
 * Transformation de l'entité d'affichage d'une pièce : translation (blocs), rotation gauche, échelle. Une tête est
 * centrée de côté et pendue sous son origine ; un bloc part de son coin ; un objet est une image plate centrée.
 */
function entity(p, kind = 'tete') {
    if (kind === 'bloc') { const s = p.size.map((v) => v / 16); return { t: sub(p.c.map((v) => v / 16), qRot(p.q, s.map((v) => v / 2))), l: p.q, s, box: [[0, 1], [0, 1], [0, 1]] }; }
    if (kind === 'objet') { const k = Math.max(...p.size) / 16; return { t: p.c.map((v) => v / 16), l: qMul(p.q, [0, 1, 0, 0]), s: [k, k, k], box: [[-0.5, 0.5], [-0.5, 0.5], [-0.03, 0.03]] }; }
    const scale = p.size.map((v) => v / 8);
    const t = add(p.c.map((v) => v / 16), qRot(p.q, [0, scale[1] / 4, 0]));
    return { t, l: qMul(p.q, [0, 1, 0, 0]), s: scale, box: [[-0.25, 0.25], [-0.5, 0], [-0.25, 0.25]] };
}
/** Écart le plus grand entre les coins de la pièce pour deux transformations (blocs). */
function gap(a, b) {
    let worst = 0;
    const box = a.box || [[-0.25, 0.25], [-0.5, 0], [-0.25, 0.25]];
    for (const x of box[0]) for (const y of box[1]) for (const z of box[2]) {
        const pa = add(a.t, qRot(a.l, [x * a.s[0], y * a.s[1], z * a.s[2]])), pb = add(b.t, qRot(b.l, [x * b.s[0], y * b.s[1], z * b.s[2]]));
        worst = Math.max(worst, norm(sub(pa, pb)));
    }
    return worst;
}
/** Ce que le client affiche entre deux images clés : translation et échelle en ligne droite, rotation au plus court. */
const between = (a, b, k) => ({ t: a.t.map((v, i) => v + (b.t[i] - v) * k), l: qSlerp(a.l, b.l, k), s: a.s.map((v, i) => v + (b.s[i] - v) * k), box: a.box });

/**
 * Images clés gardées pour une pièce : ticks (le premier à 0) tels que le trajet du client entre deux images gardées
 * ne s'écarte jamais de plus de « tolerance » (blocs) de la pose voulue à chaque tick. frames[L] est la pose du tick
 * de bouclage (celle du tick 0 pour une boucle).
 */
function reduce(frames, tolerance) {
    const last = frames.length - 1, kept = [0];
    let i = 0;
    while (i < last) {
        let j = i + 1;
        for (let n = i + 2; n <= last; n++) {
            let ok = true;
            for (let m = i + 1; m < n && ok; m++) ok = gap(frames[m], between(frames[i], frames[n], (m - i) / (n - i))) <= tolerance;
            if (ok) j = n; else break;
        }
        if (j < last) kept.push(j);
        i = j;
    }
    return kept;
}

// ---------------------------------------------------------------- textures
const REGION = { top: [8, 0], bottom: [16, 0], nx: [0, 8], front: [8, 8], px: [16, 8], back: [24, 8] };
// Face de la tête ← face du cube Blockbench ; le dessus et le dessous sont rangés tournés d'un demi-tour dans une peau
const SOURCE = { front: ['north', false], back: ['south', false], px: ['west', false], nx: ['east', false], top: ['up', true], bottom: ['down', true] };

/** Les 8 x 8 pixels d'une face de cube, vue de l'extérieur (ligne 0 en haut) → tableau de 64 [r, g, b, a], ou null. */
function tile(face, textures, resolution) {
    if (!face || face.texture === null || face.texture === undefined || face.texture === false || !face.uv) return null;
    const tex = textures[face.texture];
    if (!tex) return null;
    const [u1, v1, u2, v2] = face.uv;
    let corners = [[u1, v1], [u2, v1], [u1, v2], [u2, v2]]; // haut-gauche, haut-droite, bas-gauche, bas-droite
    for (let r = ((face.rotation || 0) % 360 + 360) % 360; r > 0; r -= 90) corners = [corners[2], corners[0], corners[3], corners[1]];
    const kx = tex.w / (tex.uvW || resolution.width), ky = tex.h / (tex.uvH || resolution.height);
    const out = [];
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
        const s = (x + 0.5) / 8, t = (y + 0.5) / 8;
        const u = corners[0][0] * (1 - s) * (1 - t) + corners[1][0] * s * (1 - t) + corners[2][0] * (1 - s) * t + corners[3][0] * s * t;
        const v = corners[0][1] * (1 - s) * (1 - t) + corners[1][1] * s * (1 - t) + corners[2][1] * (1 - s) * t + corners[3][1] * s * t;
        const px = Math.min(tex.w - 1, Math.max(0, Math.floor(u * kx))), py = Math.min(tex.h - 1, Math.max(0, Math.floor(v * ky))), i = (py * tex.w + px) * 4;
        out.push([tex.rgba[i], tex.rgba[i + 1], tex.rgba[i + 2], tex.rgba[i + 3]]);
    }
    return out;
}

/** Peau 64x64 d'un cube (image RGBA) ; les pixels transparents ou sans texture prennent la couleur moyenne du cube. */
function skinOf(cube, textures, resolution, warn) {
    const tiles = Object.fromEntries(Object.entries(SOURCE).map(([name, [from, turned]]) => {
        const t = tile(cube.faces[from], textures, resolution);
        return [name, t && turned ? t.slice().reverse() : t];
    }));
    const solid = Object.values(tiles).filter(Boolean).flat().filter((p) => p[3] >= 128);
    const mean = solid.length ? [0, 1, 2].map((c) => Math.round(solid.reduce((n, p) => n + p[c], 0) / solid.length)) : [128, 128, 128];
    if (!solid.length) warn('cube « ' + cube.name + ' » sans texture : tête grise');
    const px = new Uint8Array(64 * 64 * 4);
    for (const [name, [rx, ry]] of Object.entries(REGION)) {
        const t = tiles[name];
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
            // Le dessous est rangé dans la peau retourné de haut en bas
            const p = t ? t[(name === 'bottom' ? 7 - y : y) * 8 + x] : null, i = ((ry + y) * 64 + rx + x) * 4;
            const color = p && p[3] >= 128 ? p : mean;
            px[i] = color[0]; px[i + 1] = color[1]; px[i + 2] = color[2]; px[i + 3] = 255;
        }
    }
    return px;
}

// ---------------------------------------------------------------- conversion
const f = (v, d = 4) => { const s = (Math.round(v * 10 ** d) / 10 ** d).toString(); return (s === '-0' ? '0' : s) + 'f'; };
const n = (v, d = 5) => { const s = (Math.round(v * 10 ** d) / 10 ** d).toString(); return s === '-0' ? '0' : s; };

/**
 * Convertit un projet Blockbench. textures : sha de peau → empreinte Mojang (textures.json).
 * options : { name, tolerance (pixels du modèle, 0.15 par défaut) }.
 * Rend { text (fichier de modèle), skins (sha → PNG à téléverser), parts, states: [{ name, ticks, once, keys }], warnings }.
 */
export function convert(bb, textures = {}, options = {}) {
    const warnings = [], warn = (m) => { if (!warnings.includes(m)) warnings.push(m); };
    if (bb.meta?.box_uv) warn('projet en « Box UV » : passer en « Per-face UV » (File > Project) pour que chaque face ait sa texture');
    const model = tree(bb, warn);
    if (!model.cubes.length) throw new Error('aucun cube dans le projet');
    const resolution = bb.resolution || { width: 16, height: 16 };
    const images = (bb.textures || []).map((t) => {
        if (!t.source || !t.source.startsWith('data:image/png;base64,')) { warn('texture « ' + t.name + ' » non enregistrée dans le projet (File > Save Project l\'y met)'); return null; }
        const img = decodePng(Buffer.from(t.source.slice(22), 'base64'));
        return { ...img, uvW: t.uv_width, uvH: t.uv_height };
    });

    const skins = {};
    const values = model.cubes.map((cube) => {
        if (cube.kind !== 'tete') return null;
        const px = skinOf(cube, images, resolution, warn);
        const sha = createHash('sha1').update(px).digest('hex').slice(0, 20);
        skins[sha] = encodePng(64, 64, px);
        const hash = textures[sha] || 'local-' + sha;
        return Buffer.from('{"textures":{"SKIN":{"url":"http://textures.minecraft.net/texture/' + hash + '"}}}').toString('base64');
    });

    const kinds = model.cubes.map((c) => c.kind);
    const base = pose(model, null, 0, warn).map((p, i) => entity(p, kinds[i]));
    const head = (e, i) => {
        const transformation = 'transformation:{left_rotation:[' + e.l.map((v) => f(v, 5)).join(',') + '],right_rotation:[0f,0f,0f,1f],translation:[' + e.t.map((v) => f(v)).join(',') + '],scale:[' + e.s.map((v) => f(v)).join(',') + ']}';
        if (kinds[i] === 'bloc') return '{id:"minecraft:block_display",block_state:{Name:"minecraft:' + model.cubes[i].what + '"},' + transformation + '}';
        if (kinds[i] === 'objet') return '{id:"minecraft:item_display",item:{id:"minecraft:' + model.cubes[i].what + '",count:1},item_display:"none",' + transformation + '}';
        return '{id:"minecraft:item_display",item:{id:"minecraft:player_head",count:1,components:{"minecraft:profile":{properties:[{name:"textures",value:"' + values[i] + '"}]}}},item_display:"none",' + transformation + '}';
    };
    const lines = ['# ' + (options.title || bb.name || options.name || 'modèle') + ' — modèle SkyHand fait dans Blockbench (' + model.cubes.length + ' cubes)',
        '/summon block_display ~ ~ ~ {Passengers:[' + base.map(head).join(',') + ']}'];

    const tolerance = (options.tolerance === undefined ? 0.15 : options.tolerance) / 16;
    const states = [];
    for (const anim of animations(bb, model.bones, warn)) {
        const ticks = Math.max(1, Math.round(anim.length * 20));
        // Pose de chaque pièce à chaque tick ; la dernière est celle du bouclage (retour au tick 0)
        const frames = model.cubes.map(() => []);
        for (let t = 0; t <= ticks; t++) pose(model, anim, t === ticks ? 0 : t / 20, warn).forEach((p, i) => frames[i].push(entity(p, kinds[i])));
        lines.push('@state ' + anim.name + ' length=' + ticks + (anim.loop ? '' : ' once'));
        let keys = 0, moving = 0;
        frames.forEach((list, i) => {
            const kept = reduce(list, tolerance);
            // Pièce immobile dans cet état et à sa pose de base : rien à écrire
            if (kept.length === 1 && gap(list[0], base[i]) <= 1e-5) return;
            // Une pièce qui tient une seule pose pendant l'état la rejoint une fois : elle ne coûte rien ensuite
            if (kept.length > 1) { moving++; keys += kept.length; }
            lines.push('@track ' + i + ' ' + kept.map((t) => t + ':' + [...list[t].t, ...list[t].l, ...list[t].s].map((v) => n(v)).join(',')).join(' '));
        });
        states.push({ name: anim.name, ticks, once: !anim.loop, keys, moving, perSecond: keys * 20 / ticks });
    }
    // « Corps » du modèle : côté (blocs, à l'échelle 1) du cube de même volume que ses pièces, pour régler sa taille en jeu
    const volume = pose(model, null, 0, warn).reduce((sum, p, i) => sum + (kinds[i] === 'objet' ? 0 : p.size[0] * p.size[1] * p.size[2]), 0);
    return { text: lines.join('\n') + '\n', skins, parts: model.cubes.length, names: model.cubes.map((c) => c.name), states, warnings, body: Math.cbrt(volume) / 16 };
}

// Exposé pour les contrôles (comparaison avec ce que Blockbench affiche)
export const interne = { tree, animations, pose, tile, entity };
