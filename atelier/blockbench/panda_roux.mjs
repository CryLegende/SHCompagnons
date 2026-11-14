// Panda roux : roux, pattes et ventre sombres, masque blanc, grosse queue annelée. Au clic il se dresse, pattes en l'air.
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, respire, regarde, tic, pendouille, pedale, flanc, paire, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 2.2, zAv: -0.9, zAr: 4.0, size: [2, 2.8, 2], faces: { all: 'd' } });
const O = paire('oreille', { parent: 'tete', pivot: [2.7, 11, -4] }, { from: [1.6, 10.6, -4.7], to: [3.9, 12.9, -3.5], rot: [0, 0, -12], pivot: [2.7, 11, -4], faces: { all: 'f', north: ['wwww', 'wffw', 'wffw', 'wffw'] } });
const anneaux = Array(8).fill('ffFFffFF');

export default {
    name: 'panda_roux',
    title: 'Panda roux',
    palette: { ...COMMUN, f: '#e2692d', F: '#b9491b', d: '#55302a', w: '#fff3e3', n: { c: '#2c1c14' }, m: { c: '#c9b9a8' } },
    bones: { ...squelette([0, 2.8, 4.6], [0, 6.5, -1.8], [0, 2.4, 1.7]), queue: { parent: 'corps', pivot: [0, 6, 5.3] }, ...O.bones, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'haut', from: [-3.25, 2.4, -2], to: [3.25, 8, 5.5], faces: { all: 'f', east: flanc('f', 'd'), west: flanc('f', 'd'), north: 'd', down: 'd' } },
        {
            name: 'tete', bone: 'tete', from: [-3.5, 5, -8.2], to: [3.5, 11.2, -1.4],
            faces: { all: 'f', down: 'w', north: visage('f', { lignes: { 0: 'fwffffwf', 4: 'wwffffww', 5: 'wwwffwww', 6: 'wwwwwwww', 7: 'wwwwwwww' } }) },
        },
        { name: 'museau', bone: 'tete', from: [-1.7, 5.4, -9.2], to: [1.7, 7.7, -8.0], faces: { all: 'w', north: ['wwwnnwww', 'wwwnnwww', 'wwwwwwww', 'wwwmmwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'], up: ['wwwnnwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'] } },
        ...O.cubes,
        { name: 'queue', bone: 'queue', from: [-1.5, 4.6, 5.3], to: [1.5, 7.6, 11], rot: [14, 0, 0], pivot: [0, 6, 5.3], faces: { all: 'f', east: anneaux, west: anneaux, up: ['ffffffff', 'ffffffff', 'FFFFFFFF', 'FFFFFFFF', 'ffffffff', 'ffffffff', 'FFFFFFFF', 'FFFFFFFF'], down: ['FFFFFFFF', 'FFFFFFFF', 'ffffffff', 'ffffffff', 'FFFFFFFF', 'FFFFFFFF', 'ffffffff', 'ffffffff'], south: 'd' } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire(), regarde(), balance('queue', [0, 12, 0], IDLE, { tours: 2 }), tic('oreilleD', [0, 0, -16], 2.6), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(), tient('corps', [-5, 0, 0]), balance('queue', [0, 16, 0], WALK)) },
        interact: {
            length: 1.6, loop: false,
            bones: {
                root: { rotation: [[0, [0, 0, 0]], [0.3, [48, 0, 0]], [1.2, [48, 0, 0]], [1.5, [0, 0, 0]]], position: [[0, [0, 0, 0]], [0.3, [0, 1.5, 1]], [1.2, [0, 1.5, 1]], [1.5, [0, 0, 0]]] },
                tete: { rotation: [[0, [0, 0, 0]], [0.3, [-40, 0, 0]], [1.2, [-40, 0, 0]], [1.5, [0, 0, 0]]] },
                patteAvD: { rotation: [[0, [0, 0, 0]], [0.3, [60, 0, 38]], [0.55, [60, 0, 50]], [0.8, [60, 0, 38]], [1.05, [60, 0, 50]], [1.2, [60, 0, 38]], [1.5, [0, 0, 0]]] },
                patteAvG: { rotation: [[0, [0, 0, 0]], [0.3, [60, 0, -38]], [0.55, [60, 0, -50]], [0.8, [60, 0, -38]], [1.05, [60, 0, -50]], [1.2, [60, 0, -38]], [1.5, [0, 0, 0]]] },
            },
        },
    },
};
