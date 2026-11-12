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

Le serveur n'envoie ensuite que l'orientation quand le joueur tourne la tête (lissée par le client), les images clés des animations (le client fait le trajet entre deux images) et les changements de texture.

Un modèle peut animer ses propres pièces (ailes qui battent, oreilles, bras qui salue, yeux qui clignent) en plus du mouvement d'ensemble du compagnon : voir [Animer les pièces d'un modèle](#animer-les-pièces-dun-modèle). Le jar fournit 39 modèles animés : 26 faits pour SkyHand, 13 repris de block-display.com. Les joueurs qui voient un compagnon sont exactement ceux qui voient son propriétaire (événements de suivi de Paper), plus le propriétaire lui-même : aucun parcours des joueurs à chaque tick.

Un propriétaire **invisible** (potion, effet `give-effects` de WorldGuard, autre plugin) n'est plus vu de personne, et son compagnon non plus : il disparaît de chez les autres joueurs et revient avec le propriétaire. Le propriétaire garde le sien, comme son propre corps translucide (`companion_settings.show_to_owner_when_invisible`). L'invisibilité est lue à chaque tick, un test de drapeau par compagnon. Un propriétaire en vanish que les autres ne peuvent plus suivre n'a déjà plus de compagnon chez eux.

**Accroupi**, le propriétaire fige l'orientation de son compagnon : il peut se retourner pour le regarder. Au relevé, le compagnon reprend son regard en `turn.resume_smoothing_ticks` ticks (`turn.freeze_when_sneaking: false` pour qu'il suive toujours le regard).

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
- **Animations** : celles de BDEngine ne sont pas reprises. Seule la pose du modèle compte ; le mouvement du compagnon vient de `animation` (`FLOAT`, `GLIDE`, `BOUNCING`, `SPIN`…) et, pour ses pièces, des poses du fichier de modèle ([Animer les pièces d'un modèle](#animer-les-pièces-dun-modèle)).
- **Modèles refusés** : un modèle dont une entité s'étend sur plus de 64 blocs. Certains modèles du site étirent une tête sur des milliers de blocs pour n'en montrer qu'une face (plans transparents) ; ils ne peuvent pas servir de compagnon.
- **Coût** : chaque entité du modèle est envoyée à chaque joueur qui voit le compagnon, puis chacune reçoit un paquet quand le propriétaire tourne la tête et à chaque image clé de l'animation. Un modèle de 10 entités coûte donc 10 fois une tête seule, en permanence. Limite : `companion_settings.max_model_parts` (12 par défaut), au-delà le compagnon est refusé au chargement. Viser 8 ou moins.
- **Préchargement** : un client télécharge la texture d'une tête la première fois qu'il l'affiche et montre une tête par défaut en attendant. Le compagnon apparaît donc d'abord réduit à un point pendant `companion_settings.preload_ticks` (12), le temps de télécharger ses textures et celles que ses animations afficheront, puis se déploie.
- **Repos** : quand le propriétaire n'a ni bougé ni tourné la tête depuis `companion_settings.rest_after_seconds` (30), son compagnon revient à sa position neutre et arrête son animation ; il repart au premier mouvement. Un joueur absent ne coûte alors plus aucun paquet.
- **Sens** : le modèle doit regarder vers +z, l'avant du joueur. Beaucoup de modèles du site regardent vers -z ou -x : corriger avec `placement.rotation.y` (180 ou 90).
- **Modèles fournis** : ceux du jar (dossier `models/`) sont copiés dans `plugins/SHCompagnons/models/` quand ils y manquent, jamais remplacés. Pour reprendre un modèle fourni après une mise à jour, supprimer son fichier.
- **Licence** : elle figure sur la page du modèle. En **BDL BY-NC** (usage non commercial), demander à l'auteur avant de vendre le compagnon en boutique.
- **Autres sources** : les commandes de BDEngine (bdengine.app, **Export to Minecraft**) se collent de la même façon. Un fichier `.yml` de BlockDisplayCreator (`display.spawn-command`) se dépose tel quel dans `models/`. Un `.mcfunction` avec des lignes `summon` se dépose aussi.
- **Formats lus** :
  - transformations en 16 nombres ou en translation/rotations/échelle
  - passagers imbriqués et plusieurs commandes par modèle
  - objets à composants (1.20.5+) et anciennes têtes `SkullOwner`
  - blocs avec propriétés
  - textes JSON ou SNBT

## Animer les pièces d'un modèle

Après sa pose de base, un fichier de modèle peut décrire des animations : le même modèle dans d'autres poses, à des instants donnés d'un cycle qui se répète. Seules les entités qui bougent ou changent de texture d'une pose à l'autre sont animées ; le client fait le trajet d'une pose à la suivante.

```text
/summon block_display ~ ~ ~ {Passengers:[...]}
@animation loop=40
@pose 10
/summon block_display ~ ~ ~ {Passengers:[...]}
@pose 30
/summon block_display ~ ~ ~ {Passengers:[...]}
@animation loop=120
@pose 114
/summon block_display ~ ~ ~ {Passengers:[...]}
```

| Ligne | Rôle |
|---|---|
| première commande `/summon` | Pose de base : instant 0 de chaque cycle, pose du compagnon au repos. |
| `@animation loop=<ticks>` | Ouvre une animation qui se répète tous les `<ticks>` ticks. |
| `@pose <tick>` | Le modèle entier à cet instant du cycle : mêmes entités, dans le même ordre que la pose de base. |

- À la fin du cycle, le modèle revient à la pose de base.
- Plusieurs animations tournent chacune à leur rythme. Une entité peut bouger dans l'une et changer de texture (ou de bloc) dans une autre.
- Depuis BDEngine : exporter le même projet dans chaque pose, sans ajouter ni retirer d'élément entre deux exports.
- Ces animations s'ajoutent à `animation` du compagnon (`BOUNCING`, `GLIDE`…) : une pièce ne reçoit qu'une cible à la fois, calculée avec les deux. Elles s'arrêtent comme elle au repos.
- Un modèle qui fait déjà son saut dans ses poses (les slimes fournis) se déclare avec `animation: NONE`.
- **Coût** : un paquet par entité animée à chacune de ses poses, pour chaque joueur qui voit le compagnon. Une entité qui ne change pas dans une animation ne coûte rien, et une pose qu'une entité traverse déjà en allant de la précédente à la suivante n'est pas envoyée. `/shcompagnons models` donne le nombre d'entités animées de chaque modèle.
- Une transformation écrite en `translation`, `left_rotation`, `scale`, `right_rotation` s'anime mieux qu'une transformation en 16 nombres : le client anime ces quatre valeurs séparément.

### Modèles fournis

| Modèles | Origine |
|---|---|
| `abeille`, `alex`, `amongus`, `bebe_yoda`, `bonhomme_de_neige`, `cochon`, `cookie`, `ete_ananas`, `ghast`, `ghast_joyeux`, `jeb`, `lapin`, `nounours`, `obsidienne`, `panda`, `perroquet`, `r2d2`, `sculk`, `slime`, `slime_bleu`, `slime_choco`, `slime_dore`, `steve`, `tortue`, `villageois`, `zombie` | Faits pour SkyHand : pièces, textures et animations décrites dans [`atelier/modeles/`](atelier/modeles/). |
| `cadeau`, `champignon`, `elephant`, `golem_cuivre`, `halloween_araignee`, `herisson`, `manchot`, `ornithorynque`, `panda_roux`, `paques_canard`, `poulet`, `shiba`, `teckel` | [block-display.com](https://block-display.com/browse) ; auteur, lien et licence en tête de chaque fichier. Leur animation de repos est ajoutée par [`atelier/rigs.mjs`](atelier/rigs.mjs), sans toucher au dessin. |

L'[atelier](atelier/README.md) fabrique ces modèles, les rend en image tels que le plugin les lit et chiffre leur coût réseau.

## Clic sur son compagnon

Un joueur qui vise son compagnon et clique le fait sauter (un saut puis un petit rebond, vus de tous ceux qui voient le compagnon), avec une particule au-dessus de lui. Le joueur entend le son du compagnon et lit une phrase tirée au hasard dans `click_phrases` de `messages.yml`, au-dessus de sa barre d'objets ou dans le chat.

- Le compagnon n'a pas de hitbox (entités d'affichage) : le clic compte quand le regard du joueur passe sur le modèle, à portée de main. Rien n'est ajouté chez les clients et aucun paquet ne part tant que personne ne clique.
- Clic gauche toujours. Clic droit seulement avec un objet en main ou un bloc visé : sans cela le client n'envoie rien au serveur.
- Accroupi, le compagnon ne tourne plus avec le regard : le joueur peut se tourner vers lui pour le viser.
- Réglages dans `companion_settings.click` (délai entre deux réactions, hauteur du saut, marge de visée, son par défaut, particule, affichage de la phrase) ; chaque compagnon peut avoir son son (`click.sound`, `click.pitch`).
- Coût d'un saut : 6 images clés par entité du modèle et par joueur qui voit le compagnon, au plus une fois par `cooldown_ticks`.

## Dépendances

- Obligatoires : `packetevents`
- Optionnelles : `PlaceholderAPI`, `SHNetwork`

## Commandes

| Commande | Description | Permission |
|---|---|---|
| `/shcompagnons set <joueur> <type>` | Donne un compagnon et l'enregistre. | `shcompagnons.admin.set` |
| `/shcompagnons unset <joueur>` | Retire le compagnon. | `shcompagnons.admin.unset` |
| `/shcompagnons preview <type> [secondes]` | Essaie un compagnon sur soi (30 s), sans rien enregistrer. | `shcompagnons.admin.preview` |
| `/shcompagnons models` | Liste les modèles importés, leur nombre d'entités (dont animées) et leur taille. | `shcompagnons.admin.reload` |
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
