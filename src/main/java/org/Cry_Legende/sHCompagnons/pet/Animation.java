package org.Cry_Legende.sHCompagnons.pet;

import org.joml.Vector3f;

/**
 * Animations des compagnons, décrites par images clés : le serveur envoie la prochaine position avec sa durée et
 * le client fait le trajet seul, image par image. Temps en ticks d'animation (multipliés par animation_speed).
 */
public enum Animation {

    /** Immobile. */
    NONE(0, 0),
    /** Rebond vertical rapide (22 ticks). */
    BOUNCING(22, 0),
    /** Montée et descente lentes (70 ticks). */
    GLIDE(70, 5),
    /** GLIDE avec un balancement de côté. */
    GLIDE_WOBBLE(630, 5),
    /** Balancement de côté (126 ticks). */
    WOBBLE_SIDE(126, 7),
    /** Tour complet sur lui-même (80 ticks). */
    SPIN(80, 8);

    /** Position dans l'animation : décalage (blocs, repère du compagnon) et rotation autour de la verticale (degrés). */
    public record Frame(Vector3f offset, float spin) {
        public static final Frame REST = new Frame(new Vector3f(), 0);
    }

    // Rebond : hauteur toutes les 2 ticks, et les instants gardés comme images clés (le reste est en ligne droite)
    private static final float[] BOUNCE = {-0.3f, -0.15f, 0.1f, 0.2f, 0.25f, 0.3f, 0.3f, 0.25f, 0.2f, 0.1f, -0.15f};
    private static final int[] BOUNCE_KEYS = {0, 2, 4, 6, 10, 12, 16, 18, 20};

    private final int cycle;
    private final int step;

    Animation(int cycle, int step) {
        this.cycle = cycle;
        this.step = step;
    }

    public boolean moves() {
        return this != NONE;
    }

    /** Instant de la prochaine image clé après t (t lui-même est une image clé). */
    public double nextKey(double t) {
        if (this == BOUNCING) {
            double base = Math.floor(t / cycle) * cycle;
            double local = t - base;
            for (int key : BOUNCE_KEYS) {
                if (key > local + 1.0e-6) {
                    return base + key;
                }
            }
            return base + cycle;
        }
        return (Math.floor(t / step + 1.0e-6) + 1) * step;
    }

    /** Ramène t dans un cycle pour que le compteur ne grandisse pas sans fin. */
    public double wrap(double t) {
        return cycle == 0 ? 0 : t % cycle;
    }

    public Frame frame(double t, float amplitude) {
        double local = cycle == 0 ? 0 : t % cycle;
        return switch (this) {
            case NONE -> Frame.REST;
            case BOUNCING -> {
                double index = local / 2.0;
                int i = (int) Math.floor(index);
                float from = BOUNCE[i % BOUNCE.length];
                float to = BOUNCE[(i + 1) % BOUNCE.length];
                float y = (float) (from + (to - from) * (index - i));
                yield new Frame(new Vector3f(0, y * amplitude, 0), 0);
            }
            case GLIDE -> new Frame(new Vector3f(0, glide(local) * amplitude, 0), 0);
            case WOBBLE_SIDE -> new Frame(new Vector3f(wobble(local) * amplitude, 0, 0), 0);
            case GLIDE_WOBBLE -> new Frame(new Vector3f(wobble(local) * amplitude, glide(local) * amplitude, 0), 0);
            case SPIN -> new Frame(new Vector3f(), (float) (360.0 * local / cycle));
        };
    }

    private static float glide(double t) {
        return (float) (-0.3 * Math.cos(2 * Math.PI * t / 70.0));
    }

    private static float wobble(double t) {
        return (float) (0.15 * Math.sin(2 * Math.PI * t / 126.0));
    }
}
