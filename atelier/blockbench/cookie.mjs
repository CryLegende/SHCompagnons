// Cookie : un biscuit aux pépites, croqué dans un coin, deux miettes qui flottent. Au clic il tourne comme une pièce.
import { COMMUN, IDLE, WALK, TOUR, mix, balance, tient, vrille } from './_style.mjs';

export default {
    name: 'cookie',
    title: 'Cookie',
    scale: 0.5,
    palette: { ...COMMUN, d: '#dba864', D: '#c08a45', c: { c: '#5a3521' }, b: '#e8876f' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 4.6, 0] }, miette1: { parent: 'root', pivot: [2.6, 7.6, 0] }, miette2: { parent: 'root', pivot: [3.7, 8.7, 0] } },
    cubes: [
        {
            name: 'biscuit', bone: 'corps', from: [-3.6, 1.2, -1.4], to: [3.6, 6.4, 1.4],
            faces: { all: 'd', north: ['dddddcdd', 'dddddddd', 'ddkddkdd', 'ddkddkdd', 'dbbddbbd', 'dcdddddd', 'dddddcdd', 'dddddddd'], south: ['dcdddddd', 'dddddcdd', 'dddddddd', 'ddcddddd', 'dddddddc', 'dddddddd', 'dcddddcd', 'dddddddd'] },
        },
        { name: 'haut', bone: 'corps', bord: 'haut', from: [-3.6, 6.4, -1.4], to: [1.3, 8.5, 1.4], faces: { all: 'd', north: ['dddddddd', 'ddcddddd', 'dddddddd', 'dddddcdd'], south: ['dddddddd', 'dddddcdd', 'dcdddddd', 'dddddddd'], east: 'D' } },
        { name: 'miette1', bone: 'miette1', bord: false, from: [2.2, 7.2, -0.4], to: [3.0, 8.0, 0.4], rot: [0, 20, 30], pivot: [2.6, 7.6, 0], faces: { all: 'd' } },
        { name: 'miette2', bone: 'miette2', bord: false, from: [3.4, 8.4, -0.3], to: [4.0, 9.0, 0.3], rot: [20, 0, 15], pivot: [3.7, 8.7, 0], faces: { all: 'D' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(balance('corps', [0, 10, 4], IDLE, { tours: 1 }), balance('miette1', [0, 0.5, 0], IDLE, { tours: 2, canal: 'position' }), balance('miette2', [0, 0.6, 0], IDLE, { tours: 2, phase: 1, canal: 'position' })) },
        walk: { length: WALK, bones: mix(tient('root', [-8, 0, 0]), balance('corps', [0, 0, 7], WALK)) },
        interact: { length: TOUR, loop: false, bones: mix(vrille('root', 3), { miette1: { position: [[0, [0, 0, 0]], [0.4, [1.2, 2, 0]], [1.0, [0, 0, 0]]] }, miette2: { position: [[0, [0, 0, 0]], [0.4, [1.8, 2.6, 0]], [1.0, [0, 0, 0]]] } }) },
    },
};
