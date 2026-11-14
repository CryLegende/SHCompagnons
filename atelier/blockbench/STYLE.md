# Style des compagnons SkyHand

Le capybara (`capybara.mjs`) est le modèle de référence, validé par Cry le 14 novembre 2026. Tout nouveau compagnon doit pouvoir se poser à côté de lui sans détonner. La planche `STYLE.png` montre les règles en image, `famille.png` tous les compagnons à la même échelle.

Ce qui fait la cohérence est en grande partie automatique : l'ombrage est fait par `bbkit.mjs`, le visage et les animations types par `_style.mjs`, la taille en jeu par `blockbench.mjs`. Ce guide dit le reste.

## 1. Silhouette

- **Mignon et trapu** : une grosse tête (au moins aussi large que le corps), un corps court, des pattes courtes. Pour un animal à quatre pattes : tête 7 x 6 x 7 pixels, corps 6,5 x 5,5 x 7,5, pattes 2 x 3 x 2.
- **Des boîtes franches**, peu nombreuses : 6 à 11 pièces, 12 au plus (limite du plugin). Chaque pièce coûte à chaque joueur qui regarde.
- **Un relief pour le museau** : un petit cube clair en avant du visage (museau, bec, groin) plutôt qu'un dessin à plat. C'est lui qui donne le profil.
- **Un signe distinctif** par compagnon, en une ou deux pièces : l'orange du capybara, l'écharpe du manchot, la pomme du hérisson, la coquille du caneton, le chapeau de l'araignée. Sans lui, un compagnon n'est qu'un animal de plus.
- Le modèle regarde vers le nord dans Blockbench (-z), pattes posées à y = 0, centré sur x = 0.

## 2. Visage

- **Yeux** : 1 pixel de large sur 2 de haut, très sombres (`#2b1b12`, jamais noir pur), bien écartés (colonnes 1 et 6 d'une face de 8).
- **Joues roses** : 2 pixels sous chaque œil, vers l'extérieur (`#ef9c88`, ou une teinte voisine du pelage s'il est rose ou sombre).
- **Rien d'autre sur la tête** : pas de sourcils froncés, pas de grande bouche. Le nez et la bouche se dessinent sur le cube du museau, en petit (nez de 2 à 4 pixels en haut, bouche d'un ou deux pixels).
- `visage('f')` de `_style.mjs` pose yeux et joues ; `lignes` ajoute des marques (masque du panda roux, sourcils du teckel).
- Exceptions assumées : les personnages du jeu gardent leur tête officielle (voir 6), le bébé Warden n'a pas d'yeux, l'ananas porte des lunettes, R2-D2 a un œil de robot.

## 3. Couleurs et ombrage

- **Couleurs claires et franches.** En jeu les côtés d'une tête sont rendus à mi-luminosité : une couleur moyenne devient terne. Viser des teintes lumineuses (pelage du capybara `#d39a5c`, cochon `#f6adb5`).
- **Trois tons par matière**, dont deux sont automatiques : on ne donne que la couleur de base, `bbkit.mjs` éclaircit la ligne du haut des faces verticales et tout le dessus (18 % vers le blanc) et assombrit la ligne du bas et tout le dessous (x 0,85), avec un grain léger (2,5 %) et un dégradé du haut vers le bas (6 %).
- **Ventre plus clair** sur les deux lignes du bas des flancs (`flanc('f', 'w')`), bout des pattes plus sombre ou plus clair selon l'animal.
- **Traits nets sans ombrage** : une couleur donnée en objet (`{ c: '#...' }`) n'est ni éclaircie ni bruitée. C'est le cas des yeux, du nez, des petites marques.
- Peu de couleurs : une dominante, une claire (ventre, museau), une sombre (pattes, détails), et celles de l'accessoire.
- Les motifs se dessinent en gros : aplats, bandes, deux ou trois taches. Un damier fin devient du bruit à cette taille.

## 4. Textures

- Chaque face est une case de 8 x 8 pixels (ce que montre une tête de joueur), quelle que soit la taille du cube. On la dessine en 1, 2, 4 ou 8 lignes de 1, 2, 4 ou 8 caractères : une petite pièce se dessine en 2 x 2 ou 4 x 4 pour garder de gros pixels.
- Pas de transparence sur une tête. Pour du translucide, un cube `block: '..._stained_glass'` (coque des slimes, ailes de l'abeille).
- Pour un objet du jeu tenu en main, un cube `item: '...'` (pioche de Steve, émeraude du villageois).
- Deux pièces symétriques (`paire`, `pattes4`) partagent leur texture : moins de têtes à télécharger pour le joueur.

## 5. Animations

Trois états par compagnon, joués par le plugin selon ce qu'il fait.

| État | Quand | Contenu type | Durée |
|---|---|---|---|
| `idle` | il flotte à l'épaule, immobile | respiration, regard d'un côté puis de l'autre, un tic (oreille, queue), pattes qui se balancent | 6 s |
| `walk` | son propriétaire avance | pattes qui pédalent, corps penché en avant, l'accessoire qui ballotte | 0,7 s |
| `interact` | son propriétaire clique sur lui | une réaction propre au compagnon, qui finit dans sa pose de repos | 1,2 à 2 s |

- **Les pattes ne restent jamais figées** : le compagnon flotte, elles pendent et se balancent (`pendouille`), puis pédalent quand il avance (`pedale`).
- **Une réaction qui raconte quelque chose** : le capybara lance son orange, le poulet pond, le cadeau s'ouvre, la tortue rentre dans sa carapace. À défaut, un tonneau, une vrille ou un saut de joie (`tonneau`, `vrille`, `salto`, `joie`).
- **Coût** : chaque image clé d'une pièce est un paquet envoyé à chaque joueur qui regarde. Les mouvements types vont en ligne droite entre deux poses (`balance`) : deux paquets par pièce et par cycle. Une pose tenue pendant tout un état (`tient`, le corps penché en avant) ne coûte rien une fois prise. Viser moins de 12 paquets par seconde au repos et moins de 25 en avançant ; `blockbench.mjs` affiche le coût de chaque état.
- Ce qui tourne la tête fait bouger tout ce qu'elle porte (museau, oreilles, chapeau) : un compagnon aux nombreuses pièces de tête coûte plus cher au repos.
- Les mouvements du compagnon entier (saut, tonneau) se donnent à l'os `root`, ceux du corps sans les pattes à l'os `corps`.

## 6. Cas particuliers

- **Personnages du jeu** (Steve, Alex, zombie) : leur tête officielle pixel pour pixel (`_officiel.mjs`), sur un petit corps aux couleurs de leur tenue. On ne redessine pas un visage que tout le monde connaît.
- **Compagnon qui n'a pas d'équivalent convaincant** (l'ancien bloc d'obsidienne, l'ancien sculk) : on invente un proche parent qui respecte le style (un bloc d'obsidienne pleureuse vivant, un bébé Warden) plutôt que de garder un modèle faible.
- **Compagnons d'évènement** : leur fichier porte l'évènement en préfixe (`halloween_`, `paques_`, `ete_`).

## 7. Créer un compagnon

1. Chercher des références et choisir le signe distinctif et la réaction au clic.
2. Écrire `blockbench/<nom>.mjs` en partant du compagnon le plus proche (quatre pattes : `shiba.mjs` ; oiseau : `manchot.mjs` ; peluche assise : `nounours.mjs` ; objet : `cadeau.mjs`).
3. `node blockbench.mjs --planche=gros capybara <nom>` : le comparer au capybara, de trois quarts et de face. Reprendre jusqu'à ce qu'il tienne la comparaison ; abandonner l'idée plutôt que livrer un compagnon faible.
4. `node blockbench.mjs <nom>` : contrôler les trois animations image par image et leur coût.
5. `node televerse.mjs`, puis `node blockbench.mjs --livrer tout` : têtes envoyées, fichiers de modèle copiés dans le plugin, échelles écrites dans `sortie/echelles.json`.
6. Déclarer le compagnon dans config.yml (`model`, `animation: FLOAT`, `placement.scale` = l'échelle calculée) et l'essayer sur un micro serveur.

Le projet `blockbench/<nom>.bbmodel` s'ouvre dans Blockbench pour une retouche à la main ; relancer alors avec `--garder`.

## 8. Contrôle avant de livrer

- De face : deux yeux, deux joues, un museau lisible. Pas de regard dur ni de bouche qui fait un rictus.
- De trois quarts : la silhouette se reconnaît sans la texture ; le signe distinctif se voit.
- À côté du capybara : même taille apparente, mêmes proportions tête / corps, couleurs aussi lumineuses.
- Les trois animations finissent et repartent sans saut ; rien ne traverse une autre pièce.
- 12 pièces au plus, aucun avertissement à la conversion.
