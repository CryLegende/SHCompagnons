package org.Cry_Legende.sHCompagnons.model;

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
 * extension). Formats lus : .txt ou .mcfunction (commandes /summon, une par ligne), .yml de BlockDisplayCreator
 * (liste display.spawn-command).
 */
public final class ModelLibrary {

    /** Modèle prêt à afficher : pièces recentrées et taille d'origine (blocs). */
    public record Model(String name, List<Part> parts, Vector3f size) {
    }

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
                List<String> commands = extension.equals("yml")
                    ? YamlConfiguration.loadConfiguration(file).getStringList("display.spawn-command")
                    : SummonImporter.splitCommands(Files.readString(file.toPath(), StandardCharsets.UTF_8));
                if (commands.isEmpty()) {
                    logger.warning("Modèle " + name + " : aucune commande /summon trouvée.");
                    continue;
                }
                List<SummonImporter.RawPart> raw = SummonImporter.parse(commands);
                if (raw.isEmpty()) {
                    logger.warning("Modèle " + name + " : aucune entité d'affichage visible.");
                    continue;
                }
                SummonImporter.Bounds bounds = SummonImporter.bounds(raw);
                List<Part> parts = new ArrayList<>(raw.size());
                for (SummonImporter.RawPart part : SummonImporter.centered(raw, bounds)) {
                    parts.add(Part.of(part));
                }
                library.models.put(key, new Model(key, Collections.unmodifiableList(parts), bounds.size()));
            } catch (IOException | RuntimeException e) {
                logger.log(Level.WARNING, "Modèle " + name + " illisible : " + e.getMessage());
            }
        }
        return library;
    }

    public Model get(String name) {
        return models.get(name.toLowerCase(Locale.ROOT));
    }

    public Map<String, Model> all() {
        return Collections.unmodifiableMap(models);
    }
}
