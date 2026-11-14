// Slimes : un cube de gelée dessiné (liseré clair, reflet, visage du style), posé sur un socle qui déborde et qui
// ne bouge jamais (le slime rebondit dessus : demande de Cry, 14 novembre 2026), avec une garniture sur le dessus. Pas de verre : tout est en têtes, comme les autres compagnons.
// Au repos la gelée ondule, en avançant elle rebondit, au clic elle s'écrase puis bondit en vrille.
//
// Os fournis : root (le socle et ce qui est posé dessus, immobiles), tourne (le slime : regard, vrille), corps (la
// gelée, qui s'étire : n'y mettre que des cubes droits) et dessus : un os posé sur le haut de la gelée, qui monte et descend avec elle sans s'étirer.
// Toute garniture (chapeau, couronne, gaufrette plantée) va sur « dessus », sinon elle se déforme quand la gelée s'écrase.
import { COMMUN, IDLE, WALK, mix, regarde } from './_style.mjs';

export const BAS = 0.6, SOL = 1.4, HAUT = 8.4, BORD = 4.9;

/** Valeur d'une piste à l'instant t (interpolation en ligne droite). */
function at(keys, t, rest) {
    if (!keys || !keys.length) return rest;
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [a, b] = [keys[i - 1], keys[i]], k = (t - a[0]) / (b[0] - a[0]); return a[1].map((v, n) => v + (b[1][n] - v) * k); }
    return keys[keys.length - 1][1];
}
/** Piste de l'os « dessus » : il suit le haut de la gelée (déplacement du corps + effet de son étirement en hauteur). */
function suit(corps) {
    const times = [...new Set([...(corps.scale || []), ...(corps.position || [])].map((k) => k[0]))].sort((a, b) => a - b);
    return { position: times.map((t) => { const s = at(corps.scale, t, [1, 1, 1]), p = at(corps.position, t, [0, 0, 0]); return [t, [p[0], Math.round((p[1] + (s[1] - 1) * (HAUT - SOL)) * 100) / 100, p[2]]]; }) };
}

/** Flanc de gelée : liseré clair (L), reflet (h) en haut à gauche, cœur (c). */
export const GELEE = ['LLLLLLLL', 'LhhccccL', 'LhcccccL', 'LccccccL', 'LccccccL', 'LccccccL', 'LccccccL', 'LLLLLLLL'];
/** Face avant : la même gelée avec le visage du style (yeux rapprochés, joues). */
export const FRIMOUSSE = ['LLLLLLLL', 'LhhccccL', 'LccccccL', 'LckcckcL', 'LckcckcL', 'LbbccbbL', 'LccccccL', 'LLLLLLLL'];

/**
 * palette : c (gelée), L (liseré clair), h (reflet) et les couleurs de la garniture ; socle : faces du socle qui
 * déborde sous la gelée (flaque, assiette, tas d'or) ; faces : faces de la gelée si elles changent (coulures) ;
 * plus : { bones, cubes } de la garniture ; anim : { idle, walk, interact } pistes en plus, par état.
 */
export function slime({ name, title, palette, socle, faces, plus = { bones: {}, cubes: [] }, anim = {} }) {
    const animations = {
        idle: {
            length: IDLE,
            bones: mix(regarde('tourne', IDLE, 10, 0), { corps: { scale: [[0, [1, 1, 1]], [1.5, [1.05, 0.93, 1.05]], [3, [1, 1, 1]], [4.5, [0.96, 1.05, 0.96]], [6, [1, 1, 1]]] } }),
        },
        walk: { length: WALK, bones: { corps: { scale: [[0, [1.1, 0.86, 1.1]], [0.35, [0.93, 1.13, 0.93]], [0.7, [1.1, 0.86, 1.1]]], position: [[0, [0, 0, 0]], [0.35, [0, 1.3, 0]], [0.7, [0, 0, 0]]] } } },
        interact: {
            length: 1.4, loop: false,
            bones: {
                corps: { scale: [[0, [1, 1, 1]], [0.2, [1.3, 0.55, 1.3]], [0.5, [1.3, 0.55, 1.3]], [0.7, [0.84, 1.28, 0.84]], [0.95, [1.08, 0.9, 1.08]], [1.15, [0.97, 1.04, 0.97]], [1.3, [1, 1, 1]]], position: [[0.5, [0, 0, 0]], [0.75, [0, 3.4, 0]], [0.95, [0, 0, 0]], [1.4, [0, 0, 0]]] },
                tourne: { rotation: [[0.5, [0, 0, 0]], [0.65, [0, 120, 0]], [0.8, [0, 240, 0]], [0.95, [0, 360, 0]]] },
            },
        },
    };
    for (const [state, a] of Object.entries(animations)) {
        a.bones.dessus = suit(a.bones.corps);
        if (anim[state]) a.bones = mix(a.bones, anim[state]);
    }
    return {
        name, title,
        palette: { ...COMMUN, ...palette },
        bones: { root: { pivot: [0, 0, 0] }, tourne: { parent: 'root', pivot: [0, SOL, 0] }, corps: { parent: 'tourne', pivot: [0, SOL, 0] }, dessus: { parent: 'tourne', pivot: [0, HAUT, 0] }, ...plus.bones },
        cubes: [
            { name: 'gelee', bone: 'corps', bord: false, from: [-3.6, SOL, -3.6], to: [3.6, HAUT, 3.6], faces: faces || { all: GELEE, north: FRIMOUSSE, up: GELEE, down: 'c' } },
            { name: 'socle', bone: 'root', bord: false, from: [-BORD, BAS, -BORD], to: [BORD, SOL, BORD], faces: socle },
            ...plus.cubes,
        ],
        animations,
    };
}
