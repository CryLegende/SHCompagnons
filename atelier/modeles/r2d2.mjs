// R2-D2 : corps à panneaux bleus, dôme qui pivote de gauche à droite, voyant qui passe du rouge au bleu.
import { mirrored } from '../kit.mjs';

const jambe = { id: 'jambeG', size: [1.7, 7, 2.8], pos: [4, 5.1, 0], skin: { all: 'w', px: ['wwwwwwww', 'wbbbbbbw', 'wbbbbbbw', 'wwwwwwww', 'wwbbbbww', 'wwbbbbww', 'wwwwwwww', 'ssssssss'], nx: 'w', front: ['wwwwwwww', 'wwbbbbww', 'wwbbbbww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'ssssssss'], bottom: 's' } };
const pied = { id: 'piedG', size: [2.4, 1.9, 4.2], pos: [4, 0.95, 0.3], skin: { all: 'w', sides: ['wwwwwwww', 'wwwwwwww', 'bbbbbbbb', 'bbbbbbbb', 'wwwwwwww', 'wwwwwwww', 'ssssssss', 'ssssssss'], front: ['wwwwwwww', 'wwwwwwww', 'bbbbbbbb', 'bbbbbbbb', 'wwwwwwww', 'wwwwwwww', 'ssssssss', 'ssssssss'], bottom: 's' } };
const dome = (v) => ({ all: 's', front: ['ssssssss', 'ssssssss', 'sbbbbbbs', 'sbkkbb' + v + 's', 'sbkkbb' + v + 's', 'sbbbbbbs', 'ssssssss', 'bbbbbbbb'], sides: ['ssssssss', 'ssssssss', 'sbbssbbs', 'sbbssbbs', 'sbbssbbs', 'sbbssbbs', 'ssssssss', 'bbbbbbbb'], back: ['ssssssss', 'ssssssss', 'sbbbbbbs', 'sbssssbs', 'sbssssbs', 'sbbbbbbs', 'ssssssss', 'bbbbbbbb'], top: 's', bottom: 'S' });
const tourne = (t, a) => ({ t, groups: { dome: { rot: [0, a, 0] } } });
export default {
    name: 'r2d2',
    title: 'R2-D2',
    scale: 0.5,
    palette: { w: '#eef0f3', W: '#d5d9df', b: '#2c50aa', B: '#213d85', s: '#bcc3cb', S: '#9aa1aa', k: { c: '#15171c', n: 0 }, r: { c: '#ee3030', n: 0 }, c: { c: '#39a8ff', n: 0 } },
    groups: { dome: { pivot: [0, 8.6, 0] } },
    parts: [
        { id: 'corps', size: [6, 6.6, 6], pos: [0, 5.4, 0], skin: { all: 'w', front: ['wwwwwwww', 'wbbwwbbw', 'wbbwwbbw', 'wwwwwwww', 'wssbbssw', 'wssbbssw', 'wwwwwwww', 'WWWWWWWW'], back: ['wwwwwwww', 'wbbbbbbw', 'wwwwwwww', 'wwssssww', 'wwssssww', 'wwwwwwww', 'wbbbbbbw', 'WWWWWWWW'], sides: ['wwwwwwww', 'wwbbbbww', 'wwbbbbww', 'wwwwwwww', 'wwwwwwww', 'wwssssww', 'wwwwwwww', 'WWWWWWWW'], top: 's', bottom: 'S' } },
        { id: 'dome', group: 'dome', size: [6, 2.8, 6], pos: [0, 10.1, 0], skin: dome('r') },
        { id: 'calotte', group: 'dome', size: [4.4, 1.3, 4.4], pos: [0, 12.1, 0], skin: { all: 's', top: ['ssssssss', 'sbbbbbbs', 'sbssssbs', 'sbssssbs', 'sbssssbs', 'sbssssbs', 'sbbbbbbs', 'ssssssss'], sides: ['ssssssss', 'ssssssss', 'bbbbbbbb', 'bbbbbbbb', 'ssssssss', 'ssssssss', 'ssssssss', 'ssssssss'] } },
        jambe, mirrored(jambe, 'jambeD'),
        pied, mirrored(pied, 'piedD'),
        { id: 'piedCentre', size: [2.6, 1.7, 3.2], pos: [0, 0.85, 1.2], skin: { all: 'w', sides: ['wwwwwwww', 'wwwwwwww', 'bbbbbbbb', 'bbbbbbbb', 'wwwwwwww', 'wwwwwwww', 'ssssssss', 'ssssssss'], front: ['wwwwwwww', 'wwwwwwww', 'bbbbbbbb', 'bbbbbbbb', 'wwwwwwww', 'wwwwwwww', 'ssssssss', 'ssssssss'], bottom: 's' } },
    ],
    clips: [
        { loop: 90, keys: [tourne(30, 0), tourne(38, 42), tourne(52, 42), tourne(66, -42), tourne(80, -42), tourne(86, 0)] },
        { loop: 30, keys: [{ t: 18, parts: { dome: { skin: dome('c') } } }] },
    ],
    frames: [0, 34, 38, 59, 66, 20],
};
