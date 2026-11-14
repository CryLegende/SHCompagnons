// Bébé dragon : grosse tête, museau, deux petites cornes, deux ailes qui battent (il vole à l'épaule), queue relevée,
// petits pieds. Chaque dragon donne ses couleurs et ce qu'il tient (9 pièces ici : il en reste 3 pour son idée).
// Couleurs attendues : f (écailles), F (écailles foncées), l (museau), w (ventre), W (plis du ventre), m (membrane des
// ailes), h et H (cornes, pointe et base), n (narines).
import { COMMUN, IDLE, WALK, visage, mix, balance, tient, respire, regarde, bat, paire } from './_style.mjs';

/** plus : { bones, cubes } ; anim : { idle, walk } pistes en plus ; interact : la réaction au clic (état complet). */
export function dragon({ name, title, palette, plus = { bones: {}, cubes: [] }, anim = {}, interact }) {
    const C = paire('corne', { parent: 'tete', pivot: [2.1, 11.8, 1] }, { bord: false, from: [1.5, 11.6, 0.4], to: [2.7, 14, 1.6], rot: [-14, 0, -18], pivot: [2.1, 11.8, 1], faces: { all: ['hh', 'hh', 'HH', 'HH'], up: 'h' } });
    const aile = ['FFFF', 'mmFm', 'mmFm', 'mmmm'];
    const A = paire('aile', { parent: 'corps', pivot: [1.7, 6.8, 2.1] }, { bord: false, from: [1.7, 4.6, 1.9], to: [6.9, 8.6, 2.4], rot: [0, -20, 20], pivot: [1.7, 6.8, 2.1], faces: { all: 'm', north: aile, south: aile, up: 'F', east: 'F' } });
    return {
        name, title,
        palette: { ...COMMUN, ...palette },
        bones: {
            root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2, 0.2] }, ventre: { parent: 'corps', pivot: [0, 2, 0.2] }, tete: { parent: 'corps', pivot: [0, 6.4, 0] },
            queue: { parent: 'corps', pivot: [0, 2.9, 2] }, pieds: { parent: 'root', pivot: [0, 2.2, -0.8] }, ...C.bones, ...A.bones, ...plus.bones,
        },
        cubes: [
            { name: 'ventre', bone: 'ventre', from: [-2.3, 2, -1.7], to: [2.3, 6.6, 2.1], faces: { all: 'f', north: ['ffwwwwff', 'ffwwwwff', 'ffWWWWff', 'ffwwwwff', 'ffwwwwff', 'ffWWWWff', 'ffwwwwff', 'fffwwfff'], down: 'w' } },
            { name: 'tete', bone: 'tete', from: [-3.3, 6.2, -3.5], to: [3.3, 12, 2.7], faces: { all: 'f', north: visage('f'), up: ['ffffffff', 'ffffffff', 'fffFFfff', 'fffFFfff', 'ffffffff', 'fffFFfff', 'fffFFfff', 'ffffffff'] } },
            { name: 'museau', bone: 'tete', from: [-2, 6.4, -5], to: [2, 8.7, -3.5], faces: { all: 'l', north: ['llllllll', 'llllllll', 'llllllll', 'wwwwwwww'], up: ['lnllllnl', 'llllllll', 'llllllll', 'llllllll'], down: 'w' } },
            ...C.cubes, ...A.cubes,
            { name: 'queue', bone: 'queue', from: [-0.9, 2, 1.8], to: [0.9, 3.7, 6.6], rot: [-24, 0, 0], pivot: [0, 2.9, 2], faces: { all: 'f', up: ['ff', 'FF', 'ff', 'FF', 'ff', 'FF', 'ff', 'FF'], south: 'F', down: 'w' } },
            { name: 'pieds', bone: 'pieds', from: [-2.2, 0.8, -2.5], to: [2.2, 2.2, 0.3], faces: { all: 'F', north: ['FFwwwwFF', 'FFwwwwFF', 'hFwwwwFh', 'FFwwwwFF'], up: 'f' } },
            ...plus.cubes,
        ],
        animations: {
            idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.04), regarde(undefined, IDLE, 9, 3), bat('aileD', 'aileG', 13, IDLE, 5), balance('queue', [0, 9, 0], IDLE, { tours: 2 }), balance('pieds', [7, 0, 0], IDLE, { tours: 2 }), anim.idle) },
            walk: { length: WALK, bones: mix(tient('corps', [-10, 0, 0]), tient('tete', [8, 0, 0]), bat('aileD', 'aileG', 24, WALK, 2), tient('queue', [-14, 0, 0]), tient('pieds', [22, 0, 0]), anim.walk) },
            interact,
        },
    };
}
