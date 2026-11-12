// Panda : assis, une tige de bambou dans les pattes, qu'il porte à la bouche en hochant la tête.
import { clin } from './_aides.mjs';
import { mirrored } from '../kit.mjs';

const bras = { id: 'brasG', group: 'manger', size: [2.5, 4.8, 2.6], pos: [3.5, 6.3, 2.6], rot: [-58, 0, 0], skin: { all: 'n', bottom: 'N' } };
const jambe = { id: 'jambeG', size: [3, 3, 4.6], pos: [2.7, 1.5, 3], skin: { all: 'n', front: ['nnnnnnnn', 'nggggggn', 'nggggggn', 'nggNNggn', 'nggNNggn', 'nggggggn', 'nggggggn', 'nnnnnnnn'], bottom: 'N' } };
const oreille = { id: 'oreilleG', group: 'tete', size: [2.5, 2.3, 1.5], pos: [3.1, 14.5, 0], skin: { all: 'n', front: ['nnnnnnnn', 'nnnnnnnn', 'nnggggnn', 'nnggggnn', 'nnggggnn', 'nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn'] } };
const def = {
    name: 'panda',
    title: 'Panda',
    scale: 0.36,
    palette: { w: '#f3f3ee', W: '#dcdcd4', n: '#2c2c2e', N: '#1c1c1e', g: '#4a4a4e', k: { c: '#101012', n: 0 }, e: { c: '#ffffff', n: 0 }, v: '#77b23a', V: '#5a8f2a', f: '#9bd04f', p: '#f0b4b8' },
    groups: { manger: { pivot: [0, 7, 1] }, tete: { pivot: [0, 8, 0] } },
    parts: [
        { id: 'corps', size: [8.2, 7.4, 6.6], pos: [0, 4.3, 0], skin: { all: 'w', front: ['nnnnnnnn', 'nnnnnnnn', 'wnnnnnnw', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'WWWWWWWW'], back: ['nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'WWWWWWWW'], sides: ['nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'WWWWWWWW'], top: 'n', bottom: 'W' } },
        { id: 'tete', group: 'tete', size: [8.2, 6.8, 6.8], pos: [0, 11, 0.5], skin: { all: 'w', front: ['wwwwwwww', 'wwwwwwww', 'wnnwwnnw', 'wnewwenw', 'wnnwwnnw', 'pwwkkwwp', 'wwwwwwww', 'WWWWWWWW'], bottom: 'W' } },
        oreille, mirrored(oreille, 'oreilleD'),
        bras, mirrored(bras, 'brasD'),
        jambe, mirrored(jambe, 'jambeD'),
        { id: 'bambou', group: 'manger', size: [1.2, 9.4, 1.2], pos: [0.2, 7.4, 5], rot: [0, 0, 52], skin: { all: 'v', sides: ['vvvvvvvv', 'vvvvvvvv', 'VVVVVVVV', 'vvvvvvvv', 'vvvvvvvv', 'VVVVVVVV', 'vvvvvvvv', 'vvvvvvvv'], top: 'f', bottom: 'V' } },
    ],
    clips: [
        { loop: 44, keys: [{ t: 5, groups: { manger: { move: [0, 1, 0] }, tete: { rot: [8, 0, 0] } } }, { t: 10 }, { t: 15, groups: { manger: { move: [0, 1, 0] }, tete: { rot: [8, 0, 0] } } }, { t: 20 }] },
    ],
    frames: [0, 5, 10, 15, 20],
};
def.clips.push(clin(def, 'tete', { 3: 'wnnwwnnw' }, 107));
export default def;
