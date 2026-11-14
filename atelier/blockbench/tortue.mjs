// Tortue : elle porte une petite île sur son dos. Bloc d'herbe et de terre pour carapace, un arbre, un coffre.
// Au clic elle rentre la tête et les nageoires, l'arbre tremble.
import { COMMUN, IDLE, visage, mix, balance, tient, regarde, tic, paire } from './_style.mjs';

const Av = paire('patteAv', { parent: 'root', pivot: [3.3, 3.1, -2] }, { from: [3.2, 2.6, -3.4], to: [6.4, 3.5, -0.8], rot: [0, 18, -8], pivot: [3.3, 3.1, -2], faces: { all: 'v', up: ['vvvV', 'vvvV'], down: 'V' } });
const Ar = paire('patteAr', { parent: 'root', pivot: [3.3, 3.1, 3.2] }, { from: [3.2, 2.6, 2.2], to: [5.6, 3.4, 4.2], rot: [0, -22, -8], pivot: [3.3, 3.1, 3.2], faces: { all: 'v', down: 'V' } });
const rentre = (v) => ({ rotation: [[0, [0, 0, 0]], [0.25, v], [1.1, v], [1.4, [0, 0, 0]]] });

export default {
    name: 'tortue',
    title: 'Tortue',
    palette: { ...COMMUN, g: '#7cc950', G: '#5aa83a', d: '#9a6b45', D: '#7b5335', s: { c: '#8f8f93' }, v: '#a6dc80', V: '#7dbb5f', y: '#eee2a0', t: '#8a5a34', r: { c: '#e2483f' }, c: '#b9783a', o: { c: '#ffd24a' }, f: { c: '#fff3a0' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 3, 0.5] }, tete: { parent: 'corps', pivot: [0, 5, -3.4] }, queue: { parent: 'corps', pivot: [0, 3.2, 4.4] },
        arbre: { parent: 'corps', pivot: [0, 5.6, 0.8] }, ...Av.bones, ...Ar.bones,
    },
    cubes: [
        { name: 'ile', bone: 'corps', bord: 'bas', from: [-3.6, 2.4, -3.4], to: [3.6, 5.7, 4.4], faces: { all: ['gggggggg', 'gdggdggg', 'dddddddd', 'ddsddddd'], up: ['gggggggg', 'ggfggggg', 'gggggGgg', 'gggggggg', 'gGgggggg', 'ggggggfg', 'gggGgggg', 'gggggggg'], down: 'D' } },
        { name: 'dessous', bone: 'corps', bord: 'bas', from: [-2.3, 1.3, -2], to: [2.3, 2.4, 3], faces: { all: ['dsdd', 'DDDD'], down: 'D' } },
        { name: 'tronc', bone: 'arbre', bord: false, from: [-0.6, 5.7, 0.2], to: [0.6, 8.3, 1.4], faces: { all: 't' } },
        { name: 'feuillage', bone: 'arbre', from: [-1.9, 7.7, -1.1], to: [1.9, 10.5, 2.7], faces: { all: ['GGGG', 'GrGG', 'GGGG', 'GGGr'], up: 'G' } },
        { name: 'coffre', bone: 'corps', from: [1.5, 5.7, -2.7], to: [3.0, 7.0, -1.3], faces: { all: 'c', north: ['cccc', 'cooc', 'cccc', 'cccc'] } },
        { name: 'tete', bone: 'tete', from: [-2, 3.2, -7.4], to: [2, 7.4, -3.2], faces: { all: 'v', north: visage('v'), down: 'y' } },
        ...Av.cubes, ...Ar.cubes,
        { name: 'queue', bone: 'queue', from: [-0.5, 2.8, 4.3], to: [0.5, 3.6, 5.8], faces: { all: 'v' } },
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(regarde(undefined, IDLE, 10), balance('patteAvD', [0, 14, 10], IDLE, { tours: 2 }), balance('patteAvG', [0, -14, -10], IDLE, { tours: 2 }),
                balance('patteArD', [0, 10, 6], IDLE, { tours: 2, phase: 1 }), balance('patteArG', [0, -10, -6], IDLE, { tours: 2, phase: 1 }), balance('arbre', [0, 0, 3], IDLE, { tours: 2 }), tic('queue', [0, 20, 0], 2.6)),
        },
        walk: {
            length: 1.0,
            bones: mix(tient('corps', [-6, 0, 0]), balance('patteAvD', [0, 26, 14], 1.0), balance('patteAvG', [0, -26, -14], 1.0), balance('patteArD', [0, 16, 8], 1.0, { phase: 1 }), balance('patteArG', [0, -16, -8], 1.0, { phase: 1 }), balance('arbre', [5, 0, 0], 1.0)),
        },
        interact: {
            length: 1.5, loop: false,
            bones: {
                tete: { position: [[0, [0, 0, 0]], [0.25, [0, -0.4, 3.6]], [1.1, [0, -0.4, 3.6]], [1.25, [0, 0, -0.8]], [1.4, [0, 0, 0]]] },
                patteAvD: rentre([0, -75, 0]), patteAvG: rentre([0, 75, 0]), patteArD: rentre([0, 80, 0]), patteArG: rentre([0, -80, 0]),
                queue: { position: [[0, [0, 0, 0]], [0.25, [0, 0, -1.4]], [1.1, [0, 0, -1.4]], [1.4, [0, 0, 0]]] },
                arbre: { rotation: [[0.25, [0, 0, 0]], [0.4, [0, 0, 14]], [0.55, [0, 0, -14]], [0.7, [0, 0, 10]], [0.85, [0, 0, -10]], [1.0, [0, 0, 0]]] },
            },
        },
    },
};
