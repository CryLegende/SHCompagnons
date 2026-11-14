// Slimes : un cœur opaque au visage du style, dans une coque de verre teinté (bloc du jeu, translucide).
// Au repos la gelée ondule, en avançant elle rebondit, au clic elle s'écrase puis rebondit haut.
//
// Os fournis : corps (la coque, qui s'étire : n'y mettre que des cubes droits), coeur, et dessus : un os posé sur le
// haut de la coque, qui monte et descend avec elle sans s'étirer. Tout accessoire penché (couronne, épée plantée,
// gaufrette) va sur « dessus », sinon il se déforme en biais quand la gelée s'écrase.
import { COMMUN, IDLE, WALK, visage, mix, regarde } from './_style.mjs';

const BAS = 1, HAUT = 8.6;

/** Valeur d'une piste à l'instant t (interpolation en ligne droite). */
function at(keys, t, rest) {
    if (!keys || !keys.length) return rest;
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [a, b] = [keys[i - 1], keys[i]], k = (t - a[0]) / (b[0] - a[0]); return a[1].map((v, n) => v + (b[1][n] - v) * k); }
    return keys[keys.length - 1][1];
}
/** Piste de l'os « dessus » : il suit le haut de la coque (déplacement du corps + effet de son étirement en hauteur). */
function suit(corps) {
    const times = [...new Set([...(corps.scale || []), ...(corps.position || [])].map((k) => k[0]))].sort((a, b) => a - b);
    return { position: times.map((t) => { const s = at(corps.scale, t, [1, 1, 1]), p = at(corps.position, t, [0, 0, 0]); return [t, [p[0], Math.round((p[1] + (s[1] - 1) * (HAUT - BAS)) * 100) / 100, p[2]]]; }) };
}

/**
 * verre : bloc de la coque ; tete : les six faces du cœur (le vrai visage du slime, voir _officiel.mjs) ; coeur, teinte :
 * couleurs du cœur (s'il n'a pas de tete) et de la coque dans Blockbench ; plus : { bones, cubes }.
 */
export function slime({ name, title, verre, tete, coeur = '#7fd45a', teinte, plus = { bones: {}, cubes: [] }, palette = {} }) {
    const animations = {
        idle: {
            length: IDLE,
            bones: mix(regarde('coeur', IDLE, 12, 0), {
                corps: { scale: [[0, [1, 1, 1]], [1.5, [1.05, 0.93, 1.05]], [3, [1, 1, 1]], [4.5, [0.96, 1.05, 0.96]], [6, [1, 1, 1]]] },
                coeur: { position: [[0, [0, 0, 0]], [1.5, [0, -0.3, 0]], [3, [0, 0, 0]], [4.5, [0, 0.4, 0]], [6, [0, 0, 0]]] },
            }),
        },
        walk: { length: WALK, bones: { corps: { scale: [[0, [1.1, 0.86, 1.1]], [0.35, [0.93, 1.13, 0.93]], [0.7, [1.1, 0.86, 1.1]]], position: [[0, [0, 0, 0]], [0.35, [0, 1.3, 0]], [0.7, [0, 0, 0]]] } } },
        interact: {
            length: 1.4, loop: false,
            bones: {
                corps: { scale: [[0, [1, 1, 1]], [0.2, [1.35, 0.5, 1.35]], [0.5, [1.35, 0.5, 1.35]], [0.7, [0.82, 1.3, 0.82]], [0.95, [1.08, 0.9, 1.08]], [1.15, [0.97, 1.04, 0.97]], [1.3, [1, 1, 1]]], position: [[0.5, [0, 0, 0]], [0.75, [0, 3, 0]], [0.95, [0, 0, 0]], [1.4, [0, 0, 0]]] },
                coeur: { rotation: [[0.5, [0, 0, 0]], [0.7, [0, 180, 0]], [0.95, [0, 360, 0]]] },
            },
        },
    };
    for (const a of Object.values(animations)) a.bones.dessus = suit(a.bones.corps);
    return {
        name, title,
        palette: { ...COMMUN, c: coeur, v: teinte, ...palette },
        bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, BAS, 0] }, coeur: { parent: 'corps', pivot: [0, 4.8, 0] }, dessus: { parent: 'root', pivot: [0, HAUT, 0] }, ...plus.bones },
        cubes: [
            { name: 'coeur', bone: 'coeur', from: [-2.7, 2.1, -2.7], to: [2.7, 7.5, 2.7], faces: tete || { all: 'c', north: visage('c', { ligne: 2 }) } },
            { name: 'coque', bone: 'corps', block: verre, bord: false, from: [-3.8, BAS, -3.8], to: [3.8, HAUT, 3.8], faces: { all: 'v' } },
            ...plus.cubes,
        ],
        animations,
    };
}
