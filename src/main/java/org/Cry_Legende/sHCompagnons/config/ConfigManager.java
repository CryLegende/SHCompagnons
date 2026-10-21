package org.Cry_Legende.sHCompagnons.config;

import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.Cry_Legende.sHCompagnons.pet.AnimationType;
import org.bukkit.ChatColor;
import org.bukkit.command.CommandSender;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.MemorySection;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;

public class ConfigManager {

    private final SHCompagnons plugin;
    private FileConfiguration config;
    private final Map<String, PetConfig> petConfigs = new HashMap<>();

    // Database
    private String storageType;
    private String dbHost;
    private int dbPort;
    private String dbName;
    private String dbUser;
    private String dbPass;
    private boolean dbUseSSL;
    private Map<String, String> dbProperties;

    // Companion Settings
    private double armorstandBaseVerticalOffset;
    private double followSpeed;
    private double maxDistanceBeforeTeleportSquared;
    private double rightArmPoseXDegrees;
    private double rightArmPoseYDegrees;
    private double rightArmPoseZDegrees;
    private double armorstandYawOffsetDegrees;

    // Messages
    private final Map<String, String> messages = new HashMap<>();
    private String messagePrefix = "";

    public ConfigManager(@NotNull SHCompagnons plugin) {
        this.plugin = plugin;
        plugin.saveDefaultConfig();
    }

    public void loadConfig() {
        plugin.reloadConfig();
        this.config = plugin.getConfig();
        petConfigs.clear();
        messages.clear();

        this.storageType = config.getString("database.type", "SQLITE").toUpperCase();
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

        this.armorstandBaseVerticalOffset = config.getDouble("companion_settings.armorstand_base_vertical_offset", -0.8);
        this.followSpeed = config.getDouble("companion_settings.follow_speed", 0.2);
        this.maxDistanceBeforeTeleportSquared = config.getDouble("companion_settings.max_distance_before_teleport_squared", 225.0);
        this.rightArmPoseXDegrees = config.getDouble("companion_settings.right_arm_pose_degrees.x", -90.0);
        this.rightArmPoseYDegrees = config.getDouble("companion_settings.right_arm_pose_degrees.y", 0.0);
        this.rightArmPoseZDegrees = config.getDouble("companion_settings.right_arm_pose_degrees.z", 0.0);
        this.armorstandYawOffsetDegrees = config.getDouble("companion_settings.armorstand_yaw_offset_degrees", 0.0);

        this.messagePrefix = ChatColor.translateAlternateColorCodes('&', config.getString("messages.prefix", "&8[&bSHC&8] &r"));
        ConfigurationSection msgSection = config.getConfigurationSection("messages");
        if (msgSection != null) {
            for (String key : msgSection.getKeys(false)) {
                if (msgSection.isString(key)) {
                    messages.put(key, msgSection.getString(key)); // Stocker les messages bruts (non colorés)
                }
            }
            plugin.getLogger().info("Messages chargés. Préfixe: '" + this.messagePrefix + ChatColor.RESET + "'");
        } else {
            plugin.getLogger().warning("Section 'messages' non trouvée dans config.yml.");
        }

        ConfigurationSection petsSection = config.getConfigurationSection("pets");
        if (petsSection != null) {
            for (String key : petsSection.getKeys(false)) {
                ConfigurationSection currentPetSection = petsSection.getConfigurationSection(key);
                if (currentPetSection == null) {
                    plugin.getLogger().warning("Section de configuration invalide pour le pet '" + key + "'. Ignoré.");
                    continue;
                }

                String displayName = ChatColor.translateAlternateColorCodes('&', currentPetSection.getString("displayname", "&fPet " + key));
                String animationStr = currentPetSection.getString("animation", "NONE").toUpperCase();
                AnimationType animationType;
                try {
                    animationType = AnimationType.valueOf(animationStr);
                } catch (IllegalArgumentException e) {
                    plugin.getLogger().warning("Type d'animation invalide '" + animationStr + "' pour le pet '" + key + "'. Utilisation de NONE.");
                    animationType = AnimationType.NONE;
                }

                List<PetConfig.SkinEntry> skinEntries = new ArrayList<>();
                // Lire l'intervalle global pour ce pet (en ticks), défaut à 0 (pas de cycle global)
                int globalSkinUpdateInterval = currentPetSection.getInt("skin_update_interval", 0);

                if (currentPetSection.isList("skins")) {
                    List<?> rawSkinList = currentPetSection.getList("skins");
                    if (rawSkinList == null || rawSkinList.isEmpty()) {
                        plugin.getLogger().warning("Liste 'skins' vide pour le pet '" + key + "'. Ce pet ne sera pas chargé.");
                        continue;
                    }
                    for (Object skinObj : rawSkinList) {
                        if (skinObj instanceof String) {
                            // Intervalle spécifique est null, utilisera le global si défini
                            skinEntries.add(new PetConfig.SkinEntry((String) skinObj, null));
                        } else if (skinObj instanceof Map) { // Bukkit charge les sections de liste comme des Map
                            Map<?, ?> skinMap = (Map<?, ?>) skinObj;
                            String skinValue = (String) skinMap.get("value");
                            Integer skinInterval = null;
                            if (skinMap.containsKey("skin_update_interval")) {
                                // Assurer que c'est bien un Integer
                                Object intervalObj = skinMap.get("skin_update_interval");
                                if (intervalObj instanceof Integer) {
                                    skinInterval = (Integer) intervalObj;
                                } else {
                                    plugin.getLogger().warning("Valeur 'skin_update_interval' invalide (doit être un nombre entier) pour une skin dans '" + key + "'.");
                                }
                            }
                            if (skinValue != null && !skinValue.isEmpty()) {
                                skinEntries.add(new PetConfig.SkinEntry(skinValue, skinInterval));
                            } else {
                                plugin.getLogger().warning("Entrée de skin invalide (valeur manquante ou vide) dans la liste 'skins' pour le pet '" + key + "'.");
                            }
                        } else {
                            plugin.getLogger().warning("Type d'entrée de skin non supporté dans la liste 'skins' pour le pet '" + key + "': " + skinObj.getClass().getName());
                        }
                    }
                } else if (currentPetSection.isString("skin")) { // Compatibilité avec l'ancien format "skin:"
                    String singleSkin = currentPetSection.getString("skin");
                    if (singleSkin != null && !singleSkin.isEmpty()) {
                        skinEntries.add(new PetConfig.SkinEntry(singleSkin, null));
                    }
                }

                if (skinEntries.isEmpty()) {
                    plugin.getLogger().warning("Aucune skin valide trouvée (ni 'skin' unique ni liste 'skins') pour le pet '" + key + "'. Ce pet ne sera pas chargé.");
                    continue;
                }

                petConfigs.put(key.toLowerCase(), new PetConfig(key, displayName, animationType, skinEntries, globalSkinUpdateInterval));
            }
            plugin.getLogger().info(petConfigs.size() + " types de pets ont été chargés.");
        } else {
            plugin.getLogger().warning("Aucune section 'pets' trouvée dans config.yml. Aucun pet ne sera disponible.");
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
            } else if (applyPrefix) {
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
        message = message.replaceAll("\\{prefix}", "");
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
        String rawMessageConfig = messages.get(key);

        if (rawMessageConfig == null) {
            recipient.sendMessage(ChatColor.RED + "Message de configuration manquant pour la clé: " + key);
            return;
        }
        if (rawMessageConfig.isEmpty()) {
            return;
        }

        String formattedMessage = getMessage(key, placeholders, applyPrefix);
        if (!formattedMessage.isEmpty()) {
            recipient.sendMessage(formattedMessage);
        }
    }

    public void sendMessage(@NotNull CommandSender recipient, @NotNull String key, @Nullable Map<String, String> placeholders) {
        sendMessage(recipient, key, placeholders, true);
    }

    public void sendMessage(@NotNull CommandSender recipient, @NotNull String key) {
        sendMessage(recipient, key, null, true);
    }

    @Nullable
    public PetConfig getPetConfig(@NotNull String petType) {
        return petConfigs.get(petType.toLowerCase());
    }

    @NotNull
    public Set<String> getPetTypes() {
        return petConfigs.keySet();
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

    public double getArmorstandBaseVerticalOffset() {
        return armorstandBaseVerticalOffset;
    }

    public double getFollowSpeed() {
        return followSpeed;
    }

    public double getMaxDistanceBeforeTeleportSquared() {
        return maxDistanceBeforeTeleportSquared;
    }

    public double getRightArmPoseXDegrees() {
        return rightArmPoseXDegrees;
    }

    public double getRightArmPoseYDegrees() {
        return rightArmPoseYDegrees;
    }

    public double getRightArmPoseZDegrees() {
        return rightArmPoseZDegrees;
    }

    public double getArmorstandYawOffsetDegrees() {
        return armorstandYawOffsetDegrees;
    }
}
