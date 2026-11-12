// Bébé Yoda : dans son berceau flottant, grandes oreilles qui frémissent.
import { clin } from './_aides.mjs';
import { mirrored, mirroredGroup } from '../kit.mjs';

const oreilleG = { pivot: [2.7, 8.8, 0.8], rot: [0, 0, -12] };
const oreille = { id: 'oreilleG', group: 'oreilleG', size: [4.2, 1.7, 1], pos: [4.7, 8.8, 0.8], skin: { all: 'g', front: ['gggggggg', 'gggggggg', 'gppppggg', 'gpppppgg', 'gppppppg', 'gggppppg', 'gggggggg', 'GGGGGGGG'], bottom: 'G' } };
const battre = (t, a) => ({ t, groups: { oreilleG: { rot: [0, 0, a] }, oreilleD: { rot: [0, 0, -a] } } });
const def = {
    name: 'bebe_yoda',
    title: 'Bébé Yoda',
    scale: 0.48,
    palette: { g: '#93c06c', G: '#74a052', p: '#dba1a6', k: { c: '#17130f', n: 0 }, e: { c: '#ffffff', n: 0 }, t: '#b89c70', T: '#93794f', c: '#dfe2e6', C: '#b7bcc4', i: '#3c3f47', I: '#2c2e35', m: '#8d939c' },
    groups: { oreilleG, oreilleD: mirroredGroup(oreilleG), tete: { pivot: [0, 6.2, 0.8] } },
    parts: [
        { id: 'berceau', size: [9.4, 3.8, 8.4], pos: [0, 1.9, 0], skin: { all: 'c', sides: ['mmmmmmmm', 'cccccccc', 'cccccccc', 'CCCCCCCC', 'cccccccc', 'cccccccc', 'CCCCCCCC', 'CCCCCCCC'], top: ['mmmmmmmm', 'miiiiiim', 'miIiiIim', 'miiiiiim', 'miiiiiim', 'miIiiiim', 'miiiiiim', 'mmmmmmmm'], bottom: 'C' } },
        { id: 'capot', size: [9.4, 5.2, 2.3], pos: [0, 6.3, -3], skin: { all: 'c', front: ['mmmmmmmm', 'miiiiiim', 'miiiiiim', 'miIiiiim', 'miiiiIim', 'miiiiiim', 'miiiiiim', 'miiiiiim'], sides: ['mccccccc', 'cccccccc', 'cccccccc', 'CCCCCCCC', 'cccccccc', 'cccccccc', 'cccccccc', 'cccccccc'], top: 'm' } },
        { id: 'robe', size: [5.2, 3.6, 4.2], pos: [0, 4.6, 0.7], skin: { all: 't', front: ['ttTTTTtt', 'tttTTttt', 'tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'TTTTTTTT'], bottom: 'T' } },
        { id: 'tete', group: 'tete', size: [5.8, 4.6, 5], pos: [0, 8.5, 0.9], skin: { all: 'g', front: ['gggggggg', 'gggggggg', 'gekggekg', 'gkkggkkg', 'gkkggkkg', 'gggGGggg', 'gggggggg', 'GGGGGGGG'], top: ['gggggggg', 'ggGggggg', 'gggggGgg', 'gggggggg', 'gGgggggg', 'ggggGggg', 'gggggggg', 'gggggggg'], bottom: 'G' } },
        oreille, mirrored(oreille, 'oreilleD'),
    ],
    clips: [
        { loop: 110, keys: [battre(80, -12), battre(84, 8), battre(89, -24), battre(94, 4), battre(100, -12)] },
    ],
    frames: [0, 84, 89, 94],
};
def.clips.push(clin(def, 'tete', { 2: 'gggggggg', 3: 'gggggggg' }, 79));
export default def;
