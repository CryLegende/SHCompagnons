// Villageois : fermier au chapeau de paille, vrai nez, bras croisés ; il secoue la tête en faisant « hmm ».
import { clin } from './_aides.mjs';
import { mirrored } from '../kit.mjs';

const epaule = { id: 'epauleG', size: [1.9, 3.6, 2.6], pos: [3.5, 5.9, 0.4], skin: { all: 'r', bottom: 'R', seed: 'epaule' } };
const non = (t, a) => ({ t, groups: { tete: { rot: [0, a, 0] } } });
const def = {
    name: 'villageois',
    title: 'Villageois',
    scale: 0.38,
    palette: { v: '#bd8b72', V: '#a37259', u: { c: '#3b2a20', n: 0.03 }, w: { c: '#ffffff', n: 0 }, g: { c: '#2f8f3f', n: 0.02 }, m: '#8a5f4c', n: '#a67862', N: '#8d624e', r: '#6a4a34', R: '#553a28', b: '#8a6444', s: '#4a3a30', p: '#e3c35a', P: '#c9a640', q: '#f0d77a' },
    groups: { tete: { pivot: [0, 7.6, 0] } },
    parts: [
        { id: 'tete', group: 'tete', size: [7.4, 8, 7.4], pos: [0, 11.6, 0], skin: { all: 'v', front: ['vvvvvvvv', 'vvvvvvvv', 'vuuuuuuv', 'vwgvvgwv', 'vvvvvvvv', 'vvvvvvvv', 'vvmmmmvv', 'VVVVVVVV'], bottom: 'V' } },
        { id: 'nez', group: 'tete', size: [1.9, 3.6, 1.8], pos: [0, 9.9, 4.5], skin: { all: 'n', bottom: 'N', sides: ['nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn', 'NNNNNNNN', 'NNNNNNNN'] } },
        { id: 'bord', group: 'tete', size: [10.4, 0.9, 10.4], pos: [0, 15.4, 0], skin: { all: 'p', top: ['pPpPpPpP', 'PpqpqpqP', 'pqpPpPpp', 'PpPpqpqP', 'pqpqpPpp', 'PpPpPpqP', 'pqpqpqpp', 'PpPpPpPp'], bottom: 'P' } },
        { id: 'calotte', group: 'tete', size: [6.6, 2, 6.6], pos: [0, 16.8, 0], skin: { all: 'p', sides: ['pqpPpqpP', 'PpPpqpPp', 'pqpPpPpq', 'PpqpPpPp', 'pPpPpqpP', 'uuuuuuuu', 'uuuuuuuu', 'pPpqpPpP'], top: ['pPpPpPpP', 'PpqpqpqP', 'pqpPpPpp', 'PpPpqpqP', 'pqpqpPpp', 'PpPpPpqP', 'pqpqpqpp', 'PpPpPpPp'] } },
        { id: 'robe', size: [5.4, 6.6, 3.8], pos: [0, 4.5, 0], skin: { all: 'r', front: ['rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'RRRRRRRR'], bottom: 's' } },
        { id: 'bras', size: [7.2, 2.3, 2.5], pos: [0, 5.4, 2.4], skin: { all: 'r', front: ['rrrrrrrr', 'rrrrrrrr', 'rrbbbbrr', 'rrvvvvrr', 'rrvvvvrr', 'rrbbbbrr', 'rrrrrrrr', 'RRRRRRRR'], top: ['rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr', 'rrbbbbrr', 'rrbbbbrr', 'rrbbbbrr', 'rrbbbbrr'], bottom: 'R' } },
        epaule, mirrored(epaule, 'epauleD'),
        { id: 'pieds', size: [4.6, 1.2, 3.4], pos: [0, 0.6, 0.2], skin: { all: 's' } },
    ],
    clips: [
        { loop: 90, keys: [non(50, 0), non(54, 20), non(60, -20), non(66, 20), non(72, -20), non(77, 0)] },
    ],
    frames: [0, 54, 57, 60, 66, 72],
};
def.clips.push(clin(def, 'tete', { 3: 'vVVvvVVv' }, 119));
export default def;
