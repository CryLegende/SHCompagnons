// Braise, le petit renard porte-lanterne (d'après le renard à la lanterne de banque-models.shop, demande de Cry du
// 17 novembre 2026 : il remplace le Panda roux, même clé de compagnon pour que ceux qui l'avaient le gardent).
// Il tient dans sa gueule, par son anse, une lanterne allumée pour éclairer le chemin de son maître (pièce lumineuse :
// elle se voit la nuit). Renard roux au masque crème, chaussettes brun foncé, grandes oreilles, queue touffue
// recourbée vers le haut au bout crème.
// Au repos la lanterne se balance au bout de son anse et la flamme vacille. Au clic il se dresse sur ses pattes
// arrière, lève la lanterne qui s'illumine et balaie l'horizon du regard, à gauche puis à droite, puis se repose en
// remuant la queue.
import { COMMUN, IDLE, WALK, mix, balance, tient, respire, regarde, tic, pendouille, pedale, flanc, paire, pattes4, squelette } from './_style.mjs';

const z3 = (v) => [v, v, v];
const flip = (rows) => rows.map((l) => [...l].reverse().join(''));
const P = pattes4({ x: 1.9, zAv: -0.6, zAr: 4.0, size: [1.7, 2.8, 1.7], faces: { all: ['ff', 'ff', 'dd', 'dd'], down: 'd' } });
// Grande oreille : roux, intérieur crème, pointe brun foncé
const O = paire('oreille', { parent: 'tete', pivot: [2.3, 11.2, -4.9] }, {
    from: [1.2, 11.2, -5.6], to: [3.4, 14.4, -4.2], rot: [0, 0, -8], pivot: [2.3, 11.2, -4.9],
    faces: { all: ['dddd', 'ffff', 'ffff', 'ffff'], north: ['dddd', 'fwwf', 'fwwf', 'fwwf'], up: 'd' },
});
// Joue droite vue de l'extérieur (gauche du dessin = arrière) : touffe crème vers l'avant, en bas
const joue = ['ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'fffffwww', 'ffffwwww', 'fffwwwww'];
// Bout de queue vu de côté (gauche du dessin = arrière) : moitié arrière crème
const bout = Array(8).fill('wwwwffff');
// Lanterne : cadre de fer sombre, vitres qui brillent, cœur plus clair
const vitre = ['IiiiiiiI', 'iyyyyyyi', 'iyYYYYyi', 'iyYYYYyi', 'iyYYYYyi', 'iyyyyyyi', 'iiiiiiii', 'iIIIIIIi'];
const M = [0, 5.7, -9.0]; // la gueule : la lanterne pend de là

export default {
    name: 'panda_roux',
    title: 'Braise',
    palette: {
        ...COMMUN,
        f: '#e8742c', F: '#c45a1e', w: '#f3e6d0', d: '#4a2a1e', n: { c: '#22140e' },
        i: '#3d414c', I: '#2a2d35', y: '#ffb93a', Y: '#fff0a0',
    },
    bones: {
        ...squelette([0, 2.8, 1.7], [0, 6.5, -1.8], [0, 2.6, 1.7]),
        lanterne: { parent: 'tete', pivot: M },
        queue: { parent: 'corps', pivot: [0, 5.4, 5.0], rot: [-10, 0, 0] },
        queueBout: { parent: 'queue', pivot: [0, 5.8, 9.4], rot: [-30, 0, 0] },
        ...O.bones, ...P.bones,
    },
    cubes: [
        {
            name: 'ventre', bone: 'ventre', bord: 'haut', from: [-2.8, 2.6, -2], to: [2.8, 7.2, 5.4],
            faces: { all: 'f', east: flanc('f', 'w'), west: flanc('f', 'w'), north: ['ffffffff', 'ffwwwwff', 'fwwwwwwf', 'fwwwwwwf', 'fwwwwwwf', 'ffwwwwff', 'ffwwwwff', 'fffwwfff'], down: 'w' },
        },
        {
            name: 'tete', bone: 'tete', from: [-3.4, 5.6, -8.2], to: [3.4, 11.4, -1.8],
            faces: { all: 'f', down: 'w', east: joue, west: flip(joue), north: ['ffffffff', 'ffffffff', 'fkffffkf', 'fkffffkf', 'bbwffwbb', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'] },
        },
        {
            name: 'museau', bone: 'tete', from: [-1.5, 5.6, -9.9], to: [1.5, 7.6, -8.2],
            faces: { all: 'w', north: ['wwwnnwww', 'wwwnnwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'], up: ['wwwnnwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'] },
        },
        ...O.cubes,
        // La lanterne tenue par son anse dans la gueule, juste sous le museau
        { name: 'lanterne', bone: 'lanterne', lumineux: true, from: [-1.4, 2.4, -10.4], to: [1.4, 5.6, -7.6], faces: { all: vitre, up: ['iiii', 'iIIi', 'iIIi', 'iiii'], down: 'I' } },
        { name: 'queue', bone: 'queue', from: [-2.1, 3.6, 5.0], to: [2.1, 7.6, 9.8], faces: { all: 'f', south: 'f' } },
        { name: 'queueBout', bone: 'queueBout', from: [-2.3, 3.6, 9.0], to: [2.3, 8.0, 14.0], faces: { all: 'f', east: bout, west: flip(bout), up: ['ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'], down: ['wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'ffffffff', 'ffffffff', 'ffffffff', 'ffffffff'], south: 'w' } },
        ...P.cubes,
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(
                respire('ventre', IDLE, 2, 0.05), regarde('tete', IDLE, 8, 2), tic('oreilleD', [0, 0, -16], 2.2), tic('oreilleG', [0, 0, 16], 4.6), pendouille(undefined, 6),
                // La queue ondule, son bout en retard ; la lanterne se balance au bout de son anse ; la flamme vacille
                balance('queueBout', [0, 14, 4], IDLE, { tours: 2 }),
                balance('lanterne', [7, 0, 5], IDLE, { tours: 3 }),
                { lanterne: { scale: [[2.4, z3(1)], [2.5, z3(1.1)], [2.6, z3(1)], [2.7, z3(1.07)], [2.8, z3(1)]] } },
            ),
        },
        walk: {
            length: WALK,
            // Petit trot, la lanterne ballotte, la queue flotte derrière
            bones: mix(pedale(undefined, 28), tient('corps', [-4, 0, 0]), balance('lanterne', [16, 0, 0], WALK, { phase: 1 }), tient('queue', [8, 0, 0]), tient('queueBout', [10, 0, 0])),
        },
        interact: {
            length: 2.3,
            loop: false,
            bones: {
                // Se dresse sur ses pattes arrière (le devant monte), redescend à 1,75 s
                root: {
                    rotation: [[0, z3(0)], [0.3, [38, 0, 0]], [1.75, [38, 0, 0]], [2.0, z3(0)]],
                    position: [[0, z3(0)], [0.3, [0, 1.2, 0]], [1.75, [0, 1.2, 0]], [2.0, z3(0)], [2.1, [0, 0.4, 0]], [2.2, z3(0)]],
                },
                // La tête lève la lanterne bien haut et balaie l'horizon : gauche, droite, puis au centre
                tete: { rotation: [[0, z3(0)], [0.3, [-12, 0, 0]], [0.55, [-12, 0, 0]], [0.8, [-12, 34, 4]], [1.05, [-12, 34, 4]], [1.35, [-12, -34, -4]], [1.55, [-12, -34, -4]], [1.75, [-12, 0, 0]], [2.0, z3(0)]] },
                // La lanterne reste à peu près d'aplomb sous l'anse et s'illumine pendant le tour d'horizon
                lanterne: {
                    rotation: [[0, z3(0)], [0.3, [-30, 0, 0]], [0.45, [-20, 0, 0]], [0.55, [-26, 0, 0]], [1.75, [-26, 0, 0]], [2.0, [10, 0, 0]], [2.15, [-5, 0, 0]], [2.3, z3(0)]],
                    scale: [[0, z3(1)], [0.3, z3(1)], [0.55, z3(1.5)], [1.55, z3(1.5)], [1.85, z3(1)]],
                },
                // Pattes avant repliées contre le poitrail, qui pédalent un peu
                patteAvD: { rotation: [[0, z3(0)], [0.3, [-55, 0, 0]], [0.8, [-45, 0, 0]], [1.3, [-55, 0, 0]], [1.75, [-45, 0, 0]], [2.0, z3(0)]] },
                patteAvG: { rotation: [[0, z3(0)], [0.3, [-45, 0, 0]], [0.8, [-55, 0, 0]], [1.3, [-45, 0, 0]], [1.75, [-55, 0, 0]], [2.0, z3(0)]] },
                // Pattes arrière d'aplomb pour porter le renard dressé
                patteArD: { rotation: [[0, z3(0)], [0.3, [-38, 0, 0]], [1.75, [-38, 0, 0]], [2.0, z3(0)]] },
                patteArG: { rotation: [[0, z3(0)], [0.3, [-38, 0, 0]], [1.75, [-38, 0, 0]], [2.0, z3(0)]] },
                // Oreilles droites aux aguets, puis la queue remue de contentement
                oreilleD: { rotation: [[0, z3(0)], [0.3, [-10, 0, 8]], [1.75, [-10, 0, 8]], [2.0, z3(0)]] },
                oreilleG: { rotation: [[0, z3(0)], [0.3, [-10, 0, -8]], [1.75, [-10, 0, -8]], [2.0, z3(0)]] },
                queue: { rotation: [[0, z3(0)], [0.3, [-30, 0, 0]], [1.75, [-30, 0, 0]], [1.9, [0, 18, 0]], [2.05, [0, -18, 0]], [2.2, [0, 10, 0]], [2.3, z3(0)]] },
            },
        },
    },
};
