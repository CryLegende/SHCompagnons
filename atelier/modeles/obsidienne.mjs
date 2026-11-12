// Obsidienne : le cœur de départ (avec sa lueur qui pulse) et quatre éclats en orbite.
import { cycle } from './_aides.mjs';
import { TETES } from './_tetes.mjs';

const eclat = (id, size, pos, rot, tex) => ({ id, group: 'orbite', size: [size, size, size], pos, rot, skin: tex });
const sombre = { all: 'o', sides: ['oooPoooo', 'oPoooooo', 'ooooooPo', 'ooOooooo', 'oooooOoo', 'Pooooooo', 'ooooPooo', 'ooOooooP'], top: ['ooPooooo', 'oooooOoo', 'oPoooooo', 'oooooooP', 'oooPoooo', 'Oooooooo', 'oooooPoo', 'ooOooooo'], bottom: 'O' };
const pleure = { all: 'o', sides: ['ooovoooo', 'oPovoooo', 'oooooovo', 'ovOooovo', 'ovoooOoo', 'Poooooov', 'oooovooo', 'ooOovooP'], top: ['oovooooo', 'oooooOvo', 'oPoooooo', 'ooovoooP', 'oooPoooo', 'Ovoooooo', 'oooooPvo', 'ooOooooo'], bottom: 'O' };
export default {
    name: 'obsidienne',
    title: 'Obsidienne',
    scale: 0.56,
    palette: { o: '#1c1230', O: '#120a20', P: '#3a2760', v: { c: '#a04cf0', n: 0.05 } },
    noise: 0.1,
    groups: { orbite: { pivot: [0, 0, 0] } },
    parts: [
        { id: 'coeur', size: [6.4, 6.4, 6.4], pos: [0, 0, 0], skin: { url: TETES.Obsidienne[0].h } },
        eclat('e0', 2.4, [6.6, 1.2, 0], [20, 30, 15], sombre),
        eclat('e1', 1.8, [0, -1.6, 6.6], [40, 10, 35], pleure),
        eclat('e2', 2.1, [-6.6, 2, 0], [10, 50, 30], pleure),
        eclat('e3', 1.6, [0, -0.6, -6.6], [35, 20, 50], sombre),
    ],
    clips: [
        { loop: 96, lineaire: true, keys: [1, 2, 3, 4, 5].map((k) => ({ t: 16 * k, groups: { orbite: { rot: [0, 60 * k, 0] } } })) },
        cycle(['coeur'], TETES.Obsidienne),
    ],
    frames: [0, 8, 16, 32, 48, 64, 83, 100],
};
