// Shiba : roux aux joues crème, oreilles dressées, queue enroulée sur le dos. Au clic il saute de joie en remuant la queue.
import { COMMUN, IDLE, WALK, JOIE, visage, mix, balance, tient, respire, regarde, tic, pendouille, pedale, joie, flanc, paire, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 2.2, zAv: -0.9, zAr: 4.2, size: [2, 2.9, 2], faces: { all: ['ff', 'ff', 'ww', 'ww'], down: 'w' } });
const O = paire('oreille', { parent: 'tete', pivot: [2.6, 11, -4] }, { from: [1.7, 10.8, -4.6], to: [3.5, 13.1, -3.4], rot: [0, 0, -8], pivot: [2.6, 11, -4], faces: { all: 'F', north: ['ffff', 'fwwf', 'fwwf', 'fwwf'], up: 'f' } });
const joueE = ['ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'fffffwww', 'ffffwwww', 'ffffwwww', 'ffffwwww'];

export default {
    name: 'shiba',
    title: 'Shiba',
    palette: { ...COMMUN, f: '#eba350', F: '#cf8437', w: '#fdecd2', n: { c: '#3a2a22' }, d: { c: '#b98b62' } },
    bones: { ...squelette([0, 2.8, 1.7], [0, 6.5, -1.8], [0, 2.4, 1.7]), queue: { parent: 'corps', pivot: [0, 7.8, 5] }, ...O.bones, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'haut', from: [-3.25, 2.4, -2], to: [3.25, 8, 5.5], faces: { all: 'f', east: flanc('f', 'w'), west: flanc('f', 'w'), north: 'w', down: 'w' } },
        {
            name: 'tete', bone: 'tete', from: [-3.5, 5, -8.2], to: [3.5, 11.2, -1.4],
            faces: {
                all: 'f', east: joueE, west: joueE.map((r) => [...r].reverse().join('')), down: 'w',
                north: visage('f', { lignes: { 0: 'fwffffwf', 3: 'bbwwwwbb', 4: 'wwwwwwww', 5: 'wwwwwwww', 6: 'wwwwwwww', 7: 'wwwwwwww' } }),
            },
        },
        { name: 'museau', bone: 'tete', from: [-1.8, 5.4, -9.4], to: [1.8, 7.9, -8.0], faces: { all: 'w', north: ['wwwnnwww', 'wwwnnwww', 'wwwwwwww', 'wwwddwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'], up: ['wwwnnwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'] } },
        ...O.cubes,
        { name: 'queue', bone: 'queue', from: [-1.1, 7.6, 4.2], to: [1.1, 10.3, 6.4], faces: { all: 'f', up: 'w', south: ['wwww', 'wwww', 'ffff', 'ffff'] } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire(), regarde(), balance('queue', [0, 0, 10], IDLE, { tours: 3 }), tic('oreilleD', [0, 0, -18], 2.6), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(), tient('corps', [-5, 0, 0]), balance('queue', [0, 0, 22], WALK)) },
        interact: { length: JOIE, loop: false, bones: mix(joie('root'), balance('queue', [0, 0, 32], JOIE, { tours: 5 }), { tete: { rotation: [[0, [0, 0, 0]], [0.3, [12, 0, 0]], [0.75, [0, 0, 0]], [1.0, [0, 0, 12]], [1.4, [0, 0, 0]]] } }) },
    },
};
