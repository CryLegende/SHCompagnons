// Araignée d'Halloween : une petite sorcière pendue à son fil. Violette, petits crocs, chapeau pointu de travers.
// Au clic elle se laisse tomber au bout de son fil, rebondit comme un yoyo et remonte.
import { COMMUN, IDLE, visage, mix, balance, tient, regarde } from './_style.mjs';
import { mirrored, mirroredBone } from '../bbkit.mjs';

// Trois pattes par côté : une tige qui part du corps, descend vers l'extérieur et s'ouvre en éventail
const bones = {}, cubes = [], PATTES = [];
[[-2.9, 30], [-1, 0], [1.1, -30]].forEach(([z, lacet], i) => {
    const os = { parent: 'root', pivot: [2.4, 5, z] };
    const cube = { name: 'patte' + (i + 1) + 'D', bone: 'patte' + (i + 1) + 'D', seed: 'patte', bord: false, from: [2.4, 4.6, z - 0.4], to: [7.6, 5.4, z + 0.4], rot: [0, lacet, -50], pivot: [2.4, 5, z], faces: { all: 'l', east: 'o' } };
    bones['patte' + (i + 1) + 'D'] = os; bones['patte' + (i + 1) + 'G'] = mirroredBone(os);
    cubes.push(cube, mirrored(cube, 'patte' + (i + 1) + 'G', 'patte' + (i + 1) + 'G'));
    PATTES.push(['patte' + (i + 1) + 'D', 1, i % 2], ['patte' + (i + 1) + 'G', -1, (i + 1) % 2]);
});
const agite = (angle, duree, tours = 1) => mix(...PATTES.map(([os, sign, phase]) => balance(os, [0, angle * sign, angle * 0.5 * sign], duree, { tours, phase })));
const leve = (sign) => ({ rotation: [[0, [0, 0, 0]], [0.25, [0, 20 * sign, 70 * sign]], [0.5, [0, 20 * sign, 55 * sign]], [0.75, [0, 20 * sign, 70 * sign]], [1.0, [0, 20 * sign, 55 * sign]], [1.3, [0, 0, 0]]] });

export default {
    name: 'halloween_araignee',
    title: 'Araignée',
    palette: { ...COMMUN, f: '#5b4780', F: '#463563', l: '#3d2f57', o: '#ff9a2e', e: { c: '#ff5a5a' }, w: { c: '#f4efe6' }, h: '#33284a', b: '#e77fa0' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 4, 1] }, tete: { parent: 'corps', pivot: [0, 5.5, 0.4] }, chapeau: { parent: 'tete', pivot: [0, 8, -2] }, fil: { parent: 'corps', pivot: [0, 8.4, 3.5] }, ...bones },
    cubes: [
        { name: 'abdomen', bone: 'corps', from: [-3, 3.4, 0.5], to: [3, 8.4, 6.5], faces: { all: 'f', up: ['ffff', 'foof', 'foof', 'ffff'], down: 'F' } },
        { name: 'tete', bone: 'tete', from: [-2.6, 3.4, -4.6], to: [2.6, 8, 0.5], faces: { all: 'f', north: visage('f', { ligne: 2, lignes: { 0: 'ffeffeff', 6: 'ffwffwff' } }), down: 'F' } },
        { name: 'bord', bone: 'chapeau', bord: false, from: [-2.5, 8, -4.3], to: [2.5, 8.5, 0.3], faces: { all: 'h' } },
        { name: 'cone', bone: 'chapeau', bord: false, from: [-1.4, 8.5, -3.4], to: [1.4, 11.6, -0.6], rot: [-8, 0, 10], pivot: [0, 8.5, -2], faces: { all: ['hhhh', 'hhhh', 'hhhh', 'oooo'], up: 'h' } },
        { name: 'fil', bone: 'fil', bord: false, from: [-0.2, 8.4, 3.3], to: [0.2, 14.4, 3.7], faces: { all: 'w' } },
        ...cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(undefined, IDLE, 8), agite(5, IDLE, 2), balance('corps', [2, 0, 0], IDLE, { tours: 2 })) },
        walk: { length: 0.9, bones: mix(agite(14, 0.9), tient('corps', [-5, 0, 0])) },
        interact: {
            length: 1.4, loop: false,
            bones: {
                // Chute au bout du fil : le fil s'allonge d'autant, son attache en haut ne bouge pas
                root: { position: [[0, [0, 0, 0]], [0.25, [0, -5, 0]], [0.45, [0, -3.2, 0]], [0.65, [0, -5, 0]], [0.85, [0, -4, 0]], [1.0, [0, -4.6, 0]], [1.3, [0, 0, 0]]] },
                fil: { scale: [[0, [1, 1, 1]], [0.25, [1, 1.83, 1]], [0.45, [1, 1.53, 1]], [0.65, [1, 1.83, 1]], [0.85, [1, 1.67, 1]], [1.0, [1, 1.77, 1]], [1.3, [1, 1, 1]]] },
                patte1D: leve(1), patte1G: leve(-1),
                chapeau: { rotation: [[0, [0, 0, 0]], [0.25, [0, 0, 14]], [0.5, [0, 0, -10]], [0.75, [0, 0, 10]], [1.0, [0, 0, -6]], [1.3, [0, 0, 0]]] },
            },
        },
    },
};
