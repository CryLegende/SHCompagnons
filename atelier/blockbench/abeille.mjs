// Abeille : la butineuse. Ronde et rayée, ailes de verre, elle serre contre elle une marguerite plus grande qu'elle.
// Au clic elle fait sa danse frétillante d'abeille (deux courses en se trémoussant, une boucle de chaque côté),
// puis tend sa marguerite à son propriétaire.
import { COMMUN, IDLE, visage, mix, balance, tient, regarde, tic, bat, paire } from './_style.mjs';

const A = paire('antenne', { parent: 'corps', pivot: [1.3, 8.5, -2.7] }, { bord: false, from: [1.0, 8.4, -3.0], to: [1.6, 10.9, -2.4], rot: [-22, 0, -14], pivot: [1.3, 8.5, -2.7], faces: { all: ['d', 'd', 'd', 'd'], up: 'y' } });
const W = paire('aile', { parent: 'corps', pivot: [0.8, 8.6, 0.2] }, { bord: false, block: 'white_stained_glass', from: [0.7, 8.5, -1.6], to: [4.9, 8.9, 2.0], rot: [0, 0, 24], pivot: [0.8, 8.6, 0.2], faces: { all: 'a' } });
const RAIES = 'yyyddydd';
const z = [0, 0, 0];

export default {
    name: 'abeille',
    title: 'Abeille',
    palette: { ...COMMUN, y: '#ffd23f', d: '#4d3a2b', a: '#eaf6ffb0', g: '#63b23c', w: '#fbf7ee', j: { c: '#ffc21f' } },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 5.8, 0] }, fleur: { parent: 'corps', pivot: [3.3, 2.8, -3.1], rot: [-14, 0, -16] }, ...A.bones, ...W.bones },
    cubes: [
        { name: 'ventre', bone: 'corps', from: [-3, 3, -3.5], to: [3, 8.6, 3.5], faces: { north: visage('y', { ligne: 2 }), west: Array(8).fill(RAIES), east: Array(8).fill([...RAIES].reverse().join('')), up: [...RAIES].map((c) => c.repeat(8)), down: [...RAIES].reverse().map((c) => c.repeat(8)), south: 'd' } },
        ...A.cubes, ...W.cubes,
        { name: 'tige', bone: 'fleur', bord: false, from: [3.05, 2.6, -3.35], to: [3.55, 6.6, -2.85], faces: { all: 'g' } },
        { name: 'marguerite', bone: 'fleur', bord: false, from: [2, 6.4, -4.4], to: [4.6, 7.6, -1.8], faces: { all: 'w', up: ['wwww', 'wjjw', 'wjjw', 'wwww'], down: 'g' } },
        { name: 'dard', bone: 'corps', bord: false, from: [-0.5, 5.2, 3.5], to: [0.5, 6.2, 5], faces: { all: 'd' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde('corps', IDLE, 10, 3), bat('aileD', 'aileG', 16, IDLE, 12), tic('antenneD', [0, 0, -20], 2.6), tic('antenneG', [0, 0, 20], 4.4), balance('fleur', [0, 0, 6], IDLE, { tours: 2 })) },
        walk: { length: 0.3, bones: mix(tient('corps', [-12, 0, 0]), tient('fleur', [24, 0, 0]), bat('aileD', 'aileG', 22, 0.3)) },
        interact: {
            length: 2.0, loop: false,
            bones: mix(bat('aileD', 'aileG', 26, 1.6, 10), {
                root: { position: [[0, z], [0.45, [0, 0, -2.4]], [0.62, [2.2, 1.2, -1.2]], [0.8, z], [1.2, [0, 0, -2.4]], [1.37, [-2.2, 1.2, -1.2]], [1.55, z]] },
                corps: { rotation: [[0, z], [0.07, [0, 0, -18]], [0.15, [0, 0, 18]], [0.23, [0, 0, -18]], [0.3, [0, 0, 18]], [0.38, [0, 0, -18]], [0.45, [0, 0, 18]], [0.53, [0, 0, 0]], [0.6, [0, 0, 0]], [0.68, [0, 0, 0]], [0.75, [0, 0, 0]], [0.82, [0, 0, -18]], [0.9, [0, 0, 18]], [0.97, [0, 0, -18]], [1.05, [0, 0, 18]], [1.12, [0, 0, -18]], [1.2, [0, 0, 18]], [1.27, [0, 0, 0]], [1.35, [0, 0, 0]], [1.43, [0, 0, 0]], [1.5, [0, 0, 0]], [1.7, [-12, 0, 0]], [1.9, [-12, 0, 0]], [2.0, z]] },
                fleur: { rotation: [[1.55, z], [1.7, [-38, 0, 14]], [1.9, [-38, 0, 14]], [2.0, z]] },
                antenneD: { rotation: [[1.55, z], [1.65, [0, 0, -24]], [1.9, [0, 0, -24]], [2.0, z]] },
                antenneG: { rotation: [[1.55, z], [1.65, [0, 0, 24]], [1.9, [0, 0, 24]], [2.0, z]] },
            }),
        },
    },
};
