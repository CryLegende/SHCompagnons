// Ananas de l'été : il se prend pour un cocktail. Lunettes de soleil, petite ombrelle en papier plantée de travers
// qui tourne, paille rayée. Au clic il baisse ses lunettes pour vous regarder et l'ombrelle s'emballe.
import { COMMUN, IDLE, WALK, DEUX, mix, balance, tient, regarde, pendouille, pedale, paire } from './_style.mjs';

const losanges = ['yYyYyYyY', 'YyYyYyYy', 'yYyYyYyY', 'YyYyYyYy', 'yYyYyYyY', 'YyYyYyYy', 'yYyYyYyY', 'YyYyYyYy'];
const F = paire('feuille', { parent: 'plumet', pivot: [0.6, 9.2, 0] }, { bord: false, from: [0.4, 9.2, -0.7], to: [1.9, 12.2, 0.7], rot: [0, 0, -30], pivot: [0.6, 9.2, 0], faces: { all: ['gg', 'gg', 'gG', 'GG'], up: 'g' } });
const J = paire('jambe', { parent: 'root', pivot: [1.3, 1.3, 0] }, { from: [0.5, 0, -1], to: [2.1, 1.4, 0.9], faces: { all: 'Y' } });
const quartiers = ['ppppwwww', 'ppppwwww', 'ppppwwww', 'ppppwwww', 'wwwwpppp', 'wwwwpppp', 'wwwwpppp', 'wwwwpppp'];

export default {
    name: 'ete_ananas',
    title: 'Ananas',
    palette: { ...COMMUN, y: '#ffcd45', Y: '#eaa823', g: '#63b23c', G: '#418a2b', n: { c: '#23232c' }, e: { c: '#8f96a8' }, b: '#f08d6a', p: '#ff7fa8', w: '#fff6ec', t: '#c9a36a', r: '#e2483f' },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.2, 0] }, lunettes: { parent: 'corps', pivot: [0, 6.7, -3.2] }, plumet: { parent: 'corps', pivot: [0, 9.2, 0] }, ...F.bones, ...J.bones,
        ombrelle: { parent: 'corps', pivot: [2, 9.2, 1.9], rot: [-16, 0, -28] }, toile: { parent: 'ombrelle', pivot: [2, 13.8, 1.9] }, paille: { parent: 'corps', pivot: [-2, 9.2, -1.7], rot: [10, 0, 22] },
    },
    cubes: [
        { name: 'fruit', bone: 'corps', from: [-2.9, 1.2, -2.9], to: [2.9, 9.2, 2.9], faces: { all: losanges, north: ['yYyYyYyY', 'YyYyYyYy', 'ykyyyyky', 'ykyyyyky', 'bbyyyybb', 'yyykkyyy', 'yYyYyYyY', 'YyYyYyYy'], up: 'Y', down: 'Y' } },
        { name: 'lunettes', bone: 'lunettes', bord: false, from: [-3.1, 5.9, -3.5], to: [3.1, 7.6, -2.9], faces: { all: 'n', north: ['nennnnen', 'nnnnnnnn'] } },
        { name: 'feuilleC', bone: 'plumet', bord: false, from: [-0.8, 9.2, -0.8], to: [0.8, 13.2, 0.8], faces: { all: ['gg', 'gg', 'gG', 'GG'], up: 'g' } },
        ...F.cubes, ...J.cubes,
        { name: 'manche', bone: 'ombrelle', bord: false, from: [1.7, 9.2, 1.6], to: [2.3, 13.6, 2.2], faces: { all: 't' } },
        { name: 'toile', bone: 'toile', bord: 'bas', from: [-0.6, 13.4, -0.7], to: [4.6, 14.3, 4.5], faces: { all: ['ppwwppww'], up: quartiers, down: 'p' } },
        { name: 'paille', bone: 'paille', bord: false, from: [-2.3, 9.2, -2], to: [-1.7, 12.8, -1.4], faces: { all: ['r', 'w', 'r', 'w', 'r', 'w', 'r', 'w'], up: 'r' } },
        { name: 'coude', bone: 'paille', bord: false, from: [-3.6, 12.2, -2], to: [-2.3, 12.8, -1.4], faces: { all: ['wr'], west: 'w', east: 'r' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde('corps', IDLE, 9, 3), pendouille(DEUX, 10), balance('plumet', [0, 0, 6], IDLE, { tours: 2 }), { toile: { rotation: [[0, [0, 0, 0]], [2, [0, 120, 0]], [4, [0, 240, 0]], [6, [0, 360, 0]]] } }) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 30), tient('corps', [-6, 0, 0]), balance('plumet', [10, 0, 0], WALK), balance('ombrelle', [6, 0, 0], WALK)) },
        interact: {
            length: 1.6, loop: false,
            bones: {
                lunettes: { position: [[0, [0, 0, 0]], [0.3, [0, -1.7, 0]], [1.1, [0, -1.7, 0]], [1.4, [0, 0, 0]]], rotation: [[0, [0, 0, 0]], [0.3, [0, 0, -6]], [1.1, [0, 0, -6]], [1.4, [0, 0, 0]]] },
                corps: { rotation: [[0, [0, 0, 0]], [0.3, [-8, 0, 6]], [1.1, [-8, 0, 6]], [1.4, [0, 0, 0]]] },
                toile: { rotation: [[0, [0, 0, 0]], [0.25, [0, 120, 0]], [0.5, [0, 240, 0]], [0.75, [0, 360, 0]], [1, [0, 480, 0]], [1.25, [0, 600, 0]], [1.5, [0, 720, 0]]] },
            },
        },
    },
};
