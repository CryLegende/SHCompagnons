// Compare le convertisseur avec ce que Blockbench affiche pour un vrai modèle : node verif2.mjs <oracle2.json> <fichier.bbmodel> <bbmodel.mjs>
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const [oracleFile, modelFile, converter, outDir] = process.argv.slice(2);
const { interne } = await import(pathToFileURL(converter).href);
const o = JSON.parse(fs.readFileSync(oracleFile, 'utf8'));
const bb = JSON.parse(fs.readFileSync(modelFile, 'utf8'));
const model = interne.tree(bb, () => {}), anims = interne.animations(bb, model.bones, () => {});
const qRot = (q, v) => { const [x, y, z, w] = q, [vx, vy, vz] = v; const tx = 2 * (y * vz - z * vy), ty = 2 * (z * vx - x * vz), tz = 2 * (x * vy - y * vx); return [vx + w * tx + y * tz - z * ty, vy + w * ty + z * tx - x * tz, vz + w * tz + x * ty - y * tx]; };
const corners = (p) => { const out = []; for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) { const r = qRot(p.q, [sx * p.size[0] / 2, sy * p.size[1] / 2, sz * p.size[2] / 2]); out.push([-(p.c[0] + r[0]), p.c[1] + r[1], -(p.c[2] + r[2])]); } return out; };
const compare = (poses, shown) => { let worst = 0, where = ''; model.cubes.forEach((cube, i) => { const mine = corners(poses[i]); for (const v of shown[cube.name].verts) { const d = Math.min(...mine.map((c) => Math.hypot(c[0] - v[0], c[1] - v[1], c[2] - v[2]))); if (d > worst) { worst = d; where = cube.name; } } }); return [worst, where]; };
console.log('Blockbench a ouvert : ' + o.cubes + ' cubes, ' + o.groups + ' os, animations ' + o.animations.join(' ') + ', texture ' + o.textures.join(' '));
let worst = compare(interne.pose(model, null, 0, () => {}), o.base);
console.log('pose de base'.padEnd(16) + worst[0].toFixed(5) + ' px');
let max = worst[0];
for (const [key, shown] of Object.entries(o.samples)) {
    const [name, t] = key.split('@');
    worst = compare(interne.pose(model, anims.find((a) => a.name === name), Number(t), () => {}), shown);
    max = Math.max(max, worst[0]);
    console.log(key.padEnd(16) + worst[0].toFixed(5) + ' px' + (worst[0] > 2e-3 ? '  <<< ' + worst[1] : ''));
}
console.log(max > 2e-3 ? 'ÉCART' : 'tout concorde (écart max ' + max.toFixed(5) + ' px)');
if (outDir) for (const [name, url] of Object.entries(o.shots)) fs.writeFileSync(outDir + '/bb-' + name + '.png', Buffer.from(url.split(',')[1], 'base64'));
