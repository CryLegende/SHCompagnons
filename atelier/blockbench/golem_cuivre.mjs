// Golem de cuivre : gardé tel qu'il était (modèle de block-display.com par F0X_jL, retourné pour regarder devant). Au
// repos il regarde autour de lui, son paratonnerre frémit ; au clic son paratonnerre tourne comme une hélice et le
// soulève, il bat des bras, puis il se repose en titubant.
import { garde } from './_garde.mjs';
import { IDLE, WALK, DEUX, mix, balance, tient, regarde, tic, pendouille, pedale } from './_style.mjs';

const z = [0, 0, 0];
const helice = [[0, z]];
for (let i = 1; i <= 9; i++) helice.push([Math.round(i * 0.15 * 100) / 100, [0, i * 120, 0]]);
const bat = (s) => ({ rotation: [[0, z], [0.2, [0, 0, s * 45]], [0.35, [0, 0, s * 20]], [0.5, [0, 0, s * 45]], [0.65, [0, 0, s * 20]], [0.8, [0, 0, s * 45]], [0.95, [0, 0, s * 20]], [1.1, [0, 0, s * 45]], [1.3, z]] });
export default {
    name: 'golem_cuivre',
    title: 'Golem de cuivre',
    scale: 0.3,
    palette: {},
    bones: {
        root: { pivot: [0, 0, 0] },
        corps: { parent: 'root', pivot: [0, 4, 0] },
        tete: { parent: 'corps', pivot: [0, 10, 0] },
        paratonnerre: { parent: 'tete', pivot: [0, 16, 0] },
        brasD: { parent: 'corps', pivot: [6, 10, 0] },
        brasG: { parent: 'corps', pivot: [-6, 10, 0] },
        jambeD: { parent: 'root', pivot: [2.24, 4, 0] },
        jambeG: { parent: 'root', pivot: [-2.24, 4, 0] },
    },
    cubes: garde('golem_cuivre', [['jambeD', 'jambeD'], ['jambeG', 'jambeG'], ['ventre', 'corps'], ['torse', 'corps'], ['brasD', 'brasD'], ['brasG', 'brasG'], ['tete', 'tete'],
        ['paratonnerre', 'paratonnerre'], ['ventreG', 'corps'], ['torseG', 'corps'], ['crane', 'tete'], ['nez', 'tete']]),
    animations: {
        idle: {
            length: IDLE,
            bones: mix(regarde('tete', IDLE, 12, 3), balance('brasD', [6, 0, 0], IDLE, { tours: 2 }), balance('brasG', [6, 0, 0], IDLE, { tours: 2, phase: 1 }), pendouille(DEUX, 6), tic('paratonnerre', [0, 0, 12], 2.7)),
        },
        walk: {
            length: WALK,
            bones: mix(pedale(DEUX, 26), balance('brasD', [30, 0, 0], WALK, { phase: 1 }), balance('brasG', [30, 0, 0], WALK), tient('corps', [-5, 0, 0])),
        },
        interact: {
            length: 1.8, loop: false,
            bones: {
                paratonnerre: { rotation: helice },
                root: { position: [[0, z], [0.2, [0, -0.8, 0]], [0.5, [0, 3, 0]], [0.8, [0, 3.6, 0]], [1.05, [0, 3, 0]], [1.3, z], [1.4, [0, 0.6, 0]], [1.5, z]] },
                brasD: bat(1),
                brasG: bat(-1),
                tete: { rotation: [[0, z], [0.5, [0, 0, 5]], [0.8, [0, 0, -5]], [1.05, [0, 0, 4]], [1.3, z], [1.45, [0, 16, 5]], [1.6, [0, -14, -5]], [1.8, z]] },
                jambeD: { rotation: [[0.2, z], [0.5, [18, 0, 0]], [0.8, [-14, 0, 0]], [1.05, [12, 0, 0]], [1.3, z]] },
                jambeG: { rotation: [[0.2, z], [0.5, [-14, 0, 0]], [0.8, [18, 0, 0]], [1.05, [-10, 0, 0]], [1.3, z]] },
            },
        },
    },
};
