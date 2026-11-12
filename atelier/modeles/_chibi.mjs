// Petit personnage : grosse tête de joueur sur un corps miniature, bras articulés.
import { mirrored, mirroredGroup } from '../kit.mjs';

export function chibi({ name, title, head, palette, torso, sleeve, leg, armWidth = 2, arm = {}, extra = [], clips = [], frames, scale = 0.38 }) {
    const x = 2.6 + armWidth / 2;
    const brasG = { pivot: [x, 8.2, 0], ...arm };
    const bras = { id: 'brasG', group: 'brasG', size: [armWidth, 5, 2.2], pos: [x, 6, 0], skin: sleeve };
    const jambe = { id: 'jambeG', size: [2.5, 3.7, 2.7], pos: [1.3, 1.85, 0], skin: leg };
    return {
        name, title, scale, palette,
        groups: { brasG, brasD: mirroredGroup(brasG), tete: { pivot: [0, 8.6, 0] } },
        parts: [
            { id: 'tete', group: 'tete', size: [8, 8, 8], pos: [0, 12.6, 0], skin: head },
            { id: 'corps', size: [5.2, 5, 3.1], pos: [0, 6.1, 0], skin: torso },
            bras, mirrored(bras, 'brasD'),
            jambe, mirrored(jambe, 'jambeD'),
            ...extra,
        ],
        clips, frames,
    };
}

const bandes = (rows) => rows.map((c) => c.repeat(8));
/** Manche : haut de la couleur du vêtement, bas de la couleur de la peau. */
export const manche = (t, T, h, H) => ({ all: h, sides: bandes([t, t, t, T, h, h, h, H]), front: bandes([t, t, t, T, h, h, h, H]), back: bandes([t, t, t, T, h, h, h, H]), top: t, bottom: H, seed: 'manche' });
/** Jambe : pantalon, puis chaussure sur les deux lignes du bas. */
export const pantalon = (j, J, s) => ({ all: j, sides: bandes([j, j, j, j, J, j, s, s]), front: bandes([j, j, j, j, J, j, s, s]), back: bandes([j, j, j, j, J, j, s, s]), top: j, bottom: s, seed: 'jambe' });
