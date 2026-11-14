// Happy Ghast : grand sourire, lunettes d'aviateur sur le front, harnais brun et coussin bleu sur le dos.
import { ghast } from './_ghast.mjs';

export default ghast({
    name: 'ghast_joyeux', title: 'Happy Ghast',
    palette: { B: '#8a5a3a', c: '#7fd4e8', C: '#56b3cc', e: { c: '#f4fdff' } },
    face: ['wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wkwwwwkw', 'wkwwwwkw', 'bbwwwwbb', 'wwGwwGww', 'wwwGGwww'],
    plus: {
        bones: {},
        cubes: [
            { name: 'sangle', bone: 'corps', bord: false, from: [-4.2, 10.2, -4.2], to: [4.2, 11.1, 4.2], faces: { all: 'B' } },
            { name: 'selle', bone: 'corps', from: [-3, 12.6, -3], to: [3, 13.5, 3], faces: { all: 'B', up: ['BBBBBBBB', 'BccccccB', 'BccccccB', 'BccccccB', 'BccccccB', 'BccccccB', 'BccccccB', 'BBBBBBBB'] } },
            { name: 'lunettes', bone: 'corps', bord: false, from: [-2.7, 11.1, -4.8], to: [2.7, 12.6, -4], faces: { all: 'B', north: ['BBBBBBBB', 'BecBBecB', 'BccBBccB', 'BBBBBBBB'] } },
        ],
    },
});
