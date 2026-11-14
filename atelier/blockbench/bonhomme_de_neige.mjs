// Bonhomme de neige : le bonhomme de neige de Noël. Haut-de-forme à ruban rouge et houx, de travers, nez en carotte,
// écharpe rayée rouge et vert dont un pan pend, boutons de charbon, bras en brindilles fourchues.
// Au clic il soulève son chapeau pour saluer, les bras en l'air.
import { COMMUN, IDLE, WALK, frimousse, mix, balance, tient, regarde, tic, paire } from './_style.mjs';
import { mirrored } from '../bbkit.mjs';

const B = paire('bras', { parent: 'corps', pivot: [3, 5.4, 0], rot: [0, 0, 26] }, { bord: false, from: [3, 5, -0.4], to: [6.8, 5.8, 0.4], faces: { all: ['mmmM'], up: 'm' } });
const fourche = { name: 'fourcheD', bone: 'brasD', bord: false, from: [5, 5.6, -0.3], to: [5.6, 7.3, 0.3], rot: [0, 0, -32], pivot: [5.3, 5.7, 0], faces: { all: 'm', up: 'M' } };
const raies = ['rrggrrgg'];
const ruban = ['nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn', 'rrrrrrrr', 'rrrrrrrr', 'nnnnnnnn'];

export default {
    name: 'bonhomme_de_neige',
    title: 'Bonhomme de neige',
    palette: { ...COMMUN, w: '#f9fcff', s: '#dfeaf5', o: '#f7902a', O: '#d9741a', n: '#2e2b33', r: '#d93a3a', g: '#3fa35c', G: { c: '#2f8a49' }, R: { c: '#f04a4a' }, m: '#7a5438', M: '#5e3f29', c: { c: '#2f2a30' }, f: { c: '#ffffff' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 0.6, 0] }, tete: { parent: 'corps', pivot: [0, 7.6, 0] },
        chapeau: { parent: 'tete', pivot: [0, 12.6, 0], rot: [0, 0, -9] }, pan: { parent: 'corps', pivot: [-1.9, 6.9, -3.5] }, ...B.bones,
    },
    cubes: [
        { name: 'socle', bone: 'corps', bord: 'haut', from: [-3.9, 0.6, -3.9], to: [3.9, 2.6, 3.9], faces: { all: ['wwwwwwww', 'ssssssss'], up: 'w', down: 's' } },
        { name: 'ventre', bone: 'corps', bord: 'haut', from: [-3.2, 2.6, -3.2], to: [3.2, 7.2, 3.2], faces: { all: 'w', north: ['wwwwwwww', 'wwwwwwww', 'wwwccwww', 'wwwccwww', 'wwwwwwww', 'wwwccwww', 'wwwccwww', 'wwwwwwww'] } },
        { name: 'tete', bone: 'tete', from: [-2.8, 7.6, -2.8], to: [2.8, 12.6, 2.8], faces: { all: 'w', north: frimousse('w', { ligne: 2 }) } },
        { name: 'nez', bone: 'tete', bord: false, from: [-0.55, 8.9, -5.2], to: [0.55, 10, -2.8], rot: [-8, 0, 0], pivot: [0, 9.4, -2.8], faces: { all: ['oooO'], north: 'O', east: ['Oooo'], up: ['oo', 'oo', 'oo', 'OO'], down: 'O' } },
        { name: 'echarpe', bone: 'corps', bord: false, from: [-3.1, 6.7, -3.1], to: [3.1, 8, 3.1], faces: { all: raies, up: 'r', down: 'r' } },
        { name: 'pan', bone: 'pan', bord: false, from: [-2.7, 3.5, -3.9], to: [-1.1, 6.9, -3.3], faces: { all: ['rrrr', 'rrrr', 'gggg', 'gggg', 'rrrr', 'rrrr', 'gggg', 'RgRg'] } },
        { name: 'bord', bone: 'chapeau', bord: false, from: [-3.5, 12.5, -3.5], to: [3.5, 13.2, 3.5], faces: { all: 'n' } },
        { name: 'calotte', bone: 'chapeau', from: [-2.4, 13.2, -2.4], to: [2.4, 16.2, 2.4], faces: { all: ruban, north: ['nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn', 'nnnnnGGn', 'rrrrGRGr', 'rrrrrGGr', 'nnnnnnnn'], up: 'n', down: 'n' } },
        ...B.cubes, fourche, mirrored(fourche, 'fourcheG', 'brasG'),
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(undefined, IDLE, 10, 3), balance('brasD', [0, 0, 7], IDLE, { tours: 2 }), balance('brasG', [0, 0, 7], IDLE, { tours: 2 }), balance('pan', [0, 0, 6], IDLE, { tours: 2 }), tic('chapeau', [0, 0, 6], 2.7)) },
        walk: { length: WALK, bones: mix(tient('corps', [-6, 0, 0]), balance('pan', [14, 0, 0], WALK), balance('brasD', [0, 0, 12], WALK), balance('brasG', [0, 0, 12], WALK, { phase: 1 }), balance('chapeau', [0, 0, 4], WALK)) },
        interact: {
            length: 1.6, loop: false,
            bones: {
                chapeau: { position: [[0, [0, 0, 0]], [0.3, [1.2, 3, 0]], [0.9, [1.2, 3, 0]], [1.2, [0, -0.3, 0]], [1.35, [0, 0, 0]]], rotation: [[0, [0, 0, 0]], [0.3, [0, 0, -24]], [0.9, [0, 0, -24]], [1.2, [0, 0, 4]], [1.35, [0, 0, 0]]] },
                brasG: { rotation: [[0, [0, 0, 0]], [0.3, [0, 0, -42]], [0.9, [0, 0, -42]], [1.2, [0, 0, 0]]] },
                brasD: { rotation: [[0, [0, 0, 0]], [0.3, [0, 0, 16]], [0.5, [0, 0, 30]], [0.7, [0, 0, 16]], [0.9, [0, 0, 30]], [1.2, [0, 0, 0]]] },
                tete: { rotation: [[0, [0, 0, 0]], [0.3, [10, 0, 0]], [0.9, [10, 0, 0]], [1.2, [-4, 0, 0]], [1.4, [0, 0, 0]]] },
                corps: { rotation: [[0, [0, 0, 0]], [0.3, [-6, 0, 0]], [0.9, [-6, 0, 0]], [1.2, [0, 0, 0]]] },
            },
        },
    },
};
