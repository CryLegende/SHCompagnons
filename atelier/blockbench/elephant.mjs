// Éléphant : gris bleuté, grandes oreilles à l'intérieur rose, trompe en deux segments, petites défenses.
// Au clic il lève la trompe et barrit, oreilles écartées.
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, respire, regarde, pendouille, pedale, paire, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 2.2, zAv: -0.7, zAr: 4.1, size: [2.4, 3.2, 2.4], faces: { all: ['ff', 'ff', 'ff', 'ww'], down: 'F' } });
const O = paire('oreille', { parent: 'tete', pivot: [3.5, 9, -5.2] }, { from: [3.5, 6.4, -5.4], to: [4.3, 11.8, -1.2], rot: [0, 28, 0], pivot: [3.5, 9, -5.2], faces: { all: 'f', west: ['ffff', 'fppf', 'fppf', 'ffff'] } });
const D = paire('defense', { parent: 'tete', pivot: [1.9, 5, -8.2] }, { from: [1.5, 4.5, -9.7], to: [2.3, 5.3, -8.1], faces: { all: 'w' } });

export default {
    name: 'elephant',
    title: 'Éléphant',
    palette: { ...COMMUN, f: '#aab9cc', F: '#8c9db3', p: '#eaa9b6', w: '#fff6e2' },
    bones: { ...squelette([0, 3.2, 1.7], [0, 7.5, -2], [0, 3, 1.7]), trompe: { parent: 'tete', pivot: [0, 7.6, -8.6] }, trompe2: { parent: 'trompe', pivot: [0, 4, -9] }, ...O.bones, ...D.bones, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-3.5, 3, -2], to: [3.5, 9, 5.5], faces: { all: 'f' } },
        { name: 'tete', bone: 'tete', from: [-3.5, 5.6, -8.4], to: [3.5, 12, -1.6], faces: { all: 'f', north: visage('f', { ligne: 2 }) } },
        ...O.cubes,
        { name: 'trompe', bone: 'trompe', from: [-1.1, 3.8, -9.8], to: [1.1, 7.8, -8.2], faces: { all: 'f', north: ['ffff', 'FFFF', 'ffff', 'FFFF'] } },
        { name: 'trompe2', bone: 'trompe2', bord: false, from: [-0.9, 1.6, -9.7], to: [0.9, 4.1, -8.3], rot: [22, 0, 0], pivot: [0, 4, -9], faces: { all: 'f', north: ['ffff', 'FFFF', 'ffff', 'ffff'], down: 'p' } },
        ...D.cubes,
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire(), regarde(undefined, IDLE, 7), balance('oreilleD', [0, 9, 0], IDLE, { tours: 2 }), balance('oreilleG', [0, 9, 0], IDLE, { tours: 2, phase: 1 }), balance('trompe', [0, 0, 7], IDLE, { tours: 2 }), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(undefined, 22), tient('corps', [-4, 0, 0]), balance('trompe', [8, 0, 0], WALK), balance('oreilleD', [0, 8, 0], WALK), balance('oreilleG', [0, 8, 0], WALK, { phase: 1 })) },
        interact: {
            length: 1.5, loop: false,
            bones: {
                tete: { rotation: [[0, [0, 0, 0]], [0.3, [16, 0, 0]], [1.1, [16, 0, 0]], [1.4, [0, 0, 0]]] },
                trompe: { rotation: [[0, [0, 0, 0]], [0.3, [105, 0, 0]], [0.55, [118, 0, 0]], [0.8, [105, 0, 0]], [1.05, [118, 0, 0]], [1.4, [0, 0, 0]]] },
                trompe2: { rotation: [[0, [0, 0, 0]], [0.3, [35, 0, 0]], [1.1, [35, 0, 0]], [1.4, [0, 0, 0]]] },
                oreilleD: { rotation: [[0, [0, 0, 0]], [0.3, [0, 30, 0]], [1.1, [0, 30, 0]], [1.4, [0, 0, 0]]] },
                oreilleG: { rotation: [[0, [0, 0, 0]], [0.3, [0, -30, 0]], [1.1, [0, -30, 0]], [1.4, [0, 0, 0]]] },
                root: { position: [[0, [0, 0, 0]], [0.3, [0, 1, 0]], [0.5, [0, 0, 0]], [1.5, [0, 0, 0]]] },
            },
        },
    },
};
