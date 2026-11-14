// Slime doré : une petite couronne posée sur sa coque.
import { slime } from './_slime.mjs';

export default slime({
    name: 'slime_dore', title: 'Slime doré', verre: 'yellow_stained_glass', coeur: '#ffcf3f', teinte: '#ffe066a0',
    palette: { o: '#ffc21f', r: { c: '#e2483f' }, u: { c: '#4f9be8' } },
    plus: { bones: {}, cubes: [{ name: 'couronne', bone: 'corps', from: [-1.5, 8.6, -1.5], to: [1.5, 10, 1.5], faces: { all: ['oooooooo', 'oroouoor', 'oooooooo', 'oooooooo'], up: 'o' } }] },
});
