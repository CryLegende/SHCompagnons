// Chrome sans tête piloté par le protocole de debug (aucune dépendance). import { open } from './cdp.mjs'
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function open(extra = []) {
    const port = 9500 + Math.floor(Math.random() * 400);
    const chrome = spawn(CHROME, ['--headless=new', '--hide-scrollbars', '--no-first-run', '--enable-unsafe-swiftshader', '--window-size=1400,1000', '--remote-debugging-port=' + port, '--user-data-dir=' + join(tmpdir(), 'bd-cdp-' + port), ...extra, 'about:blank'], { stdio: 'ignore' });
    let target = null;
    for (let i = 0; i < 80 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch (e) { } }
    if (!target) throw new Error('Chrome injoignable');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => { ws.onopen = r; });
    let seq = 0; const pending = new Map(); const waiters = []; const events = [];
    ws.onmessage = (m) => {
        const d = JSON.parse(m.data);
        if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result || { error: d.error }); pending.delete(d.id); return; }
        if (d.method === 'Page.loadEventFired') waiters.splice(0).forEach((f) => f());
        events.push(d);
    };
    const send = (method, params = {}, sessionId) => new Promise((res) => { const id = ++seq; pending.set(id, res); ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); });
    await send('Page.enable'); await send('Runtime.enable');
    const js = async (expression, contextId) => {
        const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, ...(contextId ? { contextId } : {}) });
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
        return r.result?.value;
    };
    const goto = async (url, wait = 800) => { const loaded = new Promise((r) => { waiters.push(r); setTimeout(r, 45000); }); await send('Page.navigate', { url }); await loaded; await sleep(wait); };
    const shot = async (clip) => Buffer.from((await send('Page.captureScreenshot', { format: 'jpeg', quality: 75, ...(clip ? { clip: { ...clip, scale: 1 } } : {}) })).data, 'base64');
    const click = async (x, y) => { for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }); };
    const close = () => { ws.close(); chrome.kill(); };
    return { send, js, goto, shot, click, close, events };
}
