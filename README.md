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

Le compagnon choisi est enregistré en base (table `player_pets`) et relu à chaque connexion : un joueur le garde d'un serveur à l'autre dès que les serveurs partagent la même base. Avec **SHNetwork** (facultatif), `/shc set` et `/shc unset` atteignent aussi un joueur connecté sur un autre serveur du réseau. Sans SHNetwork, ou avec `reseau.actif: false`, seuls les joueurs du serveur sont atteints.

## Importer un modèle

1. Sur la page du modèle (block-display.com), « Get the command » et copier la ou les commandes `/summon`.
2. Les coller dans `plugins/SHCompagnons/models/<nom>.txt`, une commande par ligne. Un fichier `.yml` de BlockDisplayCreator (`display.spawn-command`) se dépose aussi tel quel.
3. Déclarer le compagnon dans `config.yml` :

```yaml
pets:
  dragon:
    displayname: "&5Dragon"
    model: dragon
    animation: GLIDE
    follow: FREE
    placement:
      scale: 0.25
```

4. `/shc reload`, `/shc models` (taille d'origine de chaque modèle), `/shc preview dragon` pour l'essayer sans l'enregistrer.

Le modèle est recentré automatiquement ; `placement.offset` désigne la position de son centre. Formats lus : transformations en 16 nombres ou en translation/rotations/échelle, passagers imbriqués, plusieurs commandes par modèle, objets à composants (1.20.5+) et anciennes têtes `SkullOwner`, blocs avec propriétés, textes JSON ou SNBT.

## Dépendances

- Obligatoires : `packetevents`
- Optionnelles : `PlaceholderAPI`, `SHNetwork`

## Commandes

| Commande | Description | Permission |
|---|---|---|
| `/shc set <joueur> <type>` | Donne un compagnon et l'enregistre. | `shcompagnons.admin.set` |
| `/shc unset <joueur>` | Retire le compagnon. | `shcompagnons.admin.unset` |
| `/shc preview <type> [secondes]` | Essaie un compagnon sur soi (30 s), sans rien enregistrer. | `shcompagnons.admin.preview` |
| `/shc models` | Liste les modèles importés, leur nombre d'entités et leur taille. | `shcompagnons.admin.reload` |
| `/shc reload` | Recharge `config.yml`, `messages.yml` et `models/`. | `shcompagnons.admin.reload` |

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
