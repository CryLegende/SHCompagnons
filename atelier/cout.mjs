// Coût réseau de chaque compagnon de config.yml : paquets par seconde reçus par un joueur qui le voit, tant que son
// propriétaire bouge (au repos : zéro). Compte l'animation du compagnon entier (un paquet par pièce et par image clé)
// et les animations propres aux pièces (un paquet par image clé ou changement de texture).
// Usage : node cout.mjs   (après atelier.mjs tout et animer.mjs : lit sortie/<modèle>.txt)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
// Le plugin : le dossier parent de l'atelier
const PLUGIN = join(HERE, '..');
const CP = [PLUGIN + '/target/classes', join(homedir(), '.m2/repository/org/joml/joml/1.10.8/joml-1.10.8.jar'),
    join(homedir(), '.m2/repository/com/github/retrooper/packetevents-api/2.14.0/packetevents-api-2.14.0.jar')].join(';');
// images clés par tick de l'animation du compagnon entier (Animation.java)
const WHOLE = { NONE: 0, FLOAT: 6 / 100, BOUNCING: 4 / 22, GLIDE: 6 / 70, GLIDE_WOBBLE: 1 / 10, WOBBLE_SIDE: 8 / 126, SPIN: 10 / 80 };

const pets = [];
let current = null;
const config = readFileSync(PLUGIN + '/src/main/resources/config.yml', 'utf8');
for (const line of config.slice(config.indexOf('\npets:\n')).split('\n')) {
    const key = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(line);
    if (key) { current = { key: key[1] }; pets.push(current); continue; }
    const field = /^ {4}(model|animation|animation_speed):\s*(\S+)/.exec(line);
    if (field && current) current[field[1]] = field[2];
}
const file = (model) => [join(HERE, 'sortie', model + '.txt'), join(PLUGIN, 'src/main/resources/models', model + '.txt')].find(existsSync);
const json = join(HERE, 'sortie', 'cout.json');
execFileSync('java', ['-cp', CP, join(HERE, 'Vide.java'), json, ...new Set(pets.map((p) => file(p.model)))], { stdio: 'ignore' });
const models = JSON.parse(readFileSync(json, 'utf8'));
const rows = pets.map((p) => {
    const m = models[p.model];
    const whole = m.parts.length * WHOLE[p.animation] * Number(p.animation_speed || 1) * 20;
    const own = m.parts.reduce((n, part) => n + (part.track ? part.track.keys.length / part.track.loop : 0) + (part.looks ? part.looks.keys.length / part.looks.loop : 0), 0) * 20;
    return { key: p.key, parts: m.parts.length, animated: m.parts.filter((x) => x.track || x.looks).length, whole, own, total: whole + own };
}).sort((a, b) => b.total - a.total);
console.log('compagnon            pièces animées  ensemble  pièces   total (paquets/s par joueur qui le voit)');
for (const r of rows) console.log(r.key.padEnd(20) + String(r.parts).padStart(5) + String(r.animated).padStart(8) + r.whole.toFixed(1).padStart(10) + r.own.toFixed(1).padStart(8) + r.total.toFixed(1).padStart(8));
const mean = rows.reduce((n, r) => n + r.total, 0) / rows.length;
console.log('moyenne ' + mean.toFixed(1) + ' paquets/s, maximum ' + rows[0].total.toFixed(1) + ' (' + rows[0].key + ')');
