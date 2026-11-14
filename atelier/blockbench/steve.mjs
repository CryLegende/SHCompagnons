// Steve : le mineur, gardé tel qu'il était (corps, tête et pioche de l'ancien modèle). Au repos il regarde autour de
// lui et cale sa pioche sur l'épaule ; au clic il pioche trois fois et brandit sa pioche.
import { garde } from './_garde.mjs';
import { IDLE, WALK, DEUX, mix, balance, tient, respire, regarde, pendouille, pedale } from './_style.mjs';

const z = [0, 0, 0];
export default {
    name: 'steve',
    title: 'Steve',
    scale: 0.42,
    palette: {},
    bones: {
        root: { pivot: [0, 0, 0] },
        corps: { parent: 'root', pivot: [0, 3.7, 0] },
        buste: { parent: 'corps', pivot: [0, 3.6, 0] },
        tete: { parent: 'corps', pivot: [0, 8.6, 0] },
        brasD: { parent: 'corps', pivot: [3.6, 8.2, -0.3] },
        brasG: { parent: 'corps', pivot: [-3.6, 8.2, -0.3] },
        pioche: { parent: 'brasD', pivot: [3.6, 3.9, -1.5] },
        jambeD: { parent: 'root', pivot: [1.3, 3.6, 0] },
        jambeG: { parent: 'root', pivot: [-1.3, 3.6, 0] },
    },
    cubes: garde('steve', [['tete', 'tete'], ['buste', 'buste'], ['brasG', 'brasG'], ['brasD', 'brasD'], ['jambeG', 'jambeG'], ['jambeD', 'jambeD'], ['pioche', 'pioche']]),
    animations: {
        idle: {
            length: IDLE,
            bones: mix(respire('buste', IDLE, 2, 0.03), regarde('tete', IDLE, 12, 3), pendouille(DEUX, 8), balance('brasG', [5, 0, 0], IDLE, { tours: 2, phase: 1 }), {
                // la pioche sur l'épaule, puis il la redescend
                brasD: { rotation: [[0, z], [1.5, [5, 0, 0]], [2.7, z], [3.1, [0, 0, 128]], [4.6, [0, 0, 128]], [5.1, [-6, 0, 0]], [5.4, z]] },
                pioche: { rotation: [[2.7, z], [3.1, [0, 0, -95]], [4.6, [0, 0, -95]], [5.1, z]] },
            }),
        },
        walk: {
            length: WALK,
            bones: mix(pedale(DEUX, 28), balance('brasD', [24, 0, 0], WALK, { phase: 1 }), balance('brasG', [24, 0, 0], WALK), tient('corps', [-4, 0, 0])),
        },
        interact: {
            length: 1.6, loop: false,
            bones: {
                brasD: { rotation: [[0, z], [0.15, [0, 0, 128]], [0.3, [0, 0, 50]], [0.45, [0, 0, 128]], [0.6, [0, 0, 50]], [0.75, [0, 0, 128]], [0.9, [0, 0, 50]], [1.05, [0, 0, 168]], [1.35, [0, 0, 168]], [1.6, z]] },
                pioche: { rotation: [[0, z], [0.15, [0, 0, -15]], [0.3, [0, 0, 30]], [0.45, [0, 0, -15]], [0.6, [0, 0, 30]], [0.75, [0, 0, -15]], [0.9, [0, 0, 30]], [1.05, [0, 0, -100]], [1.35, [0, 0, -100]], [1.6, z]] },
                corps: { rotation: [[0, z], [0.15, [0, 0, -5]], [0.3, [0, 0, 7]], [0.45, [0, 0, -5]], [0.6, [0, 0, 7]], [0.75, [0, 0, -5]], [0.9, [0, 0, 7]], [1.05, [0, 0, -3]], [1.35, [0, 0, -3]], [1.6, z]] },
                tete: { rotation: [[0, z], [0.3, [-8, -14, 0]], [0.9, [-8, -14, 0]], [1.05, [8, 0, 6]], [1.2, [8, 0, -6]], [1.35, [8, 0, 6]], [1.6, z]] },
                brasG: { rotation: [[0, z], [1.05, z], [1.15, [0, 0, -18]], [1.35, [0, 0, -18]], [1.6, z]] },
            },
        },
    },
};
