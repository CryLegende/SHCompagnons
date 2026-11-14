// Champignon : un grand timide. Il se cache sous son chapeau trop grand, qu'il soulève de temps en temps pour jeter
// un œil ; une rainette s'est installée dessus, à côté d'un tout petit champignon. Au clic il rabat son chapeau sur ses yeux
// et tremble, la rainette saute.
import { COMMUN, IDLE, WALK, DEUX, visage, mix, balance, tient, regarde, tic, pendouille, pedale, paire } from './_style.mjs';

const J = paire('jambe', { parent: 'root', pivot: [1.2, 1.6, 0] }, { from: [0.5, 0, -1], to: [2, 1.6, 0.9], faces: { all: 'C' } });

export default {
    name: 'champignon',
    title: 'Champignon',
    palette: { ...COMMUN, c: '#f7ecd9', C: '#e2d2b8', r: '#e2483f', w: '#fffaf2', g: '#7cc94a', G: '#57a336', l: '#d9f0a6', e: { c: '#fff7c9' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.4, 0] }, chapeau: { parent: 'corps', pivot: [0, 5, 0] }, grenouille: { parent: 'chapeau', pivot: [1.5, 9.5, 0.3], rot: [0, 20, 0] }, ...J.bones,
    },
    cubes: [
        { name: 'pied', bone: 'corps', from: [-2.2, 1.4, -2.2], to: [2.2, 6, 2.2], faces: { all: 'c', north: visage('c', { ligne: 2 }) } },
        { name: 'chapeau', bone: 'chapeau', from: [-4.3, 5, -4.3], to: [4.3, 7.9, 4.3], faces: { all: ['rrrrrrrr', 'rwwrrrrr', 'rwwrrwwr', 'rrrrrwwr'], up: 'r', down: 'c' } },
        { name: 'dome', bone: 'chapeau', from: [-3, 7.9, -3], to: [3, 9.5, 3], faces: { all: ['rrrwwrrr', 'rrrrrrrr'], up: ['rrrrrrrr', 'rwwrrrrr', 'rwwrrrrr', 'rrrrrrrr', 'rrrrrrrr', 'rrwwrrrr', 'rrwwrrrr', 'rrrrrrrr'] } },
        { name: 'grenouille', bone: 'grenouille', from: [0.6, 9.5, -0.6], to: [2.4, 10.8, 1.2], faces: { all: 'g', north: ['kggk', 'gggg', 'gllg', 'gllg'], down: 'G' } },
        { name: 'pois1', bone: 'chapeau', bord: false, from: [3.1, 7.9, -3.9], to: [4.1, 8.25, -2.7], faces: { all: 'w' } },
        { name: 'pois2', bone: 'chapeau', bord: false, from: [-4.1, 7.9, -1.2], to: [-3.1, 8.25, 0], faces: { all: 'w' } },
        { name: 'petitPied', bone: 'chapeau', bord: false, from: [-2.6, 9.5, 0.9], to: [-1.8, 10.5, 1.7], faces: { all: 'c' } },
        { name: 'petitChapeau', bone: 'chapeau', from: [-3.1, 10.5, 0.4], to: [-1.3, 11.4, 2.2], faces: { all: 'r', up: ['rrrr', 'rwrr', 'rrwr', 'rrrr'] } },
        ...J.cubes,
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(regarde('corps', IDLE, 7, 2), pendouille(DEUX, 10), tic('grenouille', [0, 28, 0], 4.5), {
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
