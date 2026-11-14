// Teckel : déguisé en hot-dog. Un demi-pain de chaque côté, un zigzag de moutarde sur le dos, grandes oreilles
// tombantes. Au clic la saucisse s'étire comme un accordéon.
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, respire, regarde, tic, pendouille, pedale, paire, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 1.9, zAv: -1.5, zAr: 6.6, size: [1.8, 2.3, 1.8], faces: { all: ['ff', 'ff', 'ww', 'ww'], down: 'w' } });
const O = paire('oreille', { parent: 'tete', pivot: [3.1, 9.9, -4.4] }, { from: [2.7, 6.2, -5.7], to: [3.8, 10.1, -3.1], rot: [0, 0, 6], pivot: [3.1, 9.9, -4.4], faces: { all: 'F' } });
const B = paire('pain', { parent: 'ventre', pivot: [3.4, 4.4, 2.5] }, { from: [2.75, 2.5, -2.2], to: [4.4, 6.3, 7.2], faces: { all: 'p', east: ['PPPPPPPP', 'pppppppp', 'pppppppp', 'pppppppp'], up: 'P' } });
const etire = (z) => ({ position: [[0, [0, 0, 0]], [0.4, [0, 0, z]], [0.7, [0, 0, -z * 0.4]], [1.0, [0, 0, z * 0.7]], [1.3, [0, 0, 0]]] });

export default {
    name: 'teckel',
    title: 'Teckel',
    palette: { ...COMMUN, f: '#a65c3c', F: '#84452b', w: '#dfa96d', n: { c: '#2c1c14' }, d: { c: '#a87a4b' }, p: '#eebb6c', P: '#f6d391', m: { c: '#ffd22e' } },
    bones: { ...squelette([0, 2.6, 2.5], [0, 6.4, -2.8], [0, 4.6, 2.5]), queue: { parent: 'corps', pivot: [0, 6.6, 8] }, ...O.bones, ...B.bones, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-2.75, 2.2, -3], to: [2.75, 7, 8], faces: { all: 'f', up: ['ffmmffff', 'fffmmfff', 'ffffmmff', 'fffmmfff', 'ffmmffff', 'fffmmfff', 'ffffmmff', 'fffmmfff'], down: 'w' } },
        ...B.cubes,
        { name: 'tete', bone: 'tete', from: [-2.9, 5, -8.6], to: [2.9, 10.2, -2.6], faces: { all: 'f', north: visage('f', { lignes: { 0: 'fwffffwf' } }), down: 'w' } },
        { name: 'museau', bone: 'tete', from: [-1.5, 5.2, -11.1], to: [1.5, 7.6, -8.6], faces: { all: 'w', north: ['wwnnnnww', 'wwnnnnww', 'wwwwwwww', 'wwwddwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'], up: ['wwnnnnww', 'wwwwwwww', 'ffffffff', 'ffffffff'] } },
        ...O.cubes,
        { name: 'queue', bone: 'queue', from: [-0.5, 6.1, 7.8], to: [0.5, 7.1, 10.6], rot: [38, 0, 0], pivot: [0, 6.6, 8], faces: { all: 'F' } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.03), regarde(), balance('queue', [0, 14, 0], IDLE, { tours: 3 }), tic('oreilleG', [0, 0, 22], 2.6), pendouille(undefined, 8)) },
        walk: { length: WALK, bones: mix(pedale(undefined, 30), tient('corps', [-4, 0, 0]), balance('queue', [0, 26, 0], WALK), balance('oreilleD', [0, 0, 10], WALK), balance('oreilleG', [0, 0, 10], WALK)) },
        interact: {
            length: 1.6, loop: false,
            bones: mix(balance('queue', [0, 30, 0], 1.6, { tours: 6 }), {
                ventre: { scale: [[0, [1, 1, 1]], [0.4, [0.96, 0.96, 1.24]], [0.7, [1.03, 1.03, 0.9]], [1.0, [0.97, 0.97, 1.17]], [1.3, [1, 1, 1]]] },
                tete: { ...etire(-1.4), rotation: [[0, [0, 0, 0]], [0.4, [10, 0, 0]], [0.7, [-4, 0, 0]], [1.0, [8, 0, 0]], [1.3, [0, 0, 0]]] },
                patteArD: etire(1.2), patteArG: etire(1.2), queue: etire(1.3), patteAvD: etire(-1.2), patteAvG: etire(-1.2),
            }),
        },
    },
};
