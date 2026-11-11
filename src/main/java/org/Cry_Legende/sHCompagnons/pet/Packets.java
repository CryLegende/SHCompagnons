package org.Cry_Legende.sHCompagnons.pet;

import com.github.retrooper.packetevents.PacketEvents;
import com.github.retrooper.packetevents.protocol.player.User;
import com.github.retrooper.packetevents.wrapper.PacketWrapper;
import io.github.retrooper.packetevents.util.SpigotReflectionUtil;
import org.bukkit.entity.Player;

import java.util.List;

/**
 * Envoi des paquets : tous écrits à la suite puis envoyés d'un bloc. Un joueur en cours de déconnexion est ignoré.
 */
final class Packets {

    private Packets() {
    }

    static int newEntityId() {
        return SpigotReflectionUtil.generateEntityId();
    }

    /**
     * Envoie la liste à un joueur. Les paquets marqués « visibles » passent par les écouteurs des autres plugins
     * (packetevents) : c'est le cas de la liste des passagers du joueur, qu'UnlimitedNametags complète avec ses
     * pseudos ; tous les autres sont envoyés tels quels.
     */
    static void send(Player viewer, List<PacketWrapper<?>> packets, PacketWrapper<?> visible) {
        try {
            User user = PacketEvents.getAPI().getPlayerManager().getUser(viewer);
            if (user == null) {
                return;
            }
            for (PacketWrapper<?> packet : packets) {
                if (packet == visible) {
                    user.writePacket(packet);
                } else {
                    user.writePacketSilently(packet);
                }
            }
            user.flushPackets();
        } catch (RuntimeException ignored) {
            // joueur en cours de déconnexion
        }
    }

    static void send(Player viewer, List<PacketWrapper<?>> packets) {
        send(viewer, packets, null);
    }
}
