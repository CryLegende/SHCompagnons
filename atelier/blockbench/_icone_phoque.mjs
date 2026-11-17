// Icône de menu de Phoquette : une tête de joueur dessinée exprès (le museau et le bonnet du modèle sont à part).
// Même palette que noel_phoque.mjs : visage du style, museau à moustaches, bord de bonnet blanc et bonnet rouge en haut.
// node blockbench.mjs _icone_phoque, puis node televerse.mjs _icone_phoque --seuls ; l'empreinte va dans le menu.
import { COMMUN } from './_style.mjs';

const cote = ['rrrrrrrr', 'WWWWWWWW', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'];

export default {
    name: '_icone_phoque',
    title: 'Icône de Phoquette',
    palette: { ...COMMUN, w: '#eceff2', W: '#fdfdfd', g: '#b6c1cb', n: { c: '#2a1d18' }, r: '#d8283a', R: '#a81c2c' },
    bones: { root: { pivot: [0, 0, 0] } },
    cubes: [
        {
            name: 'tete', bone: 'root', from: [-4, 0, -4], to: [4, 8, 4],
            faces: {
                all: cote, down: 'w',
                north: ['rrrrrrrr', 'WWWWWWWW', 'wkwwwwkw', 'wkwwwwkw', 'bbwwwwbb', 'wwwnnwww', 'wgwwwwgw', 'wwwwwwww'],
                up: ['rrrrrrrr', 'rrRrrRrr', 'rrrWWrrr', 'rrWWWWrr', 'rrWWWWrr', 'rrrWWrrr', 'rrRrrRrr', 'rrrrrrrr'],
            },
        },
    ],
    animations: {},
};
