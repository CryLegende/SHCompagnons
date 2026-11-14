// Boulon, le robot à remonter : tête-écran aux yeux cyan, cœur rouge sur la poitrine, antenne à boule rouge, clé de
// remontage plantée dans le dos qui tourne doucement. Au clic on le remonte : la clé tourne à toute vitesse, il
// s'agite en cliquetant, agite les bras, puis sautille de joie.
import { mirrored, mirroredBone, mirroredKeys } from '../bbkit.mjs';
import { COMMUN, IDLE, WALK, mix, balance, tient, pendouille, pedale, DEUX } from './_style.mjs';

const brasD = { parent: 'corps', pivot: [4.1, 7.4, 0], rot: [0, 0, 6] };
const jambeD = { parent: 'root', pivot: [2, 2.6, 0] };
const bras = { name: 'brasD', bone: 'brasD', from: [3.5, 3.3, -1.3], to: [5, 7.6, 1.3], faces: { all: ['aaaa', 'aaaa', 'aaaa', 'AAAA'], up: 'a', down: 'A' } };
const jambe = { name: 'jambeD', bone: 'jambeD', from: [0.9, 0, -1.3], to: [3.2, 2.8, 1.3], faces: { all: ['dd', 'dd', 'dd', 'DD'], up: 'd', down: 'D' } };
// Flancs et dos du corps : plaque gris-bleu, rivets sombres aux coins
const plaque = ['rggggggr', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'rggggggr'];
// Clé de remontage vue de côté : deux ailettes dorées percées
const ailette = ['oooooooo', 'oKKooKKo', 'oKKooKKo', 'oooooooo', 'ooooooOo', 'oKKooKKo', 'oKKooKKo', 'oooooooo'];

// Remontage : la clé fait trois tours en une seconde
const remonte = [];
for (let i = 0; i <= 9; i++) remonte.push([Math.round((0.05 + i * 0.1) * 100) / 100, [0, 0, -120 * i]]);
const brasAgites = { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 70]], [0.35, [0, 0, 30]], [0.5, [0, 0, 75]], [0.65, [0, 0, 30]], [0.8, [0, 0, 75]], [0.95, [0, 0, 30]], [1.15, [0, 0, 110]], [1.45, [0, 0, 110]], [1.7, [0, 0, 0]]] };

export default {
    name: 'boulon',
    title: 'Boulon',
    palette: {
        ...COMMUN,
        g: '#a3c3c6', G: '#7f9fa3', r: '#5b7a7f', a: '#86a8ad', A: '#6a8b90', d: '#64858a', D: '#4f6d72',
        s: { c: '#142029' }, c: { c: '#53e0d2' }, C: { c: '#3bb0a6' }, h: '#e0414f', H: '#b42f3c',
        t: '#5c7276', p: '#e8434a', o: '#f0bd3c', O: '#cf9a26', K: '#a87a1c',
    },
    bones: {
        root: { pivot: [0, 0, 0] },
        corps: { parent: 'root', pivot: [0, 2.6, 0] },
        tete: { parent: 'corps', pivot: [0, 8.2, 0] },
        antenne: { parent: 'tete', pivot: [0, 14.2, 0] },
        cle: { parent: 'corps', pivot: [0, 5.6, 4.6] },
        brasD, brasG: mirroredBone(brasD),
        jambeD, jambeG: mirroredBone(jambeD),
    },
    cubes: [
        { name: 'corps', bone: 'corps', from: [-3.5, 2.6, -3], to: [3.5, 8.2, 3], faces: { all: plaque, up: 'g', down: 'G' } },
        { name: 'coeur', bone: 'corps', from: [-1.15, 4.3, -3.5], to: [1.15, 6.5, -2.9], faces: { all: 'h', north: ['hhhh', 'hhhh', 'hhhh', 'HHHH'] } },
        {
            name: 'tete', bone: 'tete', from: [-4, 8.2, -3.5], to: [4, 14.2, 3.5],
            faces: {
                all: plaque, up: ['rggggggr', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'rggggggr'], down: 'G',
                north: ['rggggggr', 'gssssssg', 'gscssCsg', 'gscssCsg', 'gsCssCsg', 'gssccssg', 'gggccggg', 'rggggggr'],
            },
        },
        { name: 'boulons', bone: 'tete', from: [-4.7, 9.9, -1.4], to: [4.7, 12.7, 1.4], faces: { all: 'a', east: ['aaaa', 'aAAa', 'aAAa', 'aaaa'], west: ['aaaa', 'aAAa', 'aAAa', 'aaaa'] } },
        { name: 'antenne', bone: 'antenne', bord: false, from: [-0.45, 14.2, -0.45], to: [0.45, 16.6, 0.45], faces: { all: 't' } },
        { name: 'boule', bone: 'antenne', from: [-1.1, 16.4, -1.1], to: [1.1, 18.6, 1.1], faces: { all: ['pppp', 'pppp', 'pppp', 'HHHH'], up: 'p' } },
        { name: 'tige', bone: 'corps', bord: false, from: [-0.5, 5.1, 3], to: [0.5, 6.1, 4.8], faces: { all: 'O' } },
        { name: 'cle', bone: 'cle', from: [-0.35, 3.2, 4.6], to: [0.35, 8, 6.6], faces: { all: 'o', east: ailette, west: ailette, up: 'o', down: 'O' } },
        bras, mirrored(bras, 'brasG', 'brasG'),
        jambe, mirrored(jambe, 'jambeG', 'jambeG'),
    ],
    animations: {
        // La clé tourne doucement (il se déremonte), l'antenne se balance, tête qui pivote par crans comme un jouet
        idle: {
            length: IDLE,
            bones: mix(
                { cle: { rotation: [[0, [0, 0, 0]], [2, [0, 0, -120]], [4, [0, 0, -240]], [6, [0, 0, -360]]] } },
                balance('antenne', [0, 0, 9], IDLE, { tours: 2 }),
                { tete: { rotation: [[0, [0, 0, 0]], [1.2, [0, 0, 0]], [1.3, [0, 14, 0]], [2.4, [0, 14, 0]], [2.5, [0, 0, 0]], [3.7, [0, 0, 0]], [3.8, [0, -14, 0]], [4.9, [0, -14, 0]], [5.0, [0, 0, 0]]] } },
                pendouille(['brasD', 'brasG'], 6, IDLE, 1), pendouille(DEUX, 8, IDLE, 2),
            ),
        },
        // Il trottine : jambes qui piétinent, bras qui balancent, antenne couchée par le vent
        walk: {
            length: WALK,
            bones: mix(
                pedale(DEUX, 30), balance('brasD', [-28, 0, 0], WALK), balance('brasG', [28, 0, 0], WALK),
                tient('corps', [-6, 0, 0]),
                tient('antenne', [14, 0, 0]),
            ),
        },
        // On le remonte : la clé fait trois tours, il cliquette d'un côté à l'autre, agite les bras, puis bondit de joie
        interact: {
            length: 1.8,
            loop: false,
            bones: {
                cle: { rotation: [[0, [0, 0, 0]], ...remonte, [1.8, [0, 0, -1080]]] },
                corps: { rotation: [[0, [0, 0, 0]], [0.1, [0, 0, 7]], [0.2, [0, 0, -7]], [0.3, [0, 0, 7]], [0.4, [0, 0, -7]], [0.5, [0, 0, 7]], [0.6, [0, 0, -7]], [0.7, [0, 0, 7]], [0.8, [0, 0, -7]], [0.95, [0, 0, 0]]] },
                root: { position: [[0, [0, 0, 0]], [1.0, [0, 0, 0]], [1.1, [0, -0.6, 0]], [1.3, [0, 3, 0]], [1.5, [0, 0, 0]], [1.6, [0, 0.8, 0]], [1.7, [0, 0, 0]]] },
                brasD: brasAgites, brasG: mirroredKeys(brasAgites),
                antenne: { rotation: [[0, [0, 0, 0]], [0.15, [0, 0, -18]], [0.3, [0, 0, 18]], [0.45, [0, 0, -18]], [0.6, [0, 0, 18]], [0.75, [0, 0, -18]], [0.9, [0, 0, 18]], [1.05, [0, 0, 0]], [1.3, [-20, 0, 0]], [1.5, [12, 0, 0]], [1.7, [0, 0, 0]]] },
                tete: { rotation: [[1.0, [0, 0, 0]], [1.3, [8, 0, 0]], [1.55, [0, 0, 0]]] },
            },
        },
    },
};
