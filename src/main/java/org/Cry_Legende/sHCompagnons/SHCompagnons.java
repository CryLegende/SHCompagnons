package org.Cry_Legende.sHCompagnons;

import com.comphenix.protocol.ProtocolLibrary;
import com.comphenix.protocol.ProtocolManager;
import org.Cry_Legende.sHCompagnons.commands.CompagnonCommand;
import org.Cry_Legende.sHCompagnons.config.ConfigManager;
import org.Cry_Legende.sHCompagnons.database.DatabaseManager;
import org.Cry_Legende.sHCompagnons.database.MySQLManager;
import org.Cry_Legende.sHCompagnons.database.SQLiteManager;
import org.Cry_Legende.sHCompagnons.listeners.PlayerListener;
import org.Cry_Legende.sHCompagnons.pet.PetManager;
import org.Cry_Legende.sHCompagnons.placeholder.PAPIHook;
import org.bukkit.Bukkit;
import org.bukkit.plugin.PluginDescriptionFile;
import org.bukkit.plugin.PluginManager;
import org.bukkit.plugin.java.JavaPlugin;
import org.jetbrains.annotations.NotNull;


import java.io.File;
import java.util.logging.Level;

public class SHCompagnons extends JavaPlugin {

    private static SHCompagnons instance;
    private ProtocolManager protocolManager;
    private ConfigManager configManager;
    private DatabaseManager databaseManager;
    private PetManager petManager;
    private PluginDescriptionFile pdfFile;


    @Override
    public void onEnable() {
        instance = this;
        pdfFile = getDescription();
        PluginManager pm = getServer().getPluginManager();

        if (pm.getPlugin("ProtocolLib") == null) {
            getLogger().log(Level.SEVERE, "----------------------------------------------------");
            getLogger().log(Level.SEVERE, " ProtocolLib n'a pas été trouvé !");
            getLogger().log(Level.SEVERE, " SHCompagnons ne peut pas fonctionner sans ProtocolLib.");
            getLogger().log(Level.SEVERE, " Veuillez télécharger et installer ProtocolLib.");
            getLogger().log(Level.SEVERE, " Le plugin va maintenant se désactiver.");
            getLogger().log(Level.SEVERE, "----------------------------------------------------");
            pm.disablePlugin(this);
            return;
        }

        try {
            this.protocolManager = ProtocolLibrary.getProtocolManager();
            if (this.protocolManager == null) {
                throw new IllegalStateException("ProtocolLibrary.getProtocolManager() a retourné null.");
            }
            getLogger().info("ProtocolManager chargé avec succès.");
        } catch (Exception e) {
            getLogger().log(Level.SEVERE, "----------------------------------------------------");
            getLogger().log(Level.SEVERE, " Erreur critique lors de l'initialisation de ProtocolManager via ProtocolLib:", e);
            getLogger().log(Level.SEVERE, " Assurez-vous que ProtocolLib est à jour et compatible avec votre version de serveur.");
            getLogger().log(Level.SEVERE, " SHCompagnons va maintenant se désactiver.");
            getLogger().log(Level.SEVERE, "----------------------------------------------------");
            pm.disablePlugin(this);
            return;
        }

        getLogger().info("Chargement de la configuration...");
        configManager = new ConfigManager(this);
        configManager.loadConfig();
        getLogger().info("Configuration chargée.");

        getLogger().info("Initialisation de la base de données (" + configManager.getStorageType() + ")...");
        if (!setupDatabase()) {
            getLogger().severe("Impossible d'initialiser la base de données! Le plugin va se désactiver.");
            pm.disablePlugin(this);
            return;
        }
        getLogger().info("Base de données initialisée.");

        getLogger().info("Initialisation du PetManager...");
        petManager = new PetManager(this);
        getLogger().info("PetManager initialisé.");

        getLogger().info("Enregistrement des commandes...");
        CompagnonCommand compagnonCommand = new CompagnonCommand(this);
        getCommand("shcompagnons").setExecutor(compagnonCommand);
        getCommand("shcompagnons").setTabCompleter(compagnonCommand);
        getLogger().info("Commandes enregistrées.");

        getLogger().info("Enregistrement des écouteurs d'événements...");
        pm.registerEvents(new PlayerListener(this), this);
        getLogger().info("Écouteurs d'événements enregistrés.");

        if (pm.getPlugin("PlaceholderAPI") != null) {
            if (new PAPIHook(this).register()) {
                getLogger().info("PlaceholderAPI trouvé et hook activé.");
            } else {
                getLogger().warning("PlaceholderAPI trouvé, mais l'enregistrement du hook a échoué.");
            }
        } else {
            getLogger().info("PlaceholderAPI non trouvé. Les placeholders de SHCompagnons ne seront pas disponibles.");
        }

        getLogger().info(pdfFile.getName() + " v" + pdfFile.getVersion() + " par " + String.join(", ", pdfFile.getAuthors()) + " a été activé avec succès!");
    }

    @Override
    public void onDisable() {
        getLogger().info("Désactivation de " + pdfFile.getName() + "...");
        if (petManager != null) {
            petManager.removeAllPets();
        }
        if (databaseManager != null) {
            databaseManager.close();
        }
        getLogger().info(pdfFile.getName() + " a été désactivé.");
        instance = null;
    }

    private boolean setupDatabase() {
        String storageType = getConfigManager().getStorageType().toUpperCase();
        if (!getDataFolder().exists()) {
            if (!getDataFolder().mkdirs()) {
                getLogger().severe("Impossible de créer le dossier du plugin !");
                return false;
            }
        }

        if (storageType.equals("MYSQL")) {
            this.databaseManager = new MySQLManager(this);
        } else if (storageType.equals("SQLITE")) {
            File sqliteFile = new File(getDataFolder(), "shcompagnons.db");
            this.databaseManager = new SQLiteManager(this, sqliteFile.getAbsolutePath());
        } else {
            getLogger().warning("Type de stockage non valide dans la configuration : '" + storageType + "'. Utilisation de SQLITE par défaut.");
            File sqliteFile = new File(getDataFolder(), "shcompagnons.db"); // Fallback to SQLite
            this.databaseManager = new SQLiteManager(this, sqliteFile.getAbsolutePath());
        }

        try {
            this.databaseManager.init();
            return true;
        } catch (Exception e) {
            getLogger().log(Level.SEVERE, "Erreur critique lors de l'initialisation de la base de données (" + storageType + "): ", e);
            return false;
        }
    }

    @NotNull
    public static SHCompagnons getInstance() {
        return instance;
    }

    @NotNull
    public ProtocolManager getProtocolManager() {
        return protocolManager;
    }

    @NotNull
    public ConfigManager getConfigManager() {
        return configManager;
    }

    @NotNull
    public DatabaseManager getDatabaseManager() {
        return databaseManager;
    }

    @NotNull
    public PetManager getPetManager() {
        return petManager;
    }
}
