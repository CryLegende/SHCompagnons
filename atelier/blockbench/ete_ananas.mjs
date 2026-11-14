// Ananas de l'été : écorce à losanges, plumet de feuilles, lunettes de soleil. Au clic il baisse ses lunettes pour vous regarder.
import { COMMUN, IDLE, WALK, DEUX, mix, balance, tient, regarde, pendouille, pedale, paire } from './_style.mjs';

const losanges = ['yYyYyYyY', 'YyYyYyYy', 'yYyYyYyY', 'YyYyYyYy', 'yYyYyYyY', 'YyYyYyYy', 'yYyYyYyY', 'YyYyYyYy'];
const F = paire('feuille', { parent: 'plumet', pivot: [0.6, 9.2, 0] }, { bord: false, from: [0.4, 9.2, -0.7], to: [1.9, 12.2, 0.7], rot: [0, 0, -30], pivot: [0.6, 9.2, 0], faces: { all: ['gg', 'gg', 'gG', 'GG'], up: 'g' } });
const J = paire('jambe', { parent: 'root', pivot: [1.3, 1.3, 0] }, { from: [0.5, 0, -1], to: [2.1, 1.4, 0.9], faces: { all: 'Y' } });

export default {
    name: 'ete_ananas',
    title: 'Ananas',
    palette: { ...COMMUN, y: '#ffcd45', Y: '#eaa823', g: '#63b23c', G: '#418a2b', n: { c: '#23232c' }, e: { c: '#8f96a8' }, b: '#f08d6a' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.2, 0] }, lunettes: { parent: 'corps', pivot: [0, 6.7, -3.2] }, plumet: { parent: 'corps', pivot: [0, 9.2, 0] }, ...F.bones, ...J.bones },
    cubes: [
        { name: 'fruit', bone: 'corps', from: [-2.9, 1.2, -2.9], to: [2.9, 9.2, 2.9], faces: { all: losanges, north: ['yYyYyYyY', 'YyYyYyYy', 'ykyyyyky', 'ykyyyyky', 'bbyyyybb', 'yyykkyyy', 'yYyYyYyY', 'YyYyYyYy'], up: 'Y', down: 'Y' } },
        { name: 'lunettes', bone: 'lunettes', bord: false, from: [-3.1, 5.9, -3.5], to: [3.1, 7.6, -2.9], faces: { all: 'n', north: ['nennnnen', 'nnnnnnnn'] } },
        { name: 'feuilleC', bone: 'plumet', bord: false, from: [-0.8, 9.2, -0.8], to: [0.8, 13.2, 0.8], faces: { all: ['gg', 'gg', 'gG', 'GG'], up: 'g' } },
        ...F.cubes, ...J.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde('corps', IDLE, 9, 3), pendouille(DEUX, 10), balance('plumet', [0, 0, 6], IDLE, { tours: 2 })) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 30), tient('corps', [-6, 0, 0]), balance('plumet', [10, 0, 0], WALK)) },
        interact: {
            length: 1.6, loop: false,
            bones: {
                lunettes: { position: [[0, [0, 0, 0]], [0.3, [0, -1.7, 0]], [1.1, [0, -1.7, 0]], [1.4, [0, 0, 0]]], rotation: [[0, [0, 0, 0]], [0.3, [0, 0, -6]], [1.1, [0, 0, -6]], [1.4, [0, 0, 0]]] },
                corps: { rotation: [[0, [0, 0, 0]], [0.3, [-8, 0, 6]], [1.1, [-8, 0, 6]], [1.4, [0, 0, 0]]] },
            },
        },
    },
};
