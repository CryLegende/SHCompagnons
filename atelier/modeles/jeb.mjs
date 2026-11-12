// Jeb le mouton : boule de laine à grosse tête, toison qui passe par les treize couleurs des têtes de départ,
// oreilles qui frémissent et tête qui se penche.
import { mirrored, mirroredGroup } from '../kit.mjs';
import { average, clin, texture } from './_aides.mjs';
import { TETES } from './_tetes.mjs';

// Laine bouclée : mèches claires et creux sombres, sur toutes les faces
const BOUCLES = ['ll..d.ll', 'l..ll..d', '.d.ll...', '.....d.l', 'll.d..ll', 'l....ll.', '..d..l..', 'd..l...d'];
function laine(color) {
    const px = new Uint8Array(64 * 64 * 4);
    for (const [ox, oy, shade] of [[8, 0, 1.04], [16, 0, 0.84], [0, 8, 1], [8, 8, 1], [16, 8, 1], [24, 8, 1]]) {
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
            const c = BOUCLES[(y + ox) % 8][(x + oy) % 8];
            const k = shade * (c === 'l' ? 1.12 : c === 'd' ? 0.84 : 1) * (shade === 1 ? 1.05 - 0.1 * y / 7 : 1);
            const i = ((oy + y) * 64 + ox + x) * 4;
            for (let n = 0; n < 3; n++) px[i + n] = Math.max(0, Math.min(255, Math.round(color[n] * k)));
            px[i + 3] = 255;
        }
    }
    return { pixels: px };
}
// Couleur de la laine de chaque texture de départ : moyenne du dessus de la tête
const laines = [];
for (const tete of TETES.Jeb) laines.push({ skin: laine(average(await texture(tete.h), 8, 0, 8, 8)), t: tete.t });

const LAINE = ['corps', 'toupet', 'queue'];
const couleurs = { loop: 0, keys: [] };
for (const [i, l] of laines.entries()) {
    if (i > 0) couleurs.keys.push({ t: couleurs.loop, parts: Object.fromEntries(LAINE.map((id) => [id, { skin: l.skin }])) });
    couleurs.loop += l.t;
}
const oreilleG = { pivot: [3, 9.6, 3.6], rot: [0, 0, -18], parent: 'tete' };
const oreille = { id: 'oreilleG', group: 'oreilleG', size: [2, 1.3, 1.5], pos: [4, 9.6, 3.6], skin: { all: 's', front: ['ssssssss', 'sppppppp', 'sppppppp', 'sppppppp', 'sppppppp', 'sppppppp', 'ssssssss', 'SSSSSSSS'], bottom: 'S' } };
const patte = { id: 'patteAvG', size: [1.9, 2.6, 1.9], pos: [2.2, 1.3, 1.6], skin: { all: 's', sides: ['ssssssss', 'ssssssss', 'ssssssss', 'ssssssss', 'SSSSSSSS', 'hhhhhhhh', 'hhhhhhhh', 'HHHHHHHH'], front: ['ssssssss', 'ssssssss', 'ssssssss', 'ssssssss', 'SSSSSSSS', 'hhhhhhhh', 'hhhhhhhh', 'HHHHHHHH'], back: ['ssssssss', 'ssssssss', 'ssssssss', 'ssssssss', 'SSSSSSSS', 'hhhhhhhh', 'hhhhhhhh', 'HHHHHHHH'], bottom: 'H', seed: 'patte' } };
const arriere = { ...patte, id: 'patteArG', pos: [2.2, 1.3, -3.4] };
const pencher = (t, a, e) => ({ t, groups: { tete: { rot: [0, 0, a] }, oreilleG: { rot: [0, 0, -18 + e] }, oreilleD: { rot: [0, 0, 18 - e] } } });
const def = {
    name: 'jeb',
    title: 'Jeb le mouton',
    scale: 0.42,
    palette: { s: '#e2c4a8', S: '#c9a98c', p: '#eaa7a6', h: '#5d4a3f', H: '#46362e', k: { c: '#1c1614', n: 0 }, e: { c: '#ffffff', n: 0 }, n: '#e58f93' },
    groups: { tete: { pivot: [0, 6.4, 3.4] }, oreilleG, oreilleD: mirroredGroup(oreilleG) },
    parts: [
        { id: 'corps', size: [7.6, 6.4, 8.2], pos: [0, 5.4, -1.4], skin: laines[0].skin },
        { id: 'tete', group: 'tete', size: [6, 5.6, 5], pos: [0, 8.4, 4], skin: { all: 's', front: ['ssssssss', 'ssssssss', 'skesskes', 'skksskks', 'ssssssss', 'sssnnsss', 'ssSnnSss', 'SSSSSSSS'], bottom: 'S' } },
        { id: 'toupet', group: 'tete', size: [6.8, 3.2, 5.4], pos: [0, 10.9, 3.6], skin: laines[0].skin },
        oreille, mirrored(oreille, 'oreilleD'),
        { id: 'queue', size: [2.4, 2.4, 2], pos: [0, 6.6, -6.2], skin: laines[0].skin },
        patte, mirrored(patte, 'patteAvD'), arriere, mirrored(arriere, 'patteArD'),
    ],
    clips: [
        couleurs,
        { loop: 100, keys: [pencher(60, 0, 0), pencher(66, 12, -22), pencher(72, 12, 6), pencher(76, 12, -22), pencher(82, 12, 0), pencher(90, 0, 0)] },
    ],
    frames: [0, 20, 40, 66, 72, 76, 140, 160],
};
def.clips.push(clin(def, 'tete', { 2: 'ssssssss' }, 91));
export default def;
