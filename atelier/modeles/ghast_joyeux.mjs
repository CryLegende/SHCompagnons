// Happy Ghast : cube souriant, harnais et lunettes relevées sur le front, petits tentacules.
const T = [[-2.6, -2.4, 2.6], [0.2, -2.8, 3.2], [2.7, -2.2, 2.4], [-2.2, 2.3, 3], [0.6, 2.6, 2.4], [2.9, 2.2, 2.8]];
const sway = (t, k) => ({ t, groups: Object.fromEntries(T.map((_, i) => ['t' + i, { rot: i % 2 ? [-12 * k, 0, 10 * k] : [12 * k, 0, -10 * k] }])) });
const face = (eyes) => ({
    all: 'w',
    front: ['wwwwwwww', 'wwwwwwww', 'wqwwwwqw', eyes, 'pwwwwwwp', 'qpmwwmpq', 'wqwkkwqw', 'wwwwwwww'],
    sides: ['wwwwwwww', 'wwwgwwww', 'wwwwwwgw', 'wgwwwwww', 'wwwwgwww', 'wwwwwwww', 'wwgwwwgw', 'gwwwwwww'],
    back: ['wwwwwwww', 'wwwwgwww', 'wgwwwwww', 'wwwwwwgw', 'wwwgwwww', 'wwwwwwww', 'gwwwwgww', 'wwwwwwwg'],
    top: ['wwwwwwww', 'wwgwwwww', 'wwwwwgww', 'wwwwwwww', 'wgwwwwww', 'wwwwgwww', 'wwwwwwww', 'wwwwwwww'],
    bottom: 'g',
});
export default {
    name: 'ghast_joyeux',
    title: 'Happy Ghast',
    scale: 0.5,
    palette: {
        w: '#f6f6f6', g: '#dcdcdc', G: '#bdbdbd', k: { c: '#5c5c62', n: 0.02 }, m: { c: '#9a9aa0', n: 0.02 }, p: '#f3d3d6', q: '#e6dcdc',
        b: '#7a4b2a', B: '#5f3a20', c: '#3aa7d8', C: '#2b86b3', v: { c: '#bfe9f7', n: 0.02 }, V: { c: '#e9f8fd', n: 0 }, o: '#c9a13a',
    },
    groups: Object.fromEntries(T.map(([x, z], i) => ['t' + i, { pivot: [x, 0, z] }])),
    parts: [
        { id: 'corps', size: [9, 9, 9], pos: [0, 4.5, 0], skin: face('wkkwwkkw') },
        { id: 'sangle', size: [9.6, 1.2, 9.6], pos: [0, 8.5, 0], skin: { all: 'b', sides: ['bbbbbbbb', 'bbbbbbbb', 'bbbbbbbb', 'BBBBBBBB', 'bbbbbbbb', 'bbbbbbbb', 'BBBBBBBB', 'BBBBBBBB'], front: ['bbbbbbbb', 'bbboobbb', 'bbboobbb', 'BBBooBBB', 'bbboobbb', 'bbbbbbbb', 'BBBBBBBB', 'BBBBBBBB'], top: 'b', bottom: 'B' } },
        { id: 'selle', size: [6, 1.2, 5], pos: [0, 9.5, -1], skin: { all: 'c', top: ['CCCCCCCC', 'CccccccC', 'CccccccC', 'CccccccC', 'CccccccC', 'CccccccC', 'CccccccC', 'CCCCCCCC'], bottom: 'C' } },
        { id: 'lunettes', size: [5.6, 1.9, 1.1], pos: [0, 9.3, 3.6], rot: [-28, 0, 0], skin: { all: 'b', front: ['bbbbbbbb', 'bVvbbVvb', 'bvvbbvvb', 'bvvbbvvb', 'bvvbbvvb', 'bvvbbvvb', 'bvvbbvvb', 'bbbbbbbb'], bottom: 'B' } },
        ...T.map(([x, z, len], i) => ({ id: 't' + i, group: 't' + i, size: [1.7, len, 1.7], pos: [x, -len / 2 + 0.2, z], skin: { all: 'w', sides: ['wwwwwwww', 'wwwwgwww', 'wgwwwwww', 'wwwwwwgw', 'wwgwwwww', 'gwwwwgww', 'ggwgwwgg', 'GGGGGGGG'], bottom: 'G', seed: 'tentacule' } })),
    ],
    clips: [
        { loop: 40, keys: [sway(10, 1), sway(30, -1)] },
        { loop: 90, keys: [{ t: 84, parts: { corps: { skin: face('wmmwwmmw') } } }] },
    ],
    frames: [0, 10, 20, 30, 84],
};
