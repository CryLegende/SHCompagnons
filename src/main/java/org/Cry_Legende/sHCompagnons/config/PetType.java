package org.Cry_Legende.sHCompagnons.config;

import org.Cry_Legende.sHCompagnons.model.ModelLibrary;
import org.Cry_Legende.sHCompagnons.model.Part;
import org.Cry_Legende.sHCompagnons.pet.Animation;
import org.joml.Quaternionfc;
import org.joml.Vector3fc;

import java.util.List;

/**
 * Un type de compagnon de config.yml, prêt à afficher : pièces du modèle (une tête seule, avec ses textures
 * successives, ou un modèle importé avec ses animations), placement, animation et suivi. radius : demi-taille du
 * modèle en jeu (blocs), pour savoir si le joueur le vise ; clickSound, clickPitch : son joué quand son
 * propriétaire clique dessus (vide : aucun).
 */
public record PetType(
    String key,
    String displayName,
    List<Part> parts,
    Placement placement,
    Animation animation,
    float animationSpeed,
    float animationAmplitude,
    FollowMode follow,
    float radius,
    String clickSound,
    float clickPitch,
    List<ModelLibrary.State> states
) {

    /** Numéro de l'état de ce nom dans le modèle, -1 s'il n'en a pas. */
    public int state(String name) {
        for (int i = 0; i < states.size(); i++) {
            if (states.get(i).name().equals(name)) {
                return i;
            }
        }
        return -1;
    }

    /** Position du modèle autour du joueur : décalage, rotation et échelle uniforme. */
    public record Placement(Vector3fc offset, Quaternionfc rotation, float scale) {
    }

    public enum FollowMode {
        /** Passager du joueur : le client le déplace avec lui, aucun paquet de position. */
        ATTACHED,
        /** Flotte derrière le joueur et le rattrape avec un temps de retard. */
        FREE,
        /** Marche au sol derrière le joueur : s'arrête près de lui, le rejoint quand il s'éloigne. */
        GROUND
    }
}
