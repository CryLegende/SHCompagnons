// Slime bleu : une petite mer. De l'écume sur le dessus, un voilier à fanion qui tangue dessus ; au bord de l'eau,
// une bouée et un crabe qui fait claquer ses pinces. Au clic il s'écrase puis bondit en vrille, le voilier décolle
// et retombe sur l'écume, le crabe lève les pinces.
import { slime, HAUT, SOL } from './_slime.mjs';
import { IDLE, WALK, balance, mix, tic } from './_style.mjs';

const Y = HAUT + 0.7;
const pince = (name, x) => ({ name, bone: name, bord: false, from: [x - 0.4, SOL + 0.7, -5.2], to: [x + 0.4, SOL + 1.6, -4.4], faces: { all: 'r', north: ['rr', 'RR'] } });
const leve = (s) => ({ rotation: [[0.5, [0, 0, 0]], [0.7, [-40, 0, 30 * s]], [1.1, [-40, 0, 30 * s]], [1.3, [0, 0, 0]]] });

export default slime({
    name: 'slime_bleu', title: 'Slime bleu',
    palette: { c: '#4f9ff0', L: '#86c6ff', h: { c: '#eaf7ff' }, w: '#f6fcff', r: '#dc4a3c', R: '#b5372c', m: '#b98552', M: '#7a5438', s: '#fffaf0', y: '#ffd23f', n: { c: '#2f6fb5' } },
    socle: { all: 'L', up: ['LLLLLLLL', 'LhhLLLLL', 'LLLLLLLL', 'LLLLLhhL', 'LLLLLLLL', 'LLhhLLLL', 'LLLLLLLL', 'LLLLLLLL'] },
    plus: {
        bones: {
            bateau: { parent: 'dessus', pivot: [0, Y, 0], rot: [0, 28, 0] }, pinceD: { parent: 'root', pivot: [4.9, SOL + 0.8, -4.4] }, pinceG: { parent: 'root', pivot: [3.1, SOL + 0.8, -4.4] },
            bouee: { parent: 'root', pivot: [-3.9, SOL, 3.9], rot: [-24, 0, 0] },
        },
        cubes: [
            { name: 'ecume', bone: 'dessus', bord: false, from: [-2.9, HAUT, -2.9], to: [2.9, Y, 2.9], faces: { all: ['wLwwwLww'], up: ['wwwwwwww', 'wwLwwwww', 'wwwwwwLw', 'wwwwwwww', 'wLwwwwww', 'wwwwwLww', 'wwwwwwww', 'wwwLwwww'] } },
            { name: 'coque', bone: 'bateau', from: [-2.1, Y - 0.1, -0.95], to: [2.1, Y + 1.1, 0.95], faces: { all: ['wwwwwwww', 'rrrrrrrr', 'rrrrrrrr', 'RRRRRRRR'], up: 'm', down: 'R' } },
            { name: 'mat', bone: 'bateau', bord: false, from: [-0.2, Y + 1.1, -0.2], to: [0.2, Y + 4.9, 0.2], faces: { all: 'M' } },
            { name: 'voile', bone: 'bateau', bord: false, from: [-1.6, Y + 1.7, -0.5], to: [1.4, Y + 4.4, -0.3], faces: { all: ['ssss', 'ssss', 'rrrr', 'ssss'] } },
            { name: 'fanion', bone: 'bateau', bord: false, from: [-1.3, Y + 4.5, -0.1], to: [-0.2, Y + 5.3, 0.1], faces: { all: 'y' } },
            // Crabe au coin de la flaque (devant, à gauche pour qui regarde)
            { name: 'crabe', bone: 'root', from: [3.2, SOL, -4.9], to: [4.8, SOL + 1, -3.7], faces: { all: 'r', north: ['rrrrrrrr', 'rrkrrkrr', 'rrrrrrrr', 'RRRRRRRR'], up: 'r', down: 'R' } },
            pince('pinceD', 4.9), pince('pinceG', 3.1),
            { name: 'bouee', bone: 'bouee', bord: false, from: [-4.9, SOL, 2.9], to: [-2.9, SOL + 0.7, 4.9], faces: { all: ['rrwwrrww'], up: ['rrwwwwrr', 'rrwwwwrr', 'wwnnnnww', 'wwnnnnww', 'wwnnnnww', 'wwnnnnww', 'rrwwwwrr', 'rrwwwwrr'], down: 'w' } },
        ],
    },
    anim: {
        idle: mix(balance('bateau', [0, 0, 8], IDLE, { tours: 3 }), tic('pinceD', [0, 0, -30], 1.2), tic('pinceG', [0, 0, 30], 3.8)),
        walk: balance('bateau', [0, 0, 12], WALK),
        interact: {
            bateau: { position: [[0.5, [0, 0, 0]], [0.75, [0, 3.2, 0]], [1.0, [0, 0, 0]], [1.1, [0, 0.6, 0]], [1.2, [0, 0, 0]]], rotation: [[0.5, [0, 0, 0]], [0.75, [0, 0, -18]], [1.0, [0, 0, 10]], [1.2, [0, 0, 0]]] },
            pinceD: leve(1), pinceG: leve(-1),
        },
    },
});
