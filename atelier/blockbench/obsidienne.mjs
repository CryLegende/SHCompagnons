// Obsidienne : un bloc d'obsidienne pleureuse devenu créature, yeux violets, larme qui perle, deux éclats en orbite.
// Au clic ses éclats tournent très vite autour de lui et il sursaute.
import { COMMUN, IDLE, WALK, mix, tient, regarde } from './_style.mjs';

const veines = ['oooOoooo', 'opoooOoo', 'ooooopoo', 'Oooooooo', 'ooopoooO', 'oOoooooo', 'ooooOopo', 'oooooooo'];
const orbite = (duree, tours, depart = 0) => { const keys = []; for (let i = 0; i <= tours * 4; i++) keys.push([Math.round(i * duree / (tours * 4) * 20) / 20, [0, depart + i * 90, 0]]); return { rotation: keys }; };

export default {
    name: 'obsidienne',
    title: 'Obsidienne',
    palette: { ...COMMUN, o: '#34294b', O: '#231b34', p: '#8f4fe6', v: { c: '#d3a4ff' }, b: '#a35fd0' },
    bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 4.7, 0] }, larme: { parent: 'corps', pivot: [-2.1, 4.2, -3.4] }, eclat1: { parent: 'root', pivot: [0, 5, 0] }, eclat2: { parent: 'root', pivot: [0, 5, 0] } },
    cubes: [
        { name: 'bloc', bone: 'corps', from: [-3.3, 1.4, -3.3], to: [3.3, 8, 3.3], faces: { all: veines, north: ['oooOoooo', 'oooooooo', 'ovoooovo', 'ovoooovo', 'bboooobb', 'ooopoooo', 'oOoooooo', 'ooooOooo'] } },
        { name: 'larme', bone: 'larme', bord: false, from: [-2.45, 3.3, -3.6], to: [-1.75, 4.3, -3.25], faces: { all: 'v' } },
        { name: 'eclat1', bone: 'eclat1', from: [5.2, 5.4, -0.7], to: [6.5, 7.5, 0.7], rot: [20, 30, 25], pivot: [5.8, 6.4, 0], faces: { all: ['oo', 'op', 'oo', 'Oo'] } },
        { name: 'eclat2', bone: 'eclat2', from: [-6.3, 3, -0.6], to: [-5.2, 4.7, 0.6], rot: [-25, 10, -30], pivot: [-5.8, 3.8, 0], faces: { all: ['oo', 'po', 'oO', 'oo'] } },
    ],
    animations: {
        idle: {
            length: IDLE,
            bones: mix(regarde('corps', IDLE, 8, 3), {
                eclat1: orbite(IDLE, 1), eclat2: orbite(IDLE, 1),
                larme: { position: [[0, [0, 0, 0]], [2.4, [0, 0, 0]], [3.4, [0, -2.2, 0]], [3.5, [0, -2.2, 0]], [5.4, [0, 0, 0]]], scale: [[0, [1, 1, 1]], [3.3, [1, 1, 1]], [3.5, [0.05, 0.05, 0.05]], [5.4, [0.05, 0.05, 0.05]], [5.9, [1, 1, 1]]] },
            }),
        },
        walk: { length: 1.4, bones: mix(tient('corps', [-7, 0, 0]), { eclat1: orbite(1.4, 1), eclat2: orbite(1.4, 1) }) },
        interact: {
            length: 1.4, loop: false,
            bones: {
                eclat1: orbite(1.2, 3), eclat2: orbite(1.2, 3),
                corps: { position: [[0, [0, 0, 0]], [0.15, [0, -0.5, 0]], [0.4, [0, 2.2, 0]], [0.7, [0, 0, 0]]], rotation: [[0.7, [0, 0, 0]], [0.85, [0, 0, 8]], [1.0, [0, 0, -8]], [1.15, [0, 0, 5]], [1.3, [0, 0, 0]]] },
            },
        },
    },
};
