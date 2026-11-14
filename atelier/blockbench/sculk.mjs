// Sculk : un petit bloc de sculk vivant, à l'écoute du moindre bruit. Le compagnon d'origine (bloc aux yeux qui
// luisent, tapis de veines, quatre capteurs qui frémissent) redessiné dans le style : yeux du style en turquoise
// lumineux, cœur d'âmes qui bat sur le dessus, quatre dents d'os de hurleur. Au clic il sursaute : ses capteurs
// s'écartent et vibrent, son cœur s'emballe.
import { COMMUN, IDLE, WALK, mix, balance, tient, respire, regarde, tic } from './_style.mjs';

const P = [[2.5, -2.5], [-2.5, -2.5], [2.5, 2.5], [-2.5, 2.5]];
/** Inclinaison d'un capteur vers l'extérieur du bloc (a > 0). */
const penche = (x, z, a) => [(z > 0 ? 1 : -1) * a, 0, (x > 0 ? -1 : 1) * a];
const capteur = (i, [x, z]) => ({ name: 'capteur' + i, bone: 'capteur' + i, seed: 'capteur', bord: false, from: [x - 0.55, 8.2, z - 0.55], to: [x + 0.55, 11.8, z + 0.55], faces: { all: ['cc', 'cC', 'CC', 'tt', 'tt', 'tt', 'td', 'dd'], up: 'c', down: 'd' } });
const dent = (name, x, z) => ({ name, bone: 'corps', seed: 'dent', bord: false, from: [x - (z ? 0.9 : 0.35), 8.2, z - (z ? 0.35 : 0.9)], to: [x + (z ? 0.9 : 0.35), 9.1, z + (z ? 0.35 : 0.9)], faces: { all: 'o', up: 'O' } });
const sculk = ['dddDdddd', 'dDdddddd', 'ddddddDd', 'dddddddd', 'ddDddddd', 'ddddddcd', 'dcdddDdd', 'dddddddd'];
const vibre = (x, z) => { const r = (a) => penche(x, z, a); return { rotation: [[0, [0, 0, 0]], [0.15, r(18)], [0.3, r(9)], [0.45, r(20)], [0.6, r(9)], [0.75, r(20)], [0.9, r(9)], [1.05, r(18)], [1.3, [0, 0, 0]]] }; };

export default {
    name: 'sculk',
    title: 'Sculk',
    palette: { ...COMMUN, d: '#12404c', D: '#0c2f39', t: '#1b6470', c: { c: '#39e6ee' }, C: { c: '#1fb5c4' }, k: { c: '#5ef4f6' }, b: '#18626e', v: '#0e3640', V: '#0a2a33', o: '#e9e4d2', O: '#cfc8b0', a: '#2fd0dc', A: { c: '#b9fbff' } },
    bones: {
        root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.6, 0] }, ventre: { parent: 'corps', pivot: [0, 1.6, 0] }, coeur: { parent: 'corps', pivot: [0, 8.2, 0] },
        ...Object.fromEntries(P.map(([x, z], i) => ['capteur' + i, { parent: 'corps', pivot: [x, 8.2, z], rot: penche(x, z, 11) }])),
    },
    cubes: [
        { name: 'veines', bone: 'root', bord: false, from: [-4.8, 0.8, -4.8], to: [4.8, 1.6, 4.8], faces: { all: 'v', up: ['vVvvcvVv', 'VvvvvvVv', 'vvvVvvcv', 'cvvvvVvv', 'vvVvvvvv', 'vCvvvVvc', 'vvvvcvvv', 'VvcvvvVv'], down: 'V' } },
        { name: 'ventre', bone: 'ventre', from: [-3.4, 1.6, -3.4], to: [3.4, 8.2, 3.4], faces: { all: sculk, north: ['dddDdddd', 'dDdddddd', 'dddddddd', 'ddkddkdd', 'ddkddkdd', 'dbbddbbd', 'dddddDdd', 'dddddddd'], up: ['ddddDddd', 'dDdddddd', 'dddttddd', 'ddttttdd', 'ddttttdd', 'dddttddd', 'ddddddDd', 'dddddddd'], down: 'D' } },
        { name: 'coeur', bone: 'coeur', bord: false, from: [-1.1, 8.2, -1.1], to: [1.1, 9, 1.1], faces: { all: 'a', up: ['aaaa', 'aAAa', 'aAAa', 'aaaa'] } },
        ...P.map((p, i) => capteur(i, p)),
        dent('dent1', 0, -3), dent('dent2', 0, 3), dent('dent3', 3, 0), dent('dent4', -3, 0),
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(respire('ventre', IDLE, 2, 0.04), regarde('corps', IDLE, 8, 2), tic('capteur0', [0, 0, -16], 0.8), tic('capteur3', [0, 0, 16], 2.2), tic('capteur1', [0, 0, 16], 3.6), tic('capteur2', [0, 0, -16], 5),
                { coeur: { scale: [[0, [1, 1, 1]], [0.75, [1.25, 1.5, 1.25]], [1.5, [1, 1, 1]], [2.25, [1.25, 1.5, 1.25]], [3, [1, 1, 1]], [3.75, [1.25, 1.5, 1.25]], [4.5, [1, 1, 1]], [5.25, [1.25, 1.5, 1.25]], [6, [1, 1, 1]]] } }),
        },
        walk: { length: WALK, bones: mix(tient('corps', [-7, 0, 0]), ...P.map(([x, z], i) => tient('capteur' + i, [22, 0, 0])), balance('coeur', [0, 0.25, 0], WALK, { canal: 'position' })) },
        interact: {
            length: 1.5, loop: false,
            bones: {
                corps: { position: [[0, [0, 0, 0]], [0.12, [0, 1.8, 0]], [0.28, [0, 0, 0]]] },
                ventre: { scale: [[0, [1, 1, 1]], [0.12, [0.92, 1.1, 0.92]], [0.28, [1.08, 0.92, 1.08]], [0.45, [1, 1, 1]]] },
                coeur: { scale: [[0, [1, 1, 1]], [0.15, [1.8, 3, 1.8]], [0.35, [1.2, 1.4, 1.2]], [0.55, [1.8, 3, 1.8]], [0.75, [1.2, 1.4, 1.2]], [0.95, [1.8, 3, 1.8]], [1.3, [1, 1, 1]]] },
                ...Object.fromEntries(P.map(([x, z], i) => ['capteur' + i, vibre(x, z)])),
            },
        },
    },
};
