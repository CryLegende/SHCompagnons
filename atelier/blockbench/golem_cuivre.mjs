// Golem de cuivre : tête large au gros nez, paratonnerre sur le crâne, longs bras, traces de vert-de-gris.
// Au clic sa tête fait un tour complet, bras levés.
import { COMMUN, IDLE, WALK, DEUX, visage, mix, balance, tient, respire, regarde, pendouille, pedale, paire } from './_style.mjs';

const B = paire('bras', { parent: 'corps', pivot: [3.1, 6.2, 0] }, { from: [2.4, 1.6, -0.8], to: [3.8, 6.5, 0.8], faces: { all: ['cc', 'cc', 'cx', 'cc', 'cc', 'xc', 'CC', 'CC'], up: 'c', down: 'C' } });
const J = paire('jambe', { parent: 'root', pivot: [1.2, 2.5, 0] }, { from: [0.3, 0, -0.9], to: [2.1, 2.6, 0.9], faces: { all: ['cc', 'cc', 'CC', 'CC'] } });
const leve = (s) => ({ rotation: [[0, [0, 0, 0]], [0.25, [0, 0, 150 * s]], [1.0, [0, 0, 150 * s]], [1.3, [0, 0, 0]]] });

export default {
    name: 'golem_cuivre',
    title: 'Golem de cuivre',
    palette: { ...COMMUN, c: '#d67b52', C: '#b25c3a', L: '#eea27c', x: '#58bba0' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.6, 0] }, ventre: { parent: 'corps', pivot: [0, 2.4, 0] }, tete: { parent: 'corps', pivot: [0, 6.6, 0] }, ...B.bones, ...J.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-2.4, 2.4, -1.6], to: [2.4, 6.6, 1.6], faces: { all: 'c', north: ['cccccccc', 'ccccccxc', 'cccccccc', 'cCCCCCCc', 'cccccccc', 'cxcccccc', 'cccccccc', 'cccccccc'] } },
        { name: 'tete', bone: 'tete', from: [-3.1, 6.6, -2.8], to: [3.1, 11.6, 2.8], faces: { all: 'c', north: visage('c', { ligne: 1, lignes: { 6: 'cccccxxc' } }), up: ['cccccccc', 'ccxxcccc', 'cxxccccc', 'cccccccc', 'cccccccc', 'cccccxcc', 'cccccccc', 'cccccccc'] } },
        { name: 'nez', bone: 'tete', from: [-0.6, 7.1, -4], to: [0.6, 9.4, -2.8], faces: { all: 'C' } },
        { name: 'tige', bone: 'tete', bord: false, from: [-0.4, 11.6, -0.4], to: [0.4, 13.8, 0.4], faces: { all: 'C' } },
        { name: 'boule', bone: 'tete', from: [-0.8, 13.6, -0.8], to: [0.8, 15.2, 0.8], faces: { all: 'L' } },
        ...B.cubes, ...J.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.03), regarde(undefined, IDLE, 12, 0), balance('brasD', [6, 0, 0], IDLE, { tours: 2 }), balance('brasG', [6, 0, 0], IDLE, { tours: 2, phase: 1 }), pendouille(DEUX, 8)) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 28), tient('corps', [-5, 0, 0]), balance('brasD', [26, 0, 0], WALK, { phase: 1 }), balance('brasG', [26, 0, 0], WALK)) },
        interact: { length: 1.4, loop: false, bones: { tete: { rotation: [[0, [0, 0, 0]], [0.25, [0, 0, 0]], [0.5, [0, 120, 0]], [0.75, [0, 240, 0]], [1.0, [0, 360, 0]]] }, brasD: leve(1), brasG: leve(-1) } },
    },
};
