// Flamant rose de l'été : il ne sait pas nager, alors il ne quitte jamais sa bouée. Bouée rouge et blanche autour du
// ventre, longues pattes qui pédalent dans le vide, bec crochu, plumes de queue en éventail. Au clic il fait tourner sa bouée comme un cerceau
// en battant des ailes.
import { COMMUN, IDLE, WALK, DEUX, frimousse, mix, balance, tient, respire, regarde, bat, pendouille, pedale, paire } from './_style.mjs';

const A = paire('aile', { parent: 'corps', pivot: [2.3, 9.2, 0.4] }, { bord: 'haut', from: [2.3, 7.2, -1.2], to: [3.1, 9.4, 2.8], faces: { all: ['ffff', 'ffff', 'FFFF', 'FFFF'], up: 'f', down: 'F' } });
const J = paire('jambe', { parent: 'root', pivot: [1, 5.2, 0.4] }, { bord: false, from: [0.7, 0, 0.1], to: [1.3, 5.2, 0.7], faces: { all: ['FF', 'FF', 'FF', 'jj', 'FF', 'FF', 'FF', 'jj'] } });
const cerceau = { rotation: [[0, [0, 0, 0]], [0.2, [8, 120, 6]], [0.4, [-8, 240, -6]], [0.6, [8, 360, 6]], [0.8, [-8, 480, -6]], [1.0, [8, 600, 6]], [1.2, [0, 720, 0]]] };

export default {
    name: 'ete_flamant',
    title: 'Flamant rose',
    palette: { ...COMMUN, f: '#ff9fbb', F: '#f47a9f', j: '#e0608a', b: '#f2779c', w: '#fffaf2', n: '#3a3038', r: '#e8483f', u: { c: '#bfe6ff' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 5.2, 0.4] }, ventre: { parent: 'corps', pivot: [0, 5.2, 0.4] }, cou: { parent: 'corps', pivot: [0, 8.8, -1.6] }, tete: { parent: 'cou', pivot: [0, 13.4, -1.6] },
        bouee: { parent: 'corps', pivot: [0, 6, 0.4] }, queue: { parent: 'corps', pivot: [0, 8.4, 3] }, ...A.bones, ...J.bones,
    },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'haut', from: [-2.3, 5.2, -2.2], to: [2.3, 9.2, 3], faces: { all: 'f', down: 'F' } },
        { name: 'bouee', bone: 'bouee', bord: false, from: [-4.1, 5, -3.9], to: [4.1, 7, 4.7], faces: { all: ['rrwwrrww'], up: ['rrwwwwrr', 'rrwwwwrr', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'rrwwwwrr', 'rrwwwwrr'], down: 'w' } },
        { name: 'cou', bone: 'cou', bord: false, from: [-0.7, 8.8, -2.3], to: [0.7, 13.6, -0.9], faces: { all: 'f' } },
        { name: 'tete', bone: 'tete', from: [-2, 13.2, -4], to: [2, 16.8, -0.2], faces: { all: 'f', north: frimousse('f', { ligne: 2 }) } },
        { name: 'bec', bone: 'tete', bord: false, from: [-0.6, 13.3, -5.7], to: [0.6, 14.4, -4], rot: [-26, 0, 0], pivot: [0, 14, -4], faces: { all: 'w' } },
        ...A.cubes,
        { name: 'queue', bone: 'queue', bord: false, from: [-1, 7.8, 2.8], to: [1, 9.4, 4.4], rot: [-24, 0, 0], pivot: [0, 8.4, 3], faces: { all: 'F', up: 'f' } },
        ...J.cubes,
        { name: 'crochet', bone: 'tete', bord: false, from: [-0.5, 12.2, -6.3], to: [0.5, 13.2, -5.4], rot: [-58, 0, 0], pivot: [0, 13.1, -5.6], faces: { all: 'n' } },
        { name: 'plumes', bone: 'queue', bord: false, from: [-1.6, 8.6, 3.6], to: [1.6, 10.6, 4.2], rot: [-40, 0, 0], pivot: [0, 8.6, 3.6], faces: { all: ['fFfFfFfF', 'fFfFfFfF', 'FFFFFFFF', 'FFFFFFFF'], up: 'f' } },
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.04), regarde(undefined, IDLE, 12, 4), balance('cou', [4, 0, 0], IDLE, { tours: 2 }), balance('bouee', [0, 0, 3], IDLE, { tours: 2 }), balance('queue', [0, 10, 0], IDLE, { tours: 3 }), bat('aileD', 'aileG', 4, IDLE, 2), pendouille(DEUX, 14, IDLE, 3)) },
        walk: { length: WALK, bones: mix(pedale(DEUX, 34), tient('corps', [-8, 0, 0]), tient('cou', [12, 0, 0]), bat('aileD', 'aileG', 10, WALK, 1, 14), balance('bouee', [0, 0, 5], WALK)) },
        interact: {
            length: 1.5, loop: false,
            bones: mix(bat('aileD', 'aileG', 16, 1.2, 4, 40), pedale(DEUX, 30, 0.4), {
                bouee: cerceau, aileD: { rotation: [[1.4, [0, 0, 0]]] }, aileG: { rotation: [[1.4, [0, 0, 0]]] },
                jambeD: { rotation: [[0.8, [0, 0, 0]]] }, jambeG: { rotation: [[0.8, [0, 0, 0]]] },
                cou: { rotation: [[0, [0, 0, 0]], [0.2, [-14, 0, 0]], [1.2, [-14, 0, 0]], [1.4, [0, 0, 0]]] },
            }),
        },
    },
};
