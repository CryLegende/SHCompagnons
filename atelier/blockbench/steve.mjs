// Steve : sa tête officielle sur un petit corps, pioche en diamant à la main. Au clic il donne deux coups de pioche.
import { officiel, personnage } from './_officiel.mjs';

const skin = await officiel('entity/player/wide/steve');

export default personnage({
    name: 'steve',
    title: 'Steve',
    tete: skin.tete,
    tenue: { haut: skin.couleur(22, 24), manche: skin.couleur(45, 21), main: skin.couleur(45, 30), bas: skin.couleur(5, 24), pied: skin.couleur(5, 31) },
    plus: { bones: {}, cubes: [{ name: 'pioche', bone: 'brasD', item: 'diamond_pickaxe', from: [1.6, 1.2, -2.3], to: [7.2, 6.8, -2.1], rot: [0, -30, 0], pivot: [2.8, 4, -2.2], faces: { all: 'h' } }] },
    walk: {},
    interact: {
        length: 1.4, loop: false,
        bones: {
            brasD: { rotation: [[0, [0, 0, 0]], [0.25, [150, 0, 0]], [0.4, [35, 0, 0]], [0.65, [150, 0, 0]], [0.8, [35, 0, 0]], [1.2, [0, 0, 0]]] },
            corps: { rotation: [[0, [0, 0, 0]], [0.25, [6, 0, 0]], [0.4, [-8, 0, 0]], [0.65, [6, 0, 0]], [0.8, [-8, 0, 0]], [1.2, [0, 0, 0]]] },
        },
    },
});
