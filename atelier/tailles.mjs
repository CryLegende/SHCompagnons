// Taille en jeu de chaque compagnon de config.yml, pour les garder comparables : « corps » = côté du cube qui aurait
// le même volume que toutes ses pièces réunies (une aile fine ou un objet tenu ne le gonflent pas), et plus grande
// dimension de sa boîte. Avec --cible <corps>, propose l'échelle qui donne ce corps (plus grande dimension bornée).
// Usage : node tailles.mjs [--cible 0.26] [--max 0.5]     (après atelier.mjs tout et animer.mjs : lit sortie/<modèle>.txt)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN = join(HERE, '..');
const CP = [PLUGIN + '/target/classes', join(homedir(), '.m2/repository/org/joml/joml/1.10.8/joml-1.10.8.jar'),
    join(homedir(), '.m2/repository/com/github/retrooper/packetevents-api/2.14.0/packetevents-api-2.14.0.jar')].join(';');
const args = process.argv.slice(2);
const option = (name, fallback) => (args.includes(name) ? Number(args[args.indexOf(name) + 1]) : fallback);
const target = option('--cible', 0), cap = option('--max', 0.5);

const pets = [];
let current = null;
const config = readFileSync(PLUGIN + '/src/main/resources/config.yml', 'utf8');
for (const line of config.slice(config.indexOf('\npets:\n')).split('\n')) {
    const key = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (key) { current = { key: key[1], scale: 0.5 }; pets.push(current); continue; }
    const model = /^ {4}model:\s*(\S+)/.exec(line); if (model && current) current.model = model[1];
    const scale = /^ {6}scale:\s*(\S+)/.exec(line); if (scale && current) current.scale = Number(scale[1]);
}
const file = (model) => [join(HERE, 'sortie', model + '.txt'), join(PLUGIN, 'src/main/resources/models', model + '.txt')].find(existsSync);
const json = join(HERE, 'sortie', 'tailles.json');
execFileSync('java', ['-cp', CP, join(HERE, 'Vide.java'), json, ...new Set(pets.map((p) => file(p.model)))], { stdio: 'ignore' });
const models = JSON.parse(readFileSync(json, 'utf8'));
console.log('compagnon            échelle  corps   boîte (blocs)' + (target ? '        échelle proposée' : ''));
for (const p of pets) {
    const m = models[p.model];
    let volume = 0;
    for (const part of m.parts) {
        if (part.k === 'block_display') volume += part.s[0] * part.s[1] * part.s[2];
        else if (part.w.startsWith('head:')) volume += part.s[0] * part.s[1] * part.s[2] / 8;
    }
    const body = Math.cbrt(volume), largest = Math.max(...m.size);
    let line = p.key.padEnd(20) + String(p.scale).padStart(7) + (body * p.scale).toFixed(3).padStart(7) + '   ' + m.size.map((v) => (v * p.scale).toFixed(2)).join(' x ');
    if (target) { const s = Math.min(target / body, cap / largest); line = line.padEnd(58) + (Math.round(s * 100) / 100).toFixed(2) + (s < target / body ? '  (bornée par la boîte)' : ''); }
    console.log(line);
}
