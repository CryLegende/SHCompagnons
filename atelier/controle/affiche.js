// Ouvre un .bbmodel (texte dans ARGS.model) dans Blockbench, rend ce qu'il affiche : coins des cubes en pose de base
// et à quelques instants de chaque animation, et une capture de la vue 3D (pose de base, puis ARGS.shot = "anim@t").
if (Project) { try { Project.saved = true; await Project.close(true); } catch (e) { } }
const model = JSON.parse(ARGS.model);
newProject(Formats.free);
Codecs.project.parse(model, 'C:/tmp/essai.bbmodel');
await new Promise((r) => setTimeout(r, 800));
Canvas.updateAll();
const read = () => {
    scene.updateMatrixWorld(true);
    const out = {};
    for (const c of Cube.all) {
        const m = c.mesh; m.updateMatrixWorld(true);
        const pos = m.geometry.attributes.position, verts = [];
        for (let i = 0; i < pos.count; i++) { const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(m.matrixWorld); verts.push([+v.x.toFixed(5), +v.y.toFixed(5), +v.z.toFixed(5)]); }
        out[c.name] = { verts };
    }
    return out;
};
const shot = async (yaw, pitch) => {
    const w = 700, h = 620;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(w, h); renderer.setClearColor(0x7f93a8, 1);
    const cam = new THREE.PerspectiveCamera(30, w / h, 1, 3000);
    const d = 52, y = yaw * Math.PI / 180, p = pitch * Math.PI / 180;
    cam.position.set(-Math.sin(y) * Math.cos(p) * d, 7 + Math.sin(p) * d, -Math.cos(y) * Math.cos(p) * d); cam.lookAt(0, 7, -1);
    const grid = scene.children.filter((o) => o.visible && (o.name === 'grid_group' || o.isLineSegments || o.name === 'side_grid'));
    grid.forEach((o) => { o.visible = false; });
    renderer.render(scene, cam);
    grid.forEach((o) => { o.visible = true; });
    const url = renderer.domElement.toDataURL('image/png'); renderer.dispose(); renderer.forceContextLoss();
    return url;
};
const base = read();
const shots = { base34: await shot(35, 22), baseFace: await shot(0, 8) };
Modes.options.animate.select();
const samples = {};
for (const anim of Animation.all) {
    anim.select();
    for (const t of [0.1, 0.3, 0.45, 0.65, 0.9, 1.05, 1.5, 2.0].filter((x) => x < anim.length)) {
        Timeline.setTime(t); Animator.preview();
        samples[anim.name + '@' + t] = read();
        if (ARGS.shot === anim.name + '@' + t) shots.anim = await shot(35, 22);
    }
}
Timeline.setTime(0); Animator.preview();
Modes.options.edit.select();
return { base, samples, shots, cubes: Cube.all.length, groups: Group.all.length, animations: Animation.all.map((a) => a.name + ':' + a.length + ':' + a.loop), textures: Texture.all.map((t) => t.width + 'x' + t.height) };
