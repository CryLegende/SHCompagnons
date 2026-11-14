// Vrais visages : la tête d'une créature ou d'un personnage du jeu, pixel pour pixel (8 x 8 par face, ce que montre
// une tête de joueur). Une créature connue garde son visage : on ne le redessine pas dans le style des animaux.
//   officiel(chemin) : texture des fichiers du jeu ;
//   peau(empreinte)  : peau déjà en ligne sur textures.minecraft.net (les têtes des compagnons d'origine, voir TETES).
// Les fichiers sont gardés dans sortie/cache.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodePng } from '../png.mjs';

const CACHE = join(dirname(fileURLToPath(import.meta.url)), '..', 'sortie', 'cache');

/** Empreintes des têtes des compagnons d'origine dont on reprend le visage tel quel. */
export const TETES = {
    ghast: '7a8b714d32d7f6cf8b37e221b758b9c599ff76667c7cd45bbc49c5ef19858646',
    slime: '895aeec6b842ada8669f846d65bc49762597824ab944f22f45bf3bbb941abe6c',
    slime_bleu: 'c285caa2c3cb8a1ea8f2f7e2ecaee44afb21c62211dea6fd3c137b22bb86734f',
    slime_dore: 'f9e3d6ceabce729ee722c8082467ed57470eb38436157d5de07afa3491a14d5e',
    slime_choco: 'e2d1620300a8e1e0bda70c71efbc46b7845d6171584d800fa9004cfad88d2aa8',
};

async function tete(file, url) {
    mkdirSync(CACHE, { recursive: true });
    if (!existsSync(file)) {
        const r = await fetch(url);
        if (!r.ok) throw new Error('texture introuvable : ' + url);
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

/** Texture officielle (chemin sous textures/, sans .png) → { tete: faces Blockbench en pixels, couleur(x, y) }. */
export const officiel = (chemin) => tete(join(CACHE, 'officiel-' + chemin.replace(/\//g, '-') + '.png'), 'https://assets.mcasset.cloud/1.21.4/assets/minecraft/textures/' + chemin + '.png');
/** Peau en ligne (empreinte textures.minecraft.net) → { tete: faces Blockbench en pixels, couleur(x, y) }. */
export const peau = (empreinte) => tete(join(CACHE, 'peau-' + empreinte + '.png'), 'https://textures.minecraft.net/texture/' + empreinte);
