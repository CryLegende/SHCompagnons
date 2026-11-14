// Icône de menu d'un compagnon fait dans Blockbench : la tête de joueur qui porte son visage (le cube du visage).
// Usage : node icones-bb.mjs [<modèle> ...]      (sans nom : tous les modèles de blockbench/)
//   → sortie/icones-bb.txt, une ligne par modèle : <modèle> <empreinte> <valeur base64 de la tête>
// Le cube du visage est celui que la description nomme (icone: '<nom du cube>'), sinon le cube « tete », sinon le
// premier dont la face avant porte deux yeux. Une tête pas encore téléversée (televerse.mjs) est signalée et laissée de côté.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { convert } from './bbmodel.mjs';
import { project } from './bbkit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'blockbench');
const textures = JSON.parse(readFileSync(join(HERE, 'textures.json'), 'utf8'));
const known = existsSync(join(HERE, 'sortie', 'peaux-modeles.json')) ? JSON.parse(readFileSync(join(HERE, 'sortie', 'peaux-modeles.json'), 'utf8')) : {};
const b64 = (hash) => Buffer.from('{"textures":{"SKIN":{"url":"http://textures.minecraft.net/texture/' + hash + '"}}}').toString('base64');
const eyes = (cube) => Array.isArray(cube.faces?.north) && cube.faces.north.length === 8 && cube.faces.north.some((row) => (row.match(/k/g) || []).length >= 2);

let names = process.argv.slice(2);
if (!names.length) names = readdirSync(SRC).filter((f) => f.endsWith('.mjs') && !f.startsWith('_')).map((f) => f.replace('.mjs', '')).sort();
const lines = [], missing = [];
for (const name of names) {
    const def = (await import(pathToFileURL(join(SRC, name + '.mjs')).href)).default;
    const cube = def.cubes.find((c) => c.name === def.icone) || def.cubes.find((c) => c.name === 'tete') || def.cubes.find((c) => !c.block && !c.item && eyes(c)) || def.cubes.find((c) => !c.block && !c.item && c.faces?.north?.px) || def.cubes.find((c) => !c.block && !c.item);
    const made = convert(project({ ...def, cubes: [cube], animations: {} }), textures, { name });
    const [sha] = Object.keys(made.skins);
    if (known[name] && !known[name].includes(sha)) throw new Error(name + ' : la tête du cube ' + cube.name + ' ne fait pas partie du modèle converti');
    if (!textures[sha]) { missing.push(name + ' (' + cube.name + ')'); continue; }
    lines.push(name + ' ' + textures[sha] + ' ' + b64(textures[sha]));
    console.log(name.padEnd(24) + cube.name);
}
writeFileSync(join(HERE, 'sortie', 'icones-bb.txt'), lines.join('\n') + '\n');
console.log(lines.length + ' icône(s) dans sortie/icones-bb.txt' + (missing.length ? ' ; têtes à téléverser d\'abord : ' + missing.join(', ') : ''));
