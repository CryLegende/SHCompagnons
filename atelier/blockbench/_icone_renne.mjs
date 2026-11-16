// Icône de menu du Renne : une tête de joueur dessinée exprès (le cube « tete » du modèle n'a ni le nez ni les bois,
// ils sont en relief à part). Même palette que noel_renne.mjs : visage du style, museau crème, nez rouge, bois dessinés
// sur le dessus, oreilles sur les côtés. Le fichier commence par « _ » : ce n'est pas un compagnon livré.
// node blockbench.mjs _icone_renne, puis node televerse.mjs _icone_renne --seuls ; l'empreinte va dans le menu.
import { COMMUN } from './_style.mjs';

// Oreille vue de côté (gauche du dessin = arrière pour le flanc droit)
const oreille = ['ffffffff', 'ffffffff', 'fffFFfff', 'ffFppFff', 'fffFFfff', 'ffffffff', 'ffffffff', 'ffffffff'];

export default {
    name: '_icone_renne',
    title: 'Icône du Renne',
    palette: { ...COMMUN, f: '#c08a5e', F: '#a06c46', w: '#f4e6cb', p: '#f1ad9b', a: { c: '#6e4830' }, A: { c: '#5a3a25' }, r: '#ee3b3b', R: '#ff9c8c' },
    bones: { root: { pivot: [0, 0, 0] } },
    cubes: [
        {
            name: 'tete', bone: 'root', from: [-4, 0, -4], to: [4, 8, 4],
            faces: {
                all: 'f', down: 'w', east: oreille, west: oreille.map((l) => [...l].reverse().join('')),
                north: ['ffffffff', 'fkffffkf', 'fkffffkf', 'bbwwwwbb', 'fwwRrwwf', 'fwwrrwwf', 'fwwwwwwf', 'ffwwwwff'],
                // Dessus (haut du dessin = avant) : la base des deux bois
                up: ['ffffffff', 'ffffffff', 'fAAffAAf', 'fAaffaAf', 'ffffffff', 'ffffffff', 'ffffffff', 'ffffffff'],
            },
        },
    ],
    animations: {},
};
