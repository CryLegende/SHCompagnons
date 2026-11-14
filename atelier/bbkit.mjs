// Écrit un projet Blockbench (.bbmodel, format « Generic Model ») à partir d'une description : os, cubes aux faces
// dessinées case par case, animations. Le fichier produit s'ouvre et se retouche dans Blockbench ; c'est lui que
// bbmodel.mjs convertit en modèle SHCompagnons.
//
// Repère de Blockbench : unités en pixels (16 px = 1 bloc), y vers le haut, le modèle regarde vers le nord (-z),
// +x est à sa droite.
//
// Description :
//   { name, title, palette: { car: '#rrggbb' | '#rrggbbaa' | { c: '#rrggbb' } }, noise, grad, bord,
//     bones: { id: { parent, pivot: [x,y,z], rot: [x,y,z] } },
//     cubes: [ { name, bone, from: [x,y,z], to: [x,y,z], pivot, rot, bord, seed, block, item,
//                faces: { all, north, south, east, west, up, down } } ],
//     animations: { idle: { length (secondes), loop: true|false, bones: { id: { rotation: [[t, [x,y,z], 'smooth'?]...], position, scale } } } } }
// Une face est un caractère de la palette (aplat) ou des lignes de caractères : 1, 2, 4 ou 8 lignes de 1, 2, 4 ou 8
// caractères, vues de l'extérieur (north = de face). up : le haut du dessin est l'avant du modèle ; down : le haut
// du dessin est l'arrière. Chaque face occupe une case de 8 x 8 pixels de la texture : ce que montre une tête.
//
// Ombrage du style SkyHand, fait ici pour que tous les modèles aient le même : la ligne du haut des faces verticales
// et tout le dessus sont éclaircis, la ligne du bas et tout le dessous sont assombris, avec un grain léger et un
// dégradé du haut vers le bas. On ne dessine donc que les couleurs de base et les détails. Une couleur donnée en
// objet ({ c: '#...' }) reste telle quelle partout (yeux, traits nets). « bord: false » sur un cube ou sur le modèle
// retire les lignes claire et sombre ; « bord: 'haut' » ne garde que la claire, « bord: 'bas' » que la sombre.
// Un cube « block: 'lime_stained_glass' » est rendu en jeu par ce bloc (coque translucide d'un slime), un cube
// « item: 'diamond_pickaxe' » par l'objet tenu à plat ; leurs faces ne servent qu'à l'aperçu dans Blockbench.
// Une face peut aussi être donnée pixel par pixel ({ px: [64 couleurs] }) : tête officielle d'un personnage du jeu.
import { createHash } from 'node:crypto';
import { encodePng } from './png.mjs';

const FACES = ['north', 'east', 'south', 'west', 'up', 'down'];
function hash32(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rand(seed) { let t = (seed + 0x6d2b79f5) | 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function rgb(hex) { const h = hex.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length >= 8 ? parseInt(h.slice(6, 8), 16) : 255]; }
/** Teinte claire (ligne du haut, dessus) et sombre (ligne du bas, dessous) d'une couleur : le même écart pour tous les modèles. */
export const CLAIR = 0.18, SOMBRE = 0.85;
/** Identifiant stable tiré d'un nom : le même d'une génération à l'autre. */
function uuid(text) { const h = createHash('sha1').update(text).digest('hex'); return [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20, 32)].join('-'); }

/** Les 64 caractères d'une face (8 lignes de 8) à partir d'un aplat ou d'un dessin de 1, 2, 4 ou 8 lignes et colonnes. */
function expand(face, where) {
    const lines = typeof face === 'string' ? [face] : face;
    const rows = lines.length, cols = [...lines[0]].length;
    if (![1, 2, 4, 8].includes(rows) || ![1, 2, 4, 8].includes(cols) || lines.some((l) => [...l].length !== cols)) throw new Error(where + ' : une face fait 1, 2, 4 ou 8 lignes de 1, 2, 4 ou 8 caractères');
    const out = [];
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) out.push([...lines[Math.floor(y * rows / 8)]][Math.floor(x * cols / 8)]);
    return out;
}

/** Projet Blockbench (objet à écrire en JSON) d'une description. */
export function project(def) {
    const noise = def.noise === undefined ? 0.03 : def.noise, grad = def.grad === undefined ? 0.06 : def.grad;
    // Texture : une case de 8 x 8 par face, 16 cases par ligne
    const tiles = [];
    const tileOf = (cube, name) => {
        let face = cube.faces[name];
        if (face === undefined) face = cube.faces.all;
        if (face === undefined) throw new Error('cube ' + cube.name + ' : face ' + name + ' sans dessin (ni all)');
        // Face donnée pixel par pixel ({ px: 64 couleurs '#rrggbb' }, texture officielle du jeu) : reprise telle quelle
        if (face && face.px) {
            const raw = new Uint8Array(8 * 8 * 4);
            face.px.forEach((hex, i) => raw.set(rgb(hex), i * 4));
            const rawKey = Buffer.from(raw).toString('base64');
            let at = tiles.findIndex((t) => t.key === rawKey);
            if (at < 0) { at = tiles.length; tiles.push({ key: rawKey, px: raw }); }
            return at;
        }
        const chars = expand(face, 'cube ' + cube.name + ', face ' + name);
        const edge = cube.bord !== undefined ? cube.bord : def.bord !== false;
        // Cube uni (les six faces de la même couleur) : même grain que les autres cubes unis de cette couleur, donc
        // même tête en jeu quand ils ont aussi le même bord
        const plain = FACES.map((f) => (cube.faces[f] === undefined ? cube.faces.all : cube.faces[f]));
        const seed = cube.seed || (plain.every((f) => typeof f === 'string' && [...f].length === 1 && f === plain[0]) ? 'uni:' + plain[0] : cube.name);
        const px = new Uint8Array(8 * 8 * 4);
        for (let i = 0; i < 64; i++) {
            const entry = def.palette[chars[i]];
            if (entry === undefined) throw new Error('cube ' + cube.name + ', face ' + name + ' : couleur inconnue « ' + chars[i] + ' »');
            const flat = typeof entry === 'object', color = rgb(flat ? entry.c : entry), y = Math.floor(i / 8);
            // Lignes claire et sombre du style, puis grain léger et dégradé du haut vers le bas
            const light = !flat && edge && edge !== 'bas' && (name === 'up' || (name !== 'down' && y === 0));
            const dark = !flat && edge && edge !== 'haut' && (name === 'down' || (name !== 'up' && y === 7));
            const shade = flat ? 0 : name === 'up' ? grad * 0.4 : name === 'down' ? -grad : grad * (0.5 - y / 7);
            const k = 1 + shade + (flat ? 0 : noise) * (rand(hash32(def.name + '/' + seed + '/' + name + '/' + i + chars[i])) * 2 - 1);
            for (let c = 0; c < 3; c++) {
                const v = light ? color[c] + (255 - color[c]) * CLAIR : dark ? color[c] * SOMBRE : color[c];
                px[i * 4 + c] = Math.max(0, Math.min(255, Math.round(v * k)));
            }
            px[i * 4 + 3] = color[3];
        }
        const key = Buffer.from(px).toString('base64');
        let index = tiles.findIndex((t) => t.key === key);
        if (index < 0) { index = tiles.length; tiles.push({ key, px }); }
        return index;
    };
    const faceTiles = def.cubes.map((cube) => Object.fromEntries(FACES.map((f) => [f, tileOf(cube, f)])));
    const width = 128, height = Math.max(16, 2 ** Math.ceil(Math.log2(Math.ceil(tiles.length / 16) * 8)));
    const image = new Uint8Array(width * height * 4);
    tiles.forEach((t, n) => { const ox = (n % 16) * 8, oy = Math.floor(n / 16) * 8; for (let y = 0; y < 8; y++) image.set(t.px.subarray(y * 32, y * 32 + 32), ((oy + y) * width + ox) * 4); });
    const texture = {
        name: def.name + '.png', path: '', folder: '', namespace: '', id: '0', group: '', scope: 0, width, height, uv_width: width, uv_height: height,
        particle: false, use_as_default: false, layers_enabled: false, sync_to_project: '', file_format: 'png', render_mode: 'default', render_sides: 'auto', wrap_mode: 'limited', pbr_channel: 'color',
        fps: 7, force_translucent: false, frame_time: 1, frame_order_type: 'loop', frame_order: '', frame_interpolate: false, visible: true, internal: true, saved: false,
        uuid: uuid(def.name + '/texture'), source: 'data:image/png;base64,' + encodePng(width, height, image).toString('base64'),
    };

    const boneIds = Object.keys(def.bones || {});
    const groups = boneIds.map((id) => {
        const b = def.bones[id];
        if (b.parent && !def.bones[b.parent]) throw new Error('os ' + id + ' : parent inconnu ' + b.parent);
        return { name: id, uuid: uuid(def.name + '/os/' + id), export: true, locked: false, scope: 0, selected: false, visibility: true, origin: b.pivot || [0, 0, 0], rotation: b.rot || [0, 0, 0], color: 0, children: [], reset: false, shade: true, mirror_uv: false, autouv: 0, isOpen: true, primary_selected: false };
    });
    const shown = (cube) => (cube.block ? 'bloc:' + cube.block + '/' : cube.item ? 'objet:' + cube.item + '/' : '') + cube.name;
    const elements = def.cubes.map((cube, n) => {
        if (cube.bone && !def.bones[cube.bone]) throw new Error('cube ' + cube.name + ' : os inconnu ' + cube.bone);
        const faces = Object.fromEntries(FACES.map((f) => { const t = faceTiles[n][f], u = (t % 16) * 8, v = Math.floor(t / 16) * 8; return [f, { uv: [u, v, u + 8, v + 8], texture: 0 }]; }));
        const centre = [0, 1, 2].map((i) => (cube.from[i] + cube.to[i]) / 2);
        return { name: shown(cube), box_uv: false, render_order: 'default', locked: false, export: true, scope: 0, allow_mirror_modeling: true, from: cube.from, to: cube.to, autouv: 0, color: n % 8, origin: cube.pivot || centre, ...(cube.rot ? { rotation: cube.rot } : {}), faces, type: 'cube', uuid: uuid(def.name + '/cube/' + cube.name) };
    });
    if (new Set(elements.map((e) => e.name)).size !== elements.length) throw new Error('deux cubes portent le même nom');
    const node = (id) => ({
        uuid: uuid(def.name + '/os/' + id), isOpen: true,
        children: [...boneIds.filter((child) => def.bones[child].parent === id).map(node), ...def.cubes.filter((c) => c.bone === id).map((c) => uuid(def.name + '/cube/' + c.name))],
    });
    const outliner = [...boneIds.filter((id) => !def.bones[id].parent).map(node), ...def.cubes.filter((c) => !c.bone).map((c) => uuid(def.name + '/cube/' + c.name))];

    const animations = Object.entries(def.animations || {}).map(([name, a]) => {
        const animators = {};
        for (const [id, channels] of Object.entries(a.bones || {})) {
            if (!def.bones[id]) throw new Error('animation ' + name + ' : os inconnu ' + id);
            const keyframes = [];
            for (const channel of ['rotation', 'position', 'scale']) for (const [time, v, mode] of channels[channel] || []) {
                if (time < 0 || time > a.length + 1e-9) throw new Error('animation ' + name + ', os ' + id + ' : image clé à ' + time + ' s hors de la durée');
                keyframes.push({ channel, data_points: [{ x: String(v[0]), y: String(v[1]), z: String(v[2]) }], uuid: uuid([def.name, name, id, channel, time].join('/')), time, color: -1, interpolation: mode === 'smooth' ? 'catmullrom' : mode === 'step' ? 'step' : 'linear' });
            }
            animators[uuid(def.name + '/os/' + id)] = { name: id, type: 'bone', rotation_global: false, quaternion_interpolation: false, keyframes };
        }
        return { uuid: uuid(def.name + '/animation/' + name), name, loop: a.loop === false ? 'once' : 'loop', override: false, length: a.length, snapping: 20, selected: false, group_name: '', scope: 0, anim_time_update: '', blend_weight: '', start_delay: '', loop_delay: '', animators };
    });

    return {
        meta: { format_version: '5.0', model_format: 'free', box_uv: false },
        name: def.title || def.name, model_identifier: '', visible_box: [1, 1, 0], variable_placeholders: '', variable_placeholder_buttons: [], timeline_setups: [], unhandled_root_fields: {},
        resolution: { width, height }, elements, groups, outliner, textures: [texture], animations,
    };
}

/** Miroir d'un cube par rapport au plan x = 0 (côté opposé du modèle) : dessins des faces retournés, est et ouest échangés. */
export function mirrored(cube, name, bone) {
    const flip = (f) => (f === undefined || typeof f === 'string' ? f : f.map((l) => [...l].reverse().join('')));
    const faces = { ...cube.faces, north: flip(cube.faces.north), south: flip(cube.faces.south), up: flip(cube.faces.up), down: flip(cube.faces.down), east: flip(cube.faces.west), west: flip(cube.faces.east) };
    for (const k of Object.keys(faces)) if (faces[k] === undefined) delete faces[k];
    const out = { ...cube, name, seed: cube.seed || cube.name, bone: bone || cube.bone, from: [-cube.to[0], cube.from[1], cube.from[2]], to: [-cube.from[0], cube.to[1], cube.to[2]], faces };
    if (cube.pivot) out.pivot = [-cube.pivot[0], cube.pivot[1], cube.pivot[2]];
    if (cube.rot) out.rot = [cube.rot[0], -cube.rot[1], -cube.rot[2]];
    return out;
}
/** Miroir d'un os par rapport au plan x = 0. */
export function mirroredBone(bone) {
    return { ...bone, pivot: bone.pivot ? [-bone.pivot[0], bone.pivot[1], bone.pivot[2]] : bone.pivot, rot: bone.rot ? [bone.rot[0], -bone.rot[1], -bone.rot[2]] : bone.rot };
}
/** Images clés d'un canal pour le côté opposé : rotations y et z, et position x, changent de signe. */
export function mirroredKeys(channels) {
    const out = {};
    if (channels.rotation) out.rotation = channels.rotation.map(([t, v, m]) => [t, [v[0], -v[1], -v[2]], m]);
    if (channels.position) out.position = channels.position.map(([t, v, m]) => [t, [-v[0], v[1], v[2]], m]);
    if (channels.scale) out.scale = channels.scale;
    return out;
}
