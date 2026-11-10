package org.Cry_Legende.sHCompagnons.network;

import java.util.Collection;
import java.util.UUID;

/**
 * Joueurs connectés sur un autre serveur du réseau. Seule {@link ShNetworkPlayers} connaît SHNetwork : sans lui,
 * aucune classe de ce paquet n'est chargée.
 */
public interface RemotePlayers {

    /** Joueur d'un autre serveur. */
    record Remote(UUID uuid, String name) {
    }

    /** Joueur connecté sur un autre serveur (casse ignorée), ou null s'il n'y en a pas. */
    Remote find(String name);

    /** Pseudos des joueurs connectés sur les autres serveurs. */
    Collection<String> names();

    /** Exécute la commande par la console du serveur où se trouve le joueur, une seule fois. */
    void runFor(UUID player, String command);
}
