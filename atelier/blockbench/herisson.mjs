// Hérisson : le cueilleur. Il rapporte sur ses piquants tout ce qu'il trouve : une pomme, une feuille d'automne, un champignon.
// Au clic il se roule en boule, rebondit, et son butin saute en l'air puis retombe pile sur ses piquants ; il se
// déroule et renifle pour vérifier que tout y est.
import { COMMUN, IDLE, WALK, visage, mix, tient, respire, regarde, tic, pendouille, pedale, pattes4, squelette } from './_style.mjs';

const z = [0, 0, 0];
const boule = (a) => ({ rotation: [[0, z], [0.2, [a, 0, 0]], [1.3, [a, 0, 0]], [1.5, z]] });
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
            length: 1.9, loop: false,
            bones: {
                tete: { rotation: [[0, z], [0.2, [-50, 0, 0]], [1.3, [-50, 0, 0]], [1.5, [6, 0, 0]], [1.6, [6, 12, 0]], [1.7, [6, -12, 0]], [1.8, [4, 6, 0]], [1.9, z]], position: [[0, z], [0.2, [0, -0.6, 1.6]], [1.3, [0, -0.6, 1.6]], [1.5, z]] },
                patteAvD: boule(-70), patteAvG: boule(-70), patteArD: boule(70), patteArG: boule(70),
                corps: { rotation: [[0, z], [0.2, [14, 0, 0]], [1.0, [14, 0, 0]], [1.08, [14, 0, 7]], [1.16, [14, 0, -7]], [1.24, [14, 0, 4]], [1.3, [14, 0, 0]], [1.5, z]] },
                ventre: { scale: [[0, [1, 1, 1]], [0.2, [1.04, 1.06, 0.94]], [0.32, [1.12, 0.86, 1.04]], [0.45, [0.98, 1.1, 0.96]], [0.6, [1.04, 1.06, 0.94]], [0.82, [1.1, 0.9, 1.02]], [0.95, [1.04, 1.06, 0.94]], [1.3, [1.04, 1.06, 0.94]], [1.5, [1, 1, 1]]] },
                root: { position: [[0, z], [0.2, z], [0.32, [0, -0.6, 0]], [0.55, [0, 2.6, 0]], [0.82, z], [0.92, [0, 0.5, 0]], [1.0, z]] },
                butin: {
                    position: [[0, z], [0.32, [0, -0.3, 0]], [0.6, [0, 5.2, 0]], [0.78, [0, 6.2, 0]], [0.95, [0, 3.4, 0]], [1.08, [0, -0.4, 0]], [1.16, [0, 0.4, 0]], [1.24, z]],
                    rotation: [[0.32, z], [0.78, [0, 180, 12]], [1.08, [0, 360, 0]]],
                },
            },
        },
    },
};
