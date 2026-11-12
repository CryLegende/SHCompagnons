// Slime en chocolat : la tête de départ découpée en quatre tranches qui se séparent au saut, comme un cube de magma,
// et laissent voir un cœur de caramel. Le saut est dans le modèle : animation NONE dans config.yml.
import { slices, texture } from './_aides.mjs';
import { TETES } from './_tetes.mjs';

const tranches = slices(await texture(TETES.Slime_Choco[0].h), 4, [70, 34, 16]);
const pose = (t, y, gap, stretch = [1, 1, 1]) => ({
    t,
    groups: { tout: { stretch, move: [0, y, 0] } },
    parts: Object.fromEntries([0, 1, 2, 3].map((k) => ['tranche' + k, { pos: [0, 7 - 2 * k + (1.5 - k) * gap, 0] }])),
});
export default {
    name: 'slime_choco',
    title: 'Slime en chocolat',
    scale: 0.6,
    palette: { c: '#f2a23a', C: '#e07a1f', o: '#ffd06b' },
    groups: { tout: { pivot: [0, 0, 0] } },
    parts: [
        ...[0, 1, 2, 3].map((k) => ({ id: 'tranche' + k, group: 'tout', size: [8, 2, 8], pos: [0, 7 - 2 * k, 0], skin: tranches[k] })),
        { id: 'coeur', group: 'tout', size: [5.4, 5.4, 5.4], pos: [0, 4, 0], skin: { all: 'c', sides: ['cocccocc', 'ccccCccc', 'cCcccccc', 'ccccocCc', 'occccccc', 'cccCcccc', 'ccocccoc', 'CccccCcc'], top: 'o', bottom: 'C', noise: 0.08 } },
    ],
    clips: [
        { loop: 58, lineaire: true, keys: [pose(4, 0, 0, [1.12, 0.8, 1.12]), pose(10, 9, 1.5), pose(16, 0.6, 0.6), pose(19, 0, 0, [1.18, 0.74, 1.18]), pose(23, 0, 0)] },
    ],
    frames: [0, 4, 7, 10, 13, 16, 19, 23],
};
