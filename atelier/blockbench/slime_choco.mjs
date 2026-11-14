// Slime en chocolat : un dessert servi sur son assiette. Nappage qui coule, chantilly en deux étages, cerise, et une
// gaufrette plantée de travers ; sur l'assiette, une petite cuillère, une fraise et un carré de chocolat.
// Au clic il s'écrase puis bondit en vrille sur l'assiette, la cerise saute.
import { slime, HAUT, SOL } from './_slime.mjs';
import { WALK, balance } from './_style.mjs';

const nappe = ['DDDDDDDD', 'DDDDDDDD', 'LDccDDcL', 'LccccDcL', 'LccccccL', 'LccccccL', 'LccccccL', 'LLLLLLLL'];
const gaufre = ['tTtT', 'TtTt', 'tTtT', 'TtTt', 'tTtT', 'TtTt', 'tTtT', 'TtTt'];

export default slime({
    name: 'slime_choco', title: 'Slime en chocolat',
    palette: { c: '#8d5b3c', L: '#a8744f', h: { c: '#d9a57a' }, D: '#5a3320', w: '#fff8ee', W: '#f1e3d0', r: '#e2364a', g: { c: '#4b9a2f' }, t: '#ecc582', T: { c: '#cc9a4e' }, a: '#fbf7f0', A: { c: '#9fc3e8' }, s: '#cfd5de', S: '#a9b1bd', y: { c: '#ffe9a8' } },
    faces: { all: nappe, north: ['DDDDDDDD', 'DDDDDDDD', 'LDccccDL', 'LckcckcL', 'LckcckcL', 'LbbccbbL', 'LccccccL', 'LLLLLLLL'], up: 'D', down: 'c' },
    socle: { all: 'a', up: ['aaaaaaaa', 'aAAAAAAa', 'aAaaaaAa', 'aAaaaaAa', 'aAaaaaAa', 'aAaaaaAa', 'aAAAAAAa', 'aaaaaaaa'] },
    plus: {
        bones: { cerise: { parent: 'dessus', pivot: [-0.2, HAUT + 2, -0.3] }, gaufrette: { parent: 'dessus', pivot: [2.1, HAUT, 0.8], rot: [0, 0, -22] }, cuillere: { parent: 'root', pivot: [-4.3, SOL, 0], rot: [0, 12, 0] } },
        cubes: [
            { name: 'chantilly', bone: 'dessus', from: [-2.3, HAUT, -2.3], to: [2.3, HAUT + 1.2, 2.3], faces: { all: 'w', up: ['wwwwwwww', 'wWwwwwWw', 'wwwwwwww', 'wwwWwwww', 'wwwwwwww', 'wWwwwwWw', 'wwwwwwww', 'wwwwwwww'] } },
            { name: 'chantilly2', bone: 'dessus', from: [-1.4, HAUT + 1.2, -1.5], to: [1.2, HAUT + 2, 1.1], faces: { all: 'w' } },
            { name: 'cerise', bone: 'cerise', from: [-0.9, HAUT + 2, -1], to: [0.5, HAUT + 3.3, 0.4], faces: { all: 'r', up: ['rrrr', 'rgrr', 'rrrr', 'rrrr'] } },
            { name: 'gaufrette', bone: 'gaufrette', bord: false, from: [1.2, HAUT - 0.4, 0.5], to: [3.2, HAUT + 4.2, 1.1], faces: { all: 't', north: gaufre, south: gaufre } },
            // Sur l'assiette : la cuillère le long du bord (à droite pour qui regarde), une fraise devant à gauche, un carré de chocolat derrière
            { name: 'manche', bone: 'cuillere', bord: false, from: [-4.6, SOL, -1], to: [-4, SOL + 0.35, 4.4], faces: { all: 's' } },
            { name: 'cuilleron', bone: 'cuillere', bord: false, from: [-4.9, SOL, -2.6], to: [-3.7, SOL + 0.5, -1], faces: { all: 's', up: ['ssss', 'sSSs', 'sSSs', 'ssss'] } },
            { name: 'fraise', bone: 'root', from: [3.3, SOL, -4.8], to: [4.7, SOL + 1.5, -3.4], faces: { all: ['gggg', 'rryr', 'ryrr', 'rrry'], up: ['rggr', 'gggg', 'gggg', 'rggr'], down: 'r' } },
            { name: 'carre', bone: 'root', from: [2.9, SOL, 3.1], to: [4.7, SOL + 0.8, 4.9], rot: [0, 18, 0], faces: { all: 'D', up: ['DDDD', 'DccD', 'DccD', 'DDDD'] } },
        ],
    },
    anim: {
        walk: balance('gaufrette', [0, 0, 5], WALK),
        interact: { cerise: { position: [[0.5, [0, 0, 0]], [0.75, [0, 3.2, 0]], [1.0, [0, 0, 0]], [1.1, [0, 0.6, 0]], [1.2, [0, 0, 0]]] } },
    },
});
