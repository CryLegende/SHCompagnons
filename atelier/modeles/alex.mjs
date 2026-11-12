// Alex : mini Alex qui fait coucou de la main en penchant la tête.
import { clin } from './_aides.mjs';
import { chibi, manche, pantalon } from './_chibi.mjs';

const salut = (t, a) => ({ t, groups: { brasG: { rot: [0, 0, a] } } });
const def = chibi({
    name: 'alex',
    title: 'Alex',
    head: {
        all: 'o',
        front: ['oooooooo', 'oooooooo', 'ooohhhho', 'oohhhhhh', 'hwghhgwh', 'hhhhhhhh', 'hhhpphhh', 'hhhhhhhh'],
        px: ['oooooooo', 'oooooooo', 'oooooooo', 'hooooooo', 'hhoooooo', 'hhhooooo', 'hhhhoooo', 'hhhhhOOo'],
        nx: ['oooooooo', 'oooooooo', 'oooooooo', 'oooooooo', 'ooooooho', 'ooooohhh', 'oooohhhh', 'oOOhhhhh'],
        back: ['oooooooo', 'oooooooo', 'oooooooo', 'oooooooo', 'oooooooo', 'ooOOOOoo', 'hoOOOOoh', 'hhoOOohh'],
        top: 'o', bottom: 'h',
    },
    armWidth: 1.6,
    palette: { h: '#f1c7a1', H: '#d9a983', o: '#e58a34', O: '#c46f22', w: { c: '#ffffff', n: 0 }, g: { c: '#3d7d45', n: 0.02 }, p: '#d98a80', t: '#86b877', T: '#5f8a54', c: '#5a7a4f', j: '#6b4a35', J: '#523726', s: '#77716b' },
    torso: { all: 't', front: ['tthhhhtt', 'ttthhttt', 'tttttttt', 'tttttttt', 'tttttttt', 'cccccccc', 'TTTTTTTT', 'jjjjjjjj'], back: ['tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'cccccccc', 'TTTTTTTT', 'jjjjjjjj'], sides: ['tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'tttttttt', 'cccccccc', 'TTTTTTTT', 'jjjjjjjj'], bottom: 'j' },
    sleeve: manche('t', 'T', 'h', 'H'),
    leg: pantalon('j', 'J', 's'),
    arm: { rot: [0, 0, 8] },
    clips: [
        { loop: 120, keys: [salut(70, 8), salut(78, 152), salut(83, 124), salut(88, 152), salut(93, 124), salut(98, 152), salut(108, 8)] },
        { loop: 120, keys: [{ t: 72 }, { t: 80, groups: { tete: { rot: [0, 0, -8] } } }, { t: 98, groups: { tete: { rot: [0, 0, -8] } } }, { t: 106 }] },
    ],
    frames: [0, 74, 78, 83, 88, 103],
});
def.clips.push(clin(def, 'tete', { 4: 'hHHhhHHh' }, 109));
export default def;
