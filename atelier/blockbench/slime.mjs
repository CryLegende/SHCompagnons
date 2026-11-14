// Slime : le slime des marais. Un nénuphar de travers en guise de chapeau, sa fleur dessus ; dans sa flaque, un
// roseau, un petit nénuphar et son tout petit slime qui l'imite. Au clic il s'écrase puis bondit en vrille sur sa
// flaque, la fleur saute, le petit bondit à son tour.
import { slime, HAUT, SOL } from './_slime.mjs';
import { IDLE, WALK, balance, mix } from './_style.mjs';

const veines = ['pppLLppp', 'ppppLppp', 'pPpppppp', 'ppPppPpp', 'pppPPppp', 'ppPppPpp', 'pPppppPp', 'pppppppp'];

export default slime({
    name: 'slime', title: 'Slime',
    palette: { c: '#84d95c', L: '#aeea86', h: { c: '#e6ffd6' }, p: '#3a9e58', P: { c: '#2b7f45' }, f: '#fff6fa', F: '#ff9fc6', y: { c: '#ffd84a' }, t: '#5fae4a', m: '#8a5a34', M: '#6e4526' },
    socle: { all: 'L', up: ['LLLLLLLL', 'LLhLLLLL', 'LLLLLLLL', 'LLLLLLhL', 'LLLLLLLL', 'LhLLLLLL', 'LLLLLhLL', 'LLLLLLLL'] },
    plus: {
        bones: {
            nenuphar: { parent: 'dessus', pivot: [0, HAUT, 0], rot: [4, 20, 6] }, fleur: { parent: 'nenuphar', pivot: [-1.1, HAUT + 0.55, 0.9] },
            roseau: { parent: 'root', pivot: [4.2, SOL, 4.2], rot: [-6, 0, -9] }, petit: { parent: 'root', pivot: [4, SOL, -4.1] },
        },
        cubes: [
            { name: 'nenuphar', bone: 'nenuphar', bord: false, from: [-2.8, HAUT, -2.8], to: [2.8, HAUT + 0.55, 2.8], faces: { all: 'p', up: veines } },
            { name: 'fleur', bone: 'fleur', bord: false, from: [-2, HAUT + 0.55, 0], to: [-0.2, HAUT + 1.75, 1.8], faces: { all: ['fFfF', 'FFFF'], up: ['FffF', 'fyyf', 'fyyf', 'FffF'] } },
            { name: 'tige', bone: 'roseau', bord: false, from: [3.95, SOL, 3.95], to: [4.45, SOL + 5.4, 4.45], faces: { all: 't' } },
            { name: 'epi', bone: 'roseau', from: [3.7, SOL + 5.4, 3.7], to: [4.7, SOL + 8, 4.7], faces: { all: 'm', up: 'M', down: 'M' } },
            { name: 'feuille', bone: 'root', bord: false, from: [-4.9, SOL, -4.9], to: [-3.1, SOL + 0.35, -3.1], rot: [0, 20, 0], faces: { all: 'p', up: ['ppLp', 'pPpp', 'ppPp', 'pppp'] } },
            { name: 'petit', bone: 'petit', bord: false, from: [3.2, SOL, -4.9], to: [4.8, SOL + 1.6, -3.3], faces: { all: ['LLLL', 'Lhcc', 'Lccc', 'LLLL'], north: ['LLLLLLLL', 'LLLLLLLL', 'LLkcckLL', 'LLkcckLL', 'LLkcckLL', 'LLccccLL', 'LLLLLLLL', 'LLLLLLLL'], down: 'c' } },
        ],
    },
    anim: {
        idle: mix(balance('nenuphar', [0, 0, 4], IDLE, { tours: 2 }), balance('roseau', [0, 0, 4], IDLE, { tours: 2 }), { petit: { scale: [[0, [1, 1, 1]], [0.75, [1.12, 0.84, 1.12]], [1.5, [1, 1, 1]], [2.25, [0.92, 1.12, 0.92]], [3, [1, 1, 1]], [3.75, [1.12, 0.84, 1.12]], [4.5, [1, 1, 1]], [5.25, [0.92, 1.12, 0.92]], [6, [1, 1, 1]]] } }),
        walk: mix(balance('nenuphar', [6, 0, 0], WALK), balance('roseau', [8, 0, 0], WALK)),
        interact: {
            fleur: { position: [[0.5, [0, 0, 0]], [0.75, [0, 3, 0]], [1.0, [0, 0, 0]], [1.1, [0, 0.6, 0]], [1.2, [0, 0, 0]]] },
            petit: { scale: [[0.7, [1, 1, 1]], [0.85, [1.3, 0.6, 1.3]], [1.0, [0.85, 1.25, 0.85]], [1.2, [1, 1, 1]]], position: [[0.85, [0, 0, 0]], [1.05, [0, 2.4, 0]], [1.25, [0, 0, 0]]] },
        },
    },
});
