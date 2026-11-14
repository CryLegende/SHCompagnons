// Zombie : sa tête officielle sur un petit corps, bras tendus devant lui. Au clic il se jette en avant en grognant.
import { officiel, personnage } from './_officiel.mjs';
import { IDLE, WALK, mix, balance } from './_style.mjs';

const skin = await officiel('entity/zombie/zombie');
const secoue = (s) => ({ rotation: [[0, [0, 0, 0]], [0.2, [25, 0, 12 * s]], [0.35, [-10, 0, -8 * s]], [0.5, [25, 0, 12 * s]], [0.65, [-10, 0, -8 * s]], [0.8, [20, 0, 0]], [1.2, [0, 0, 0]]] });

export default personnage({
    name: 'zombie',
    title: 'Zombie',
    tete: skin.tete,
    tenue: { haut: skin.couleur(22, 24), manche: skin.couleur(45, 21), main: skin.couleur(45, 30), bas: skin.couleur(5, 24), pied: skin.couleur(5, 31) },
    bras: [80, 0, 0],
    idle: { bras: false, plus: mix(balance('brasD', [5, 0, 0], IDLE, { tours: 2 }), balance('brasG', [5, 0, 0], IDLE, { tours: 2, phase: 1 }), balance('tete', [0, 0, 5], IDLE, { tours: 1 })) },
    walk: { bras: false, plus: mix(balance('brasD', [8, 0, 0], WALK), balance('brasG', [8, 0, 0], WALK, { phase: 1 })) },
    interact: {
        length: 1.3, loop: false,
        bones: {
            brasD: secoue(1), brasG: secoue(-1),
            tete: { rotation: [[0, [0, 0, 0]], [0.2, [0, 0, 16]], [0.5, [0, 0, -16]], [0.8, [-10, 0, 8]], [1.2, [0, 0, 0]]] },
            root: { position: [[0, [0, 0, 0]], [0.2, [0, 0, -1.6]], [0.8, [0, 0, -1.6]], [1.2, [0, 0, 0]]], rotation: [[0, [0, 0, 0]], [0.2, [-12, 0, 0]], [0.8, [-12, 0, 0]], [1.2, [0, 0, 0]]] },
        },
    },
});
