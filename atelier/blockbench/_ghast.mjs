// Ghasts : gros cube blanc, six tentacules de longueurs inégales qui ondulent. Chaque modèle donne son visage et ses accessoires.
import { COMMUN, IDLE, WALK, mix, balance, tient, regarde } from './_style.mjs';

const TENTACULES = [[-2.6, -1.7, 3.6], [0, -1.9, 4.6], [2.6, -1.7, 3.2], [-2.6, 1.9, 4.2], [0, 1.7, 3.0], [2.6, 1.9, 4.4]];

/** tete : les six faces de la tête (le vrai visage, voir _officiel.mjs) ; sinon face : le dessin de la face avant. */
export function ghast({ name, title, face, tete, palette = {}, plus = { bones: {}, cubes: [] } }) {
    const bones = {}, cubes = [];
    TENTACULES.forEach(([x, z, long], i) => {
        bones['t' + (i + 1)] = { parent: 'corps', pivot: [x, 4.7, z] };
        cubes.push({ name: 't' + (i + 1), bone: 't' + (i + 1), seed: 'tentacule', bord: 'bas', from: [x - 0.7, 4.7 - long, z - 0.7], to: [x + 0.7, 4.8, z + 0.7], faces: { all: 'W' } });
    });
    const tous = TENTACULES.map((_, i) => 't' + (i + 1));
    const ecarte = (i) => { const [x, z] = TENTACULES[i]; const v = [z < 0 ? 40 : -40, 0, x === 0 ? 0 : x > 0 ? 35 : -35]; return { rotation: [[0, [0, 0, 0]], [0.3, v], [0.9, v], [1.3, [0, 0, 0]]] }; };
    return {
        name, title,
        palette: { ...COMMUN, w: '#f5f5f8', W: '#dcdde4', G: { c: '#5f5f6b' }, g: { c: '#c6c8d2' }, ...palette },
        bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 8.6, 0] }, ...bones, ...plus.bones },
        cubes: [{ name: 'tete', bone: 'corps', from: [-4, 4.6, -4], to: [4, 12.6, 4], faces: tete || { all: 'w', north: face, down: 'W' } }, ...cubes, ...plus.cubes],
        animations: {
            idle: { length: IDLE, bones: mix(regarde('corps', IDLE, 8, 3), ...tous.map((t, i) => balance(t, [i % 2 ? 9 : 7, 0, i % 3 ? 4 : -5], IDLE, { tours: 2, phase: i % 2 }))) },
            walk: { length: WALK, bones: mix(tient('corps', [-8, 0, 0]), ...tous.map((t, i) => (i % 2 ? balance(t, [8, 0, 0], WALK, { phase: (i >> 1) % 2 }) : tient(t, [-26, 0, 0])))) },
            interact: {
                length: 1.4, loop: false,
                bones: {
                    corps: { scale: [[0, [1, 1, 1]], [0.3, [1.16, 1.16, 1.16]], [0.45, [1.1, 1.1, 1.1]], [0.6, [1.16, 1.16, 1.16]], [0.9, [1.16, 1.16, 1.16]], [1.3, [1, 1, 1]]], rotation: [[0.3, [0, 0, 0]], [0.45, [0, 0, 7]], [0.6, [0, 0, -7]], [0.75, [0, 0, 5]], [0.9, [0, 0, 0]]] },
                    ...Object.fromEntries(tous.map((t, i) => [t, ecarte(i)])),
                },
            },
        },
    };
}
