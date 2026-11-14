// Abeille : ronde, rayée, ailes translucides (verre), antennes et dard. Au clic elle fait un looping.
import { COMMUN, IDLE, TOUR, visage, mix, tient, regarde, tic, bat, salto, paire } from './_style.mjs';

const A = paire('antenne', { parent: 'corps', pivot: [1.3, 8.5, -2.7] }, { bord: false, from: [1.0, 8.4, -3.0], to: [1.6, 10.9, -2.4], rot: [-22, 0, -14], pivot: [1.3, 8.5, -2.7], faces: { all: ['d', 'd', 'd', 'd'], up: 'y' } });
const W = paire('aile', { parent: 'corps', pivot: [0.8, 8.6, 0.2] }, { bord: false, block: 'white_stained_glass', from: [0.7, 8.5, -1.6], to: [4.9, 8.9, 2.0], rot: [0, 0, 24], pivot: [0.8, 8.6, 0.2], faces: { all: 'a' } });
const RAIES = 'yyyddydd';

export default {
    name: 'abeille',
    title: 'Abeille',
    palette: { ...COMMUN, y: '#ffd23f', d: '#4d3a2b', a: '#eaf6ffb0' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 5.8, 0] }, ...A.bones, ...W.bones },
    cubes: [
        { name: 'ventre', bone: 'corps', from: [-3, 3, -3.5], to: [3, 8.6, 3.5], faces: { north: visage('y', { ligne: 2 }), west: Array(8).fill(RAIES), east: Array(8).fill([...RAIES].reverse().join('')), up: [...RAIES].map((c) => c.repeat(8)), down: [...RAIES].reverse().map((c) => c.repeat(8)), south: 'd' } },
        ...A.cubes, ...W.cubes,
        { name: 'dard', bone: 'corps', bord: false, from: [-0.5, 5.2, 3.5], to: [0.5, 6.2, 5], faces: { all: 'd' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde('corps', IDLE, 10, 3), bat('aileD', 'aileG', 16, IDLE, 12), tic('antenneD', [0, 0, -20], 2.6), tic('antenneG', [0, 0, 20], 4.4)) },
        walk: { length: 0.3, bones: mix(tient('corps', [-12, 0, 0]), bat('aileD', 'aileG', 22, 0.3)) },
        interact: { length: TOUR, loop: false, bones: mix(salto('root', -1, 4), bat('aileD', 'aileG', 24, TOUR, 6)) },
    },
};
