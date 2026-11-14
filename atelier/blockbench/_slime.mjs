// Slimes : un cœur opaque au visage du style, dans une coque de verre teinté (bloc du jeu, translucide).
// Au repos la gelée ondule, en avançant elle rebondit, au clic elle s'écrase puis rebondit haut.
import { COMMUN, IDLE, WALK, visage, mix, balance, regarde } from './_style.mjs';

/** verre : bloc de la coque ; coeur, teinte : couleurs du cœur et de la coque dans Blockbench ; plus : { bones, cubes }. */
export function slime({ name, title, verre, coeur, teinte, plus = { bones: {}, cubes: [] }, palette = {} }) {
    return {
        name, title,
        palette: { ...COMMUN, c: coeur, v: teinte, ...palette },
        bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1, 0] }, coeur: { parent: 'corps', pivot: [0, 4.8, 0] }, ...plus.bones },
        cubes: [
            { name: 'coeur', bone: 'coeur', from: [-2.3, 2.5, -2.3], to: [2.3, 7.1, 2.3], faces: { all: 'c', north: visage('c', { ligne: 2 }) } },
            { name: 'coque', bone: 'corps', block: verre, bord: false, from: [-3.8, 1, -3.8], to: [3.8, 8.6, 3.8], faces: { all: 'v' } },
            ...plus.cubes,
        ],
        animations: {
            idle: {
                length: IDLE,
                bones: mix(regarde('coeur', IDLE, 12, 0), {
                    corps: { scale: [[0, [1, 1, 1]], [1.5, [1.05, 0.93, 1.05]], [3, [1, 1, 1]], [4.5, [0.96, 1.05, 0.96]], [6, [1, 1, 1]]] },
                    coeur: { position: [[0, [0, 0, 0]], [1.5, [0, -0.3, 0]], [3, [0, 0, 0]], [4.5, [0, 0.4, 0]], [6, [0, 0, 0]]] },
                }),
            },
            walk: { length: WALK, bones: { corps: { scale: [[0, [1.1, 0.86, 1.1]], [0.35, [0.93, 1.13, 0.93]], [0.7, [1.1, 0.86, 1.1]]], position: [[0, [0, 0, 0]], [0.35, [0, 1.3, 0]], [0.7, [0, 0, 0]]] } } },
            interact: {
                length: 1.4, loop: false,
                bones: {
                    corps: { scale: [[0, [1, 1, 1]], [0.2, [1.35, 0.5, 1.35]], [0.5, [1.35, 0.5, 1.35]], [0.7, [0.82, 1.3, 0.82]], [0.95, [1.08, 0.9, 1.08]], [1.15, [0.97, 1.04, 0.97]], [1.3, [1, 1, 1]]], position: [[0.5, [0, 0, 0]], [0.75, [0, 3, 0]], [0.95, [0, 0, 0]], [1.4, [0, 0, 0]]] },
                    coeur: { rotation: [[0.5, [0, 0, 0]], [0.7, [0, 180, 0]], [0.95, [0, 360, 0]]] },
                },
            },
        },
    };
}
