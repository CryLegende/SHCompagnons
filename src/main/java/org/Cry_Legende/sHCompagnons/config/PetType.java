package org.Cry_Legende.sHCompagnons.config;

import com.github.retrooper.packetevents.protocol.item.ItemStack;
import org.Cry_Legende.sHCompagnons.model.Part;
import org.Cry_Legende.sHCompagnons.pet.Animation;
import org.joml.Quaternionfc;
import org.joml.Vector3fc;

import java.util.List;

/**
 * Un type de compagnon de config.yml, prêt à afficher : pièces du modèle (une tête seule ou un modèle importé),
 * textures successives d'une tête, placement, animation et suivi.
 */
public record PetType(
    String key,
    String displayName,
    List<Part> parts,
    List<Skin> skins,
    Placement placement,
    Animation animation,
    float animationSpeed,
    float animationAmplitude,
    FollowMode follow
) {

    /** Texture d'une tête et durée d'affichage (ticks, 0 = pas de changement). */
    public record Skin(ItemStack item, int ticks) {
    }

    /** Position du modèle autour du joueur : décalage, rotation et échelle uniforme. */
    public record Placement(Vector3fc offset, Quaternionfc rotation, float scale) {
    }

    public enum FollowMode {
        /** Passager du joueur : le client le déplace avec lui, aucun paquet de position. */
        ATTACHED,
        /** Flotte derrière le joueur et le rattrape avec un temps de retard. */
        FREE
    }

    public boolean cyclesSkins() {
        return skins.size() > 1;
    }
}
