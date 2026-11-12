// Fabrique des modèles de l'atelier et rendu de contrôle.
// Usage : node atelier.mjs [--cdn] [--sans-rendu] <modèle> [<modèle> ...] | tout
//   modeles/<nom>.mjs → sortie/<nom>.txt (fichier de modèle SHCompagnons), sortie/peaux/<sha>.png (textures de têtes),
//   sortie/<nom>.png (rendu : quatre vues + images de l'animation, lues par l'importeur du plugin).
//   Un fichier .txt déjà présent dans importes/ (modèle du site) se rend aussi : node atelier.mjs importes/<nom>
// textures.json : sha de peau → empreinte textures.minecraft.net, rempli par televerse.mjs. Tant qu'une peau n'est pas
// téléversée, le fichier de modèle porte « local-<sha> » : il se rend ici mais ne s'affiche pas en jeu.
// --cdn : les textures du rendu viennent de textures.minecraft.net (ce que les joueurs reçoivent), pas des PNG locaux.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';
import { build } from './kit.mjs';
import { render } from './rendu.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'sortie');
// Le plugin : le dossier parent de l'atelier
const PLUGIN = join(HERE, '..');
const CP = [PLUGIN + '/target/classes', join(homedir(), '.m2/repository/org/joml/joml/1.10.8/joml-1.10.8.jar'),
    join(homedir(), '.m2/repository/com/github/retrooper/packetevents-api/2.14.0/packetevents-api-2.14.0.jar')].join(';');
mkdirSync(join(OUT, 'peaux'), { recursive: true });
mkdirSync(join(OUT, 'cache'), { recursive: true });

const args = process.argv.slice(2);
const cdn = args.includes('--cdn'), noRender = args.includes('--sans-rendu');
// --planche=<nom> : une seule image sortie/<nom>.png, deux vues par modèle à la même échelle de jeu
const sheet = (args.find((a) => a.startsWith('--planche=')) || '').slice(10) || null;
// <dossier>/<modèle>:<échelle>:<lacet>:<ticks,ticks...> règle l'échelle, l'orientation et les images d'animation d'un
// modèle importé (importes/, refs/) ou animé par animer.mjs (sortie/) dans le rendu
let names = args.filter((a) => !a.startsWith('--'));
if (names.includes('tout')) {
    names = readdirSync(join(HERE, 'modeles')).filter((f) => f.endsWith('.mjs') && !f.startsWith('_')).map((f) => f.replace('.mjs', ''));
    // Construction complète : le dossier des peaux ne garde que celles des modèles actuels (c'est lui que televerse.mjs envoie)
    for (const f of readdirSync(join(OUT, 'peaux'))) rmSync(join(OUT, 'peaux', f));
}
const texFile = join(HERE, 'textures.json');
const textures = existsSync(texFile) ? JSON.parse(readFileSync(texFile, 'utf8')) : {};
const bySha = Object.fromEntries(Object.entries(textures).map(([sha, hash]) => [hash, sha]));

const info = {}, files = [];
for (const name of names) {
    if (name.includes('/')) {
        const [path, scale, yaw, frames] = name.split(':');
        files.push(join(HERE, path + '.txt')); info[basename(path)] = { scale: Number(scale) || 0.5, yaw: Number(yaw) || 0, frames: frames ? frames.split(',').map(Number) : [] }; continue;
    }
    const def = (await import(pathToFileURL(join(HERE, 'modeles', name + '.mjs')).href + '?v=' + Date.now())).default;
    const made = build(def, textures);
    writeFileSync(join(OUT, def.name + '.txt'), made.text);
    for (const [sha, png] of Object.entries(made.skins)) writeFileSync(join(OUT, 'peaux', sha + '.png'), png);
    const missing = Object.keys(made.skins).filter((sha) => !textures[sha]).length;
    console.log(def.name + ' : ' + made.parts + ' pièces, ' + Object.keys(made.skins).length + ' peaux' + (missing ? ' (' + missing + ' à téléverser)' : ''));
    files.push(join(OUT, def.name + '.txt'));
    let frames = def.frames;
    if (!frames) { const loop = Math.max(0, ...(def.clips || []).map((c) => c.loop)); frames = loop ? Array.from({ length: 8 }, (_, i) => Math.round(i * loop / 8)) : []; }
    info[def.name] = { scale: def.scale || 0.5, frames, yaw: 0 };
}
if (noRender || !files.length) process.exit(0);

console.log(execFileSync('java', ['-cp', CP, join(HERE, 'Vide.java'), join(OUT, 'modeles.json'), ...files], { encoding: 'utf8' }).trim());
const models = JSON.parse(readFileSync(join(OUT, 'modeles.json'), 'utf8'));

// Images des textures : peau locale, ou image servie par textures.minecraft.net (gardée en cache)
const images = {};
async function image(w) {
    const name = w.split('@')[0];
    if (images[name] !== undefined) return;
    images[name] = null;
    if (name.startsWith('head:')) {
        let hash = name.slice(5);
        const local = hash.startsWith('local-') ? hash.slice(6) : (!cdn && bySha[hash]) || null;
        let file = local ? join(OUT, 'peaux', local + '.png') : join(OUT, 'cache', hash + '.png');
        if (!existsSync(file)) {
            const r = await fetch('https://textures.minecraft.net/texture/' + hash);
            if (!r.ok) { console.log('texture absente : ' + hash); return; }
            writeFileSync(file, Buffer.from(await r.arrayBuffer()));
        }
        images[name] = 'data:image/png;base64,' + readFileSync(file).toString('base64');
    } else {
        const file = join(OUT, 'cache', 'bloc-' + name + '.png');
        if (!existsSync(file)) {
            for (const path of ['block/' + name, 'block/' + name + '_side', 'block/' + name + '_top', 'item/' + name]) {
                const r = await fetch(`https://assets.mcasset.cloud/1.21.4/assets/minecraft/textures/${path}.png`);
                if (r.ok) { writeFileSync(file, Buffer.from(await r.arrayBuffer())); break; }
            }
        }
        if (existsSync(file)) images[name] = 'data:image/png;base64,' + readFileSync(file).toString('base64'); else console.log('texture de bloc absente : ' + name);
    }
}
for (const model of Object.values(models)) for (const part of model.parts) { await image(part.w); for (const key of part.looks?.keys || []) await image(key.w); }
await render(models, images, info, OUT, sheet);
console.log('rendus : ' + (sheet ? [sheet] : Object.keys(models)).map((n) => join(OUT, n + '.png')).join(' '));
