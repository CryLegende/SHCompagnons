// Carton : un chat qui ne quitte jamais, jamais son carton. Il dépasse du carton, pattes blanches posées sur le
// bord, rabats ouverts de chaque côté. Au clic il plonge au fond du carton (les oreilles et le bout de la queue
// dépassent encore), jette un œil par-dessus le bord, puis ressort d'un coup.
// Le carton est le socle (os root) : il ne bouge pas, le chat bouge dedans.
import { mirroredBone, mirroredKeys } from '../bbkit.mjs';
import { COMMUN, IDLE, WALK, frimousse, mix, balance, tient, regarde, tic, paire } from './_style.mjs';

const HAUT = 7.5; // haut du carton
const vol = { parent: 'root', pivot: [5, HAUT, 0] };
const O = paire('oreille', { parent: 'tete', pivot: [2.4, 13.45, -1.8] }, { from: [1.2, 13.25, -2.6], to: [3.6, 15.55, -1.0], faces: { all: 'g', north: ['gggg', 'gppg', 'gppg', 'gppg'], up: 'g' } });
const P = paire('patte', { parent: 'chat', pivot: [1.8, 7.7, -4.0] }, { from: [0.6, 6.9, -5.4], to: [3.0, 8.3, -3.4], faces: { all: 'w', north: ['wwww', 'wwww', 'wwww', 'wWwW'] } });
// Pétrissage : une patte appuie puis remonte, l'autre ensuite
const appuie = (t) => [[t, [0, 0, 0]], [t + 0.2, [0, -0.6, 0]], [t + 0.4, [0, 0, 0]]];
const rabat = (s) => ({ rotation: [[0.25, [0, 0, 0]], [0.35, [0, 0, 18 * s]], [0.5, [0, 0, -6 * s]], [0.62, [0, 0, 0]], [1.55, [0, 0, 0]], [1.65, [0, 0, -12 * s]], [1.8, [0, 0, 0]]] });
const cache = { position: [[0.1, [0, 0, 0]], [0.2, [0, 0.3, 2.4]], [1.5, [0, 0.3, 2.4]], [1.62, [0, 0, 0]]] };
const frisson = { rotation: [[0.6, [0, 0, 0]], [0.68, [0, 0, -30]], [0.76, [0, 0, 0]], [0.84, [0, 0, -30]], [0.92, [0, 0, 0]]] };
// Carton : ruban adhésif au milieu des grandes faces, croix sur un flanc, flèche « haut » sur l'autre
const ruban = ['cccTTccc', 'cccTTccc', 'cccTTccc', 'cccTTccc', 'cccTTccc', 'cccTTccc', 'cccTTccc', 'cccTTccc'];
const croix = ['cccccccc', 'cccccccc', 'ccXccccc', 'cXXXcccc', 'ccXccccc', 'cccccccc', 'cccccccc', 'cccccccc'];
const fleche = ['cccXXccc', 'ccXXXXcc', 'cXXXXXXc', 'cccXXccc', 'cccXXccc', 'cccccccc', 'cXXXXXXc', 'cccccccc'];

export default {
    name: 'carton',
    title: 'Carton',
    palette: {
        ...COMMUN,
        c: '#b48a55', T: '#d8bf86', X: { c: '#7a5a36' }, e: '#c99f68', d: { c: '#4f3a22' }, f: '#b88f5a', F: '#d9b37c',
        g: '#9c9ca8', G: '#868692', p: '#e3909e', P: { c: '#d9707e' }, w: '#efece6', W: '#d6d0c8', t: '#74747f',
    },
    bones: {
        root: { pivot: [0, 0, 0] },
        volD: vol, volG: mirroredBone(vol),
        chat: { parent: 'root', pivot: [0, 6.5, 0] },
        tete: { parent: 'chat', pivot: [0, 7.5, -0.3] },
        ...O.bones, ...P.bones,
        queue: { parent: 'root', pivot: [3.8, 6.5, 3.7] },
    },
    cubes: [
        { name: 'carton', bone: 'root', from: [-5, 0, -4.5], to: [5, HAUT, 4.5], faces: { all: 'c', north: ruban, south: ruban, east: croix, west: fleche, up: ['eeeeeeee', 'edddddde', 'edddddde', 'edddddde', 'edddddde', 'edddddde', 'edddddde', 'eeeeeeee'] } },
        { name: 'volD', bone: 'volD', bord: false, from: [5, HAUT - 0.6, -4.5], to: [10, HAUT, 4.5], pivot: [5, HAUT, 0], rot: [0, 0, 32], faces: { all: 'f', up: 'F' } },
        { name: 'volG', bone: 'volG', bord: false, from: [-10, HAUT - 0.6, -4.5], to: [-5, HAUT, 4.5], pivot: [-5, HAUT, 0], rot: [0, 0, -32], faces: { all: 'f', up: 'F' } },
        { name: 'tete', bone: 'tete', from: [-4, 6.45, -3.8], to: [4, 13.45, 3.2], faces: { all: 'g', north: frimousse('g', { lignes: { 5: 'gbbPPbbg' } }), up: 'g' } },
        ...O.cubes,
        ...P.cubes,
        { name: 'queue', bone: 'queue', from: [3.0, 5.5, 2.9], to: [4.6, 12.2, 4.5], pivot: [3.8, 6.5, 3.7], rot: [24, 0, -28], faces: { all: 't', up: 'G' } },
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(
                regarde('tete', IDLE, 10, 3),
                tic('oreilleD', [0, 0, -25], 2.4), tic('oreilleG', [0, 0, 25], 4.7),
                balance('queue', [0, 0, 8], IDLE, { tours: 2 }),
                { patteD: { position: [...appuie(3.0), ...appuie(3.8)] }, patteG: { position: [...appuie(3.4), ...appuie(4.2)] } },
            ),
        },
        walk: {
            length: WALK,
            bones: mix(
                tient('chat', [0, -0.8, 0], 'position'),
                tient('oreilleD', [30, 0, -10]), tient('oreilleG', [30, 0, 10]),
                balance('queue', [0, 0, 14], WALK),
                balance('volD', [0, 0, 10], WALK), balance('volG', [0, 0, -10], WALK),
            ),
        },
        interact: {
            length: 1.8,
            loop: false,
            bones: {
                chat: { position: [[0, [0, 0, 0]], [0.12, [0, 0.7, 0]], [0.3, [0, -6.3, 0]], [0.38, [0, -5.7, 0]], [0.46, [0, -6.3, 0]], [1.05, [0, -6.3, 0]], [1.2, [0, -1.5, 0]], [1.45, [0, -1.5, 0]], [1.6, [0, 0.8, 0]], [1.7, [0, 0, 0]], [1.8, [0, 0, 0]]] },
                tete: { rotation: [[1.2, [0, 0, 0]], [1.28, [0, 14, 0]], [1.38, [0, -14, 0]], [1.46, [0, 0, 0]]] },
                oreilleD: frisson, oreilleG: mirroredKeys(frisson),
                queue: {
                    position: [[0.12, [0, 0, 0]], [0.32, [0, -3.5, 0]], [1.15, [0, -3.5, 0]], [1.55, [0, 0, 0]]],
                    rotation: [[0.4, [0, 0, 0]], [0.55, [0, 0, 15]], [0.7, [0, 0, -15]], [0.85, [0, 0, 15]], [1.0, [0, 0, 0]]],
                },
                // Les pattes passent derrière le bord avant de descendre (sinon elles glissent devant le carton)
                patteD: cache, patteG: cache,
                volD: rabat(1), volG: rabat(-1),
            },
        },
    },
};
