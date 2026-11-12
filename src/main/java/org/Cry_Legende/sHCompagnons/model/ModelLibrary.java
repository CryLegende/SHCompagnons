package org.Cry_Legende.sHCompagnons.model;

import com.github.retrooper.packetevents.protocol.entity.data.EntityData;
import org.bukkit.configuration.file.YamlConfiguration;
import org.joml.Vector3f;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Modèles importés du dossier models/ : un fichier par modèle, nommé d'après le fichier (minuscules, sans
 * extension). Formats lus : .txt ou .mcfunction (commandes /summon, une par ligne, puis animations éventuelles en
 * lignes @animation et @pose), .yml de BlockDisplayCreator (liste display.spawn-command).
 */
public final class ModelLibrary {

    /** Modèle prêt à afficher : pièces recentrées et taille d'origine (blocs). */
    public record Model(String name, List<Part> parts, Vector3f size) {

        /** Nombre de pièces qui ont leur propre animation (mouvement ou changement d'apparence). */
        public int animatedParts() {
            int count = 0;
            for (Part part : parts) {
                if (part.track() != null || part.looks() != null) {
                    count++;
                }
            }
            return count;
        }
    }

    /** Taille maximale d'un modèle (blocs, avant placement.scale). */
    private static final float MAX_SIZE = 64;

    private final Map<String, Model> models = new TreeMap<>();

    public static ModelLibrary load(File folder, Logger logger) {
        ModelLibrary library = new ModelLibrary();
        if (!folder.isDirectory() && !folder.mkdirs()) {
            logger.warning("Impossible de créer le dossier " + folder);
            return library;
        }
        File[] files = folder.listFiles();
        if (files == null) {
            return library;
        }
        for (File file : files) {
            String name = file.getName();
            int dot = name.lastIndexOf('.');
            if (!file.isFile() || dot <= 0) {
                continue;
            }
            String extension = name.substring(dot + 1).toLowerCase(Locale.ROOT);
            if (!extension.equals("txt") && !extension.equals("mcfunction") && !extension.equals("yml")) {
                continue;
            }
            String key = name.substring(0, dot).toLowerCase(Locale.ROOT);
            try {
                SummonImporter.Source source = extension.equals("yml")
                    ? new SummonImporter.Source(YamlConfiguration.loadConfiguration(file).getStringList("display.spawn-command"), List.of())
                    : SummonImporter.split(Files.readString(file.toPath(), StandardCharsets.UTF_8));
                if (source.base().isEmpty()) {
                    logger.warning("Modèle " + name + " : aucune commande /summon trouvée.");
                    continue;
                }
                List<SummonImporter.RawPart> raw = SummonImporter.parse(source.base());
                if (raw.isEmpty()) {
                    logger.warning("Modèle " + name + " : aucune entité d'affichage visible.");
                    continue;
                }
                SummonImporter.Bounds bounds = SummonImporter.bounds(raw);
                Vector3f size = bounds.size();
                float largest = Math.max(size.x, Math.max(size.y, size.z));
                if (largest > MAX_SIZE) {
                    // Certains modèles BDEngine étirent une tête sur des milliers de blocs pour n'en montrer qu'une
                    // face : leur centre ne veut plus rien dire et la tête traverse le monde
                    logger.warning("Modèle " + name + " : une entité s'étend sur " + Math.round(largest) + " blocs (tête étirée pour n'en montrer qu'une face), modèle ignoré.");
                    continue;
                }
                List<SummonImporter.RawPart> centered = SummonImporter.centered(raw, bounds);
                List<Part> parts = new ArrayList<>(raw.size());
                for (SummonImporter.RawPart part : centered) {
                    parts.add(Part.of(part));
                }
                for (SummonImporter.Clip clip : source.clips()) {
                    animate(parts, centered, bounds, clip, name, logger);
                }
                library.models.put(key, new Model(key, Collections.unmodifiableList(parts), bounds.size()));
            } catch (IOException | RuntimeException e) {
                logger.log(Level.WARNING, "Modèle " + name + " illisible : " + e.getMessage());
            }
        }
        return library;
    }

    /**
     * Ajoute une animation aux pièces qu'elle fait bouger ou changer d'apparence. Chaque pose décrit le modèle entier,
     * pièces dans le même ordre que la pose de base. Une pièce peut bouger dans une animation et changer d'apparence
     * dans une autre, chacune à son rythme.
     */
    private static void animate(List<Part> parts, List<SummonImporter.RawPart> base, SummonImporter.Bounds bounds,
                                SummonImporter.Clip clip, String name, Logger logger) {
        int count = clip.poses().size() + 1;
        int[] ticks = new int[count];
        List<List<SummonImporter.RawPart>> poses = new ArrayList<>(count);
        poses.add(base);
        for (int k = 1; k < count; k++) {
            SummonImporter.Pose pose = clip.poses().get(k - 1);
            ticks[k] = pose.tick();
            if (ticks[k] <= ticks[k - 1] || ticks[k] >= clip.loop()) {
                throw new IllegalArgumentException("@pose " + pose.tick() + " : les poses doivent se suivre dans l'ordre, avant la fin du cycle (" + clip.loop() + " ticks)");
            }
            List<SummonImporter.RawPart> raw = SummonImporter.centered(SummonImporter.parse(pose.commands()), bounds);
            if (raw.size() != base.size()) {
                throw new IllegalArgumentException("@pose " + pose.tick() + " : " + raw.size() + " entités au lieu de " + base.size());
            }
            poses.add(raw);
        }
        for (int i = 0; i < parts.size(); i++) {
            Affine[] transforms = new Affine[count];
            EntityData<?>[] looks = new EntityData<?>[count];
            String[] lookIds = new String[count];
            lookIds[0] = Part.lookId(base.get(i));
            looks[0] = parts.get(i).staticData().getFirst();
            transforms[0] = parts.get(i).transform();
            for (int k = 1; k < count; k++) {
                SummonImporter.RawPart raw = poses.get(k).get(i);
                if (!raw.type().equals(base.get(i).type())) {
                    throw new IllegalArgumentException("@pose " + ticks[k] + " : l'entité n°" + (i + 1) + " n'est plus du même type");
                }
                transforms[k] = raw.transform();
                lookIds[k] = Part.lookId(raw);
                int same = 0;
                while (!lookIds[same].equals(lookIds[k])) {
                    same++;
                }
                looks[k] = same < k ? looks[same] : Part.look(raw);
            }
            Track track = Track.of(clip.loop(), ticks, transforms);
            if (track != null) {
                if (parts.get(i).track() == null) {
                    parts.set(i, parts.get(i).withTrack(track));
                } else {
                    logger.warning("Modèle " + name + " : l'entité n°" + (i + 1) + " bouge dans deux animations, la première est gardée.");
                }
            }
            Looks cycle = Looks.of(clip.loop(), ticks, looks, lookIds);
            if (cycle != null) {
                if (parts.get(i).looks() == null) {
                    parts.set(i, parts.get(i).withLooks(cycle));
                } else {
                    logger.warning("Modèle " + name + " : l'entité n°" + (i + 1) + " change d'apparence dans deux animations, la première est gardée.");
                }
            }
        }
    }

    public Model get(String name) {
        return models.get(name.toLowerCase(Locale.ROOT));
    }

    public Map<String, Model> all() {
        return Collections.unmodifiableMap(models);
    }
}
