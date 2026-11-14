// Grimoire : un livre enchanté qui flotte, sa plume plantée de travers dans les pages, un ruban rouge qui pend, un
// fermoir doré, une pierre bleue sertie dans la couverture. Ses runes dorment entre les pages. Au clic il s'ouvre en grand, les runes jaillissent, puis il se referme d'un coup sec.
import { COMMUN, IDLE, WALK, mix, balance, tient, regarde } from './_style.mjs';

const cuir = ['vvvvvvvv', 'vVvvvvVv', 'vvvvvvvv', 'vvvvvvvv', 'vvvvvvvv', 'vvvvvvvv', 'vVvvvvVv', 'vvvvvvvv'];
const tranche = ['cccccccc', 'cCcCcCcC', 'cccccccc', 'cCcCcCcC', 'cccccccc', 'cCcCcCcC', 'cccccccc', 'cCcCcCcC'];
const rune = (name, x, y, z, c) => ({ name, bone: name, bord: false, from: [x - 0.35, y - 0.35, z - 0.35], to: [x + 0.35, y + 0.35, z + 0.35], faces: { all: c } });
const jaillit = (h, dx) => ({ position: [[0.3, [0, 0, 0]], [0.6, [dx, h, -2.4]], [1.0, [dx * 1.3, h * 1.25, -2.4]], [1.2, [0, 0, 0]]], scale: [[0.3, [1, 1, 1]], [0.6, [2, 2, 2]], [1.0, [1.4, 1.4, 1.4]], [1.2, [1, 1, 1]]] });

export default {
    name: 'grimoire',
    title: 'Grimoire',
    scale: 0.42,
    palette: { ...COMMUN, v: '#2f9f8b', V: '#23806f', o: '#ffc83a', O: '#d99a1a', c: '#fff5dc', C: { c: '#e6d5ae' }, r: '#e2483f', R: '#b93530', w: '#ffffff', W: { c: '#d7dde6' }, s: '#5b4a3a', e: { c: '#8ff7ff' }, y: { c: '#ffe873' }, E: '#39c6e8' },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 4.7, 0], rot: [0, 0, 5] }, couverture: { parent: 'corps', pivot: [2.9, 4.7, -1.1] },
        ruban: { parent: 'corps', pivot: [-1.1, 1.3, 0.3] }, plume: { parent: 'corps', pivot: [0.8, 8.3, 0], rot: [0, 0, 8] },
        rune1: { parent: 'corps', pivot: [-1.2, 6.6, 0] }, rune2: { parent: 'corps', pivot: [1, 5, 0] }, rune3: { parent: 'corps', pivot: [-0.2, 3.4, 0] },
    },
    cubes: [
        { name: 'pages', bone: 'corps', bord: false, from: [-2.5, 1.2, -1.1], to: [2.3, 8.2, 1.1], faces: { all: tranche, north: ['cccccccc', 'cCCCCCCc', 'cccccccc', 'cCCeeCCc', 'cccccccc', 'cCCCCCCc', 'cccccccc', 'cCCCCycc'], south: 'c' } },
        { name: 'dos', bone: 'corps', from: [2.3, 0.8, -1.7], to: [2.9, 8.6, 1.7], faces: { all: ['vvvv', 'oooo', 'vvvv', 'vvvv', 'vvvv', 'vvvv', 'oooo', 'vvvv'], up: 'v', down: 'V' } },
        { name: 'couverture', bone: 'couverture', from: [-2.9, 0.8, -1.7], to: [2.9, 8.6, -1.1], faces: { all: 'v', north: ['oovvvvoo', 'ovvvvvvo', 'vvvvvvvv', 'vvkvvkvv', 'vvkvvkvv', 'vbbvvbbv', 'ovvvvvvo', 'oovvvvoo'], south: 'V' } },
        { name: 'quatrieme', bone: 'corps', from: [-2.9, 0.8, 1.1], to: [2.9, 8.6, 1.7], faces: { all: 'v', south: cuir } },
        { name: 'ruban', bone: 'ruban', bord: false, from: [-1.5, -1.6, 0.15], to: [-0.7, 1.3, 0.45], faces: { all: ['rr', 'rr', 'rr', 'rr', 'rr', 'rr', 'RR', 'Rr'] } },
        { name: 'plume', bone: 'plume', item: 'feather', from: [-1.6, 7.4, -0.1], to: [3.2, 12.2, 0.1], faces: { all: 'w' } },
        // Runes : cachées dans l'épaisseur des pages, elles ne se voient qu'au clic
        rune('rune1', -1.2, 6.6, 0, 'e'), rune('rune2', 1, 5, 0, 'y'), rune('rune3', -0.2, 3.4, 0, 'e'),
        { name: 'fermoir', bone: 'corps', from: [-3.25, 3.9, -1.9], to: [-2.75, 5.5, 1.9], faces: { all: 'o', west: ['oooo', 'oOOo', 'oOOo', 'oooo'] } },
        { name: 'pierre', bone: 'couverture', bord: false, from: [-0.75, 6.6, -2.05], to: [0.75, 7.7, -1.7], faces: { all: 'E', north: ['Ee', 'EE'] } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde('corps', IDLE, 10, 4), balance('ruban', [0, 0, 9], IDLE, { tours: 2 }), balance('plume', [0, 0, 4], IDLE, { tours: 2 }), balance('couverture', [0, -4, 0], IDLE, { tours: 1 })) },
        walk: { length: WALK, bones: mix(tient('corps', [-10, 0, 0]), balance('ruban', [16, 0, 0], WALK), balance('plume', [6, 0, 0], WALK), balance('couverture', [0, -5, 0], WALK)) },
        interact: {
            length: 1.6, loop: false,
            bones: {
                couverture: { rotation: [[0, [0, 0, 0]], [0.3, [0, -80, 0]], [1.1, [0, -80, 0]], [1.22, [0, 6, 0]], [1.35, [0, 0, 0]]] },
                corps: { rotation: [[0, [0, 0, 0]], [0.3, [0, 16, 0]], [1.1, [0, 16, 0]], [1.3, [0, 0, 0]]], position: [[1.1, [0, 0, 0]], [1.22, [0, 1, 0]], [1.4, [0, 0, 0]]] },
                plume: { rotation: [[0.3, [0, 0, 0]], [0.45, [0, 0, 10]], [0.6, [0, 0, -10]], [0.75, [0, 0, 10]], [0.9, [0, 0, -10]], [1.05, [0, 0, 0]]] },
                rune1: jaillit(4.6, -2.6), rune2: jaillit(6.4, 1.2), rune3: jaillit(8.4, -0.8),
            },
        },
    },
};
