// Araignée d'Halloween : violette, grands yeux, petits crocs, chapeau de sorcière. Au clic elle se cabre, pattes avant levées.
import { COMMUN, IDLE, visage, mix, balance, tient, regarde } from './_style.mjs';
import { mirrored, mirroredBone } from '../bbkit.mjs';

// Quatre pattes par côté : une tige qui part du corps, descend vers l'extérieur et s'ouvre en éventail
const bones = {}, cubes = [], PATTES = [];
[[-3.1, 32], [-1.5, 11], [0.1, -11], [1.7, -32]].forEach(([z, lacet], i) => {
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
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 4, 1] }, tete: { parent: 'corps', pivot: [0, 5.5, 0.4] }, chapeau: { parent: 'tete', pivot: [0, 8, -2] }, ...bones },
    cubes: [
        { name: 'abdomen', bone: 'corps', from: [-3, 3.4, 0.5], to: [3, 8.4, 6.5], faces: { all: 'f', up: ['ffff', 'foof', 'foof', 'ffff'], down: 'F' } },
        { name: 'tete', bone: 'tete', from: [-2.6, 3.4, -4.6], to: [2.6, 8, 0.5], faces: { all: 'f', north: visage('f', { ligne: 2, lignes: { 0: 'ffeffeff', 6: 'ffwffwff' } }), down: 'F' } },
        { name: 'bord', bone: 'chapeau', bord: false, from: [-2.5, 8, -4.3], to: [2.5, 8.5, 0.3], faces: { all: 'h' } },
        { name: 'cone', bone: 'chapeau', bord: false, from: [-1.4, 8.5, -3.4], to: [1.4, 11.6, -0.6], rot: [-8, 0, 10], pivot: [0, 8.5, -2], faces: { all: ['hhhh', 'hhhh', 'hhhh', 'oooo'], up: 'h' } },
        ...cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(undefined, IDLE, 8), agite(5, IDLE, 2), balance('corps', [2, 0, 0], IDLE, { tours: 2 })) },
        walk: { length: 0.9, bones: mix(agite(14, 0.9), tient('corps', [-5, 0, 0])) },
        interact: {
            length: 1.4, loop: false,
            bones: {
                corps: { rotation: [[0, [0, 0, 0]], [0.25, [22, 0, 0]], [1.0, [22, 0, 0]], [1.3, [0, 0, 0]]] },
                patte1D: leve(1), patte1G: leve(-1), patte2D: leve(1), patte2G: leve(-1),
                chapeau: { rotation: [[0, [0, 0, 0]], [0.25, [0, 0, 14]], [0.5, [0, 0, -10]], [0.75, [0, 0, 10]], [1.0, [0, 0, -6]], [1.3, [0, 0, 0]]] },
            },
        },
    },
};
