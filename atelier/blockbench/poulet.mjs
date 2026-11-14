// Poulet : blanc, crête et barbillon rouges, pattes jaunes. Au clic il sursaute et pond un œuf.
import { COMMUN, IDLE, WALK, DEUX, visage, mix, balance, tient, respire, regarde, tic, bat, pendouille, pedale, paire } from './_style.mjs';

const A = paire('aile', { parent: 'corps', pivot: [2.9, 6.6, 0.2] }, { from: [2.8, 3.6, -1.6], to: [3.6, 6.9, 2.4], faces: { all: 'W', west: 'w' } });
const J = paire('jambe', { parent: 'root', pivot: [1.25, 2.7, 0] }, { bord: false, from: [0.8, 0, -0.6], to: [1.7, 2.8, 0.4], faces: { all: 'o' } });

export default {
    name: 'poulet',
    title: 'Poulet',
    palette: { ...COMMUN, w: '#f8f4eb', W: '#e6dfd0', o: '#f5a623', O: '#d48a12', r: '#e24b3f', e: '#fff1cf' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.8, 0.5] }, ventre: { parent: 'corps', pivot: [0, 2.6, 0.5] }, tete: { parent: 'corps', pivot: [0, 7, -2.4] }, queue: { parent: 'corps', pivot: [0, 6.6, 3.5] }, oeuf: { parent: 'root', pivot: [0, 3.8, 1.8] }, ...A.bones, ...J.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-2.8, 2.6, -2.6], to: [2.8, 7.6, 3.6], faces: { all: 'w' } },
        { name: 'tete', bone: 'tete', from: [-2.2, 6.8, -5.2], to: [2.2, 11.6, -1], faces: { all: 'w', north: visage('w', { ligne: 1 }) } },
        { name: 'bec', bone: 'tete', from: [-1, 8, -6.4], to: [1, 9.1, -5.2], faces: { all: 'o', down: 'O' } },
        { name: 'barbillon', bone: 'tete', bord: false, from: [-0.5, 6.7, -6.0], to: [0.5, 8, -5.2], faces: { all: 'r' } },
        { name: 'crete', bone: 'tete', bord: false, from: [-0.5, 11.6, -4.6], to: [0.5, 12.9, -1.8], faces: { all: 'r', east: ['rrrr', 'rrrr'], west: ['rrrr', 'rrrr'] } },
        ...A.cubes,
        { name: 'queue', bone: 'queue', from: [-1.2, 6.2, 3.3], to: [1.2, 9.3, 4.4], rot: [22, 0, 0], pivot: [0, 6.6, 3.5], faces: { all: 'W', north: 'w' } },
        { name: 'oeuf', bone: 'oeuf', from: [-1, 2.8, 0.8], to: [1, 5.3, 2.8], faces: { all: 'e' } },
        ...J.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.04), regarde(undefined, IDLE, 12, 0), tic('queue', [-14, 0, 0], 2.7), bat('aileD', 'aileG', 5, IDLE, 2), pendouille(DEUX, 10)) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 30), tient('corps', [-6, 0, 0]), balance('tete', [0, 0, 0.7], WALK, { canal: 'position' }), bat('aileD', 'aileG', 8, WALK, 1, 12)) },
        interact: {
            length: 2.0, loop: false,
            bones: {
                root: { position: [[0, [0, 0, 0]], [0.12, [0, -0.5, 0]], [0.32, [0, 2.2, 0]], [0.55, [0, 0, 0]], [2.0, [0, 0, 0]]] },
                aileD: { rotation: [[0, [0, 0, 0]], [0.15, [0, 0, 55]], [0.3, [0, 0, 20]], [0.45, [0, 0, 55]], [0.7, [0, 0, 0]]] },
                aileG: { rotation: [[0, [0, 0, 0]], [0.15, [0, 0, -55]], [0.3, [0, 0, -20]], [0.45, [0, 0, -55]], [0.7, [0, 0, 0]]] },
                oeuf: { position: [[0.3, [0, 0, 0]], [0.55, [0, -4.4, 0.6]], [0.68, [0, -3.7, 0.6]], [0.8, [0, -4.4, 0.6]], [1.5, [0, -4.4, 0.6]], [1.75, [0, 0, 0]]], scale: [[1.45, [1, 1, 1]], [1.6, [0.05, 0.05, 0.05]], [1.75, [0.05, 0.05, 0.05]], [1.95, [1, 1, 1]]] },
                tete: { rotation: [[0.6, [0, 0, 0]], [0.85, [-30, 0, 0]], [1.4, [-30, 0, 0]], [1.65, [0, 0, 0]]] },
            },
        },
    },
};
