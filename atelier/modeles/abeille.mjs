// Abeille : corps rayé trapu, grosse tête, ailes qui battent, antennes, dard.
import { clin } from './_aides.mjs';
const def = {
    name: 'abeille',
    title: 'Abeille',
    scale: 0.42,
    palette: {
        j: '#f2b62a', J: '#e09a1c', o: '#f7cf55',     // jaune, jaune sombre, jaune clair
        n: '#3a2a22', N: '#2a1d18',                    // brun-noir des rayures
        b: { c: '#ffffff', n: 0.01 }, k: { c: '#1d1513', n: 0.01 }, r: '#f08a8a',
        a: '#e8f4fb', A: '#c9e3f2', c: '#fdfdfd',      // ailes
        t: '#4a3a30',
    },
    groups: {
        aileG: { pivot: [2.5, 9, 0.5], rot: [0, 0, 28] },
        aileD: { pivot: [-2.5, 9, 0.5], rot: [0, 0, -28] },
    },
    parts: [
        {
            id: 'corps', size: [8, 7, 8], pos: [0, 5.5, -1.5],
            skin: {
                front: 'j',
                back: ['jjjjjjjj', 'jnnnnnnj', 'jjjjjjjj', 'nnnnnnnn', 'jjjjjjjj', 'JnnnnnnJ', 'JJJJJJJJ', 'JJJJJJJJ'],
                sides: ['jjnnjjnn', 'jjnnjjnn', 'jjnnjjnn', 'jjnnjjnn', 'jjnnjjnn', 'jjnnjjnn', 'JJNNJJNN', 'JJNNJJNN'],
                top: ['nnnnnnnn', 'nnnnnnnn', 'jjjjjjjj', 'jjjjjjjj', 'nnnnnnnn', 'nnnnnnnn', 'jjjjjjjj', 'jjjjjjjj'],
                bottom: ['JJJJJJJJ', 'JJJJJJJJ', 'NNNNNNNN', 'NNNNNNNN', 'JJJJJJJJ', 'JJJJJJJJ', 'NNNNNNNN', 'NNNNNNNN'],
            },
        },
        {
            id: 'tete', size: [7, 6.5, 5], pos: [0, 5.8, 4.5],
            skin: {
                all: 'j',
                front: ['oooooooo', 'ojjjjjjo', 'jkkjjkkj', 'jkbjjkbj', 'jkkjjkkj', 'jrjjjjrj', 'jjjnnjjj', 'JJJJJJJJ'],
                sides: ['oooooooo', 'jjjjjjjj', 'jjjjjjjj', 'jjjjjjjj', 'jjjjjjjj', 'jjjjjjjj', 'jjjjjjjj', 'JJJJJJJJ'],
                top: 'o', bottom: 'J',
            },
        },
        { id: 'aileG', group: 'aileG', size: [6, 0.8, 5], pos: [5.2, 9.2, 0.5], skin: { all: 'a', top: ['aaaaaaaa', 'acccccAa', 'accccAAa', 'acccAcAa', 'accAccAa', 'acAcccAa', 'aAAAAAAa', 'aaaaaaaa'], bottom: 'A' } },
        { id: 'aileD', group: 'aileD', size: [6, 0.8, 5], pos: [-5.2, 9.2, 0.5], skin: { all: 'a', top: ['aaaaaaaa', 'aAccccca', 'aAAcccca', 'aAcAccca', 'aAccAcca', 'aAcccAca', 'aAAAAAAa', 'aaaaaaaa'], bottom: 'A' } },
        { id: 'antG', size: [0.9, 3, 0.9], pos: [1.8, 10.2, 5.6], rot: [18, 0, -14], skin: { all: 'n' } },
        { id: 'antD', size: [0.9, 3, 0.9], pos: [-1.8, 10.2, 5.6], rot: [18, 0, 14], skin: { all: 'n' } },
        { id: 'dard', size: [1.6, 1.6, 2.4], pos: [0, 4.6, -6.4], skin: { all: 'N' } },
    ],
    clips: [
        { loop: 6, keys: [{ t: 3, groups: { aileG: { rot: [0, 0, -18] }, aileD: { rot: [0, 0, 18] } } }] },
    ],
    frames: [0, 1, 3, 5],
};
def.clips.push(clin(def, 'tete', { 2: 'jjjjjjjj', 3: 'jjjjjjjj' }, 83));
export default def;
