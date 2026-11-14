// Personnages du jeu (Steve, Alex, zombie) : leur tête officielle, pixel pour pixel (8 x 8 par face, ce que montre une
// tête de joueur), sur un petit corps aux couleurs de leur tenue. Les textures viennent des fichiers du jeu, gardés
// dans sortie/cache.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng } from '../png.mjs';
import { COMMUN, IDLE, WALK, DEUX, mix, balance, tient, respire, regarde, pendouille, pedale, paire } from './_style.mjs';

const CACHE = join(dirname(fileURLToPath(import.meta.url)), '..', 'sortie', 'cache');

/** Texture officielle (chemin sous textures/, sans .png) → { tete: faces Blockbench en pixels, couleur(x, y) }. */
export async function officiel(chemin) {
    mkdirSync(CACHE, { recursive: true });
    const file = join(CACHE, 'officiel-' + chemin.replace(/\//g, '-') + '.png');
    if (!existsSync(file)) {
        const r = await fetch('https://assets.mcasset.cloud/1.21.4/assets/minecraft/textures/' + chemin + '.png');
        if (!r.ok) throw new Error('texture officielle introuvable : ' + chemin);
        writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    }
    const { w, rgba } = decodePng(readFileSync(file));
    const hex = (x, y) => { const i = (y * w + x) * 4; return '#' + [0, 1, 2].map((c) => rgba[i + c].toString(16).padStart(2, '0')).join(''); };
    // Pixel de la tête, calque du dessus compris quand il n'est pas transparent
    const at = (x, y) => { const i = (y * w + x + 32) * 4; return rgba[i + 3] > 127 ? hex(x + 32, y) : hex(x, y); };
    const tile = (x0, y0, flipH = false, flipV = false) => { const px = []; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) px.push(at(x0 + (flipH ? 7 - x : x), y0 + (flipV ? 7 - y : y))); return { px }; };
    // Rangement d'une peau : dessus (8,0), dessous (16,0), côté droit (0,8), face (8,8), côté gauche (16,8), dos (24,8).
    // Dans Blockbench le dessus se lit l'avant en haut (demi-tour) et le dessous est le miroir de ce que la peau range.
    return { tete: { north: tile(8, 8), south: tile(24, 8), east: tile(0, 8), west: tile(16, 8), up: tile(8, 0, true, true), down: tile(16, 0, true, false) }, couleur: hex };
}

/**
 * Petit personnage : tête officielle de 8 pixels de côté, corps, bras et jambes courts.
 * tenue : { haut, manche, main, bas, pied } (couleurs) ; plus : { bones, cubes } ; bras : rotation de repos des bras.
 */
export function personnage({ name, title, tete, tenue, plus = { bones: {}, cubes: [] }, bras = [0, 0, 0], idle = {}, walk = {}, interact }) {
    const B = paire('bras', { parent: 'corps', pivot: [2.75, 6.2, 0], rot: bras }, { from: [2, 2.9, -1], to: [3.5, 6.5, 1], faces: { all: ['mm', 'mm', 'mm', 'nn'], up: 'm', down: 'n' } });
    const J = paire('jambe', { parent: 'root', pivot: [1, 2.8, 0] }, { from: [0.1, 0, -1], to: [1.9, 2.9, 1], faces: { all: ['bb', 'bb', 'bb', 'pp'], up: 'b', down: 'p' } });
    return {
        name, title,
        palette: { ...COMMUN, h: tenue.haut, m: tenue.manche, n: tenue.main, b: tenue.bas, p: tenue.pied, ...(tenue.plus || {}) },
        bones: { root: { pivot: [0, 0, 0] }, corps: { parent: 'root', pivot: [0, 2.8, 0] }, ventre: { parent: 'corps', pivot: [0, 2.7, 0] }, tete: { parent: 'corps', pivot: [0, 6.5, 0] }, ...B.bones, ...J.bones, ...plus.bones },
        cubes: [
            { name: 'ventre', bone: 'ventre', from: [-2, 2.7, -1.2], to: [2, 6.5, 1.2], faces: { all: 'h', ...(tenue.devant ? { north: tenue.devant } : {}) } },
            { name: 'tete', bone: 'tete', from: [-4, 6.5, -4], to: [4, 14.5, 4], faces: tete },
            ...B.cubes, ...J.cubes, ...plus.cubes,
        ],
        animations: {
            idle: { length: IDLE, bones: mix(respire('ventre', IDLE, 2, 0.035), regarde(undefined, IDLE, 10, 3), pendouille(DEUX, 8), idle.bras === false ? {} : mix(balance('brasD', [5, 0, 0], IDLE, { tours: 2 }), balance('brasG', [5, 0, 0], IDLE, { tours: 2, phase: 1 })), idle.plus || {}) },
            walk: { length: WALK, bones: mix(pedale(DEUX, 30), tient('corps', [-4, 0, 0]), walk.bras === false ? {} : mix(balance('brasD', [28, 0, 0], WALK, { phase: 1 }), balance('brasG', [28, 0, 0], WALK)), walk.plus || {}) },
            interact,
        },
    };
}
