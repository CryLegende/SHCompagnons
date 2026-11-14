// Maneki : le chat porte-bonheur en céramique, assis, la patte levée qui fait signe d'approcher, une grosse pièce
// d'or (koban) serrée contre lui, grelot au collier. Au clic il appelle la chance à toute vitesse : la patte s'agite,
// le grelot tinte, la pièce saute en tournant et retombe dans sa patte.
// Inspiration : Japanese style Pets de niiwork Studio (https://mcmodels.net/products/17883/japanese-style-pets),
// redessiné au style du capybara.
import { COMMUN, IDLE, WALK, mix, balance, tient, respire, regarde, tic } from './_style.mjs';

// Signe d'approcher : la patte se plie vers l'avant puis se redresse (une paire d'images clés par signe)
const signes = (debuts, angle = -34, aller = 0.3, retour = 0.6) => ({
    brasG: { rotation: [...(debuts[0] > 0 ? [[0, [0, 0, 0]]] : []), ...debuts.flatMap((t) => [[t, [0, 0, 0]], [t + aller, [angle, 0, 0]], [t + retour, [0, 0, 0]]])] },
});
const oreille = (name, x, couleur) => ({
    name, bone: name, from: [x - 0.9, 11.2, -1.5], to: [x + 0.9, 13.0, -0.3], rot: [0, 0, x > 0 ? -12 : 12], pivot: [x, 11.3, -0.9],
    faces: { all: couleur, north: [couleur.repeat(4), couleur + 'pp' + couleur, couleur + 'pp' + couleur, couleur + 'pp' + couleur] },
});

export default {
    name: 'maneki',
    title: 'Maneki',
    palette: {
        ...COMMUN,
        w: '#f8f4ea', W: '#ddd5c4', o: '#f2a03d', n: '#3d3533', p: '#f4a7b9',
        r: '#e2483f', R: { c: '#b9322d' }, y: '#f7cb47', Y: { c: '#c9962a' }, m: { c: '#5e3d2b' },
    },
    bones: {
        root: { pivot: [0, 0, 0] },
        corps: { parent: 'root', pivot: [0, 0.6, 0] },
        ventre: { parent: 'corps', pivot: [0, 0.4, 0] },
        tete: { parent: 'corps', pivot: [0, 6.2, -0.2] },
        oreilleD: { parent: 'tete', pivot: [2.5, 11.3, -0.9] },
        oreilleG: { parent: 'tete', pivot: [-2.5, 11.3, -0.9] },
        grelot: { parent: 'corps', pivot: [0, 5.4, -2.7] },
        brasG: { parent: 'corps', pivot: [-4.3, 5.8, -1.6] },
        brasD: { parent: 'corps', pivot: [3.2, 5.4, -1.4] },
        koban: { parent: 'corps', pivot: [1.4, 3.3, -3.3] },
        queue: { parent: 'corps', pivot: [0, 1.4, 2.6] },
    },
    cubes: [
        {
            name: 'ventre', bone: 'ventre', from: [-3, 0.4, -2.3], to: [3, 5.8, 2.6],
            faces: {
                all: 'w', down: 'W',
                north: ['wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wWWwwWWw', 'wWWwwWWw'],
                east: ['wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwooo', 'wwwwwwoo', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
                south: ['wwwwwwww', 'wwwwwwww', 'wnnwwwww', 'wnnnwwww', 'wwnwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
            },
        },
        {
            name: 'tete', bone: 'tete', from: [-3.7, 6.0, -3.2], to: [3.7, 11.4, 2.9],
            faces: {
                all: 'w', down: 'W',
                north: ['ooowwwnn', 'oowwwwwn', 'wwwwwwww', 'wwkwwkww', 'wwkwwkww', 'wbbwwbbw', 'wwwwwwww', 'wwwwwwww'],
                up: ['ooowwwnn', 'oooowwnn', 'oowwwwwn', 'wwwwwwww', 'wwwwwwww', 'wwwwnnww', 'wwwnnnww', 'wwwwwwww'],
                east: ['wwwwoooo', 'wwwwwooo', 'wwwwwwoo', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
                west: ['nnnwwwww', 'nnwwwwww', 'nwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
                south: ['wwwwwwww', 'wwwwwnnw', 'wwwwnnnw', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
            },
        },
        {
            name: 'museau', bone: 'tete', from: [-1.4, 6.2, -3.9], to: [1.4, 7.5, -3.1],
            faces: { all: 'w', north: ['wwwppwww', 'wwwwwwww', 'wwmwwmww', 'wwwmmwww'], down: 'W' },
        },
        oreille('oreilleD', 2.5, 'o'), oreille('oreilleG', -2.5, 'n'),
        { name: 'collier', bone: 'corps', from: [-3.3, 5.2, -2.6], to: [3.3, 6.2, 2.9], faces: { all: ['rrrr', 'rrrr', 'rrrr', 'RRRR'], up: 'r', down: 'R' } },
        { name: 'grelot', bone: 'grelot', from: [-0.8, 4.1, -3.2], to: [0.8, 5.5, -2.4], faces: { all: 'y', north: ['yyyy', 'yyyy', 'YYYY', 'yYYy'], down: 'Y' } },
        {
            name: 'brasG', bone: 'brasG', from: [-5.0, 5.6, -2.4], to: [-3.6, 10.6, -0.9], rot: [0, 0, 4], pivot: [-4.3, 5.8, -1.6],
            faces: { all: 'w', north: ['wwww', 'wppw', 'wwww', 'wwww', 'wwww', 'wwww', 'wwww', 'wwww'], up: ['wwww', 'wppw', 'wwww', 'wwww'] },
        },
        { name: 'brasD', bone: 'brasD', from: [2.4, 3.0, -3.9], to: [3.9, 5.4, -2.3], rot: [0, 0, -10], pivot: [3.2, 5.4, -1.4], faces: { all: 'w', north: ['wwww', 'wwww', 'wwww', 'pwpw'], down: 'W' } },
        {
            name: 'koban', bone: 'koban', from: [-0.3, 1.4, -3.6], to: [3.1, 5.2, -3.0], rot: [0, 0, -14], pivot: [1.4, 3.3, -3.3],
            faces: { all: 'y', north: ['YyyyyyyY', 'yyyyyyyy', 'yyYyyYyy', 'yyYyyYyy', 'yyyyyyyy', 'yyyYYyyy', 'yyyyyyyy', 'YyyyyyyY'], south: ['YyyyyyyY', 'yyyyyyyy', 'yyyyyyyy', 'yyyyyyyy', 'yyyyyyyy', 'yyyyyyyy', 'yyyyyyyy', 'YyyyyyyY'] },
        },
        {
            name: 'queue', bone: 'queue', from: [-0.7, 1.2, 2.3], to: [0.7, 4.8, 3.7], rot: [16, 0, 0], pivot: [0, 1.4, 2.6],
            faces: { all: ['nnnn', 'oooo', 'oooo', 'wwww'], up: 'n', down: 'w' },
        },
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(
                respire('ventre', IDLE, 2, 0.035), regarde('tete', IDLE, 8, 2), signes([0.3, 1.1, 3.3, 4.1]),
                balance('queue', [0, 0, 10], IDLE, { tours: 2 }), tic('oreilleD', [0, 0, -22], 2.6), balance('grelot', [0, 0, 6], IDLE, { tours: 2, phase: 1 }),
            ),
        },
        walk: {
            length: WALK,
            bones: mix(tient('corps', [-5, 0, 0]), signes([0], -30, 0.35, 0.7), balance('queue', [0, 0, 16], WALK), balance('grelot', [0, 0, 14], WALK, { phase: 1 })),
        },
        interact: {
            length: 1.8,
            loop: false,
            bones: {
                // La patte appelle la chance à toute vitesse...
                brasG: { rotation: [[0, [0, 0, 0]], [0.12, [-40, 0, 0]], [0.24, [0, 0, 0]], [0.36, [-40, 0, 0]], [0.48, [0, 0, 0]], [0.6, [-40, 0, 0]], [0.75, [0, 0, 0]]] },
                grelot: { rotation: [[0, [0, 0, 0]], [0.1, [0, 0, 25]], [0.2, [0, 0, -25]], [0.3, [0, 0, 22]], [0.4, [0, 0, -22]], [0.5, [0, 0, 15]], [0.6, [0, 0, -10]], [0.75, [0, 0, 0]]] },
                // ... la pièce d'or saute en tournant et retombe dans sa patte
                koban: {
                    position: [[0.75, [0, 0, 0]], [0.9, [-0.6, 6, -1.4]], [1.0, [-1, 9, -1.6]], [1.1, [-1.2, 10, -1.6]], [1.2, [-1, 9, -1.6]], [1.3, [-0.6, 6, -1.4]], [1.45, [0, 0, 0]]],
                    rotation: [[0.75, [0, 0, 0]], [0.95, [0, 120, 0]], [1.2, [0, 240, 0]], [1.45, [0, 360, 0]]],
                },
                brasD: { rotation: [[0.6, [0, 0, 0]], [0.75, [0, 0, -14]], [0.9, [0, 0, 0]], [1.4, [0, 0, 0]], [1.48, [0, 0, -10]], [1.6, [0, 0, 0]]] },
                tete: { rotation: [[0.7, [0, 0, 0]], [0.95, [16, 0, 0]], [1.2, [16, 0, 0]], [1.45, [0, 0, 0]], [1.6, [0, 0, 8]], [1.8, [0, 0, 0]]] },
            },
        },
    },
};
