// Modèles faits dans Blockbench : conversion en modèle SHCompagnons et rendu de contrôle.
// Usage : node blockbench.mjs [--echelle=0.45] [--tolerance=0.15] [--cote] [--sans-rendu] <nom | chemin/fichier.bbmodel> ...
//   <nom> : blockbench/<nom>.bbmodel. S'il existe une description blockbench/<nom>.mjs (bbkit.mjs), le projet
//   Blockbench est d'abord réécrit à partir d'elle ; --garder le laisse tel qu'il est (projet retouché à la main).
//   Produit sortie/<nom>.txt (fichier de modèle), sortie/peaux/<sha>.png (têtes à téléverser avec televerse.mjs) et
//   sortie/<nom>.png : quatre vues, puis une ligne d'images par état (idle, walk, interact...), lues par l'importeur
//   du plugin et interpolées comme le client le fait. --cote : les états vus de côté.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';
import { convert } from './bbmodel.mjs';
import { project } from './bbkit.mjs';
import { render } from './rendu.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'sortie'), SRC = join(HERE, 'blockbench');
const PLUGIN = join(HERE, '..');
const CP = [PLUGIN + '/target/classes', join(homedir(), '.m2/repository/org/joml/joml/1.10.8/joml-1.10.8.jar'),
    join(homedir(), '.m2/repository/com/github/retrooper/packetevents-api/2.14.0/packetevents-api-2.14.0.jar')].join(';');
mkdirSync(join(OUT, 'peaux'), { recursive: true });
mkdirSync(join(OUT, 'cache'), { recursive: true });

const args = process.argv.slice(2);
const option = (name, fallback) => { const a = args.find((x) => x.startsWith('--' + name + '=')); return a ? Number(a.slice(name.length + 3)) : fallback; };
const texFile = join(HERE, 'textures.json');
const textures = existsSync(texFile) ? JSON.parse(readFileSync(texFile, 'utf8')) : {};
const bySha = Object.fromEntries(Object.entries(textures).map(([sha, hash]) => [hash, sha]));

const files = [], info = {};
for (const arg of args.filter((a) => !a.startsWith('--'))) {
    let file = arg.endsWith('.bbmodel') ? arg : join(SRC, arg + '.bbmodel');
    const name = basename(file, '.bbmodel').toLowerCase();
    const source = join(SRC, name + '.mjs');
    let scale = option('echelle', 0.5);
    if (!arg.endsWith('.bbmodel') && existsSync(source) && !args.includes('--garder')) {
        const def = (await import(pathToFileURL(source).href + '?v=' + Date.now())).default;
        writeFileSync(file, JSON.stringify(project(def)));
        if (def.scale && !args.some((a) => a.startsWith('--echelle='))) scale = def.scale;
    }
    const made = convert(JSON.parse(readFileSync(file, 'utf8')), textures, { name, tolerance: option('tolerance', 0.15) });
    writeFileSync(join(OUT, name + '.txt'), made.text);
    for (const [sha, png] of Object.entries(made.skins)) writeFileSync(join(OUT, 'peaux', sha + '.png'), png);
    const missing = Object.keys(made.skins).filter((sha) => !textures[sha]).length;
    console.log(name + ' : ' + made.parts + ' pièces, ' + Object.keys(made.skins).length + ' peaux' + (missing ? ' (' + missing + ' à téléverser)' : ''));
    for (const s of made.states) console.log('  ' + s.name.padEnd(10) + String(s.ticks).padStart(4) + ' ticks' + (s.once ? ' (une fois)' : ' (boucle)  ') + String(s.moving).padStart(4) + ' pièces en mouvement' + String(s.keys).padStart(5) + ' images clés' + s.perSecond.toFixed(1).padStart(7) + ' paquets/s');
    for (const w of made.warnings) console.log('  ! ' + w);
    files.push(join(OUT, name + '.txt'));
    info[name] = { scale, yaw: 0, side: args.includes('--cote') };
}
if (args.includes('--sans-rendu') || !files.length) process.exit(0);

execFileSync('java', ['-cp', CP, join(HERE, 'Vide.java'), join(OUT, 'modeles-bb.json'), ...files], { encoding: 'utf8' });
const models = JSON.parse(readFileSync(join(OUT, 'modeles-bb.json'), 'utf8'));
const images = {};
for (const model of Object.values(models)) for (const part of model.parts) {
    const name = part.w.split('@')[0];
    if (images[name] !== undefined || !name.startsWith('head:')) continue;
    const hash = name.slice(5), local = hash.startsWith('local-') ? hash.slice(6) : bySha[hash] || null;
    const file = local ? join(OUT, 'peaux', local + '.png') : join(OUT, 'cache', hash + '.png');
    if (!existsSync(file)) { const r = await fetch('https://textures.minecraft.net/texture/' + hash); if (r.ok) writeFileSync(file, Buffer.from(await r.arrayBuffer())); }
    images[name] = existsSync(file) ? 'data:image/png;base64,' + readFileSync(file).toString('base64') : null;
}
await render(models, images, info, OUT, 'etats');
console.log('rendus : ' + Object.keys(models).map((n) => join(OUT, n + '.png')).join(' '));
