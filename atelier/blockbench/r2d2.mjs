// R2-D2 : corps blanc à panneaux bleus, dôme argenté à l'œil noir, deux jambes latérales et un pied central.
// Au clic son dôme fait un tour complet et il se dandine.
import { COMMUN, IDLE, WALK, mix, balance, tient, regarde, paire } from './_style.mjs';

const J = paire('jambe', { parent: 'root', pivot: [3.2, 7.4, 0] }, { from: [2.6, 1.2, -1], to: [3.8, 8, 1], faces: { all: ['ww', 'uu', 'ww', 'ww', 'uu', 'ww', 'ww', 'ww'], up: 'u' } });
const P = paire('pied', { parent: 'jambeD', pivot: [3.3, 1.2, 0] }, { from: [2.5, 0, -1.7], to: [4.1, 1.4, 1.7], faces: { all: ['wwww', 'uuuu'], up: 'w' } });
P.bones.piedG.parent = 'jambeG';

export default {
    name: 'r2d2',
    title: 'R2-D2',
    palette: { ...COMMUN, w: '#eef0f3', u: '#3168cc', m: '#cdd2da', g: '#8d939e', K: { c: '#1d1f26' }, r: { c: '#e2483f' } },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.4, 0] }, tete: { parent: 'corps', pivot: [0, 8, 0] }, ...J.bones, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'corps', from: [-2.6, 2.4, -2.6], to: [2.6, 8, 2.6], faces: { all: ['wwwwwwww', 'wuwwwwuw', 'wuwwwwuw', 'wwwwwwww', 'wwwwwwww', 'wuuuuuuw', 'wwwwwwww', 'wwwwwwww'], north: ['wwwwwwww', 'wuuwwuuw', 'wuuwwuuw', 'wwwwwwww', 'wwggggww', 'wwwwwwww', 'wuuuuuuw', 'wwwwwwww'], up: 'm', down: 'g' } },
        { name: 'dome', bone: 'tete', from: [-2.6, 8, -2.6], to: [2.6, 10.6, 2.6], faces: { all: ['mmmmmmmm', 'muummuum', 'muummuum', 'mmmmmmmm'], north: ['mmmmmmmm', 'muuKKuum', 'muuKKuum', 'mmmmmrmm'] } },
        { name: 'calotte', bone: 'tete', from: [-1.8, 10.6, -1.8], to: [1.8, 11.5, 1.8], faces: { all: 'm', up: ['mmmm', 'muum', 'muum', 'mmmm'] } },
        { name: 'pied', bone: 'corps', from: [-0.9, 0.5, -1.3], to: [0.9, 2.4, 1.3], faces: { all: ['wwww', 'uuuu'] } },
        ...J.cubes, ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(regarde(undefined, IDLE, 40, 0), balance('corps', [3, 0, 0], IDLE, { tours: 2 })) },
        walk: { length: WALK, bones: mix(tient('corps', [10, 0, 0]), tient('jambeD', [-10, 0, 0]), tient('jambeG', [-10, 0, 0]), balance('tete', [0, 12, 0], WALK)) },
        interact: {
            length: 1.4, loop: false,
            bones: {
                tete: { rotation: [[0, [0, 0, 0]], [0.3, [0, 120, 0]], [0.55, [0, 240, 0]], [0.8, [0, 360, 0]]] },
                root: { rotation: [[0.8, [0, 0, 0]], [0.95, [0, 0, 10]], [1.1, [0, 0, -10]], [1.25, [0, 0, 6]], [1.4, [0, 0, 0]]] },
            },
        },
    },
};
