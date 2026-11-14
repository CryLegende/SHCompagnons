// Zombie : gardé tel qu'il était (corps et tête de l'ancien modèle), bras tendus. Au repos il dodeline, les bras qui
// tanguent ; au clic il se penche en grognant et griffe l'air des deux mains.
import { garde, OS_PERSO, PIECES_PERSO } from './_garde.mjs';
import { IDLE, WALK, DEUX, mix, balance, pendouille, pedale } from './_style.mjs';

const z = [0, 0, 0];
const griffe = (d) => ({ rotation: [[0, z], [0.2 + d, [-35, 0, 0]], [0.35 + d, [16, 0, 0]], [0.5 + d, [-35, 0, 0]], [0.65 + d, [16, 0, 0]], [0.82 + d, [-22, 0, 0]], [1.15, z]] });
export default {
    name: 'zombie',
    title: 'Zombie',
    scale: 0.42,
    palette: {},
    bones: OS_PERSO,
    cubes: garde('zombie', PIECES_PERSO),
    animations: {
        idle: {
            length: IDLE,
            bones: mix(pendouille(DEUX, 7), balance('brasD', [7, 0, 0], IDLE, { tours: 3 }), balance('brasG', [7, 0, 0], IDLE, { tours: 3, phase: 1 }), balance('tete', [0, 6, 9], IDLE, { tours: 2 }), balance('corps', [0, 0, 2.5], IDLE, { tours: 2, phase: 1 })),
        },
        walk: {
            length: WALK,
            bones: mix(pedale(DEUX, 24), balance('brasD', [9, 0, 0], WALK, { phase: 1 }), balance('brasG', [9, 0, 0], WALK), {
                corps: { rotation: [[0, [-6, 0, 4]], [0.35, [-6, 0, -4]], [0.7, [-6, 0, 4]]] },
            }),
        },
        interact: {
            length: 1.6, loop: false,
            bones: {
                corps: { rotation: [[0, z], [0.2, [-14, 0, 0]], [0.9, [-14, 0, 0]], [1.1, [4, 0, 0]], [1.35, z]] },
                brasD: griffe(0),
                brasG: griffe(0.07),
                tete: { rotation: [[0, z], [0.2, [10, 0, 8]], [0.35, [10, 0, -8]], [0.5, [10, 0, 8]], [0.65, [10, 0, -8]], [0.8, [10, 0, 8]], [1.0, z], [1.15, [0, 0, 13]], [1.35, [0, 0, -6]], [1.6, z]] },
            },
        },
    },
};
