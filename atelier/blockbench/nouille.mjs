// Nouille, le dragon nouille : long corps turquoise qui ondule dans l'air, ventre crème, bois crème, moustaches
// dorées, crête et nageoires rouge orangé. Au clic il fait un looping complet, le corps enroulé dans la boucle.
import { mirrored, mirroredBone, mirroredKeys } from '../bbkit.mjs';
import { COMMUN, IDLE, WALK, mix, tient, tic } from './_style.mjs';

const round = (t) => Math.round(t * 100) / 100;
/** Ondulation d'un os : sinus de « tours » périodes sur la durée, décalé de « retard » (fraction de période). */
function onde(os, [ax, ay, az], duree, tours, retard = 0, pas = 6) {
    const keys = [], n = tours * pas;
    for (let i = 0; i <= n; i++) {
        const t = i * duree / n, a = Math.sin(2 * Math.PI * (i / pas - retard));
        keys.push([round(t), [ax * a, ay * a, az * a].map((v) => Math.round(v * 100) / 100), 'smooth']);
    }
    return { [os]: { rotation: keys } };
}

const nageoire = { parent: 'tete', pivot: [4, 8.4, -1.6] };
const moustache = { parent: 'tete', pivot: [3, 4.95, -9.05] };
const bois = { name: 'boisD', bone: 'tete', bord: 'bas', from: [1.8, 9.5, -2.8], to: [3.6, 14.4, -1.0], rot: [-8, 0, -14], pivot: [2.7, 9.5, -1.9], faces: { all: ['aaaa', 'aaaa', 'aaaa', 'AAAA'], up: 'a', down: 'A' } };
const moust = { name: 'moustacheD', bone: 'moustacheD', bord: false, from: [3, 4.6, -9.4], to: [8.6, 5.3, -8.7], rot: [0, 12, 24], pivot: [3, 4.95, -9.05], faces: { all: 'o', up: ['oooooooo', 'oooooooO'] } };
const nag = { name: 'nageoireD', bone: 'nageoireD', from: [4, 6, -3.4], to: [5.3, 9.4, -0.6], rot: [-14, 0, 0], pivot: [4, 8.4, -1.6], faces: { all: ['rrrr', 'rRrr', 'rRrR', 'rrrR'], up: 'r' } };
// Flanc d'un segment : turquoise, ventre crème sur les trois lignes du bas
const flanc = ['tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'Twwwwwww', 'wwwwwwww', 'wwwwwwww'];
const flancG = flanc.map((l) => [...l].reverse().join(''));
// Dos d'un segment vu du dessus (haut du dessin = avant) : une écaille rouge de la crête
const dos = ['tttttttt', 'tttrrttt', 'tttrrttt', 'tttttttt', 'tttttttt', 'tttttttt', 'tTttttTt', 'tttttttt'];

// Looping : le dragon se cabre, monte, passe sur le dos et redescend, en suivant un cercle de rayon R (pixels)
const R = 5, DEBUT = 0.1, BOUCLE = 1.1, N = 8;
const tour = [], trajet = [];
for (let i = 0; i <= N; i++) {
    const th = 2 * Math.PI * i / N, t = round(DEBUT + BOUCLE * i / N);
    tour.push([t, [360 * i / N, 0, 0]]);
    trajet.push([t, [0, Math.round(R * (1 - Math.cos(th)) * 100) / 100, Math.round(-R * Math.sin(th) * 100) / 100]]);
}
const enroule = (a) => ({ rotation: [[0, [0, 0, 0]], [0.25, [-a, 0, 0]], [0.95, [-a, 0, 0]], [1.3, [a * 0.25, 0, 0]], [1.5, [0, 0, 0]]] });
const moustacheFouet = { rotation: [[0, [0, 0, 0]], [0.3, [0, -30, -10]], [1.0, [0, -30, -10]], [1.25, [0, 8, 6]], [1.4, [0, -6, -4]], [1.6, [0, 0, 0]]] };

export default {
    name: 'nouille',
    title: 'Nouille',
    palette: {
        ...COMMUN, b: '#e9837f',
        t: '#55d0b4', T: '#3aa88f', w: '#eee0b6', r: '#ea6e55', R: '#c9533f',
        a: '#efe7c4', A: '#d9cfa4', o: '#e4b240', O: '#c4922e', n: '#2f8f78',
    },
    bones: {
        root: { pivot: [0, 6, 1] },
        tete: { parent: 'root', pivot: [0, 6, -1] },
        nageoireD: nageoire, nageoireG: mirroredBone(nageoire),
        moustacheD: moustache, moustacheG: mirroredBone(moustache),
        seg1: { parent: 'root', pivot: [0, 6, -0.6], rot: [-9, 8, 0] },
        seg2: { parent: 'seg1', pivot: [0, 6.2, 4.4], rot: [-3, -16, 0] },
        queue: { parent: 'seg2', pivot: [0, 6.2, 8.8], rot: [10, 18, 0] },
    },
    cubes: [
        {
            name: 'tete', bone: 'tete', from: [-4, 3, -7], to: [4, 9.5, -0.6],
            faces: {
                all: 't', down: 'w',
                north: ['tttttttt', 'ttkttktt', 'ttkttktt', 'ttkttktt', 'bbttttbb', 'tttttttt', 'tttttttt', 'tttttttt'],
                up: ['tttttttt', 'tTTTTTTt', 'tTttttTt', 'tTttttTt', 'tTttttTt', 'tTTTTTTt', 'tttttttt', 'tttttttt'],
            },
        },
        {
            name: 'museau', bone: 'tete', from: [-2.8, 3, -10.2], to: [2.8, 5.6, -6.9],
            faces: {
                all: 't', down: 'w',
                up: ['tttttttt', 'tttttttt', 'tnnttnnt', 'tnnttnnt', 'tttttttt', 'tttttttt', 'tttttttt', 'tttttttt'],
                north: ['tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'tTTTTTTt', 'wwwwwwww', 'wwwwwwww'],
            },
        },
        { name: 'crete', bone: 'tete', from: [-1.3, 9.5, -5.6], to: [1.3, 11.4, -3], faces: { all: ['rrrr', 'rrrr', 'rrrr', 'RRRR'], up: 'r' } },
        bois, mirrored(bois, 'boisG'),
        moust, mirrored(moust, 'moustacheG', 'moustacheG'),
        nag, mirrored(nag, 'nageoireG', 'nageoireG'),
        { name: 'seg1', bone: 'seg1', from: [-3.1, 3.4, -0.8], to: [3.1, 8.6, 4.6], faces: { all: 't', east: flanc, west: flancG, up: dos, down: 'w' } },
        { name: 'seg2', bone: 'seg2', from: [-2.5, 4, 4.4], to: [2.5, 8.4, 9], faces: { all: 't', east: flanc, west: flancG, up: dos, down: 'w' } },
        {
            name: 'queue', bone: 'queue', from: [-2, 4.5, 8.8], to: [2, 7.9, 13.4],
            faces: { all: 't', east: ['rrtttttt', 'rrtttttt', 'rrtttttt', 'rrtttttt', 'rrtttttt', 'rRwwwwww', 'rrwwwwww', 'rrwwwwww'], west: ['ttttttrr', 'ttttttrr', 'ttttttrr', 'ttttttrr', 'ttttttrr', 'wwwwwwRr', 'wwwwwwrr', 'wwwwwwrr'], south: 'r', up: ['tttttttt', 'tttrrttt', 'tttrrttt', 'tttttttt', 'tttttttt', 'rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr'], down: 'w' },
        },
    ],
    animations: {
        // Le corps ondule derrière la tête, l'onde descend vers la queue ; moustaches qui flottent, nageoires qui frémissent
        idle: {
            length: IDLE,
            bones: mix(
                onde('seg1', [3, 7, 0], IDLE, 2, 0), onde('seg2', [-4, 10, 0], IDLE, 2, 0.2), onde('queue', [-5, 13, 0], IDLE, 2, 0.4),
                onde('moustacheD', [0, 0, 7], IDLE, 1, 0, 4), onde('moustacheG', [0, 0, -7], IDLE, 1, 0, 4),
                tic('nageoireD', [0, -25, 0], 2.2), tic('nageoireG', [0, 25, 0], 2.2),
            ),
        },
        // Il nage dans l'air : le corps se plie en S d'un côté puis de l'autre, moustaches rabattues par le vent
        walk: {
            length: WALK,
            bones: mix(
                { seg1: { rotation: [[0, [0, 10, 0]], [0.35, [0, -10, 0]]] } },
                { seg2: { rotation: [[0, [0, -20, 0]], [0.35, [0, 20, 0]]] } },
                { queue: { rotation: [[0, [0, 22, 0]], [0.35, [0, -22, 0]]] } },
                tient('tete', [6, 0, 0]),
                tient('moustacheD', [0, -32, -12]), tient('moustacheG', [0, 32, 12]),
                tient('nageoireD', [0, 25, 0]), tient('nageoireG', [0, -25, 0]),
            ),
        },
        // Looping complet, corps enroulé dans la boucle, moustaches qui fouettent ; il retombe à sa place
        interact: {
            length: 1.6,
            loop: false,
            bones: {
                root: { rotation: [[0, [0, 0, 0]], ...tour, [1.6, [360, 0, 0]]], position: [[0, [0, 0, 0]], ...trajet, [1.35, [0, 0.6, 0]], [1.6, [0, 0, 0]]] },
                seg1: enroule(14), seg2: enroule(18), queue: enroule(20),
                moustacheD: moustacheFouet, moustacheG: mirroredKeys(moustacheFouet),
            },
        },
    },
};
