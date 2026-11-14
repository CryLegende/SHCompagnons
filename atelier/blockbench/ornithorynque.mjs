// Ornithorynque : brun, bec plat sombre, queue de castor, pattes palmées. Au clic il claque de la queue en vrille.
import { COMMUN, IDLE, WALK, TOUR, visage, mix, balance, tient, respire, regarde, pendouille, pedale, vrille, flanc, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 2.7, zAv: -1.3, zAr: 3.8, size: [2, 2, 2.6], faces: { all: 'n', up: 'f' } });

export default {
    name: 'ornithorynque',
    title: 'Ornithorynque',
    palette: { ...COMMUN, f: '#94694a', F: '#754e34', w: '#cfa77e', n: '#565060', N: { c: '#3a3542' } },
    bones: { ...squelette([0, 2.6, 1.2], [0, 5, -2.4], [0, 2.2, 1.2]), queue: { parent: 'corps', pivot: [0, 3.8, 5] }, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'haut', from: [-3, 2.2, -2.5], to: [3, 6.8, 5], faces: { all: 'f', east: flanc('f', 'w'), west: flanc('f', 'w'), down: 'w' } },
        { name: 'tete', bone: 'tete', from: [-2.9, 3.6, -7.6], to: [2.9, 8.6, -2.2], faces: { all: 'f', north: visage('f'), down: 'w' } },
        { name: 'bec', bone: 'tete', from: [-2.2, 4.2, -10.2], to: [2.2, 5.6, -7.6], faces: { all: 'n', up: ['nnnnnnnn', 'nnNnnNnn', 'nnnnnnnn', 'nnnnnnnn'] } },
        { name: 'queue', bone: 'queue', from: [-1.9, 3.2, 4.8], to: [1.9, 4.4, 9.6], faces: { all: 'F', up: ['FfFfFfFf', 'fFfFfFfF', 'FfFfFfFf', 'fFfFfFfF', 'FfFfFfFf', 'fFfFfFfF', 'FfFfFfFf', 'fFfFfFfF'] } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire(), regarde(), balance('queue', [6, 0, 0], IDLE, { tours: 3 }), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(), tient('corps', [-5, 0, 0]), balance('queue', [0, 14, 0], WALK)) },
        interact: { length: TOUR, loop: false, bones: mix(vrille('root', 2), { queue: { rotation: [[0, [0, 0, 0]], [0.15, [28, 0, 0]], [0.3, [-14, 0, 0]], [0.45, [28, 0, 0]], [0.6, [-14, 0, 0]], [0.75, [28, 0, 0]], [0.9, [-14, 0, 0]], [1.1, [0, 0, 0]]] } }) },
    },
};
