// Planche de style des compagnons : blockbench/STYLE.png (les règles en image, à partir du capybara) et
// blockbench/famille.png (tous les compagnons à la même échelle de jeu).
// Usage : node blockbench.mjs capybara && node blockbench.mjs --planche=famille tout && node planche-style.mjs
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { open, sleep } from './cdp.mjs';
import { CLAIR, SOMBRE } from './bbkit.mjs';
import { visage } from './blockbench/_style.mjs';
import capybara from './blockbench/capybara.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), OUT = join(HERE, 'sortie');
const data = (file) => 'data:image/png;base64,' + readFileSync(join(OUT, file)).toString('base64');
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const clair = (h) => hex(rgb(h).map((v) => v + (255 - v) * CLAIR)), sombre = (h) => hex(rgb(h).map((v) => v * SOMBRE));
const color = (k) => { const e = capybara.palette[k]; return typeof e === 'string' ? e : e.c; };
const flat = (k) => typeof capybara.palette[k] !== 'string';

// Grille d'une face : avec ou sans l'ombrage automatique
const grid = (rows, shaded) => rows.map((row, y) => [...row].map((k) => { const c = color(k); return !shaded || flat(k) ? c : y === 0 ? clair(c) : y === 7 ? sombre(c) : c; }));
const table = (cells, px) => '<table class="g">' + cells.map((r) => '<tr>' + r.map((c) => `<td style="background:${c};width:${px}px;height:${px}px"></td>`).join('') + '</tr>').join('') + '</table>';
const face = visage('f');
const museau = capybara.cubes.find((c) => c.name === 'museau').faces.north;
const tons = [['pelage', 'f'], ['museau', 'm'], ['orange', 'o'], ['feuille', 'g']].map(([nom, k]) => `<div class="ton"><i style="background:${clair(color(k))}"></i><i style="background:${color(k)}"></i><i style="background:${sombre(color(k))}"></i><span>${nom}</span></div>`).join('');

const page = `<!doctype html><meta charset="utf-8"><title>planche</title>
<style>
 body{margin:0;background:#f4efe6;color:#2b1b12;font:15px/1.45 "Segoe UI",Arial,sans-serif;width:1600px}
 h1{margin:0;padding:22px 32px 6px;font-size:34px} h1 small{font-size:16px;font-weight:400;color:#7d5231}
 h2{margin:0 0 8px;font-size:19px;color:#b57f47;text-transform:uppercase;letter-spacing:.04em}
 .row{display:flex;gap:22px;padding:14px 32px} .card{background:#fffaf2;border-radius:14px;padding:18px 20px;box-shadow:0 1px 0 #e2d6c2}
 .crop{width:400px;height:400px;border-radius:10px;background-repeat:no-repeat;background-size:1600px auto;flex:none}
 ul{margin:0;padding-left:18px} li{margin:3px 0} b{color:#7d5231}
 table.g{border-collapse:collapse;border:2px solid #2b1b12} table.g td{padding:0;border:1px solid rgba(43,27,18,.18)}
 .ton{display:flex;align-items:center;gap:0;margin:5px 0} .ton i{width:44px;height:26px;display:block} .ton span{margin-left:10px}
 .lab{font-size:13px;color:#7d5231;margin-top:6px} .no{color:#b9322d} .ok{color:#3f8a2a}
 .strip{width:1496px;height:187px;border-radius:10px;background-repeat:no-repeat;background-size:1496px auto;margin-top:8px}
</style>
<h1>Compagnons SkyHand <small>— planche de style · modèle de référence : le capybara</small></h1>
<div class="row">
 <div class="crop" style="background-image:url(${data('capybara.png')});background-position:-400px -26px"></div>
 <div class="crop" style="background-image:url(${data('capybara.png')});background-position:0 -26px"></div>
 <div class="card" style="flex:1"><h2>Silhouette</h2><ul>
  <li><b>Grosse tête</b>, au moins aussi large que le corps ; corps court, pattes courtes.</li>
  <li><b>Des boîtes franches</b> : 6 à 11 pièces, 12 au plus.</li>
  <li><b>Museau en relief</b> : un petit cube clair devant le visage (museau, bec, groin).</li>
  <li><b>Un signe distinctif</b> en une ou deux pièces : ici l'orange et sa feuille.</li>
  <li>Taille en jeu calculée : même « corps » de 0,20 bloc pour tous.</li></ul>
  <h2 style="margin-top:16px">Jamais</h2><ul>
  <li class="no">sourcils froncés, grande bouche, visage humain ;</li><li class="no">noir pur, blanc pur, couleurs ternes ;</li>
  <li class="no">damier fin ou détail d'un demi-pixel ;</li><li class="no">pattes figées quand il flotte.</li></ul></div>
</div>
<div class="row">
 <div class="card"><h2>Visage</h2>${table(grid(face, false), 30)}<div class="lab">Face de la tête, 8 x 8.<br>Yeux 1 x 2, colonnes 1 et 6, <b>#2b1b12</b>.<br>Joues 2 pixels sous l'œil, côté extérieur.<br>Rien d'autre sur la tête.</div></div>
 <div class="card"><h2>Museau</h2>${table(grid(museau, false), 30)}<div class="lab">Sur son propre cube, plus clair.<br>Nez en haut, bouche d'un trait.<br>Traits nets : couleurs sans ombrage.</div></div>
 <div class="card"><h2>Ombrage automatique</h2>${table(grid(face, true), 30)}<div class="lab">Ligne du haut éclaircie, ligne du bas assombrie,<br>dessus clair, dessous sombre, grain léger.<br>On ne dessine que la couleur de base.</div></div>
 <div class="card" style="flex:1"><h2>Couleurs</h2>${tons}<div class="lab">Clair · base · sombre : seule la base se choisit.</div>
  <ul style="margin-top:10px"><li><b>Teintes lumineuses</b> : en jeu les côtés sont rendus à mi-luminosité.</li><li>Une dominante, une claire (ventre, museau), une sombre (pattes), plus l'accessoire.</li><li>Ventre plus clair sur les deux lignes du bas des flancs.</li></ul></div>
</div>
<div class="row">
 <div class="card" style="flex:1"><h2>Trois animations</h2>
  <div class="lab"><b>idle</b> — il flotte : respiration, regard à droite puis à gauche, un tic d'oreille, pattes qui se balancent (6 s)</div>
  <div class="strip" style="background-image:url(${data('capybara.png')});background-position:0 -415px"></div>
  <div class="lab"><b>walk</b> — son propriétaire avance : pattes qui pédalent, corps penché, l'orange ballotte (0,7 s)</div>
  <div class="strip" style="background-image:url(${data('capybara.png')});background-position:0 -619px"></div>
  <div class="lab"><b>interact</b> — clic du propriétaire : une réaction propre au compagnon, ici il lance son orange et la rattrape (1,8 s)</div>
  <div class="strip" style="background-image:url(${data('capybara.png')});background-position:0 -823px"></div>
  <ul style="margin-top:12px;columns:2"><li>Les pattes ne restent jamais figées.</li><li>Une réaction qui raconte quelque chose.</li><li>Mouvements en ligne droite entre deux poses : deux paquets par pièce et par cycle.</li><li>Une pose tenue (corps penché) ne coûte rien.</li><li>Viser moins de 12 paquets par seconde au repos, moins de 25 en avançant.</li><li>Tout mouvement finit dans la pose de repos.</li></ul></div>
</div>`;
const file = join(OUT, 'planche-style.html');
writeFileSync(file, page);
const b = await open(['--window-size=1600,1200']);
try {
    await b.goto(pathToFileURL(file).href, 600);
    const height = await b.js('document.documentElement.scrollHeight');
    const shot = await b.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1600, height: height + 20, scale: 1 } });
    writeFileSync(join(HERE, 'blockbench', 'STYLE.png'), Buffer.from(shot.data, 'base64'));
} finally { b.close(); }
copyFileSync(join(OUT, 'famille.png'), join(HERE, 'blockbench', 'famille.png'));
console.log('écrit blockbench/STYLE.png et blockbench/famille.png');
await sleep(100);
