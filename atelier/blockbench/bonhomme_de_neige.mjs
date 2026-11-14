// Bonhomme de neige : il fond doucement et fait comme si de rien n'était. Seau de travers sur la tête, nez en carotte,
// écharpe, bras en brindilles, une flaque sous lui et des gouttes qui tombent. Au clic sa tête glisse, il la rattrape et la remet.
import { COMMUN, IDLE, WALK, frimousse, mix, balance, tient, regarde, tic, flotte, paire } from './_style.mjs';

const B = paire('bras', { parent: 'corps', pivot: [3.3, 4.4, 0], rot: [0, 0, 28] }, { bord: false, from: [3.3, 4, -0.4], to: [6.7, 4.7, 0.4], faces: { all: 'm' } });

export default {
    name: 'bonhomme_de_neige',
    title: 'Bonhomme de neige',
    palette: { ...COMMUN, w: '#f8fbff', o: '#f79a2e', a: '#aab2bf', A: '#8a93a1', g: '#45ad72', G: '#2f8757', m: '#7a5438', u: '#bfe6f7', U: { c: '#9fd6f0' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.4, 0] }, tete: { parent: 'corps', pivot: [0, 6.6, 0], rot: [0, 0, 6] }, seau: { parent: 'tete', pivot: [0, 11.6, 0], rot: [0, 0, -14] },
        pan: { parent: 'corps', pivot: [-1.9, 6, -3.5] }, goutte1: { parent: 'root', pivot: [3.6, 4, -2] }, goutte2: { parent: 'root', pivot: [-3.4, 3, 2.4] }, ...B.bones,
    },
    cubes: [
        { name: 'flaque', bone: 'root', bord: false, from: [-4.6, 0.3, -4.6], to: [4.6, 1, 4.6], faces: { all: 'u', up: ['uuuuuuuu', 'uuUuuuuu', 'uuuuuuUu', 'uuuuuuuu', 'uUuuuuuu', 'uuuuuUuu', 'uuuuuuuu', 'uuuuuuuu'] } },
        { name: 'boule', bone: 'corps', bord: 'haut', from: [-3.5, 1, -3.5], to: [3.5, 6.4, 3.5], faces: { all: ['wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'uwwwwwwu'], north: ['wwwwwwww', 'wwwkkwww', 'wwwwwwww', 'wwwkkwww', 'wwwwwwww', 'wwwkkwww', 'wwwwwwww', 'uuwwwwuu'] } },
        { name: 'tete', bone: 'tete', from: [-2.9, 6.4, -2.9], to: [2.9, 11.6, 2.9], faces: { all: 'w', north: frimousse('w', { ligne: 2 }) } },
        { name: 'nez', bone: 'tete', bord: false, from: [-0.6, 8, -5.3], to: [0.6, 9.2, -2.9], rot: [-10, 0, 0], pivot: [0, 8.6, -2.9], faces: { all: 'o' } },
        { name: 'seau', bone: 'seau', from: [-2.4, 11.4, -2.4], to: [2.4, 14.2, 2.4], faces: { all: ['AAAAAAAA', 'aaaaaaaa', 'aaaaaaaa', 'aaaaaaaa'], up: 'A' } },
        { name: 'echarpe', bone: 'corps', bord: false, from: [-3.3, 5.8, -3.3], to: [3.3, 7.1, 3.3], faces: { all: ['ggGGggGG', 'ggGGggGG'], up: 'g', down: 'g' } },
        { name: 'pan', bone: 'pan', bord: false, from: [-2.6, 3.2, -4], to: [-1.2, 6, -3.4], faces: { all: ['gggg', 'GGGG', 'gggg', 'GGGG'] } },
        ...B.cubes,
        { name: 'goutte1', bone: 'goutte1', bord: false, from: [3.3, 3.6, -2.3], to: [3.9, 4.4, -1.7], faces: { all: 'U' } },
        { name: 'goutte2', bone: 'goutte2', bord: false, from: [-3.7, 2.6, 2.1], to: [-3.1, 3.4, 2.7], faces: { all: 'U' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(undefined, IDLE, 10, 3), balance('brasD', [0, 0, 8], IDLE, { tours: 2 }), balance('brasG', [0, 0, 8], IDLE, { tours: 2 }), balance('pan', [0, 0, 7], IDLE, { tours: 2 }), tic('seau', [0, 0, 7], 2.7), flotte('goutte1', -2.6, IDLE / 3, 0), flotte('goutte2', -1.8, IDLE / 3, 0.5)) },
        walk: { length: WALK, bones: mix(tient('corps', [-6, 0, 0]), balance('pan', [14, 0, 0], WALK), balance('brasD', [0, 0, 12], WALK), balance('brasG', [0, 0, 12], WALK, { phase: 1 })) },
        interact: {
            length: 1.8, loop: false,
            bones: {
                tete: { position: [[0, [0, 0, 0]], [0.35, [2.6, -1.2, 0]], [0.9, [3.6, -2.6, 0]], [1.2, [0, 1.2, 0]], [1.4, [0, 0, 0]]], rotation: [[0, [0, 0, 0]], [0.35, [0, 0, -24]], [0.9, [0, 0, -40]], [1.2, [0, 0, 6]], [1.4, [0, 0, 0]]] },
                brasD: { rotation: [[0.3, [0, 0, 0]], [0.6, [0, 0, -30]], [0.9, [0, 0, -30]], [1.2, [0, 0, 40]], [1.5, [0, 0, 0]]] },
                brasG: { rotation: [[0.3, [0, 0, 0]], [0.6, [0, 0, 50]], [0.9, [0, 0, 50]], [1.5, [0, 0, 0]]] },
                seau: { rotation: [[0, [0, 0, 0]], [0.35, [0, 0, -12]], [1.2, [0, 0, 10]], [1.5, [0, 0, 0]]] },
            },
        },
    },
};
