// Caneton de Pâques : jaune, bec plat, pattes palmées, une demi-coquille d'œuf en chapeau. Au clic il sautille, la coquille tressaute.
import { COMMUN, IDLE, WALK, JOIE, DEUX, visage, mix, balance, tient, respire, regarde, tic, bat, pendouille, pedale, joie, paire } from './_style.mjs';

const A = paire('aile', { parent: 'corps', pivot: [2.9, 5.6, 0.4] }, { from: [2.8, 2.8, -1.2], to: [3.5, 5.8, 2.4], faces: { all: 'Y', west: 'y' } });
const J = paire('jambe', { parent: 'root', pivot: [1.5, 1.6, -0.2] }, { from: [0.5, 0, -2.4], to: [2.5, 0.9, 0.8], faces: { all: 'o', up: ['oOoO', 'oooo', 'oooo', 'oooo'] } });

export default {
    name: 'paques_canard',
    title: 'Caneton',
    palette: { ...COMMUN, y: '#ffdc52', Y: '#f2c531', o: '#f79a2e', O: '#d97f17', e: '#fbf7ee', p: '#f6a9c8', c: '#9bdcec' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.6, 0.4] }, ventre: { parent: 'corps', pivot: [0, 1.4, 0.4] }, tete: { parent: 'corps', pivot: [0, 6.2, -2] }, coquille: { parent: 'tete', pivot: [0, 10.8, -3.2] }, queue: { parent: 'corps', pivot: [0, 5.4, 3.5] }, ...A.bones, ...J.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-2.8, 1.4, -2.8], to: [2.8, 6.4, 3.6], faces: { all: 'y' } },
        { name: 'tete', bone: 'tete', from: [-2.9, 5.8, -5.8], to: [2.9, 11.2, -0.6], faces: { all: 'y', north: visage('y', { ligne: 2 }) } },
        { name: 'bec', bone: 'tete', from: [-1.6, 6.9, -7.6], to: [1.6, 8, -5.8], faces: { all: 'o', down: 'O' } },
        { name: 'coquille', bone: 'coquille', bord: 'haut', from: [-2.3, 10.7, -5.3], to: [2.3, 12.6, -1.1], rot: [0, 0, 7], pivot: [0, 10.8, -3.2], faces: { all: ['eeeeeeee', 'eepeeeee', 'eeeeecee', 'eeeeeeee', 'epeeeeee', 'eeeeeepe', 'ececeece', 'eeeeeeee'], up: 'e' } },
        ...A.cubes,
        { name: 'queue', bone: 'queue', from: [-1, 5, 3.3], to: [1, 7, 4.5], rot: [25, 0, 0], pivot: [0, 5.4, 3.5], faces: { all: 'Y' } },
        ...J.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.04), regarde(), tic('queue', [0, 22, 0], 2.7), bat('aileD', 'aileG', 6, IDLE, 2), pendouille(DEUX, 10)) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 28), tient('corps', [-5, 0, 0]), balance('queue', [0, 20, 0], WALK)) },
        interact: { length: JOIE, loop: false, bones: mix(joie('root', 2.4, 8), bat('aileD', 'aileG', 22, JOIE, 5, 40), { coquille: { position: [[0.3, [0, 0, 0]], [0.5, [0, 1.6, 0]], [0.7, [0, 0, 0]], [0.8, [0, 0.5, 0]], [0.9, [0, 0, 0]]], rotation: [[0.3, [0, 0, 0]], [0.5, [0, 0, -14]], [0.7, [0, 0, 0]]] } }) },
    },
};
