// Perroquet : le pirate. Tricorne noir à tête de mort de travers, bandeau sur un œil, ailes rouge, jaune et bleu.
// Au clic il déploie les ailes et danse, son chapeau saute et retombe de travers.
import { COMMUN, IDLE, DEUX, mix, balance, tient, respire, regarde, bat, pendouille, paire } from './_style.mjs';

const plumes = ['rrrr', 'rrrr', 'rrrr', 'yyyy', 'yyyy', 'uuuu', 'uuuu', 'uuuu'];
const A = paire('aile', { parent: 'corps', pivot: [2.7, 7.6, 0.2] }, { bord: 'haut', from: [2.5, 2.6, -1.6], to: [3.4, 7.8, 2.2], faces: { all: plumes, down: 'u', up: 'r' } });
const J = paire('jambe', { parent: 'root', pivot: [1.1, 2.6, -0.4] }, { bord: false, from: [0.5, 1.5, -1.5], to: [1.7, 2.6, 0.7], faces: { all: 'g' } });

export default {
    name: 'perroquet',
    title: 'Perroquet',
    palette: { ...COMMUN, r: '#e63a31', y: '#ffd23f', u: '#3d7be0', w: '#fbf6ee', c: '#f3e6c8', d: { c: '#4b4046' }, g: '#74747e', n: '#33303a', N: { c: '#22202a' }, x: { c: '#f4efe6' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.8, 0.2] }, ventre: { parent: 'corps', pivot: [0, 2.6, 0.2] }, tete: { parent: 'corps', pivot: [0, 7.6, -0.6] }, queue: { parent: 'corps', pivot: [0, 3.2, 2.2] },
        chapeau: { parent: 'tete', pivot: [0, 12.4, -1], rot: [0, 0, 8] }, ...A.bones, ...J.bones,
    },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-2.5, 2.6, -2.2], to: [2.5, 8, 2.6], faces: { all: 'r' } },
        // Bandeau : l'œil droit du perroquet (à gauche pour qui le regarde) est caché, la sangle fait le tour de la tête
        { name: 'tete', bone: 'tete', from: [-2.7, 7.4, -3.6], to: [2.7, 12.4, 1.6], faces: { all: ['rrrrrrrr', 'NNNNNNNN', 'rrrrrrrr', 'rrrrrrrr'], north: ['rrrrrrrr', 'wNNNrwkw', 'wNNNrwkw', 'bbwrrwbb', 'rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr'], up: 'r', down: 'r' } },
        { name: 'bec', bone: 'tete', bord: false, from: [-0.9, 8.1, -5.2], to: [0.9, 10.2, -3.6], faces: { all: ['cccc', 'cccc', 'cccc', 'dddd'], up: 'c', down: 'd' } },
        { name: 'bord', bone: 'chapeau', bord: false, from: [-3.8, 12.3, -4.6], to: [3.8, 13, 2.6], faces: { all: 'n' } },
        { name: 'calotte', bone: 'chapeau', from: [-2.3, 13, -3.2], to: [2.3, 15, 1.2], faces: { all: 'n', north: ['nnnnnnnn', 'nnxxxxnn', 'nnxNNxnn', 'nnnxxnnn'] } },
        ...A.cubes,
        { name: 'queue', bone: 'queue', bord: false, from: [-1, -1.6, 1.7], to: [1, 3.2, 2.7], rot: [-22, 0, 0], pivot: [0, 3.2, 2.2], faces: { all: ['rrrr', 'rrrr', 'uuuu', 'uuuu'] } },
        ...J.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.035), regarde(undefined, IDLE, 12, 5), balance('queue', [5, 0, 0], IDLE, { tours: 2 }), bat('aileD', 'aileG', 5, IDLE, 2), pendouille(DEUX, 8)) },
        walk: { length: 0.5, bones: mix(tient('corps', [-10, 0, 0]), bat('aileD', 'aileG', 26, 0.5, 1, 38), tient('queue', [18, 0, 0])) },
        interact: {
            length: 1.6, loop: false,
            bones: mix(bat('aileD', 'aileG', 10, 1.2, 3, 72), balance('root', [0, 0, 9], 1.2, { tours: 3 }), {
                aileD: { rotation: [[1.4, [0, 0, 0]]] }, aileG: { rotation: [[1.4, [0, 0, 0]]] }, root: { rotation: [[1.4, [0, 0, 0]]] },
                tete: { rotation: [[0, [0, 0, 0]], [0.2, [14, 0, 0]], [0.6, [-8, 0, 0]], [1.0, [14, 0, 0]], [1.4, [0, 0, 0]]] },
                chapeau: { position: [[0, [0, 0, 0]], [0.25, [0, 3.2, 0]], [0.6, [0, 0, 0]], [0.8, [0, 1.6, 0]], [1.1, [0, 0, 0]]], rotation: [[0, [0, 0, 0]], [0.25, [0, 0, -22]], [0.6, [0, 0, 0]], [0.8, [0, 0, 12]], [1.1, [0, 0, 0]]] },
            }),
        },
    },
};
