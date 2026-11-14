// Happy Ghast : celui du jeu. Son sourire (le visage du compagnon d'origine), lunettes relevées sur le front,
// harnais brun et coussin bleu sur le dos.
import { ghast } from './_ghast.mjs';

export default ghast({
    name: 'ghast_joyeux', title: 'Happy Ghast',
    palette: { B: '#8a5a3a', c: '#7fd4e8', C: '#56b3cc', e: { c: '#f4fdff' }, k: { c: '#5c5c62' }, m: { c: '#9a9aa0' }, p: '#f3d3d6', q: '#e6dcdc' },
    face: ['wwwwwwww', 'wwwwwwww', 'wqwwwwqw', 'wkkwwkkw', 'pwwwwwwp', 'qpmwwmpq', 'wqwkkwqw', 'wwwwwwww'],
    plus: {
        bones: {},
        cubes: [
            { name: 'sangle', bone: 'corps', bord: false, from: [-4.2, 10.2, -4.2], to: [4.2, 11.1, 4.2], faces: { all: 'B' } },
            { name: 'selle', bone: 'corps', from: [-3, 12.6, -3], to: [3, 13.5, 3], faces: { all: 'B', up: ['BBBBBBBB', 'BccccccB', 'BccccccB', 'BccccccB', 'BccccccB', 'BccccccB', 'BccccccB', 'BBBBBBBB'] } },
            { name: 'lunettes', bone: 'corps', bord: false, from: [-2.7, 11.1, -4.8], to: [2.7, 12.6, -4], faces: { all: 'B', north: ['BBBBBBBB', 'BecBBecB', 'BccBBccB', 'BBBBBBBB'] } },
        ],
    },
});
