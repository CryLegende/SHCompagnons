// Slime doré : un petit roi assis sur son tas d'or. Couronne de travers au joyau rouge, velours dedans ; sur le tas,
// deux piles de pièces et un rubis. Au clic il s'écrase puis bondit en vrille, la couronne saute et retombe.
import { slime, HAUT, SOL } from './_slime.mjs';
import { WALK, balance } from './_style.mjs';

const K = HAUT + 1.1, P = HAUT + 2.3;
const pointe = (name, x, z) => ({ name, bone: 'couronne', from: [Math.min(x, x * 0.55), K, Math.min(z, z * 0.55)], to: [Math.max(x, x * 0.55), P, Math.max(z, z * 0.55)], faces: { all: 'o' } });
const pile = ['oooo', 'OOOO', 'oooo', 'OOOO'];
const dessus = ['oooo', 'oOOo', 'oOOo', 'oooo'];

export default slime({
    name: 'slime_dore', title: 'Slime doré',
    palette: { c: '#ffd04a', L: '#ffe68c', h: { c: '#fffbe2' }, o: '#f5a81c', O: '#c9820e', v: '#c63a34', r: { c: '#e2483f' }, u: { c: '#4f9be8' }, t: '#f2b72c', T: '#cf8f14', g: '#e8344a', G: '#b3243a' },
    socle: { all: ['tTttTttT', 'TttTttTt'], up: ['tttttttt', 'tTTttttt', 'tTTttTTt', 'tttttTTt', 'ttTTtttt', 'ttTTttTT', 'ttttttTT', 'tttttttt'] },
    plus: {
        bones: { couronne: { parent: 'dessus', pivot: [0, HAUT, 0], rot: [0, 0, 9] }, rubis: { parent: 'root', pivot: [-4, SOL + 0.7, 4] } },
        cubes: [
            { name: 'bandeau', bone: 'couronne', from: [-2.1, HAUT - 0.1, -2.1], to: [2.1, K, 2.1], faces: { all: ['oooooooo', 'oroouoor', 'oroouoor', 'oooooooo'], up: ['oooooooo', 'ovvvvvvo', 'ovvvvvvo', 'ovvvvvvo', 'ovvvvvvo', 'ovvvvvvo', 'ovvvvvvo', 'oooooooo'] } },
            pointe('pointe1', 2.1, 2.1), pointe('pointe2', -2.1, 2.1), pointe('pointe3', 2.1, -2.1), pointe('pointe4', -2.1, -2.1),
            { name: 'joyau', bone: 'couronne', bord: false, from: [-0.5, HAUT + 0.2, -2.45], to: [0.5, HAUT + 1.3, -2.1], faces: { all: 'g', north: ['gg', 'gG'] } },
            // Sur le tas d'or : une haute pile devant à gauche, une petite devant à droite, un rubis derrière
            { name: 'pile1', bone: 'root', from: [3.2, SOL, -4.9], to: [4.8, SOL + 1.9, -3.3], faces: { all: pile, up: dessus } },
            { name: 'pile2', bone: 'root', from: [-4.8, SOL, -4.8], to: [-3.3, SOL + 0.9, -3.3], faces: { all: ['oooo', 'OOOO'], up: dessus } },
            { name: 'rubis', bone: 'rubis', bord: false, from: [-4.7, SOL, 3.3], to: [-3.3, SOL + 1.4, 4.7], rot: [0, 45, 0], pivot: [-4, SOL + 0.7, 4], faces: { all: ['gggg', 'gGgg', 'ggGg', 'GGGG'], up: ['gggg', 'ghhg', 'ghgg', 'gggg'] } },
        ],
    },
    anim: {
        walk: balance('couronne', [0, 0, 5], WALK),
        interact: {
            couronne: { position: [[0.5, [0, 0, 0]], [0.75, [0, 3, 0]], [1.0, [0, 0, 0]], [1.1, [0, 0.6, 0]], [1.2, [0, 0, 0]]] },
            rubis: { rotation: [[0.6, [0, 0, 0]], [0.8, [0, 120, 0]], [1.0, [0, 240, 0]], [1.2, [0, 360, 0]]], position: [[0.6, [0, 0, 0]], [0.9, [0, 1.6, 0]], [1.2, [0, 0, 0]]] },
        },
    },
});
