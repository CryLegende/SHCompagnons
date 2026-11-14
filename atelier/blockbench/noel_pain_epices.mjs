// Pain d'épices de Noël : un petit bonhomme en pain d'épices à qui il manque déjà un coin de tête, quelqu'un l'a
// croqué. Glaçage blanc, deux boutons en bonbon, nœud papillon rouge, sucre d'orge à la main.
// Au clic il danse : il saute d'un pied sur l'autre en agitant son sucre d'orge.
import { COMMUN, IDLE, WALK, DEUX, mix, balance, tient, regarde, pendouille, pedale, paire } from './_style.mjs';

const J = paire('jambe', { parent: 'root', pivot: [1.3, 3, 0] }, { from: [0.3, 0.4, -1.1], to: [2.3, 3, 1.1], faces: { all: ['gggg', 'gggg', 'wwww', 'gggg'], up: 'g', down: 'G' } });
const B = paire('bras', { parent: 'corps', pivot: [2.5, 6, 0] }, { from: [2.5, 5, -1], to: [5, 6.6, 1], rot: [0, 0, 16], pivot: [2.5, 6, 0], faces: { all: 'g', north: ['gwgg', 'gwgg'], south: ['ggwg', 'ggwg'], up: ['gwgg'], east: 'G' } });
const sucre = ['rw', 'wr', 'rw', 'wr', 'rw', 'wr', 'rw', 'wr'];
const danse = (s) => ({ rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 12 * s]], [0.5, [0, 0, -12 * s]], [0.8, [0, 0, 12 * s]], [1.1, [0, 0, -12 * s]], [1.4, [0, 0, 0]]] });

export default {
    name: 'noel_pain_epices',
    title: "Pain d'épices",
    scale: 0.46,
    palette: { ...COMMUN, g: '#cb8a4c', G: '#a96b36', w: '#fffaf2', r: '#e2483f', R: '#b93530', v: '#45ad52', b: '#e88d6c' },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.8, 0] }, tete: { parent: 'corps', pivot: [0, 7, 0] }, ...B.bones, ...J.bones,
        canne: { parent: 'brasG', pivot: [-4.6, 5.8, 0], rot: [0, 0, -6] },
    },
    cubes: [
        { name: 'ventre', bone: 'corps', from: [-2.5, 2.8, -1.2], to: [2.5, 7, 1.2], faces: { all: 'g', north: ['gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'wgwgwgwg', 'gwgwgwgw'], south: ['gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'gggggggg', 'wgwgwgwg', 'gwgwgwgw'], down: 'G' } },
        { name: 'bouton1', bone: 'corps', from: [-0.55, 5, -1.6], to: [0.55, 6, -1.2], faces: { all: 'r' } },
        { name: 'bouton2', bone: 'corps', from: [-0.55, 3.5, -1.6], to: [0.55, 4.5, -1.2], faces: { all: 'v' } },
        { name: 'tete', bone: 'tete', bord: 'bas', from: [-2.9, 6.9, -1.3], to: [2.9, 10.1, 1.3], faces: { all: 'g', north: ['gggggggg', 'ggkggkgg', 'ggkggkgg', 'ggkggkgg', 'gbbggbbg', 'gbbggbbg', 'gggwwggg', 'gggggggg'] } },
        // Le haut de la tête s'arrête avant le bord : le coin croqué (à gauche pour qui regarde)
        { name: 'haut', bone: 'tete', bord: 'haut', from: [-2.9, 10.1, -1.3], to: [1.2, 11.9, 1.3], faces: { all: 'g', north: ['gggggggg', 'wgwgwgwg', 'gwgwgwgw', 'gggggggg'], east: 'G' } },
        { name: 'noeud', bone: 'corps', bord: false, from: [-1.3, 6.4, -1.65], to: [1.3, 7.4, -1.25], faces: { all: 'r', north: ['rrRRRRrr', 'rrRRRRrr'] } },
        ...B.cubes, ...J.cubes,
        { name: 'canne', bone: 'canne', bord: false, from: [-4.95, 4.4, -0.35], to: [-4.25, 9.6, 0.35], faces: { all: sucre, up: 'r' } },
        { name: 'crosse', bone: 'canne', bord: false, from: [-4.25, 8.9, -0.35], to: [-2.9, 9.6, 0.35], faces: { all: ['rwrw', 'wrwr'] } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(undefined, IDLE, 8, 4), balance('corps', [0, 0, 3], IDLE, { tours: 2 }), balance('brasG', [0, 0, 7], IDLE, { tours: 3 }), balance('brasD', [0, 0, 4], IDLE, { tours: 2 }), pendouille(DEUX, 10)) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 30), tient('corps', [-6, 0, 0]), balance('brasD', [0, 0, 10], WALK), balance('brasG', [0, 0, 10], WALK, { phase: 1 })) },
        interact: {
            length: 1.5, loop: false,
            bones: {
                corps: danse(1), tete: danse(-0.5),
                root: { position: [[0, [0, 0, 0]], [0.2, [0, 1.6, 0]], [0.35, [0, 0, 0]], [0.5, [0, 1.6, 0]], [0.65, [0, 0, 0]], [0.8, [0, 1.6, 0]], [0.95, [0, 0, 0]], [1.1, [0, 1.6, 0]], [1.25, [0, 0, 0]]] },
                jambeD: { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, -30]], [0.5, [0, 0, 0]], [0.8, [0, 0, -30]], [1.1, [0, 0, 0]]] },
                jambeG: { rotation: [[0.2, [0, 0, 0]], [0.5, [0, 0, 30]], [0.8, [0, 0, 0]], [1.1, [0, 0, 30]], [1.4, [0, 0, 0]]] },
                brasG: { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, -40]], [0.5, [0, 0, -15]], [0.8, [0, 0, -40]], [1.1, [0, 0, -15]], [1.4, [0, 0, 0]]] },
                brasD: { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 25]], [1.1, [0, 0, 25]], [1.4, [0, 0, 0]]] },
            },
        },
    },
};
