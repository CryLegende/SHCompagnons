// Panda : le gourmand. Il serre sa tige de bambou, une feuille oubliée sur la tête, des miettes vertes au coin du
// museau. Au clic il croque son bambou trois fois (la tige raccourcit), se tapote le ventre tout rond, et la feuille
// sur sa tête sautille de contentement.
import { peluche } from './_peluche.mjs';

const z = [0, 0, 0];

const tache = ['wwwwwwww', 'wPPwwPPw', 'PPkwwkPP', 'wPkwwkPw', 'bbwwwwbb', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'];

export default peluche({
    name: 'panda',
    title: 'Panda',
    palette: { w: '#f8f5ee', d: '#40394a', P: { c: '#5d5566' }, k: { c: '#1c1418' }, n: { c: '#2b1b12' }, m: { c: '#bdb4aa' }, g: '#7cc54a', G: '#4f9a31', p: '#6a6270', v: { c: '#7cc54a' } },
    lettres: { corps: 'w', bras: 'd', oreille: 'd', museau: 'w' },
    dessins: {
        ventre: ['dddddddd', 'dddddddd', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
        flanc: ['dddddddd', 'dddddddd', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
        visage: tache,
        museau: ['wwwnnwww', 'wwwnnwww', 'wwwwwwww', 'wwmwwmvw', 'wwwmmwvw', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'],
        coussinet: ['dddd', 'dppd', 'dppd', 'dddd'],
        creux: 'd',
    },
    plus: {
        bones: { feuille: { parent: 'tete', pivot: [-1, 12.4, -1] }, bambou: { parent: 'brasD', pivot: [3.65, 3, -2.45], rot: [0, 0, -8] } },
        cubes: [
            { name: 'bambou', bone: 'bambou', bord: false, from: [3.2, 2.2, -2.9], to: [4.1, 10.2, -2], faces: { all: ['gg', 'gg', 'GG', 'gg', 'gg', 'GG', 'gg', 'gg'], up: 'G' } },
            { name: 'feuille', bone: 'feuille', bord: false, from: [-2.4, 12.4, -1.8], to: [0.4, 12.9, -0.2], rot: [0, 24, 10], pivot: [-1, 12.4, -1], faces: { all: 'G', up: ['gGgg', 'ggGg'] } },
        ],
    },
    interact: {
        length: 2.0, loop: false,
        bones: {
            brasD: { rotation: [[0, z], [0.3, [28, 0, -12]], [1.15, [28, 0, -12]], [1.4, z]] },
            bambou: {
                rotation: [[0, z], [0.3, [-22, 0, 36]], [1.15, [-22, 0, 36]], [1.4, z]],
                scale: [[0, [1, 1, 1]], [0.45, [1, 1, 1], 'step'], [0.5, [1, 0.84, 1], 'step'], [0.75, [1, 0.84, 1], 'step'], [0.8, [1, 0.68, 1], 'step'], [1.05, [1, 0.68, 1], 'step'], [1.1, [1, 0.52, 1], 'step'], [1.7, [1, 0.52, 1]], [1.85, [1, 1.06, 1]], [1.95, [1, 1, 1]]],
            },
            tete: { rotation: [[0, z], [0.3, [6, 0, 0]], [0.45, [-10, 0, 0]], [0.6, [5, 0, 0]], [0.75, [-10, 0, 0]], [0.9, [5, 0, 0]], [1.05, [-10, 0, 0]], [1.25, [8, 0, 0]], [1.45, [8, 0, -8]], [1.7, [8, 0, 8]], [1.9, z]] },
            ventre: { scale: [[1.1, [1, 1, 1]], [1.3, [1.1, 1.04, 1.16]], [1.75, [1.1, 1.04, 1.16]], [1.95, [1, 1, 1]]] },
            brasG: { rotation: [[1.15, z], [1.3, [18, 0, 30]], [1.42, [18, 0, 20]], [1.54, [18, 0, 30]], [1.66, [18, 0, 20]], [1.78, [18, 0, 30]], [1.95, z]] },
            feuille: { position: [[1.25, z], [1.4, [0, 1.6, 0]], [1.55, z], [1.65, [0, 0.8, 0]], [1.75, z]] },
        },
    },
});
