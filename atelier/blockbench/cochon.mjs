// Cochon : une tirelire. Faïence rose, fente sur le dos d'où dépasse une pièce d'or, bouchon sous le ventre.
// Au clic il se secoue, la pièce saute en tournant et retombe dans la fente.
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, respire, regarde, tic, pendouille, pedale, flanc, paire, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 2.2, zAv: -0.9, zAr: 4.2, size: [2, 2.3, 2], y: 0.4, faces: { all: ['ff', 'ff', 'ff', 'tt'], down: 't' } });
const O = paire('oreille', { parent: 'tete', pivot: [2.7, 10.9, -6.2] }, { from: [1.5, 10.2, -7.5], to: [4.0, 12.6, -6.4], rot: [-38, 0, -20], pivot: [2.7, 10.9, -6.2], faces: { all: 'F', north: 'f' } });
const dos = ['hfffffff', 'ffffffff', 'fffSSfff', 'fffSSfff', 'fffSSfff', 'fffSSfff', 'ffffffff', 'ffffffff'];

export default {
    name: 'cochon',
    title: 'Cochon',
    palette: { ...COMMUN, f: '#f7aab6', F: '#e48b9c', h: { c: '#ffe3e8' }, w: '#fbcbd0', t: '#c26a7c', n: '#ee8fa0', N: { c: '#b4566a' }, S: { c: '#7a3a4c' }, b: '#ee7f8f', g: '#ffcf3f', G: { c: '#e09a14' }, l: '#b9824f' },
    bones: { ...squelette([0, 2.8, 1.7], [0, 6.5, -1.8], [0, 2.4, 1.7]), queue: { parent: 'corps', pivot: [0, 7, 5.5] }, piece: { parent: 'corps', pivot: [0, 8, 1.8] }, ...O.bones, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'haut', from: [-3.25, 2.4, -2], to: [3.25, 8, 5.5], faces: { all: 'f', east: flanc('f', 'w'), west: flanc('f', 'w'), up: dos, down: 'w' } },
        { name: 'tete', bone: 'tete', from: [-3.5, 5, -8.2], to: [3.5, 11.2, -1.4], faces: { all: 'f', north: visage('f'), up: ['hhffffff', 'hfffffff', 'ffffffff', 'ffffffff'] } },
        { name: 'groin', bone: 'tete', from: [-2, 5.4, -9.2], to: [2, 8, -8.0], faces: { all: 'n', north: ['nnnnnnnn', 'nnnnnnnn', 'nnNnnNnn', 'nnNnnNnn', 'nnNnnNnn', 'nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn'] } },
        ...O.cubes,
        { name: 'queue', bone: 'queue', from: [-0.7, 6.3, 5.3], to: [0.7, 7.7, 6.7], rot: [0, 0, 45], pivot: [0, 7, 6], faces: { all: 'F' } },
        { name: 'piece', bone: 'piece', bord: false, from: [-0.45, 7.2, 0], to: [0.45, 10.8, 3.6], rot: [10, 0, 0], pivot: [0, 8, 1.8], faces: { all: 'g', east: ['gggg', 'gGGg', 'gGGg', 'gggg'], west: ['gggg', 'gGGg', 'gGGg', 'gggg'] } },
        { name: 'bouchon', bone: 'corps', from: [-0.9, 1.7, 0.9], to: [0.9, 2.5, 2.7], faces: { all: 'l' } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire(), regarde(), tic('queue', [0, 30, 0], 2.6), tic('oreilleG', [-20, 0, 0], 4.4), tic('piece', [0, 0, 10], 1.2), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(), tient('corps', [-5, 0, 0]), balance('queue', [0, 28, 0], WALK), balance('piece', [0, 0, 9], WALK)) },
        interact: {
            length: 1.8, loop: false,
            bones: {
                root: { rotation: [[0, [0, 0, 0]], [0.1, [0, 0, 9]], [0.2, [0, 0, -9]], [0.3, [0, 0, 9]], [0.4, [0, 0, -9]], [0.5, [0, 0, 0]]], position: [[0.4, [0, 0, 0]], [0.5, [0, 1.2, 0]], [0.65, [0, 0, 0]], [1.8, [0, 0, 0]]] },
                piece: { position: [[0.4, [0, 0, 0]], [0.65, [0, 5.5, 0]], [0.8, [0, 6.6, 0]], [0.95, [0, 5.5, 0]], [1.2, [0, -1.6, 0]], [1.35, [0, -1.6, 0]], [1.6, [0, 0, 0]]], rotation: [[0.4, [0, 0, 0]], [0.8, [0, 360, 0]], [1.2, [0, 720, 0]]] },
                oreilleD: { rotation: [[0.4, [0, 0, 0]], [0.6, [0, 0, -30]], [1.2, [0, 0, -30]], [1.5, [0, 0, 0]]] }, oreilleG: { rotation: [[0.4, [0, 0, 0]], [0.6, [0, 0, 30]], [1.2, [0, 0, 30]], [1.5, [0, 0, 0]]] },
            },
        },
    },
};
