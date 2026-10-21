package org.Cry_Legende.sHCompagnons.pet;

import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.Cry_Legende.sHCompagnons.config.PetConfig;
import org.bukkit.Bukkit;
// import org.bukkit.ChatColor; // Plus besoin ici, ConfigManager gère les couleurs
import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitRunnable;
import org.bukkit.scheduler.BukkitTask;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;

public class PetManager {

    private final SHCompagnons plugin;
    private final Map<UUID, Pet> activePets = new ConcurrentHashMap<>();
    private BukkitTask updateTask;

    public PetManager(@NotNull SHCompagnons plugin) {
        this.plugin = plugin;
        startUpdateTask();
    }

    public void setPet(@NotNull Player player, @NotNull String petTypeKey) {
        PetConfig config = plugin.getConfigManager().getPetConfig(petTypeKey);
        if (config == null) {
            // Message géré par CompagnonCommand maintenant
            return;
        }

        removeActivePet(player.getUniqueId());

        Pet pet = new Pet(plugin, player, config);
        activePets.put(player.getUniqueId(), pet);
        pet.spawn();

        plugin.getDatabaseManager().setPlayerPetType(player.getUniqueId(), petTypeKey)
            .thenRunAsync(() -> {
                if (player.isOnline()) {
                    // Utiliser ConfigManager pour le message
                    plugin.getConfigManager().sendMessage(player, "pet_equipped",
                        Map.of("{pet_display_name}", config.getDisplayName()));
                }
            }, runnable -> Bukkit.getScheduler().runTask(plugin, runnable))
            .exceptionally(ex -> {
                plugin.getLogger().log(Level.SEVERE, "Erreur DB (setPet) pour " + player.getName(), ex);
                if (player.isOnline()) {
                    plugin.getConfigManager().sendMessage(player, "pet_save_error");
                }
                return null;
            });
    }

    public void loadPetForPlayer(@NotNull Player player) {
        plugin.getDatabaseManager().getPlayerPetType(player.getUniqueId()).thenAcceptAsync(petType -> {
                if (petType != null) {
                    PetConfig config = plugin.getConfigManager().getPetConfig(petType);
                    if (config != null) {
                        if (player.isOnline() && player.isValid()) {
                            removeActivePet(player.getUniqueId());
                            Pet pet = new Pet(plugin, player, config);
                            activePets.put(player.getUniqueId(), pet);
                            pet.spawn();
                            plugin.getLogger().info("Compagnon " + petType + " chargé pour " + player.getName() + " (DB).");
                        }
                    } else {
                        plugin.getLogger().warning("Config pour pet '" + petType + "' (DB) non trouvée pour " + player.getName() + ". Nettoyage DB.");
                        plugin.getDatabaseManager().removePlayerPet(player.getUniqueId());
                    }
                }
            }, runnable -> Bukkit.getScheduler().runTask(plugin, runnable))
            .exceptionally(ex -> {
                plugin.getLogger().log(Level.SEVERE, "Erreur DB (loadPetForPlayer) pour " + player.getName(), ex);
                return null;
            });
    }

    public void removeActivePet(@NotNull UUID playerUUID) {
        Pet pet = activePets.remove(playerUUID);
        if (pet != null) {
            pet.despawn();
            plugin.getLogger().fine("Pet actif de " + playerUUID + " retiré de la mémoire et despawned.");
        }
    }

    public void removePetAndClearDatabase(@NotNull Player player) {
        removeActivePet(player.getUniqueId());
        plugin.getDatabaseManager().removePlayerPet(player.getUniqueId())
            .thenRunAsync(() -> {
                if (player.isOnline()) {
                    plugin.getConfigManager().sendMessage(player, "pet_removed");
                }
            }, runnable -> Bukkit.getScheduler().runTask(plugin, runnable))
            .exceptionally(ex -> {
                plugin.getLogger().log(Level.SEVERE, "Erreur DB (removePetAndClearDatabase) pour " + player.getName(), ex);
                if (player.isOnline()) {
                    plugin.getConfigManager().sendMessage(player, "pet_remove_db_error");
                }
                return null;
            });
    }

    public void removeAllPets() {
        if (updateTask != null && !updateTask.isCancelled()) {
            updateTask.cancel();
            updateTask = null;
        }
        new ArrayList<>(activePets.keySet()).forEach(this::removeActivePet);
        plugin.getLogger().info("Tous les compagnons actifs ont été retirés.");
    }

    @Nullable
    public Pet getActivePet(@NotNull UUID playerUUID) {
        return activePets.get(playerUUID);
    }

    @NotNull
    public String getPlayerPetDisplayName(@NotNull Player player) {
        Pet pet = getActivePet(player.getUniqueId());
        return pet != null ? pet.getPetConfig().getDisplayName() : "";
    }

    @Nullable
    public String getPlayerPetTypeKey(@NotNull Player player) {
        Pet pet = getActivePet(player.getUniqueId());
        return pet != null ? pet.getPetConfig().getTypeKey() : null;
    }

    private void startUpdateTask() {
        if (updateTask != null && !updateTask.isCancelled()) {
            updateTask.cancel();
        }
        updateTask = new BukkitRunnable() {
            @Override
            public void run() {
                for (UUID playerId : new ArrayList<>(activePets.keySet())) {
                    Pet pet = activePets.get(playerId);
                    if (pet == null) continue;
                    Player owner = pet.getOwner();
                    if (owner == null || !owner.isOnline() || !owner.isValid()) {
                        plugin.getLogger().fine("Pet de " + (owner != null ? owner.getName() : playerId) + " retiré par update task (joueur invalide/offline).");
                        removeActivePet(playerId);
                        continue;
                    }
                    try {
                        pet.update();
                    } catch (Exception e) {
                        plugin.getLogger().log(Level.SEVERE, "Erreur critique pendant l'update du pet de " + owner.getName() + ". Pet retiré.", e);
                        removeActivePet(playerId);
                    }
                }
            }
        }.runTaskTimer(plugin, 0L, 1L);
    }

    public void reloadPetDataForOnlinePlayers() {
        plugin.getLogger().info("Rechargement des données de compagnons pour les joueurs en ligne...");
        for (Player player : Bukkit.getOnlinePlayers()) {
            UUID playerId = player.getUniqueId();
            final Pet existingPet = getActivePet(playerId);

            plugin.getDatabaseManager().getPlayerPetType(playerId).whenCompleteAsync((petTypeFromDb, dbEx) -> {
                if (dbEx != null) {
                    plugin.getLogger().log(Level.SEVERE, "Erreur DB pendant reload pet data pour " + player.getName(), dbEx);
                    return;
                }

                if (existingPet != null) {
                    PetConfig newConfigFromPetType = null;
                    if (petTypeFromDb != null) {
                        newConfigFromPetType = plugin.getConfigManager().getPetConfig(petTypeFromDb);
                    }
                    if (newConfigFromPetType != null) {
                        plugin.getLogger().info("Re-création du pet pour " + player.getName() + " (type: " + newConfigFromPetType.getTypeKey() + ") après reload.");
                        removeActivePet(playerId);
                        setPet(player, newConfigFromPetType.getTypeKey());
                    } else {
                        removeActivePet(playerId);
                        if (petTypeFromDb != null) {
                            plugin.getDatabaseManager().removePlayerPet(playerId);
                        }
                        if (player.isOnline()) {
                            plugin.getConfigManager().sendMessage(player, "pet_type_no_longer_available_on_reload");
                        }
                        plugin.getLogger().info("Ancien compagnon (" + (petTypeFromDb != null ? petTypeFromDb : "aucun en DB") + ") retiré pour " + player.getName() + " après reload.");
                    }
                } else if (petTypeFromDb != null) {
                    PetConfig configToLoad = plugin.getConfigManager().getPetConfig(petTypeFromDb);
                    if (configToLoad != null) {
                        if (player.isOnline() && player.isValid()) {
                            setPet(player, petTypeFromDb);
                            plugin.getLogger().info("Compagnon " + petTypeFromDb + " chargé pour " + player.getName() + " (depuis DB après reload).");
                        }
                    } else {
                        plugin.getDatabaseManager().removePlayerPet(playerId);
                        plugin.getLogger().info("Type " + petTypeFromDb + " (DB) pour " + player.getName() + " non trouvé en config après reload. DB nettoyée.");
                    }
                }
            }, runnable -> Bukkit.getScheduler().runTask(plugin, runnable));
        }
    }
}
