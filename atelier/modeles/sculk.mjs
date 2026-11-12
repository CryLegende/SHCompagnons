// Sculk : le bloc de départ (yeux qui clignent) sur un tapis de veines, quatre tentacules de capteur qui frémissent.
import { cycle } from './_aides.mjs';
import { TETES } from './_tetes.mjs';

const P = [[-2.3, -2.3], [2.3, -2.3], [-2.3, 2.3], [2.3, 2.3]];
const lean = (x, z, a, b) => [(z > 0 ? 1 : -1) * a, 0, (x > 0 ? -1 : 1) * b];
const wig = (t, k) => ({ t, groups: Object.fromEntries(P.map(([x, z], i) => ['c' + i, { rot: lean(x, z, 12 + 14 * k * (i % 3 ? 1 : -1), 12 + 14 * k * (i % 3 ? -1 : 1)) }])) });
export default {
    name: 'sculk',
    title: 'Sculk',
    scale: 0.55,
    palette: { s: '#0c2a33', S: '#081d24', t: '#0f4a56', c: { c: '#29dfeb', n: 0.04 }, C: '#17a3b0' },
    noise: 0.09,
    groups: Object.fromEntries(P.map(([x, z], i) => ['c' + i, { pivot: [x, 7, z], rot: lean(x, z, 12, 12) }])),
    parts: [
        { id: 'corps', size: [7, 7, 7], pos: [0, 3.5, 0], skin: { url: TETES.Sculk[0].h } },
        { id: 'veines', size: [9.6, 0.9, 9.6], pos: [0, 0.2, 0], skin: { all: 'S', top: ['sSsstsSs', 'SscsssSs', 'sssSssts', 'tssssCss', 'ssSsssss', 'sCsssSsc', 'sssstsss', 'SstsssSs'], sides: 's' } },
        ...P.map(([x, z], i) => ({ id: 'c' + i, group: 'c' + i, size: [1.1, 3.4, 1.1], pos: [x, 8.6, z], skin: { all: 't', sides: ['cccccccc', 'cCcccCcc', 'CCCCCCCC', 'tCtttCtt', 'tttttttt', 'tttstttt', 'ststtsts', 'ssssssss'], top: 'c', bottom: 's', seed: 'tentacule' } })),
    ],
    clips: [
        { loop: 90, keys: [wig(8, 1), wig(22, -1), wig(36, 1), { t: 48 }] },
        cycle(['corps'], TETES.Sculk),
    ],
    frames: [0, 8, 22, 36, 121, 123],
};
