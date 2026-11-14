// Nounours : la vieille peluche qu'on a trop aimée. Rapiécée de tissus dépareillés, un œil remplacé par un bouton,
// un peu de rembourrage qui sort de l'épaule. Au clic il ouvre grand les bras pour un câlin.
import { peluche } from './_peluche.mjs';

const calin = (s) => ({ rotation: [[0, [0, 0, 0]], [0.3, [0, 0, 75 * s]], [0.7, [0, 0, 75 * s]], [0.95, [-70, 0, 20 * s]], [1.35, [-70, 0, 20 * s]], [1.6, [0, 0, 0]]] });

export default peluche({
    name: 'nounours',
    title: 'Nounours',
    palette: { f: '#bd7d42', w: '#e6bb82', n: { c: '#3a2a22' }, d: { c: '#a8763e' }, r: '#e2483f', R: { c: '#b9322d' }, u: '#6f9bd9', U: { c: '#4f78b5' }, g: '#8fc46a', G: { c: '#6aa04a' }, o: { c: '#f2c14a' }, O: { c: '#c9962a' }, x: '#fbf7ee' },
    lettres: { corps: 'f', bras: 'f', oreille: 'f', museau: 'w' },
    dessins: {
        // Pièce bleue à carreaux cousue sur le ventre
        ventre: ['ffffffff', 'ffwwwwff', 'fwwwwwwf', 'fwuUuwwf', 'fwUuUwwf', 'fwuUuwwf', 'ffwwwwff', 'ffffffff'],
        // Un œil normal, l'autre remplacé par un gros bouton doré ; pièce verte sur le front
        visage: ['fffffggf', 'fkfffgGf', 'fkfffoof', 'bbfffoOf', 'ffffffbb', 'ffffffff', 'ffffffff', 'ffffffff'],
        museau: ['wwwnnwww', 'wwwnnwww', 'wwwwwwww', 'wwdwwdww', 'wwwddwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
        coussinet: ['ffff', 'fwwf', 'fwwf', 'ffff'],
        creux: ['ffff', 'fwwf', 'fwwf', 'ffff'],
    },
    plus: {
        bones: {},
        cubes: [
            { name: 'noeud', bone: 'corps', bord: false, from: [-1.8, 5.9, -2.8], to: [1.8, 7.3, -2.0], rot: [0, 0, -8], pivot: [0, 6.6, -2.4], faces: { all: 'r', north: ['rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr'] } },
            { name: 'bourre', bone: 'corps', bord: false, from: [-3.6, 6.4, -0.6], to: [-2.4, 7.8, 0.8], rot: [0, 0, 18], pivot: [-3, 7, 0], faces: { all: 'x' } },
        ],
    },
    interact: { length: 1.6, loop: false, bones: { brasD: calin(1), brasG: calin(-1), tete: { rotation: [[0, [0, 0, 0]], [0.3, [10, 0, 0]], [0.95, [0, 0, 10]], [1.35, [0, 0, 10]], [1.6, [0, 0, 0]]] }, root: { position: [[0, [0, 0, 0]], [0.3, [0, 1, 0]], [0.5, [0, 0, 0]], [1.6, [0, 0, 0]]] } } },
});
