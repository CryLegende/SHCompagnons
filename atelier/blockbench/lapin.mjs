// Lapin : blanc crème, longues oreilles à l'intérieur rose, queue en pompon. Au clic il bondit en vrille.
import { COMMUN, IDLE, WALK, TOUR, visage, mix, tient, respire, regarde, tic, pendouille, pedale, vrille, paire, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 1.9, zAv: -0.5, zAr: 3.7, size: [1.9, 2.5, 2.2], faces: { all: 'f', down: 'p' } });
const O = paire('oreille', { parent: 'tete', pivot: [1.7, 10.9, -4.1] }, { from: [0.9, 10.7, -4.7], to: [2.5, 16, -3.5], rot: [0, 0, -7], pivot: [1.7, 10.9, -4.1], faces: { all: 'f', north: ['ffff', 'fppf', 'fppf', 'fppf', 'fppf', 'fppf', 'fppf', 'ffff'] } });

export default {
    name: 'lapin',
    title: 'Lapin',
    palette: { ...COMMUN, f: '#f7f0e7', F: '#e0d3c5', p: '#f5a9b6', n: { c: '#e98a9c' }, d: { c: '#cdbfb0' } },
    bones: { ...squelette([0, 2.6, 1.6], [0, 6.4, -1.8], [0, 2.2, 1.7]), queue: { parent: 'corps', pivot: [0, 5.2, 5] }, ...O.bones, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-2.9, 2.2, -1.6], to: [2.9, 7.2, 5], faces: { all: 'f' } },
        { name: 'tete', bone: 'tete', from: [-3.3, 5, -7.8], to: [3.3, 11, -1.4], faces: { all: 'f', north: visage('f') } },
        { name: 'museau', bone: 'tete', from: [-1.7, 5.5, -8.7], to: [1.7, 7.8, -7.6], faces: { all: 'f', north: ['fffnnfff', 'fffnnfff', 'ffffffff', 'ffdffdff', 'fffddfff', 'ffffffff', 'ffffffff', 'ffffffff'], up: ['fffnnfff', 'ffffffff', 'ffffffff', 'ffffffff'] } },
        ...O.cubes,
        { name: 'queue', bone: 'queue', from: [-1, 4.2, 4.7], to: [1, 6.2, 6.4], faces: { all: 'f' } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire(), regarde(), tic('oreilleG', [0, 0, 40], 2.6), tic('queue', [0, 25, 0], 4.6), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(undefined, 30), tient('corps', [-5, 0, 0]), tient('oreilleD', [28, 0, 0]), tient('oreilleG', [28, 0, 0])) },
        interact: { length: TOUR, loop: false, bones: mix(vrille('root', 3.5), { oreilleD: { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, -22]], [0.95, [0, 0, -22]], [1.2, [0, 0, 0]]] }, oreilleG: { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 22]], [0.95, [0, 0, 22]], [1.2, [0, 0, 0]]] } }) },
    },
};
