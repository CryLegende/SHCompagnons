// Poulet : la couveuse. Elle ne quitte jamais son nid de paille et l'emmène partout, deux œufs au chaud devant elle.
// Au clic elle sursaute, bat des ailes, et un œuf de plus roule dans le nid.
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, respire, regarde, tic, bat, paire } from './_style.mjs';

const A = paire('aile', { parent: 'corps', pivot: [2.9, 6.6, 0.2] }, { from: [2.8, 3.8, -1.6], to: [3.6, 6.9, 2.4], faces: { all: 'W', west: 'w' } });
const paille = ['pPpppPpp', 'ppPpPppP', 'PpppPppp', 'ppPpppPp'];

export default {
    name: 'poulet',
    title: 'Poulet',
    palette: { ...COMMUN, w: '#f8f4eb', W: '#e6dfd0', o: '#f5a623', O: '#d48a12', r: '#e24b3f', e: '#fff1cf', E: '#f3dcae', p: '#e3b85a', P: '#c9973a' },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.4, 0.5] }, ventre: { parent: 'corps', pivot: [0, 2.4, 0.5] }, tete: { parent: 'corps', pivot: [0, 7, -2.4] }, queue: { parent: 'corps', pivot: [0, 6.6, 3.5] },
        oeuf: { parent: 'root', pivot: [0, 4.2, 1] }, ...A.bones,
    },
    cubes: [
        { name: 'nid', bone: 'root', bord: 'bas', from: [-4.6, 0, -4.8], to: [4.6, 2.6, 4.6], faces: { all: paille, up: ['pPpppPpp', 'ppPpPppP', 'PpppPppp', 'ppPpppPp', 'pPppPppp', 'pppPppPp', 'PppppPpp', 'ppPppppP'], down: 'P' } },
        { name: 'ventre', bone: 'ventre', from: [-2.8, 2.4, -2.2], to: [2.8, 7.6, 3.8], faces: { all: 'w' } },
        { name: 'tete', bone: 'tete', from: [-2.2, 6.8, -5.2], to: [2.2, 11.6, -1], faces: { all: 'w', north: visage('w', { ligne: 1 }) } },
        { name: 'bec', bone: 'tete', from: [-1, 8, -6.4], to: [1, 9.1, -5.2], faces: { all: 'o', down: 'O' } },
        { name: 'barbillon', bone: 'tete', bord: false, from: [-0.5, 6.7, -6.0], to: [0.5, 8, -5.2], faces: { all: 'r' } },
        { name: 'crete', bone: 'tete', bord: false, from: [-0.5, 11.6, -4.6], to: [0.5, 12.9, -1.8], rot: [0, 0, -8], pivot: [0, 11.6, -3.2], faces: { all: 'r' } },
        ...A.cubes,
        { name: 'queue', bone: 'queue', from: [-1.2, 6.2, 3.3], to: [1.2, 9.3, 4.4], rot: [22, 0, 0], pivot: [0, 6.6, 3.5], faces: { all: 'W', north: 'w' } },
        { name: 'oeuf1', bone: 'root', from: [-3.7, 2.2, -4.2], to: [-1.9, 4.4, -2.6], rot: [0, 0, 12], pivot: [-2.8, 2.6, -3.4], faces: { all: 'e' } },
        { name: 'oeuf2', bone: 'root', from: [2.1, 2.2, -4], to: [3.7, 4.2, -2.5], rot: [0, 0, -16], pivot: [2.9, 2.6, -3.2], faces: { all: 'E' } },
        { name: 'oeuf', bone: 'oeuf', from: [-0.9, 3.2, 0.2], to: [0.9, 5.4, 1.8], faces: { all: 'e' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.04), regarde(undefined, IDLE, 12, 0), tic('queue', [-14, 0, 0], 2.7), bat('aileD', 'aileG', 5, IDLE, 2), { tete: { position: [[4.2, [0, 0, 0]], [4.35, [0, -1, -0.6]], [4.5, [0, 0, 0]], [4.65, [0, -1, -0.6]], [4.8, [0, 0, 0]]] } }) },
        walk: { length: WALK, bones: mix(tient('root', [-6, 0, 0]), balance('tete', [0, 0, 0.7], WALK, { canal: 'position' }), bat('aileD', 'aileG', 10, WALK, 1, 14)) },
        interact: {
            length: 2.0, loop: false,
            bones: {
                corps: { position: [[0, [0, 0, 0]], [0.12, [0, -0.5, 0]], [0.32, [0, 2.6, 0]], [0.6, [0, 0, 0]], [2.0, [0, 0, 0]]] },
                aileD: { rotation: [[0, [0, 0, 0]], [0.15, [0, 0, 55]], [0.3, [0, 0, 20]], [0.45, [0, 0, 55]], [0.7, [0, 0, 0]]] },
                aileG: { rotation: [[0, [0, 0, 0]], [0.15, [0, 0, -55]], [0.3, [0, 0, -20]], [0.45, [0, 0, -55]], [0.7, [0, 0, 0]]] },
                oeuf: { position: [[0.3, [0, 0, 0]], [0.6, [0, -0.8, -4.6]], [0.75, [0, -0.2, -4.6]], [0.9, [0, -0.8, -4.6]], [1.5, [0, -0.8, -4.6]], [1.75, [0, 0, 0]]], rotation: [[0.3, [0, 0, 0]], [0.6, [-120, 0, 0]], [0.9, [-180, 0, 0]]], scale: [[1.45, [1, 1, 1]], [1.6, [0.05, 0.05, 0.05]], [1.75, [0.05, 0.05, 0.05]], [1.95, [1, 1, 1]]] },
                tete: { rotation: [[0.6, [0, 0, 0]], [0.85, [-26, 0, 0]], [1.4, [-26, 0, 0]], [1.65, [0, 0, 0]]] },
            },
        },
    },
};
