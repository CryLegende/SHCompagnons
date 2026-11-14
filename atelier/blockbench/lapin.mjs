// Lapin : le lapin du magicien. Il vit dans un haut-de-forme retourné, baguette plantée à côté de lui, étoiles qui
// pétillent. Au clic il disparaît dans le chapeau et ressort, oreilles dressées.
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, regarde, tic, flotte, paire } from './_style.mjs';

const O = paire('oreille', { parent: 'tete', pivot: [1.7, 10.7, 0.2], rot: [0, 0, -8] }, { from: [0.9, 10.5, -0.4], to: [2.5, 15.6, 0.7], faces: { all: 'f', north: ['ffff', 'fppf', 'fppf', 'fppf', 'fppf', 'fppf', 'fppf', 'ffff'] } });
const M = paire('main', { parent: 'tete', pivot: [1.9, 6.2, -3.6] }, { from: [1.2, 5.9, -4.3], to: [2.7, 6.9, -3], faces: { all: 'f' } });
const plonge = { position: [[0, [0, 0, 0]], [0.25, [0, -5.4, 0]], [1.0, [0, -5.4, 0]], [1.2, [0, 0.9, 0]], [1.35, [0, 0, 0]]] };

export default {
    name: 'lapin',
    title: 'Lapin',
    palette: { ...COMMUN, f: '#f7f0e7', p: '#f5a9b6', n: { c: '#e98a9c' }, d: { c: '#cdbfb0' }, c: '#3a3542', r: '#e2483f', w: { c: '#fbf7ee' }, y: { c: '#ffd84a' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.6, 0] }, tete: { parent: 'corps', pivot: [0, 5.6, 0] }, baguette: { parent: 'corps', pivot: [2.6, 5.6, 1.6] },
        etoile1: { parent: 'root', pivot: [-4.2, 9.4, -2] }, etoile2: { parent: 'root', pivot: [4.6, 12.6, 1] }, ...O.bones, ...M.bones,
    },
    cubes: [
        { name: 'chapeau', bone: 'corps', from: [-3.1, 0, -3.1], to: [3.1, 5.3, 3.1], faces: { all: ['rrrr', 'cccc', 'cccc', 'cccc'], up: 'c', down: 'c' } },
        { name: 'bord', bone: 'corps', bord: false, from: [-4.3, 5.3, -4.3], to: [4.3, 6, 4.3], faces: { all: 'c' } },
        { name: 'tete', bone: 'tete', from: [-2.9, 5.6, -3], to: [2.9, 10.8, 2.4], faces: { all: 'f', north: visage('f') } },
        { name: 'museau', bone: 'tete', from: [-1.6, 6.2, -3.9], to: [1.6, 8.2, -2.9], faces: { all: 'f', north: ['fffnnfff', 'fffnnfff', 'ffffffff', 'ffdffdff', 'fffddfff', 'ffffffff', 'ffffffff', 'ffffffff'], up: ['fffnnfff', 'ffffffff', 'ffffffff', 'ffffffff'] } },
        ...O.cubes, ...M.cubes,
        { name: 'baguette', bone: 'baguette', bord: false, from: [2.3, 5.4, 1.3], to: [2.9, 12.2, 1.9], rot: [12, 0, -30], pivot: [2.6, 5.6, 1.6], faces: { all: ['w', 'c', 'c', 'c', 'c', 'c', 'c', 'c'], up: 'w' } },
        { name: 'etoile1', bone: 'etoile1', bord: false, from: [-4.6, 9, -2.4], to: [-3.8, 9.8, -1.6], rot: [0, 0, 45], pivot: [-4.2, 9.4, -2], faces: { all: 'y' } },
        { name: 'etoile2', bone: 'etoile2', bord: false, from: [4.3, 12.3, 0.7], to: [4.9, 12.9, 1.3], rot: [0, 0, 45], pivot: [4.6, 12.6, 1], faces: { all: 'y' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(undefined, IDLE, 12, 4), tic('oreilleG', [0, 0, 40], 2.6), balance('baguette', [0, 0, 5], IDLE, { tours: 2 }), flotte('etoile1', 2.6, IDLE / 2, 0), flotte('etoile2', 2.2, IDLE / 2, 0.5)) },
        walk: { length: WALK, bones: mix(tient('corps', [-8, 0, 0]), tient('oreilleD', [30, 0, 0]), tient('oreilleG', [30, 0, 0]), balance('tete', [0, 0.5, 0], WALK, { canal: 'position' }), balance('baguette', [0, 0, 9], WALK)) },
        interact: {
            length: 1.5, loop: false,
            bones: {
                tete: plonge,
                oreilleD: { scale: [[0, [1, 1, 1]], [0.25, [1, 0.1, 1]], [1.0, [1, 0.1, 1]], [1.2, [1, 1.15, 1]], [1.35, [1, 1, 1]]], rotation: [[1.0, [0, 0, 0]], [1.2, [0, 0, -16]], [1.5, [0, 0, 0]]] },
                oreilleG: { scale: [[0, [1, 1, 1]], [0.25, [1, 0.1, 1]], [1.0, [1, 0.1, 1]], [1.2, [1, 1.15, 1]], [1.35, [1, 1, 1]]], rotation: [[1.0, [0, 0, 0]], [1.2, [0, 0, 16]], [1.5, [0, 0, 0]]] },
                corps: { rotation: [[0.3, [0, 0, 0]], [0.45, [0, 0, 8]], [0.6, [0, 0, -8]], [0.75, [0, 0, 6]], [0.9, [0, 0, 0]]] },
                etoile1: { position: [[0.9, [0, 0, 0]], [1.2, [-1.4, 2.6, 0]], [1.5, [0, 0, 0]]], scale: [[0.9, [1, 1, 1]], [1.2, [1.8, 1.8, 1.8]], [1.5, [1, 1, 1]]] },
                etoile2: { position: [[0.9, [0, 0, 0]], [1.2, [1.4, 2.2, 0]], [1.5, [0, 0, 0]]], scale: [[0.9, [1, 1, 1]], [1.2, [1.8, 1.8, 1.8]], [1.5, [1, 1, 1]]] },
            },
        },
    },
};
