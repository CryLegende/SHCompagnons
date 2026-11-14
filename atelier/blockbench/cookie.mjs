// Cookie : tout juste sorti du four. Il se promène debout sur la spatule qui l'a décollé de la plaque, encore
// fumant, un coin déjà croqué, deux miettes à la traîne. Au clic il saute comme une crêpe et retombe sur sa spatule.
import { COMMUN, IDLE, WALK, mix, balance, tient, flotte } from './_style.mjs';

export default {
    name: 'cookie',
    title: 'Cookie',
    scale: 0.44,
    palette: { ...COMMUN, d: '#dba864', D: '#c08a45', c: { c: '#5a3521' }, b: '#e8876f', a: '#c3c9d3', A: '#9aa3b0', m: '#8a5a34', v: { c: '#f4f6fa' } },
    bones: {
        root: { pivot: [0, 0, 0] }, spatule: { parent: 'root', pivot: [0, 0.6, 0] }, corps: { parent: 'root', pivot: [0, 5.4, 0], rot: [0, 0, 5] },
        miette1: { parent: 'root', pivot: [2.9, 8.6, 0] }, miette2: { parent: 'root', pivot: [4, 9.8, 0] }, vapeur: { parent: 'root', pivot: [-2.4, 10.6, 0] },
    },
    cubes: [
        { name: 'lame', bone: 'spatule', bord: false, from: [-4, 0.3, -2.3], to: [4, 1, 2.3], faces: { all: 'a', up: ['aaaaaaaa', 'aAAaaAAa', 'aAAaaAAa', 'aaaaaaaa'] } },
        { name: 'manche', bone: 'spatule', bord: false, from: [3.8, 0.3, -0.6], to: [9.2, 1, 0.6], rot: [0, -18, 24], pivot: [3.8, 0.7, 0], faces: { all: 'm' } },
        {
            name: 'biscuit', bone: 'corps', from: [-3.6, 1.2, -1.4], to: [3.6, 6.4, 1.4],
            faces: { all: 'd', north: ['dddddcdd', 'dddddddd', 'ddkddkdd', 'ddkddkdd', 'dbbddbbd', 'dcdddddd', 'dddddcdd', 'dddddddd'], south: ['dcdddddd', 'dddddcdd', 'dddddddd', 'ddcddddd', 'dddddddc', 'dddddddd', 'dcddddcd', 'dddddddd'] },
        },
        { name: 'haut', bone: 'corps', bord: 'haut', from: [-3.6, 6.4, -1.4], to: [1.3, 8.5, 1.4], faces: { all: 'd', north: ['dddddddd', 'ddcddddd', 'dddddddd', 'dddddcdd'], south: ['dddddddd', 'dddddcdd', 'dcdddddd', 'dddddddd'], east: 'D' } },
        { name: 'miette1', bone: 'miette1', bord: false, from: [2.5, 8.2, -0.4], to: [3.3, 9.0, 0.4], rot: [0, 20, 30], pivot: [2.9, 8.6, 0], faces: { all: 'd' } },
        { name: 'miette2', bone: 'miette2', bord: false, from: [3.7, 9.5, -0.3], to: [4.3, 10.1, 0.3], rot: [20, 0, 15], pivot: [4, 9.8, 0], faces: { all: 'D' } },
        { name: 'vapeur', bone: 'vapeur', bord: false, from: [-2.8, 10.2, -0.4], to: [-2, 11, 0.4], faces: { all: 'v' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(balance('corps', [0, 10, 4], IDLE, { tours: 1 }), balance('miette1', [0, 0.5, 0], IDLE, { tours: 2, canal: 'position' }), balance('miette2', [0, 0.6, 0], IDLE, { tours: 2, phase: 1, canal: 'position' }), flotte('vapeur', 3, IDLE / 3, 0, -0.8)) },
        walk: { length: WALK, bones: mix(tient('root', [-8, 0, 0]), balance('corps', [0, 0, 6], WALK)) },
        interact: {
            length: 1.4, loop: false,
            bones: {
                spatule: { rotation: [[0, [0, 0, 0]], [0.15, [12, 0, 0]], [0.3, [-16, 0, 0]], [0.6, [0, 0, 0]], [1.0, [0, 0, 0]], [1.1, [6, 0, 0]], [1.25, [0, 0, 0]]] },
                corps: { position: [[0.2, [0, 0, 0]], [0.45, [0, 5.5, 0]], [0.65, [0, 6.6, 0]], [0.85, [0, 5, 0]], [1.05, [0, 0, 0]], [1.4, [0, 0, 0]]], rotation: [[0.2, [0, 0, 0]], [0.45, [120, 0, 0]], [0.75, [240, 0, 0]], [1.05, [360, 0, 0]]] },
                miette1: { position: [[0.2, [0, 0, 0]], [0.6, [1.4, 3, 0]], [1.1, [0, 0, 0]]] }, miette2: { position: [[0.2, [0, 0, 0]], [0.6, [1.9, 3.6, 0]], [1.1, [0, 0, 0]]] },
            },
        },
    },
};
