// Tortue de mer : carapace verte en deux étages, nageoires plates qui brassent l'air. Au clic elle rentre dans sa carapace.
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, regarde, paire } from './_style.mjs';

const Av = paire('patteAv', { parent: 'root', pivot: [3.3, 3.1, -2] }, { from: [3.2, 2.6, -3.4], to: [6.4, 3.5, -0.8], rot: [0, 18, -8], pivot: [3.3, 3.1, -2], faces: { all: 'v', up: ['vvvV', 'vvvV'], down: 'V' } });
const Ar = paire('patteAr', { parent: 'root', pivot: [3.3, 3.1, 3.2] }, { from: [3.2, 2.6, 2.2], to: [5.6, 3.4, 4.2], rot: [0, -22, -8], pivot: [3.3, 3.1, 3.2], faces: { all: 'v', down: 'V' } });
const plaques = ['cCccCccC', 'CCCCCCCC', 'cCccCccC', 'cCccCccC', 'CCCCCCCC', 'cCccCccC', 'cCccCccC', 'CCCCCCCC'];
const rentre = (v) => ({ rotation: [[0, [0, 0, 0]], [0.25, v], [1.1, v], [1.4, [0, 0, 0]]] });

export default {
    name: 'tortue',
    title: 'Tortue',
    palette: { ...COMMUN, c: '#67a84f', C: '#4c8a3c', r: '#b5d273', y: '#eee2a0', v: '#a6dc80', V: '#7dbb5f' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 3, 0.5] }, tete: { parent: 'corps', pivot: [0, 5, -3.4] }, queue: { parent: 'corps', pivot: [0, 3.2, 4.4] }, ...Av.bones, ...Ar.bones },
    cubes: [
        { name: 'carapace', bone: 'corps', bord: 'haut', from: [-3.6, 2.4, -3.4], to: [3.6, 5.2, 4.4], faces: { all: ['cccccccc', 'cccccccc', 'rrrrrrrr', 'rrrrrrrr'], up: plaques, down: 'y' } },
        { name: 'dome', bone: 'corps', from: [-2.6, 5.2, -2.3], to: [2.6, 6.9, 3.3], faces: { all: 'c', up: ['cCcCCcCc', 'CCCCCCCC', 'cCcCCcCc', 'cCcCCcCc', 'cCcCCcCc', 'cCcCCcCc', 'CCCCCCCC', 'cCcCCcCc'] } },
        { name: 'tete', bone: 'tete', from: [-2, 3.2, -7.4], to: [2, 7.4, -3.2], faces: { all: 'v', north: visage('v'), down: 'y' } },
        ...Av.cubes, ...Ar.cubes,
        { name: 'queue', bone: 'queue', from: [-0.5, 2.8, 4.3], to: [0.5, 3.6, 5.8], faces: { all: 'v' } },
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(regarde(undefined, IDLE, 10), balance('patteAvD', [0, 14, 10], IDLE, { tours: 2 }), balance('patteAvG', [0, -14, -10], IDLE, { tours: 2 }),
                balance('patteArD', [0, 10, 6], IDLE, { tours: 2, phase: 1 }), balance('patteArG', [0, -10, -6], IDLE, { tours: 2, phase: 1 }), balance('queue', [0, 16, 0], IDLE, { tours: 3 })),
        },
        walk: {
            length: 1.0,
            bones: mix(tient('corps', [-6, 0, 0]), balance('patteAvD', [0, 26, 14], 1.0), balance('patteAvG', [0, -26, -14], 1.0), balance('patteArD', [0, 16, 8], 1.0, { phase: 1 }), balance('patteArG', [0, -16, -8], 1.0, { phase: 1 })),
        },
        interact: {
            length: 1.5, loop: false,
            bones: {
                tete: { position: [[0, [0, 0, 0]], [0.25, [0, -0.4, 3.6]], [1.1, [0, -0.4, 3.6]], [1.25, [0, 0, -0.8]], [1.4, [0, 0, 0]]] },
                patteAvD: rentre([0, -75, 0]), patteAvG: rentre([0, 75, 0]), patteArD: rentre([0, 80, 0]), patteArG: rentre([0, -80, 0]),
                queue: { position: [[0, [0, 0, 0]], [0.25, [0, 0, -1.4]], [1.1, [0, 0, -1.4]], [1.4, [0, 0, 0]]] },
                root: { rotation: [[0.3, [0, 0, 0]], [0.5, [0, 0, 7]], [0.7, [0, 0, -7]], [0.9, [0, 0, 5]], [1.1, [0, 0, 0]]] },
            },
        },
    },
};
