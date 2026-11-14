// Slime bleu : deux petites bulles flottent dans sa gelée.
import { slime } from './_slime.mjs';
import { IDLE, balance } from './_style.mjs';

const made = slime({
    name: 'slime_bleu', title: 'Slime bleu', verre: 'light_blue_stained_glass', coeur: '#63b7f2', teinte: '#7cc8ffa0',
    palette: { w: { c: '#e9f7ff' } },
    plus: {
        bones: { bulles: { parent: 'corps', pivot: [0, 4.8, 0] } },
        cubes: [
            { name: 'bulle1', bone: 'bulles', bord: false, from: [2.5, 6.6, -3.2], to: [3.3, 7.4, -2.4], faces: { all: 'w' } },
            { name: 'bulle2', bone: 'bulles', bord: false, from: [-3.3, 2.4, 2.2], to: [-2.7, 3, 2.8], faces: { all: 'w' } },
        ],
    },
});
Object.assign(made.animations.idle.bones, balance('bulles', [0, 0.35, 0], IDLE, { tours: 3, canal: 'position' }));
export default made;
