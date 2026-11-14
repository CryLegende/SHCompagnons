// Sculk : un bébé Warden qui ne supporte pas le bruit. Bleu nuit, sans yeux, cornes rayées de cyan, cœur d'âmes sur
// la poitrine, et un gros casque antibruit orange sur les oreilles. Au clic il sursaute, plaque ses mains sur son
// casque et secoue la tête.
import { COMMUN, IDLE, WALK, DEUX, mix, balance, tient, respire, regarde, tic, pendouille, pedale, paire } from './_style.mjs';

const C = paire('corne', { parent: 'tete', pivot: [3.1, 11.7, 0] }, { bord: false, from: [2.5, 11.5, -0.6], to: [3.7, 14.7, 0.6], rot: [0, 0, -24], pivot: [3.1, 11.7, 0], faces: { all: ['dd', 'cc', 'dd', 'cc', 'dd', 'dd', 'dd', 'dd'], up: 'c' } });
const B = paire('bras', { parent: 'corps', pivot: [3.9, 6.8, 0] }, { from: [2.9, 1.5, -1], to: [4.9, 7.1, 1], faces: { all: ['dd', 'dd', 'dc', 'dd', 'dd', 'ss', 'ss', 'ss'], up: 'd' } });
const J = paire('jambe', { parent: 'root', pivot: [1.4, 2.4, 0] }, { from: [0.4, 0, -1], to: [2.4, 2.6, 1], faces: { all: 'D' } });
const Q = paire('coquille', { parent: 'tete', pivot: [3.9, 10, 0] }, { from: [3.4, 8.3, -1.6], to: [4.8, 11.7, 1.6], faces: { all: 'o', east: ['oooo', 'oOOo', 'oOOo', 'oooo'] } });
const bouche = (s) => ({ rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 166 * s]], [1.2, [0, 0, 166 * s]], [1.5, [0, 0, 0]]] });
const baisse = (s) => ({ rotation: [[0, [0, 0, 0]], [0.2, [0, 0, -30 * s]], [1.2, [0, 0, -30 * s]], [1.5, [0, 0, 0]]] });

export default {
    name: 'sculk',
    title: 'Sculk',
    palette: { ...COMMUN, d: '#1a5360', D: '#0f3640', s: '#2a7b83', c: { c: '#5ef0ea' }, r: { c: '#dff5e6' }, b: '#3fc9c9', o: '#f6a623', O: '#c97d10', n: { c: '#22262e' } },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.6, 0] }, ventre: { parent: 'corps', pivot: [0, 2.4, 0] }, tete: { parent: 'corps', pivot: [0, 7.4, 0] }, ...C.bones, ...B.bones, ...J.bones, ...Q.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-2.9, 2.4, -1.8], to: [2.9, 7.4, 1.8], faces: { all: 'd', north: ['dddddddd', 'ddcddcdd', 'dcrccrcd', 'ddcrrcdd', 'dddccddd', 'dddddddd', 'dsddddsd', 'dddddddd'] } },
        { name: 'tete', bone: 'tete', from: [-3.4, 7.2, -2.6], to: [3.4, 12, 2.6], faces: { all: 'd', north: ['dddddddd', 'dddddddd', 'dddddddd', 'bbddddbb', 'ddDDDDdd', 'ddDDDDdd', 'dddddddd', 'dddddddd'], up: ['dddddddd', 'ddsddddd', 'dddddsdd', 'dddddddd'] } },
        { name: 'arceau', bone: 'tete', bord: false, from: [-4.4, 11.7, -0.5], to: [4.4, 12.5, 0.5], faces: { all: 'n' } },
        ...C.cubes, ...B.cubes, ...J.cubes, ...Q.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.05), regarde(undefined, IDLE, 12, 4), tic('corneD', [0, 0, -18], 2.6), tic('corneG', [0, 0, 18], 2.8), balance('brasD', [5, 0, 0], IDLE, { tours: 2 }), balance('brasG', [5, 0, 0], IDLE, { tours: 2, phase: 1 }), pendouille(DEUX, 8)) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 26), tient('corps', [-6, 0, 0]), balance('brasD', [24, 0, 0], WALK, { phase: 1 }), balance('brasG', [24, 0, 0], WALK)) },
        interact: {
            length: 1.5, loop: false,
            bones: {
                root: { position: [[0, [0, 0, 0]], [0.1, [0, 1.6, 0]], [0.25, [0, 0, 0]]] },
                corps: { rotation: [[0, [0, 0, 0]], [0.2, [-10, 0, 0]], [1.2, [-10, 0, 0]], [1.5, [0, 0, 0]]] },
                tete: { rotation: [[0.25, [0, 0, 0]], [0.4, [0, 14, 0]], [0.55, [0, -14, 0]], [0.7, [0, 14, 0]], [0.85, [0, -14, 0]], [1, [0, 0, 0]]] },
                brasD: bouche(1), brasG: bouche(-1), corneD: baisse(1), corneG: baisse(-1),
            },
        },
    },
};
