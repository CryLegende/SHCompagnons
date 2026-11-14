// Capybara : placide, une orange posée sur la tête. Au clic il lance son orange en l'air et la rattrape sur sa tête.
// Modèle de référence du style (voir STYLE.md).
import { mirrored, mirroredBone, mirroredKeys } from '../bbkit.mjs';
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, respire, regarde, tic, pendouille, pedale } from './_style.mjs';

const patteAvD = { parent: 'root', pivot: [2.3, 2.8, -0.9] };
const patteArD = { parent: 'root', pivot: [2.3, 2.8, 4.2] };
const oreilleD = { parent: 'tete', pivot: [2.9, 10.9, -2.7] };
const patte = { name: 'patteAvD', bone: 'patteAvD', seed: 'patte', from: [1.3, 0, -1.9], to: [3.3, 2.9, 0.1], faces: { all: ['FF', 'FF', 'FF', 'tt'], up: 'F', down: 't' } };
const patteAr = { ...patte, name: 'patteArD', bone: 'patteArD', from: [1.3, 0, 3.2], to: [3.3, 2.9, 5.2] };
const oreille = { name: 'oreilleD', bone: 'oreilleD', from: [2.0, 10.7, -3.4], to: [3.8, 12.5, -2.1], faces: { all: 'F', north: ['FFFF', 'FiiF', 'FiiF', 'FiiF'], up: 'f' } };
const flanc = ['ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'fwwwwwwf', 'wwwwwwww'];
const oreillesDressees = { rotation: [[0.3, [0, 0, 0]], [0.45, [0, 0, -30]], [0.95, [0, 0, -30]], [1.1, [0, 0, 0]]] };

export default {
    name: 'capybara',
    title: 'Capybara',
    palette: {
        ...COMMUN,
        f: '#d39a5c', F: '#b57f47', w: '#ebc48f', t: '#7d5231', i: '#8b5a3a',
        m: '#efcf9f', n: { c: '#5e3d2b' }, d: { c: '#8a5c3c' },
        o: '#ff9f1c', y: '#ffc95c', g: '#74cc47', G: '#4b9a2f',
    },
    bones: {
        root: { pivot: [0, 0, 0] },
        corps: { parent: 'root', pivot: [0, 2.8, 1.7] },
        ventre: { parent: 'corps', pivot: [0, 2.4, 1.7] },
        tete: { parent: 'corps', pivot: [0, 6.5, -1.8] },
        oreilleD, oreilleG: mirroredBone(oreilleD),
        orange: { parent: 'tete', pivot: [0, 11.2, -5] },
        feuille: { parent: 'orange', pivot: [0, 13.95, -5] },
        patteAvD, patteAvG: mirroredBone(patteAvD),
        patteArD, patteArG: mirroredBone(patteArD),
    },
    cubes: [
        {
            name: 'ventre', bone: 'ventre', bord: 'haut', from: [-3.25, 2.4, -2], to: [3.25, 8, 5.5],
            faces: { all: 'f', east: flanc, west: flanc, south: ['ffffffff', 'ffffffff', 'ffffffff', 'fffFFfff', 'fffFFfff', 'ffffffff', 'fwwwwwwf', 'wwwwwwww'], down: 'w' },
        },
        { name: 'tete', bone: 'tete', from: [-3.5, 5, -8.2], to: [3.5, 11.2, -1.4], faces: { all: 'f', north: visage('f'), down: 'w' } },
        {
            name: 'museau', bone: 'tete', from: [-2.3, 5.3, -9.3], to: [2.3, 8.5, -8.0],
            faces: {
                all: 'm',
                north: ['mmnnnnmm', 'mmnnnnmm', 'mmmnnmmm', 'mmmmmmmm', 'mmmddmmm', 'mmmmmmmm', 'mmmmmmmm', 'mmmmmmmm'],
                up: ['mmnnnnmm', 'mmnnnnmm', 'mmmmmmmm', 'mmmmmmmm', 'mmmmmmmm', 'mmmmmmmm', 'mmmmmmmm', 'mmmmmmmm'],
            },
        },
        oreille, mirrored(oreille, 'oreilleG', 'oreilleG'),
        {
            name: 'orange', bone: 'orange', from: [-1.6, 11.2, -6.6], to: [1.6, 14, -3.4],
            faces: {
                all: ['oyyooooo', 'oyoooooo', 'oooooooo', 'oooooooo', 'oooooooo', 'oooooooo', 'oooooooo', 'oooooooo'],
                up: ['oooooooo', 'oyyooooo', 'oyoooooo', 'oooGGooo', 'oooGGooo', 'oooooooo', 'oooooooo', 'oooooooo'],
                down: 'o',
            },
        },
        { name: 'feuille', bone: 'feuille', bord: false, from: [0, 13.9, -5.5], to: [2, 14.3, -4.4], rot: [0, -25, 24], pivot: [0, 13.95, -5], faces: { all: 'G', up: ['gG', 'gg'] } },
        patte, mirrored(patte, 'patteAvG', 'patteAvG'),
        patteAr, mirrored(patteAr, 'patteArG', 'patteArG'),
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire(), regarde(), tic('oreilleD', [0, 0, -28], 2.6), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(), tient('corps', [-5, 0, 0]), balance('orange', [0, 0, 7], WALK)) },
        interact: {
            length: 1.8,
            loop: false,
            bones: {
                ventre: { scale: [[0, [1, 1, 1], 'smooth'], [0.2, [1.05, 0.9, 1.05], 'smooth'], [0.35, [0.97, 1.07, 0.97], 'smooth'], [0.6, [1, 1, 1], 'smooth'], [1.0, [1, 1, 1]], [1.08, [1.04, 0.93, 1.04]], [1.25, [1, 1, 1]]] },
                tete: { rotation: [[0, [0, 0, 0], 'smooth'], [0.2, [-12, 0, 0], 'smooth'], [0.35, [24, 0, 0], 'smooth'], [0.95, [20, 0, 0]], [1.05, [-7, 0, 0]], [1.25, [0, 0, 0]], [1.4, [0, 0, 7]], [1.55, [0, 0, -7]], [1.7, [0, 0, 5]], [1.8, [0, 0, 0]]] },
                orange: {
                    position: [[0.3, [0, 0, 0]], [0.45, [0, 4.6, 0]], [0.55, [0, 6.6, 0]], [0.65, [0, 7.2, 0]], [0.75, [0, 6.6, 0]], [0.85, [0, 4.6, 0]], [1.0, [0, 0, 0]]],
                    rotation: [[0.3, [0, 0, 0]], [0.65, [180, 0, 0]], [1.0, [360, 0, 0]]],
                },
                oreilleD: oreillesDressees,
                oreilleG: mirroredKeys(oreillesDressees),
            },
        },
    },
};
