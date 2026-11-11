<div align="center">

<img src="assets/logo.png" alt="SkyHand" width="140">

# SHCompagnons

*Compagnons en entités d'affichage, envoyés en paquets et animés par le client.*

<img src="https://img.shields.io/badge/Paper-26.3-f2a900?style=for-the-badge" alt="Paper 26.3"> <img src="https://img.shields.io/badge/Java-25-e76f00?style=for-the-badge" alt="Java 25"> <img src="https://img.shields.io/badge/SkyHand-Opale%20%C2%B7%20Lobby-3aa655?style=for-the-badge" alt="SkyHand Opale · Lobby">

</div>

---

## Présentation

Un compagnon accompagne son propriétaire : une tête de joueur (avec ou sans textures successives) ou n'importe quel modèle importé de [block-display.com](https://block-display.com/browse) / BDEngine. Utilisé sur : **Opale · Lobby**.

Le modèle n'existe que chez les joueurs (entités `item_display`, `block_display`, `text_display` envoyées en paquets, aucune entité côté serveur) :

- **ATTACHED** (par défaut) : la première pièce du modèle est passagère du joueur, les autres sont passagères d'elle. Le client déplace le compagnon avec le joueur à chaque image, sans paquet de position, même en courant, en élytre ou sur une monture.
- **FREE** : le compagnon flotte et rattrape le joueur avec un temps de retard ; une position est envoyée toutes les quelques ticks et le client lisse le trajet.

Le serveur n'envoie ensuite que l'orientation quand le joueur tourne la tête (lissée par le client), les images clés des animations (le client fait le trajet entre deux images) et les changements de texture. Les joueurs qui voient un compagnon sont exactement ceux qui voient son propriétaire (événements de suivi de Paper), plus le propriétaire lui-même : aucun parcours des joueurs à chaque tick.

Les listes de passagers envoyées par le serveur ou par UnlimitedNametags gardent le compagnon (écouteur `SET_PASSENGERS` en priorité basse, seul paquet écouté).

Le compagnon choisi est enregistré en base (table `player_pets`) et relu à chaque connexion : un joueur le garde d'un serveur à l'autre dès que les serveurs partagent la même base. Avec **SHNetwork** (facultatif), `/shcompagnons set` et `/shcompagnons unset` atteignent aussi un joueur connecté sur un autre serveur du réseau. Sans SHNetwork, ou avec `reseau.actif: false`, seuls les joueurs du serveur sont atteints.

## Importer un modèle de block-display.com

N'importe quel modèle de [block-display.com](https://block-display.com/browse) devient un compagnon, sans pack de ressources ni mod côté joueur.

### 1. Récupérer la commande

1. Ouvrir la page du modèle et attendre que l'aperçu 3D soit chargé.
2. Cliquer **Get the command**. La fenêtre **Export to Minecraft** s'ouvre.
3. Garder les réglages par défaut :

   | Réglage | Valeur |
   |---|---|
   | Export type | **Model only** |
   | Command version | **Minecraft 26.3** |
   | Command format | **Command Block** (pas Axiom) |

4. Cliquer **Copy** sur la ligne **Summon #1**. Un gros modèle a plusieurs lignes (**Summon #2**, **Summon #3**…) : les copier toutes.

Les lignes **Remove Block_Display** / **Remove Item_Display** (`/kill`) ne servent pas.

### 2. Déposer le fichier

Coller la commande dans `plugins/SHCompagnons/models/<nom>.txt`, une commande par ligne, dans l'ordre. Le nom du fichier (sans `.txt`, en minuscules) est le nom du modèle.

```text
# Sunken Mossy Smooth Stone, par NightSteak9 : https://bde.gg/b/22159
/summon block_display ~-0.5 ~-0.5 ~-0.5 {Passengers:[{id:"minecraft:item_display",item:{id:"minecraft:player_head",...}}]}
```

Les lignes qui commencent par `#` sont des commentaires. Une ligne `/kill` collée par erreur est ignorée.

### 3. Vérifier le modèle

`/shcompagnons reload` puis `/shcompagnons models` :

```text
« SH » 1 modèle(s) importé(s) :
• pierre : 8 entités, 1.00 x 1.00 x 1.00 blocs
```

La taille affichée est la taille d'origine. Si le modèle n'apparaît pas, la console dit pourquoi (`aucune commande /summon trouvée`, `illisible : …`).

### 4. Déclarer le compagnon

Dans `config.yml`, section `pets` :

```yaml
pets:
  pierre:
    displayname: "&2Pierre moussue"
    model: pierre
    animation: GLIDE
    placement:
      scale: 0.4
```

Taille en jeu = taille d'origine × `placement.scale`. Pour comparer, une tête de compagnon fait 0,25 bloc (0,5 × 0,5). Un modèle de 2 blocs de haut à `scale: 0.2` fait 0,4 bloc.

### 5. Essayer, régler, donner

1. `/shcompagnons reload` puis `/shcompagnons preview pierre` : le compagnon s'affiche sur soi pendant 30 s, sans rien enregistrer.
2. Ajuster `placement` (`scale`, `offset`, `rotation`), puis `/shcompagnons reload` et `/shcompagnons preview pierre` à nouveau.
3. `/shcompagnons set <joueur> pierre` pour le donner.

### Bon à savoir

- **Placement** : le modèle est recentré tout seul ; `placement.offset` désigne la position de son centre, dans le repère du joueur décrit en tête de `config.yml`. Le déplacer dans l'aperçu du site ne change rien. Le tourner avant **Get the command** change bien la commande.
- **Animations** : celles de BDEngine ne sont pas reprises. Seule la pose du modèle compte ; le mouvement du compagnon vient de `animation` (`GLIDE`, `BOUNCING`, `SPIN`…).
- **Coût** : chaque entité du modèle est envoyée à chaque joueur qui voit le compagnon. Ensuite, chacune reçoit un paquet d'orientation quand le propriétaire tourne la tête. Garder les modèles sous une cinquantaine d'entités (`/shcompagnons models` donne le nombre).
- **Licence** : elle figure sur la page du modèle. En **BDL BY-NC** (usage non commercial), demander à l'auteur avant de vendre le compagnon en boutique.
- **Autres sources** : les commandes de BDEngine (bdengine.app, **Export to Minecraft**) se collent de la même façon. Un fichier `.yml` de BlockDisplayCreator (`display.spawn-command`) se dépose tel quel dans `models/`. Un `.mcfunction` avec des lignes `summon` se dépose aussi.
- **Formats lus** :
  - transformations en 16 nombres ou en translation/rotations/échelle
  - passagers imbriqués et plusieurs commandes par modèle
  - objets à composants (1.20.5+) et anciennes têtes `SkullOwner`
  - blocs avec propriétés
  - textes JSON ou SNBT

## Dépendances

- Obligatoires : `packetevents`
- Optionnelles : `PlaceholderAPI`, `SHNetwork`

## Commandes

| Commande | Description | Permission |
|---|---|---|
| `/shcompagnons set <joueur> <type>` | Donne un compagnon et l'enregistre. | `shcompagnons.admin.set` |
| `/shcompagnons unset <joueur>` | Retire le compagnon. | `shcompagnons.admin.unset` |
| `/shcompagnons preview <type> [secondes]` | Essaie un compagnon sur soi (30 s), sans rien enregistrer. | `shcompagnons.admin.preview` |
| `/shcompagnons models` | Liste les modèles importés, leur nombre d'entités et leur taille. | `shcompagnons.admin.reload` |
| `/shcompagnons reload` | Recharge `config.yml`, `messages.yml` et `models/`. Si un fichier est invalide, ou si `config.yml` ne définit plus aucun compagnon, rien n'est remplacé. La base et `reseau.actif` demandent un redémarrage. | `shcompagnons.admin.reload` |
| `/shcompagnons info <joueur>` | Compagnon enregistré en base pour un joueur (en ligne ici ou sur un autre serveur, ou UUID). | `shcompagnons.admin.info` |

Alias : `/shcompagnons`, `/compagnons`.

## Placeholders

`%shcompagnons_current_pet_type%`, `%shcompagnons_current_pet_displayname%`.

## Configuration

Fichiers par défaut repris du serveur (secrets remplacés par `CHANGE_ME`). Cliquez sur un fichier pour l'ouvrir :

<pre>
plugins/SHCompagnons/
├── <a href="src/main/resources/config.yml">config.yml</a>
├── <a href="src/main/resources/messages.yml">messages.yml</a>
└── models/
</pre>

## Compilation

Java 25 et Maven :

```bash
mvn clean package
```

Le jar est généré dans `target/`.

---

<div align="center">

<sub>Développé par <b>Cry_Legende</b> pour le serveur <b>SkyHand</b> · Tous droits réservés</sub>

</div>
