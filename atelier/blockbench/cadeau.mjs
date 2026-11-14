// Cadeau du Père Noël : un paquet pressé d'être ouvert, qui a emprunté le bonnet du Père Noël. Ruban doré, étiquette
// qui pend sur le côté. Au clic son couvercle saute, une étoile en sort et y retourne.
import { COMMUN, IDLE, WALK, mix, balance, tient, regarde, tic } from './_style.mjs';

const ruban = Array(8).fill('rrryyrrr');

export default {
    name: 'cadeau',
    title: 'Cadeau du Père Noël',
    palette: { ...COMMUN, r: '#dd443d', D: '#c3352f', y: '#ffd24a', b: '#f59a8c', x: '#fbf7ee', e: '#eedcae', t: { c: '#6a4a36' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1, 0] }, couvercle: { parent: 'corps', pivot: [0, 7, 3.6] },
        bonnet: { parent: 'couvercle', pivot: [0, 8.6, 0], rot: [0, 0, 7] }, pointe: { parent: 'bonnet', pivot: [1.6, 11.4, 0], rot: [0, 0, -38] },
        etiquette: { parent: 'corps', pivot: [3.6, 6.8, -0.4], rot: [0, 0, 12] }, etoile: { parent: 'root', pivot: [0, 4.5, 0] },
    },
    cubes: [
        { name: 'boite', bone: 'corps', from: [-3.4, 1, -3.4], to: [3.4, 7, 3.4], faces: { all: ruban, north: ['rrryyrrr', 'rrryyrrr', 'rkryyrkr', 'rkryyrkr', 'bbryyrbb', 'rrryyrrr', 'rrryyrrr', 'rrryyrrr'], down: 'D' } },
        { name: 'couvercle', bone: 'couvercle', from: [-3.8, 7, -3.8], to: [3.8, 8.6, 3.8], faces: { all: ['DDDyyDDD', 'DDDyyDDD'], up: ['DDDyyDDD', 'DDDyyDDD', 'DDDyyDDD', 'yyyyyyyy', 'yyyyyyyy', 'DDDyyDDD', 'DDDyyDDD', 'DDDyyDDD'] } },
        { name: 'fourrure', bone: 'bonnet', bord: false, from: [-2.7, 8.6, -2.7], to: [2.7, 9.6, 2.7], faces: { all: 'x' } },
        { name: 'bonnet', bone: 'bonnet', from: [-2.1, 9.6, -2.1], to: [2.1, 11.8, 2.1], faces: { all: 'r' } },
        { name: 'pointe', bone: 'pointe', bord: false, from: [1.2, 10.6, -1], to: [4.6, 12.2, 1], faces: { all: 'r' } },
        { name: 'pompon', bone: 'pointe', from: [4.2, 10.3, -1], to: [6.2, 12.3, 1], faces: { all: 'x' } },
        { name: 'etiquette', bone: 'etiquette', bord: false, from: [3.4, 4.2, -1.3], to: [3.9, 6.8, 0.5], faces: { all: 'e', east: ['eeee', 'ette', 'eeee', 'ette'] } },
        { name: 'etoile', bone: 'etoile', item: 'nether_star', from: [-2, 2.5, -0.1], to: [2, 6.5, 0.1], faces: { all: 'y' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde('corps', IDLE, 9, 3), balance('pointe', [0, 0, 7], IDLE, { tours: 2 }), balance('etiquette', [0, 0, 6], IDLE, { tours: 3 }), tic('couvercle', [9, 0, 0], 2.7)) },
        walk: { length: WALK, bones: mix(tient('corps', [-7, 0, 0]), balance('pointe', [0, 0, 14], WALK), balance('etiquette', [0, 0, 10], WALK), balance('couvercle', [4, 0, 0], WALK)) },
        interact: {
            length: 1.9, loop: false,
            bones: {
                couvercle: { rotation: [[0, [0, 0, 0]], [0.25, [72, 0, 0]], [1.45, [72, 0, 0]], [1.7, [0, 0, 0]]] },
                etoile: { position: [[0.15, [0, 0, 0]], [0.5, [0, 8.4, 0]], [0.8, [0, 7.8, 0]], [1.1, [0, 8.4, 0]], [1.4, [0, 0, 0]]], rotation: [[0.5, [0, 0, 0]], [1.1, [0, 360, 0]]] },
                pointe: { rotation: [[0, [0, 0, 0]], [0.25, [0, 0, 40]], [1.45, [0, 0, 30]], [1.9, [0, 0, 0]]] },
            },
        },
    },
};
