// node bb.mjs <script.js> [sortie.json] [VAR=valeur ...] : évalue un script dans le Blockbench privé (port 9343).
// Le script est le corps d'une fonction async ; ARGS = objet des VAR passées ; ce qu'il rend est écrit en JSON.
import fs from 'node:fs';
const [file, out, ...vars] = process.argv.slice(2);
const args = {};
for (const v of vars) { const i = v.indexOf('='); args[v.slice(0, i)] = v.slice(i + 1).startsWith('@') ? fs.readFileSync(v.slice(i + 2), 'utf8') : v.slice(i + 1); }
const port = process.env.BB_PORT || 9343;
const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page' && !/devtools/.test(t.url));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const expression = `(async (ARGS) => { ${fs.readFileSync(file, 'utf8')} })(${JSON.stringify(args)}).then((v) => JSON.stringify(v === undefined ? null : v))`;
const res = await new Promise((r) => {
    ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id === 1) r(d); });
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true, userGesture: true } }));
});
ws.close();
if (res.result?.exceptionDetails) { console.error('ERREUR ' + (res.result.exceptionDetails.exception?.description || JSON.stringify(res.result.exceptionDetails))); process.exit(1); }
const text = res.result?.result?.value ?? 'null';
if (out && out !== '-') { fs.writeFileSync(out, text); console.log('écrit ' + out + ' (' + text.length + ' octets)'); } else console.log(text.slice(0, 8000));
