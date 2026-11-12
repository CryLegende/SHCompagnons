// Lapin : assis en boule, grandes oreilles dont une se replie par moments, queue en pompon.
import { clin } from './_aides.mjs';
import { mirrored, mirroredGroup } from '../kit.mjs';

const oreilleG = { pivot: [1.7, 8.9, 1.9], rot: [-10, 0, -9] };
const oreille = {
    id: 'oreilleG', group: 'oreilleG', size: [1.9, 5.2, 1.1], pos: [1.7, 11.3, 1.9],
    skin: { all: 'f', front: ['ffffffff', 'ffppppff', 'fppppppf', 'fppppppf', 'fppppppf', 'fppppppf', 'ffppppff', 'ffffffff'], top: 'F' },
};
const patte = { id: 'patteG', size: [1.9, 1.7, 2.6], pos: [1.7, 0.85, 3.1], skin: { all: 'f', front: ['ffffffff', 'ffffffff', 'cccccccc', 'cccccccc', 'cccccccc', 'cccccccc', 'cccccccc', 'cccccccc'], top: ['ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'cccccccc', 'cccccccc', 'cccccccc'], bottom: 'F' } };
const pied = { id: 'piedG', size: [2.1, 1.8, 3.6], pos: [2.9, 0.9, -0.4], skin: { all: 'f', front: 'c', bottom: 'F' } };
const def = {
    name: 'lapin',
    title: 'Lapin',
    scale: 0.5,
    palette: { f: '#a4897a', F: '#8a7163', c: '#eadfd2', p: '#eaa6a8', n: '#d9838a', w: '#f6f1ea', k: { c: '#231a17', n: 0.01 }, b: { c: '#ffffff', n: 0 } },
    groups: { oreilleG, oreilleD: mirroredGroup(oreilleG) },
    parts: [
        { id: 'corps', size: [6.2, 5.6, 7], pos: [0, 2.8, -1.2], skin: { all: 'f', front: ['ffffffff', 'ffccccff', 'fccccccf', 'fccccccf', 'fccccccf', 'fccccccf', 'ffccccff', 'FFFFFFFF'], bottom: 'F' } },
        {
            id: 'tete', size: [6.6, 5.8, 5.6], pos: [0, 6.6, 2.4],
            skin: {
                all: 'f',
                front: ['ffffffff', 'ffffffff', 'fkbffkbf', 'fkkffkkf', 'ffccccff', 'fccnnccf', 'fccccccf', 'ffccccff'],
                sides: ['ffffffff', 'ffffffff', 'ffffffff', 'ffffffff', 'cfffffff', 'ccffffff', 'ccffffff', 'cfffffff'],
                bottom: 'c',
            },
        },
        oreille, mirrored(oreille, 'oreilleD'),
        { id: 'queue', size: [2.4, 2.4, 2.2], pos: [0, 3, -5.4], skin: { all: 'w' } },
        patte, mirrored(patte, 'patteD'),
        pied, mirrored(pied, 'piedD'),
    ],
    clips: [
        { loop: 80, keys: [{ t: 60 }, { t: 63, groups: { oreilleD: { rot: [-10, 0, 62] } } }, { t: 67 }, { t: 70, groups: { oreilleD: { rot: [-10, 0, 62] } } }, { t: 74 }] },
    ],
    frames: [0, 60, 63, 65, 67, 70],
};
def.clips.push(clin(def, 'tete', { 2: 'ffffffff' }, 97));
export default def;
