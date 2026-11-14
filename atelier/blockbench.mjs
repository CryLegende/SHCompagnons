// Modèles faits dans Blockbench : conversion en modèle SHCompagnons et rendu de contrôle.
// Usage : node blockbench.mjs [options] <nom | chemin/fichier.bbmodel> ... | tout
//   <nom> : blockbench/<nom>.bbmodel. S'il existe une description blockbench/<nom>.mjs (bbkit.mjs), le projet
//   Blockbench est d'abord réécrit à partir d'elle ; --garder le laisse tel qu'il est (projet retouché à la main).
//   Produit sortie/<nom>.txt (fichier de modèle), sortie/peaux/<sha>.png (têtes à téléverser avec televerse.mjs) et
//   sortie/<nom>.png : quatre vues, puis une ligne d'images par état (idle, walk, interact...), lues par l'importeur
//   du plugin et interpolées comme le client le fait.
// Options :
//   --planche=<nom>   une seule image sortie/<nom>.png : deux vues par modèle, tous à la même échelle de jeu
//   --cote            les états vus de côté
//   --zoom            images des états deux fois plus grandes ; --etats=interact,walk : seulement ces états
//   --echelle=0.4     échelle de jeu forcée (sinon celle de la description, sinon calculée : voir CORPS)
//   --tolerance=0.15  écart accepté (pixels du modèle) entre le mouvement voulu et celui que le client affichera
//   --sans-rendu      conversion seule
//   --livrer          copie les fichiers de modèle dans ../src/main/resources/models/ et écrit sortie/echelles.json
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';
import { convert } from './bbmodel.mjs';
import { project } from './bbkit.mjs';
import { render } from './rendu.mjs';

/** Taille visée en jeu : côté (blocs) du cube de même volume que les pièces du modèle. */
export const CORPS = 0.2;

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'sortie'), SRC = join(HERE, 'blockbench');
const PLUGIN = join(HERE, '..');
const CP = [PLUGIN + '/target/classes', join(homedir(), '.m2/repository/org/joml/joml/1.10.8/joml-1.10.8.jar'),
    join(homedir(), '.m2/repository/com/github/retrooper/packetevents-api/2.14.0/packetevents-api-2.14.0.jar')].join(';');
mkdirSync(join(OUT, 'peaux'), { recursive: true });
mkdirSync(join(OUT, 'cache'), { recursive: true });

const args = process.argv.slice(2);
const text = (name) => { const a = args.find((x) => x.startsWith('--' + name + '=')); return a ? a.slice(name.length + 3) : null; };
const option = (name, fallback) => (text(name) === null ? fallback : Number(text(name)));
const sheet = text('planche');
const texFile = join(HERE, 'textures.json');
const textures = existsSync(texFile) ? JSON.parse(readFileSync(texFile, 'utf8')) : {};
const bySha = Object.fromEntries(Object.entries(textures).map(([sha, hash]) => [hash, sha]));

let names = args.filter((a) => !a.startsWith('--'));
if (names.includes('tout')) names = readdirSync(SRC).filter((f) => f.endsWith('.bbmodel')).map((f) => f.replace('.bbmodel', '')).sort();
const files = [], info = {}, scales = {}, skinsOf = {};
let missing = 0;
for (const arg of names) {
    const file = arg.endsWith('.bbmodel') ? arg : join(SRC, arg + '.bbmodel');
    const name = basename(file, '.bbmodel').toLowerCase();
    const source = join(SRC, name + '.mjs');
    let def = null;
    if (!arg.endsWith('.bbmodel') && existsSync(source) && !args.includes('--garder')) {
        def = (await import(pathToFileURL(source).href + '?v=' + Date.now())).default;
        writeFileSync(file, JSON.stringify(project(def)));
    }
    const made = convert(JSON.parse(readFileSync(file, 'utf8')), textures, { name, tolerance: option('tolerance', 0.15) });
    writeFileSync(join(OUT, name + '.txt'), made.text);
    for (const [sha, png] of Object.entries(made.skins)) writeFileSync(join(OUT, 'peaux', sha + '.png'), png);
    skinsOf[name] = Object.keys(made.skins);
    const todo = Object.keys(made.skins).filter((sha) => !textures[sha]).length;
    missing += todo;
    const scale = text('echelle') !== null ? option('echelle') : def && def.scale ? def.scale : Math.round(CORPS / made.body * 100) / 100;
    const cost = (s) => s.perSecond.toFixed(1);
    console.log(name.padEnd(20) + String(made.parts).padStart(3) + ' pièces, ' + Object.keys(made.skins).length + ' peaux' + (todo ? ' (' + todo + ' à téléverser)' : '') + ', échelle ' + scale
        + ' — ' + made.states.map((s) => s.name + ' ' + cost(s) + '/s').join(', '));
    for (const w of made.warnings) console.log('  ! ' + w);
    if (made.parts > 12) console.log('  ! ' + made.parts + ' pièces : plus que la limite de 12');
    files.push(join(OUT, name + '.txt'));
    info[name] = { scale, yaw: 0, side: args.includes('--cote'), zoom: args.includes('--zoom'), only: text('etats') ? text('etats').split(',') : null };
    scales[name] = { scale, parts: made.parts, states: Object.fromEntries(made.states.map((s) => [s.name, +cost(s)])) };
    if (args.includes('--livrer')) writeFileSync(join(PLUGIN, 'src/main/resources/models', name + '.txt'), made.text);
}
if (missing) console.log(missing + ' peau(x) à téléverser : node televerse.mjs, puis relancer');
if (args.includes('--livrer')) writeFileSync(join(OUT, 'echelles.json'), JSON.stringify(scales, null, 1));
// Têtes de chaque modèle : televerse.mjs s'en sert pour finir les modèles un par un
const skinsFile = join(OUT, 'peaux-modeles.json');
writeFileSync(skinsFile, JSON.stringify({ ...(existsSync(skinsFile) ? JSON.parse(readFileSync(skinsFile, 'utf8')) : {}), ...skinsOf }, null, 1));
if (args.includes('--sans-rendu') || !files.length) process.exit(0);

const tag = (sheet || basename(files[0], '.txt')) + '-' + process.pid;
execFileSync('java', ['-cp', CP, join(HERE, 'Vide.java'), join(OUT, 'modeles-' + tag + '.json'), ...files], { encoding: 'utf8' });
const models = JSON.parse(readFileSync(join(OUT, 'modeles-' + tag + '.json'), 'utf8'));
const images = {};
for (const model of Object.values(models)) for (const part of model.parts) {
    const name = part.w.split('@')[0];
    if (images[name] !== undefined) continue;
    images[name] = null;
    if (name.startsWith('head:')) {
        const hash = name.slice(5), local = hash.startsWith('local-') ? hash.slice(6) : bySha[hash] || null;
        const file = local ? join(OUT, 'peaux', local + '.png') : join(OUT, 'cache', hash + '.png');
        if (!existsSync(file)) { const r = await fetch('https://textures.minecraft.net/texture/' + hash); if (r.ok) writeFileSync(file, Buffer.from(await r.arrayBuffer())); }
        if (existsSync(file)) images[name] = 'data:image/png;base64,' + readFileSync(file).toString('base64');
    } else {
        const file = join(OUT, 'cache', 'bloc-' + name + '.png');
        if (!existsSync(file)) for (const path of ['block/' + name, 'block/' + name + '_side', 'block/' + name + '_top', 'item/' + name]) {
            const r = await fetch(`https://assets.mcasset.cloud/1.21.4/assets/minecraft/textures/${path}.png`);
            if (r.ok) { writeFileSync(file, Buffer.from(await r.arrayBuffer())); break; }
        }
        if (existsSync(file)) images[name] = 'data:image/png;base64,' + readFileSync(file).toString('base64'); else console.log('texture absente : ' + name);
    }
}
await render(models, images, info, OUT, sheet || 'etats', tag);
console.log('rendus : ' + (sheet ? [sheet] : Object.keys(models)).map((n) => join(OUT, n + '.png')).join(' '));
