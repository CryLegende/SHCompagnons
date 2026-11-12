// Ananas : fruit ventru à écailles en losanges, couronne de feuilles qui ondulent.
// Écailles : lignes brunes en diagonale toutes les 4 cases, un point sombre au cœur de chaque losange
const ecailles = (etire) => Array.from({ length: 8 }, (_, row) => Array.from({ length: 8 }, (_, x) => {
    // tranche basse du fruit : une ligne de dessin couvre trois lignes de texture, la face y est étirée d'autant
    const y = etire ? Math.floor(row / 3) + 1 : row;
    if ((x + y) % 4 === 0 || (x - y + 8) % 4 === 0) return 'o';
    if ((x + y) % 4 === 2 && (x - y + 8) % 4 === 2) return 'b';
    return (x + 2 * y) % 5 === 0 ? 'l' : 'y';
}).join(''));
const fruit = (etire) => ({ all: 'y', front: ecailles(etire), back: ecailles(etire), sides: ecailles(etire), top: 'o', bottom: 'O' });
const feuille = { all: 'g', front: ['vvGggvvv', 'vgGggvvg', 'ggGggggg', 'ggGggggg', 'ggGggggg', 'gGGggggG', 'GGGgggGG', 'GGGGGGGG'], back: ['vvvggGvv', 'gvvggGgv', 'gggggGgg', 'gggggGgg', 'gggggGgg', 'GggggGGg', 'GGgggGGG', 'GGGGGGGG'], sides: 'G', top: 'v', bottom: 'G', seed: 'feuille' };
// Couronne : cinq feuilles penchées vers l'extérieur, trois plus droites au milieu (inclinaison, direction, longueur)
const FEUILLES = [[40, 0, 4.8], [40, 72, 4.4], [40, 144, 4.8], [40, 216, 4.4], [40, 288, 4.8], [16, 36, 5.6], [16, 156, 5.2], [16, 276, 5.6]];
const onduler = (t, k) => ({ t, groups: Object.fromEntries(FEUILLES.map(([tilt, yaw], i) => ['f' + i, { rot: [tilt + (i % 2 ? -k : k) * (tilt > 20 ? 9 : 6), yaw, 0] }])) });
export default {
    name: 'ananas',
    title: 'Ananas',
    scale: 0.48,
    palette: { y: '#e9b93c', l: '#f5d564', o: '#d9982c', O: '#b97a22', b: '#a8701f', g: '#3f9040', G: '#2d6e30', v: '#63b550' },
    noise: 0.06,
    groups: Object.fromEntries(FEUILLES.map(([tilt, yaw], i) => ['f' + i, { pivot: [0, 9.2, 0], rot: [tilt, yaw, 0] }])),
    parts: [
        { id: 'bas', size: [5.4, 2.4, 5.4], pos: [0, 1.2, 0], skin: { ...fruit(true), seed: 'bas' } },
        { id: 'milieu', size: [6.8, 5, 6.8], pos: [0, 4.9, 0], skin: fruit(false) },
        { id: 'haut', size: [5.4, 2, 5.4], pos: [0, 8.4, 0], skin: { ...fruit(true), top: 'G', seed: 'haut' } },
        ...FEUILLES.map(([tilt, , length], i) => ({ id: 'f' + i, group: 'f' + i, size: [tilt > 20 ? 1.9 : 1.6, length, 0.5], pos: [0, 9.2 + length / 2 - 0.2, tilt > 20 ? 0.9 : 0.3], skin: feuille })),
    ],
    clips: [
        { loop: 56, keys: [onduler(14, 1), onduler(42, -1)] },
    ],
    frames: [0, 14, 28, 42],
};
