// Bébé Yoda : dans sa nacelle, son bol de soupe d'une main, il fait léviter de l'autre la boule argentée qu'il a
// chipée au vaisseau. Au clic la boule fait le tour de sa tête, oreilles dressées.
import { COMMUN, IDLE, WALK, mix, balance, tient, regarde, paire } from './_style.mjs';

const O = paire('oreille', { parent: 'tete', pivot: [3, 8.9, -0.3] }, { from: [3, 8.1, -0.9], to: [6.5, 9.6, 0.2], rot: [0, 0, 10], pivot: [3, 8.9, -0.3], faces: { all: 'g', north: ['gggg', 'gppg', 'gppg', 'gggg'] } });
const dresse = (s) => ({ rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 28 * s]], [1.3, [0, 0, 28 * s]], [1.6, [0, 0, 0]]] });

export default {
    name: 'bebe_yoda',
    title: 'Bébé Yoda',
    palette: { ...COMMUN, g: '#b3cf86', p: '#e9a9b0', r: '#cdb28e', R: '#a98f6d', m: '#cfd2d9', M: '#9fa4b0', i: '#6f7480', e: { c: '#ffffff' }, n: '#8a6a4c', s: { c: '#e9c46a' }, a: '#dfe3ea', A: { c: '#ffffff' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 4.6, 0] }, tete: { parent: 'corps', pivot: [0, 6.6, 0] }, ...O.bones,
        bras: { parent: 'corps', pivot: [2, 6, -2], rot: [0, -25, 0] }, boule: { parent: 'root', pivot: [0, 8.6, 0] },
    },
    cubes: [
        { name: 'nacelle', bone: 'root', from: [-3.6, 1, -3.6], to: [3.6, 4.3, 3.6], faces: { all: 'm', up: 'i', north: ['mmmmmmmm', 'mmmmmmmm', 'mMMMMMMm', 'mmmmmmmm'] } },
        { name: 'rebord', bone: 'root', bord: false, from: [-3.9, 4.3, -3.9], to: [3.9, 5.1, 3.9], faces: { all: 'M', up: ['MMMMMMMM', 'MiiiiiiM', 'MiiiiiiM', 'MiiiiiiM', 'MiiiiiiM', 'MiiiiiiM', 'MiiiiiiM', 'MMMMMMMM'] } },
        { name: 'robe', bone: 'corps', from: [-2.3, 4.6, -2.1], to: [2.3, 7, 2.1], faces: { all: 'r', north: ['rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr'] } },
        { name: 'tete', bone: 'tete', from: [-3, 6.6, -2.9], to: [3, 10.8, 2.5], faces: { all: 'g', north: ['gggggggg', 'gekggkeg', 'gkkggkkg', 'bbggggbb', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg'] } },
        ...O.cubes,
        { name: 'bras', bone: 'bras', bord: false, from: [1.5, 5.6, -4], to: [2.5, 6.4, -2], faces: { all: 'r', north: 'g' } },
        { name: 'bol', bone: 'corps', from: [-3.1, 5.1, -4], to: [-1.1, 6.1, -2.1], faces: { all: 'n', up: ['nnnn', 'nssn', 'nssn', 'nnnn'] } },
        { name: 'boule', bone: 'boule', from: [3.7, 6.7, -4.6], to: [5.1, 8.1, -3.2], faces: { all: 'a', north: ['aAaa', 'aaaa', 'aaaa', 'aaaa'] } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(undefined, IDLE, 10, 5), balance('oreilleD', [0, 0, 7], IDLE, { tours: 2 }), balance('oreilleG', [0, 0, 7], IDLE, { tours: 2, phase: 1 }), balance('root', [0, 0, 2.5], IDLE, { tours: 1 }), balance('boule', [0, 0.8, 0], IDLE, { tours: 3, canal: 'position' }), balance('boule', [0, 12, 0], IDLE, { tours: 1 }), balance('bras', [0, 0, 5], IDLE, { tours: 3 })) },
        walk: { length: WALK, bones: mix(tient('root', [-9, 0, 0]), tient('oreilleD', [0, -24, 0]), tient('oreilleG', [0, 24, 0]), tient('tete', [6, 0, 0]), tient('boule', [0, -30, 0])) },
        interact: {
            length: 1.6, loop: false,
            bones: {
                boule: { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 0]], [0.55, [0, -120, 0]], [0.9, [0, -240, 0]], [1.25, [0, -360, 0]]], position: [[0, [0, 0, 0]], [0.2, [0, 1.6, 0]], [1.25, [0, 1.6, 0]], [1.5, [0, 0, 0]]] },
                oreilleD: dresse(1), oreilleG: dresse(-1),
                bras: { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 30]], [1.25, [0, 0, 30]], [1.5, [0, 0, 0]]] },
                tete: { rotation: [[0, [0, 0, 0]], [0.2, [10, 0, 0]], [1.25, [10, 0, 0]], [1.5, [0, 0, 0]]] },
            },
        },
    },
};
