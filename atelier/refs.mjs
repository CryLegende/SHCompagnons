// Références de style : captures des compagnons du site d'exemple (pose de repos, puis réaction au clic), rangée
// par rangée, et leurs fiches (nom, sous-titre, description). Elles servent de références de style (voir
// blockbench/STYLE.md) et restent hors du dépôt : elles appartiennent à leur auteur.
// Usage : node refs.mjs <dossier de sortie>
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { open, sleep } from './cdp.mjs';

const OUT = process.argv[2];
if (!OUT) { console.log('usage : node refs.mjs <dossier de sortie>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const b = await open(['--window-size=1500,1000']);
try {
    await b.send('Emulation.setDeviceMetricsOverride', { width: 1500, height: 1000, deviceScaleFactor: 3, mobile: false });
    await b.goto('https://banqueroute.github.io/', 4000);
    const cards = await b.js(`JSON.stringify([...document.querySelectorAll('#christmas article, #companions article')].map((a, i) => { a.dataset.ref = i; const r = a.getBoundingClientRect(); const c = a.querySelector('canvas'); const t = [...a.querySelectorAll('h3,h4,p,span,div')].filter((e) => e.children.length === 0).map((e) => e.innerText.trim()).filter(Boolean); return { i, section: a.closest('section').id, text: t, x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height, canvas: c ? [c.width, c.height, c.clientWidth, c.clientHeight] : null }; }))`);
    const list = JSON.parse(cards);
    writeFileSync(join(OUT, 'fiches.json'), JSON.stringify(list.map((c) => ({ section: c.section, text: c.text })), null, 1));
    console.log(list.length + ' fiches ; toile ' + JSON.stringify(list[0].canvas) + ' ; carte ' + Math.round(list[0].w) + 'x' + Math.round(list[0].h));
    // Rangées : cartes de même ordonnée
    const rows = [];
    for (const c of list) { const row = rows.find((r) => r.section === c.section && Math.abs(r.y - c.y) < 5); if (row) row.cards.push(c); else rows.push({ section: c.section, y: c.y, cards: [c] }); }
    let n = 0;
    for (const row of rows) {
        n++;
        const x0 = Math.min(...row.cards.map((c) => c.x)) - 6, x1 = Math.max(...row.cards.map((c) => c.x + c.w)) + 6, h = Math.max(...row.cards.map((c) => c.h)) + 12;
        await b.js(`window.scrollTo(0, ${Math.round(row.y - 120)})`);
        await sleep(1500);
        const top = await b.js('scrollY');
        const clip = { x: x0, y: row.y - 6, width: x1 - x0, height: h };
        const shot = async (suffix) => { const r = await b.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...clip, scale: 1 } }); writeFileSync(join(OUT, `${row.section}-${String(n).padStart(2, '0')}-${suffix}.png`), Buffer.from(r.data, 'base64')); };
        await shot('a-repos');
        // Réaction : un clic sur chaque modèle de la rangée, puis trois instants
        for (const c of row.cards) await b.click(c.x + c.w / 2, c.y - top + Math.min(70, c.h * 0.3));
        await sleep(450); await shot('b-clic1');
        await sleep(500); await shot('c-clic2');
        await sleep(600); await shot('d-clic3');
        await sleep(1200);
    }
    console.log(rows.length + ' rangées capturées dans ' + OUT);
} finally { b.close(); }
