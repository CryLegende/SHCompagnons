// Tison, le dragonneau : il fait griller sa guimauve tout seul. Une petite flamme tremblote devant son museau, la
// guimauve au bout de son bâton est déjà dorée d'un côté. Au clic il prend son souffle et crache une vraie flamme :
// la guimauve s'agite, il la regarde, très fier.
import { dragon } from './_dragon.mjs';
import { IDLE, WALK, balance, tient } from './_style.mjs';

const feu = (duree) => ({ scale: [0, 1, 2, 3, 4].map((i) => [i * duree / 4, i % 2 ? [1.25, 1.35, 1.25] : [0.8, 0.75, 0.8]]) });

export default dragon({
    name: 'dragon_guimauve', title: 'Tison',
    palette: { f: '#e8553b', F: '#bd3c2a', l: '#f0694c', w: '#f9e2ab', W: '#eccf8e', m: '#f8a23c', h: '#fff2d6', H: '#ecd9b0', n: { c: '#8f2a1e' }, t: '#8a5f3c', g: '#fffaf2', G: '#d79a55', o: '#ffb21f', y: { c: '#fff06a' } },
    plus: {
        bones: { baton: { parent: 'corps', pivot: [2.6, 4.6, -1.6], rot: [13, 11, 0] }, flamme: { parent: 'tete', pivot: [0, 7.5, -5] } },
        cubes: [
            { name: 'baton', bone: 'baton', bord: false, from: [2.35, 4.35, -8.4], to: [2.85, 4.85, -1.2], faces: { all: 't' } },
            { name: 'guimauve', bone: 'baton', from: [1.8, 3.8, -9.6], to: [3.4, 5.4, -8], faces: { all: ['gggg', 'gggg', 'gggG', 'GGGG'], up: 'g', down: 'G' } },
            { name: 'flamme', bone: 'flamme', bord: false, from: [-0.6, 6.9, -6.4], to: [0.6, 8.1, -5], faces: { all: ['oyyo', 'oyyo', 'oooo', 'oooo'], north: ['oooo', 'oyyo', 'oyyo', 'oooo'] } },
        ],
    },
    anim: {
        idle: { flamme: feu(IDLE), ...balance('baton', [0, 0, 3], IDLE, { tours: 2 }) },
        walk: { ...tient('flamme', [0.5, 0.5, 0.5], 'scale'), ...balance('baton', [4, 0, 0], WALK) },
    },
    interact: {
        length: 1.8, loop: false,
        bones: {
            tete: { rotation: [[0, [0, 0, 0]], [0.3, [16, 0, 0]], [0.45, [-10, 0, 0]], [1.1, [-10, 0, 0]], [1.3, [0, 0, 0]], [1.45, [0, 0, 8]], [1.6, [0, 0, -8]], [1.8, [0, 0, 0]]] },
            ventre: { scale: [[0, [1, 1, 1]], [0.3, [1.14, 1.1, 1.14]], [0.45, [0.94, 0.96, 0.94]], [1.1, [1, 1, 1]]] },
            flamme: { scale: [[0, [0.8, 0.8, 0.8]], [0.3, [0.2, 0.2, 0.2]], [0.45, [2.2, 2.2, 3.4]], [0.6, [1.8, 1.8, 3]], [0.75, [2.3, 2.3, 3.4]], [0.9, [1.8, 1.8, 3]], [1.1, [2.2, 2.2, 3.2]], [1.3, [0.8, 0.8, 0.8]]], position: [[0.3, [0, 0, 0]], [0.45, [0, 0, -1.6]], [1.1, [0, 0, -1.6]], [1.3, [0, 0, 0]]] },
            baton: { rotation: [[0.45, [0, 0, 0]], [0.6, [0, 0, 7]], [0.75, [0, 0, -7]], [0.9, [0, 0, 7]], [1.1, [0, 0, 0]], [1.3, [14, -10, 0]], [1.6, [14, -10, 0]], [1.8, [0, 0, 0]]] },
            aileD: { rotation: [[0, [0, 0, 0]], [0.3, [0, 0, 30]], [1.1, [0, 0, 30]], [1.3, [0, 0, 0]]] },
            aileG: { rotation: [[0, [0, 0, 0]], [0.3, [0, 0, -30]], [1.1, [0, 0, -30]], [1.3, [0, 0, 0]]] },
        },
    },
});
