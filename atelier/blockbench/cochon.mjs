// Cochon : rose, groin en relief, oreilles rabattues, queue en tire-bouchon. Au clic il fait un tonneau.
import { COMMUN, IDLE, WALK, TOUR, visage, mix, balance, tient, respire, regarde, tic, pendouille, pedale, tonneau, flanc, paire, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 2.2, zAv: -0.9, zAr: 4.2, size: [2, 2.7, 2], faces: { all: ['ff', 'ff', 'ff', 'tt'], down: 't' } });
const O = paire('oreille', { parent: 'tete', pivot: [2.7, 10.9, -6.2] }, { from: [1.5, 10.2, -7.5], to: [4.0, 12.6, -6.4], rot: [-38, 0, -20], pivot: [2.7, 10.9, -6.2], faces: { all: 'F', north: 'f' } });

export default {
    name: 'cochon',
    title: 'Cochon',
    palette: { ...COMMUN, f: '#f6adb5', F: '#e58f9c', w: '#fbcfd0', t: '#b9606f', n: '#ec93a1', N: { c: '#b4566a' }, b: '#ee7f8f' },
    bones: { ...squelette([0, 2.8, 1.7], [0, 6.5, -1.8], [0, 2.4, 1.7]), queue: { parent: 'corps', pivot: [0, 7, 5.5] }, ...O.bones, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'haut', from: [-3.25, 2.4, -2], to: [3.25, 8, 5.5], faces: { all: 'f', east: flanc('f', 'w'), west: flanc('f', 'w'), down: 'w' } },
        { name: 'tete', bone: 'tete', from: [-3.5, 5, -8.2], to: [3.5, 11.2, -1.4], faces: { all: 'f', north: visage('f') } },
        { name: 'groin', bone: 'tete', from: [-2, 5.4, -9.2], to: [2, 8, -8.0], faces: { all: 'n', north: ['nnnnnnnn', 'nnnnnnnn', 'nnNnnNnn', 'nnNnnNnn', 'nnNnnNnn', 'nnnnnnnn', 'nnnnnnnn', 'nnnnnnnn'] } },
        ...O.cubes,
        { name: 'queue', bone: 'queue', from: [-0.7, 6.3, 5.3], to: [0.7, 7.7, 6.7], rot: [0, 0, 45], pivot: [0, 7, 6], faces: { all: 'F' } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire(), regarde(), tic('queue', [0, 30, 0], 2.6), tic('oreilleG', [-20, 0, 0], 4.4), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(), tient('corps', [-5, 0, 0]), balance('queue', [0, 28, 0], WALK)) },
        interact: { length: TOUR, loop: false, bones: tonneau() },
    },
};
