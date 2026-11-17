// Icône de menu de Braise : une tête de joueur dessinée exprès (le museau du modèle est en relief à part). Même palette
// que panda_roux.mjs : visage du style, masque crème, truffe noire, oreilles à pointe brune sur le dessus.
// node blockbench.mjs _icone_braise, puis node televerse.mjs _icone_braise --seuls ; l'empreinte va dans le menu.
import { COMMUN } from './_style.mjs';

const joue = ['ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'fffffwww', 'ffffwwww', 'fffwwwww', 'ffwwwwww'];

export default {
    name: '_icone_braise',
    title: 'Icône de Braise',
    palette: { ...COMMUN, f: '#e8742c', F: '#c45a1e', w: '#f3e6d0', d: { c: '#4a2a1e' }, n: { c: '#22140e' } },
    bones: { root: { pivot: [0, 0, 0] } },
    cubes: [
        {
            name: 'tete', bone: 'root', from: [-4, 0, -4], to: [4, 8, 4],
            faces: {
                all: 'f', down: 'w', east: joue, west: joue.map((l) => [...l].reverse().join('')),
                north: ['dffffffd', 'ffffffff', 'fkffffkf', 'fkffffkf', 'bbwwwwbb', 'wwwnnwww', 'wwwwwwww', 'wwwwwwww'],
                // Dessus (haut du dessin = avant) : les deux oreilles, pointes brunes
                up: ['ffffffff', 'dddffddd', 'dwdffdwd', 'ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'ffffffff'],
            },
        },
    ],
    animations: {},
};
