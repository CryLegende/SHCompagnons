// Manchot : un serveur. Nœud papillon, un plateau d'argent levé sur une aile, un poisson dessus.
// Au clic il lance le poisson en l'air et le gobe ; un autre apparaît sur le plateau.
import { COMMUN, IDLE, WALK, DEUX, mix, balance, tient, respire, regarde, tic, pendouille, pedale } from './_style.mjs';

const plastron = ['nnnnnnnn', 'nwwwwwwn', 'nwwwwwwn', 'nwwwwwwn', 'nwwwwwwn', 'nwwwwwwn', 'nwwwwwwn', 'nnwwwwnn'];

export default {
    name: 'manchot',
    title: 'Manchot',
    palette: { ...COMMUN, n: '#3b4a6e', w: '#f6f3ec', o: '#f7a53a', O: '#d98420', r: '#e2483f', R: { c: '#b9322d' }, a: '#d9dee6', A: '#aab2bf', p: '#8fb7d6', P: { c: '#5f8fb5' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.2, 0] }, ventre: { parent: 'corps', pivot: [0, 1, 0] }, tete: { parent: 'corps', pivot: [0, 6.6, 0] },
        aileD: { parent: 'corps', pivot: [3.1, 6.2, 0], rot: [0, 0, 78] }, aileG: { parent: 'corps', pivot: [-3.1, 6.2, 0], rot: [0, 0, -8] },
        plateau: { parent: 'corps', pivot: [6.2, 7.3, 0] }, poisson: { parent: 'plateau', pivot: [6.2, 8.1, 0] },
        jambeD: { parent: 'root', pivot: [1.6, 1.2, -0.4] }, jambeG: { parent: 'root', pivot: [-1.6, 1.2, -0.4] },
    },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-3, 1, -2.6], to: [3, 6.6, 2.8], faces: { all: 'n', north: plastron, down: 'w' } },
        { name: 'tete', bone: 'tete', from: [-3.3, 6, -3.2], to: [3.3, 11.6, 3.2], faces: { all: 'n', north: ['nnnnnnnn', 'nwwnnwwn', 'wkwwwwkw', 'wkwwwwkw', 'bbwwwwbb', 'wwwwwwww', 'nwwwwwwn', 'nnnnnnnn'] } },
        { name: 'bec', bone: 'tete', from: [-1, 7.2, -4.6], to: [1, 8.4, -3.2], faces: { all: 'o', down: 'O' } },
        { name: 'noeud', bone: 'corps', bord: false, from: [-1.5, 5.4, -3.1], to: [1.5, 6.6, -2.5], faces: { all: 'r', north: ['rrrRRrrr', 'rrrRRrrr'] } },
        { name: 'aileD', bone: 'aileD', seed: 'aile', from: [3, 2.2, -1.5], to: [3.9, 6.4, 1.7], faces: { all: 'n', west: 'w' } },
        { name: 'aileG', bone: 'aileG', seed: 'aile', from: [-3.9, 2.2, -1.5], to: [-3, 6.4, 1.7], faces: { all: 'n', east: 'w' } },
        { name: 'plateau', bone: 'plateau', bord: false, from: [3.9, 7.2, -2.4], to: [8.6, 7.7, 2.4], faces: { all: 'A', up: ['AAAA', 'AaaA', 'AaaA', 'AAAA'] } },
        { name: 'poisson', bone: 'poisson', from: [4.6, 7.7, -0.9], to: [7.9, 9, 0.9], faces: { all: 'p', north: ['pppPPppp', 'ppppPPpp', 'pkppppPP', 'ppppPPpp'], south: ['pppPPppp', 'ppPPpppp', 'PPppppkp', 'ppPPpppp'], east: 'P', down: 'w' } },
        { name: 'jambeD', bone: 'jambeD', seed: 'patte', from: [0.6, 0, -3.3], to: [2.6, 1, 0.5], faces: { all: 'o', up: ['oOoO', 'oooo', 'oooo', 'oooo'] } },
        { name: 'jambeG', bone: 'jambeG', seed: 'patte', from: [-2.6, 0, -3.3], to: [-0.6, 1, 0.5], faces: { all: 'o', up: ['OoOo', 'oooo', 'oooo', 'oooo'] } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.035), regarde(), balance('aileG', [0, 0, 6], IDLE, { tours: 3 }), pendouille(DEUX, 9), balance('plateau', [0, 0, 3], IDLE, { tours: 2 }), tic('poisson', [0, 25, 0], 2.6)) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 26), balance('corps', [0, 0, 5], WALK), balance('plateau', [0, 0, 5], WALK, { phase: 1 }), balance('aileG', [0, 0, 14], WALK)) },
        interact: {
            length: 1.8, loop: false,
            bones: {
                aileD: { rotation: [[0, [0, 0, 0]], [0.15, [0, 0, -14]], [0.3, [0, 0, 16]], [0.6, [0, 0, 0]]] },
                plateau: { position: [[0, [0, 0, 0]], [0.15, [0, -0.9, 0]], [0.3, [0, 1.2, 0]], [0.6, [0, 0, 0]]] },
                poisson: { position: [[0.25, [0, 0, 0]], [0.6, [-3.4, 6.6, -1.6]], [0.9, [-6.2, 2.4, -3.4]], [1.0, [-6.2, 0.2, -3]], [1.45, [-6.2, 0.2, -3]], [1.5, [0, 0, 0]]], rotation: [[0.25, [0, 0, 0]], [0.6, [0, 0, 180]], [0.9, [0, 0, 300]], [1.0, [0, 0, 270]], [1.5, [0, 0, 360]]], scale: [[0.9, [1, 1, 1]], [1.05, [0.05, 0.05, 0.05]], [1.5, [0.05, 0.05, 0.05]], [1.7, [1, 1, 1]]] },
                tete: { rotation: [[0.3, [0, 0, 0]], [0.6, [22, 0, 0]], [0.95, [22, 0, 0]], [1.1, [-10, 0, 0]], [1.25, [6, 0, 0]], [1.4, [0, 0, 0]]] },
            },
        },
    },
};
