// Ghast : le cube de départ (avec ses textures de tir) et six tentacules qui ondulent.
import { cycle } from './_aides.mjs';
import { TETES } from './_tetes.mjs';

const T = [[-2.6, -2.4, 5.2], [0.2, -2.8, 6.4], [2.7, -2.2, 4.4], [-2.2, 2.3, 6], [0.6, 2.6, 4.6], [2.9, 2.2, 5.6]];
const sway = (t, k) => ({ t, groups: Object.fromEntries(T.map((_, i) => ['t' + i, { rot: i % 2 ? [-9 * k, 0, 7 * k] : [9 * k, 0, -7 * k] }])) });
export default {
    name: 'ghast',
    title: 'Ghast',
    scale: 0.52,
    palette: { w: '#f4f4f4', g: '#d2d2d2', G: '#b4b4b4' },
    groups: Object.fromEntries(T.map(([x, z], i) => ['t' + i, { pivot: [x, 0, z] }])),
    parts: [
        { id: 'corps', size: [9, 9, 9], pos: [0, 4.5, 0], skin: { url: TETES.ghast[0].h } },
        ...T.map(([x, z, len], i) => ({ id: 't' + i, group: 't' + i, size: [1.5, len, 1.5], pos: [x, -len / 2 + 0.2, z], skin: { all: 'w', sides: ['wwwwwwww', 'wwwwgwww', 'wgwwwwww', 'wwwwwwgw', 'wwgwwwww', 'gwwwwgww', 'ggwgwwgg', 'GGGGGGGG'], bottom: 'G', seed: 'tentacule' } })),
    ],
    clips: [
        { loop: 48, keys: [sway(12, 1), sway(36, -1)] },
        cycle(['corps'], TETES.ghast),
    ],
    frames: [0, 12, 24, 36, 400, 420, 425, 429],
};
