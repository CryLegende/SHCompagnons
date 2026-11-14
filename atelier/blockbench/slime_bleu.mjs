// Slime bleu : un aquarium. Un poisson tropical tourne dans sa gelée, deux bulles montent.
import { slime } from './_slime.mjs';
import { peau, TETES } from './_officiel.mjs';
import { IDLE, flotte } from './_style.mjs';

const tour = (duree) => ({ rotation: [0, 1, 2, 3, 4].map((i) => [i * duree / 4, [0, -i * 90, 0]]) });
const made = slime({
    name: 'slime_bleu', title: 'Slime bleu', verre: 'light_blue_stained_glass', tete: (await peau(TETES.slime_bleu)).tete, teinte: '#7cc8ffa0',
    palette: { w: { c: '#e9f7ff' } },
    plus: {
        bones: { poisson: { parent: 'corps', pivot: [0, 4.8, 0], rot: [0, 105, 0] }, bulle1: { parent: 'corps', pivot: [2.9, 6.4, -2.8] }, bulle2: { parent: 'corps', pivot: [-3, 3.4, 2.5] } },
        cubes: [
            { name: 'poisson', bone: 'poisson', item: 'tropical_fish', from: [-1.3, 1.6, -3.25], to: [1.3, 4.2, -3.05], faces: { all: 'w' } },
            { name: 'bulle1', bone: 'bulle1', bord: false, from: [2.5, 6, -3.2], to: [3.3, 6.8, -2.4], faces: { all: 'w' } },
            { name: 'bulle2', bone: 'bulle2', bord: false, from: [-3.3, 3.1, 2.2], to: [-2.7, 3.7, 2.8], faces: { all: 'w' } },
        ],
    },
});
Object.assign(made.animations.idle.bones, { poisson: tour(IDLE) }, flotte('bulle1', 1.6, IDLE / 2, 0), flotte('bulle2', 2.2, IDLE / 2, 0.5));
export default made;
