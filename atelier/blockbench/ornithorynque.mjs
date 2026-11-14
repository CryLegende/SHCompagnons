// Ornithorynque : le plongeur. Masque sur les yeux, tuba de travers, palmes jaunes aux pattes arrière, bec plat, queue de castor.
// Au clic il prend une grande inspiration, plonge la tête la première en battant des palmes, remonte d'un bond et
// s'ébroue pour se sécher.
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, respire, regarde, pendouille, pedale, flanc, pattes4, squelette } from './_style.mjs';

const z = [0, 0, 0];
const palmes = (k) => ({ rotation: [[0.45, z], [0.55 + k * 0.05, [-40, 0, 0]], [0.7 + k * 0.05, [30, 0, 0]], [0.85 + k * 0.05, [-40, 0, 0]], [1.0 + k * 0.05, [30, 0, 0]], [1.15 + k * 0.05, [-20, 0, 0]], [1.35, z]] });
const P = pattes4({ x: 2.7, zAv: -1.3, zAr: 3.8, size: [2, 2, 2.6], faces: { all: 'n', up: 'f' } });
const palme = (name, bone, s) => ({ name, bone, bord: false, from: [Math.min(s * 1.5, s * 4.1), 0, 4.6], to: [Math.max(s * 1.5, s * 4.1), 0.5, 7.4], faces: { all: 'y', up: ['yoyoyoyo'], down: 'o' } });

export default {
    name: 'ornithorynque',
    title: 'Ornithorynque',
    palette: { ...COMMUN, f: '#94694a', F: '#754e34', w: '#cfa77e', n: '#565060', N: { c: '#3a3542' }, u: '#3f8fd9', c: { c: '#cfeeff' }, y: '#ffd23f', o: '#f7862e', B: { c: '#eaf7ff' } },
    bones: { ...squelette([0, 2.6, 1.2], [0, 5, -2.4], [0, 2.2, 1.2]), queue: { parent: 'corps', pivot: [0, 3.8, 5] }, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'haut', from: [-3, 2.2, -2.5], to: [3, 6.8, 5], faces: { all: 'f', east: flanc('f', 'w'), west: flanc('f', 'w'), down: 'w' } },
        { name: 'tete', bone: 'tete', from: [-2.9, 3.6, -7.6], to: [2.9, 8.6, -2.2], faces: { all: 'f', north: visage('f'), down: 'w' } },
        { name: 'masque', bone: 'tete', bord: false, from: [-3.1, 6.75, -8.1], to: [3.1, 8.5, -7.5], faces: { all: 'u', north: ['uuuuuuuu', 'ukccccku', 'ukccccku', 'uuuuuuuu'] } },
        { name: 'tuba', bone: 'tete', bord: false, from: [3.1, 6.4, -6.4], to: [3.8, 11.9, -5.7], rot: [0, 0, -12], pivot: [3.4, 6.6, -6], faces: { all: ['o', 'y', 'y', 'y', 'y', 'y', 'y', 'y'], up: 'o' } },
        palme('palmeD', 'patteArD', 1), palme('palmeG', 'patteArG', -1),
        { name: 'bec', bone: 'tete', from: [-2.2, 4.2, -10.2], to: [2.2, 5.6, -7.6], faces: { all: 'n', up: ['nnnnnnnn', 'nnNnnNnn', 'nnnnnnnn', 'nnnnnnnn'] } },
        { name: 'queue', bone: 'queue', from: [-1.9, 3.2, 4.8], to: [1.9, 4.4, 9.6], faces: { all: 'F', up: ['FfFfFfFf', 'fFfFfFfF', 'FfFfFfFf', 'fFfFfFfF', 'FfFfFfFf', 'fFfFfFfF', 'FfFfFfFf', 'fFfFfFfF'] } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire(), regarde(), balance('queue', [6, 0, 0], IDLE, { tours: 3 }), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(), tient('corps', [-5, 0, 0]), balance('queue', [0, 14, 0], WALK)) },
        interact: {
            length: 2.1, loop: false,
            bones: {
                ventre: { scale: [[0, [1, 1, 1]], [0.3, [1.1, 1.12, 1.06]], [0.45, [1, 1, 1]]] },
                tete: { rotation: [[0, z], [0.3, [14, 0, 0]], [0.45, [-6, 0, 0]], [1.2, [-6, 0, 0]], [1.35, [10, 0, 0]], [1.5, z], [1.6, [0, 0, -12]], [1.7, [0, 0, 12]], [1.8, [0, 0, -10]], [1.9, [0, 0, 8]], [2.0, z]] },
                root: {
                    rotation: [[0, z], [0.3, [6, 0, 0]], [0.5, [-70, 0, 0]], [0.7, [-70, 14, 0]], [0.85, [-70, -14, 0]], [1.0, [-70, 14, 0]], [1.15, [-70, 0, 0]], [1.35, [12, 0, 0]], [1.5, z]],
                    position: [[0, z], [0.3, [0, 0.6, 0]], [0.5, [0, 0.5, -1]], [1.15, [0, -0.5, -1]], [1.35, [0, 2.2, 0]], [1.5, z]],
                },
                corps: { rotation: [[1.5, z], [1.6, [0, 0, 14]], [1.7, [0, 0, -14]], [1.8, [0, 0, 12]], [1.9, [0, 0, -10]], [2.0, [0, 0, 4]], [2.1, z]] },
                queue: { rotation: [[0.45, z], [0.55, [26, 0, 0]], [0.65, [-18, 0, 0]], [0.75, [26, 0, 0]], [0.85, [-18, 0, 0]], [0.95, [26, 0, 0]], [1.05, [-18, 0, 0]], [1.15, z]] },
                patteArD: palmes(0), patteArG: palmes(1),
                patteAvD: { rotation: [[0.3, z], [0.5, [70, 0, 0]], [1.15, [70, 0, 0]], [1.35, z]] },
                patteAvG: { rotation: [[0.3, z], [0.5, [70, 0, 0]], [1.15, [70, 0, 0]], [1.35, z]] },
            },
        },
    },
};
