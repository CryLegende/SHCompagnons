// Zombie : mini zombie, bras tendus qui se balancent, tête qui dodeline.
import { chibi, manche, pantalon } from './_chibi.mjs';

const pas = (t, g, d, r) => ({ t, groups: { brasG: { rot: [g, 0, 0] }, brasD: { rot: [d, 0, 0] }, tete: { rot: [0, 0, r] } } });
export default chibi({
    name: 'zombie',
    title: 'Zombie',
    head: {
        all: 'h',
        front: ['GGhGGGhG', 'hGhhhGhh', 'hhhhhhhh', 'hhhhhhhh', 'hkkhhkkh', 'hhhNNhhh', 'hhNNNNhh', 'hhhhhhhh'],
        sides: ['GGGhGGGG', 'GhGhhGhG', 'hhhhGhhh', 'hhhhhhhh', 'hhHhhhhh', 'hhhhhHhh', 'hhhhhhhh', 'hHhhhhhh'],
        back: ['GGGGhGGG', 'GhGGhhGh', 'hhhhhhhh', 'hhhHhhhh', 'hhhhhhhh', 'hhhhhhHh', 'hHhhhhhh', 'hhhhhhhh'],
        top: ['GGGhGGGG', 'GGGGGhGG', 'GhGGGGGG', 'GGGGhGGG', 'GGhGGGGG', 'GGGGGGhG', 'GGGhGGGG', 'GGGGGGGG'],
        bottom: 'H',
    },
    palette: { h: '#5f9550', H: '#487a3c', G: '#3c6933', N: { c: '#2c4a26', n: 0.03 }, k: { c: '#101510', n: 0 }, t: '#1f9c9b', T: '#167c7b', j: '#40409f', J: '#313180', s: '#4f4f57' },
    torso: { all: 't', front: ['tthhhhtt', 'ttthhttt', 'tttttttt', 'ttttTttt', 'tTtttttt', 'ttttttTt', 'TTTTTTTT', 'jjjjjjjj'], back: ['tttttttt', 'tttttttt', 'ttTttttt', 'tttttttt', 'tttttTtt', 'tttttttt', 'TTTTTTTT', 'jjjjjjjj'], bottom: 'j' },
    sleeve: manche('t', 'T', 'h', 'H'),
    leg: pantalon('j', 'J', 's'),
    arm: { rot: [-88, 0, 0] },
    clips: [
        { loop: 40, keys: [pas(10, -98, -78, 7), pas(30, -78, -98, -7)] },
    ],
    frames: [0, 10, 20, 30],
});
