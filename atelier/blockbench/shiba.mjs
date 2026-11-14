// Shiba : il ne lâche jamais son bâton, bien trop large pour lui. Roux aux joues crème, bandana rouge noué au cou,
// queue enroulée sur le dos. Au clic il fait la révérence du jeu, queue en folie, et secoue son bâton.
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, respire, regarde, tic, pendouille, pedale, flanc, paire, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 2.2, zAv: -0.9, zAr: 4.2, size: [2, 2.9, 2], faces: { all: ['ff', 'ff', 'ww', 'ww'], down: 'w' } });
const O = paire('oreille', { parent: 'tete', pivot: [2.6, 11, -4] }, { from: [1.7, 10.8, -4.6], to: [3.5, 13.1, -3.4], rot: [0, 0, -8], pivot: [2.6, 11, -4], faces: { all: 'F', north: ['ffff', 'fwwf', 'fwwf', 'fwwf'], up: 'f' } });
const joueE = ['ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'fffffwww', 'ffffwwww', 'ffffwwww', 'ffffwwww'];

export default {
    name: 'shiba',
    title: 'Shiba',
    palette: { ...COMMUN, f: '#eba350', F: '#cf8437', w: '#fdecd2', n: { c: '#3a2a22' }, d: { c: '#b98b62' }, t: '#9a6a3c', T: '#c9995e', r: '#e2483f', R: { c: '#b9322d' } },
    bones: { ...squelette([0, 2.8, 1.7], [0, 6.5, -1.8], [0, 2.4, 1.7]), queue: { parent: 'corps', pivot: [0, 7.8, 5] }, baton: { parent: 'tete', pivot: [0, 6.2, -9.4] }, ...O.bones, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'haut', from: [-3.25, 2.4, -2], to: [3.25, 8, 5.5], faces: { all: 'f', east: flanc('f', 'w'), west: flanc('f', 'w'), north: 'w', down: 'w' } },
        {
            name: 'tete', bone: 'tete', from: [-3.5, 5, -8.2], to: [3.5, 11.2, -1.4],
            faces: {
                all: 'f', east: joueE, west: joueE.map((r) => [...r].reverse().join('')), down: 'w',
                north: visage('f', { lignes: { 0: 'fwffffwf', 3: 'bbwwwwbb', 4: 'wwwwwwww', 5: 'wwwwwwww', 6: 'wwwwwwww', 7: 'wwwwwwww' } }),
            },
        },
        { name: 'museau', bone: 'tete', from: [-1.8, 5.4, -9.4], to: [1.8, 7.9, -8.0], faces: { all: 'w', north: ['wwwnnwww', 'wwwnnwww', 'wwwwwwww', 'wwwwwwww'], up: ['wwwnnwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'] } },
        { name: 'baton', bone: 'baton', bord: false, from: [-5.2, 5.5, -10.1], to: [5.2, 6.5, -9.2], rot: [0, 0, 7], pivot: [0, 6, -9.6], faces: { all: 't', east: 'T', west: 'T', north: ['ttttTttt'], up: ['tttttTtt'] } },
        { name: 'bandana', bone: 'corps', bord: false, from: [-1.7, 3.2, -2.7], to: [1.7, 5.4, -2.1], rot: [0, 0, 45], pivot: [0, 4.4, -2.4], faces: { all: 'r', north: ['rrrR', 'rrRr', 'rRrr', 'Rrrr'] } },
        ...O.cubes,
        { name: 'queue', bone: 'queue', from: [-1.1, 7.6, 4.2], to: [1.1, 10.3, 6.4], faces: { all: 'f', up: 'w', south: ['wwww', 'wwww', 'ffff', 'ffff'] } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire(), regarde(), balance('queue', [0, 0, 10], IDLE, { tours: 3 }), tic('oreilleD', [0, 0, -18], 2.6), tic('baton', [0, 0, -9], 4.2), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(), tient('corps', [-5, 0, 0]), balance('queue', [0, 0, 22], WALK), balance('baton', [0, 0, 5], WALK)) },
        interact: {
            length: 1.6, loop: false,
            bones: mix(balance('queue', [0, 0, 34], 1.6, { tours: 6 }), {
                corps: { rotation: [[0, [0, 0, 0]], [0.25, [-20, 0, 0]], [1.1, [-20, 0, 0]], [1.4, [0, 0, 0]]] },
                patteAvD: { rotation: [[0, [0, 0, 0]], [0.25, [55, 0, 0]], [1.1, [55, 0, 0]], [1.4, [0, 0, 0]]] }, patteAvG: { rotation: [[0, [0, 0, 0]], [0.25, [55, 0, 0]], [1.1, [55, 0, 0]], [1.4, [0, 0, 0]]] },
                tete: { rotation: [[0, [0, 0, 0]], [0.25, [18, 0, 0]], [0.45, [18, 0, 14]], [0.65, [18, 0, -14]], [0.85, [18, 0, 14]], [1.1, [18, 0, 0]], [1.4, [0, 0, 0]]] },
            }),
        },
    },
};
