package org.Cry_Legende.sHCompagnons.network;

import org.Cry_Legende.sHNetwork.api.NetPlayer;
import org.Cry_Legende.sHNetwork.api.SHNetworkAPI;

import java.util.Collection;
import java.util.UUID;

/** Pont vers SHNetwork. Cette classe n'est chargée que si SHNetwork est installé. */
public final class ShNetworkPlayers implements RemotePlayers {

    private final SHNetworkAPI api;

    private ShNetworkPlayers() {
        this.api = SHNetworkAPI.get();
    }

    /** Point d'entrée : le plugin ne résout cette classe qu'à cet appel, donc jamais sans SHNetwork. */
    public static RemotePlayers open() {
        return new ShNetworkPlayers();
    }

    @Override
    public Remote find(String name) {
        return api.find(name)
            .filter(p -> !p.server().equals(api.serverName()))
            .map(p -> new Remote(p.uuid(), p.name()))
            .orElse(null);
    }

    @Override
    public Collection<String> names() {
        String here = api.serverName();
        return api.online().stream()
            .filter(p -> !p.server().equals(here))
            .map(NetPlayer::name)
            .toList();
    }

    @Override
    public void runFor(UUID player, String command) {
        api.runFor(player.toString(), command);
    }
}
