// Champignon : un grand timide. Il se cache sous son chapeau trop grand, qu'il soulève de temps en temps pour jeter
// un œil ; une rainette s'est installée dessus, deux spores s'envolent. Au clic il rabat son chapeau sur ses yeux
// et tremble, la rainette saute.
import { COMMUN, IDLE, WALK, DEUX, visage, mix, balance, tient, regarde, tic, flotte, pendouille, pedale, paire } from './_style.mjs';

const J = paire('jambe', { parent: 'root', pivot: [1.2, 1.6, 0] }, { from: [0.5, 0, -1], to: [2, 1.6, 0.9], faces: { all: 'C' } });

export default {
    name: 'champignon',
    title: 'Champignon',
    palette: { ...COMMUN, c: '#f7ecd9', C: '#e2d2b8', r: '#e2483f', w: '#fffaf2', g: '#7cc94a', G: '#57a336', l: '#d9f0a6', e: { c: '#fff7c9' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.4, 0] }, chapeau: { parent: 'corps', pivot: [0, 5, 0] }, grenouille: { parent: 'chapeau', pivot: [1.5, 9.5, 0.3], rot: [0, 20, 0] },
        spore1: { parent: 'root', pivot: [-4.9, 7.6, -1.5] }, spore2: { parent: 'root', pivot: [4.6, 8.6, 1.6] }, ...J.bones,
    },
    cubes: [
        { name: 'pied', bone: 'corps', from: [-2.2, 1.4, -2.2], to: [2.2, 6, 2.2], faces: { all: 'c', north: visage('c', { ligne: 2 }) } },
        { name: 'chapeau', bone: 'chapeau', from: [-4.3, 5, -4.3], to: [4.3, 7.9, 4.3], faces: { all: ['rrrrrrrr', 'rwwrrrrr', 'rwwrrwwr', 'rrrrrwwr'], up: 'r', down: 'c' } },
        { name: 'dome', bone: 'chapeau', from: [-3, 7.9, -3], to: [3, 9.5, 3], faces: { all: ['rrrwwrrr', 'rrrrrrrr'], up: ['rrrrrrrr', 'rwwrrrrr', 'rwwrrrrr', 'rrrrrrrr', 'rrrrrrrr', 'rrwwrrrr', 'rrwwrrrr', 'rrrrrrrr'] } },
        { name: 'grenouille', bone: 'grenouille', from: [0.6, 9.5, -0.6], to: [2.4, 10.8, 1.2], faces: { all: 'g', north: ['kggk', 'gggg', 'gllg', 'gllg'], down: 'G' } },
        { name: 'spore1', bone: 'spore1', bord: false, from: [-5.2, 7.3, -1.8], to: [-4.6, 7.9, -1.2], faces: { all: 'e' } },
        { name: 'spore2', bone: 'spore2', bord: false, from: [4.3, 8.3, 1.3], to: [4.9, 8.9, 1.9], faces: { all: 'e' } },
        ...J.cubes,
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(regarde('corps', IDLE, 7, 2), pendouille(DEUX, 10), tic('grenouille', [0, 28, 0], 4.5), flotte('spore1', 2.6, IDLE / 2, 0, -0.7), flotte('spore2', 2.2, IDLE / 2, 0.5, 0.6), {
                chapeau: { position: [[0, [0, 0, 0]], [1.6, [0, 0, 0]], [1.9, [0, 1, 0]], [3.2, [0, 1, 0]], [3.5, [0, 0, 0]], [6, [0, 0, 0]]], rotation: [[1.6, [0, 0, 0]], [1.9, [7, 0, 0]], [3.2, [7, 0, 0]], [3.5, [0, 0, 0]]] },
            }),
        },
        walk: { length: WALK, bones: mix(pedale(DEUX, 30), tient('corps', [-6, 0, 0]), balance('chapeau', [0, 0, 5], WALK)) },
        interact: {
            length: 1.5, loop: false,
            bones: {
                chapeau: { position: [[0, [0, 0, 0]], [0.15, [0, -1.7, 0]], [1.05, [0, -1.7, 0]], [1.3, [0, 0.4, 0]], [1.45, [0, 0, 0]]] },
                corps: { rotation: [[0.2, [0, 0, 0]], [0.3, [0, 0, 4]], [0.4, [0, 0, -4]], [0.5, [0, 0, 4]], [0.6, [0, 0, -4]], [0.7, [0, 0, 4]], [0.8, [0, 0, -4]], [0.9, [0, 0, 0]]] },
                grenouille: { position: [[0.1, [0, 0, 0]], [0.4, [0, 3.6, 0]], [0.7, [0, 0, 0]], [0.8, [0, 0.8, 0]], [0.9, [0, 0, 0]]], rotation: [[0.1, [0, 0, 0]], [0.4, [0, 180, 0]], [0.7, [0, 360, 0]]] },
            },
        },
    },
};
