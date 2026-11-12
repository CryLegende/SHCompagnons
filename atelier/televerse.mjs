// Téléverse sur MineSkin les peaux de sortie/peaux qui n'ont pas encore d'empreinte Mojang et range le résultat dans
// textures.json (sha de peau → empreinte textures.minecraft.net). Relançable : ce qui est déjà fait n'est pas refait.
// Usage : MINESKIN_KEY=<clé> node televerse.mjs      (sans clé : 10 envois par minute)
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, 'sortie', 'peaux');
const FILE = join(HERE, 'textures.json');
const textures = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {};
const key = process.env.MINESKIN_KEY || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const todo = readdirSync(DIR).filter((f) => f.endsWith('.png')).map((f) => f.replace('.png', '')).filter((sha) => !textures[sha]);
console.log(todo.length + ' peau(x) à téléverser');
let done = 0;
for (const sha of todo) {
    for (let attempt = 1; ; attempt++) {
        const form = new FormData();
        form.append('file', new Blob([readFileSync(join(DIR, sha + '.png'))], { type: 'image/png' }), sha + '.png');
        form.append('variant', 'classic');
        form.append('visibility', 'unlisted');
        let body = null, status = 0;
        try {
            const r = await fetch('https://api.mineskin.org/v2/generate', { method: 'POST', body: form, headers: { 'User-Agent': 'skin-tool/1.0', ...(key ? { Authorization: 'Bearer ' + key } : {}) } });
            status = r.status;
            body = await r.json();
        } catch (e) { body = { error: String(e) }; }
        const hash = body?.skin?.texture?.hash?.skin || (body?.skin?.texture?.url?.skin || '').split('/texture/')[1];
        const wait = Math.max(1500, body?.rateLimit?.next?.relative || 0);
        if (hash) {
            textures[sha] = hash;
            writeFileSync(FILE, JSON.stringify(textures, null, 1));
            done++;
            if (done % 10 === 0) console.log(done + '/' + todo.length);
            await sleep(wait);
            break;
        }
        const message = JSON.stringify(body?.errors || body?.error || body).slice(0, 200);
        // Quota horaire atteint : on attend qu'il se libère (jusqu'à trois heures), sans compter comme un échec
        if (status === 429 && attempt < 40) { if (attempt % 6 === 1) console.log(new Date().toTimeString().slice(0, 8) + ' quota atteint (' + done + '/' + todo.length + '), attente'); await sleep(Math.max(wait, 270000)); continue; }
        if (attempt >= 6) { console.log('ECHEC ' + sha + ' (' + status + ') ' + message); break; }
        await sleep(4000 * attempt);
    }
}
console.log('fini : ' + done + ' téléversée(s), ' + (todo.length - done) + ' en échec, ' + Object.keys(textures).length + ' au total');
