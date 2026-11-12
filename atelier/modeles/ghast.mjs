// Ghast : le cube de départ (avec ses textures de tir) et six tentacules qui ondulent.
import { cycle } from './_aides.mjs';
import { PALETTE, groupes, ondulation, tentacules } from './_ghast.mjs';
import { TETES } from './_tetes.mjs';

export default {
    name: 'ghast',
    title: 'Ghast',
    scale: 0.5,
    palette: { ...PALETTE },
    groups: groupes,
    parts: [
        { id: 'corps', size: [9, 9, 9], pos: [0, 4.5, 0], skin: { url: TETES.ghast[0].h } },
        ...tentacules,
    ],
    clips: [
        ondulation,
        cycle(['corps'], TETES.ghast),
    ],
    frames: [0, 20, 36, 52, 400, 420, 425, 429],
};
