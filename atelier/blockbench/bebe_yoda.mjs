// Bébé Yoda : petit être vert aux grandes oreilles, dans sa nacelle grise qui flotte. Au clic la nacelle tourne sur elle-même, oreilles dressées.
import { COMMUN, IDLE, WALK, TOUR, mix, balance, tient, regarde, tic, vrille, paire } from './_style.mjs';

const O = paire('oreille', { parent: 'tete', pivot: [3, 8.9, -0.3] }, { from: [3, 8.1, -0.9], to: [6.5, 9.6, 0.2], rot: [0, 0, 10], pivot: [3, 8.9, -0.3], faces: { all: 'g', north: ['gggg', 'gppg', 'gppg', 'gggg'] } });
const dresse = (s) => ({ rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 28 * s]], [0.95, [0, 0, 28 * s]], [1.2, [0, 0, 0]]] });

export default {
    name: 'bebe_yoda',
    title: 'Bébé Yoda',
    palette: { ...COMMUN, g: '#b3cf86', p: '#e9a9b0', r: '#cdb28e', R: '#a98f6d', m: '#cfd2d9', M: '#9fa4b0', i: '#6f7480', e: { c: '#ffffff' } },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 4.6, 0] }, tete: { parent: 'corps', pivot: [0, 6.6, 0] }, ...O.bones },
    cubes: [
        { name: 'nacelle', bone: 'root', from: [-3.6, 1, -3.6], to: [3.6, 4.3, 3.6], faces: { all: 'm', up: 'i', north: ['mmmmmmmm', 'mmmmmmmm', 'mMMMMMMm', 'mmmmmmmm'] } },
        { name: 'rebord', bone: 'root', bord: false, from: [-3.9, 4.3, -3.9], to: [3.9, 5.1, 3.9], faces: { all: 'M', up: ['MMMMMMMM', 'MiiiiiiM', 'MiiiiiiM', 'MiiiiiiM', 'MiiiiiiM', 'MiiiiiiM', 'MiiiiiiM', 'MMMMMMMM'] } },
        { name: 'robe', bone: 'corps', from: [-2.3, 4.6, -2.1], to: [2.3, 7, 2.1], faces: { all: 'r', north: ['rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr'] } },
        { name: 'tete', bone: 'tete', from: [-3, 6.6, -2.9], to: [3, 10.8, 2.5], faces: { all: 'g', north: ['gggggggg', 'gekggkeg', 'gkkggkkg', 'bbggggbb', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg'] } },
        ...O.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(undefined, IDLE, 10, 5), balance('oreilleD', [0, 0, 7], IDLE, { tours: 2 }), balance('oreilleG', [0, 0, 7], IDLE, { tours: 2, phase: 1 }), balance('root', [0, 0, 2.5], IDLE, { tours: 1 })) },
        walk: { length: WALK, bones: mix(tient('root', [-9, 0, 0]), tient('oreilleD', [0, -24, 0]), tient('oreilleG', [0, 24, 0]), tient('tete', [6, 0, 0])) },
        interact: { length: TOUR, loop: false, bones: mix(vrille('root', 1.2), { oreilleD: dresse(1), oreilleG: dresse(-1), tete: { rotation: [[0, [0, 0, 0]], [0.2, [14, 0, 0]], [0.95, [14, 0, 0]], [1.2, [0, 0, 0]]] } }) },
    },
};
