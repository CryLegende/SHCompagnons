// Slime doré : un petit roi et son trésor. Couronne posée sur la coque, une pépite d'or tourne dans sa gelée.
import { slime } from './_slime.mjs';
import { peau, TETES } from './_officiel.mjs';
import { IDLE } from './_style.mjs';

const tour = (duree) => ({ rotation: [0, 1, 2, 3, 4].map((i) => [i * duree / 4, [0, i * 90, 0]]) });
const made = slime({
    name: 'slime_dore', title: 'Slime doré', verre: 'yellow_stained_glass', tete: (await peau(TETES.slime_dore)).tete, teinte: '#ffe066a0',
    palette: { o: '#ffc21f', r: { c: '#e2483f' }, u: { c: '#4f9be8' } },
    plus: {
        bones: { pepite: { parent: 'corps', pivot: [0, 4.8, 0] }, couronne: { parent: 'dessus', pivot: [0, 8.6, 0], rot: [0, 0, 7] } },
        cubes: [
            { name: 'couronne', bone: 'couronne', from: [-1.6, 8.6, -1.6], to: [1.6, 10.1, 1.6], faces: { all: ['oooooooo', 'oroouoor', 'oooooooo', 'oooooooo'], up: 'o' } },
            { name: 'pepite', bone: 'pepite', item: 'gold_nugget', from: [-1, 2, 3.05], to: [1, 4, 3.25], faces: { all: 'o' } },
        ],
    },
});
made.animations.idle.bones.pepite = tour(IDLE);
export default made;
