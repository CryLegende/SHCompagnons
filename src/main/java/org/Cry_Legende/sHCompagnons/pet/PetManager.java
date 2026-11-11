package org.Cry_Legende.sHCompagnons.pet;

import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.Cry_Legende.sHCompagnons.config.PetType;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitTask;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;

/**
 * Compagnons actifs des joueurs en ligne et tick unique qui les fait vivre. Le compagnon choisi est en base
 * (table player_pets) ; ce qui est en mémoire n'est que son affichage.
 */
public class PetManager {

    private final SHCompagnons plugin;
    private final Map<UUID, Pet> activePets = new ConcurrentHashMap<>();
    // Numéro d'entité du propriétaire -> compagnon, pour l'écouteur des passagers
    private final Map<Integer, Pet> byOwnerEntity = new ConcurrentHashMap<>();
    // Aperçus en cours : joueur -> jeton (un nouvel aperçu ou un set annule la fin du précédent)
    private final Map<UUID, Object> previews = new ConcurrentHashMap<>();
    private final BukkitTask task;
    private int tick;

    public PetManager(@NotNull SHCompagnons plugin) {
        this.plugin = plugin;
        this.task = Bukkit.getScheduler().runTaskTimer(plugin, this::tickAll, 1L, 1L);
    }

    private void tickAll() {
        int now = ++tick;
        for (Pet pet : activePets.values()) {
            Player owner = pet.owner();
            if (!owner.isOnline()) {
                removeActivePet(owner.getUniqueId());
                continue;
            }
            // Le joueur change de numéro d'entité en réapparaissant
            int entityId = owner.getEntityId();
            if (entityId != pet.ownerEntityId()) {
                byOwnerEntity.remove(pet.ownerEntityId(), pet);
                byOwnerEntity.put(entityId, pet);
                pet.ownerEntityId(entityId);
            }
            try {
                pet.tick(now);
            } catch (RuntimeException e) {
                plugin.getLogger().log(Level.SEVERE, "Compagnon de " + owner.getName() + " retiré après une erreur", e);
                removeActivePet(owner.getUniqueId());
            }
        }
    }

    /** Donne ce compagnon au joueur, l'enregistre en base et le prévient. */
    public void setPet(@NotNull Player player, @NotNull PetType type) {
        previews.remove(player.getUniqueId());
        show(player, type);
        plugin.getDatabaseManager().setPlayerPetType(player.getUniqueId(), type.key())
            .thenRunAsync(() -> {
                if (player.isOnline()) {
                    plugin.getConfigManager().sendMessage(player, "pet_equipped", Map.of("{pet_display_name}", type.displayName()));
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

    /**
     * Montre ce compagnon au joueur pendant quelques secondes sans rien enregistrer, puis lui rend le sien (celui
     * de la base).
     */
    public void preview(@NotNull Player player, @NotNull PetType type, int seconds) {
        Object token = new Object();
        previews.put(player.getUniqueId(), token);
        show(player, type);
        Bukkit.getScheduler().runTaskLater(plugin, () -> {
            if (!previews.remove(player.getUniqueId(), token) || !player.isOnline()) {
                return;
            }
            removeActivePet(player.getUniqueId(), true);
            loadPetForPlayer(player);
        }, seconds * 20L);
    }

    /** Relit en base le compagnon du joueur et l'affiche (connexion, rechargement). */
    public void loadPetForPlayer(@NotNull Player player) {
        plugin.getDatabaseManager().getPlayerPetType(player.getUniqueId()).thenAcceptAsync(key -> {
            if (key == null || !player.isOnline() || previews.containsKey(player.getUniqueId())) {
                return;
            }
            PetType type = plugin.getConfigManager().getPetType(key);
            if (type == null) {
                plugin.getLogger().warning("Compagnon '" + key + "' de " + player.getName() + " absent de config.yml : retiré de la base.");
                plugin.getDatabaseManager().removePlayerPet(player.getUniqueId());
                return;
            }
            show(player, type);
        }, runnable -> Bukkit.getScheduler().runTask(plugin, runnable)).exceptionally(ex -> {
            plugin.getLogger().log(Level.SEVERE, "Erreur DB (loadPetForPlayer) pour " + player.getName(), ex);
            return null;
        });
    }

    private void show(@NotNull Player player, @NotNull PetType type) {
        removeActivePet(player.getUniqueId(), true);
        Pet pet = new Pet(player, type, plugin.getConfigManager().getSettings());
        activePets.put(player.getUniqueId(), pet);
        byOwnerEntity.put(player.getEntityId(), pet);
        pet.start();
    }

    /** Joueur parti : compagnon retiré de la mémoire, gardé en base. */
    public void removeActivePet(@NotNull UUID playerUUID) {
        removeActivePet(playerUUID, false);
    }

    private void removeActivePet(@NotNull UUID playerUUID, boolean ownerStays) {
        Pet pet = activePets.remove(playerUUID);
        if (pet != null) {
            byOwnerEntity.remove(pet.ownerEntityId(), pet);
            pet.remove(ownerStays);
        }
    }

    /** Retire le compagnon du joueur et de la base, et le prévient. */
    public void removePetAndClearDatabase(@NotNull Player player) {
        previews.remove(player.getUniqueId());
        removeActivePet(player.getUniqueId(), true);
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

    /** Arrêt du plugin : plus de tick, tous les modèles retirés des clients. */
    public void shutdown() {
        task.cancel();
        for (UUID owner : new ArrayList<>(activePets.keySet())) {
            removeActivePet(owner, true);
        }
    }

    /**
     * Après /shcompagnons reload : chaque compagnon affiché est recréé avec sa nouvelle configuration (ou retiré si
     * son type n'existe plus), et les joueurs sans compagnon affiché sont relus en base.
     */
    public void reloadAll() {
        for (Player player : Bukkit.getOnlinePlayers()) {
            Pet pet = activePets.get(player.getUniqueId());
            if (previews.remove(player.getUniqueId()) != null) {
                removeActivePet(player.getUniqueId(), true);
                loadPetForPlayer(player);
                continue;
            }
            if (pet == null) {
                loadPetForPlayer(player);
                continue;
            }
            PetType type = plugin.getConfigManager().getPetType(pet.type().key());
            if (type != null) {
                show(player, type);
            } else {
                // La ligne reste en base : elle est nettoyée à la prochaine connexion, jamais par un reload
                removeActivePet(player.getUniqueId(), true);
                plugin.getConfigManager().sendMessage(player, "pet_type_no_longer_available_on_reload");
            }
        }
    }

    // ---- événements (n'importe quel fil) ----

    public void onTrack(@NotNull Player viewer, @NotNull Player owner) {
        Pet pet = activePets.get(owner.getUniqueId());
        if (pet != null) {
            pet.track(viewer);
        }
    }

    public void onUntrack(@NotNull Player viewer, @NotNull Player owner) {
        Pet pet = activePets.get(owner.getUniqueId());
        if (pet != null) {
            pet.untrack(viewer);
        }
    }

    /** Joueur déconnecté : son compagnon part, et il ne voit plus ceux des autres. */
    public void onQuit(@NotNull Player player) {
        previews.remove(player.getUniqueId());
        removeActivePet(player.getUniqueId());
        for (Pet pet : activePets.values()) {
            pet.forget(player.getUniqueId());
        }
    }

    @Nullable
    public Pet getActivePet(@NotNull UUID playerUUID) {
        return activePets.get(playerUUID);
    }

    @Nullable
    public Pet byOwnerEntityId(int entityId) {
        return byOwnerEntity.get(entityId);
    }

    public boolean hasAttachedPets() {
        return !byOwnerEntity.isEmpty();
    }

    @NotNull
    public String getPlayerPetDisplayName(@NotNull Player player) {
        Pet pet = getActivePet(player.getUniqueId());
        return pet != null ? pet.type().displayName() : "";
    }

    @Nullable
    public String getPlayerPetTypeKey(@NotNull Player player) {
        Pet pet = getActivePet(player.getUniqueId());
        return pet != null ? pet.type().key() : null;
    }
}
