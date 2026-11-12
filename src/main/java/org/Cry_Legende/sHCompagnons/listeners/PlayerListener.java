package org.Cry_Legende.sHCompagnons.listeners;

import io.papermc.paper.event.player.PlayerTrackEntityEvent;
import io.papermc.paper.event.player.PlayerUntrackEntityEvent;
import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.Cry_Legende.sHCompagnons.pet.Pet;
import org.bukkit.Bukkit;
import org.bukkit.GameMode;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.block.Action;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.PlayerAnimationEvent;
import org.bukkit.event.player.PlayerAnimationType;
import org.bukkit.event.player.PlayerChangedWorldEvent;
import org.bukkit.event.player.PlayerGameModeChangeEvent;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.event.player.PlayerRespawnEvent;
import org.bukkit.inventory.EquipmentSlot;
import org.jetbrains.annotations.NotNull;

/**
 * Qui voit quel compagnon, quand le client du propriétaire perd le sien, et les clics du propriétaire sur son
 * compagnon. Le déplacement, lui, n'a besoin d'aucun événement : le client s'en charge.
 */
public class PlayerListener implements Listener {

    private final SHCompagnons plugin;

    public PlayerListener(@NotNull SHCompagnons plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        Bukkit.getScheduler().runTaskLater(plugin, () -> {
            if (player.isOnline()) {
                plugin.getPetManager().loadPetForPlayer(player);
            }
        }, plugin.getConfigManager().getSettings().joinDelayTicks());
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onQuit(PlayerQuitEvent event) {
        plugin.getPetManager().onQuit(event.getPlayer());
    }

    // Le propriétaire entre dans le champ d'un joueur : son modèle suit au tick suivant, après son propre paquet
    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onTrack(PlayerTrackEntityEvent event) {
        if (event.getEntity() instanceof Player owner) {
            plugin.getPetManager().onTrack(event.getPlayer(), owner);
        }
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onUntrack(PlayerUntrackEntityEvent event) {
        if (event.getEntity() instanceof Player owner) {
            plugin.getPetManager().onUntrack(event.getPlayer(), owner);
        }
    }

    // Clic gauche : le client balance le bras, qu'il vise un bloc, une créature ou rien. Le compagnon n'a pas de
    // hitbox (entités d'affichage) : c'est le regard du joueur qui dit s'il le vise.
    @EventHandler(priority = EventPriority.MONITOR)
    public void onSwing(PlayerAnimationEvent event) {
        if (event.getAnimationType() == PlayerAnimationType.ARM_SWING) {
            plugin.getPetManager().onClick(event.getPlayer());
        }
    }

    // Clic droit : le client ne l'envoie que s'il vise un bloc ou tient un objet
    @EventHandler(priority = EventPriority.MONITOR)
    public void onInteract(PlayerInteractEvent event) {
        if (event.getHand() == EquipmentSlot.HAND && (event.getAction() == Action.RIGHT_CLICK_AIR || event.getAction() == Action.RIGHT_CLICK_BLOCK)) {
            plugin.getPetManager().onClick(event.getPlayer());
        }
    }

    // Changement de monde : le client du propriétaire repart d'un monde vide
    @EventHandler(priority = EventPriority.MONITOR)
    public void onChangedWorld(PlayerChangedWorldEvent event) {
        Pet pet = plugin.getPetManager().getActivePet(event.getPlayer().getUniqueId());
        if (pet != null) {
            pet.resendToOwner();
        }
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onDeath(PlayerDeathEvent event) {
        Pet pet = plugin.getPetManager().getActivePet(event.getEntity().getUniqueId());
        if (pet != null) {
            pet.hide();
        }
    }

    // Réapparition : le client recrée le joueur, le compagnon revient au tick suivant
    @EventHandler(priority = EventPriority.MONITOR)
    public void onRespawn(PlayerRespawnEvent event) {
        Player player = event.getPlayer();
        Bukkit.getScheduler().runTask(plugin, () -> {
            Pet pet = plugin.getPetManager().getActivePet(player.getUniqueId());
            if (pet != null && player.isOnline() && player.getGameMode() != GameMode.SPECTATOR) {
                pet.resendToOwner();
                pet.show();
            }
        });
    }

    // Un spectateur n'a pas de compagnon, ni pour les autres ni pour lui
    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onGameMode(PlayerGameModeChangeEvent event) {
        Player player = event.getPlayer();
        Pet pet = plugin.getPetManager().getActivePet(player.getUniqueId());
        if (pet == null) {
            return;
        }
        if (event.getNewGameMode() == GameMode.SPECTATOR) {
            pet.hide();
        } else if (player.getGameMode() == GameMode.SPECTATOR) {
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (player.isOnline() && !player.isDead()) {
                    pet.show();
                }
            });
        }
    }
}
