// Panda roux : il dort tout le temps. Yeux fermés, bonnet de nuit au pompon qui pend, « z » qui s'envolent.
// Au clic il se réveille en sursaut et se dresse, pattes en l'air, puis se rendort.
import { COMMUN, IDLE, WALK, mix, balance, tient, respire, tic, flotte, pendouille, pedale, flanc, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 2.2, zAv: -0.9, zAr: 4.0, size: [2, 2.8, 2], faces: { all: 'd' } });
const anneaux = Array(8).fill('ffFFffFF');
const dort = ['fwffffwf', 'ffffffff', 'fkkffkkf', 'bbffffbb', 'wwffffww', 'wwwffwww', 'wwwwwwww', 'wwwwwwww'];

export default {
    name: 'panda_roux',
    title: 'Panda roux',
    palette: { ...COMMUN, f: '#e2692d', F: '#b9491b', d: '#55302a', w: '#fff3e3', n: { c: '#2c1c14' }, m: { c: '#c9b9a8' }, u: '#6f8fd9', U: '#9db4ea', z: { c: '#eaf2ff' } },
    bones: {
        ...squelette([0, 2.8, 4.6], [0, 6.5, -1.8], [0, 2.4, 1.7]), queue: { parent: 'corps', pivot: [0, 6, 5.3] },
        bonnet: { parent: 'tete', pivot: [0, 11.2, -4.6] }, pompon: { parent: 'bonnet', pivot: [3.4, 12.4, -4.6] },
        z1: { parent: 'root', pivot: [-4, 13.6, -6] }, ...P.bones,
    },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'haut', from: [-3.25, 2.4, -2], to: [3.25, 8, 5.5], faces: { all: 'f', east: flanc('f', 'd'), west: flanc('f', 'd'), north: 'd', down: 'd' } },
        { name: 'tete', bone: 'tete', from: [-3.5, 5, -8.2], to: [3.5, 11.2, -1.4], faces: { all: 'f', down: 'w', north: dort } },
        { name: 'museau', bone: 'tete', from: [-1.7, 5.4, -9.2], to: [1.7, 7.7, -8.0], faces: { all: 'w', north: ['wwwnnwww', 'wwwnnwww', 'wwwwwwww', 'wwwmmwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'], up: ['wwwnnwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'] } },
        { name: 'bonnet', bone: 'bonnet', from: [-3.8, 10.6, -8.5], to: [3.8, 12.6, -1.6], faces: { all: ['uuUUuuUU', 'uuUUuuUU', 'wwwwwwww', 'wwwwwwww'], up: ['uuUUuuUU'] } },
        { name: 'pointe', bone: 'pompon', bord: false, from: [2.4, 11.4, -5.4], to: [6, 13, -3.8], rot: [0, 0, -32], pivot: [3.4, 12.4, -4.6], faces: { all: ['uUuU'] } },
        { name: 'pompon', bone: 'pompon', from: [5.0, 9.5, -5.5], to: [6.8, 11.3, -3.7], faces: { all: 'w' } },
        { name: 'queue', bone: 'queue', from: [-1.5, 4.6, 5.3], to: [1.5, 7.6, 11], rot: [14, 0, 0], pivot: [0, 6, 5.3], faces: { all: 'f', east: anneaux, west: anneaux, up: ['ffffffff', 'ffffffff', 'FFFFFFFF', 'FFFFFFFF', 'ffffffff', 'ffffffff', 'FFFFFFFF', 'FFFFFFFF'], down: ['FFFFFFFF', 'FFFFFFFF', 'ffffffff', 'ffffffff', 'FFFFFFFF', 'FFFFFFFF', 'ffffffff', 'ffffffff'], south: 'd' } },
        { name: 'z1', bone: 'z1', bord: false, from: [-4.7, 12.9, -6.3], to: [-3.3, 14.3, -5.7], rot: [0, 0, 12], pivot: [-4, 13.6, -6], faces: { all: 'z' } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.06), { tete: { rotation: [[0, [6, 0, 4]], [1.5, [10, 0, 4]], [3, [6, 0, 4]], [4.5, [10, 0, 4]], [6, [6, 0, 4]]] } }, balance('pompon', [0, 0, 6], IDLE, { tours: 2 }), flotte('z1', 3.4, IDLE / 2, 0, -1.4), tic('queue', [0, 14, 0], 4), pendouille(undefined, 4)) },
        walk: { length: WALK, bones: mix(pedale(undefined, 16), tient('corps', [-4, 0, 0]), tient('tete', [8, 0, 5]), balance('pompon', [0, 0, 14], WALK), balance('queue', [0, 10, 0], WALK)) },
        interact: {
            length: 1.8, loop: false,
            bones: {
                root: { rotation: [[0, [0, 0, 0]], [0.2, [48, 0, 0]], [1.2, [48, 0, 0]], [1.6, [0, 0, 0]]], position: [[0, [0, 0, 0]], [0.12, [0, 2.4, 0]], [0.25, [0, 1.5, 1]], [1.2, [0, 1.5, 1]], [1.6, [0, 0, 0]]] },
                tete: { rotation: [[0, [6, 0, 4]], [0.2, [-40, 0, 0]], [1.2, [-40, 0, 0]], [1.6, [6, 0, 4]]] },
                patteAvD: { rotation: [[0, [0, 0, 0]], [0.2, [60, 0, 38]], [0.45, [60, 0, 52]], [0.7, [60, 0, 38]], [0.95, [60, 0, 52]], [1.2, [60, 0, 38]], [1.6, [0, 0, 0]]] },
                patteAvG: { rotation: [[0, [0, 0, 0]], [0.2, [60, 0, -38]], [0.45, [60, 0, -52]], [0.7, [60, 0, -38]], [0.95, [60, 0, -52]], [1.2, [60, 0, -38]], [1.6, [0, 0, 0]]] },
                pompon: { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 70]], [0.6, [0, 0, 20]], [1.2, [0, 0, 30]], [1.6, [0, 0, 0]]] },
                z1: { scale: [[0, [1, 1, 1]], [0.15, [0.05, 0.05, 0.05]], [1.5, [0.05, 0.05, 0.05]], [1.8, [1, 1, 1]]] },
            },
        },
    },
};
