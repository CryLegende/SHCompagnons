# Contrôle du convertisseur contre Blockbench

Vérifie que `bbmodel.mjs` calcule ce que Blockbench affiche (pose de base et animations), à refaire après une mise à jour de Blockbench ou du convertisseur.

1. Lancer un Blockbench à part, jamais celui d'une autre session (le contrôle ferme le projet ouvert) :
   `Blockbench.exe --user-data-dir=<dossier vide> --remote-debugging-port=9343 --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows`
2. `node bb.mjs affiche.js sortie.json "model=@../blockbench/capybara.bbmodel" "shot=interact@0.65"` : ouvre le projet dans Blockbench, relève les coins de chaque cube à plusieurs instants de chaque animation et prend des captures.
3. `node compare.mjs sortie.json ../blockbench/capybara.bbmodel ../bbmodel.mjs <dossier des captures>` : écart entre Blockbench et le convertisseur, par instant. Attendu : « tout concorde ».
4. Fermer ce Blockbench par son numéro de processus, pas par son nom.

Relevé sur Blockbench 5.2.2, format « Generic Model » : les valeurs des images clés s'ajoutent telles quelles à la rotation et à la position de l'os (pas d'inversion de signe comme dans les formats Bedrock), angles d'Euler dans l'ordre ZYX, lissage « smooth » = courbe de THREE.SplineCurve sur les images clés voisines.
