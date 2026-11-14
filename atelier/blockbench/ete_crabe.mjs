// Crabe de l'été : il a acheté une glace à deux boules et la tient bien haut dans sa pince pour que personne n'y
// touche. Carapace rouge, grosses pinces, quatre petites pattes qui gigotent. Au clic il part en pas de crabe,
// d'un côté puis de l'autre, en faisant claquer sa pince libre : la boule du haut vacille.
import { COMMUN, IDLE, WALK, frimousse, mix, balance, tient, respire, regarde, tic, paire } from './_style.mjs';

const patte = { bord: false, faces: { all: ['rr', 'rr', 'rr', 'RR'], down: 'R' } };
const PA = paire('patteAv', { parent: 'root', pivot: [3, 2.6, -1] }, { ...patte, seed: 'patte', from: [2.8, 0.3, -1.5], to: [3.9, 2.8, -0.5], rot: [0, 0, 24], pivot: [3, 2.6, -1] });
const PR = paire('patteAr', { parent: 'root', pivot: [3, 2.6, 1.4] }, { ...patte, seed: 'patte', from: [2.8, 0.3, 0.9], to: [3.9, 2.8, 1.9], rot: [0, 0, 24], pivot: [3, 2.6, 1.4] });
const gaufre = ['tTtT', 'TtTt', 'tTtT', 'TtTt'];
const pas = [[0, [0, 0, 0]], [0.25, [2.2, 0.6, 0]], [0.5, [0, 0, 0]], [0.75, [-2.2, 0.6, 0]], [1.0, [0, 0, 0]], [1.2, [1.2, 0.4, 0]], [1.4, [0, 0, 0]]];

export default {
    name: 'ete_crabe',
    title: 'Crabe',
    scale: 0.42,
    palette: { ...COMMUN, r: '#f0603c', R: '#c9442a', l: '#f7805c', w: '#fde3c8', n: { c: '#9a2f1c' }, t: '#e8bd72', T: { c: '#c79548' }, f: '#ff9fc4', F: '#f27fae', v: '#fff3cf', V: '#f0dfae' },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.4, 0] }, ventre: { parent: 'corps', pivot: [0, 2.4, 0] }, ...PA.bones, ...PR.bones,
        brasD: { parent: 'corps', pivot: [3.4, 5, -1] }, brasG: { parent: 'corps', pivot: [-3.4, 4.4, -1] }, pinceG: { parent: 'brasG', pivot: [-5.4, 4.6, -1.4] },
        glace: { parent: 'brasD', pivot: [5.6, 9.2, -1.4] }, boule2: { parent: 'glace', pivot: [5.6, 12.4, -1.4], rot: [0, 0, 8] },
    },
    cubes: [
        { name: 'carapace', bone: 'ventre', from: [-3.6, 2.4, -2.4], to: [3.6, 6.6, 2.6], faces: { all: 'r', north: frimousse('r', { ligne: 2 }), up: ['rrrrrrrr', 'rrlrrrrr', 'rrrrrlrr', 'rrrrrrrr', 'rlrrrrrr', 'rrrrrrlr', 'rrrlrrrr', 'rrrrrrrr'], down: 'w' } },
        ...PA.cubes, ...PR.cubes,
        // Pince droite (à gauche pour qui regarde) : levée, elle tient le cornet
        { name: 'brasD', bone: 'brasD', bord: false, from: [3.4, 4.4, -1.6], to: [5, 5.6, -0.4], rot: [0, 0, 30], pivot: [3.4, 5, -1], faces: { all: 'R' } },
        { name: 'pinceD', bone: 'brasD', from: [4.4, 5.4, -2.5], to: [6.8, 8, -0.3], faces: { all: 'r', north: ['rrrr', 'rrnr', 'rrnr', 'rrrr'], up: ['rrrr', 'rnnr', 'rrrr', 'rrrr'] } },
        { name: 'brasG', bone: 'brasG', bord: false, from: [-5, 3.8, -1.6], to: [-3.4, 5, -0.4], faces: { all: 'R' } },
        { name: 'pinceG', bone: 'pinceG', from: [-7, 3.4, -2.6], to: [-4.6, 5.8, -0.4], faces: { all: 'r', north: ['rrrr', 'nnrr', 'rrrr', 'rrrr'], west: ['rrrr', 'nnnn', 'rrrr', 'rrrr'] } },
        { name: 'cornet', bone: 'glace', bord: false, from: [4.9, 7.6, -2.1], to: [6.3, 10.2, -0.7], faces: { all: gaufre, up: 'T' } },
        { name: 'boule1', bone: 'glace', from: [4.5, 10.2, -2.5], to: [6.7, 12.2, -0.3], faces: { all: ['ffff', 'ffff', 'fFff', 'FfFf'], up: 'f' } },
        { name: 'boule2', bone: 'boule2', from: [4.7, 12.2, -2.3], to: [6.5, 13.9, -0.5], faces: { all: ['vvvv', 'vvvv', 'vvVv', 'VvVV'], up: 'v' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.04), regarde('corps', IDLE, 7, 3), balance('patteAvD', [0, 0, 9], IDLE, { tours: 3 }), balance('patteAvG', [0, 0, 9], IDLE, { tours: 3 }), balance('patteArD', [0, 0, 9], IDLE, { tours: 3, phase: 1 }), balance('patteArG', [0, 0, 9], IDLE, { tours: 3, phase: 1 }), tic('pinceG', [0, 0, 24], 2.4), balance('boule2', [0, 0, 4], IDLE, { tours: 2 })) },
        walk: { length: WALK, bones: mix(tient('corps', [-5, 0, 0]), balance('patteAvD', [0, 0, 22], WALK), balance('patteAvG', [0, 0, 22], WALK), balance('patteArD', [0, 0, 22], WALK, { phase: 1 }), balance('patteArG', [0, 0, 22], WALK, { phase: 1 }), balance('boule2', [0, 0, 7], WALK)) },
        interact: {
            length: 1.5, loop: false,
            bones: {
                root: { position: pas },
                patteAvD: { rotation: [[0, [0, 0, 0]], [0.12, [0, 0, 26]], [0.25, [0, 0, -26]], [0.37, [0, 0, 26]], [0.5, [0, 0, -26]], [0.62, [0, 0, 26]], [0.75, [0, 0, -26]], [0.87, [0, 0, 26]], [1.0, [0, 0, 0]]] },
                patteArG: { rotation: [[0, [0, 0, 0]], [0.12, [0, 0, -26]], [0.25, [0, 0, 26]], [0.37, [0, 0, -26]], [0.5, [0, 0, 26]], [0.62, [0, 0, -26]], [0.75, [0, 0, 26]], [0.87, [0, 0, -26]], [1.0, [0, 0, 0]]] },
                pinceG: { rotation: [[0, [0, 0, 0]], [0.15, [0, 0, 30]], [0.3, [0, 0, 0]], [0.45, [0, 0, 30]], [0.6, [0, 0, 0]], [0.75, [0, 0, 30]], [0.9, [0, 0, 0]]] },
                boule2: { rotation: [[0, [0, 0, 0]], [0.25, [0, 0, -22]], [0.5, [0, 0, 6]], [0.75, [0, 0, 22]], [1.0, [0, 0, -6]], [1.2, [0, 0, -12]], [1.4, [0, 0, 0]]] },
            },
        },
    },
};
