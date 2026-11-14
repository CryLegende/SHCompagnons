// Cadeau du Père Noël : boîte rouge au ruban doré, gros nœud sur le couvercle. Au clic le couvercle s'ouvre et une étoile en sort.
import { COMMUN, IDLE, WALK, mix, balance, tient, regarde, tic, paire } from './_style.mjs';

const ruban = Array(8).fill('rrryyrrr');
const N = paire('boucle', { parent: 'couvercle', pivot: [0.4, 8.7, 0] }, { from: [0.3, 8.6, -0.8], to: [2.7, 10.3, 0.8], rot: [0, 0, -24], pivot: [0.4, 8.7, 0], faces: { all: 'y', north: ['yyyy', 'yYYy', 'yYYy', 'yyyy'] } });

export default {
    name: 'cadeau',
    title: 'Cadeau du Père Noël',
    palette: { ...COMMUN, r: '#dd443d', D: '#c3352f', y: '#ffd24a', Y: '#e3a92a', b: '#f59a8c' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1, 0] }, couvercle: { parent: 'corps', pivot: [0, 7, 3.6] }, etoile: { parent: 'root', pivot: [0, 4.5, 0] }, ...N.bones },
    cubes: [
        { name: 'boite', bone: 'corps', from: [-3.4, 1, -3.4], to: [3.4, 7, 3.4], faces: { all: ruban, north: ['rrryyrrr', 'rkryyrkr', 'rkryyrkr', 'bbryyrbb', 'rrryyrrr', 'rrryyrrr', 'rrryyrrr', 'rrryyrrr'], down: 'D' } },
        { name: 'couvercle', bone: 'couvercle', from: [-3.8, 7, -3.8], to: [3.8, 8.6, 3.8], faces: { all: ['DDDyyDDD', 'DDDyyDDD'], up: ['DDDyyDDD', 'DDDyyDDD', 'DDDyyDDD', 'yyyyyyyy', 'yyyyyyyy', 'DDDyyDDD', 'DDDyyDDD', 'DDDyyDDD'] } },
        ...N.cubes,
        { name: 'noeud', bone: 'couvercle', from: [-0.7, 8.6, -0.7], to: [0.7, 9.9, 0.7], faces: { all: 'Y' } },
        { name: 'etoile', bone: 'etoile', item: 'nether_star', from: [-2, 2.5, -0.1], to: [2, 6.5, 0.1], faces: { all: 'y' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde('corps', IDLE, 9, 3), balance('boucleD', [0, 0, 7], IDLE, { tours: 3 }), balance('boucleG', [0, 0, 7], IDLE, { tours: 3 }), tic('couvercle', [9, 0, 0], 2.7)) },
        walk: { length: WALK, bones: mix(tient('corps', [-7, 0, 0]), balance('boucleD', [0, 0, 12], WALK), balance('boucleG', [0, 0, 12], WALK), balance('couvercle', [4, 0, 0], WALK)) },
        interact: {
            length: 1.9, loop: false,
            bones: {
                couvercle: { rotation: [[0, [0, 0, 0]], [0.25, [72, 0, 0]], [1.45, [72, 0, 0]], [1.7, [0, 0, 0]]] },
                etoile: { position: [[0.15, [0, 0, 0]], [0.5, [0, 8.4, 0]], [0.8, [0, 7.8, 0]], [1.1, [0, 8.4, 0]], [1.4, [0, 0, 0]]], rotation: [[0.5, [0, 0, 0]], [1.1, [0, 360, 0]]] },
            },
        },
    },
};
