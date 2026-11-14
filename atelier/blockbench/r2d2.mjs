// R2-D2 : gardé tel qu'il était (corps à panneaux, dôme, trois pieds de l'ancien modèle). Au repos son dôme regarde
// de gauche à droite et son voyant passe du rouge au bleu ; il se dandine en avançant ; au clic il s'emballe : le dôme
// fait un tour complet, il se balance d'un pied sur l'autre en sautillant, le voyant clignote.
import { garde } from './_garde.mjs';
import { IDLE, WALK } from './_style.mjs';

const z = [0, 0, 0], on = [1, 1, 1], off = [0.001, 0.001, 0.001];
// voyant bleu posé sur le voyant rouge dessiné sur le dôme (colonne 6, lignes 3 et 4 de sa face avant)
const voyant = { name: 'voyant', bone: 'voyant', bord: false, from: [-2.3, 9.7, -3.08], to: [-1.45, 10.5, -2.98], faces: { all: 'c' } };
export default {
    name: 'r2d2',
    title: 'R2-D2',
    scale: 0.5,
    palette: { c: { c: '#39a8ff' } },
    bones: {
        root: { pivot: [0, 0, 0] },
        corps: { parent: 'root', pivot: [0, 7.6, 0] },
        dome: { parent: 'corps', pivot: [0, 8.7, 0] },
        voyant: { parent: 'dome', pivot: [-1.9, 10.1, -3.03] },
    },
    cubes: [...garde('r2d2', [['corps', 'corps'], ['dome', 'dome'], ['calotte', 'dome'], ['jambeD', 'root'], ['jambeG', 'root'], ['piedD', 'root'], ['piedG', 'root'], ['piedCentre', 'corps']]), voyant],
    animations: {
        idle: {
            length: IDLE,
            bones: {
                dome: { rotation: [[0, z], [0.5, [0, 42, 0]], [1.7, [0, 42, 0]], [2.4, [0, -42, 0]], [3.6, [0, -42, 0]], [4.1, z]] },
                corps: { position: [[4.6, z], [4.75, [0, 0.6, 0]], [4.9, z], [5.05, [0, 0.35, 0]], [5.2, z]] },
                voyant: { scale: [[0, off, 'step'], [1.5, on, 'step'], [3.0, off, 'step'], [4.5, on, 'step']] },
            },
        },
        walk: {
            length: WALK,
            bones: {
                corps: { rotation: [[0, [0, 0, 5]], [0.35, [0, 0, -5]], [0.7, [0, 0, 5]]] },
                dome: { rotation: [[0, [0, -6, 0]], [0.35, [0, 6, 0]], [0.7, [0, -6, 0]]] },
            },
        },
        interact: {
            length: 1.8, loop: false,
            bones: {
                dome: { rotation: [[0, z], [0.2, [0, 120, 0]], [0.4, [0, 240, 0]], [0.6, [0, 360, 0]], [0.9, [0, 360, 0]], [1.05, [0, 390, 0]], [1.2, [0, 330, 0]], [1.35, [0, 360, 0]]] },
                corps: {
                    rotation: [[0, z], [0.15, [0, 0, 9]], [0.3, [0, 0, -9]], [0.45, [0, 0, 9]], [0.6, [0, 0, -9]], [0.75, [0, 0, 9]], [0.9, [0, 0, -9]], [1.05, z]],
                    position: [[0.9, z], [1.05, [0, 1.6, 0]], [1.2, z], [1.35, [0, 0.9, 0]], [1.5, z]],
                },
                voyant: { scale: [[0, on, 'step'], [0.15, off, 'step'], [0.3, on, 'step'], [0.45, off, 'step'], [0.6, on, 'step'], [0.75, off, 'step'], [0.9, on, 'step'], [1.05, off, 'step'], [1.2, on, 'step'], [1.5, off, 'step']] },
            },
        },
    },
};
