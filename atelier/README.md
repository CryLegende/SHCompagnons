# Atelier des compagnons

Sources des modèles fournis avec SHCompagnons et outils pour les fabriquer, les animer et les vérifier en image avant de les mettre en jeu. Tout tourne avec Node 22+ et le JDK du plugin, sans dépendance ; les rendus passent par Chrome sans tête.

## Les deux familles de modèles

| Dossier | Contenu | Outil |
|---|---|---|
| `modeles/` | Modèles faits pour SkyHand : une description par fichier (pièces, textures dessinées case par case, groupes articulés, animations). | `atelier.mjs` |
| `importes/`, `refs/` | Modèles repris de block-display.com, tels qu'exportés (auteur, lien et licence en tête de fichier). | `animer.mjs` + `rigs.mjs` |

Les fichiers produits arrivent dans `sortie/` (non versionné) ; ceux à livrer se copient dans `../src/main/resources/models/`.

## Fabriquer et regarder un modèle

```text
node atelier.mjs abeille                      sortie/abeille.txt + sortie/abeille.png (4 vues et les images de l'animation)
node atelier.mjs --planche=lot abeille lapin  une seule image, deux vues par modèle à la même échelle de jeu
node atelier.mjs --planche=anim abeille lapin une ligne d'images d'animation par modèle
node atelier.mjs --sans-rendu tout            reconstruit tous les modèles
node atelier.mjs --cdn abeille                rendu avec les textures servies par textures.minecraft.net
```

Le rendu relit le fichier produit avec l'importeur du plugin (`Vide.java`) : ce qui s'affiche est ce que le plugin a compris, animations comprises, interpolées comme le client le fait. Il faut donc avoir compilé le plugin (`mvn compile`).

Un modèle est un objet décrit en tête de `kit.mjs` : unités en pixels (16 px = 1 bloc à l'échelle 1), y vers le haut, le modèle regarde vers +z. Une pièce est une tête de joueur étirée en boîte (`size`, `pos` = centre, `rot`), dont chaque face se dessine en 8 lignes de 8 caractères pris dans `palette`. Une pièce peut aussi être un bloc (`block`) ou un objet tenu (`item`). Les animations (`clips`) sont des poses : la pose de base avec quelques groupes tournés ou déplacés, ou une pièce qui change de texture.

## Textures des têtes

Chaque texture dessinée est une peau 64x64 (`sortie/peaux/<sha>.png`). Pour qu'elle s'affiche en jeu, elle doit exister sur textures.minecraft.net :

```text
MINESKIN_KEY=<clé> node televerse.mjs
```

`televerse.mjs` envoie à MineSkin les peaux qui manquent et note leur empreinte dans `textures.json` ; il attend quand le quota de la clé est atteint et se relance sans rien refaire. Tant qu'une peau n'est pas téléversée, le fichier de modèle porte `local-<sha>` : il se rend ici mais ne s'affiche pas en jeu. Reconstruire après le téléversement.

## Animer un modèle repris du site

```text
node atelier.mjs --planche=indices importes/canard:0.58:180   chaque pièce d'une couleur, avec son numéro
node animer.mjs --pieces canard                               numéro, centre et taille de chaque pièce
node animer.mjs                                               écrit sortie/<nom>.txt pour chaque modèle de rigs.mjs
node atelier.mjs --planche=anim sortie/canard:0.58:180:0,10,20,30
```

`rigs.mjs` décrit pour chaque modèle des groupes de pièces (numéros, pivot) et des poses (rotation, déplacement d'un groupe). Le dessin d'origine n'est pas modifié. Après le nom d'un modèle importé : échelle, orientation (`placement.rotation.y` + 10) et ticks à montrer.

## Mouvements adoucis et pauses

Le client va en ligne droite et à vitesse constante d'une pose à la suivante. Pour qu'un mouvement parte et arrive en douceur, `kit.mjs` et `animer.mjs` ajoutent des poses intermédiaires dont l'avancée suit une courbe en S, dès qu'un mouvement dure 8 ticks (`lineaire: true` sur une animation ou `sec: true` sur une pose gardent le trajet droit : orbite, saut). Une animation joue son mouvement puis laisse le modèle au repos jusqu'à la fin de son cycle : la dernière pose ramène à la pose de base bien avant `loop`.

## Tailles et icônes

```text
node tailles.mjs --cible 0.26     taille en jeu de chaque compagnon et échelle qui lui donnerait ce « corps »
node planche.mjs --echelles       reporte dans config.yml l'échelle des fichiers de modeles/, puis refait les planches
node icone.mjs shiba:0            texture d'une pièce, à utiliser comme icône (menu, box)
node icone.mjs herisson:1:nx      même chose avec une autre face mise devant (peau à téléverser d'abord)
```

Le « corps » est le côté du cube de même volume que les pièces du modèle : viser 0,23 à 0,27 bloc pour que les compagnons restent comparables.

Un modèle réservé à un évènement porte son nom en préfixe (`halloween_araignee`, `paques_canard`, `ete_ananas`).

## Modèles faits dans Blockbench

Les compagnons fournis sont faits ainsi depuis la version 2.7, sauf Steve, Alex, le zombie, R2-D2 et le golem de cuivre, gardés dans leur modèle d'origine. Le style commun (idée, silhouette, visage, couleurs, animations) est décrit dans `blockbench/STYLE.md` et montré dans `blockbench/famille.png` ; `blockbench/_style.mjs` en porte les briques (visage, pattes, animations types).

Un modèle dessiné et animé dans Blockbench (format « Generic Model », « Per-face UV ») devient un compagnon sans resource pack : chaque cube est rendu par une tête de joueur étirée qui porte ses six faces, chaque animation devient un état (`idle` au repos, `walk` quand il avance, `interact` au clic de son propriétaire).

```text
node blockbench.mjs capybara                    blockbench/capybara.bbmodel → sortie/capybara.txt, peaux, sortie/capybara.png
node blockbench.mjs --garder capybara           même chose sans réécrire le projet depuis sa description (projet retouché à la main)
node blockbench.mjs chemin/vers/modele.bbmodel  un projet venu d'ailleurs
node blockbench.mjs --planche=gros capybara lapin  deux vues par modèle, en grand, à la même échelle de jeu
node blockbench.mjs --livrer tout               copie les modèles dans le plugin, écrit sortie/echelles.json
node blockbench.mjs --planche=famille tout      refait la planche de famille (sortie/famille.png)
node televerse.mjs [modèle ...] [--seuls]       envoie les têtes à MineSkin, les modèles nommés d'abord (--seuls : eux seulement)
node icones-bb.mjs                               icône de menu de chaque compagnon : la tête qui porte son visage (sortie/icones-bb.txt)
MINESKIN_KEY=<clé> node televerse.mjs           envoie les têtes, puis relancer blockbench.mjs
```

- `blockbench/<nom>.bbmodel` est le projet : il s'ouvre et se retouche dans Blockbench (cubes, texture, animations).
- `blockbench/<nom>.mjs`, s'il existe, est la description qui a servi à l'écrire (`bbkit.mjs` : os, cubes aux faces dessinées case par case, images clés). Elle réécrit le projet à chaque lancement : après une retouche dans Blockbench, passer `--garder` ou supprimer la description.
- `bbmodel.mjs` fait la conversion. Ses calculs (pose des cubes, textures des faces, animations) ont été comparés à ce que Blockbench 5.2.2 affiche : écart sous 0,0001 pixel.
- Le rendu montre quatre vues puis une ligne d'images par état, avec le coût de chaque état en paquets par seconde.

Règles de dessin :

- Une face de tête montre 8 x 8 pixels. Une face de cube large ou haute de 1, 2, 4 ou 8 pixels de texture est reprise à l'identique ; les autres largeurs sont rééchantillonnées (3 passe, 5 à 7 donnent des pixels inégaux).
- Pas de transparence ni de pixels lumineux sur une tête : un pixel transparent prend la couleur moyenne du cube.
- Un cube = une entité : 12 au plus, comme pour les autres modèles.
- Chaque image clé d'une pièce coûte un paquet. Le client va en ligne droite d'une image clé à la suivante : une animation dont toutes les pièces basculent entre deux poses aux mêmes instants (la marche du capybara) coûte deux paquets par pièce et par cycle ; une courbe lissée en coûte davantage. Une pièce qui ne bouge pas dans un état ne coûte rien : garder immobile ce qui peut l'être (la tête porte aussi le museau, les oreilles et ce qui est posé dessus).
- `--tolerance` (0,15 pixel par défaut) règle l'écart accepté entre le trajet voulu et celui que le client affichera : plus grand, moins d'images clés.

## Coût réseau

```text
node cout.mjs
```

Paquets par seconde reçus par un joueur qui voit chaque compagnon de `config.yml`, tant que son propriétaire bouge : animation du compagnon entier (un paquet par pièce et par image clé) et animations propres aux pièces. Au repos, zéro.

## Limites à respecter

- 12 pièces au plus par modèle (`companion_settings.max_model_parts`).
- Pas de tête étirée sur des dizaines de blocs pour n'en montrer qu'une face : le plugin refuse ces modèles.
- Une pièce ne bouge que dans une animation et ne change de texture que dans une animation.
