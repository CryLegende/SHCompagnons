// Ajoute une animation de repos aux modèles repris de block-display.com (dossiers importes/ et refs/), sans toucher à
// leur dessin : chaque pose est le modèle d'origine dont quelques pièces ont tourné ou bougé autour d'un pivot.
// Usage : node animer.mjs                 → écrit sortie/<nom>.txt pour chaque modèle décrit dans rigs.mjs
//         node animer.mjs --pieces <nom>  → affiche les pièces d'un modèle (numéro, centre, taille) pour écrire son rig
// rigs.mjs : { <nom>: { source: 'importes' | 'refs', groups: { g: { parts: [numéros], pivot: [x, y, z], parent } },
//                       clips: [ { loop, keys: [ { t, g: { rot: [rx, ry, rz], move: [x, y, z] } } ] } ] } }
// Pivots et déplacements en blocs, dans le repère du modèle recentré (celui des rendus, avant placement.rotation).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { qEuler, qMul, qRot } from './kit.mjs';
import RIGS from './rigs.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'sortie');
// Le plugin : le dossier parent de l'atelier
const PLUGIN = join(HERE, '..');
const CP = [PLUGIN + '/target/classes', join(homedir(), '.m2/repository/org/joml/joml/1.10.8/joml-1.10.8.jar'),
    join(homedir(), '.m2/repository/com/github/retrooper/packetevents-api/2.14.0/packetevents-api-2.14.0.jar')].join(';');
mkdirSync(OUT, { recursive: true });

// Fichier d'origine d'un modèle : rig.file quand le compagnon ne porte pas le nom du fichier importé
const sourceFile = (name) => { const file = RIGS[name]?.file || name; for (const dir of [RIGS[name]?.source, 'importes', 'refs']) { if (dir && existsSync(join(HERE, dir, file + '.txt'))) return join(HERE, dir, file + '.txt'); } throw new Error('modèle introuvable : ' + name); };
function read(files) {
    const json = join(OUT, 'sources.json');
    execFileSync('java', ['-cp', CP, join(HERE, 'Vide.java'), json, ...files], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return JSON.parse(readFileSync(json, 'utf8'));
}
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const num = (v, d = 7) => { const t = (Math.round(v * 10 ** d) / 10 ** d).toString(); return (t === '-0' ? '0' : t) + 'f'; };

// Clés d'une animation avec leurs clés intermédiaires : un mouvement d'au moins 8 ticks part et arrive en douceur
// (trois ou quatre tronçons dont l'avancée suit une courbe en S), sauf « lineaire: true » ou clé « sec: true »
const smooth = (x) => x * x * (3 - 2 * x);
function eased(rig, clip) {
    if (clip.lineaire) return clip.keys;
    const ids = [...new Set(clip.keys.flatMap((k) => Object.keys(k).filter((g) => g !== 't' && g !== 'sec')))];
    for (const id of ids) if (!rig.groups[id]) throw new Error('groupe inconnu ' + id);
    const state = (key) => Object.fromEntries(ids.map((id) => [id, { rot: [0, 0, 0], move: [0, 0, 0], ...((key && key[id]) || {}) }]));
    const stops = [{ t: 0, s: state(null) }, ...clip.keys.map((k) => ({ t: k.t, s: state(k), sec: k.sec })), { t: clip.loop, s: state(null) }];
    const out = [];
    for (let i = 0; i + 1 < stops.length; i++) {
        const a = stops[i], b = stops[i + 1], d = b.t - a.t;
        const n = b.sec || d < 8 || JSON.stringify(a.s) === JSON.stringify(b.s) ? 1 : d >= 16 ? 4 : 3;
        for (let j = 1; j < n; j++) {
            const k = smooth(j / n);
            out.push({ t: a.t + Math.round(d * j / n), ...Object.fromEntries(ids.map((id) => [id, { rot: a.s[id].rot.map((v, x) => v + (b.s[id].rot[x] - v) * k), move: a.s[id].move.map((v, x) => v + (b.s[id].move[x] - v) * k) }])) });
        }
        if (i + 2 < stops.length) out.push({ t: b.t, ...b.s });
    }
    return out;
}

const args = process.argv.slice(2);
if (args[0] === '--pieces') {
    const model = Object.values(read([sourceFile(args[1])]))[0];
    console.log(args[1] + ' : taille ' + model.size.map((v) => v.toFixed(2)).join(' x '));
    model.parts.forEach((p, i) => {
        // centre et demi-tailles approchées de la boîte (tête nue : de -0,5 à 0 en hauteur ; bloc : de 0 à 1)
        const head = p.k === 'item_display', local = head ? [0, -0.25 * p.s[1], 0] : [0.5 * p.s[0], 0.5 * p.s[1], 0.5 * p.s[2]];
        const c = add(p.t, qRot(p.l, qRot(p.r, local)));
        // bouts de la pièce le long de son grand axe : là où placer le pivot d'une queue, d'une oreille, d'un bras
        const dims = p.s.map((v) => v * (head ? 0.5 : 1)), axis = dims.indexOf(Math.max(...dims));
        const dir = qRot(p.l, qRot(p.r, [0, 1, 2].map((k) => (k === axis ? dims[axis] / 2 : 0))));
        const ends = [add(c, dir), sub(c, dir)].map((e) => e.map((v) => v.toFixed(2)).join(' '));
        console.log(String(i).padStart(2) + '  centre ' + c.map((v) => v.toFixed(2).padStart(6)).join(' ') + '   taille ' + dims.map((v) => v.toFixed(2)).join(' x ') + '   bouts [' + ends.join('] [') + ']');
    });
    process.exit(0);
}

const names = Object.keys(RIGS);
const sources = read(names.map(sourceFile));
for (const name of names) {
    const rig = RIGS[name], text = readFileSync(sourceFile(name), 'utf8'), source = sources[rig.file || name];
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const summon = lines.find((l) => /^\/?summon /.test(l));
    const offset = (summon.match(/^\/?summon \S+ (\S+) (\S+) (\S+)/) || []).slice(1).map((v) => Number(v.replace(/[~^]/, '')) || 0);
    const pattern = /transformation:\[([^\]]+)\]/g;
    const count = [...summon.matchAll(pattern)].length;
    if (count !== source.parts.length) throw new Error(name + ' : ' + count + ' transformations pour ' + source.parts.length + ' pièces');
    // repère des commandes = repère recentré + centre de la boîte - décalage de la commande
    const shift = sub(source.center, offset);
    const groupOf = (i) => Object.keys(rig.groups).find((g) => rig.groups[g].parts.includes(i) && !Object.values(rig.groups).some((o) => o.parent === g && o.parts.includes(i)));
    const animated = new Set(Object.values(rig.groups).flatMap((g) => g.parts));
    // Une pièce animée est écrite en translation, rotation, échelle (celles que le plugin tire de sa matrice) dans
    // toutes les poses, pose de base comprise : d'une pose à l'autre seules sa translation et sa rotation gauche
    // changent, et le client la fait tourner sans la déformer. Les autres pièces gardent leur texte d'origine.
    const pose = (key) => {
        let n = 0;
        return summon.replace(pattern, (original) => {
            const i = n++;
            if (!animated.has(i)) return original;
            const part = source.parts[i];
            let t = add(part.t, shift), left = part.l;
            for (let g = groupOf(i); g; g = rig.groups[g].parent) {
                const change = key[g];
                if (!change) continue;
                const pivot = add(rig.groups[g].pivot, shift), q = qEuler(change.rot || [0, 0, 0]);
                t = add(add(pivot, change.move || [0, 0, 0]), qRot(q, sub(t, pivot)));
                left = qMul(q, left);
            }
            return 'transformation:{left_rotation:[' + left.map((v) => num(v)).join(',') + '],right_rotation:[' + part.r.map((v) => num(v)).join(',') + '],translation:[' + t.map((v) => num(v, 6)).join(',') + '],scale:[' + part.s.map((v) => num(v, 6)).join(',') + ']}';
        });
    };
    const out = lines.filter((l) => l.startsWith('#'));
    out.push(pose({}));
    for (const clip of rig.clips) {
        out.push('@animation loop=' + clip.loop);
        for (const key of eased(rig, clip)) { out.push('@pose ' + key.t); out.push(pose(key)); }
    }
    writeFileSync(join(OUT, name + '.txt'), out.join('\n') + '\n');
    console.log(name + ' : ' + rig.clips.length + ' animation(s), ' + rig.clips.reduce((k, c) => k + c.keys.length, 0) + ' pose(s)');
}
