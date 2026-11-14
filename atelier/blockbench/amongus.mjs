// Among Us rouge : il promène son mini-équipier jaune sur la tête, qui regarde toujours de l'autre côté.
// Au clic il bondit en vrille et le petit saute encore plus haut avant de retomber à sa place.
import { COMMUN, IDLE, WALK, TOUR, DEUX, mix, balance, tient, respire, pendouille, pedale, vrille, paire } from './_style.mjs';

const J = paire('jambe', { parent: 'root', pivot: [1.6, 2.3, 0] }, { from: [0.5, 0, -1.4], to: [2.7, 2.5, 1.4], faces: { all: 'r' } });

export default {
    name: 'amongus',
    title: 'Among Us',
    palette: { ...COMMUN, r: '#da3b3e', R: '#a82a33', v: '#a4e2ef', V: { c: '#effcff' }, D: '#6fb4c6', y: '#f5d83a', Y: '#cfa820' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.2, 0] }, ventre: { parent: 'corps', pivot: [0, 2, 0] }, mini: { parent: 'corps', pivot: [0.4, 10, 0], rot: [0, -16, 0] }, ...J.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'bas', from: [-3, 2, -2.4], to: [3, 9, 2.4], faces: { all: 'r' } },
        { name: 'crane', bone: 'ventre', bord: 'haut', from: [-2.5, 9, -1.9], to: [2.5, 10, 1.9], faces: { all: 'r' } },
        { name: 'visiere', bone: 'ventre', from: [-2.4, 5.4, -3.3], to: [2.4, 8.2, -2.2], faces: { all: 'v', north: ['vVVvvvvv', 'vVvvvvvv', 'vvvvvvvD', 'vvvvvDDD'] } },
        { name: 'sac', bone: 'ventre', from: [-2, 3, 2.4], to: [2, 7.6, 3.7], faces: { all: 'R' } },
        { name: 'mini', bone: 'mini', from: [-1.1, 10, -1], to: [1.9, 13.3, 1.2], faces: { all: 'y', down: 'Y' } },
        { name: 'miniVisiere', bone: 'mini', from: [-0.7, 11.5, -1.6], to: [1.5, 12.8, -0.9], faces: { all: 'v', north: ['vVvv', 'vvvD'] } },
        { name: 'miniSac', bone: 'mini', from: [-0.5, 10.4, 1.2], to: [1.3, 12.4, 1.9], faces: { all: 'Y' } },
        ...J.cubes,
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(respire('ventre', IDLE, 2, 0.03), balance('corps', [0, 9, 3], IDLE, { tours: 1 }), pendouille(DEUX, 10), balance('mini', [0, 24, 0], IDLE, { tours: 1, phase: 1 }),
                { mini: { position: [[3.3, [0, 0, 0]], [3.45, [0, 1.3, 0]], [3.6, [0, 0, 0]], [3.75, [0, 0.6, 0]], [3.9, [0, 0, 0]]] } }),
        },
        walk: { length: WALK, bones: mix(pedale(DEUX, 32), tient('corps', [-5, 0, 0]), tient('mini', [10, 0, 0]), balance('mini', [0, 0.4, 0], WALK, { canal: 'position' })) },
        interact: {
            length: TOUR, loop: false,
            bones: mix(vrille('root', 3), { mini: { position: [[0.15, [0, 0, 0]], [0.55, [0, 5, 0]], [0.95, [0, 0, 0]], [1.05, [0, 1, 0]], [1.2, [0, 0, 0]]], rotation: [[0.15, [0, 0, 0]], [0.45, [0, -120, 0]], [0.7, [0, -240, 0]], [0.95, [0, -360, 0]]] } }),
        },
    },
};
