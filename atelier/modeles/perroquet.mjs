// Perroquet : ara rouge qui danse, tête qui balance et ailes qui s'ouvrent.
import { mirrored, mirroredGroup } from '../kit.mjs';

const aileG = { pivot: [2.6, 8.2, -0.2], rot: [0, 0, 6] };
const aile = {
    id: 'aileG', group: 'aileG', size: [1.2, 5.8, 4.2], pos: [3.1, 5.5, -0.4],
    skin: { all: 'r', sides: ['rrrrrrrr', 'rrrrrrrr', 'rRrrrRrr', 'yyyyyyyy', 'yyYyyyYy', 'bbbbbbbb', 'bBbbbBbb', 'BBBBBBBB'], front: ['rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr', 'yyyyyyyy', 'yyyyyyyy', 'bbbbbbbb', 'bbbbbbbb', 'BBBBBBBB'], back: ['rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr', 'yyyyyyyy', 'yyyyyyyy', 'bbbbbbbb', 'bbbbbbbb', 'BBBBBBBB'], bottom: 'B' },
};
const patte = { id: 'patteG', size: [1.3, 1.6, 2], pos: [1.2, 0.8, 0.6], skin: { all: 'g' } };
const danse = (t, k) => ({ t, groups: { tete: { rot: [0, 0, 13 * k] }, aileG: { rot: [0, 0, k > 0 ? 44 : 14] }, aileD: { rot: [0, 0, k > 0 ? -14 : -44] } } });
export default {
    name: 'perroquet',
    title: 'Perroquet',
    scale: 0.52,
    palette: { r: '#d92b2e', R: '#b01f25', y: '#f3c531', Y: '#d9a41f', b: '#2f66cc', B: '#234e9e', w: '#f4d9cb', k: { c: '#1b1414', n: 0.01 }, e: { c: '#ffffff', n: 0 }, n: '#3d3938', N: '#262323', m: '#5a5553', g: '#77716c' },
    groups: { aileG, aileD: mirroredGroup(aileG), tete: { pivot: [0, 8.2, 0.4] } },
    parts: [
        { id: 'corps', size: [5, 6.6, 5], pos: [0, 4.9, 0], skin: { all: 'r', front: ['rrrrrrrr', 'rrrrrrrr', 'rrRrrRrr', 'rrrrrrrr', 'rRrrrrRr', 'rrrrrrrr', 'rrrRRrrr', 'RRRRRRRR'], bottom: 'R' } },
        {
            id: 'tete', group: 'tete', size: [5.8, 5.2, 5.6], pos: [0, 10.6, 0.5],
            skin: { all: 'r', front: ['rrrrrrrr', 'wwrrrrww', 'kwrrrrwk', 'wwrrrrww', 'rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr', 'RRRRRRRR'], sides: ['rrrrrrrr', 'wwwrrrrr', 'kwwrrrrr', 'wwwrrrrr', 'rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr', 'RRRRRRRR'], bottom: 'R' },
        },
        { id: 'bec', group: 'tete', size: [1.9, 2.5, 2], pos: [0, 9.5, 3.9], skin: { all: 'n', front: ['mmmmmmmm', 'mmmmmmmm', 'nnnnnnnn', 'nnnnnnnn', 'NnnnnnnN', 'NNnnnnNN', 'NNNnnNNN', 'NNNNNNNN'], top: 'm', bottom: 'N' } },
        aile, mirrored(aile, 'aileD'),
        { id: 'queue', size: [2.8, 1.1, 6.4], pos: [0, 1.9, -4.4], rot: [32, 0, 0], skin: { all: 'r', top: ['bbbbbbbb', 'bbbbbbbb', 'bbbbbbbb', 'bbbbbbbb', 'rbrbrbrb', 'rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr'], back: 'b', bottom: 'B' } },
        patte, mirrored(patte, 'patteD'),
    ],
    clips: [
        { loop: 100, keys: [danse(8, 1), danse(22, -1), danse(36, 1), danse(50, -1), { t: 60 }] },
    ],
    frames: [0, 8, 22, 36, 50],
};
