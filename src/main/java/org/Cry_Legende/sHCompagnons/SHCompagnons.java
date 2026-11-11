package org.Cry_Legende.sHCompagnons;

import com.github.retrooper.packetevents.PacketEvents;
import org.Cry_Legende.sHCompagnons.commands.CompagnonCommand;
import org.Cry_Legende.sHCompagnons.config.ConfigManager;
import org.Cry_Legende.sHCompagnons.database.DatabaseManager;
import org.Cry_Legende.sHCompagnons.database.MySQLManager;
import org.Cry_Legende.sHCompagnons.database.SQLiteManager;
import org.Cry_Legende.sHCompagnons.listeners.PassengerHook;
import org.Cry_Legende.sHCompagnons.listeners.PlayerListener;
import org.Cry_Legende.sHCompagnons.network.RemotePlayers;
import org.Cry_Legende.sHCompagnons.network.ShNetworkPlayers;
import org.Cry_Legende.sHCompagnons.pet.PetManager;
import org.Cry_Legende.sHCompagnons.placeholder.PAPIHook;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.plugin.PluginManager;
import org.bukkit.plugin.java.JavaPlugin;
import org.jetbrains.annotations.NotNull;

import java.io.File;
import java.util.logging.Level;

public class SHCompagnons extends JavaPlugin {

    private static SHCompagnons instance;
    private ConfigManager configManager;
    private DatabaseManager databaseManager;
    private PetManager petManager;
    private PassengerHook passengerHook;
    // Joueurs des autres serveurs du réseau ; null sans SHNetwork
    private RemotePlayers remotePlayers;

    @Override
    public void onEnable() {
        instance = this;
        PluginManager pm = getServer().getPluginManager();

        configManager = new ConfigManager(this);
        configManager.loadConfig();

        if (!setupDatabase()) {
            getLogger().severe("Base de données indisponible, SHCompagnons se désactive.");
            pm.disablePlugin(this);
            return;
        }

        petManager = new PetManager(this);
        passengerHook = new PassengerHook(petManager);
        PacketEvents.getAPI().getEventManager().registerListener(passengerHook);

        enableNetwork();

        CompagnonCommand compagnonCommand = new CompagnonCommand(this);
        getCommand("shcompagnons").setExecutor(compagnonCommand);
        getCommand("shcompagnons").setTabCompleter(compagnonCommand);
        pm.registerEvents(new PlayerListener(this), this);

        if (pm.getPlugin("PlaceholderAPI") != null && !new PAPIHook(this).register()) {
            getLogger().warning("PlaceholderAPI présent, mais l'enregistrement des placeholders a échoué.");
        }

        // Rechargement à chaud : les joueurs déjà en ligne retrouvent leur compagnon
        for (Player player : Bukkit.getOnlinePlayers()) {
            petManager.loadPetForPlayer(player);
        }
        getLogger().info("SHCompagnons " + getPluginMeta().getVersion() + " prêt (" + configManager.getStorageType() + ").");
    }

    @Override
    public void onDisable() {
        if (passengerHook != null) {
            PacketEvents.getAPI().getEventManager().unregisterListener(passengerHook);
        }
        if (petManager != null) {
            petManager.shutdown();
        }
        if (databaseManager != null) {
            databaseManager.close();
        }
        instance = null;
    }

    /**
     * Passe en mode réseau si SHNetwork est installé et 'reseau.actif' est vrai : /shc set et /shc unset atteignent
     * un joueur connecté sur un autre serveur. Le compagnon est déjà en base commune et relu à chaque connexion.
     * La classe qui touche à SHNetwork n'est résolue qu'ici : sans lui, rien n'est chargé.
     */
    private void enableNetwork() {
        if (!getConfig().getBoolean("reseau.actif", true)) return;
        if (!getServer().getPluginManager().isPluginEnabled("SHNetwork")) return;
        try {
            remotePlayers = ShNetworkPlayers.open();
            getLogger().info("SHNetwork détecté : /shc set et /shc unset atteignent les joueurs de tout le réseau.");
        } catch (RuntimeException | LinkageError e) {
            remotePlayers = null;
            getLogger().log(Level.SEVERE, "SHNetwork présent mais inutilisable, commandes locales à ce serveur : " + e);
        }
    }

    private boolean setupDatabase() {
        String storageType = getConfigManager().getStorageType();
        if (!getDataFolder().exists() && !getDataFolder().mkdirs()) {
            getLogger().severe("Impossible de créer le dossier du plugin !");
            return false;
        }
        if (storageType.equals("MYSQL")) {
            this.databaseManager = new MySQLManager(this);
        } else {
            if (!storageType.equals("SQLITE")) {
                getLogger().warning("Type de stockage inconnu '" + storageType + "', SQLITE utilisé.");
            }
            this.databaseManager = new SQLiteManager(this, new File(getDataFolder(), "shcompagnons.db").getAbsolutePath());
        }
        try {
            this.databaseManager.init();
            return true;
        } catch (Exception e) {
            getLogger().log(Level.SEVERE, "Erreur à l'initialisation de la base de données (" + storageType + ")", e);
            return false;
        }
    }

    @NotNull
    public static SHCompagnons getInstance() {
        return instance;
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

    /** Joueurs des autres serveurs du réseau, ou null sans SHNetwork. */
    public RemotePlayers getRemotePlayers() {
        return remotePlayers;
    }
}
