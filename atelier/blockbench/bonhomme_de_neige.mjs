// Bonhomme de neige : deux boules, nez en carotte, haut-de-forme, écharpe verte, bras en brindilles. Au clic il soulève son chapeau.
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, regarde, tic, paire } from './_style.mjs';

const B = paire('bras', { parent: 'corps', pivot: [3.3, 4, 0] }, { bord: false, from: [3.3, 3.6, -0.4], to: [6.7, 4.3, 0.4], rot: [0, 0, 28], pivot: [3.3, 4, 0], faces: { all: 'm' } });

export default {
    name: 'bonhomme_de_neige',
    title: 'Bonhomme de neige',
    palette: { ...COMMUN, w: '#f8fbff', o: '#f79a2e', h: '#39343f', r: '#e2483f', g: '#45ad72', G: '#2f8757', m: '#7a5438' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1, 0] }, tete: { parent: 'corps', pivot: [0, 6.2, 0] }, chapeau: { parent: 'tete', pivot: [0, 11.2, 0] }, pan: { parent: 'corps', pivot: [-1.9, 5.6, -3.5] }, ...B.bones },
    cubes: [
        { name: 'boule', bone: 'corps', from: [-3.4, 1, -3.4], to: [3.4, 6.2, 3.4], faces: { all: 'w', north: ['wwwwwwww', 'wwwkkwww', 'wwwwwwww', 'wwwkkwww', 'wwwwwwww', 'wwwkkwww', 'wwwwwwww', 'wwwwwwww'] } },
        { name: 'tete', bone: 'tete', from: [-2.9, 6, -2.9], to: [2.9, 11.2, 2.9], faces: { all: 'w', north: visage('w', { lignes: { 5: 'wkwwwwkw', 6: 'wwkkkkww' } }) } },
        { name: 'nez', bone: 'tete', bord: false, from: [-0.6, 7.6, -5.3], to: [0.6, 8.8, -2.9], faces: { all: 'o' } },
        { name: 'bord', bone: 'chapeau', bord: false, from: [-3.3, 11.2, -3.3], to: [3.3, 11.8, 3.3], faces: { all: 'h' } },
        { name: 'calotte', bone: 'chapeau', from: [-2.2, 11.8, -2.2], to: [2.2, 14.6, 2.2], faces: { all: ['hhhh', 'hhhh', 'hhhh', 'rrrr'], up: 'h' } },
        { name: 'echarpe', bone: 'corps', bord: false, from: [-3.3, 5.4, -3.3], to: [3.3, 6.7, 3.3], faces: { all: ['ggGGggGG', 'ggGGggGG'], up: 'g', down: 'g' } },
        { name: 'pan', bone: 'pan', bord: false, from: [-2.6, 2.8, -3.9], to: [-1.2, 5.6, -3.3], faces: { all: ['gggg', 'GGGG', 'gggg', 'GGGG'] } },
        ...B.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(undefined, IDLE, 10, 3), balance('brasD', [0, 0, 8], IDLE, { tours: 2 }), balance('brasG', [0, 0, 8], IDLE, { tours: 2 }), balance('pan', [0, 0, 7], IDLE, { tours: 2 }), tic('chapeau', [0, 0, 7], 2.7)) },
        walk: { length: WALK, bones: mix(tient('corps', [-6, 0, 0]), balance('pan', [14, 0, 0], WALK), balance('brasD', [0, 0, 12], WALK), balance('brasG', [0, 0, 12], WALK, { phase: 1 })) },
        interact: {
            length: 1.5, loop: false,
            bones: {
                chapeau: { position: [[0, [0, 0, 0]], [0.3, [0.8, 2.4, 0]], [0.9, [0.8, 2.4, 0]], [1.2, [0, 0, 0]]], rotation: [[0, [0, 0, 0]], [0.3, [0, 0, -24]], [0.9, [0, 0, -24]], [1.2, [0, 0, 0]]] },
                brasD: { rotation: [[0, [0, 0, 0]], [0.3, [0, 0, 42]], [0.9, [0, 0, 42]], [1.2, [0, 0, 0]]] },
                tete: { rotation: [[0, [0, 0, 0]], [0.3, [-10, 0, 0]], [0.9, [-10, 0, 0]], [1.2, [0, 0, 0]]] },
            },
        },
    },
};
