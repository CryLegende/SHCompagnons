// Compagnons gardés tels qu'ils étaient (Steve, Alex, le zombie, R2-D2, le golem de cuivre) : leurs pièces viennent
// de l'ancien modèle, reprises par garde.mjs (blockbench/garde/<nom>.json, mêmes têtes, même géométrie) ; la
// description ne fait que les ranger dans des os et écrire les états idle, walk et interact.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** Pièces d'un modèle gardé, dans l'ordre de l'ancien fichier : rangement[i] = [nom du cube, os]. */
export function garde(nom, rangement) {
    const parts = JSON.parse(readFileSync(join(HERE, 'garde', nom + '.json'), 'utf8'));
    if (parts.length !== rangement.length) throw new Error(nom + ' : ' + parts.length + ' pièces, ' + rangement.length + ' rangées');
    return parts.map((p, i) => {
        const [name, bone] = rangement[i], kind = p.name.split('#')[0];
        const cube = { name, bone, from: p.from, to: p.to, pivot: p.pivot, faces: p.faces };
        if (p.rot) cube.rot = p.rot;
        if (kind.startsWith('objet:')) cube.item = kind.slice(6);
        if (kind.startsWith('bloc:')) cube.block = kind.slice(5);
        return cube;
    });
}

/** Os d'un petit personnage gardé (Steve, Alex, le zombie) : tête, buste, deux bras, deux jambes. */
export const OS_PERSO = {
    root: { pivot: [0, 0, 0] },
    corps: { parent: 'root', pivot: [0, 3.7, 0] },
    buste: { parent: 'corps', pivot: [0, 3.6, 0] },
    tete: { parent: 'corps', pivot: [0, 8.6, 0] },
    brasD: { parent: 'corps', pivot: [3.6, 8.2, -0.3] },
    brasG: { parent: 'corps', pivot: [-3.6, 8.2, -0.3] },
    jambeD: { parent: 'root', pivot: [1.3, 3.6, 0] },
    jambeG: { parent: 'root', pivot: [-1.3, 3.6, 0] },
};
/** Rangement des six pièces d'un petit personnage dans l'ordre de l'ancien fichier. */
export const PIECES_PERSO = [['tete', 'tete'], ['buste', 'buste'], ['brasG', 'brasG'], ['brasD', 'brasD'], ['jambeG', 'jambeG'], ['jambeD', 'jambeD']];
