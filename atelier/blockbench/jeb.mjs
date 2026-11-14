// Jeb le mouton : arc-en-ciel à cause de l'étiquette de nom qui pend à son oreille. Laine en anneaux pastel, toupet et
// toison assortis. Au clic il bondit en vrille, l'étiquette au vent.
import { COMMUN, IDLE, WALK, TOUR, visage, mix, balance, tient, respire, regarde, tic, pendouille, pedale, vrille, paire, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 2.3, zAv: -0.9, zAr: 4.1, size: [1.9, 3, 1.9], faces: { all: ['ss', 'ss', 'ss', 'hh'], down: 'h' } });
const O = paire('oreille', { parent: 'tete', pivot: [2.6, 9, -5] }, { from: [2.6, 8.3, -5.7], to: [4.3, 9.3, -4.4], rot: [0, 0, -18], pivot: [2.6, 9, -5], faces: { all: 's', north: ['spps', 'spps'] } });
const ARC = 'roygcuvp';
const anneaux = [...ARC].map((c) => c.repeat(8));

export default {
    name: 'jeb',
    title: 'Jeb le mouton',
    palette: { ...COMMUN, r: '#ff9a9a', o: '#ffbd80', y: '#ffe682', g: '#aee893', c: '#96e3e1', u: '#98baf6', v: '#bca3f2', p: '#f6a9d9', s: '#f4dfca', h: '#8d7360', e: '#eedcae', t: { c: '#6a4a36' } },
    bones: { ...squelette([0, 3.2, 1.6], [0, 7, -2.4], [0, 2.8, 1.6]), etiquette: { parent: 'tete', pivot: [3.6, 8.4, -5.3], rot: [0, 0, 14] }, ...O.bones, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: false, from: [-3.6, 2.8, -2.4], to: [3.6, 9, 5.6], faces: { west: Array(8).fill(ARC), east: Array(8).fill([...ARC].reverse().join('')), up: anneaux, down: anneaux.slice().reverse(), north: 'r', south: 'p' } },
        { name: 'tete', bone: 'tete', from: [-2.6, 5.4, -7.4], to: [2.6, 10.6, -2.2], faces: { all: 's', north: visage('s', { ligne: 2 }) } },
        { name: 'toupet', bone: 'tete', bord: false, from: [-2.9, 9.6, -7.1], to: [2.9, 11.7, -2.5], faces: { west: Array(4).fill('rycv'), east: Array(4).fill('vcyr'), up: ['rrrr', 'yyyy', 'cccc', 'vvvv'], down: ['vvvv', 'cccc', 'yyyy', 'rrrr'], north: 'r', south: 'v' } },
        { name: 'toison', bone: 'ventre', bord: false, from: [-2.7, 9, -0.9], to: [2.7, 10.3, 4.1], faces: { west: Array(4).fill('ygcu'), east: Array(4).fill('ucgy'), up: ['yyyy', 'gggg', 'cccc', 'uuuu'], down: ['uuuu', 'cccc', 'gggg', 'yyyy'], north: 'y', south: 'u' } },
        { name: 'etiquette', bone: 'etiquette', bord: false, from: [2.9, 5.6, -5.6], to: [4.4, 8.3, -5.1], faces: { all: 'e', north: ['eeee', 'ette', 'eeee', 'ette'], south: ['eeee', 'ette', 'eeee', 'ette'] } },
        ...O.cubes,
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(), tic('oreilleD', [0, 0, -22], 2.6), balance('etiquette', [0, 0, 8], IDLE, { tours: 3 }), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(), tient('corps', [-5, 0, 0]), balance('etiquette', [18, 0, 0], WALK)) },
        interact: { length: TOUR, loop: false, bones: vrille('root', 3.2) },
    },
};
