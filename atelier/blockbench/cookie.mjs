// Cookie : tout juste sorti du four. Il se promène debout sur la spatule qui l'a décollé de la plaque, un coin
// déjà croqué, de grosses pépites de chocolat qui dépassent. Au clic il saute comme une crêpe et retombe sur sa spatule.
import { COMMUN, IDLE, WALK, mix, balance, tient } from './_style.mjs';

export default {
    name: 'cookie',
    title: 'Cookie',
    scale: 0.44,
    palette: { ...COMMUN, d: '#dba864', D: '#c08a45', c: { c: '#5a3521' }, b: '#e8876f', a: '#c3c9d3', A: '#9aa3b0', m: '#8a5a34', p: '#6b4027' },
    bones: {
        root: { pivot: [0, 0, 0] }, spatule: { parent: 'root', pivot: [0, 0.6, 0] }, corps: { parent: 'root', pivot: [0, 5.4, 0], rot: [0, 0, 5] },
    },
    cubes: [
        { name: 'lame', bone: 'spatule', bord: false, from: [-4, 0.3, -2.3], to: [4, 1, 2.3], faces: { all: 'a', up: ['aaaaaaaa', 'aAAaaAAa', 'aAAaaAAa', 'aaaaaaaa'] } },
        { name: 'manche', bone: 'spatule', bord: false, from: [3.8, 0.3, -0.6], to: [9.2, 1, 0.6], rot: [0, -18, 24], pivot: [3.8, 0.7, 0], faces: { all: 'm' } },
        {
            name: 'biscuit', bone: 'corps', from: [-3.6, 1.2, -1.4], to: [3.6, 6.4, 1.4],
            faces: { all: 'd', north: ['dddddcdd', 'dddddddd', 'ddkddkdd', 'ddkddkdd', 'dbbddbbd', 'dcdddddd', 'dddddcdd', 'dddddddd'], south: ['dcdddddd', 'dddddcdd', 'dddddddd', 'ddcddddd', 'dddddddc', 'dddddddd', 'dcddddcd', 'dddddddd'] },
        },
        { name: 'haut', bone: 'corps', bord: 'haut', from: [-3.6, 6.4, -1.4], to: [1.3, 8.5, 1.4], faces: { all: 'd', north: ['dddddddd', 'ddcddddd', 'dddddddd', 'dddddcdd'], south: ['dddddddd', 'dddddcdd', 'dcdddddd', 'dddddddd'], east: 'D' } },
        { name: 'pepite1', bone: 'corps', from: [1.7, 2.2, -1.85], to: [2.9, 3.4, -1.3], faces: { all: 'p' } },
        { name: 'pepite2', bone: 'corps', from: [-2.2, 1.5, -1.85], to: [-1, 2.7, -1.3], faces: { all: 'p' } },
        { name: 'pepite3', bone: 'corps', from: [-2.9, 6.9, -1.85], to: [-1.7, 8.1, -1.3], faces: { all: 'p' } },
        { name: 'pepite4', bone: 'corps', from: [-0.6, 3.4, 1.3], to: [0.6, 4.6, 1.85], faces: { all: 'p' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(balance('corps', [0, 10, 4], IDLE, { tours: 1 })) },
        walk: { length: WALK, bones: mix(tient('root', [-8, 0, 0]), balance('corps', [0, 0, 6], WALK)) },
        interact: {
            length: 1.4, loop: false,
            bones: {
                spatule: { rotation: [[0, [0, 0, 0]], [0.15, [12, 0, 0]], [0.3, [-16, 0, 0]], [0.6, [0, 0, 0]], [1.0, [0, 0, 0]], [1.1, [6, 0, 0]], [1.25, [0, 0, 0]]] },
                corps: { position: [[0.2, [0, 0, 0]], [0.45, [0, 5.5, 0]], [0.65, [0, 6.6, 0]], [0.85, [0, 5, 0]], [1.05, [0, 0, 0]], [1.4, [0, 0, 0]]], rotation: [[0.2, [0, 0, 0]], [0.45, [120, 0, 0]], [0.75, [240, 0, 0]], [1.05, [360, 0, 0]]] },
            },
        },
    },
};
