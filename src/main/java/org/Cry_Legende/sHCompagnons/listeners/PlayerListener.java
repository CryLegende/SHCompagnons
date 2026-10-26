package org.Cry_Legende.sHCompagnons.listeners;

import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.Cry_Legende.sHCompagnons.pet.Pet; // Utile pour le casting si nécessaire, ou si des méthodes Pet sont appelées directement
import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerChangedWorldEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerKickEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.event.player.PlayerRespawnEvent;
import org.bukkit.event.player.PlayerTeleportEvent;
import org.jetbrains.annotations.NotNull;

public class PlayerListener implements Listener {

    private final SHCompagnons plugin;

    public PlayerListener(@NotNull SHCompagnons plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        // Délai pour s'assurer que le joueur est pleinement initialisé et que les données d'autres plugins sont chargées
        Bukkit.getScheduler().runTaskLater(plugin, () -> {
            if (player.isOnline() && player.isValid()) { // Revérifier si le joueur est toujours là
                plugin.getPetManager().loadPetForPlayer(player);
            }
        }, 40L); // 2 secondes peuvent être un bon compromis
    }

    /**
     * Gère la déconnexion ou l'expulsion d'un joueur, en retirant son pet actif.
     * Ne modifie pas la base de données pour que le pet soit rechargé à la prochaine connexion.
     */
    private void handlePlayerLeave(@NotNull Player player) {
        plugin.getPetManager().removeActivePet(player.getUniqueId());
        plugin.getLogger().fine("Pet actif retiré (mémoire) pour " + player.getName() + " (leave/kick).");
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerQuit(PlayerQuitEvent event) {
        handlePlayerLeave(event.getPlayer());
    }

    // Expulsion annulée par un autre plugin : le joueur reste, son compagnon aussi.
    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onPlayerKick(PlayerKickEvent event) {
        handlePlayerLeave(event.getPlayer());
    }

    /**
     * Lors d'un changement de monde, un respawn complet du pet est le plus sûr.
     */
    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onPlayerChangedWorld(@NotNull PlayerChangedWorldEvent event) {
        Player player = event.getPlayer();
        Pet pet = plugin.getPetManager().getActivePet(player.getUniqueId());
        if (pet != null) {
            plugin.getLogger().fine("Changement de monde pour " + player.getName() +
                ". Ancien monde: " + event.getFrom().getName() +
                ", Nouveau monde: " + player.getWorld().getName() +
                ". Pet (ID: " + pet.getEntityId() + ") va se préparer et respawn.");

            // Étape 1: Préparer le pet pour le changement de monde
            // Ceci va le despawner pour les viewers dans l'ancien monde
            // mais le garder logiquement actif.
            pet.prepareForWorldChange();

            // Étape 2: Déclencher le processus de respawn qui attendra un délai
            // pour spawner le pet dans le nouveau monde.
            pet.respawn();
        }
    }

    /**
     * Gère les téléportations. Pour les grandes téléportations intra-monde,
     * une téléportation directe du pet est effectuée. Les changements de monde sont
     * principalement gérés par PlayerChangedWorldEvent.
     */
    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onPlayerTeleport(@NotNull PlayerTeleportEvent event) {
        Player player = event.getPlayer();
        Location from = event.getFrom();
        Location to = event.getTo(); // Garanti non-null et monde chargé si event non annulé
        Pet pet = plugin.getPetManager().getActivePet(player.getUniqueId());

        if (pet == null) return;

        // Vérifier si c'est un TP intra-monde.
        // Si le monde est différent, PlayerChangedWorldEvent devrait s'en charger (plus robuste).
        if (from.getWorld() != null && to != null && to.getWorld() != null && from.getWorld().equals(to.getWorld())) {
            // Si c'est une grande téléportation DANS LE MÊME MONDE
            if (from.distanceSquared(to) > plugin.getConfigManager().getMaxDistanceBeforeTeleportSquared()) {
                plugin.getLogger().fine("Grande téléportation intra-monde pour " + player.getName() + ". Pet (ID Entité: " + pet.getEntityId() + ") va se téléporter.");
                // Calculer la position cible du pet en fonction de la nouvelle position du joueur et du yaw désiré de l'AS
                float desiredPetYaw = Location.normalizeYaw((float) (to.getYaw() + plugin.getConfigManager().getArmorstandYawOffsetDegrees()));
                Location targetPetLocation = pet.calculateFinalPetLocation(to, desiredPetYaw);

                pet.teleport(targetPetLocation);

                // MODIFICATION: Forcer une mise à jour immédiate du pet
                // Cela permet au pet de réévaluer sa position, son animation et sa visibilité
                // par rapport à la nouvelle position du joueur sans attendre le prochain cycle de mise à jour global.
                // Cela peut améliorer la réactivité du suivi après une téléportation lointaine.
                if (player.isOnline() && player.isValid() && pet.isLogicallyVisible()) {
                    pet.update();
                }

            }
            // Pour les petites téléportations, la boucle d'update normale du pet gérera le suivi.
        }
        // Si to.getWorld() est null (improbable si event non annulé) ou différent, laisser PlayerChangedWorldEvent
    }

    /**
     * Lors de la réapparition du joueur, son pet est "respawné" pour s'assurer
     * qu'il est correctement positionné et visible.
     */
    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerRespawn(@NotNull PlayerRespawnEvent event) {
        Player player = event.getPlayer();
        Location respawnLocation = event.getRespawnLocation();
        Pet pet = plugin.getPetManager().getActivePet(player.getUniqueId());

        if (pet != null) {
            plugin.getLogger().fine("Joueur " + player.getName() + " a respawn. Pet (ID Entité: " + pet.getEntityId() + ") va respawn.");
            pet.respawn(); // Déclenche le cycle despawn/spawn du pet

            // Planifier une téléportation à la position exacte après que le respawn du pet soit effectif
            Bukkit.getScheduler().runTaskLater(plugin, () -> {
                if (player.isOnline() && player.isValid()) { // Double-check
                    // S'assurer que respawnLocation est toujours pertinent (le joueur pourrait avoir bougé/TP entre temps)
                    // Utiliser la position actuelle du joueur pour plus de précision si le délai est long.
                    // Ici, le délai est court, donc respawnLocation est probablement ok.
                    Location currentTargetLocation = player.getLocation();
                    float desiredPetYaw = Location.normalizeYaw((float) (currentTargetLocation.getYaw() + plugin.getConfigManager().getArmorstandYawOffsetDegrees()));
                    Location targetPetLocation = pet.calculateFinalPetLocation(currentTargetLocation, desiredPetYaw);
                    pet.teleport(targetPetLocation);
                }
            }, 3L); // Doit être >= au délai interne de respawn du Pet (2L) + 1 tick de marge
        } else {
            plugin.getLogger().fine(player.getName() + " n'avait pas de pet actif au respawn. Tentative de rechargement.");
            Bukkit.getScheduler().runTaskLater(plugin, () -> {
                if (player.isOnline() && player.isValid()) {
                    plugin.getPetManager().loadPetForPlayer(player);
                }
            }, 20L); // Délai standard pour chargement au join/respawn si pas de pet
        }
    }
}
