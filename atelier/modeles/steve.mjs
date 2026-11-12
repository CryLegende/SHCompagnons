// Steve : mini Steve qui donne des coups de pioche ; il cligne des yeux et met ses lunettes noires par moments.
import { chibi, manche, pantalon } from './_chibi.mjs';

const tete = (yeux, dessous) => ({
    all: 'c',
    front: ['cccccccc', 'cccccccc', 'chhhhhhc', 'hhhhhhhh', yeux, dessous, 'hhbmmbhh', 'hhbbbbhh'],
    sides: ['cccccccc', 'cccccccc', 'cccccccc', 'hhcccccc', 'hhhccccc', 'hhhhcccc', 'hhhhhhcc', 'hhhhhhhc'],
    back: ['cccccccc', 'cccccccc', 'cccccccc', 'cccccccc', 'cccccccc', 'cccccccc', 'chhhhhhc', 'hhhhhhhh'],
    top: 'c', bottom: 'h',
    seed: 'steve',
});
const normal = tete('hwihhiwh', 'hhhnnhhh'), clin = tete('hHHhhHHh', 'hhhnnhhh'), lunettes = tete('kkkkkkkk', 'hkkhhkkh');
const coup = (t, a) => ({ t, groups: { brasD: { rot: [a, 0, 0] } } });
const visage = (t, skin) => ({ t, parts: { tete: { skin } } });
export default chibi({
    name: 'steve',
    title: 'Steve',
    head: normal,
    palette: { h: '#b88d6f', H: '#9a7358', n: '#8f6449', c: '#2f2014', b: '#4a2f1c', m: '#7a4a3a', w: { c: '#ffffff', n: 0 }, i: { c: '#4a3fa0', n: 0.02 }, k: { c: '#141414', n: 0 }, t: '#14a5a6', T: '#0e8687', j: '#4545ae', J: '#35358c', s: '#5c5c5c' },
    torso: { all: 't', front: ['tthhhhtt', 'ttthhttt', 'tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'TTTTTTTT', 'jjjjjjjj'], back: ['tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'TTTTTTTT', 'jjjjjjjj'], bottom: 'j' },
    sleeve: manche('t', 'T', 'h', 'H'),
    leg: pantalon('j', 'J', 's'),
    arm: { rot: [-18, 0, 0] },
    extra: [{ id: 'pioche', group: 'brasD', item: 'diamond_pickaxe', size: [8], pos: [-6.2, 6.2, 1.3], rot: [0, 180, 0] }],
    clips: [
        { loop: 44, keys: [coup(20, -18), coup(25, -128), coup(28, -42), coup(33, -128), coup(36, -42), coup(40, -18)] },
        { loop: 130, keys: [visage(60, clin), visage(65, lunettes), visage(125, clin)] },
    ],
    frames: [0, 22, 25, 28, 33, 36, 62, 70],
});
