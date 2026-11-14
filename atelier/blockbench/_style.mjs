// Style SkyHand des compagnons : ce que tous les modèles partagent (couleurs communes, visage, animations types).
// Le guide complet est dans STYLE.md ; l'ombrage (ligne claire en haut, sombre en bas, grain) est fait par bbkit.mjs.
//
// Noms d'os attendus par les animations types : root, corps (tout sauf les pattes), ventre (le cube du corps seul,
// pour la respiration), tete, patteAvD / patteAvG / patteArD / patteArG, ou jambeD / jambeG et brasD / brasG,
// aileD / aileG, oreilleD / oreilleG, queue.

/** Couleurs communes à tous les compagnons : œil (jamais noir pur), joue rose. À étaler dans la palette du modèle. */
export const COMMUN = { k: { c: '#2b1b12' }, b: '#ef9c88' };

/** Durées types (secondes) : repos (deux respirations, un regard de chaque côté), pas. */
export const IDLE = 6, WALK = 0.7;
export const QUATRE = ['patteAvD', 'patteArG', 'patteAvG', 'patteArD'];
export const DEUX = ['jambeD', 'jambeG'];

/**
 * Visage sur un fond uni : deux yeux de 1 pixel de large sur 2 de haut, bien écartés, une joue rose de 2 pixels sous
 * chacun, côté extérieur. ligne : ligne du haut des yeux (0 à 5) ; yeux : colonnes ; lignes : { n: 'xxxxxxxx' }
 * remplace des lignes (bouche, museau dessiné à plat).
 */
export function visage(fond, { ligne = 1, yeux = [1, 6], joues = true, oeil = 'k', joue = 'b', lignes = {} } = {}) {
    const rows = Array.from({ length: 8 }, () => Array(8).fill(fond));
    for (const x of yeux) { rows[ligne][x] = oeil; rows[ligne + 1][x] = oeil; }
    if (joues) for (const x of yeux) { const out = x < 4 ? x - 1 : x + 1; for (const c of [x, out]) if (c >= 0 && c < 8) rows[ligne + 2][c] = joue; }
    const out = rows.map((r) => r.join(''));
    for (const [n, line] of Object.entries(lignes)) out[n] = line;
    return out;
}

/** Visage plat des références : yeux rapprochés (colonnes 2 et 5), au milieu de la face. Pour un objet, un oiseau, une créature sans museau. */
export const frimousse = (fond, options = {}) => visage(fond, { ligne: 3, yeux: [2, 5], ...options });

const round = (t) => Math.round(t * 20) / 20;
/** Réunit des animations d'os ({ os: { rotation, position, scale } }) en une seule. */
export function mix(...parts) {
    const out = {};
    for (const part of parts) for (const [os, channels] of Object.entries(part || {})) {
        out[os] = out[os] || {};
        for (const [channel, keys] of Object.entries(channels)) out[os][channel] = [...(out[os][channel] || []), ...keys].sort((a, b) => a[0] - b[0]);
    }
    return out;
}
/**
 * Va-et-vient d'un os entre +v et -v, en ligne droite (deux images clés par aller-retour : le moins cher).
 * tours : allers-retours sur la durée ; phase 1 : à l'opposé ; canal : rotation (degrés) ou position (pixels).
 */
export function balance(os, v, duree, { tours = 1, phase = 0, canal = 'rotation' } = {}) {
    const keys = [], sign = phase ? -1 : 1, step = duree / tours / 2;
    for (let i = 0; i <= tours * 2; i++) keys.push([round(i * step), v.map((x) => x * (i % 2 ? -sign : sign))]);
    return { [os]: { [canal]: keys } };
}
/** Pose tenue pendant tout l'état (corps penché en avant quand le compagnon avance) : ne coûte rien une fois prise. */
export const tient = (os, v, canal = 'rotation') => ({ [os]: { [canal]: [[0, v]] } });
/** Respiration : le cube du corps gonfle un peu, « tours » fois sur la durée. */
export function respire(os = 'ventre', duree = IDLE, tours = 2, k = 0.045) {
    const keys = [], step = duree / tours / 2;
    for (let i = 0; i <= tours * 2; i++) keys.push([round(i * step), i % 2 ? [1 + k / 2, 1 + k, 1] : [1, 1, 1]]);
    return { [os]: { scale: keys } };
}
/** Regard : la tête tourne d'un côté, y reste, revient, puis de l'autre. */
export function regarde(os = 'tete', duree = IDLE, angle = 9, penche = 2) {
    const u = duree / 6;
    return { [os]: { rotation: [[0, [0, 0, 0]], [round(0.5 * u), [0, angle, penche]], [round(2 * u), [0, angle, penche]], [round(2.5 * u), [0, 0, 0]], [round(3.5 * u), [0, -angle, -penche]], [round(5 * u), [0, -angle, -penche]], [round(5.5 * u), [0, 0, 0]]] } };
}
/** Tic : un os frémit deux fois (oreille, queue, antenne), à partir de « debut ». */
export function tic(os, v, debut) {
    const z = [0, 0, 0];
    return { [os]: { rotation: [[round(debut), z], [round(debut + 0.1), v], [round(debut + 0.2), z], [round(debut + 0.3), v.map((x) => x * 0.8)], [round(debut + 0.4), z]] } };
}
/**
 * Petit cube qui flotte en boucle (vapeur, bulle, « z », larme) : il part de sa place, monte (ou descend) de « h »
 * pixels en rapetissant, disparaît, puis renaît à sa place. depart (0 à 1) décale le cycle pour que plusieurs
 * cubes ne bougent pas ensemble ; derive : déplacement de côté pendant la montée.
 */
export function flotte(os, h, duree, depart = 0, derive = 0) {
    const points = [[0, [0, 0, 0], 1], [0.65, [derive, h, 0], 0.4], [0.75, [derive * 1.1, h * 1.1, 0], 0.05], [0.8, [0, 0, 0], 0.05], [1, [0, 0, 0], 1]];
    const at = (u) => { const i = Math.max(1, points.findIndex((p) => p[0] >= u)); const [a, b] = [points[i - 1], points[i]]; const k = (u - a[0]) / (b[0] - a[0]); return [a[1].map((v, n) => v + (b[1][n] - v) * k), a[2] + (b[2] - a[2]) * k]; };
    const times = [...new Set([0, 1, ...points.map((p) => (p[0] + depart) % 1)])].sort((x, y) => x - y);
    const position = [], scale = [];
    for (const t of times) { const [pos, k] = at(((t - depart) % 1 + 1) % 1 || (t === 1 && depart === 0 ? 1 : 0)); position.push([round(t * duree), pos]); scale.push([round(t * duree), [k, k, k]]); }
    return { [os]: { position, scale } };
}
/** Pattes qui pendent et se balancent doucement, en alternance (le compagnon flotte : elles ne restent pas figées). */
export function pendouille(pattes = QUATRE, angle = 7, duree = IDLE, tours = 2) {
    return mix(...pattes.map((os, i) => balance(os, [angle, 0, 0], duree, { tours, phase: Math.floor(i / (pattes.length / 2)) % 2 })));
}
/** Pattes qui pédalent quand le compagnon avance : même va-et-vient, plus ample et plus rapide. */
export function pedale(pattes = QUATRE, angle = 26, duree = WALK) {
    return mix(...pattes.map((os, i) => balance(os, [angle, 0, 0], duree, { phase: Math.floor(i / (pattes.length / 2)) % 2 })));
}
/** Battement de deux ailes ou de deux bras, en miroir (axe z : vers le haut et vers le bas). */
export function bat(droite, gauche, angle, duree, tours = 1, repos = 0) {
    const keys = (sign) => { const out = [], step = duree / tours / 2; for (let i = 0; i <= tours * 2; i++) out.push([round(i * step), [0, 0, sign * (repos + (i % 2 ? angle : -angle))]]); return out; };
    return { [droite]: { rotation: keys(1) }, [gauche]: { rotation: keys(-1) } };
}
/** Réaction par défaut : un saut de joie, puis le corps se dandine. Durée 1,4 s. */
export function joie(os = 'corps', hauteur = 2, angle = 8) {
    return {
        [os]: {
            position: [[0, [0, 0, 0]], [0.15, [0, -0.5, 0]], [0.35, [0, hauteur, 0]], [0.55, [0, 0, 0]], [0.65, [0, hauteur * 0.35, 0]], [0.75, [0, 0, 0]]],
            rotation: [[0.75, [0, 0, 0]], [0.9, [0, 0, angle]], [1.05, [0, 0, -angle]], [1.2, [0, 0, angle * 0.6]], [1.4, [0, 0, 0]]],
        },
    };
}
export const JOIE = 1.4;

// ---------------------------------------------------------------- pièces types
import { mirrored, mirroredBone } from '../bbkit.mjs';

/** Flanc d'un corps : la couleur du pelage, le ventre plus clair sur les deux lignes du bas. */
export const flanc = (f, w) => [f.repeat(8), f.repeat(8), f.repeat(8), f.repeat(8), f.repeat(8), f.repeat(8), f + w.repeat(6) + f, w.repeat(8)];
/**
 * Paire droite / gauche : os « nomD » et « nomG », cubes du même nom. Le cube donné est celui de droite (+x) ;
 * celui de gauche est son miroir et partage sa texture quand elle est symétrique.
 */
export function paire(nom, os, cube) {
    const d = { ...cube, name: nom + 'D', bone: nom + 'D', seed: cube.seed || nom };
    return { bones: { [nom + 'D']: os, [nom + 'G']: mirroredBone(os) }, cubes: [d, mirrored(d, nom + 'G', nom + 'G')] };
}
/**
 * Quatre pattes identiques, articulées en haut. x : centre de la patte droite ; zAv, zAr : centres des pattes avant
 * et arrière ; size : [largeur, hauteur, profondeur] ; y : hauteur du dessous.
 */
export function pattes4({ x, zAv, zAr, size: [l, h, p], faces, y = 0, parent = 'root' }) {
    const out = { bones: {}, cubes: [] };
    for (const [nom, z] of [['patteAv', zAv], ['patteAr', zAr]]) {
        const made = paire(nom, { parent, pivot: [x, y + h - 0.2, z] }, { seed: 'patte', from: [x - l / 2, y, z - p / 2], to: [x + l / 2, y + h, z + p / 2], faces });
        Object.assign(out.bones, made.bones); out.cubes.push(...made.cubes);
    }
    return out;
}
/** Os communs à presque tous : root, corps (tout sauf les pattes), ventre (le cube du corps), tete. */
export const squelette = (corps, tete, ventre = corps) => ({ root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: corps }, ventre: { parent: 'corps', pivot: ventre }, tete: { parent: 'corps', pivot: tete } });

// ---------------------------------------------------------------- réactions du compagnon entier (os root)
/** Tonneau : un tour complet sur le côté, avec un petit saut. Durée 1,2 s. */
export const tonneau = (os = 'root', hauteur = 1.5) => ({ [os]: { rotation: [[0.15, [0, 0, 0]], [0.5, [0, 0, 130]], [0.8, [0, 0, 250]], [1.05, [0, 0, 360]]], position: [[0, [0, 0, 0]], [0.15, [0, -0.5, 0]], [0.55, [0, hauteur, 0]], [1.05, [0, 0, 0]], [1.2, [0, 0, 0]]] } });
/** Vrille : un tour complet sur lui-même en sautant. Durée 1,2 s. */
export const vrille = (os = 'root', hauteur = 2.5) => ({ [os]: { rotation: [[0.15, [0, 0, 0]], [0.45, [0, 120, 0]], [0.7, [0, 240, 0]], [0.95, [0, 360, 0]]], position: [[0, [0, 0, 0]], [0.15, [0, -0.6, 0]], [0.55, [0, hauteur, 0]], [0.95, [0, 0, 0]], [1.05, [0, hauteur * 0.25, 0]], [1.2, [0, 0, 0]]] } });
/** Salto avant ou arrière (sens -1) en sautant. Durée 1,2 s. */
export const salto = (os = 'root', sens = 1, hauteur = 3) => ({ [os]: { rotation: [[0.15, [0, 0, 0]], [0.45, [-120 * sens, 0, 0]], [0.7, [-240 * sens, 0, 0]], [0.95, [-360 * sens, 0, 0]]], position: [[0, [0, 0, 0]], [0.15, [0, -0.6, 0]], [0.55, [0, hauteur, 0]], [0.95, [0, 0, 0]], [1.2, [0, 0, 0]]] } });
export const TOUR = 1.2;
