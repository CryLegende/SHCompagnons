// Méduse : elle nage dans l'air, et un petit poisson orange vit caché entre ses tentacules. Sa cloche se gonfle et se
// dégonfle, ses six tentacules traînent. Au clic le poisson s'affole : il file faire le tour de la
// méduse et revient se cacher.
import { COMMUN, IDLE, WALK, frimousse, mix, balance, tient, regarde, paire } from './_style.mjs';

const tentacule = { bord: false, faces: { all: ['ll', 'LL', 'll', 'll', 'LL', 'll', 'll', 'LL'], down: 'L' } };
const TA = paire('tentAv', { parent: 'corps', pivot: [2.3, 4.4, -2.3] }, { ...tentacule, seed: 'tentacule', from: [1.8, 0.4, -2.8], to: [2.8, 4.4, -1.8] });
const TR = paire('tentAr', { parent: 'corps', pivot: [2.3, 4.4, 2.3] }, { ...tentacule, seed: 'tentacule', from: [1.8, 1, 1.8], to: [2.8, 4.4, 2.8] });
const TC = paire('tentCote', { parent: 'corps', pivot: [2.9, 4.4, 0] }, { ...tentacule, seed: 'tentacule', from: [2.4, 1.6, -0.5], to: [3.4, 4.4, 0.5] });
const tour = { rotation: [[0.2, [0, 0, 0]], [0.5, [0, -120, 0]], [0.8, [0, -240, 0]], [1.1, [0, -360, 0]]] };

export default {
    name: 'meduse',
    title: 'Méduse',
    palette: { ...COMMUN, p: '#b9a0f8', P: '#a288ee', L: '#e2d6ff', l: '#cdbcfb', o: '#ff8f2e', O: { c: '#e06a12' }, w: { c: '#ffffff' }, u: { c: '#eef6ff' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 4.4, 0] }, cloche: { parent: 'corps', pivot: [0, 4.4, 0] }, ...TA.bones, ...TR.bones, ...TC.bones,
        voile: { parent: 'corps', pivot: [0, 4.4, 0] }, poisson: { parent: 'root', pivot: [0, 2.6, 0] },
    },
    cubes: [
        { name: 'cloche', bone: 'cloche', bord: 'haut', from: [-3.4, 5.2, -3.4], to: [3.4, 10.8, 3.4], faces: { all: ['pppppppp', 'ppPppppp', 'pppppPpp', 'pppppppp', 'pPpppppp', 'ppppppPp', 'pppppppp', 'pppppppp'], north: frimousse('p'), up: ['pppppppp', 'ppPPpppp', 'ppPPpppp', 'pppppPPp', 'pppppPPp', 'pPPppppp', 'pPPppppp', 'pppppppp'] } },
        { name: 'ourlet', bone: 'cloche', bord: false, from: [-3.9, 4.4, -3.9], to: [3.9, 5.4, 3.9], faces: { all: ['LlLLlLLl'], up: 'L', down: 'l' } },
        { name: 'calotte', bone: 'cloche', bord: 'haut', from: [-2.4, 10.8, -2.4], to: [2.4, 11.9, 2.4], faces: { all: 'p', up: ['pppp', 'pPPp', 'pPPp', 'pppp'] } },
        ...TA.cubes, ...TR.cubes, ...TC.cubes,
        { name: 'voile', bone: 'voile', bord: false, from: [-1.2, 1.8, -1.2], to: [1.2, 4.4, 1.2], faces: { all: ['LlLl', 'lLlL', 'LlLl', 'lLlL'], down: 'L' } },
        { name: 'poisson', bone: 'poisson', from: [0.4, 1.9, -3.4], to: [2.4, 3.2, -2.7], faces: { all: 'o', north: ['Ooowoowo', 'OoowookO', 'Ooowoowo', 'Ooowoowo'], south: ['owoowooO', 'Okoowooo', 'owoowooO', 'owoowooO'], up: ['Ooowoowo'], down: ['Ooowoowo'] } },
        { name: 'nageoire', bone: 'poisson', bord: false, from: [-0.3, 1.8, -3.3], to: [0.5, 3.3, -2.8], faces: { all: 'O' } },
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(regarde('corps', IDLE, 8, 3), {
                cloche: { scale: [[0, [1, 1, 1]], [1, [1.07, 0.9, 1.07]], [2, [0.95, 1.06, 0.95]], [3, [1, 1, 1]], [4, [1.07, 0.9, 1.07]], [5, [0.95, 1.06, 0.95]], [6, [1, 1, 1]]] },
            }, balance('tentAvD', [8, 0, 6], IDLE, { tours: 2 }), balance('tentAvG', [8, 0, -6], IDLE, { tours: 2, phase: 1 }), balance('tentArD', [-8, 0, 6], IDLE, { tours: 2, phase: 1 }), balance('tentArG', [-8, 0, -6], IDLE, { tours: 2 }),
            balance('tentCoteD', [0, 0, 9], IDLE, { tours: 2, phase: 1 }), balance('tentCoteG', [0, 0, -9], IDLE, { tours: 2, phase: 1 }), balance('poisson', [0, 14, 0], IDLE, { tours: 2 })),
        },
        walk: { length: WALK, bones: mix(tient('corps', [-14, 0, 0]), tient('tentAvD', [26, 0, 0]), tient('tentAvG', [26, 0, 0]), tient('tentArD', [30, 0, 0]), tient('tentArG', [30, 0, 0]), tient('tentCoteD', [28, 0, 0]), tient('tentCoteG', [28, 0, 0]), tient('voile', [24, 0, 0]), { cloche: { scale: [[0, [1.08, 0.88, 1.08]], [0.35, [0.94, 1.08, 0.94]], [0.7, [1.08, 0.88, 1.08]]] } }) },
        interact: {
            length: 1.5, loop: false,
            bones: {
                poisson: { ...tour, position: [[0, [0, 0, 0]], [0.2, [0, 0.8, -1]], [1.1, [0, 0.8, -1]], [1.3, [0, 0, 0]]] },
                cloche: { scale: [[0, [1, 1, 1]], [0.2, [1.12, 0.84, 1.12]], [0.45, [0.92, 1.1, 0.92]], [0.7, [1, 1, 1]]] },
                corps: { rotation: [[0.2, [0, 0, 0]], [0.5, [0, -20, 0]], [0.8, [0, 20, 0]], [1.1, [0, 0, 0]]] },
                tentAvD: { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 26]], [1.1, [0, 0, 26]], [1.4, [0, 0, 0]]] },
                tentAvG: { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, -26]], [1.1, [0, 0, -26]], [1.4, [0, 0, 0]]] },
            },
        },
    },
};
