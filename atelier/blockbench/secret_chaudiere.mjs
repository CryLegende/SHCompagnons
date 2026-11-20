// Chaudière : la petite chaudière de l'Usine qui a pris vie quand on a fermé la fuite de la Cheminée. Elle trottine sur
// ses deux pieds de fonte en crachant des bouffées de substance verte par sa cheminée ; une jauge verte brille sur son
// flanc et la vanne rouge de la Cheminée est restée plantée de travers sur l'autre. Au clic : coup de sifflet, elle
// s'écrase, saute, la vanne tourne et la cheminée crache une grosse bouffée.
// Récompense de la quête secrète finale (_tools/quetes-secretes), nom à donner par Cry.
import { mirrored, mirroredBone } from '../bbkit.mjs';
import { COMMUN, IDLE, WALK, mix, tient, flotte, pedale, DEUX, frimousse } from './_style.mjs';

const jambeD = { parent: 'root', pivot: [1.9, 2.4, 0] };
const jambe = { name: 'jambeD', bone: 'jambeD', from: [0.8, 0, -1.2], to: [3, 2.6, 1.2], faces: { all: ['ffff', 'ffff', 'FFFF', 'FFFF'], up: 'f', down: 'F' } };
// Flanc de cuivre : deux rangées de rivets sombres, une bande plus foncée au milieu
const flanc = ['cRccccRc', 'cccccccc', 'cccccccc', 'CCCCCCCC', 'CCCCCCCC', 'cccccccc', 'cccccccc', 'cRccccRc'];

export default {
    name: 'secret_chaudiere',
    title: 'Chaudière',
    palette: {
        ...COMMUN,
        c: '#d07a45', C: '#b0602f', R: { c: '#6e3a1c' }, d: '#9a5a32', f: '#4a4f57', F: '#33373d',
        v: '#7fe05a', V: { c: '#b6ff8f' }, r: '#d23b3b', o: '#e8c060', O: '#bf9a3a', g: '#8fe36a',
    },
    bones: {
        root: { pivot: [0, 0, 0] },
        corps: { parent: 'root', pivot: [0, 2.4, 0] },
        cheminee: { parent: 'corps', pivot: [1.6, 10.6, 1.6] },
        vanne: { parent: 'root', pivot: [-4.3, 6, 0], rot: [0, 0, 18] },
        bouffee1: { parent: 'cheminee', pivot: [1.6, 14.2, 1.6] },
        bouffee2: { parent: 'cheminee', pivot: [1.6, 14.2, 1.6] },
        jambeD, jambeG: mirroredBone(jambeD),
    },
    cubes: [
        { name: 'corps', bone: 'corps', from: [-3.8, 2.4, -3.6], to: [3.8, 9.8, 3.6], faces: { all: flanc, north: frimousse('c', { oeil: 'R' }), up: ['cccccccc', 'cRccccRc', 'cccccccc', 'cccccccc', 'cccccccc', 'cccccccc', 'cRccccRc', 'cccccccc'], down: 'C' } },
        { name: 'dome', bone: 'corps', from: [-2.8, 9.8, -2.6], to: [2.8, 11, 2.6], faces: { all: 'd', up: ['dddd', 'dCCd', 'dCCd', 'dddd'] } },
        { name: 'sifflet', bone: 'corps', from: [-1.6, 11, -1.8], to: [-0.4, 12.6, -0.6], faces: { all: 'o', up: 'O' } },
        { name: 'cheminee', bone: 'cheminee', from: [0.6, 10.6, 0.6], to: [2.6, 14.2, 2.6], faces: { all: ['FFFF', 'ffff', 'ffff', 'ffff'], up: 'F' } },
        { name: 'jauge', bone: 'corps', from: [3.8, 5.2, -1.1], to: [4.4, 7.4, 1.1], faces: { all: 'v', east: ['vVvv', 'vVvv', 'vvVv', 'vvvv'] }, lumineux: true },
        { name: 'vanne', bone: 'vanne', from: [-4.6, 4.8, -1.2], to: [-4, 7.2, 1.2], faces: { all: 'r', west: ['rrrr', 'rOOr', 'rOOr', 'rrrr'] } },
        { name: 'bouffee1', bone: 'bouffee1', bord: false, from: [0.9, 14.2, 0.9], to: [2.3, 15.6, 2.3], faces: { all: 'g' }, block: 'lime_stained_glass' },
        { name: 'bouffee2', bone: 'bouffee2', bord: false, from: [1.1, 14.2, 1.1], to: [2.1, 15.2, 2.1], faces: { all: 'g' }, block: 'lime_stained_glass' },
        jambe, mirrored(jambe, 'jambeG', 'jambeG'),
    ],
    animations: {
        // La chaudière respire en ronronnant, la cheminée crache deux petites bouffées décalées
        idle: {
            length: IDLE,
            bones: mix(
                { corps: { scale: [[0, [1, 1, 1]], [1.5, [1.04, 0.96, 1.04]], [3, [1, 1, 1]], [4.5, [1.04, 0.96, 1.04]], [6, [1, 1, 1]]] } },
                flotte('bouffee1', 6, IDLE / 2, 0, 1.5), flotte('bouffee2', 7, IDLE / 2, 0.5, -1.5),
            ),
        },
        // Elle trottine, penchée en avant, les bouffées plus rapides
        walk: {
            length: WALK,
            bones: mix(pedale(DEUX, 26, WALK), tient('corps', [-6, 0, 0]), flotte('bouffee1', 5, WALK, 0, 2), flotte('bouffee2', 6, WALK, 0.5, -2)),
        },
        // Coup de sifflet : elle s'écrase, saute, la vanne fait un tour, grosse bouffée
        interact: {
            length: 1.6,
            loop: false,
            bones: {
                corps: { scale: [[0, [1, 1, 1]], [0.15, [1.15, 0.82, 1.15]], [0.35, [0.9, 1.15, 0.9]], [0.6, [1, 1, 1]], [1.6, [1, 1, 1]]] },
                root: { position: [[0, [0, 0, 0]], [0.15, [0, 0, 0]], [0.4, [0, 3, 0]], [0.6, [0, 0, 0]], [1.6, [0, 0, 0]]] },
                vanne: { rotation: [[0.3, [0, 0, 0]], [0.5, [120, 0, 0]], [0.7, [240, 0, 0]], [0.9, [360, 0, 0]]] },
                bouffee1: { scale: [[0, [1, 1, 1]], [0.4, [2.4, 2.4, 2.4]], [1.0, [0.2, 0.2, 0.2]], [1.2, [1, 1, 1]]], position: [[0, [0, 0, 0]], [0.4, [0, 2, 0]], [1.0, [0, 8, 0]], [1.2, [0, 0, 0]]] },
            },
        },
    },
};
