// Sculk : un bébé Warden. Bleu nuit, sans yeux, cornes rayées de cyan, cœur d'âmes sur la poitrine, longs bras.
// Au clic il se cambre et rugit, bras écartés.
import { COMMUN, IDLE, WALK, DEUX, mix, balance, tient, respire, regarde, tic, pendouille, pedale, paire } from './_style.mjs';

const C = paire('corne', { parent: 'tete', pivot: [3.1, 11.7, 0] }, { bord: false, from: [2.5, 11.5, -0.6], to: [3.7, 14.7, 0.6], rot: [0, 0, -24], pivot: [3.1, 11.7, 0], faces: { all: ['dd', 'cc', 'dd', 'cc', 'dd', 'dd', 'dd', 'dd'], up: 'c' } });
const B = paire('bras', { parent: 'corps', pivot: [3.9, 6.8, 0] }, { from: [2.9, 1.5, -1], to: [4.9, 7.1, 1], faces: { all: ['dd', 'dd', 'dc', 'dd', 'dd', 'ss', 'ss', 'ss'], up: 'd' } });
const J = paire('jambe', { parent: 'root', pivot: [1.4, 2.4, 0] }, { from: [0.4, 0, -1], to: [2.4, 2.6, 1], faces: { all: 'D' } });
const ecarte = (s) => ({ rotation: [[0, [0, 0, 0]], [0.3, [-20, 0, 58 * s]], [0.5, [-20, 0, 48 * s]], [0.7, [-20, 0, 58 * s]], [0.9, [-20, 0, 48 * s]], [1.1, [-20, 0, 58 * s]], [1.4, [0, 0, 0]]] });

export default {
    name: 'sculk',
    title: 'Sculk',
    palette: { ...COMMUN, d: '#1a5360', D: '#0f3640', s: '#2a7b83', c: { c: '#5ef0ea' }, r: { c: '#dff5e6' }, b: '#3fc9c9' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.6, 0] }, ventre: { parent: 'corps', pivot: [0, 2.4, 0] }, tete: { parent: 'corps', pivot: [0, 7.4, 0] }, ...C.bones, ...B.bones, ...J.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-2.9, 2.4, -1.8], to: [2.9, 7.4, 1.8], faces: { all: 'd', north: ['dddddddd', 'ddcddcdd', 'dcrccrcd', 'ddcrrcdd', 'dddccddd', 'dddddddd', 'dsddddsd', 'dddddddd'] } },
        { name: 'tete', bone: 'tete', from: [-3.4, 7.2, -2.6], to: [3.4, 12, 2.6], faces: { all: 'd', north: ['dddddddd', 'dddddddd', 'dddddddd', 'bbddddbb', 'ddDDDDdd', 'ddDDDDdd', 'dddddddd', 'dddddddd'], up: ['dddddddd', 'ddsddddd', 'dddddsdd', 'dddddddd'] } },
        ...C.cubes, ...B.cubes, ...J.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.05), regarde(undefined, IDLE, 12, 4), tic('corneD', [0, 0, -18], 2.6), tic('corneG', [0, 0, 18], 2.8), balance('brasD', [5, 0, 0], IDLE, { tours: 2 }), balance('brasG', [5, 0, 0], IDLE, { tours: 2, phase: 1 }), pendouille(DEUX, 8)) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 26), tient('corps', [-6, 0, 0]), balance('brasD', [24, 0, 0], WALK, { phase: 1 }), balance('brasG', [24, 0, 0], WALK)) },
        interact: {
            length: 1.5, loop: false,
            bones: {
                tete: { rotation: [[0, [0, 0, 0]], [0.3, [28, 0, 0]], [1.1, [28, 0, 0]], [1.4, [0, 0, 0]]] },
                corps: { rotation: [[0, [0, 0, 0]], [0.3, [10, 0, 0]], [1.1, [10, 0, 0]], [1.4, [0, 0, 0]]] },
                ventre: { scale: [[0, [1, 1, 1]], [0.3, [1.08, 1.06, 1.15]], [0.5, [1, 1, 1]], [0.7, [1.08, 1.06, 1.15]], [0.9, [1, 1, 1]], [1.1, [1.08, 1.06, 1.15]], [1.4, [1, 1, 1]]] },
                brasD: ecarte(1), brasG: ecarte(-1),
                corneD: { rotation: [[0, [0, 0, 0]], [0.3, [0, 0, -22]], [1.1, [0, 0, -22]], [1.4, [0, 0, 0]]] }, corneG: { rotation: [[0, [0, 0, 0]], [0.3, [0, 0, 22]], [1.1, [0, 0, 22]], [1.4, [0, 0, 0]]] },
            },
        },
    },
};
