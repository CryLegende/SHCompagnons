// Alex : l'exploratrice, gardée telle qu'elle était (corps et tête de l'ancien modèle). Au repos elle fait coucou de la
// main ; au clic elle saute de joie en tournant sur elle-même, les deux bras en l'air.
import { garde, OS_PERSO, PIECES_PERSO } from './_garde.mjs';
import { IDLE, WALK, DEUX, mix, balance, tient, respire, regarde, pendouille, pedale } from './_style.mjs';

const z = [0, 0, 0];
const haut = (s) => ({ rotation: [[0, z], [0.12, [0, 0, s * 160]], [0.3, [0, 0, s * 128]], [0.45, [0, 0, s * 160]], [0.6, [0, 0, s * 128]], [0.75, [0, 0, s * 160]], [1.05, [0, 0, s * 150]], [1.35, z]] });
export default {
    name: 'alex',
    title: 'Alex',
    scale: 0.42,
    palette: {},
    bones: { ...OS_PERSO, brasD: { parent: 'corps', pivot: [3.7, 8.2, 0] }, brasG: { parent: 'corps', pivot: [-3.7, 8.2, 0] } },
    cubes: garde('alex', PIECES_PERSO),
    animations: {
        idle: {
            length: IDLE,
            bones: mix(respire('buste', IDLE, 2, 0.03), regarde('tete', IDLE, 12, 4), pendouille(DEUX, 8), balance('brasG', [5, 0, 0], IDLE, { tours: 2, phase: 1 }), {
                // coucou de la main
                brasD: { rotation: [[0, z], [1.5, [5, 0, 0]], [3.0, z], [3.3, [0, 0, 128]], [3.55, [0, 0, 100]], [3.8, [0, 0, 128]], [4.05, [0, 0, 100]], [4.3, [0, 0, 128]], [4.7, z]] },
            }),
        },
        walk: {
            length: WALK,
            bones: mix(pedale(DEUX, 28), balance('brasD', [24, 0, 0], WALK, { phase: 1 }), balance('brasG', [24, 0, 0], WALK), tient('corps', [-4, 0, 0])),
        },
        interact: {
            length: 1.6, loop: false,
            bones: {
                root: {
                    position: [[0, z], [0.12, [0, -0.6, 0]], [0.42, [0, 3.2, 0]], [0.75, z], [0.86, [0, 0.8, 0]], [0.96, z]],
                    rotation: [[0.12, z], [0.33, [0, 120, 0]], [0.54, [0, 240, 0]], [0.75, [0, 360, 0]]],
                },
                brasD: haut(1),
                brasG: haut(-1),
                jambeD: { rotation: [[0.12, z], [0.42, [-32, 0, 0]], [0.75, z]] },
                jambeG: { rotation: [[0.12, z], [0.42, [-20, 0, 0]], [0.75, z]] },
                tete: { rotation: [[0, z], [0.42, [10, 0, 0]], [0.75, z], [0.95, [0, 0, 10]], [1.15, [0, 0, -10]], [1.35, [0, 0, 6]], [1.55, z]] },
            },
        },
    },
};
