// Hérisson : le cueilleur. Il rapporte sur ses piquants tout ce qu'il trouve : une pomme, une feuille d'automne, un champignon.
// Au clic il se roule en boule et fait une roulade.
import { COMMUN, IDLE, WALK, TOUR, visage, mix, tient, respire, regarde, tic, pendouille, pedale, salto, pattes4, squelette } from './_style.mjs';

const P = pattes4({ x: 1.9, zAv: -0.3, zAr: 4.0, size: [1.6, 2.4, 1.6], faces: { all: 'p' } });
const piquants = ['ssssSsss', 'sSssssss', 'ssssssSs', 'sssSssss', 'Ssssssss', 'sssssSss', 'ssSsssss', 'ssssssss'];
const crete = (name, z) => ({ name, bone: 'corps', bord: false, from: [-2.6, 7.2, z], to: [2.6, 8.9, z + 1.4], rot: [-22, 0, 0], pivot: [0, 7.4, z + 0.7], faces: { all: 's', up: 'S', north: ['sSssSssS', 'ssssssss'], south: ['sSssSssS', 'ssssssss'] } });

export default {
    name: 'herisson',
    title: 'Hérisson',
    palette: { ...COMMUN, s: '#7d5b46', S: '#ab8868', w: '#f4deb6', F: '#dcbf92', p: '#e9bca3', n: { c: '#2c1c14' }, a: '#e8493e', A: '#b8322c', g: '#63b23c', o: '#f39030', O: { c: '#c9641a' }, r: '#d9453c', x: { c: '#fff6ea' }, c: '#f4e6cf' },
    bones: { ...squelette([0, 2.6, 2], [0, 5, -1.4], [0, 2.2, 2]), butin: { parent: 'corps', pivot: [0, 8, 2.6] }, ...P.bones },
    cubes: [
        { name: 'ventre', bone: 'ventre', bord: 'haut', from: [-3.2, 2.2, -1.5], to: [3.2, 7.6, 5.5], faces: { all: piquants, down: 'w', east: [...piquants.slice(0, 6), 'swwwwwws', 'wwwwwwww'], west: [...piquants.slice(0, 6), 'swwwwwws', 'wwwwwwww'] } },
        { name: 'tete', bone: 'tete', from: [-2.9, 3, -6.6], to: [2.9, 8, -1.2], faces: { all: 'w', up: 's', north: visage('w', { lignes: { 0: 'ssssssss' } }), east: ['ssssssss', 'sswwwwww', 'swwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'], west: ['ssssssss', 'wwwwwwss', 'wwwwwwws', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'] } },
        { name: 'museau', bone: 'tete', from: [-1.2, 3.5, -8.2], to: [1.2, 5.8, -6.6], faces: { all: 'w', north: ['wwwnnwww', 'wwwnnwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'], up: ['wwwnnwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww'] } },
        crete('crete1', -0.4), crete('crete2', 3.4),
        { name: 'pomme', bone: 'butin', from: [-1.3, 8.0, 0.6], to: [0.9, 10.2, 2.8], rot: [0, 0, 14], pivot: [-0.2, 8, 1.7], faces: { all: 'a', up: ['aaaa', 'agaa', 'aaaa', 'aaaa'], down: 'A' } },
        { name: 'feuille', bone: 'butin', bord: false, from: [-2.9, 8.3, 3.4], to: [-0.3, 8.8, 5.6], rot: [20, 18, -16], pivot: [-1.6, 8.4, 4.4], faces: { all: 'o', up: ['oOoo', 'ooOo', 'oOoo', 'oooo'] } },
        { name: 'champignon', bone: 'butin', from: [1.3, 8.1, 3], to: [2.9, 10.3, 4.6], rot: [-10, 0, -16], pivot: [2.1, 8.1, 3.8], faces: { all: ['rrrr', 'rxrr', 'cccc', 'cccc'], up: ['rrrr', 'rxrr', 'rrxr', 'rrrr'] } },
        ...P.cubes,
    ],
    animations: {
        idle: { length: IDLE, bones: mix(respire(), regarde(undefined, IDLE, 8), tic('butin', [0, 0, 6], 2.6), pendouille()) },
        walk: { length: WALK, bones: mix(pedale(undefined, 30), tient('corps', [-5, 0, 0])) },
        interact: {
            length: TOUR, loop: false,
            bones: mix(salto('root', 1, 2.5), {
                tete: { rotation: [[0, [0, 0, 0]], [0.15, [-55, 0, 0]], [0.95, [-55, 0, 0]], [1.2, [0, 0, 0]]], position: [[0, [0, 0, 0]], [0.15, [0, -0.6, 1.6]], [0.95, [0, -0.6, 1.6]], [1.2, [0, 0, 0]]] },
                patteAvD: { rotation: [[0, [0, 0, 0]], [0.15, [-70, 0, 0]], [0.95, [-70, 0, 0]], [1.2, [0, 0, 0]]] }, patteAvG: { rotation: [[0, [0, 0, 0]], [0.15, [-70, 0, 0]], [0.95, [-70, 0, 0]], [1.2, [0, 0, 0]]] },
                patteArD: { rotation: [[0, [0, 0, 0]], [0.15, [70, 0, 0]], [0.95, [70, 0, 0]], [1.2, [0, 0, 0]]] }, patteArG: { rotation: [[0, [0, 0, 0]], [0.15, [70, 0, 0]], [0.95, [70, 0, 0]], [1.2, [0, 0, 0]]] },
            }),
        },
    },
};
