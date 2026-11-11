package org.Cry_Legende.sHCompagnons.model;

import org.joml.Matrix4f;
import org.joml.Quaternionf;
import org.joml.Vector3f;
import org.joml.Vector3fc;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Lit les commandes /summon exportées par block-display.com (BDEngine) : entité racine, ses passagers (récursifs),
 * leurs transformations (16 nombres ou translation/rotations/échelle). Ne touche à rien du serveur : le résultat
 * est une liste d'entités d'affichage dont l'origine commune est celle de la première commande.
 */
public final class SummonImporter {

    /** Entité d'affichage lue : type (item_display, block_display, text_display), transformation, données brutes. */
    public record RawPart(String type, Affine transform, Snbt.Compound data) {
    }

    /** Boîte englobante d'un modèle (blocs). */
    public record Bounds(Vector3f min, Vector3f max) {
        public Vector3f size() {
            return new Vector3f(max).sub(min);
        }

        public Vector3f center() {
            return new Vector3f(min).add(max).mul(0.5f);
        }
    }

    private SummonImporter() {
    }

    /**
     * Découpe un texte en commandes : chaque ligne qui commence par summon ou /summon ouvre une commande, les lignes
     * suivantes (hors commentaires #) la prolongent.
     */
    public static List<String> splitCommands(String content) {
        List<String> commands = new ArrayList<>();
        StringBuilder current = null;
        for (String line : content.split("\\R")) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                continue;
            }
            String lower = trimmed.toLowerCase(Locale.ROOT);
            if (lower.startsWith("summon ") || lower.startsWith("/summon ") || lower.startsWith("minecraft:summon ")) {
                if (current != null) {
                    commands.add(current.toString());
                }
                current = new StringBuilder(trimmed);
            } else if (current != null) {
                current.append(' ').append(trimmed);
            }
        }
        if (current != null) {
            commands.add(current.toString());
        }
        return commands;
    }

    public static List<RawPart> parse(List<String> commands) {
        List<RawPart> parts = new ArrayList<>();
        double[] origin = null;
        for (String command : commands) {
            Parsed parsed = parseCommand(command);
            if (origin == null) {
                origin = parsed.position;
            }
            Vector3f offset = new Vector3f(
                (float) (parsed.position[0] - (parsed.relative[0] ? 0 : origin[0])),
                (float) (parsed.position[1] - (parsed.relative[1] ? 0 : origin[1])),
                (float) (parsed.position[2] - (parsed.relative[2] ? 0 : origin[2])));
            walk(parsed.root, offset, parts, 0);
        }
        return parts;
    }

    private record Parsed(Snbt.Compound root, double[] position, boolean[] relative) {
    }

    private static Parsed parseCommand(String command) {
        String text = command.trim();
        if (text.startsWith("/")) {
            text = text.substring(1);
        }
        int[] cursor = {0};
        String keyword = token(text, cursor);
        if (!keyword.equalsIgnoreCase("summon") && !keyword.equalsIgnoreCase("minecraft:summon")) {
            throw new IllegalArgumentException("commande /summon attendue");
        }
        String entity = token(text, cursor);
        double[] position = new double[3];
        boolean[] relative = new boolean[3];
        for (int i = 0; i < 3; i++) {
            skipSpaces(text, cursor);
            if (cursor[0] >= text.length() || text.charAt(cursor[0]) == '{') {
                relative[i] = true;
                continue;
            }
            String coordinate = token(text, cursor);
            if (coordinate.startsWith("~") || coordinate.startsWith("^")) {
                relative[i] = true;
                position[i] = coordinate.length() > 1 ? Double.parseDouble(coordinate.substring(1)) : 0.0;
            } else {
                position[i] = Double.parseDouble(coordinate);
            }
        }
        skipSpaces(text, cursor);
        Snbt.Compound root;
        if (cursor[0] < text.length()) {
            Object value = Snbt.read(text, cursor[0]).value();
            if (!(value instanceof Snbt.Compound compound)) {
                throw new IllegalArgumentException("données de l'entité attendues entre { }");
            }
            root = compound;
        } else {
            root = new Snbt.Compound();
        }
        root.putIfAbsent("id", entity);
        return new Parsed(root, position, relative);
    }

    private static void walk(Snbt.Compound entity, Vector3f offset, List<RawPart> out, int depth) {
        if (depth > 32) {
            throw new IllegalArgumentException("passagers imbriqués trop profondément");
        }
        String type = entityType(entity.string("id"));
        if (type != null && renders(type, entity)) {
            out.add(new RawPart(type, transformation(entity).shifted(offset), entity));
        }
        List<?> passengers = entity.list("Passengers");
        if (passengers != null) {
            for (Object passenger : passengers) {
                if (passenger instanceof Snbt.Compound compound) {
                    walk(compound, offset, out, depth + 1);
                }
            }
        }
    }

    private static String entityType(String id) {
        if (id == null) {
            return null;
        }
        String name = id.toLowerCase(Locale.ROOT);
        if (name.startsWith("minecraft:")) {
            name = name.substring("minecraft:".length());
        }
        return switch (name) {
            case "item_display", "block_display", "text_display" -> name;
            default -> null;
        };
    }

    private static boolean renders(String type, Snbt.Compound entity) {
        switch (type) {
            case "block_display": {
                Snbt.Compound state = entity.compound("block_state");
                String name = state == null ? null : state.string("Name");
                return name != null && !name.endsWith("air");
            }
            case "item_display": {
                Snbt.Compound item = entity.compound("item");
                String id = item == null ? null : item.string("id");
                return id != null && !id.endsWith("air");
            }
            default:
                return entity.containsKey("text");
        }
    }

    static Affine transformation(Snbt.Compound entity) {
        Object value = entity.get("transformation");
        if (value instanceof List<?> list && list.size() == 16) {
            float[] m = new float[16];
            for (int i = 0; i < 16; i++) {
                m[i] = ((Number) list.get(i)).floatValue();
            }
            // Ordre des 16 nombres : ligne par ligne
            Matrix4f matrix = new Matrix4f(
                m[0], m[4], m[8], m[12],
                m[1], m[5], m[9], m[13],
                m[2], m[6], m[10], m[14],
                m[3], m[7], m[11], m[15]);
            return Affine.of(matrix);
        }
        if (value instanceof Snbt.Compound c) {
            return new Affine(
                vector(c.get("translation"), new Vector3f()),
                rotation(c.get("left_rotation")),
                vector(c.get("scale"), new Vector3f(1, 1, 1)),
                rotation(c.get("right_rotation")));
        }
        return Affine.IDENTITY;
    }

    private static Vector3f vector(Object value, Vector3f fallback) {
        if (value instanceof List<?> list && list.size() == 3) {
            return new Vector3f(((Number) list.get(0)).floatValue(), ((Number) list.get(1)).floatValue(), ((Number) list.get(2)).floatValue());
        }
        return fallback;
    }

    private static Quaternionf rotation(Object value) {
        if (value instanceof List<?> list && list.size() == 4) {
            return new Quaternionf(((Number) list.get(0)).floatValue(), ((Number) list.get(1)).floatValue(),
                ((Number) list.get(2)).floatValue(), ((Number) list.get(3)).floatValue()).normalize();
        }
        if (value instanceof Snbt.Compound c && c.number("angle") != null) {
            Vector3f axis = vector(c.get("axis"), new Vector3f(0, 1, 0)).normalize();
            return new Quaternionf().fromAxisAngleRad(axis, c.number("angle").floatValue());
        }
        return new Quaternionf();
    }

    /**
     * Boîte englobante approximative : cube 0..1 pour un bloc, tête réelle pour une tête de joueur affichée sans
     * contexte (cas des exports block-display.com), cube centré de côté 1 pour un autre objet ; les textes ne
     * comptent pas.
     */
    public static Bounds bounds(List<RawPart> parts) {
        Vector3f min = new Vector3f(Float.POSITIVE_INFINITY);
        Vector3f max = new Vector3f(Float.NEGATIVE_INFINITY);
        boolean any = false;
        for (RawPart part : parts) {
            Vector3f low;
            Vector3f high;
            if (part.type().equals("block_display")) {
                low = new Vector3f(0, 0, 0);
                high = new Vector3f(1, 1, 1);
            } else if (part.type().equals("item_display")) {
                if (isBareHead(part.data())) {
                    low = new Vector3f(-0.25f, -0.5f, -0.25f);
                    high = new Vector3f(0.25f, 0, 0.25f);
                } else {
                    low = new Vector3f(-0.5f);
                    high = new Vector3f(0.5f);
                }
            } else {
                continue;
            }
            Matrix4f matrix = part.transform().toMatrix();
            for (int i = 0; i < 8; i++) {
                Vector3f corner = new Vector3f((i & 1) == 0 ? low.x : high.x, (i & 2) == 0 ? low.y : high.y, (i & 4) == 0 ? low.z : high.z);
                matrix.transformPosition(corner);
                min.min(corner);
                max.max(corner);
                any = true;
            }
        }
        if (!any) {
            return new Bounds(new Vector3f(), new Vector3f());
        }
        return new Bounds(min, max);
    }

    /** Tête de joueur rendue sans transformation d'objet (contexte none ou head) : de -0,5 à 0 en hauteur. */
    private static boolean isBareHead(Snbt.Compound entity) {
        Snbt.Compound item = entity.compound("item");
        String id = item == null ? null : item.string("id");
        if (id == null || !id.endsWith("player_head")) {
            return false;
        }
        String context = entity.string("item_display");
        return context == null || context.equals("none") || context.equals("head");
    }

    /** Recentre les pièces sur le milieu de la boîte englobante. */
    public static List<RawPart> centered(List<RawPart> parts, Bounds bounds) {
        Vector3fc shift = bounds.center().negate();
        List<RawPart> out = new ArrayList<>(parts.size());
        for (RawPart part : parts) {
            out.add(new RawPart(part.type(), part.transform().shifted(shift), part.data()));
        }
        return out;
    }

    private static String token(String text, int[] cursor) {
        skipSpaces(text, cursor);
        int start = cursor[0];
        while (cursor[0] < text.length() && !Character.isWhitespace(text.charAt(cursor[0])) && text.charAt(cursor[0]) != '{') {
            cursor[0]++;
        }
        return text.substring(start, cursor[0]);
    }

    private static void skipSpaces(String text, int[] cursor) {
        while (cursor[0] < text.length() && Character.isWhitespace(text.charAt(cursor[0]))) {
            cursor[0]++;
        }
    }
}
