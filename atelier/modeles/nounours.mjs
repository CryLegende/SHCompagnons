// Nounours : peluche assise, nœud rouge, museau en relief, un bras qui salue.
import { clin } from './_aides.mjs';
import { mirrored, mirroredGroup } from '../kit.mjs';

const brasG = { pivot: [3.3, 6.6, 0.4], rot: [0, 0, 20] };
const bras = { id: 'brasG', group: 'brasG', size: [2.1, 4.4, 2.3], pos: [3.5, 4.6, 0.4], skin: { all: 'b', bottom: 'l', front: ['bbbbbbbb', 'bbbbbbbb', 'bbbbbbbb', 'bbbbbbbb', 'bbbbbbbb', 'bbbbbbbb', 'bllllllb', 'bllllllb'] } };
const jambe = { id: 'jambeG', size: [2.7, 2.6, 4.2], pos: [2.3, 1.3, 2.8], skin: { all: 'b', front: ['bbbbbbbb', 'bllllllb', 'bllllllb', 'bllDDllb', 'bllDDllb', 'bllllllb', 'bllllllb', 'bbbbbbbb'], bottom: 'D' } };
const oreille = { id: 'oreilleG', size: [2.5, 2.5, 1.3], pos: [3, 12.6, 0], skin: { all: 'b', front: ['bbbbbbbb', 'bbbbbbbb', 'bbllllbb', 'bbllllbb', 'bbllllbb', 'bbllllbb', 'bbbbbbbb', 'bbbbbbbb'] } };
const def = {
    name: 'nounours',
    title: 'Nounours',
    scale: 0.42,
    palette: { b: '#8f5d3a', D: '#6d4428', l: '#cfa06e', r: '#c8323a', R: '#9c2029', k: { c: '#1f1512', n: 0.01 }, w: { c: '#ffffff', n: 0 } },
    groups: { brasG, brasD: mirroredGroup(brasG) },
    parts: [
        { id: 'corps', size: [6.6, 6.2, 5], pos: [0, 3.5, 0], skin: { all: 'b', front: ['brrRRrrb', 'bbrRRrbb', 'bbllllbb', 'bllllllb', 'bllllllb', 'bllllllb', 'bbllllbb', 'DDDDDDDD'], bottom: 'D' } },
        { id: 'tete', size: [7.2, 6.2, 6], pos: [0, 9.5, 0.3], skin: { all: 'b', front: ['bbbbbbbb', 'bbbbbbbb', 'bkwbbkwb', 'bkkbbkkb', 'bbbbbbbb', 'bbbbbbbb', 'bbbbbbbb', 'bbbbbbbb'], bottom: 'D' } },
        { id: 'museau', size: [3.2, 2.4, 1.4], pos: [0, 8.2, 3.7], skin: { all: 'l', front: ['llkkkkll', 'llkkkkll', 'lllkklll', 'lllkklll', 'lkllllkl', 'llkkkkll', 'llllllll', 'llllllll'] } },
        oreille, mirrored(oreille, 'oreilleD'),
        bras, mirrored(bras, 'brasD'),
        jambe, mirrored(jambe, 'jambeD'),
    ],
    clips: [
        { loop: 70, keys: [{ t: 30 }, { t: 36, groups: { brasG: { rot: [0, 0, 150] } } }, { t: 40, groups: { brasG: { rot: [0, 0, 118] } } }, { t: 44, groups: { brasG: { rot: [0, 0, 150] } } }, { t: 48, groups: { brasG: { rot: [0, 0, 118] } } }, { t: 52, groups: { brasG: { rot: [0, 0, 150] } } }, { t: 60 }] },
    ],
    frames: [0, 33, 36, 40, 44, 56],
};
def.clips.push(clin(def, 'tete', { 2: 'bbbbbbbb' }, 89));
export default def;
