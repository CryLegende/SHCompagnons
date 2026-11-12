// Cookie : biscuit rond de dessin animé, grands yeux qui clignent, bouche ouverte, bras levés qui s'agitent.
import { mirrored, mirroredGroup } from '../kit.mjs';

const brasG = { pivot: [4.2, 6.6, 0], rot: [0, 0, -24] };
const bras = { id: 'brasG', group: 'brasG', size: [0.9, 4, 0.9], pos: [4.4, 8.4, 0], skin: { all: 'n', seed: 'membre' } };
const jambe = { id: 'jambeG', size: [0.9, 2.6, 0.9], pos: [1.7, 0.6, 0], skin: { all: 'n', seed: 'membre' } };
const pied = { id: 'piedG', size: [2.1, 0.9, 1.4], pos: [2.2, -0.9, 0.3], skin: { all: 'n', seed: 'membre' } };
const visage = (a, b) => ({
    all: 'd',
    front: ['ddCddddd', 'dddddCdd', a, b, 'Cddddddd', 'ddmmmmdd', 'dddmrrdd', 'dCddddCD'],
    back: ['dddddCdd', 'dCdddddd', 'ddddlddd', 'dddCdddd', 'dlddddCd', 'dddddddd', 'ddCddldd', 'DDDDDDDD'],
    sides: 'D', top: 'D', bottom: 'D',
});
const bord = (seed) => ({ all: 'd', sides: 'D', top: 'D', bottom: 'D', front: ['dddddddd', 'dCdddddd', 'dddddddl', 'dddddddd', 'ldddddCd', 'dddddddd', 'ddCddddd', 'DDDDDDDD'], back: ['dddddddd', 'ddddlddd', 'Cddddddd', 'dddddddd', 'dddddCdd', 'dldddddd', 'dddddddd', 'DDDDDDDD'], seed });
const agiter = (t, a) => ({ t, groups: { brasG: { rot: [0, 0, a] }, brasD: { rot: [0, 0, -a] } } });
export default {
    name: 'cookie',
    title: 'Cookie',
    scale: 0.46,
    palette: { d: '#d99a52', D: '#b97b3a', l: '#e9b770', C: '#5d3722', n: { c: '#1b1513', n: 0.04 }, w: { c: '#ffffff', n: 0 }, k: { c: '#1b1513', n: 0 }, m: { c: '#3b1f14', n: 0.02 }, r: { c: '#d6453f', n: 0.02 } },
    groups: { brasG, brasD: mirroredGroup(brasG) },
    parts: [
        { id: 'visage', size: [7.4, 7.4, 3.6], pos: [0, 5, 0], skin: visage('dwwddwwd', 'dwkddwkd') },
        { id: 'haut', size: [5, 9, 3.3], pos: [0, 5, 0], skin: bord('haut') },
        { id: 'large', size: [9, 5, 3.3], pos: [0, 5, 0], skin: bord('large') },
        bras, mirrored(bras, 'brasD'),
        jambe, mirrored(jambe, 'jambeD'),
        pied, mirrored(pied, 'piedD'),
    ],
    clips: [
        { loop: 127, keys: [{ t: 120, parts: { visage: { skin: visage('dddddddd', 'dkkddkkd') } } }, { t: 125 }] },
        { loop: 20, keys: [agiter(5, -40), agiter(15, -10)] },
    ],
    frames: [0, 5, 10, 15, 121],
};
