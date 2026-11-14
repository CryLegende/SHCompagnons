// Piquant : un bébé cactus qui sautille dans son pot, une fleur rose sur la tête. Côtes vert foncé, épines
// blanches, un grand bras levé et un petit. Au clic il bondit hors de son pot, bras en l'air et fleur qui tourne,
// retombe dedans et se tortille de joie.
// Le pot est le socle (os root) : il ne bouge pas, le cactus bouge dedans.
import { COMMUN, IDLE, WALK, mix, balance, tient, tic } from './_style.mjs';

// Corps : côtes verticales plus foncées (G), épines blanches (w), le visage du style sur la face avant
const flanc = ['gGgwgGgg', 'gGggggGw', 'wGggggGg', 'gGgggwGg', 'gGwgggGg', 'gGggggGg', 'gwggggGg', 'gGgggwGg'];
const face = ['gGgwgGgg', 'gGggggGg', 'wGggggGg', 'gGkggkGg', 'gGkggkGg', 'gbbggbbg', 'ggggwggg', 'gGggggGw'];
const dos = ['gGggwgGg', 'wGggggGg', 'gGgwggGg', 'gGggggGw', 'gGgggwGg', 'gwggggGg', 'gGggggGg', 'gGgwggGg'];
const bras = { all: ['gGgg', 'gggw', 'gGgg', 'wggg'], up: 'g' };

export default {
    name: 'piquant',
    title: 'Piquant',
    palette: {
        ...COMMUN,
        g: '#5cab4b', G: '#4b9440', w: '#e6eddc',
        o: '#b65a32', O: '#e47c45', s: { c: '#4a3122' },
        p: '#f29ab6', P: '#e57ba0', y: '#ffd23f',
    },
    bones: {
        root: { pivot: [0, 0, 0] },
        cactus: { parent: 'root', pivot: [0, 7, 0] },
        corps: { parent: 'cactus', pivot: [0, 7, 0] },
        fleur: { parent: 'corps', pivot: [0, 15.5, 0] },
        brasD: { parent: 'cactus', pivot: [3, 9.9, 0] },
        brasG: { parent: 'cactus', pivot: [-3, 10.2, 0] },
    },
    cubes: [
        { name: 'pot', bone: 'root', from: [-3.4, 0, -3.4], to: [3.4, 5.4, 3.4], faces: { all: 'o' } },
        { name: 'rebord', bone: 'root', bord: false, from: [-4.2, 5.2, -4.2], to: [4.2, 7, 4.2], faces: { all: 'O', up: ['OOOOOOOO', 'OssssssO', 'OssssssO', 'OssssssO', 'OssssssO', 'OssssssO', 'OssssssO', 'OOOOOOOO'] } },
        { name: 'corps', bone: 'corps', from: [-3, 6, -3], to: [3, 14, 3], faces: { all: flanc, north: face, south: dos, up: 'g' } },
        { name: 'sommet', bone: 'corps', from: [-2.1, 14, -2.1], to: [2.1, 15.5, 2.1], faces: { all: ['gGgG', 'gggg'], up: 'g' } },
        // Grand bras levé (côté droit) : un coude qui sort du corps puis l'avant-bras dressé
        { name: 'coude', bone: 'brasD', from: [2.8, 9, -0.9], to: [4.8, 10.8, 0.9], faces: { all: 'g', east: 'G' } },
        { name: 'avantBras', bone: 'brasD', from: [4.2, 9, -1], to: [6.2, 13.6, 1], faces: bras },
        // Petit bras de l'autre côté, un peu écarté
        { name: 'petitBras', bone: 'brasG', from: [-4.7, 9.6, -0.9], to: [-2.8, 12.2, 0.9], pivot: [-3, 10.2, 0], rot: [0, 0, 14], faces: bras },
        // Fleur : deux pétales croisés et un cœur jaune
        { name: 'petales', bone: 'fleur', from: [-2.3, 15.4, -0.9], to: [2.3, 16.3, 0.9], faces: { all: 'p', up: ['PppP', 'pppp'] } },
        { name: 'petales2', bone: 'fleur', from: [-0.9, 15.4, -2.3], to: [0.9, 16.3, 2.3], faces: { all: 'p', up: ['pp', 'pp', 'pp', 'pp'] } },
        { name: 'coeur', bone: 'fleur', from: [-0.7, 16.2, -0.7], to: [0.7, 16.9, 0.7], faces: { all: 'y' } },
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(
                balance('cactus', [0, 0, 3], IDLE, { tours: 1 }),
                { corps: { scale: [[0, [1, 1, 1]], [1.5, [1.03, 1.04, 1.03]], [3, [1, 1, 1]], [4.5, [1.03, 1.04, 1.03]], [6, [1, 1, 1]]] } },
                tic('brasD', [0, 0, 18], 2.2),
                balance('brasG', [0, 0, 6], IDLE, { tours: 2 }),
                tic('fleur', [0, 25, 6], 4.4),
            ),
        },
        walk: {
            length: WALK,
            // Il sautille dans son pot : un petit bond par pas, bras qui ballottent
            bones: mix(
                { cactus: { position: [[0, [0, 0, 0]], [0.35, [0, 1.4, 0]], [0.7, [0, 0, 0]]] } },
                tient('corps', [-5, 0, 0]),
                { brasD: { rotation: [[0, [0, 0, 0]], [0.35, [0, 0, 12]], [0.7, [0, 0, 0]]] }, brasG: { rotation: [[0, [0, 0, 0]], [0.35, [0, 0, -14]], [0.7, [0, 0, 0]]] } },
            ),
        },
        interact: {
            length: 1.7,
            loop: false,
            bones: {
                cactus: {
                    position: [[0, [0, 0, 0]], [0.15, [0, -0.8, 0]], [0.45, [0, 6, 0]], [0.55, [0, 6.4, 0]], [0.8, [0, 0, 0]], [0.95, [0, 1.6, 0]], [1.1, [0, 0, 0]], [1.7, [0, 0, 0]]],
                    rotation: [[1.1, [0, 0, 0]], [1.2, [0, 0, 6]], [1.3, [0, 0, -6]], [1.4, [0, 0, 4]], [1.5, [0, 0, -3]], [1.6, [0, 0, 0]]],
                },
                corps: { scale: [[0, [1, 1, 1]], [0.15, [1.08, 0.88, 1.08]], [0.35, [0.95, 1.08, 0.95]], [0.55, [1, 1, 1]], [0.8, [1.08, 0.9, 1.08]], [0.95, [1, 1, 1]], [1.1, [1.04, 0.95, 1.04]], [1.2, [1, 1, 1]]] },
                fleur: { rotation: [[0.3, [0, 0, 0]], [0.45, [0, 120, 0]], [0.6, [0, 240, 0]], [0.75, [0, 360, 0]]] },
                brasD: { rotation: [[0.15, [0, 0, 0]], [0.35, [0, 0, 35]], [0.7, [0, 0, 35]], [0.85, [0, 0, 0]]] },
                brasG: { rotation: [[0.15, [0, 0, 0]], [0.35, [0, 0, -45]], [0.7, [0, 0, -45]], [0.85, [0, 0, 0]]] },
            },
        },
    },
};
