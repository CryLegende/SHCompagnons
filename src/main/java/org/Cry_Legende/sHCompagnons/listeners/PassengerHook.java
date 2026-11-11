package org.Cry_Legende.sHCompagnons.listeners;

import com.github.retrooper.packetevents.event.PacketListenerAbstract;
import com.github.retrooper.packetevents.event.PacketListenerPriority;
import com.github.retrooper.packetevents.event.PacketSendEvent;
import com.github.retrooper.packetevents.protocol.packettype.PacketType;
import com.github.retrooper.packetevents.protocol.player.User;
import com.github.retrooper.packetevents.wrapper.play.server.WrapperPlayServerSetPassengers;
import org.Cry_Legende.sHCompagnons.pet.Pet;
import org.Cry_Legende.sHCompagnons.pet.PetManager;

import java.util.Arrays;
import java.util.UUID;

/**
 * Le client remplace toute la liste des passagers d'une entité à chaque paquet : quand le serveur renvoie celle
 * d'un joueur (un autre joueur s'assoit sur sa tête...), le compagnon y est rajouté, sinon il tomberait. Priorité
 * la plus basse : UnlimitedNametags lit ensuite la liste complète et la garde pour ses propres renvois.
 * Paquet rare : un seul test de table pour les autres.
 */
public final class PassengerHook extends PacketListenerAbstract {

    private final PetManager pets;

    public PassengerHook(PetManager pets) {
        super(PacketListenerPriority.LOWEST);
        this.pets = pets;
    }

    @Override
    public void onPacketSend(PacketSendEvent event) {
        if (event.getPacketType() != PacketType.Play.Server.SET_PASSENGERS || !pets.hasAttachedPets()) {
            return;
        }
        User user = event.getUser();
        UUID viewer = user == null ? null : user.getUUID();
        if (viewer == null) {
            return;
        }
        WrapperPlayServerSetPassengers packet = new WrapperPlayServerSetPassengers(event);
        Pet pet = pets.byOwnerEntityId(packet.getEntityId());
        if (pet == null || pet.attachedRoot() < 0 || !pet.shownTo(viewer)) {
            return;
        }
        int root = pet.attachedRoot();
        int[] passengers = packet.getPassengers();
        for (int passenger : passengers) {
            if (passenger == root) {
                return;
            }
        }
        int[] updated = Arrays.copyOf(passengers, passengers.length + 1);
        updated[passengers.length] = root;
        packet.setPassengers(updated);
        event.markForReEncode(true);
    }
}
