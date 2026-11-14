// Kappa : le petit esprit des rivières du folklore japonais, une coupelle d'eau sur le crâne, un concombre (son plat
// préféré) serré dans les bras. Très poli : au clic il salue bien bas, l'eau de sa coupelle se renverse, il panique,
// puis la coupelle se remplit à nouveau et il saute de soulagement.
// Inspiration : Japanese style Pets de niiwork Studio (https://mcmodels.net/products/17883/japanese-style-pets),
// redessiné au style du capybara.
import { mirrored, mirroredBone } from '../bbkit.mjs';
import { COMMUN, IDLE, WALK, DEUX, mix, balance, tient, respire, pendouille, pedale } from './_style.mjs';

const brasD = { parent: 'corps', pivot: [3.1, 6.1, -0.4], rot: [46, 0, -8] };
const jambeD = { parent: 'root', pivot: [1.5, 1.6, -0.4] };
const bras = { name: 'brasD', bone: 'brasD', seed: 'bras', from: [2.6, 3.5, -1.1], to: [3.8, 6.4, 0.3], faces: { all: 'g', down: 'f', up: 'G' } };
const jambe = { name: 'jambeD', bone: 'jambeD', seed: 'patte', from: [0.5, 0, -2.2], to: [2.5, 1.7, 0.6], faces: { all: 'f', north: ['ffff', 'ffff', 'fFfF', 'ffff'], up: ['fFfF', 'ffff', 'ffff', 'ffff'] } };
// Les deux mains portent le concombre jusqu'au bec, deux petits coups de bec
const croque = (k) => ({ rotation: [[2.9, [0, 0, 0]], [3.15, [36 * k, 0, 0]], [3.75, [36 * k, 0, 0]], [4.0, [0, 0, 0]]] });

export default {
    name: 'kappa',
    title: 'Kappa',
    palette: {
        ...COMMUN,
        g: '#6cc04a', G: '#4f9a36', v: '#dceb8f', f: '#a9d255', F: { c: '#6f9a2f' },
        h: '#2f9c94', y: '#f5c84a', Y: { c: '#c9962a' },
        c: '#a8743f', C: { c: '#6f4a28' }, l: '#d7ad6c',
        d: '#f3ead2', D: '#c9bfa6', e: '#5cb7ec', E: { c: '#d8f2ff' },
        q: '#3f8f3a', Q: { c: '#a6d77e' }, w: '#e9f5c9',
    },
    bones: {
        root: { pivot: [0, 0, 0] },
        corps: { parent: 'root', pivot: [0, 1.6, 0] },
        ventre: { parent: 'corps', pivot: [0, 1.4, 0] },
        tete: { parent: 'corps', pivot: [0, 6.2, -0.2] },
        eau: { parent: 'tete', pivot: [0, 12.3, -0.1] },
        brasD, brasG: mirroredBone(brasD),
        concombre: { parent: 'corps', pivot: [0, 4.5, -3.1] },
        jambeD, jambeG: mirroredBone(jambeD),
    },
    cubes: [
        {
            name: 'ventre', bone: 'ventre', from: [-2.8, 1.4, -2.2], to: [2.8, 6.4, 2.2],
            faces: { all: 'g', north: ['gvvvvvvg', 'gvvvvvvg', 'gvvvvvvg', 'gvvvvvvg', 'gvvvvvvg', 'gvvvvvvg', 'gvvvvvvg', 'ggvvvvgg'], down: 'G' },
        },
        {
            name: 'carapace', bone: 'corps', from: [-3.1, 1.7, 2.0], to: [3.1, 6.9, 4.1],
            faces: {
                all: ['llll', 'cccc', 'cccc', 'CCCC'],
                south: ['llllllll', 'lccCCccl', 'lcCccCcl', 'lCccccCl', 'lCccccCl', 'lcCccCcl', 'lccCCccl', 'llllllll'],
                up: 'l', down: 'C',
            },
        },
        {
            name: 'tete', bone: 'tete', from: [-3.4, 6.0, -3.3], to: [3.4, 11.4, 3.1],
            faces: {
                all: ['hhhhhhhh', 'hhhghhhg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg'],
                north: ['hhhhhhhh', 'ghhghhhg', 'gggggggg', 'gkggggkg', 'gkggggkg', 'bbggggbb', 'gggggggg', 'gggggggg'],
                south: ['hhhhhhhh', 'hhhhhhhh', 'ghhhhhhg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg'],
                up: 'h', down: 'G',
            },
        },
        {
            name: 'bec', bone: 'tete', from: [-1.3, 7.0, -4.5], to: [1.3, 8.4, -3.2],
            faces: { all: 'y', north: ['yyyyyyyy', 'yYyyyyYy', 'yyyyyyyy', 'YYYYYYYY'], down: 'Y' },
        },
        { name: 'coupelle', bone: 'tete', from: [-2.5, 11.3, -2.4], to: [2.5, 12.2, 2.2], faces: { all: 'd', up: ['dddd', 'dDDd', 'dDDd', 'dddd'], down: 'D' } },
        { name: 'eau', bone: 'eau', bord: false, from: [-1.9, 12.15, -1.8], to: [1.9, 12.45, 1.6], faces: { all: 'e', up: ['eeeeeeee', 'eEEeeeee', 'eEeeeeee', 'eeeeeeee', 'eeeeeeee', 'eeeeeEee', 'eeeeeeee', 'eeeeeeee'] } },
        bras, mirrored(bras, 'brasG', 'brasG'),
        {
            name: 'concombre', bone: 'concombre', from: [-3.6, 3.85, -3.75], to: [3.6, 5.15, -2.45], rot: [0, 0, 10], pivot: [0, 4.5, -3.1],
            faces: { all: ['qqQqqqQq', 'qQqqqQqq', 'qqqqQqqq', 'qQqqqqqQ'], east: ['wwww', 'wQQw', 'wQQw', 'wwww'], west: 'q' },
        },
        jambe, mirrored(jambe, 'jambeG', 'jambeG'),
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(
                respire('ventre', IDLE, 2, 0.035), pendouille(DEUX, 8), balance('eau', [0, 0, 4], IDLE, { tours: 2 }),
                {
                    // Regarde à droite, grignote son concombre, regarde à gauche
                    tete: { rotation: [[0, [0, 0, 0]], [0.5, [0, 10, 2]], [1.8, [0, 10, 2]], [2.4, [0, 0, 0]], [3.1, [-9, 0, 0]], [3.3, [-3, 0, 0]], [3.5, [-9, 0, 0]], [3.75, [0, 0, 0]], [4.3, [0, -10, -2]], [5.4, [0, -10, -2]], [5.9, [0, 0, 0]]] },
                    concombre: { position: [[2.9, [0, 0, 0]], [3.15, [0, 2.4, -0.9]], [3.75, [0, 2.4, -0.9]], [4.0, [0, 0, 0]]], rotation: [[3.15, [0, 0, 0]], [3.35, [0, 0, -7]], [3.55, [0, 0, 5]], [3.75, [0, 0, 0]]] },
                    brasD: croque(1), brasG: croque(1),
                },
            ),
        },
        walk: {
            length: WALK,
            bones: mix(pedale(DEUX, 28), tient('corps', [-4, 0, 0]), balance('tete', [0, 0, 5], WALK), balance('eau', [0, 0, 9], WALK, { phase: 1 })),
        },
        interact: {
            length: 1.9,
            loop: false,
            bones: {
                // Salut bien bas...
                corps: { rotation: [[0, [0, 0, 0], 'smooth'], [0.3, [-40, 0, 0], 'smooth'], [0.55, [-40, 0, 0], 'smooth'], [0.75, [0, 0, 0]]] },
                // ... l'eau de la coupelle glisse et tombe en s'amenuisant, puis revient remplir la coupelle
                eau: {
                    position: [[0, [0, 0, 0]], [0.3, [0, 0, 0]], [0.45, [0, 0.4, -2.6]], [0.6, [0, -1.4, -5.4]], [0.75, [0, -5, -7]], [0.8, [0, 0, 0]]],
                    rotation: [[0.3, [0, 0, 0]], [0.6, [-40, 0, 0]], [0.75, [-80, 0, 0]], [0.8, [0, 0, 0]]],
                    scale: [[0.3, [1, 1, 1]], [0.45, [1.1, 1, 1.25]], [0.75, [0.05, 0.05, 0.05]], [1.35, [0.05, 0.05, 0.05]], [1.6, [1, 1, 1]]],
                },
                // Panique : il secoue la tête, serre son concombre contre lui
                tete: { rotation: [[0.75, [0, 0, 0]], [0.85, [0, 18, 0]], [0.95, [0, -18, 0]], [1.05, [0, 15, 0]], [1.15, [0, -12, 0]], [1.25, [0, 0, 0]]] },
                concombre: { position: [[0.75, [0, 0, 0]], [0.85, [0, 1.3, 0.6]], [1.25, [0, 1.3, 0.6]], [1.4, [0, 0, 0]]] },
                brasD: { rotation: [[0.75, [0, 0, 0]], [0.85, [16, 0, 0]], [1.25, [16, 0, 0]], [1.4, [0, 0, 0]]] },
                brasG: { rotation: [[0.75, [0, 0, 0]], [0.85, [16, 0, 0]], [1.25, [16, 0, 0]], [1.4, [0, 0, 0]]] },
                // La coupelle est pleine : petit saut de soulagement
                root: { position: [[0, [0, 0, 0]], [1.4, [0, 0, 0]], [1.55, [0, 1.4, 0]], [1.7, [0, 0, 0]], [1.9, [0, 0, 0]]] },
            },
        },
    },
};
