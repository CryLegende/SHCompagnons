// Alex : sa tête officielle sur un petit corps, un arc à la main. Au clic elle saute de joie, les bras en l'air.
import { officiel, personnage } from './_officiel.mjs';
import { joie, mix } from './_style.mjs';

const skin = await officiel('entity/player/slim/alex');
const leve = (s) => ({ rotation: [[0, [0, 0, 0]], [0.3, [170, 0, 14 * s]], [0.75, [170, 0, 14 * s]], [1.1, [0, 0, 0]]] });

export default personnage({
    name: 'alex',
    title: 'Alex',
    tete: skin.tete,
    tenue: { haut: skin.couleur(22, 24), manche: skin.couleur(45, 21), main: skin.couleur(45, 30), bas: skin.couleur(5, 24), pied: skin.couleur(5, 31) },
    plus: { bones: {}, cubes: [{ name: 'arc', bone: 'brasG', item: 'bow', from: [-7.0, 1.4, -2.3], to: [-1.8, 6.6, -2.1], rot: [0, 30, 0], pivot: [-2.8, 4, -2.2], faces: { all: 'h' } }] },
    interact: { length: 1.4, loop: false, bones: mix(joie('root', 2.6, 6), { brasD: leve(1), brasG: leve(-1) }) },
});
