// Cochon : trapu, groin en relief qui renifle, oreilles tombantes qui battent, queue en tire-bouchon.
import { clin } from './_aides.mjs';
import { mirrored, mirroredGroup } from '../kit.mjs';

const oreilleG = { pivot: [2.4, 9.8, 4.6], rot: [0, 0, -24] };
const oreille = { id: 'oreilleG', group: 'oreilleG', size: [2, 2.3, 1], pos: [3.2, 9, 4.6], skin: { all: 'P', front: ['pppppppp', 'pppppppp', 'pPPPPPPp', 'pPPPPPPp', 'pPPPPPPp', 'pPPPPPPp', 'ppPPPPpp', 'pppppppp'] } };
const patteAv = { id: 'patteAvG', size: [2.3, 2.6, 2.3], pos: [2.2, 1.3, 1.6], skin: { all: 'p', sides: ['pppppppp', 'pppppppp', 'pppppppp', 'pppppppp', 'pppppppp', 'PPPPPPPP', 'hhhhhhhh', 'hhhhhhhh'], front: ['pppppppp', 'pppppppp', 'pppppppp', 'pppppppp', 'pppppppp', 'PPPPPPPP', 'hhhhhhhh', 'hhhhhhhh'], back: ['pppppppp', 'pppppppp', 'pppppppp', 'pppppppp', 'pppppppp', 'PPPPPPPP', 'hhhhhhhh', 'hhhhhhhh'], bottom: 'h' } };
const patteAr = { ...patteAv, id: 'patteArG', pos: [2.2, 1.3, -4.6] };
const def = {
    name: 'cochon',
    title: 'Cochon',
    scale: 0.46,
    palette: { p: '#f2a9a6', P: '#e58f8d', s: '#f8c1bd', n: { c: '#b26265', n: 0.02 }, h: '#c97f80', k: { c: '#1d1617', n: 0.01 }, w: { c: '#ffffff', n: 0 } },
    groups: { oreilleG, oreilleD: mirroredGroup(oreilleG) },
    parts: [
        { id: 'corps', size: [7.2, 6, 9], pos: [0, 5.2, -1.6], skin: { all: 'p', sides: ['pppppppp', 'pppppppp', 'ppPppppp', 'pppppPpp', 'pppppppp', 'pPpppppp', 'ppppPppp', 'PPPPPPPP'], bottom: 'P' } },
        { id: 'tete', size: [6.8, 6.4, 5.6], pos: [0, 6.8, 5.2], skin: { all: 'p', front: ['pppppppp', 'pppppppp', 'wkppppkw', 'wkppppkw', 'pppppppp', 'pppppppp', 'pppppppp', 'PPPPPPPP'], bottom: 'P' } },
        { id: 'groin', size: [3.8, 2.7, 1.3], pos: [0, 5.8, 8.4], skin: { all: 's', front: ['ssssssss', 'ssssssss', 'snnssnns', 'snnssnns', 'snnssnns', 'ssssssss', 'ssssssss', 'PPPPPPPP'] } },
        oreille, mirrored(oreille, 'oreilleD'),
        patteAv, mirrored(patteAv, 'patteAvD'), patteAr, mirrored(patteAr, 'patteArD'),
        { id: 'queue', size: [1, 1.9, 1], pos: [0, 7.2, -6.4], rot: [35, 0, 0], skin: { all: 'P' } },
    ],
    clips: [
        { loop: 24, keys: [{ t: 4, parts: { groin: { pos: [0, 6.2, 8.4] } } }, { t: 8 }, { t: 12, parts: { groin: { pos: [0, 6.2, 8.4] } } }, { t: 16 }] },
        { loop: 64, keys: [{ t: 48 }, { t: 51, groups: { oreilleG: { rot: [0, 0, 18] }, oreilleD: { rot: [0, 0, -18] } } }, { t: 55 }, { t: 58, groups: { oreilleG: { rot: [0, 0, 18] }, oreilleD: { rot: [0, 0, -18] } } }, { t: 62 }] },
        { loop: 16, keys: [{ t: 4, parts: { queue: { rot: [35, 0, 28] } } }, { t: 12, parts: { queue: { rot: [35, 0, -28] } } }] },
    ],
    frames: [0, 4, 8, 51, 55, 58],
};
def.clips.push(clin(def, 'tete', { 2: 'pppppppp', 3: 'kkppppkk' }, 101));
export default def;
