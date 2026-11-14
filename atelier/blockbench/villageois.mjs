// Villageois : marchand ambulant, avec son vrai visage (sourcil, yeux verts, gros nez). Bras croisés au-dessus de son étal, où trônent une émeraude et une miche de pain.
// Au clic il fait non de la tête, présente son émeraude qui tourne, puis finit par dire oui.
import { COMMUN, IDLE, WALK, DEUX, mix, balance, tient, respire, regarde, pendouille, pedale, paire } from './_style.mjs';

const J = paire('jambe', { parent: 'root', pivot: [1.2, 1.6, 0] }, { from: [0.3, 0, -1.3], to: [2.1, 1.6, 1.1], faces: { all: 'd' } });

export default {
    name: 'villageois',
    title: 'Villageois',
    palette: { ...COMMUN, s: '#bd8b72', S: '#a67862', B: { c: '#3b2a20' }, v: { c: '#3f9a52' }, e: { c: '#ffffff' }, g: { c: '#2f8f3f' }, M: { c: '#8a5f4c' }, r: '#7a543c', R: '#946a4b', d: '#4a3528', y: '#e8ca62', Y: '#c9a53f', t: '#b9552f', w: '#b5854f', W: '#93693c' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.6, 0] }, ventre: { parent: 'corps', pivot: [0, 1.4, 0] }, tete: { parent: 'corps', pivot: [0, 6.8, 0] }, bras: { parent: 'corps', pivot: [0, 5.2, -1.6] }, emeraude: { parent: 'corps', pivot: [-1.6, 4.5, -4] }, ...J.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-2.6, 1.4, -1.8], to: [2.6, 6.8, 1.8], faces: { all: 'r', north: ['rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr', 'rrrRRrrr'] } },
        { name: 'tete', bone: 'tete', from: [-3.2, 6.6, -3.2], to: [3.2, 13.4, 3.2], faces: { all: 's', north: ['ssssssss', 'ssssssss', 'sBBBBBBs', 'segssges', 'ssssssss', 'ssssssss', 'ssMMMMss', 'ssssssss'] } },
        { name: 'nez', bone: 'tete', from: [-0.9, 6.9, -4.6], to: [0.9, 9.9, -3.2], faces: { all: 'S' } },
        { name: 'bras', bone: 'bras', from: [-3.4, 4.2, -2.9], to: [3.4, 6, -1.5], faces: { all: 'r', north: ['rrrssrrr', 'rrrssrrr'], up: 'R' } },
        { name: 'bord', bone: 'tete', bord: false, from: [-4.7, 13.2, -4.7], to: [4.7, 13.8, 4.7], faces: { all: 'Y', up: ['yYyYyYyY', 'YyYyYyYy', 'yYyYyYyY', 'YyYyYyYy', 'yYyYyYyY', 'YyYyYyYy', 'yYyYyYyY', 'YyYyYyYy'] } },
        { name: 'calotte', bone: 'tete', from: [-2.8, 13.8, -2.8], to: [2.8, 15.5, 2.8], faces: { all: ['yyyy', 'yyyy', 'tttt', 'tttt'], up: 'y' } },
        { name: 'etal', bone: 'corps', bord: false, from: [-3.4, 2.5, -5.2], to: [3.4, 3.2, -1.8], faces: { all: 'W', up: ['wwwwwwww', 'wWwwwwWw', 'wwwwwwww', 'wwwwwwww'] } },
        { name: 'emeraude', bone: 'emeraude', item: 'emerald', from: [-3, 3.2, -4.1], to: [-0.2, 6, -3.9], faces: { all: 'v' } },
        { name: 'pain', bone: 'corps', item: 'bread', from: [0.3, 3.1, -4.1], to: [3.1, 5.9, -3.9], faces: { all: 'y' } },
        ...J.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.035), regarde(undefined, IDLE, 10, 3), pendouille(DEUX, 8), balance('emeraude', [0, 0.3, 0], IDLE, { tours: 2, canal: 'position' })) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 28), tient('corps', [-4, 0, 0]), balance('tete', [0, 0, 4], WALK)) },
        interact: {
            length: 1.8, loop: false,
            bones: {
                tete: { rotation: [[0, [0, 0, 0]], [0.15, [0, 18, 0]], [0.35, [0, -18, 0]], [0.55, [0, 18, 0]], [0.7, [0, 0, 0]], [1.2, [0, 0, 0]], [1.35, [-14, 0, 0]], [1.5, [4, 0, 0]], [1.65, [0, 0, 0]]] },
                emeraude: { position: [[0.6, [0, 0, 0]], [0.9, [0, 2.4, -1.2]], [1.5, [0, 2.4, -1.2]], [1.8, [0, 0, 0]]], rotation: [[0.9, [0, 0, 0]], [1.1, [0, 120, 0]], [1.3, [0, 240, 0]], [1.5, [0, 360, 0]]] },
            },
        },
    },
};
