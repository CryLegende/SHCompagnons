// Bonhomme de neige : bonnet rouge à pompon, écharpe, nez en carotte, bras en brindilles qui saluent.
import { mirrored, mirroredGroup } from '../kit.mjs';

const brasG = { pivot: [3.6, 4.8, 0], rot: [0, 0, 24] };
const bras = { id: 'brasG', group: 'brasG', size: [5, 0.8, 0.8], pos: [6, 4.8, 0], skin: { all: 'b', seed: 'brindille' } };
const saluer = (t, a, r) => ({ t, groups: { brasG: { rot: [0, 0, a] }, brasD: { rot: [0, 0, -a] }, tete: { rot: [0, 0, r] } } });
export default {
    name: 'bonhomme_de_neige',
    title: 'Bonhomme de neige',
    scale: 0.4,
    palette: { w: '#f5f8fb', W: '#dde5ee', k: { c: '#26262b', n: 0.02 }, o: '#f18c26', O: '#cc6c16', r: '#cb343c', R: '#9f222b', p: '#ffffff', b: '#6d4b30' },
    groups: { brasG, brasD: mirroredGroup(brasG), tete: { pivot: [0, 6.4, 0] } },
    parts: [
        { id: 'corps', size: [8, 6.6, 8], pos: [0, 3.3, 0], skin: { all: 'w', front: ['wwwwwwww', 'wwwwwwww', 'wwwkkwww', 'wwwwwwww', 'wwwkkwww', 'wwwwwwww', 'wwwwwwww', 'WWWWWWWW'], bottom: 'W' } },
        { id: 'tete', group: 'tete', size: [6.2, 5.6, 6.2], pos: [0, 9.2, 0.2], skin: { all: 'w', front: ['wwwwwwww', 'wwwwwwww', 'wkkwwkkw', 'wkkwwkkw', 'wwwwwwww', 'wkwwwwkw', 'wwkkkkww', 'WWWWWWWW'], bottom: 'W' } },
        { id: 'nez', group: 'tete', size: [1.3, 1.3, 2.8], pos: [0, 8.9, 4.5], skin: { all: 'o', front: 'O', bottom: 'O' } },
        { id: 'bonnet', group: 'tete', size: [6.7, 2.5, 6.7], pos: [0, 12.6, 0.2], skin: { all: 'r', sides: ['rrrrrrrr', 'rRrrrRrr', 'rrrrrrrr', 'rrrRrrrr', 'pppppppp', 'pppppppp', 'pppppppp', 'pppppppp'], front: ['rrrrrrrr', 'rrRrrrrr', 'rrrrrRrr', 'rrrrrrrr', 'pppppppp', 'pppppppp', 'pppppppp', 'pppppppp'], back: ['rrrrrrrr', 'rrrrrrRr', 'rRrrrrrr', 'rrrrrrrr', 'pppppppp', 'pppppppp', 'pppppppp', 'pppppppp'], bottom: 'p' } },
        { id: 'bonnetHaut', group: 'tete', size: [4.4, 1.9, 4.4], pos: [0, 14.6, 0.2], skin: { all: 'r', top: 'R' } },
        { id: 'pompon', group: 'tete', size: [1.9, 1.9, 1.9], pos: [0, 16.2, 0.2], skin: { all: 'p' } },
        { id: 'echarpe', size: [7.4, 1.6, 7.9], pos: [0, 7.2, 0.25], skin: { all: 'r', sides: ['rrRRrrRR', 'rrRRrrRR', 'rrRRrrRR', 'rrRRrrRR', 'rrRRrrRR', 'rrRRrrRR', 'rrRRrrRR', 'rrRRrrRR'], top: 'r', bottom: 'R' } },
        { id: 'pan', size: [1.8, 3.4, 0.9], pos: [1.9, 5.5, 4.4], rot: [0, 0, -6], skin: { all: 'r', front: ['rrrrrrrr', 'RRRRRRRR', 'rrrrrrrr', 'RRRRRRRR', 'rrrrrrrr', 'RRRRRRRR', 'rrrrrrrr', 'pRpRpRpR'] } },
        bras, mirrored(bras, 'brasD'),
    ],
    clips: [
        { loop: 40, keys: [saluer(10, 52, 6), saluer(30, 8, -6)] },
    ],
    frames: [0, 10, 20, 30],
};
