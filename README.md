<div align="center">

<img src="assets/logo.png" alt="SkyHand" width="140">

# SHCompagnons

*Plugin de compagnons packet-based pour Minecraft.*

<img src="https://img.shields.io/badge/Paper-26.3-f2a900?style=for-the-badge" alt="Paper 26.3"> <img src="https://img.shields.io/badge/Java-25-e76f00?style=for-the-badge" alt="Java 25"> <img src="https://img.shields.io/badge/SkyHand-Opale%20%C2%B7%20Lobby-3aa655?style=for-the-badge" alt="SkyHand Opale · Lobby">

</div>

---

## Présentation

Plugin de compagnons packet-based pour Minecraft.

Utilisé sur : **Opale · Lobby**.

## Dépendances

- Obligatoires : `ProtocolLib`
- Optionnelles : `PlaceholderAPI`

## Commandes

| Commande | Alias | Description | Permission |
|---|---|---|---|
| `/shcompagnons` | `/shc`, `/compagnons` | Commande principale du plugin SHCompagnons. | `shcompagnons.admin` |

## Permissions

| Permission | Description | Par défaut |
|---|---|---|
| `shcompagnons.admin` | Donne accès à toutes les commandes de SHCompagnons. | `op` |
| `shcompagnons.admin.set` | Permet de définir un compagnon à un joueur. | `op` |
| `shcompagnons.admin.unset` | Permet de retirer le compagnon d'un joueur. | `op` |
| `shcompagnons.admin.reload` | Permet de recharger la configuration du plugin. | `op` |

## Configuration

Fichiers par défaut repris du serveur (secrets remplacés par `CHANGE_ME`). Cliquez sur un fichier pour l'ouvrir :

<pre>
plugins/SHCompagnons/
└── <a href="src/main/resources/config.yml">config.yml</a>
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
