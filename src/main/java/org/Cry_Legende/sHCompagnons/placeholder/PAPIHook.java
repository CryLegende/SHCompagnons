package org.Cry_Legende.sHCompagnons.placeholder;

import me.clip.placeholderapi.expansion.PlaceholderExpansion;
import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.bukkit.OfflinePlayer;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

public class PAPIHook extends PlaceholderExpansion {

    private final SHCompagnons plugin;

    public PAPIHook(@NotNull SHCompagnons plugin) {
        this.plugin = plugin;
    }

    @Override
    @NotNull
    public String getIdentifier() {
        return "shcompagnons"; // Sera utilisé comme %shcompagnons_...%
    }

    @Override
    @NotNull
    public String getAuthor() {
        return String.join(", ", plugin.getDescription().getAuthors());
    }

    @Override
    @NotNull
    public String getVersion() {
        return plugin.getDescription().getVersion();
    }

    @Override
    public boolean persist() {
        return true;
    }

    @Override
    @Nullable
    public String onRequest(OfflinePlayer offlinePlayer, @NotNull String params) {
        if (offlinePlayer == null) return null; // Joueur non trouvé

        Player player = offlinePlayer.getPlayer(); // Peut être null si le joueur est hors ligne

        if (params.equalsIgnoreCase("current_pet_displayname")) {
            if (player == null) return ""; // Ou une valeur par défaut pour les joueurs hors ligne
            return plugin.getPetManager().getPlayerPetDisplayName(player);
        }
        if (params.equalsIgnoreCase("current_pet_type")) {
            if (player == null) return "";
            String type = plugin.getPetManager().getPlayerPetTypeKey(player);
            return type != null ? type : "";
        }
        // Ajoutez d'autres placeholders ici si besoin

        return null; // Placeholder inconnu
    }
}