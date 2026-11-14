// Panda : le gourmand. Il serre sa tige de bambou, une feuille oubliée sur la tête, des miettes vertes au coin du
// museau. Au clic il part en roulade arrière et se rassoit, tout étonné.
import { peluche } from './_peluche.mjs';

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
        bones: { feuille: { parent: 'tete', pivot: [-1, 12.4, -1] } },
        cubes: [
            { name: 'bambou', bone: 'brasD', bord: false, from: [3.2, 2.2, -2.9], to: [4.1, 10.2, -2], rot: [0, 0, -8], pivot: [3.6, 4, -2.4], faces: { all: ['gg', 'gg', 'GG', 'gg', 'gg', 'GG', 'gg', 'gg'], up: 'G' } },
            { name: 'feuille', bone: 'feuille', bord: false, from: [-2.4, 12.4, -1.8], to: [0.4, 12.9, -0.2], rot: [0, 24, 10], pivot: [-1, 12.4, -1], faces: { all: 'G', up: ['gGgg', 'ggGg'] } },
        ],
    },
    interact: {
        length: 1.8, loop: false,
        bones: {
            root: { rotation: [[0, [0, 0, 0]], [0.2, [-14, 0, 0]], [0.5, [120, 0, 0]], [0.8, [240, 0, 0]], [1.1, [360, 0, 0]]], position: [[0, [0, 0, 0]], [0.5, [0, 1.5, 2]], [0.8, [0, 1.5, 3]], [1.1, [0, 0, 0]], [1.8, [0, 0, 0]]] },
            tete: { rotation: [[1.1, [0, 0, 0]], [1.25, [0, 0, 12]], [1.45, [0, 0, -12]], [1.65, [0, 0, 0]]] },
            feuille: { position: [[0.2, [0, 0, 0]], [0.6, [-1.5, 3.4, 0]], [1.3, [-0.5, 1.2, 0]], [1.6, [0, 0, 0]]], rotation: [[0.2, [0, 0, 0]], [0.9, [0, 180, 0]], [1.6, [0, 360, 0]]] },
        },
    },
});
