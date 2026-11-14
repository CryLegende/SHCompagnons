// Nounours : peluche brune assise, ventre et museau clairs, nœud papillon rouge. Au clic il ouvre grand les bras pour un câlin.
import { visage } from './_style.mjs';
import { peluche } from './_peluche.mjs';

const calin = (s) => ({ rotation: [[0, [0, 0, 0]], [0.3, [0, 0, 75 * s]], [0.7, [0, 0, 75 * s]], [0.95, [-70, 0, 20 * s]], [1.35, [-70, 0, 20 * s]], [1.6, [0, 0, 0]]] });

export default peluche({
    name: 'nounours',
    title: 'Nounours',
    palette: { f: '#bd7d42', w: '#e6bb82', n: { c: '#3a2a22' }, d: { c: '#a8763e' }, r: '#e2483f', R: '#b9322d' },
    lettres: { corps: 'f', bras: 'f', oreille: 'f', museau: 'w' },
    dessins: {
        ventre: ['ffffffff', 'ffwwwwff', 'fwwwwwwf', 'fwwwwwwf', 'fwwwwwwf', 'fwwwwwwf', 'ffwwwwff', 'ffffffff'],
        visage: visage('f'),
        museau: ['wwwnnwww', 'wwwnnwww', 'wwwwwwww', 'wwdwwdww', 'wwwddwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
        coussinet: ['ffff', 'fwwf', 'fwwf', 'ffff'],
        creux: ['ffff', 'fwwf', 'fwwf', 'ffff'],
    },
    plus: { bones: {}, cubes: [{ name: 'noeud', bone: 'corps', bord: false, from: [-1.8, 5.9, -2.8], to: [1.8, 7.3, -2.0], faces: { all: 'r', north: ['rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr'] } }] },
    interact: { length: 1.6, loop: false, bones: { brasD: calin(1), brasG: calin(-1), tete: { rotation: [[0, [0, 0, 0]], [0.3, [10, 0, 0]], [0.95, [0, 0, 10]], [1.35, [0, 0, 10]], [1.6, [0, 0, 0]]] }, root: { position: [[0, [0, 0, 0]], [0.3, [0, 1, 0]], [0.5, [0, 0, 0]], [1.6, [0, 0, 0]]] } } },
});
