package org.Cry_Legende.sHCompagnons.config;

import io.github.retrooper.packetevents.util.SpigotConversionUtil;
import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.Cry_Legende.sHCompagnons.model.ModelLibrary;
import org.Cry_Legende.sHCompagnons.model.Part;
import org.Cry_Legende.sHCompagnons.pet.Animation;
import org.bukkit.ChatColor;
import org.bukkit.command.CommandSender;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.InvalidConfigurationException;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.joml.Quaternionf;
import org.joml.Vector3f;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;

public class ConfigManager {

    /** Réglages communs à tous les compagnons (section companion_settings). */
    public record Settings(
        PetType.Placement placement,
        PetType.FollowMode follow,
        int freeUpdateTicks,
        float freeCatchUp,
        double freeTeleportDistance,
        float turnThreshold,
        int turnInterval,
        int turnSmoothing,
        int turnPartsPerTick,
        int maxModelParts,
        boolean showToOwner,
        int joinDelayTicks
    ) {
    }

    // Placement par défaut : même tête, même taille et même place qu'avec l'ancien porte-armure
    private static final double[] DEFAULT_OFFSET = {0.887, -0.17, -0.275};
    private static final double DEFAULT_YAW = -10.0;
    private static final double DEFAULT_SCALE = 0.5;

    private final SHCompagnons plugin;
    private FileConfiguration config;
    private final Map<String, PetType> petTypes = new LinkedHashMap<>();
    // Clés de la section pets, chargées ou non (modèle absent, trop lourd, illisible...)
    private final Set<String> declaredPets = new java.util.HashSet<>();
    private ModelLibrary models = new ModelLibrary();
    private Settings settings;

    // Database
    private String storageType;
    private String dbHost;
    private int dbPort;
    private String dbName;
    private String dbUser;
    private String dbPass;
    private boolean dbUseSSL;
    private Map<String, String> dbProperties;

    // Messages
    private final Map<String, String> messages = new HashMap<>();
    private String messagePrefix = "";

    public ConfigManager(@NotNull SHCompagnons plugin) {
        this.plugin = plugin;
        plugin.saveDefaultConfig();
    }

    /** Fichier de configuration refusé par {@link #validate()} (file null : aucun compagnon défini) et cause. */
    public record Problem(@Nullable String file, @NotNull String reason) {
    }

    /**
     * Lit config.yml et messages.yml en mode strict, sans rien remplacer. Rend le fichier invalide et la cause, ou
     * null si tout se lit. Refuse aussi un config.yml sans aucun compagnon dans « pets » quand des compagnons sont
     * chargés : un reload ne doit pas retirer le compagnon de tous les joueurs en ligne.
     */
    @Nullable
    public Problem validate() {
        YamlConfiguration parsedConfig = null;
        for (String name : new String[] {"config.yml", "messages.yml"}) {
            File file = new File(plugin.getDataFolder(), name);
            if (!file.exists()) {
                continue;
            }
            YamlConfiguration yaml = new YamlConfiguration();
            try {
                yaml.load(file);
            } catch (IOException | InvalidConfigurationException e) {
                Throwable cause = e.getCause() != null ? e.getCause() : e;
                String text = String.valueOf(cause.getMessage()).replaceAll("\\s+", " ").trim();
                return new Problem(name, text.length() > 200 ? text.substring(0, 200) + "..." : text);
            }
            if (name.equals("config.yml")) {
                parsedConfig = yaml;
            }
        }
        if (parsedConfig != null && !petTypes.isEmpty()) {
            ConfigurationSection pets = parsedConfig.getConfigurationSection("pets");
            if (pets == null || pets.getKeys(false).isEmpty()) {
                return new Problem(null, "config.yml : aucun compagnon dans la section pets");
            }
        }
        return null;
    }

    public void loadConfig() {
        plugin.reloadConfig();
        this.config = plugin.getConfig();
        petTypes.clear();
        declaredPets.clear();
        messages.clear();

        this.storageType = config.getString("database.type", "SQLITE").toUpperCase(Locale.ROOT);
        this.dbHost = config.getString("database.mysql.host", "localhost");
        this.dbPort = config.getInt("database.mysql.port", 3306);
        this.dbName = config.getString("database.mysql.database", "shcompagnons_db");
        this.dbUser = config.getString("database.mysql.username", "root");
        this.dbPass = config.getString("database.mysql.password", "");
        this.dbUseSSL = config.getBoolean("database.mysql.useSSL", false);
        this.dbProperties = new HashMap<>();
        ConfigurationSection propsSection = config.getConfigurationSection("database.mysql.properties");
        if (propsSection != null) {
            for (String key : propsSection.getKeys(false)) {
                dbProperties.put(key, propsSection.getString(key));
            }
        }

        this.settings = readSettings(config.getConfigurationSection("companion_settings"));
        loadMessages();
        plugin.saveBundledModels();
        this.models = ModelLibrary.load(new File(plugin.getDataFolder(), "models"), plugin.getLogger());
        loadPets();
    }

    private Settings readSettings(@Nullable ConfigurationSection section) {
        if (section == null) {
            section = new YamlConfiguration();
        }
        PetType.Placement defaults = new PetType.Placement(
            new Vector3f((float) DEFAULT_OFFSET[0], (float) DEFAULT_OFFSET[1], (float) DEFAULT_OFFSET[2]),
            new Quaternionf().rotationY((float) Math.toRadians(DEFAULT_YAW)),
            (float) DEFAULT_SCALE);
        PetType.Placement placement = readPlacement(section.getConfigurationSection("placement"), defaults);
        PetType.FollowMode follow = readFollow(section.getString("follow"), PetType.FollowMode.ATTACHED, "companion_settings");
        return new Settings(
            placement,
            follow,
            Math.max(1, section.getInt("free_follow.update_ticks", 2)),
            (float) clamp(section.getDouble("free_follow.catch_up", 0.35), 0.01, 1.0),
            Math.max(1.0, section.getDouble("free_follow.teleport_distance", 16.0)),
            (float) Math.max(0.5, section.getDouble("turn.threshold_degrees", 2.0)),
            Math.max(1, section.getInt("turn.min_interval_ticks", 2)),
            Math.max(0, section.getInt("turn.smoothing_ticks", 3)),
            Math.max(1, section.getInt("turn.max_parts_per_tick", 4)),
            Math.max(1, section.getInt("max_model_parts", 12)),
            section.getBoolean("show_to_owner", true),
            Math.max(1, section.getInt("join_delay_ticks", 20)));
    }

    /** Placement d'une section (absente : les valeurs par défaut) ; chaque clé absente garde la valeur par défaut. */
    private PetType.Placement readPlacement(@Nullable ConfigurationSection section, PetType.Placement defaults) {
        if (section == null) {
            return defaults;
        }
        Vector3f offset = new Vector3f(defaults.offset());
        ConfigurationSection offsetSection = section.getConfigurationSection("offset");
        if (offsetSection != null) {
            offset.set(
                (float) offsetSection.getDouble("x", offset.x),
                (float) offsetSection.getDouble("y", offset.y),
                (float) offsetSection.getDouble("z", offset.z));
        }
        Quaternionf rotation = new Quaternionf(defaults.rotation());
        ConfigurationSection rotationSection = section.getConfigurationSection("rotation");
        if (rotationSection != null) {
            rotation.rotationYXZ(
                (float) Math.toRadians(rotationSection.getDouble("y", 0)),
                (float) Math.toRadians(rotationSection.getDouble("x", 0)),
                (float) Math.toRadians(rotationSection.getDouble("z", 0)));
        }
        float scale = (float) section.getDouble("scale", defaults.scale());
        if (scale <= 0) {
            plugin.getLogger().warning("placement.scale doit être positif, " + defaults.scale() + " gardé.");
            scale = defaults.scale();
        }
        return new PetType.Placement(offset, rotation, scale);
    }

    private PetType.FollowMode readFollow(@Nullable String value, PetType.FollowMode fallback, String where) {
        if (value == null) {
            return fallback;
        }
        try {
            return PetType.FollowMode.valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            plugin.getLogger().warning("follow invalide '" + value + "' (" + where + "), " + fallback + " gardé.");
            return fallback;
        }
    }

    private void loadPets() {
        ConfigurationSection petsSection = config.getConfigurationSection("pets");
        if (petsSection == null) {
            plugin.getLogger().warning("Aucune section 'pets' dans config.yml : aucun compagnon disponible.");
            return;
        }
        Map<String, com.github.retrooper.packetevents.protocol.item.ItemStack> heads = new HashMap<>();
        for (String key : petsSection.getKeys(false)) {
            declaredPets.add(key.toLowerCase(Locale.ROOT));
            ConfigurationSection section = petsSection.getConfigurationSection(key);
            if (section == null) {
                plugin.getLogger().warning("Compagnon '" + key + "' : section invalide, ignoré.");
                continue;
            }
            try {
                PetType type = readPet(key, section, heads);
                if (type != null) {
                    petTypes.put(key.toLowerCase(Locale.ROOT), type);
                }
            } catch (RuntimeException e) {
                plugin.getLogger().log(Level.WARNING, "Compagnon '" + key + "' illisible : " + e.getMessage());
            }
        }
        plugin.getLogger().info(petTypes.size() + " compagnon(s) et " + models.all().size() + " modèle(s) importé(s) chargés.");
    }

    @Nullable
    private PetType readPet(String key, ConfigurationSection section, Map<String, com.github.retrooper.packetevents.protocol.item.ItemStack> heads) {
        String displayName = ChatColor.translateAlternateColorCodes('&', section.getString("displayname", key));
        Animation animation = Animation.NONE;
        String animationName = section.getString("animation", "NONE").toUpperCase(Locale.ROOT);
        try {
            animation = Animation.valueOf(animationName);
        } catch (IllegalArgumentException e) {
            plugin.getLogger().warning("Compagnon '" + key + "' : animation inconnue '" + animationName + "', NONE gardé.");
        }
        float speed = (float) section.getDouble("animation_speed", 1.0);
        if (speed <= 0) {
            speed = 1.0f;
        }
        float amplitude = (float) section.getDouble("animation_amplitude", 1.0);
        PetType.FollowMode follow = readFollow(section.getString("follow"), settings.follow(), "compagnon " + key);
        PetType.Placement placement = readPlacement(section.getConfigurationSection("placement"), settings.placement());

        String modelName = section.getString("model");
        if (modelName != null) {
            ModelLibrary.Model model = models.get(modelName);
            if (model == null) {
                plugin.getLogger().warning("Compagnon '" + key + "' : modèle '" + modelName + "' introuvable dans models/, compagnon ignoré.");
                return null;
            }
            if (model.parts().size() > settings.maxModelParts()) {
                plugin.getLogger().warning("Compagnon '" + key + "' : le modèle '" + modelName + "' a " + model.parts().size()
                    + " entités, plus que companion_settings.max_model_parts (" + settings.maxModelParts() + "), compagnon ignoré.");
                return null;
            }
            return new PetType(key, displayName, model.parts(), List.of(), placement, animation, speed, amplitude, follow);
        }

        List<PetType.Skin> skins = readSkins(key, section, heads);
        if (skins.isEmpty()) {
            plugin.getLogger().warning("Compagnon '" + key + "' : ni model, ni skin, ni skins valides, compagnon ignoré.");
            return null;
        }
        return new PetType(key, displayName, List.of(Part.head(skins.getFirst().item())), Collections.unmodifiableList(skins),
            placement, animation, speed, amplitude, follow);
    }

    /** Textures d'une tête : « skin » (une seule) ou « skins » (liste de textures, chacune avec sa durée éventuelle). */
    private List<PetType.Skin> readSkins(String key, ConfigurationSection section, Map<String, com.github.retrooper.packetevents.protocol.item.ItemStack> heads) {
        int globalInterval = section.getInt("skin_update_interval", 0);
        List<PetType.Skin> skins = new ArrayList<>();
        if (section.isList("skins")) {
            List<?> raw = section.getList("skins");
            if (raw != null) {
                for (Object entry : raw) {
                    String value = null;
                    int interval = globalInterval;
                    if (entry instanceof String s) {
                        value = s;
                    } else if (entry instanceof Map<?, ?> map) {
                        Object v = map.get("value");
                        value = v instanceof String s ? s : null;
                        if (map.get("skin_update_interval") instanceof Number n) {
                            interval = n.intValue();
                        }
                    }
                    if (value == null || value.isBlank()) {
                        plugin.getLogger().warning("Compagnon '" + key + "' : entrée de skins sans texture, ignorée.");
                        continue;
                    }
                    skins.add(new PetType.Skin(head(value.trim(), heads), Math.max(0, interval)));
                }
            }
        } else if (section.isString("skin")) {
            String value = section.getString("skin");
            if (value != null && !value.isBlank()) {
                skins.add(new PetType.Skin(head(value.trim(), heads), 0));
            }
        }
        return skins;
    }

    private com.github.retrooper.packetevents.protocol.item.ItemStack head(String texture, Map<String, com.github.retrooper.packetevents.protocol.item.ItemStack> heads) {
        return heads.computeIfAbsent(texture, t -> SpigotConversionUtil.fromBukkitItemStack(Part.head(t)));
    }

    private static double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Messages lus dans messages.yml. S'il n'existe pas encore, il est créé à partir de l'ancienne section
     * « messages » de config.yml quand elle existe (textes déjà personnalisés gardés), sinon depuis le jar.
     * Les clés absentes du fichier prennent la valeur du jar.
     */
    private void loadMessages() {
        File file = new File(plugin.getDataFolder(), "messages.yml");
        if (!file.exists()) {
            ConfigurationSection legacy = config.getConfigurationSection("messages");
            if (legacy != null) {
                YamlConfiguration migrated = new YamlConfiguration();
                for (String key : legacy.getKeys(false)) {
                    migrated.set(key, legacy.get(key));
                }
                try {
                    migrated.save(file);
                    plugin.getLogger().info("Messages repris de config.yml dans messages.yml.");
                } catch (IOException e) {
                    plugin.getLogger().log(Level.SEVERE, "Impossible d'écrire messages.yml", e);
                }
            } else {
                plugin.saveResource("messages.yml", false);
            }
        }
        YamlConfiguration messagesFile = YamlConfiguration.loadConfiguration(file);
        InputStream bundled = plugin.getResource("messages.yml");
        if (bundled != null) {
            messagesFile.setDefaults(YamlConfiguration.loadConfiguration(new InputStreamReader(bundled, StandardCharsets.UTF_8)));
            messagesFile.options().copyDefaults(true);
        }
        this.messagePrefix = ChatColor.translateAlternateColorCodes('&', messagesFile.getString("prefix", ""));
        for (String key : messagesFile.getKeys(true)) {
            if (messagesFile.isString(key)) {
                messages.put(key, messagesFile.getString(key));
            }
        }
    }

    @NotNull
    public String getMessage(@NotNull String key, @Nullable Map<String, String> placeholders, boolean applyPrefix) {
        String rawMessage = messages.getOrDefault(key, "&cMessage manquant: " + key);
        if (rawMessage.isEmpty()) {
            return "";
        }
        String message = rawMessage;
        if (applyPrefix && !this.messagePrefix.isEmpty()) {
            if (message.contains("{prefix}")) {
                message = message.replace("{prefix}", this.messagePrefix);
            } else {
                message = this.messagePrefix + message;
            }
        } else {
            message = message.replace("{prefix}", "");
        }
        if (placeholders != null) {
            for (Map.Entry<String, String> entry : placeholders.entrySet()) {
                message = message.replace(entry.getKey(), entry.getValue() != null ? entry.getValue() : "");
            }
        }
        message = message.replaceAll("\\{[^}]+\\}", "");
        return ChatColor.translateAlternateColorCodes('&', message.trim());
    }

    @NotNull
    public String getMessage(@NotNull String key, @Nullable Map<String, String> placeholders) {
        return getMessage(key, placeholders, true);
    }

    @NotNull
    public String getMessage(@NotNull String key) {
        return getMessage(key, null, true);
    }

    public void sendMessage(@NotNull CommandSender recipient, @NotNull String key, @Nullable Map<String, String> placeholders, boolean applyPrefix) {
        String raw = messages.get(key);
        if (raw == null) {
            recipient.sendMessage(ChatColor.RED + "Message de configuration manquant pour la clé: " + key);
            return;
        }
        if (raw.isEmpty()) {
            return;
        }
        String formatted = getMessage(key, placeholders, applyPrefix);
        if (!formatted.isEmpty()) {
            recipient.sendMessage(formatted);
        }
    }

    public void sendMessage(@NotNull CommandSender recipient, @NotNull String key, @Nullable Map<String, String> placeholders) {
        sendMessage(recipient, key, placeholders, true);
    }

    public void sendMessage(@NotNull CommandSender recipient, @NotNull String key) {
        sendMessage(recipient, key, null, true);
    }

    @Nullable
    public PetType getPetType(@NotNull String key) {
        return petTypes.get(key.toLowerCase(Locale.ROOT));
    }

    /**
     * Ce compagnon est-il écrit dans la section pets, même s'il n'a pas pu être chargé (modèle absent, trop lourd
     * ou illisible) ? Le choix d'un joueur n'est alors pas effacé de la base : il revient dès que le modèle est réparé.
     */
    public boolean isDeclared(@NotNull String key) {
        return declaredPets.contains(key.toLowerCase(Locale.ROOT));
    }

    @NotNull
    public Set<String> getPetTypes() {
        Set<String> keys = new java.util.LinkedHashSet<>();
        for (PetType type : petTypes.values()) {
            keys.add(type.key());
        }
        return keys;
    }

    @NotNull
    public ModelLibrary getModels() {
        return models;
    }

    @NotNull
    public Settings getSettings() {
        return settings;
    }

    @NotNull
    public String getStorageType() {
        return storageType;
    }

    @NotNull
    public String getDbHost() {
        return dbHost;
    }

    public int getDbPort() {
        return dbPort;
    }

    @NotNull
    public String getDbName() {
        return dbName;
    }

    @NotNull
    public String getDbUser() {
        return dbUser;
    }

    @NotNull
    public String getDbPass() {
        return dbPass;
    }

    public boolean isDbUseSSL() {
        return dbUseSSL;
    }

    @NotNull
    public Map<String, String> getDbProperties() {
        return dbProperties;
    }
}
