// Axolotl : il nage dans l'air, branchies au vent, tout sourire. Au clic il fait le mort, comme le vrai : il se
// retourne sur le dos, les pattes en l'air qui tressaillent, puis se remet d'aplomb comme si de rien n'était.
import { COMMUN, IDLE, WALK, QUATRE, visage, mix, balance, tient, respire, regarde, pendouille, pedale, paire, pattes4 } from './_style.mjs';

const franges = ['gGgGgGgG', 'gGgGgGgG', 'gGgGgGgG', 'GGGGGGGG'];
const BR = paire('branchie', { parent: 'tete', pivot: [3.3, 4.6, -3] }, { bord: false, from: [3.3, 3.4, -3.4], to: [5.5, 7.6, -2.6], rot: [0, 0, -16], pivot: [3.3, 4.6, -3], faces: { all: 'G', north: franges, south: franges, up: 'g' } });
const HT = paire('houppe', { parent: 'tete', pivot: [2, 6.7, -3] }, { bord: false, from: [1.4, 6.6, -3.4], to: [2.6, 8.8, -2.6], rot: [0, 0, -24], pivot: [2, 6.7, -3], faces: { all: 'G', north: franges, south: franges, up: 'g' } });
const P = pattes4({ x: 2.5, zAv: -0.2, zAr: 3.6, size: [1.3, 1.7, 1.3], faces: { all: 'F', down: 'f' }, y: 0.5, parent: 'tout' });
const flanc = ['ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'fwwwwwwf', 'wwwwwwww', 'wwwwwwww'];
const frisson = (s) => ({ rotation: [[0.5, [0, 0, 0]], [0.65, [18 * s, 0, 0]], [0.8, [-18 * s, 0, 0]], [0.95, [18 * s, 0, 0]], [1.1, [-18 * s, 0, 0]], [1.25, [0, 0, 0]]] });

export default {
    name: 'axolotl',
    title: 'Axolotl',
    palette: { ...COMMUN, f: '#f9aac8', F: '#ee8cb3', w: '#fdd5e3', g: '#e25fa6', G: '#c4468b', b: '#f27fa6', M: { c: '#d9749e' }, u: { c: '#eef6ff' } },
    bones: {
        root: { pivot: [0, 0, 0] }, tout: { parent: 'root', pivot: [0, 3.6, 0.5] }, corps: { parent: 'tout', pivot: [0, 2.2, 1.8] }, ventre: { parent: 'corps', pivot: [0, 2, 1.8] }, tete: { parent: 'corps', pivot: [0, 3.4, -1.4] },
        queue: { parent: 'corps', pivot: [0, 3.4, 4.8] }, ...BR.bones, ...HT.bones, ...P.bones,
    },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'haut', from: [-2.5, 2, -1.6], to: [2.5, 5.2, 5], faces: { all: 'f', east: flanc, west: flanc, south: flanc, down: 'w' } },
        { name: 'tete', bone: 'tete', from: [-3.5, 1.6, -7.2], to: [3.5, 6.8, -1.3], faces: { all: 'f', north: visage('f', { ligne: 2, lignes: { 5: 'fffMMfff' } }), down: 'w' } },
        ...BR.cubes, ...HT.cubes,
        { name: 'crete', bone: 'ventre', bord: false, from: [-0.4, 5.2, -1.2], to: [0.4, 6.1, 4.8], faces: { all: 'g', up: 'G' } },
        { name: 'queue', bone: 'queue', bord: false, from: [-0.45, 2, 4.6], to: [0.45, 6, 9.2], faces: { all: 'f', east: ['gggggggg', 'ffffffff', 'ffffffff', 'ffffffff'], west: ['gggggggg', 'ffffffff', 'ffffffff', 'ffffffff'], up: 'g', south: 'g' } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.04), regarde(undefined, IDLE, 9, 3), balance('queue', [0, 16, 0], IDLE, { tours: 3 }), balance('branchieD', [0, 0, 8], IDLE, { tours: 2 }), balance('branchieG', [0, 0, -8], IDLE, { tours: 2 }), balance('houppeD', [0, 0, 7], IDLE, { tours: 2, phase: 1 }), balance('houppeG', [0, 0, -7], IDLE, { tours: 2, phase: 1 }), pendouille(QUATRE, 12)) },
        walk: { length: WALK, bones: mix(pedale(QUATRE, 30), tient('corps', [-5, 0, 0]), balance('queue', [0, 26, 0], WALK), tient('branchieD', [0, -24, 0]), tient('branchieG', [0, 24, 0])) },
        interact: {
            length: 1.8, loop: false,
            bones: {
                tout: { rotation: [[0, [0, 0, 0]], [0.15, [0, 0, 90]], [0.3, [0, 0, 180]], [1.3, [0, 0, 180]], [1.45, [0, 0, 270]], [1.6, [0, 0, 360]]], position: [[0, [0, 0, 0]], [0.15, [0, 1.5, 0]], [0.3, [0, -0.6, 0]], [0.4, [0, 0, 0]], [1.3, [0, 0, 0]], [1.45, [0, 1.5, 0]], [1.6, [0, 0, 0]]] },
                patteAvD: frisson(1), patteArG: frisson(1), patteAvG: frisson(-1), patteArD: frisson(-1),
                queue: { rotation: [[0.3, [0, 0, 0]], [0.5, [0, 30, 0]], [1.2, [0, 30, 0]], [1.4, [0, 0, 0]]] },
                tete: { rotation: [[1.6, [0, 0, 0]], [1.68, [0, 0, 8]], [1.74, [0, 0, -8]], [1.8, [0, 0, 0]]] },
            },
        },
    },
};
