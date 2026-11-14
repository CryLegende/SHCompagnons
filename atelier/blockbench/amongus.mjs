// Among Us rouge : corps en haricot arrondi, grande visière bleutée, sac à dos, deux jambes courtes. Au clic il bondit en vrille.
import { COMMUN, IDLE, WALK, TOUR, DEUX, mix, balance, tient, respire, pendouille, pedale, vrille, paire } from './_style.mjs';

const J = paire('jambe', { parent: 'root', pivot: [1.6, 2.3, 0] }, { from: [0.5, 0, -1.4], to: [2.7, 2.5, 1.4], faces: { all: 'r' } });

export default {
    name: 'amongus',
    title: 'Among Us',
    palette: { ...COMMUN, r: '#da3b3e', R: '#a82a33', v: '#a4e2ef', V: { c: '#effcff' }, D: '#6fb4c6' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.2, 0] }, ventre: { parent: 'corps', pivot: [0, 2, 0] }, ...J.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'bas', from: [-3, 2, -2.4], to: [3, 9, 2.4], faces: { all: 'r' } },
        { name: 'crane', bone: 'ventre', bord: 'haut', from: [-2.5, 9, -1.9], to: [2.5, 10, 1.9], faces: { all: 'r' } },
        { name: 'visiere', bone: 'ventre', from: [-2.4, 5.4, -3.3], to: [2.4, 8.2, -2.2], faces: { all: 'v', north: ['vVVvvvvv', 'vVvvvvvv', 'vvvvvvvD', 'vvvvvDDD'] } },
        { name: 'sac', bone: 'ventre', from: [-2, 3, 2.4], to: [2, 7.6, 3.7], faces: { all: 'R' } },
        ...J.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.03), balance('corps', [0, 9, 3], IDLE, { tours: 1 }), pendouille(DEUX, 10)) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 32), tient('corps', [-5, 0, 0])) },
        interact: { length: TOUR, loop: false, bones: vrille('root', 3) },
    },
};
