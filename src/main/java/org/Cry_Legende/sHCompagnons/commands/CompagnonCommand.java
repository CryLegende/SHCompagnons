package org.Cry_Legende.sHCompagnons.commands;

import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.Cry_Legende.sHCompagnons.config.PetConfig;
import org.bukkit.Bukkit;
// import org.bukkit.ChatColor; // Remplacé par l'usage de ConfigManager pour les messages
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;
import org.bukkit.util.StringUtil;
import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class CompagnonCommand implements CommandExecutor, TabCompleter {

    private final SHCompagnons plugin;

    public CompagnonCommand(@NotNull SHCompagnons plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (args.length == 0 || args[0].equalsIgnoreCase("help")) {
            if (!sender.hasPermission("shcompagnons.admin")) {
                plugin.getConfigManager().sendMessage(sender, "admin_no_permission_command",
                    Map.of("{command_label}", label));
                return true;
            }
            sendHelp(sender, label);
            return true;
        }

        String subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "set":
                if (!sender.hasPermission("shcompagnons.admin.set")) {
                    plugin.getConfigManager().sendMessage(sender, "admin_no_permission_subcommand");
                    return true;
                }
                if (args.length < 3) {
                    plugin.getConfigManager().sendMessage(sender, "admin_usage_set", Map.of("{command_label}", label));
                    return true;
                }
                handleSetCommand(sender, args[1], args[2], label);
                break;

            case "unset":
                if (!sender.hasPermission("shcompagnons.admin.unset")) {
                    plugin.getConfigManager().sendMessage(sender, "admin_no_permission_subcommand");
                    return true;
                }
                if (args.length < 2) {
                    plugin.getConfigManager().sendMessage(sender, "admin_usage_unset", Map.of("{command_label}", label));
                    return true;
                }
                handleUnsetCommand(sender, args[1], label);
                break;

            case "reload":
                if (!sender.hasPermission("shcompagnons.admin.reload")) {
                    plugin.getConfigManager().sendMessage(sender, "admin_no_permission_subcommand");
                    return true;
                }
                handleReloadCommand(sender);
                break;

            default:
                if (!sender.hasPermission("shcompagnons.admin")) {
                    plugin.getConfigManager().sendMessage(sender, "admin_unknown_command_no_help_permission");
                    return true;
                }
                sendHelp(sender, label);
                break;
        }
        return true;
    }

    private void handleSetCommand(@NotNull CommandSender sender, @NotNull String playerName, @NotNull String petTypeKey, @NotNull String label) {
        Player target = Bukkit.getPlayerExact(playerName);
        if (target == null) {
            plugin.getConfigManager().sendMessage(sender, "admin_player_not_online", Map.of("{player}", playerName));
            return;
        }

        PetConfig petConfig = plugin.getConfigManager().getPetConfig(petTypeKey);
        if (petConfig == null) {
            plugin.getConfigManager().sendMessage(sender, "admin_pet_type_not_exists", Map.of("{pet_type_key}", petTypeKey));
            Set<String> availableTypes = plugin.getConfigManager().getPetTypes();
            if (!availableTypes.isEmpty()) {
                // Pas de préfixe pour ce message car il est une suite du précédent.
                sender.sendMessage(plugin.getConfigManager().getMessage("admin_available_types_info", Map.of("{types_list}", String.join(", ", availableTypes))));
            }
            return;
        }

        plugin.getPetManager().setPet(target, petTypeKey); // Le message au joueur cible est géré dans PetManager
        plugin.getConfigManager().sendMessage(sender, "admin_pet_set_success", Map.of(
            "{pet_display_name}", petConfig.getDisplayName(),
            "{player}", target.getName()
        ));
    }

    private void handleUnsetCommand(@NotNull CommandSender sender, @NotNull String playerName, @NotNull String label) {
        Player target = Bukkit.getPlayerExact(playerName);
        if (target == null) {
            plugin.getConfigManager().sendMessage(sender, "admin_player_not_online", Map.of("{player}", playerName));
            return;
        }

        if (plugin.getPetManager().getPlayerPetTypeKey(target) == null &&
            plugin.getDatabaseManager().getPlayerPetType(target.getUniqueId()).join() == null) { // join() pour attendre le résultat async
            plugin.getConfigManager().sendMessage(sender, "admin_player_no_pet_to_unset", Map.of("{player}", target.getName()));
            return;
        }

        plugin.getPetManager().removePetAndClearDatabase(target); // Message au joueur cible dans PetManager
        plugin.getConfigManager().sendMessage(sender, "admin_pet_unset_success", Map.of("{player}", target.getName()));
    }

    private void handleReloadCommand(@NotNull CommandSender sender) {
        plugin.getConfigManager().sendMessage(sender, "admin_reload_start");
        plugin.getConfigManager().loadConfig();
        plugin.getPetManager().reloadPetDataForOnlinePlayers();
        plugin.getConfigManager().sendMessage(sender, "admin_reload_success");
        plugin.getLogger().info("Configuration rechargée par " + sender.getName());
    }

    private void sendHelp(@NotNull CommandSender sender, @NotNull String label) {
        // Pas de préfixe global ici car les messages d'aide ont souvent leur propre formatage
        sender.sendMessage(plugin.getConfigManager().getMessage("help_header",
            Map.of("{plugin_version}", plugin.getDescription().getVersion())));

        if (sender.hasPermission("shcompagnons.admin.set"))
            sender.sendMessage(plugin.getConfigManager().getMessage("help_set", Map.of("{command_label}", label)));
        if (sender.hasPermission("shcompagnons.admin.unset"))
            sender.sendMessage(plugin.getConfigManager().getMessage("help_unset", Map.of("{command_label}", label)));
        if (sender.hasPermission("shcompagnons.admin.reload"))
            sender.sendMessage(plugin.getConfigManager().getMessage("help_reload", Map.of("{command_label}", label)));

        sender.sendMessage(plugin.getConfigManager().getMessage("help_footer", Map.of("{command_label}", label)));
    }

    @NotNull
    @Override
    public List<String> onTabComplete(@NotNull CommandSender sender, @NotNull Command command, @NotNull String alias, @NotNull String[] args) {
        final List<String> completions = new ArrayList<>();
        List<String> options = new ArrayList<>();

        if (args.length == 1) {
            if (sender.hasPermission("shcompagnons.admin.set")) options.add("set");
            if (sender.hasPermission("shcompagnons.admin.unset")) options.add("unset");
            if (sender.hasPermission("shcompagnons.admin.reload")) options.add("reload");
            if (sender.hasPermission("shcompagnons.admin")) options.add("help");
        } else if (args.length == 2) {
            String subCommand = args[0].toLowerCase();
            if (subCommand.equals("set") || subCommand.equals("unset")) {
                if (sender.hasPermission("shcompagnons.admin." + subCommand)) {
                    options.addAll(Bukkit.getOnlinePlayers().stream().map(Player::getName).collect(Collectors.toList()));
                }
            }
        } else if (args.length == 3) {
            if (args[0].equalsIgnoreCase("set")) {
                if (sender.hasPermission("shcompagnons.admin.set")) {
                    Set<String> petTypes = plugin.getConfigManager().getPetTypes();
                    if (petTypes != null) {
                        options.addAll(petTypes);
                    }
                }
            }
        }
        StringUtil.copyPartialMatches(args[args.length - 1], options, completions);
        Collections.sort(completions);
        return completions;
    }
}
