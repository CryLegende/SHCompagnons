// Bébé dragon de l'End : il ne lâche jamais son œuf. Écailles noires, ailes violettes, yeux magenta, l'œuf de dragon
// serré contre lui. Au clic l'œuf se téléporte, comme le vrai : il disparaît de ses bras, reparaît au-dessus de sa
// tête, il lève le nez, affolé, et le rattrape.
import { dragon } from './_dragon.mjs';
import { IDLE, paire, balance } from './_style.mjs';

const B = paire('bras', { parent: 'corps', pivot: [2.2, 5.4, -1.2] }, { from: [1.7, 4.4, -4.6], to: [2.9, 5.6, -1.2], faces: { all: 'l', north: 'F' } });
const leve = (s) => ({ rotation: [[0.15, [0, 0, 0]], [0.4, [58, 0, 12 * s]], [1.15, [58, 0, 12 * s]], [1.35, [0, 0, 0]]] });

export default dragon({
    name: 'dragon_end', title: "Dragonnet de l'End",
    palette: { f: '#51406c', F: '#372a4d', l: '#604d7e', w: '#9483b0', W: '#7d6c9a', m: '#b86be6', h: '#d9d0e6', H: '#b3a8c4', n: { c: '#1b1524' }, k: { c: '#ef8dff' }, b: '#7a56a3', e: '#1a1424', p: { c: '#b659f2' }, P: { c: '#7a3bb5' } },
    plus: {
        bones: { oeuf: { parent: 'corps', pivot: [0, 4.2, -3.2] }, ...B.bones },
        cubes: [
            { name: 'oeuf', bone: 'oeuf', from: [-1.9, 2.2, -5.3], to: [1.9, 6.4, -1.8], faces: { all: ['eeeeeeee', 'eepeeeee', 'eeeeePee', 'epeeeeee', 'eeeepeee', 'eePeeeep', 'eeeeeeee', 'epeeePee'], up: ['eeee', 'epee', 'eeee', 'eeeP'], down: 'e' } },
            ...B.cubes,
        ],
    },
    anim: { idle: balance('oeuf', [0, 0, 3], IDLE, { tours: 2 }) },
    interact: {
        length: 1.6, loop: false,
        bones: {
            oeuf: {
                scale: [[0, [1, 1, 1]], [0.15, [0.05, 0.05, 0.05]], [0.3, [0.05, 0.05, 0.05]], [0.4, [1, 1, 1]], [1.05, [1, 1, 1]], [1.15, [0.05, 0.05, 0.05]], [1.3, [0.05, 0.05, 0.05]], [1.4, [1, 1, 1]]],
                position: [[0.15, [0, 0, 0]], [0.3, [0, 10.6, 2.6]], [0.75, [0, 11.4, 2.6]], [1.15, [0, 10.6, 2.6]], [1.3, [0, 0, 0]]],
                rotation: [[0.4, [0, 0, 0]], [0.75, [0, 180, 0]], [1.1, [0, 360, 0]]],
            },
            tete: { rotation: [[0.15, [0, 0, 0]], [0.4, [26, 0, 0]], [1.15, [26, 0, 0]], [1.35, [0, 0, 0]], [1.45, [-6, 0, 0]], [1.6, [0, 0, 0]]] },
            brasD: leve(1), brasG: leve(-1),
            root: { position: [[0.1, [0, 0, 0]], [0.2, [0, 1.2, 0]], [0.35, [0, 0, 0]]] },
        },
    },
});
