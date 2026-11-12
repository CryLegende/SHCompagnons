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

## Coût réseau

```text
node cout.mjs
```

Paquets par seconde reçus par un joueur qui voit chaque compagnon de `config.yml`, tant que son propriétaire bouge : animation du compagnon entier (un paquet par pièce et par image clé) et animations propres aux pièces. Au repos, zéro.

## Limites à respecter

- 12 pièces au plus par modèle (`companion_settings.max_model_parts`).
- Pas de tête étirée sur des dizaines de blocs pour n'en montrer qu'une face : le plugin refuse ces modèles.
- Une pièce ne bouge que dans une animation et ne change de texture que dans une animation.
