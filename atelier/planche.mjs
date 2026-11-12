// Planches de tous les compagnons de config.yml, à l'échelle et dans l'orientation du jeu.
// Usage : node planche.mjs [--cdn] [--echelles]
//   → sortie/compagnons-1.png, -2.png... (deux vues par compagnon) et sortie/compagnons-anim-N.png (images d'animation)
//   --echelles : met d'abord placement.scale des compagnons faits ici à l'échelle de leur fichier de modeles/
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// Le plugin : le dossier parent de l'atelier
const PLUGIN = join(HERE, '..');
const CONFIG = join(PLUGIN, 'src/main/resources/config.yml');
const args = process.argv.slice(2);

function pets() {
    const out = [];
    let current = null, inRotation = false;
    const text = readFileSync(CONFIG, 'utf8');
    for (const line of text.slice(text.indexOf('\npets:\n')).split('\n')) {
        const key = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(line);
        if (key) { current = { key: key[1], scale: 0.5, yaw: -10 }; out.push(current); continue; }
        if (!current) continue;
        const model = /^ {4}model:\s*(\S+)/.exec(line); if (model) current.model = model[1];
        const scale = /^ {6}scale:\s*(\S+)/.exec(line); if (scale) current.scale = Number(scale[1]);
        if (/^ {6}rotation:/.test(line)) { inRotation = true; continue; }
        const y = /^ {8}y:\s*(\S+)/.exec(line); if (y && inRotation) current.yaw = Number(y[1]);
        if (!/^ {8}/.test(line)) inRotation = false;
    }
    return out;
}

if (args.includes('--echelles')) {
    let text = readFileSync(CONFIG, 'utf8');
    for (const pet of pets()) {
        const file = join(HERE, 'modeles', pet.model + '.mjs');
        if (!existsSync(file)) continue;
        const def = (await import(pathToFileURL(file).href)).default;
        if (def.scale === pet.scale) continue;
        const block = new RegExp('(\\n  ' + pet.key + ':\\n(?:    .*\\n|      .*\\n|        .*\\n)*?      scale: )[0-9.]+');
        if (!block.test(text)) throw new Error('échelle introuvable pour ' + pet.key);
        text = text.replace(block, '$1' + def.scale);
        console.log(pet.key + ' : ' + pet.scale + ' → ' + def.scale);
    }
    writeFileSync(CONFIG, text);
}

const list = pets();
const frames = {};
for (const pet of list) {
    const file = join(HERE, 'modeles', pet.model + '.mjs');
    if (existsSync(file)) continue;
    // modèle repris du site : images d'animation réparties sur son plus long cycle (lues dans le fichier produit)
    const text = readFileSync(join(HERE, 'sortie', pet.model + '.txt'), 'utf8');
    const loops = [...text.matchAll(/@animation loop=(\d+)/g)].map((m) => Number(m[1]));
    const loop = loops.length ? Math.max(...loops) : 0;
    frames[pet.model] = loop ? Array.from({ length: 8 }, (_, i) => Math.round(i * loop / 8)).join(',') : '';
}
// le rendu ajoute déjà le placement par défaut (-10°) quand il n'est pas donné : ici l'orientation du jeu + 10
const arg = (pet) => (existsSync(join(HERE, 'modeles', pet.model + '.mjs')) ? pet.model : 'sortie/' + pet.model + ':' + pet.scale + ':' + (pet.yaw + 10) + ':' + frames[pet.model]);
const run = (name, group) => execFileSync('node', [join(HERE, 'atelier.mjs'), ...(args.includes('--cdn') ? ['--cdn'] : []), '--planche=' + name, ...group.map(arg)], { stdio: 'inherit' });
for (let i = 0; i * 20 < list.length; i++) run('compagnons-' + (i + 1), list.slice(i * 20, i * 20 + 20));
for (let i = 0; i * 8 < list.length; i++) run('anim-compagnons-' + (i + 1), list.slice(i * 8, i * 8 + 8));
