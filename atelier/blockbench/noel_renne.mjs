// Renne de Noël : un petit renne au nez rouge qui brille dans la nuit. Il rêve de tirer le traîneau du Père Noël et
// s'entraîne à voler. Assis, la tête penchée, pelage caramel, plastron crème, une oreille qui tombe, petits bois en
// fourche ; le nez est une pièce lumineuse (pleine lumière, même la nuit).
// Au clic il prend son élan et s'envole un instant en pédalant dans le vide, le nez qui grossit à chaque foulée,
// puis retombe sur les fesses et s'ébroue.
import { mirrored, mirroredBone } from '../bbkit.mjs';
import { COMMUN, IDLE, WALK, visage, mix, tient, respire, regarde, tic, pendouille, pedale } from './_style.mjs';

const DEUX = ['jambeD', 'jambeG'];
const flip = (rows) => rows.map((l) => [...l].reverse().join(''));
const z3 = (v) => [v, v, v];

const Y = 4.6; // bas de la tête (corps de 0,4 à 4,8)
// Flanc droit vu de l'extérieur (gauche du dessin = arrière) : la patte arrière repliée, son sabot devant
const flanc = ['ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'fffffwww', 'ffffwooo'];
const oreilleD = { parent: 'tete', pivot: [3.4, Y + 4.1, -1.2], rot: [0, 0, -6] };
const boisD = { parent: 'tete', pivot: [2.0, Y + 5.6, -0.9], rot: [10, 0, -15] };
const jambeD = { parent: 'corps', pivot: [1.5, 3.2, -1.9] };
const oreille = { name: 'oreilleD', bone: 'oreilleD', from: [3.3, Y + 3.4, -1.9], to: [6.0, Y + 4.9, -0.6], faces: { all: 'f', north: ['ffff', 'fppf', 'fppf', 'ffff'], down: 'F' } };
const bois = { name: 'boisD', bone: 'boisD', bord: 'bas', from: [1.5, Y + 5.4, -1.4], to: [2.5, Y + 9.8, -0.4], faces: { all: ['aaaa', 'aaaa', 'aaaa', 'AAAA'], up: 'a', down: 'A' } };
// Andouiller : part du milieu du bois, vers le haut et l'extérieur
const branche = { name: 'brancheD', bone: 'boisD', bord: false, from: [1.9, Y + 7.3, -1.35], to: [2.8, Y + 9.5, -0.45], rot: [0, 0, -38], pivot: [2.2, Y + 7.4, -0.9], faces: { all: 'a' } };
const jambe = { name: 'jambeD', bone: 'jambeD', from: [0.6, 0, -2.8], to: [2.4, 3.4, -1.0], faces: { all: ['ff', 'ff', 'ff', 'ff', 'ff', 'ww', 'oo', 'oo'], up: 'f', down: 'o' } };
const NZ = -5.9, NY = Y + 2.6;

// Réaction au clic, sur une même suite d'instants pour toutes les pièces (une image clé partagée ne coûte qu'un paquet
// par pièce) : élan 0,2 ; envol 0,45 ; foulées 0,58 / 0,7 / 0,83 ; retombée 1,15 ; posé 1,27 ; il s'ébroue de 1,4 à 1,9.
const vol = (a, b) => [[0, z3(0)], [0.2, [-22, 0, 0]], [0.45, [a, 0, 0]], [0.58, [b, 0, 0]], [0.7, [a, 0, 0]], [0.83, [b, 0, 0]], [0.95, [a * 0.85, 0, 0]], [1.15, [-14, 0, 0]], [1.4, z3(0)]];
const oreillesVol = (s) => ({
    rotation: [[0, z3(0)], [0.2, z3(0)], [0.45, [0, -32 * s, 12 * s]], [0.95, [0, -32 * s, 12 * s]], [1.15, [0, 0, -8 * s]], [1.4, z3(0)],
        [1.52, [0, 0, 16 * s]], [1.64, [0, 0, -12 * s]], [1.76, [0, 0, 10 * s]], [1.9, z3(0)]],
});

export default {
    name: 'noel_renne',
    title: 'Renne',
    palette: {
        ...COMMUN,
        f: '#c08a5e', F: '#a06c46', w: '#f4e6cb', o: '#5b4134', p: '#f1ad9b',
        a: '#7c5236', A: '#5e3d27', r: '#ee3b3b', R: '#ff9c8c', m: { c: '#8a5c3c' },
    },
    bones: {
        root: { pivot: [0, 0, 0] },
        corps: { parent: 'root', pivot: [0, 0.4, 0] },
        ventre: { parent: 'corps', pivot: [0, 0.4, 0.4] },
        // Tête penchée du côté de l'oreille qui tombe
        tete: { parent: 'corps', pivot: [0, Y + 0.4, -0.8], rot: [0, 0, 6] },
        nez: { parent: 'tete', pivot: [0, NY, NZ + 0.5] },
        oreilleD, oreilleG: { ...mirroredBone(oreilleD), rot: [0, 0, 24] },
        boisD, boisG: mirroredBone(boisD),
        jambeD, jambeG: mirroredBone(jambeD),
    },
    cubes: [
        {
            name: 'ventre', bone: 'ventre', from: [-2.9, 0.4, -2.0], to: [2.9, 4.8, 2.8],
            faces: {
                all: 'f', down: 'F', east: flanc, west: flip(flanc),
                north: ['ffwwwwff', 'fwwwwwwf', 'fwwwwwwf', 'ffwwwwff', 'fffwwfff', 'ffffffff', 'ffffffff', 'ffffffff'],
                // Queue blanche et croupe claire
                south: ['ffffffff', 'ffffffff', 'ffffffff', 'fffwwfff', 'ffwwwwff', 'fwwwwwwf', 'fwwwwwwf', 'ffwwwwff'],
            },
        },
        { name: 'tete', bone: 'tete', from: [-3.5, Y, -3.8], to: [3.5, Y + 5.8, 1.8], faces: { all: 'f', north: visage('f'), down: 'w' } },
        {
            name: 'museau', bone: 'tete', from: [-1.8, Y + 0.2, -4.9], to: [1.8, Y + 2.8, -3.8],
            faces: { all: 'w', north: ['wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwmmwww', 'wwwwwwww', 'wwwwwwww'] },
        },
        { name: 'nez', bone: 'nez', lumineux: true, from: [-1.0, NY - 0.8, NZ], to: [1.0, NY + 0.8, NZ + 1.1], faces: { all: 'r', north: ['RRrr', 'Rrrr', 'rrrr', 'rrrr'], up: ['RRrr', 'Rrrr', 'rrrr', 'rrrr'] } },
        oreille, mirrored(oreille, 'oreilleG', 'oreilleG'),
        bois, mirrored(bois, 'boisG', 'boisG'),
        branche, mirrored(branche, 'brancheG', 'boisG'),
        jambe, mirrored(jambe, 'jambeG', 'jambeG'),
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(
                respire('ventre', IDLE, 2, 0.04), regarde('tete', IDLE, 7, 2), tic('oreilleG', [0, 0, -18], 2.6), pendouille(DEUX, 9, IDLE, 1),
                // Le nez renifle
                { nez: { scale: [[3.9, z3(1)], [4.0, z3(1.18)], [4.1, z3(1)], [4.2, z3(1.15)], [4.3, z3(1)]] } },
            ),
        },
        walk: {
            length: WALK,
            bones: mix(tient('corps', [-10, 0, 0]), tient('tete', [7, 0, 0]), pedale(DEUX, 32), tient('oreilleD', [0, -25, 0]), tient('oreilleG', [0, 25, 0])),
        },
        interact: {
            length: 2.0,
            loop: false,
            bones: {
                // Élan, envol en pédalant dans le vide, retombée sur les fesses
                root: {
                    position: [[0, z3(0)], [0.2, [0, -0.8, 0]], [0.45, [0, 5, -0.8]], [0.7, [0, 6.4, -1.4]], [0.95, [0, 5.6, -1.6]], [1.15, z3(0)], [1.27, [0, 0.8, 0]], [1.4, z3(0)]],
                    rotation: [[0, z3(0)], [0.2, [6, 0, 0]], [0.45, [-24, 0, 0]], [0.7, [-28, 0, 0]], [0.95, [-22, 0, 0]], [1.15, [10, 0, 0]], [1.27, [4, 0, 0]], [1.4, z3(0)]],
                },
                // Les pattes avant galopent dans le vide, l'une après l'autre
                jambeD: { rotation: vol(72, 36) }, jambeG: { rotation: vol(36, 72) },
                oreilleD: oreillesVol(1), oreilleG: oreillesVol(-1),
                // Le nez grossit à chaque foulée
                nez: { scale: [[0.2, z3(1)], [0.45, z3(1.45)], [0.58, z3(1.2)], [0.7, z3(1.45)], [0.83, z3(1.2)], [0.95, z3(1.45)], [1.15, z3(1)]] },
                // Regarde droit devant en volant, puis s'ébroue une fois posé
                tete: { rotation: [[0, z3(0)], [0.2, [-6, 0, 0]], [0.45, [16, 0, 0]], [0.95, [16, 0, 0]], [1.15, [-6, 0, 0]], [1.4, z3(0)], [1.52, [0, 0, 13]], [1.64, [0, 0, -13]], [1.76, [0, 0, 8]], [1.9, z3(0)]] },
            },
        },
    },
};
