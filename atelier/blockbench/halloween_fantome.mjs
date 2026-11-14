// Fantôme d'Halloween : un petit fantôme en drap rapiécé parti à la chasse aux bonbons. Il traîne un pan de drap
// derrière lui et porte son seau citrouille plein à craquer, une sucette plantée de travers dedans.
// Au clic il fait « bouh » : il se dresse, les bras en l'air, et la sucette saute hors du seau.
import { COMMUN, IDLE, WALK, frimousse, mix, balance, tient, regarde, paire } from './_style.mjs';

const B = paire('bras', { parent: 'corps', pivot: [2.9, 7.4, 0] }, { from: [2.9, 6.2, -1], to: [4.9, 7.7, 1], rot: [0, 0, -22], pivot: [2.9, 7.4, 0], faces: { all: 'w', east: 'W', down: 'W' } });
const haut = (s) => ({ rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 70 * s]], [0.35, [0, 0, 55 * s]], [0.5, [0, 0, 70 * s]], [0.65, [0, 0, 55 * s]], [0.8, [0, 0, 70 * s]], [1.1, [0, 0, 70 * s]], [1.35, [0, 0, 0]]] });

export default {
    name: 'halloween_fantome',
    title: 'Fantôme',
    palette: { ...COMMUN, w: '#f7f9fc', W: '#dbe2ec', k: { c: '#2b2530' }, b: '#f3a8b4', p: '#bcd6f2', P: { c: '#7f9fc4' }, o: '#f58a1f', O: '#d96f12', n: { c: '#3a2a22' }, t: '#f4efe6', f: '#ff7fb0', F: { c: '#ffffff' }, v: '#9b5de5', V: '#7a44c4', y: { c: '#ffd84a' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.4, 0] }, drap: { parent: 'corps', pivot: [0, 2.4, 0] }, traine: { parent: 'corps', pivot: [0, 2.6, 2.4] }, pan: { parent: 'corps', pivot: [2.2, 1.8, -2.9] }, ...B.bones,
        seau: { parent: 'brasG', pivot: [-4.4, 6.2, 0] }, sucette: { parent: 'seau', pivot: [-4.8, 5.4, -0.2], rot: [0, 0, 20] },
    },
    cubes: [
        { name: 'drap', bone: 'drap', bord: 'haut', from: [-2.9, 3.2, -2.6], to: [2.9, 11.6, 2.6], faces: { all: 'w', north: frimousse('w', { ligne: 2 }) } },
        { name: 'ourlet', bone: 'drap', bord: false, from: [-3.4, 1.8, -3.1], to: [3.4, 3.6, 3.1], faces: { all: ['wwwwwwww', 'wwwwwwww', 'wWwwWwwW', 'WwwWwwWw'], up: 'w', down: 'W' } },
        { name: 'pan', bone: 'pan', bord: false, from: [1.2, 0.5, -3.05], to: [3.2, 1.9, -2.7], faces: { all: ['wwww', 'wWwW'] } },
        { name: 'traine', bone: 'traine', bord: false, from: [-1.7, 0.6, 2.2], to: [1.7, 2.6, 4.8], rot: [-22, 0, 0], pivot: [0, 2.6, 2.4], faces: { all: 'w', south: ['wwww', 'wWwW'], down: 'W' } },
        { name: 'piece', bone: 'drap', bord: false, from: [0.7, 4.3, -2.78], to: [2.3, 5.9, -2.6], faces: { all: 'p', north: ['PpPp', 'pppP', 'Pppp', 'pPpP'] } },
        ...B.cubes,
        // Le seau citrouille pend à la main gauche du fantôme (à droite pour qui regarde)
        { name: 'seau', bone: 'seau', from: [-5.5, 3, -1.2], to: [-3.3, 5.2, 1], faces: { all: ['oOoOoOoO'], north: ['oooooooo', 'onoooono', 'oooooooo', 'onnnnnno'], up: ['OOOO', 'OnnO', 'OnnO', 'OOOO'], down: 'O' } },
        { name: 'baton', bone: 'sucette', bord: false, from: [-5, 5, -0.4], to: [-4.6, 7.4, 0], faces: { all: 't' } },
        { name: 'sucette', bone: 'sucette', bord: false, from: [-5.7, 7.2, -0.6], to: [-3.9, 9, 0.2], faces: { all: 'f', north: ['fFFf', 'FffF', 'FfFF', 'fFFf'], south: ['fFFf', 'FffF', 'FfFF', 'fFFf'] } },
        { name: 'bonbon', bone: 'seau', bord: false, from: [-4.3, 5, 0], to: [-3.4, 5.9, 0.8], rot: [0, 20, 15], pivot: [-3.8, 5.2, 0.4], faces: { all: 'v', north: ['vyv', 'vyv'].map((l) => l + 'v'), up: 'V' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde('drap', IDLE, 10, 3), balance('corps', [0, 0, 3], IDLE, { tours: 2 }), balance('traine', [0, 12, 0], IDLE, { tours: 3 }), balance('pan', [8, 0, 0], IDLE, { tours: 3 }), balance('seau', [0, 0, 6], IDLE, { tours: 2, phase: 1 }), balance('brasD', [0, 0, 6], IDLE, { tours: 2 })) },
        walk: { length: WALK, bones: mix(tient('corps', [-12, 0, 0]), tient('traine', [-26, 0, 0]), balance('pan', [14, 0, 0], WALK), balance('seau', [10, 0, 0], WALK)) },
        interact: {
            length: 1.5, loop: false,
            bones: {
                corps: { position: [[0, [0, 0, 0]], [0.2, [0, 2.2, 0]], [1.1, [0, 2.2, 0]], [1.35, [0, 0, 0]]], rotation: [[0.2, [0, 0, 0]], [0.35, [0, 0, 6]], [0.5, [0, 0, -6]], [0.65, [0, 0, 6]], [0.8, [0, 0, -6]], [0.95, [0, 0, 0]]] },
                drap: { scale: [[0, [1, 1, 1]], [0.2, [1.08, 1.14, 1.08]], [1.1, [1.08, 1.14, 1.08]], [1.35, [1, 1, 1]]] },
                brasD: haut(1), brasG: haut(-1),
                sucette: { position: [[0.2, [0, 0, 0]], [0.5, [0, 3.4, 0]], [0.8, [0, 0, 0]], [0.9, [0, 0.7, 0]], [1, [0, 0, 0]]], rotation: [[0.2, [0, 0, 0]], [0.5, [0, 180, 0]], [0.8, [0, 360, 0]]] },
            },
        },
    },
};
