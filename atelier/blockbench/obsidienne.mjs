// Obsidienne : un escargot dont la coquille est un petit portail du Nether. Corps lavande, cadre d'obsidienne
// ébréché (un bloc qui pleure en haut, un bloc tombé devant), voile violet translucide. Au clic il rentre dans son portail et en ressort.
import { COMMUN, IDLE, WALK, frimousse, mix, balance, regarde, tic, paire } from './_style.mjs';

const A = paire('antenne', { parent: 'tete', pivot: [1.1, 6.2, -4.6] }, { from: [0.8, 6.1, -4.9], to: [1.5, 8.7, -4.2], rot: [-10, 0, -14], pivot: [1.1, 6.2, -4.6], faces: { all: ['l', 'l', 'l', 'P'], up: 'P' } });
const cadre = ['oooooooo', 'oppppppo', 'oppPpppo', 'opPppPpo', 'oppppppo', 'opPpPppo', 'oppppppo', 'oooooooo'];
const cache = (v) => ({ position: [[0, [0, 0, 0]], [0.3, v], [1.1, v], [1.35, [0, 0.4, -0.6]], [1.5, [0, 0, 0]]], scale: [[0, [1, 1, 1]], [0.3, [0.15, 0.15, 0.15]], [1.1, [0.15, 0.15, 0.15]], [1.35, [1.1, 1.1, 1.1]], [1.5, [1, 1, 1]]] });

export default {
    name: 'obsidienne',
    title: 'Obsidienne',
    palette: { ...COMMUN, l: '#c7adf7', L: '#a98ce6', o: '#3a2e54', p: '#8f4fe6', P: { c: '#dcb4ff' }, v: '#a060f0a0', b: '#e58fc4' },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.2, 0] }, pied: { parent: 'corps', pivot: [0, 0, 0.3] }, tete: { parent: 'corps', pivot: [0, 2.6, -3] }, coquille: { parent: 'corps', pivot: [0, 2.4, 1.6] }, ...A.bones,
    },
    cubes: [
        { name: 'pied', bone: 'pied', from: [-2.2, 0, -5], to: [2.2, 2.4, 5.6], faces: { all: 'l', down: 'L', south: 'L' } },
        { name: 'tete', bone: 'tete', from: [-2, 2.4, -6.2], to: [2, 6.2, -2.8], faces: { all: 'l', north: frimousse('l', { ligne: 2 }) } },
        ...A.cubes,
        { name: 'coquille', bone: 'coquille', bord: false, from: [-1.3, 2.3, -2.4], to: [1.3, 10.6, 5.2], faces: { all: 'o', east: cadre, west: cadre } },
        { name: 'voile', bone: 'coquille', bord: false, block: 'purple_stained_glass', from: [-1.6, 3.3, -1.4], to: [1.6, 9.6, 4.2], faces: { all: 'v' } },
        { name: 'pleureuse', bone: 'coquille', from: [-1.5, 9.4, 3.2], to: [1.5, 11.6, 5.5], faces: { all: ['oooo', 'oPoo', 'ooPo', 'oPoo'], up: ['oooo', 'oPoo', 'ooPo', 'oooo'] } },
        { name: 'tombe', bone: 'coquille', from: [-1.5, 2.3, -3.6], to: [1.5, 4.2, -2.2], rot: [-10, 0, 0], pivot: [0, 2.3, -2.4], faces: { all: 'o', up: ['oooo', 'ooPo', 'oooo', 'oooo'] } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(undefined, IDLE, 10, 3), balance('antenneD', [0, 0, 8], IDLE, { tours: 3 }), balance('antenneG', [0, 0, 8], IDLE, { tours: 3, phase: 1 }), tic('coquille', [0, 0, 5], 4.2)) },
        walk: { length: 0.8, bones: mix({ pied: { scale: [[0, [1, 1, 0.92]], [0.4, [1, 1, 1.1]], [0.8, [1, 1, 0.92]]] }, tete: { position: [[0, [0, 0, 0.5]], [0.4, [0, 0, -0.7]], [0.8, [0, 0, 0.5]]] } }) },
        interact: {
            length: 1.6, loop: false,
            bones: {
                tete: cache([0, 1.6, 4.6]),
                coquille: { rotation: [[0.3, [0, 0, 0]], [0.5, [0, 0, 9]], [0.7, [0, 0, -9]], [0.9, [0, 0, 6]], [1.1, [0, 0, 0]]], scale: [[0.3, [1, 1, 1]], [0.45, [1.12, 1.08, 1.08]], [0.7, [1, 1, 1]]] },
            },
        },
    },
};
