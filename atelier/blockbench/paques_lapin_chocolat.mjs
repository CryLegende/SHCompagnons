// Lapin en chocolat de Pâques : encore à moitié dans son papier doré, une oreille déjà croquée, ruban rouge et
// grelot au cou. Il a très peur d'être mangé. Au clic il tremble de toutes ses forces, son oreille se couche,
// son grelot tinte, le papier se décolle.
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, respire, regarde, tic, paire } from './_style.mjs';

const M = paire('patte', { parent: 'corps', pivot: [1.3, 5.2, -1.9] }, { from: [0.6, 4.3, -2.6], to: [2, 5.4, -1.8], faces: { all: 'c', north: 'L' } });
const dore = ['oyoooooo', 'oooooOoo', 'ooOooooy', 'oooooooo', 'oooyoooo', 'oOoooooO', 'oooooOoo', 'OOOOOOOO'];
const tremble = [[0.15, [0, 0, 0]], [0.25, [0, 0, 5]], [0.35, [0, 0, -5]], [0.45, [0, 0, 5]], [0.55, [0, 0, -5]], [0.65, [0, 0, 5]], [0.75, [0, 0, -5]], [0.85, [0, 0, 5]], [0.95, [0, 0, -5]], [1.1, [0, 0, 0]]];

export default {
    name: 'paques_lapin_chocolat',
    title: 'Lapin en chocolat',
    palette: { ...COMMUN, c: '#94603f', C: '#74472b', L: '#ad774f', i: '#c69567', n: { c: '#5a3320' }, o: '#f6c642', O: '#d9a01f', y: { c: '#fff3b0' }, r: '#e2483f', R: '#b93530', b: '#c9735a' },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1, 0.2] }, ventre: { parent: 'corps', pivot: [0, 1, 0.2] }, tete: { parent: 'corps', pivot: [0, 6, 0] },
        oreilleD: { parent: 'tete', pivot: [1.7, 10.9, 0.1] }, oreilleG: { parent: 'tete', pivot: [-1.7, 10.9, 0.1] }, lambeau: { parent: 'corps', pivot: [2.7, 3.4, 0] }, grelot: { parent: 'corps', pivot: [0, 5.6, -2.5] }, ...M.bones,
    },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-2.4, 1, -1.9], to: [2.4, 6, 2.3], faces: { all: 'c', down: 'C' } },
        { name: 'papier', bone: 'corps', bord: false, from: [-2.7, 0.8, -2.2], to: [2.7, 4, 2.6], faces: { all: dore, up: 'O', down: 'O' } },
        { name: 'lambeau', bone: 'lambeau', bord: false, from: [2.7, 3.2, -1.3], to: [2.95, 5.8, 1.1], rot: [0, 0, -30], pivot: [2.7, 3.4, 0], faces: { all: 'o', east: ['yooo', 'oooO', 'oOoo', 'oooo'], west: 'O' } },
        { name: 'tete', bone: 'tete', from: [-2.9, 5.8, -2.9], to: [2.9, 11, 2.3], faces: { all: 'c', north: visage('c') } },
        { name: 'museau', bone: 'tete', from: [-1.4, 6.3, -3.7], to: [1.4, 8, -2.9], faces: { all: 'L', north: ['LLLnnLLL', 'LLLnnLLL', 'LLLLLLLL', 'LLLLLLLL'], up: ['LLLnnLLL', 'LLLLLLLL', 'LLLLLLLL', 'LLLLLLLL'] } },
        { name: 'oreilleD', bone: 'oreilleD', from: [0.9, 10.8, -0.5], to: [2.5, 15.4, 0.7], faces: { all: 'c', north: ['cccc', 'cLLc', 'cLLc', 'cLLc', 'cLLc', 'cLLc', 'cLLc', 'cccc'] } },
        // L'oreille croquée : plus courte, le dessus montre l'intérieur du chocolat et les traces de dents
        { name: 'oreilleG', bone: 'oreilleG', bord: false, from: [-2.5, 10.8, -0.5], to: [-0.9, 12.7, 0.7], faces: { all: 'c', north: ['ciic', 'cLLc', 'cLLc', 'cccc'], south: ['ciic', 'cccc', 'cccc', 'cccc'], up: ['iCii', 'iiCi'] } },
        { name: 'ruban', bone: 'corps', bord: false, from: [-2.65, 5.3, -2.25], to: [2.65, 6.1, 2.55], faces: { all: 'r', up: 'R', down: 'R' } },
        { name: 'grelot', bone: 'grelot', from: [-0.65, 4.3, -3], to: [0.65, 5.6, -2.2], faces: { all: 'o', north: ['oooo', 'oooo', 'OnnO', 'oooo'], down: 'O' } },
        ...M.cubes,
        { name: 'queue', bone: 'corps', bord: false, from: [-1, 1.6, 2.5], to: [1, 3.4, 3.6], faces: { all: dore.slice(0, 2), south: 'o' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.03), regarde(undefined, IDLE, 12, 3), tic('oreilleD', [0, 0, -14], 2.6), balance('lambeau', [0, 0, 6], IDLE, { tours: 2 }), balance('grelot', [0, 0, 9], IDLE, { tours: 3 })) },
        walk: { length: WALK, bones: mix(tient('corps', [-7, 0, 0]), tient('oreilleD', [22, 0, 0]), tient('oreilleG', [22, 0, 0]), balance('grelot', [0, 0, 16], WALK), balance('lambeau', [0, 0, 10], WALK)) },
        interact: {
            length: 1.4, loop: false,
            bones: {
                corps: { rotation: tremble, position: [[0, [0, 0, 0]], [0.15, [0, -0.5, 0]], [1.1, [0, -0.5, 0]], [1.3, [0, 0, 0]]] },
                tete: { rotation: [[0, [0, 0, 0]], [0.15, [-10, 0, 0]], [1.1, [-10, 0, 0]], [1.3, [0, 0, 0]]] },
                oreilleD: { rotation: [[0, [0, 0, 0]], [0.15, [0, 0, -70]], [1.1, [0, 0, -70]], [1.3, [0, 0, 8]], [1.4, [0, 0, 0]]] },
                grelot: { rotation: [[0.15, [0, 0, 0]], [0.3, [0, 0, 24]], [0.45, [0, 0, -24]], [0.6, [0, 0, 24]], [0.75, [0, 0, -24]], [0.9, [0, 0, 24]], [1.1, [0, 0, 0]]] },
                lambeau: { rotation: [[0.15, [0, 0, 0]], [0.4, [0, 0, -34]], [1.1, [0, 0, -34]], [1.3, [0, 0, 0]]] },
            },
        },
    },
};
