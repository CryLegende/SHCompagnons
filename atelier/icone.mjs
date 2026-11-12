// Texture d'une pièce d'un modèle, pour s'en servir d'icône (menu, box) : valeur base64 d'une tête de joueur.
// Usage : node icone.mjs <modèle>:<numéro de pièce>[:<face>] [...]   (lit sortie/<modèle>.txt ; pièces depuis 0)
//   → une ligne par demande : <modèle>:<n> <empreinte> <valeur base64>
// <face> (px, nx ou back) : fabrique une tête dont cette face de la pièce devient le devant (visage d'un modèle qui
// ne regarde pas vers l'avant). La nouvelle peau est à téléverser (televerse.mjs) avant de relancer la commande.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePng } from './png.mjs';
import { texture } from './modeles/_aides.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const textures = existsSync(join(HERE, 'textures.json')) ? JSON.parse(readFileSync(join(HERE, 'textures.json'), 'utf8')) : {};
const b64 = (hash) => Buffer.from('{"textures":{"SKIN":{"url":"http://textures.minecraft.net/texture/' + hash + '"}}}').toString('base64');
// Faces dans la peau : dessus, dessous, -x, devant, +x, dos
const AT = { top: [8, 0], bottom: [16, 0], nx: [0, 8], front: [8, 8], px: [16, 8], back: [24, 8] };
// Quart de tour de la tête autour de la verticale qui amène la face +x devant : d'où vient chaque face
const TURN = { front: 'px', px: 'back', back: 'nx', nx: 'front' };
const QUARTERS = { px: 1, back: 2, nx: 3 };

function turned(src, face) {
    let px = src;
    for (let q = 0; q < QUARTERS[face]; q++) {
        const out = new Uint8Array(64 * 64 * 4);
        for (const layer of [0, 32]) {
            for (const [to, from] of Object.entries(TURN)) for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
                const s = ((AT[from][1] + y) * 64 + AT[from][0] + layer + x) * 4, d = ((AT[to][1] + y) * 64 + AT[to][0] + layer + x) * 4;
                out.set(px.subarray(s, s + 4), d);
            }
            // dessus et dessous (rangés comme vus du dessus, l'avant en bas) : +x vient en bas, quart de tour horaire
            for (const name of ['top', 'bottom']) for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
                const s = ((AT[name][1] + (7 - x)) * 64 + AT[name][0] + layer + y) * 4, d = ((AT[name][1] + y) * 64 + AT[name][0] + layer + x) * 4;
                out.set(px.subarray(s, s + 4), d);
            }
        }
        px = out;
    }
    return px;
}

for (const arg of process.argv.slice(2)) {
    const [model, index, face] = arg.split(':');
    const summon = readFileSync(join(HERE, 'sortie', model + '.txt'), 'utf8').split('\n').find((l) => /^\/?summon /.test(l));
    // une entité par « id:"minecraft:..._display" » ; seules les têtes portent une texture
    const entities = summon.split(/(?=\{id:"minecraft:(?:item|block|text)_display")/).slice(1);
    const value = (/value:"([^"]+)"/.exec(entities[Number(index)] || '') || [])[1];
    if (!value) { console.log(arg + ' : pas de texture'); continue; }
    let hash = /texture\/([0-9a-f]+)/.exec(Buffer.from(value, 'base64').toString())[1];
    if (face) {
        const px = turned(await texture(hash), face);
        const sha = createHash('sha1').update(px).digest('hex').slice(0, 20);
        if (!textures[sha]) { writeFileSync(join(HERE, 'sortie', 'peaux', sha + '.png'), encodePng(64, 64, px)); console.log(arg + ' : peau ' + sha + ' à téléverser'); continue; }
        hash = textures[sha];
    }
    console.log(arg + ' ' + hash + ' ' + b64(hash));
}
