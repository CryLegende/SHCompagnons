// Tentacules communs au Ghast et au Happy Ghast : six, de longueurs inégales, qui ondulent puis se reposent.
// Les couleurs x, y, z sont à déclarer dans la palette du modèle avec PALETTE (même texture pour les deux).
export const PALETTE = { x: '#f4f4f4', y: '#d6d6d6', z: '#b8b8b8' };
const T = [[-2.6, -2.4, 4.6], [0.2, -2.8, 5.6], [2.7, -2.2, 4], [-2.2, 2.3, 5.2], [0.6, 2.6, 4.2], [2.9, 2.2, 5]];
const peau = { all: 'x', sides: ['xxxxxxxx', 'xxxxyxxx', 'xyxxxxxx', 'xxxxxxyx', 'xxyxxxxx', 'yxxxxyxx', 'yyxyxxyy', 'zzzzzzzz'], bottom: 'z', seed: 'tentacule' };
export const groupes = Object.fromEntries(T.map(([x, z], i) => ['t' + i, { pivot: [x, 0, z] }]));
export const tentacules = T.map(([x, z, len], i) => ({ id: 't' + i, group: 't' + i, size: [1.6, len, 1.6], pos: [x, -len / 2 + 0.2, z], skin: peau }));
const sway = (t, k) => ({ t, groups: Object.fromEntries(T.map((_, i) => ['t' + i, { rot: i % 2 ? [-10 * k, 0, 8 * k] : [10 * k, 0, -8 * k] }])) });
export const ondulation = { loop: 110, keys: [sway(20, 1), sway(52, -1), { t: 72 }] };
