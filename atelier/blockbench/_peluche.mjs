// Peluche assise (nounours, panda) : gros corps, grosse tête, museau clair, oreilles rondes, bras le long du corps,
// jambes tendues vers l'avant. Chaque modèle donne ses couleurs et ses dessins.
import { COMMUN, IDLE, WALK, DEUX, mix, balance, tient, respire, regarde, tic, pendouille, pedale, paire } from './_style.mjs';

/**
 * couleurs : palette ; lettres { corps, bras, oreille, museau } ; dessins : { ventre: face avant du corps, visage,
 * museau, coussinet, creux (intérieur de l'oreille) } ; plus : { bones, cubes } en supplément.
 */
export function peluche({ name, title, palette, lettres, dessins, plus = { bones: {}, cubes: [] }, interact }) {
    const O = paire('oreille', { parent: 'tete', pivot: [3.1, 11.8, -0.2] }, { from: [2.2, 11.5, -0.8], to: [4.1, 13.4, 0.5], faces: { all: lettres.oreille, north: dessins.creux } });
    const B = paire('bras', { parent: 'corps', pivot: [3, 6.6, 0] }, { from: [2.8, 3, -1], to: [4.5, 6.9, 1.1], rot: [0, 0, 9], pivot: [3, 6.6, 0], faces: { all: lettres.bras } });
    const J = paire('jambe', { parent: 'root', pivot: [1.7, 2.2, -1.6] }, { from: [0.7, 1.2, -4.6], to: [2.7, 3.3, -1.4], faces: { all: lettres.bras, north: dessins.coussinet } });
    return {
        name, title,
        palette: { ...COMMUN, ...palette },
        bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 1.8, 0.3] }, ventre: { parent: 'corps', pivot: [0, 1.6, 0.3] }, tete: { parent: 'corps', pivot: [0, 6.6, 0] }, ...O.bones, ...B.bones, ...J.bones, ...plus.bones },
        cubes: [
            { name: 'ventre', bone: 'ventre', from: [-2.8, 1.6, -2], to: [2.8, 7, 2.6], faces: { all: lettres.corps, north: dessins.ventre, ...(dessins.flanc ? { east: dessins.flanc, west: dessins.flanc, south: dessins.flanc } : {}) } },
            { name: 'tete', bone: 'tete', from: [-3.3, 6.4, -3.4], to: [3.3, 12.4, 3], faces: { all: lettres.tete || lettres.corps, north: dessins.visage } },
            { name: 'museau', bone: 'tete', from: [-1.6, 6.9, -4.4], to: [1.6, 9.2, -3.4], faces: { all: lettres.museau, north: dessins.museau, up: [dessins.museau[0], lettres.museau.repeat(8), lettres.museau.repeat(8), lettres.museau.repeat(8)] } },
            ...O.cubes, ...B.cubes, ...J.cubes, ...plus.cubes,
        ],
        animations: {
            idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.04), regarde(undefined, IDLE, 9, 4), balance('brasD', [6, 0, 0], IDLE, { tours: 2 }), balance('brasG', [6, 0, 0], IDLE, { tours: 2, phase: 1 }), pendouille(DEUX, 7), tic('oreilleD', [0, 0, -18], 2.7)) },
            walk: { length: WALK, bones: mix(pedale(DEUX, 16), tient('corps', [-5, 0, 0]), balance('brasD', [22, 0, 0], WALK), balance('brasG', [22, 0, 0], WALK, { phase: 1 })) },
            interact,
        },
    };
}
