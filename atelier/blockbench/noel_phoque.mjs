// Phoquette, le bébé phoque de Noël (d'après banque-models.shop, demande de Cry du 17 novembre 2026). Petit phoque
// blanc tout doux couché sur le ventre, grosse tête ronde, museau à moustaches ; bonnet de Noël rouge à bord blanc
// en deux étages, la pointe retombe sur le côté avec son pompon.
// Au clic il se redresse et applaudit trois fois de ses nageoires, comme les phoques, le pompon qui saute à chaque
// clap ; puis il se dandine, content.
import { mirrored, mirroredBone } from '../bbkit.mjs';
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, respire, regarde } from './_style.mjs';

const z3 = (v) => [v, v, v];
const nageoireD = { parent: 'corps', pivot: [3.4, 0.6, -2.7] };
const nageoire = { name: 'nageoireD', bone: 'nageoireD', from: [3.2, 0.2, -3.8], to: [6.6, 1.0, -1.6], rot: [0, -18, 0], pivot: [3.4, 0.6, -2.7], faces: { all: 'p', down: 'g' } };
// Applaudissements : les deux nageoires se lèvent et se rejoignent devant (y +), trois fois
const clap = (s) => ({
    rotation: [[0, z3(0)], [0.2, [0, 20 * s, 28 * s]], [0.35, [0, 64 * s, 30 * s]], [0.5, [0, 20 * s, 28 * s]], [0.65, [0, 64 * s, 30 * s]], [0.8, [0, 20 * s, 28 * s]], [0.95, [0, 64 * s, 30 * s]], [1.2, z3(0)]],
});

export default {
    name: 'noel_phoque',
    title: 'Phoquette',
    palette: {
        ...COMMUN,
        w: '#eceff2', W: '#fdfdfd', g: '#b6c1cb', p: '#c3ced8', n: { c: '#2a1d18' },
        r: '#d8283a', R: '#a81c2c',
    },
    bones: {
        root: { pivot: [0, 0, 0] },
        corps: { parent: 'root', pivot: [0, 1, 2] },
        ventre: { parent: 'corps', pivot: [0, 0, 3] },
        tete: { parent: 'corps', pivot: [0, 1.5, -1.5] },
        bonnet: { parent: 'tete', pivot: [0, 9.3, -2.3] },
        pointe: { parent: 'bonnet', pivot: [0, 12.4, -2.3], rot: [-25, 0, -62] },
        pompon: { parent: 'pointe', pivot: [0, 15.2, -2.3] },
        queue: { parent: 'corps', pivot: [0, 1.5, 6.4] },
        palme: { parent: 'queue', pivot: [0, 0.5, 10] },
        nageoireD, nageoireG: mirroredBone(nageoireD),
    },
    cubes: [
        { name: 'ventre', bone: 'ventre', from: [-3.2, 0, 0.4], to: [3.2, 4.8, 6.4], faces: { all: 'w', down: 'g' } },
        { name: 'tete', bone: 'tete', from: [-3.6, 1.2, -5.4], to: [3.6, 8.2, 0.8], faces: { all: 'w', down: 'g', north: visage('w', { ligne: 2 }) } },
        {
            name: 'museau', bone: 'tete', from: [-1.9, 1.5, -6.4], to: [1.9, 3.8, -5.4],
            faces: { all: 'w', north: ['wwwnnwww', 'wwwnnwww', 'wwwwwwww', 'wgwwwwgw', 'wwwwwwww', 'wgwwwwgw', 'wwwwwwww', 'wwwwwwww'], up: ['wwwnnwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'] },
        },
        { name: 'bord', bone: 'bonnet', from: [-3.9, 7.8, -5.7], to: [3.9, 9.3, 1.1], faces: { all: 'W' } },
        { name: 'bonnet', bone: 'bonnet', from: [-3.4, 9.3, -5.2], to: [3.4, 11.1, 0.6], faces: { all: 'r', up: 'r' } },
        { name: 'haut', bone: 'bonnet', from: [-2.3, 11.1, -4.2], to: [2.3, 12.5, -0.4], faces: { all: 'r', up: 'r' } },
        // La pointe retombe vers l'arrière et le côté, le pompon au bout
        { name: 'pointe', bone: 'pointe', from: [-1.0, 12.2, -3.3], to: [1.0, 15.2, -1.3], faces: { all: 'R', up: 'r' } },
        { name: 'pompon', bone: 'pompon', from: [-1.2, 14.6, -3.5], to: [1.2, 17.0, -1.1], faces: { all: 'W' } },
        { name: 'queue', bone: 'queue', from: [-2.2, 0, 6.4], to: [2.2, 3.0, 10.0], faces: { all: 'w', down: 'g' } },
        { name: 'palme', bone: 'palme', from: [-3.0, 0, 9.8], to: [3.0, 0.9, 12.2], faces: { all: 'p', down: 'g', up: ['pppppppp', 'pppppppp', 'pppppppp', 'pppppppp', 'pppppppp', 'pppppppp', 'pgppppgp', 'gggppggg'] } },
        nageoire, mirrored(nageoire, 'nageoireG', 'nageoireG'),
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(
                respire('ventre', IDLE, 2, 0.05), regarde('tete', IDLE, 8, 3),
                // La palme arrière bat doucement, les nageoires rament un peu, le pompon se balance
                balance('palme', [14, 0, 0], IDLE, { tours: 3 }), balance('nageoireD', [0, 10, 0], IDLE, { tours: 2 }), balance('nageoireG', [0, -10, 0], IDLE, { tours: 2 }),
                balance('pointe', [0, 0, 7], IDLE, { tours: 2 }),
            ),
        },
        walk: {
            length: WALK,
            // Il ondule comme un phoque sur la banquise
            bones: mix(tient('corps', [-5, 0, 0]), balance('queue', [14, 0, 0], WALK), balance('palme', [20, 0, 0], WALK, { phase: 1 }), tient('nageoireD', [0, -30, 0]), tient('nageoireG', [0, 30, 0])),
        },
        interact: {
            length: 2.0,
            loop: false,
            bones: {
                // Se redresse, tête levée, applaudit trois fois
                corps: { rotation: [[0, z3(0)], [0.2, [-10, 0, 0]], [1.0, [-10, 0, 0]], [1.2, z3(0)], [1.35, [0, 0, 8]], [1.5, [0, 0, -8]], [1.65, [0, 0, 6]], [1.8, [0, 0, -4]], [2.0, z3(0)]] },
                tete: { rotation: [[0, z3(0)], [0.2, [-14, 0, 0]], [1.0, [-14, 0, 0]], [1.2, z3(0)]] },
                nageoireD: clap(1), nageoireG: clap(-1),
                // Le pompon saute à chaque clap
                pointe: { rotation: [[0, z3(0)], [0.2, z3(0)], [0.35, [0, 0, -22]], [0.5, [0, 0, 10]], [0.65, [0, 0, -22]], [0.8, [0, 0, 10]], [0.95, [0, 0, -22]], [1.2, [0, 0, 8]], [1.4, z3(0)]] },
                palme: { rotation: [[0, z3(0)], [0.2, [-24, 0, 0]], [1.0, [-24, 0, 0]], [1.2, z3(0)]] },
            },
        },
    },
};
