// Rendu 3D de contrôle des modèles tels que le plugin les lit (JSON de Vide.java) : quatre vues et les images de
// l'animation, calculées comme le client les interpole entre deux images clés. Une image PNG par modèle.
import { open, sleep } from './cdp.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * models : JSON de Vide.java ; images : { 'head:<empreinte>' | bloc : dataURL } ; info : { nom: { scale, frames, title } }.
 */
export async function render(models, images, info, outDir, sheet) {
    const page = `<!doctype html><meta charset="utf-8"><title>rendu</title><body style="margin:0;background:#fff">
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
const MODELS = ${JSON.stringify(models)};
const IMAGES = ${JSON.stringify(images)};
const INFO = ${JSON.stringify(info)};
const loaded = {};
function load(src) { return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
function crop(img, x, y, flipV) {
    const c = document.createElement('canvas'); c.width = 8; c.height = 8; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    if (flipV) { g.translate(0, 8); g.scale(1, -1); }
    g.drawImage(img, x, y, 8, 8, 0, 0, 8, 8);
    const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; return t;
}
// Tête de joueur regardant +z : faces de BoxGeometry dans l'ordre +x -x +y -y +z -z. Le dessous est rangé dans la
// peau comme vu à travers la tête depuis le dessus : retourné par rapport au placage par défaut.
function headMesh(img) {
    const group = new THREE.Group();
    for (const [ox, size, over] of [[0, 0.5, false], [32, 0.53125, true]]) {
        const tex = [crop(img, ox + 16, 8), crop(img, ox, 8), crop(img, ox + 8, 0), crop(img, ox + 16, 0, true), crop(img, ox + 8, 8), crop(img, ox + 24, 8)];
        const mats = tex.map((t) => new THREE.MeshBasicMaterial({ map: t, transparent: over, alphaTest: over ? 0.04 : 0, side: over ? THREE.DoubleSide : THREE.FrontSide }));
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mats);
        mesh.position.set(0, -0.25, 0);
        group.add(mesh);
    }
    group.rotation.y = Math.PI; // un item_display montre l'objet tourné de 180°
    return group;
}
function blockMesh(name, img) {
    const t = img ? (() => { const c = document.createElement('canvas'); c.width = c.height = 16; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 16, 16, 0, 0, 16, 16); const x = new THREE.CanvasTexture(c); x.magFilter = x.minFilter = THREE.NearestFilter; return x; })() : null;
    const glass = name.endsWith('stained_glass');
    // Boîtes des blocs qui ne sont pas des cubes pleins (paratonnerre : tige de 2 px)
    const box = name === 'lightning_rod' ? [0.4375, 0, 0.4375, 0.5625, 1, 0.5625] : [0, 0, 0, 1, 1, 1];
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(box[3] - box[0], box[4] - box[1], box[5] - box[2]), [0, 1, 2, 3, 4, 5].map(() => (t ? new THREE.MeshBasicMaterial({ map: t, transparent: glass, depthWrite: !glass }) : new THREE.MeshBasicMaterial({ color: name === 'lightning_rod' ? 0xc0704d : 0xff00ff }))));
    mesh.position.set((box[0] + box[3]) / 2, (box[1] + box[4]) / 2, (box[2] + box[5]) / 2);
    if (glass) mesh.renderOrder = 5;
    const group = new THREE.Group(); group.add(mesh); return group;
}
async function visual(part, w) {
    const name = w.split('@')[0];
    if (loaded[name] === undefined) loaded[name] = IMAGES[name] ? await load(IMAGES[name]) : null;
    const img = loaded[name];
    if (part.k === 'block_display') return blockMesh(name, img);
    if (name.startsWith('head:') && img) return headMesh(img);
    if (img) {
        // Objet : image plate, lisible à l'endroit depuis -z une fois tournée de 180° par l'item_display
        const c = document.createElement('canvas'); c.width = c.height = 16; c.getContext('2d').drawImage(img, 0, 0, 16, 16, 0, 0, 16, 16);
        const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter;
        const flat = new THREE.Group(); flat.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide })));
        flat.rotation.y = Math.PI; return flat;
    }
    const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), [0, 1, 2, 3, 4, 5].map(() => new THREE.MeshBasicMaterial({ color: 0xff00ff })))); return g;
}
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const Q = (a) => new THREE.Quaternion(a[0], a[1], a[2], a[3]);
function matrix(x) {
    const m = new THREE.Matrix4().makeTranslation(x.t[0], x.t[1], x.t[2]);
    m.multiply(new THREE.Matrix4().makeRotationFromQuaternion(Q(x.l)));
    m.multiply(new THREE.Matrix4().makeScale(x.s[0], x.s[1], x.s[2]));
    m.multiply(new THREE.Matrix4().makeRotationFromQuaternion(Q(x.r)));
    return m;
}
// État d'une pièce à un instant : le client va en ligne droite d'une image clé à la suivante (rotations au plus court)
function state(part, tick) {
    let w = part.w, x = part;
    const looks = part.looks;
    if (looks) {
        const local = ((tick % looks.loop) + looks.loop) % looks.loop;
        let k = 0; while (k + 1 < looks.keys.length && looks.keys[k + 1].tick <= local) k++;
        w = looks.keys[k].w;
    }
    const track = part.track;
    if (track) {
        const local = ((tick % track.loop) + track.loop) % track.loop;
        let k = 0; while (k + 1 < track.keys.length && track.keys[k + 1].tick <= local) k++;
        const a = track.keys[k], last = k + 1 === track.keys.length, b = last ? track.keys[0] : track.keys[k + 1];
        const end = last ? track.loop : b.tick, p = (local - a.tick) / (end - a.tick);
        x = { t: V(a.t).lerp(V(b.t), p).toArray(), s: V(a.s).lerp(V(b.s), p).toArray(), l: Q(a.l).slerp(Q(b.l), p).toArray(), r: Q(a.r).slerp(Q(b.r), p).toArray() };
    }
    return { x, w };
}
// Éclairage des entités du jeu : deux lumières fixes, 0,4 d'ambiante, plafonné à 1 (dessus 1, avant/arrière 0,74, côtés 0,5)
const LIGHTS = [new THREE.Vector3(0.2, 1, -0.7).normalize(), new THREE.Vector3(-0.2, 1, 0.7).normalize()];
const NORMALS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
function shade(mesh) {
    const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    if (!Array.isArray(mesh.material)) { mesh.material.color.setRGB(0.85, 0.85, 0.85); return; }
    mesh.material.forEach((mat, i) => {
        const n = V(NORMALS[i]).applyMatrix3(nm).normalize();
        const b = Math.min(1, 0.4 + 0.6 * (Math.max(0, n.dot(LIGHTS[0])) + Math.max(0, n.dot(LIGHTS[1]))));
        mat.color.setRGB(b, b, b);
    });
}
const TEINTES = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#9a6324'];
let TEINTER = false;
async function scene(model, tick, refSize, yaw) {
    const top = new THREE.Scene();
    const sc = new THREE.Group(); sc.rotation.y = (yaw || 0) * Math.PI / 180; top.add(sc); sc.updateMatrixWorld(true);
    for (const part of model.parts) {
        const st = state(part, tick);
        const holder = new THREE.Group(); holder.matrixAutoUpdate = false; holder.matrix.copy(matrix(st.x));
        holder.add(await visual(part, st.w));
        if (TEINTER) holder.traverse((o) => { if (o.isMesh) o.material = (Array.isArray(o.material) ? o.material : [o.material]).map(() => new THREE.MeshBasicMaterial({ color: TEINTES[model.parts.indexOf(part) % TEINTES.length] })); });
        sc.add(holder);
        sc.updateMatrixWorld(true);
        holder.traverse((o) => { if (o.isMesh) shade(o); });
        if (TEINTER) { const tint = new THREE.Color(TEINTES[model.parts.indexOf(part) % TEINTES.length]); holder.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.color.multiply(tint)); }); }
    }
    if (refSize) top.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(refSize, refSize, refSize)), new THREE.LineBasicMaterial({ color: 0xffe000 })));
    return top;
}
async function view(model, tick, dir, size, half, ref, yaw) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(size, size);
    renderer.setClearColor(0x7f93a8, 1);
    const cam = new THREE.OrthographicCamera(-half, half, half, -half, 0.01, 50);
    cam.position.set(dir[0] * 10, dir[1] * 10, dir[2] * 10); cam.lookAt(0, 0, 0);
    renderer.render(await scene(model, tick, ref, yaw), cam);
    const c = document.createElement('canvas'); c.width = c.height = size; c.getContext('2d').drawImage(renderer.domElement, 0, 0);
    renderer.dispose(); renderer.forceContextLoss();
    return c;
}
// Planche : deux vues par modèle (3/4 avant, face) à la même échelle de jeu, quatre modèles par ligne
window.sheet = async (names) => {
    const cell = 400, v = 200, top = 20;
    const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = Math.ceil(names.length / 4) * (v + top);
    const g = canvas.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < names.length; i++) {
        const model = MODELS[names[i]], info = INFO[names[i]] || {}, scale = info.scale || 0.5;
        const x = (i % 4) * cell, y = Math.floor(i / 4) * (v + top);
        // même échelle de jeu pour tous : la vue couvre 0,62 bloc
        const half = 0.31 / scale;
        g.drawImage(await view(model, 0, [0.75, 0.5, 1], v, half, 0, info.yaw), x, y + top);
        g.drawImage(await view(model, 0, [0, 0.12, 1], v, half, 0.25 / scale, info.yaw), x + v, y + top);
        g.fillStyle = '#000'; g.font = 'bold 12px Arial';
        g.fillText(names[i] + ' — ' + model.parts.length + ' p. — ' + scale + ' → ' + model.size.map((s) => (s * scale).toFixed(2)).join('x'), x + 3, y + 14);
    }
    return canvas.toDataURL('image/png');
};
// Planche d'animation : une ligne par modèle, jusqu'à huit images de son animation en vue de 3/4
window.anim = async (names) => {
    const v = 200, top = 18;
    const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = names.length * (v + top);
    const g = canvas.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < names.length; i++) {
        const model = MODELS[names[i]], info = INFO[names[i]] || {}, frames = (info.frames || []).slice(0, 8);
        const half = 0.5 * Math.hypot(model.size[0], model.size[1], model.size[2]) * 1.15;
        const y = i * (v + top);
        for (let k = 0; k < frames.length; k++) {
            g.drawImage(await view(model, frames[k], k % 2 ? [-0.75, 0.45, 1] : [0.75, 0.45, 1], v, half, 0, info.yaw), k * v, y + top);
            g.fillStyle = '#fff'; g.font = '12px Arial'; g.fillText('t=' + frames[k], k * v + 4, y + top + 13);
        }
        g.fillStyle = '#000'; g.font = 'bold 12px Arial'; g.fillText(names[i], 3, y + 13);
    }
    return canvas.toDataURL('image/png');
};
// Numéros des pièces : trois vues où chaque pièce porte la couleur de son numéro, et la légende
window.indices = async (names) => {
    const v = 300, top = 22;
    const canvas = document.createElement('canvas'); canvas.width = 1500; canvas.height = names.length * (v + top);
    const g = canvas.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < names.length; i++) {
        const model = MODELS[names[i]], info = INFO[names[i]] || {}, y = i * (v + top);
        const half = 0.5 * Math.hypot(model.size[0], model.size[1], model.size[2]) * 1.05;
        const dirs = [[0.75, 0.5, 1], [-0.8, 0.6, -1], [1, 0.08, 0], [0, 1, 0.01]];
        TEINTER = false; g.drawImage(await view(model, 0, dirs[0], v, half, 0, info.yaw), 0, y + top);
        TEINTER = true;
        for (let k = 0; k < dirs.length; k++) g.drawImage(await view(model, 0, dirs[k], v, half, 0, info.yaw), (k + 1) * v, y + top);
        TEINTER = false;
        g.font = 'bold 13px Arial'; g.fillStyle = '#000'; g.fillText(names[i] + ' (vues teintées : 3/4 avant, 3/4 arrière, côté +x, dessus)', 3, y + 15);
        model.parts.forEach((p, n) => { g.fillStyle = TEINTES[n % TEINTES.length]; g.fillRect(560 + n * 46, y + 3, 14, 14); g.fillStyle = '#000'; g.fillText(String(n), 577 + n * 46, y + 15); });
    }
    return canvas.toDataURL('image/png');
};
window.draw = async (name) => {
    const model = MODELS[name], info = INFO[name] || {};
    const scale = info.scale || 0.5;
    const W = 1600, top = 26, big = 400, small = 200;
    const frames = info.frames && info.frames.length ? info.frames : [];
    const rowsOfFrames = Math.ceil(frames.length / 8);
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = top + big + rowsOfFrames * (small + 16);
    const g = canvas.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, canvas.height);
    const half = 0.5 * Math.hypot(model.size[0], model.size[1], model.size[2]) * 1.02;
    const tracks = model.parts.filter((p) => p.track), cycles = model.parts.filter((p) => p.looks);
    g.fillStyle = '#000'; g.font = 'bold 15px Arial';
    g.fillText(name + ' — ' + model.parts.length + ' pièces, ' + tracks.length + ' en mouvement (' + tracks.reduce((n, p) => n + p.track.keys.length, 0) + ' images clés, cycles ' + [...new Set(tracks.map((p) => p.track.loop))].join('/') + ' ticks), ' + cycles.length + ' à textures (' + [...new Set(cycles.map((p) => p.looks.loop))].join('/') + ' ticks) — échelle ' + scale + ' → ' + model.size.map((v) => (v * scale).toFixed(2)).join(' x ') + ' bloc (cadre jaune = ancienne tête 0,25)', 6, 18);
    const shot = async (tick, dir, size, x, y, label, ref) => {
        g.drawImage(await view(model, tick, dir, size, half, ref ? 0.25 / scale : 0, info.yaw), x, y);
        g.fillStyle = '#fff'; g.font = '12px Arial'; g.fillText(label, x + 5, y + 14);
    };
    await shot(0, [0, 0.12, 1], big, 0, top, 'face', true);
    await shot(0, [0.75, 0.5, 1], big, big, top, '3/4 avant', false);
    await shot(0, [1, 0.08, 0], big, 2 * big, top, 'côté (+x)', false);
    await shot(0, [-0.8, 0.6, -1], big, 3 * big, top, '3/4 arrière', false);
    for (let i = 0; i < frames.length; i++) {
        await shot(frames[i], i % 2 ? [0.75, 0.5, 1] : [0.75, 0.5, 1], small, (i % 8) * small, top + big + 16 + Math.floor(i / 8) * (small + 16), 't=' + frames[i], false);
    }
    return canvas.toDataURL('image/png');
};
document.title = 'pret';
</script>`;
    const file = join(outDir, 'rendu.html');
    writeFileSync(file, page);
    const b = await open();
    try {
        await b.goto(pathToFileURL(file).href, 500);
        for (let i = 0; i < 40 && (await b.js('document.title')) !== 'pret'; i++) await sleep(250);
        if (sheet) {
            const url = await b.js(`${sheet.startsWith('anim') ? 'anim' : sheet.startsWith('indices') ? 'indices' : 'sheet'}(${JSON.stringify(Object.keys(models))})`);
            writeFileSync(join(outDir, sheet + '.png'), Buffer.from(url.split(',')[1], 'base64'));
        } else for (const name of Object.keys(models)) {
            const url = await b.js(`draw(${JSON.stringify(name)})`);
            writeFileSync(join(outDir, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
        }
    } finally { b.close(); }
}
