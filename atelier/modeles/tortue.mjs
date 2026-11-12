// Tortue de mer : carapace à écailles, tête qui dépasse, nageoires qui rament.
import { clin } from './_aides.mjs';
import { mirrored, mirroredGroup } from '../kit.mjs';

const avantG = { pivot: [3.4, 2.4, 3], rot: [0, -22, 8] };
const avant = { id: 'avantG', group: 'avantG', size: [5.4, 0.9, 2.8], pos: [6, 2.4, 3], skin: { all: 's', top: ['ssssssss', 'sSsssSss', 'ssssssss', 'sssSssss', 'ssssssSs', 'sSssssss', 'ssssSsss', 'SSSSSSSS'], bottom: 'S' } };
const arriereG = { pivot: [2.8, 2, -4.4], rot: [0, 28, 0] };
const arriere = { id: 'arriereG', group: 'arriereG', size: [3, 0.8, 2.3], pos: [4.2, 2, -4.6], skin: { all: 's', bottom: 'S' } };
const nage = (t, a, z, r, cou = 0) => ({ t, parts: { tete: { pos: [0, 3.5 + cou * 0.3, 6 + cou] } }, groups: { avantG: { rot: [0, a, z] }, avantD: { rot: [0, -a, -z] }, arriereG: { rot: [0, r, 0] }, arriereD: { rot: [0, -r, 0] } } });
const def = {
    name: 'tortue',
    title: 'Tortue',
    scale: 0.4,
    palette: { g: '#4f9b3d', G: '#3b7b2e', l: '#7fc65c', s: '#8fd06c', S: '#6fb04f', y: '#e6dc8e', Y: '#cfc272', k: { c: '#16201a', n: 0.01 }, e: { c: '#ffffff', n: 0 } },
    groups: { avantG, avantD: mirroredGroup(avantG), arriereG, arriereD: mirroredGroup(arriereG) },
    parts: [
        { id: 'carapace', size: [8.4, 3.6, 9.4], pos: [0, 3.6, -0.6], skin: { all: 'g', top: ['GGGGGGGG', 'GllGGllG', 'GllGGllG', 'GGGllGGG', 'GGGllGGG', 'GllGGllG', 'GllGGllG', 'GGGGGGGG'], sides: ['gGggGggG', 'gggggggg', 'GgggGggg', 'gggggggg', 'ggGgggGg', 'GGGGGGGG', 'GGGGGGGG', 'GGGGGGGG'], bottom: 'G' } },
        { id: 'ventre', size: [7.2, 1.3, 8.2], pos: [0, 1.6, -0.6], skin: { all: 'y', bottom: 'Y', sides: 'Y' } },
        { id: 'tete', size: [4.2, 3.8, 4.2], pos: [0, 3.5, 6], skin: { all: 's', front: ['ssssssss', 'ssssssss', 'skesskes', 'skksskks', 'ssssssss', 'sSssssSs', 'ssSSSSss', 'SSSSSSSS'], top: ['sSsssSss', 'ssssssss', 'ssSsssss', 'ssssssSs', 'ssssssss', 'sSssSsss', 'ssssssss', 'ssssssss'], bottom: 'S' } },
        avant, mirrored(avant, 'avantD'),
        arriere, mirrored(arriere, 'arriereD'),
        { id: 'queue', size: [1.3, 1, 2], pos: [0, 2.2, -5.9], skin: { all: 'S' } },
    ],
    clips: [
        { loop: 44, keys: [nage(11, 24, 22, 10, 0.9), nage(22, -22, 8, 28, 0.5), nage(33, -48, -12, 44)] },
    ],
    frames: [0, 11, 22, 33],
};
def.clips.push(clin(def, 'tete', { 2: 'ssssssss' }, 113));
export default def;
