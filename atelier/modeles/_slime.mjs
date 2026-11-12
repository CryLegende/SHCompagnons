// Slimes : un cœur (la tête du compagnon de départ, avec son visage) dans une gelée translucide, comme le slime du
// jeu. Le saut est dans le modèle (élan, étirement, écrasement au sol) : animation NONE dans config.yml.
import { cycle } from './_aides.mjs';

export function slime(name, title, skins, glass) {
    const hop = (t, stretch, y) => ({ t, groups: { tout: { stretch, move: [0, y, 0] } } });
    return {
        name, title, scale: 0.6,
        groups: { tout: { pivot: [0, 0, 0] } },
        parts: [
            { id: 'coeur', group: 'tout', size: [5.6, 5.6, 5.6], pos: [0, 3.6, 0], skin: { url: skins[0].h } },
            { id: 'gelee', group: 'tout', block: glass, size: [8, 8, 8], pos: [0, 4, 0] },
        ],
        clips: [
            { loop: 34, keys: [hop(4, [1.15, 0.75, 1.15], 0), hop(10, [0.92, 1.12, 0.92], 9), hop(16, [0.92, 1.12, 0.92], 0.8), hop(19, [1.2, 0.7, 1.2], 0), hop(23, [1, 1, 1], 0)] },
            ...(skins.length > 1 ? [cycle(['coeur'], skins)] : []),
        ],
        frames: [0, 4, 7, 10, 13, 16, 19, 23],
    };
}
