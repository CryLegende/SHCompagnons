package org.Cry_Legende.sHCompagnons.commands;

import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.Cry_Legende.sHCompagnons.config.ConfigManager;
import org.Cry_Legende.sHCompagnons.config.PetType;
import org.Cry_Legende.sHCompagnons.model.ModelLibrary;
import org.Cry_Legende.sHCompagnons.network.RemotePlayers;
import org.bukkit.Bukkit;
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
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.stream.Collectors;

public class CompagnonCommand implements CommandExecutor, TabCompleter {

    /** Nom canonique de la commande : affiché dans tous les messages, jamais l'alias tapé. */
    private static final String ROOT = "shcompagnons";
    private static final List<String> SUBCOMMANDS = List.of("set", "unset", "preview", "models", "reload", "info");

    private final SHCompagnons plugin;

    public CompagnonCommand(@NotNull SHCompagnons plugin) {
        this.plugin = plugin;
    }

    /** Permission d'une sous-commande ; models est rangée sous reload, comme à l'origine. */
    private static String permission(String subCommand) {
        return "shcompagnons.admin." + (subCommand.equals("models") ? "reload" : subCommand);
    }

    /** Sous-commandes que l'expéditeur a le droit d'utiliser. */
    private List<String> usableSubcommands(CommandSender sender) {
        List<String> usable = new ArrayList<>();
        for (String sub : SUBCOMMANDS) {
            if (sender.hasPermission(permission(sub))) {
                usable.add(sub);
            }
        }
        return usable;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        List<String> usable = usableSubcommands(sender);
        if (usable.isEmpty()) {
            plugin.getConfigManager().sendMessage(sender, "admin_no_permission_command");
            return true;
        }
        String subCommand = args.length > 0 ? args[0].toLowerCase(Locale.ROOT) : "";
        if (!usable.contains(subCommand)) {
            plugin.getConfigManager().sendMessage(sender, "admin_usage", Map.of("{subcommands}", String.join("|", usable)));
            return true;
        }

        switch (subCommand) {
            case "set":
                if (args.length < 3) {
                    plugin.getConfigManager().sendMessage(sender, "admin_usage_set", Map.of("{command_label}", ROOT));
                    return true;
                }
                handleSetCommand(sender, args[1], args[2], ROOT);
                break;

            case "unset":
                if (args.length < 2) {
                    plugin.getConfigManager().sendMessage(sender, "admin_usage_unset", Map.of("{command_label}", ROOT));
                    return true;
                }
                handleUnsetCommand(sender, args[1], ROOT);
                break;

            case "reload":
                handleReloadCommand(sender);
                break;

            case "preview":
                if (args.length < 2 || !(sender instanceof Player player)) {
                    plugin.getConfigManager().sendMessage(sender, "admin_usage_preview", Map.of("{command_label}", ROOT));
                    return true;
                }
                handlePreviewCommand(player, args[1], args.length > 2 ? args[2] : null);
                break;

            case "models":
                handleModelsCommand(sender);
                break;

            default:
                if (args.length < 2) {
                    plugin.getConfigManager().sendMessage(sender, "admin_usage_info", Map.of("{command_label}", ROOT));
                    return true;
                }
                handleInfoCommand(sender, args[1]);
                break;
        }
        return true;
    }

    /** Joueur connecté sur un autre serveur du réseau, ou null (et toujours null sans SHNetwork). */
    private RemotePlayers.Remote findRemote(@NotNull String playerName) {
        RemotePlayers remotePlayers = plugin.getRemotePlayers();
        return remotePlayers == null ? null : remotePlayers.find(playerName);
    }

    private void handleSetCommand(@NotNull CommandSender sender, @NotNull String playerName, @NotNull String petTypeKey, @NotNull String label) {
        Player target = Bukkit.getPlayerExact(playerName);
        RemotePlayers.Remote remote = target == null ? findRemote(playerName) : null;
        if (target == null && remote == null) {
            plugin.getConfigManager().sendMessage(sender, "admin_player_not_online", Map.of("{player}", playerName));
            return;
        }

        PetType petConfig = plugin.getConfigManager().getPetType(petTypeKey);
        if (petConfig == null) {
            plugin.getConfigManager().sendMessage(sender, "admin_pet_type_not_exists", Map.of("{pet_type_key}", petTypeKey));
            java.util.Set<String> availableTypes = plugin.getConfigManager().getPetTypes();
            if (!availableTypes.isEmpty()) {
                // Pas de préfixe pour ce message car il est une suite du précédent.
                sender.sendMessage(plugin.getConfigManager().getMessage("admin_available_types_info", Map.of("{types_list}", String.join(", ", availableTypes))));
            }
            return;
        }

        if (remote != null) {
            // Le serveur du joueur le lui donne (même configuration des compagnons partout) et le prévient
            plugin.getRemotePlayers().runFor(remote.uuid(), "shcompagnons set " + remote.name() + " " + petConfig.key());
            plugin.getConfigManager().sendMessage(sender, "admin_pet_set_success", Map.of(
                "{pet_display_name}", petConfig.displayName(),
                "{player}", remote.name()
            ));
            return;
        }

        plugin.getPetManager().setPet(target, petConfig); // Le message au joueur cible est géré dans PetManager
        plugin.getConfigManager().sendMessage(sender, "admin_pet_set_success", Map.of(
            "{pet_display_name}", petConfig.displayName(),
            "{player}", target.getName()
        ));
    }

    private void handleUnsetCommand(@NotNull CommandSender sender, @NotNull String playerName, @NotNull String label) {
        Player target = Bukkit.getPlayerExact(playerName);
        RemotePlayers.Remote remote = target == null ? findRemote(playerName) : null;
        if (target == null && remote == null) {
            plugin.getConfigManager().sendMessage(sender, "admin_player_not_online", Map.of("{player}", playerName));
            return;
        }
        if (remote != null) {
            unsetRemote(sender, remote);
            return;
        }

        if (plugin.getPetManager().getPlayerPetTypeKey(target) != null) {
            finishUnset(sender, target);
            return;
        }

        // Pas de join() : attendre la base sur le thread principal gèle tout le serveur si elle tarde,
        // et le Watchdog finit par l'arrêter. On reprend sur le thread principal une fois la réponse reçue.
        plugin.getDatabaseManager().getPlayerPetType(target.getUniqueId()).whenComplete((petType, error) -> {
            if (error != null) {
                plugin.getLogger().log(Level.WARNING, "Lecture du compagnon de " + target.getName() + " impossible, retrait quand même", error);
            }
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (error == null && petType == null) {
                    plugin.getConfigManager().sendMessage(sender, "admin_player_no_pet_to_unset", Map.of("{player}", target.getName()));
                    return;
                }
                finishUnset(sender, target);
            });
        });
    }

    /** Joueur d'un autre serveur : le compagnon est en base commune, son serveur le lui retire et le prévient. */
    private void unsetRemote(@NotNull CommandSender sender, @NotNull RemotePlayers.Remote remote) {
        plugin.getDatabaseManager().getPlayerPetType(remote.uuid()).whenComplete((petType, error) -> {
            if (error != null) {
                plugin.getLogger().log(Level.WARNING, "Lecture du compagnon de " + remote.name() + " impossible, retrait quand même", error);
            }
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (error == null && petType == null) {
                    plugin.getConfigManager().sendMessage(sender, "admin_player_no_pet_to_unset", Map.of("{player}", remote.name()));
                    return;
                }
                plugin.getRemotePlayers().runFor(remote.uuid(), "shcompagnons unset " + remote.name());
                plugin.getConfigManager().sendMessage(sender, "admin_pet_unset_success", Map.of("{player}", remote.name()));
            });
        });
    }

    private void finishUnset(@NotNull CommandSender sender, @NotNull Player target) {
        plugin.getPetManager().removePetAndClearDatabase(target); // Message au joueur cible dans PetManager
        plugin.getConfigManager().sendMessage(sender, "admin_pet_unset_success", Map.of("{player}", target.getName()));
    }

    private void handleReloadCommand(@NotNull CommandSender sender) {
        // Fichiers lus en mode strict avant de toucher à l'état : un YAML invalide ne vide plus les compagnons
        ConfigManager.Problem problem = plugin.getConfigManager().validate();
        if (problem != null) {
            plugin.getLogger().warning("Rechargement refusé, configuration précédente gardée ("
                + (problem.file() != null ? problem.file() + " : " + problem.reason() : problem.reason()) + ").");
            if (problem.file() == null) {
                plugin.getConfigManager().sendMessage(sender, "admin_reload_no_pets");
            } else {
                plugin.getConfigManager().sendMessage(sender, "admin_reload_error",
                    Map.of("{file}", problem.file(), "{error}", problem.reason()));
            }
            return;
        }
        plugin.getConfigManager().sendMessage(sender, "admin_reload_start");
        plugin.getConfigManager().loadConfig();
        plugin.getPetManager().reloadAll();
        plugin.getConfigManager().sendMessage(sender, "admin_reload_success", Map.of(
            "{pets}", String.valueOf(plugin.getConfigManager().getPetTypes().size()),
            "{models}", String.valueOf(plugin.getConfigManager().getModels().all().size())));
        plugin.getConfigManager().sendMessage(sender, "admin_reload_restart");
        plugin.getLogger().info("Configuration rechargée par " + sender.getName());
    }

    /** Compagnon enregistré en base pour un joueur : en ligne ici, en ligne sur un autre serveur, ou UUID. */
    private void handleInfoCommand(@NotNull CommandSender sender, @NotNull String playerArg) {
        UUID uuid;
        String name;
        Player online = Bukkit.getPlayerExact(playerArg);
        RemotePlayers.Remote remote = online == null ? findRemote(playerArg) : null;
        if (online != null) {
            uuid = online.getUniqueId();
            name = online.getName();
        } else if (remote != null) {
            uuid = remote.uuid();
            name = remote.name();
        } else {
            // Jamais Bukkit.getOfflinePlayer(nom) : il interroge Mojang et rend l'UUID premium, pas celui du réseau
            try {
                uuid = UUID.fromString(playerArg);
                name = playerArg;
            } catch (IllegalArgumentException e) {
                plugin.getConfigManager().sendMessage(sender, "admin_player_not_online", Map.of("{player}", playerArg));
                return;
            }
        }
        final String shownName = name;
        plugin.getDatabaseManager().getPlayerPetType(uuid).whenComplete((petType, error) ->
            Bukkit.getScheduler().runTask(plugin, () -> {
                if (error != null) {
                    plugin.getLogger().log(Level.WARNING, "Lecture du compagnon de " + shownName + " impossible", error);
                    plugin.getConfigManager().sendMessage(sender, "admin_info_error");
                } else if (petType == null) {
                    plugin.getConfigManager().sendMessage(sender, "admin_info_none", Map.of("{player}", shownName));
                } else {
                    PetType type = plugin.getConfigManager().getPetType(petType);
                    if (type == null) {
                        plugin.getConfigManager().sendMessage(sender, "admin_info_unknown_type",
                            Map.of("{player}", shownName, "{pet_type_key}", petType));
                    } else {
                        plugin.getConfigManager().sendMessage(sender, "admin_info_line", Map.of(
                            "{player}", shownName, "{pet_type_key}", type.key(), "{pet_display_name}", type.displayName()));
                    }
                }
            }));
    }

    /** Montre un compagnon sur soi quelques secondes, sans l'enregistrer : pour régler un modèle. */
    private void handlePreviewCommand(@NotNull Player player, @NotNull String petTypeKey, String secondsArg) {
        PetType type = plugin.getConfigManager().getPetType(petTypeKey);
        if (type == null) {
            plugin.getConfigManager().sendMessage(player, "admin_pet_type_not_exists", Map.of("{pet_type_key}", petTypeKey));
            return;
        }
        int seconds = 30;
        if (secondsArg != null) {
            try {
                seconds = Math.max(1, Math.min(600, Integer.parseInt(secondsArg)));
            } catch (NumberFormatException ignored) {
                // durée par défaut
            }
        }
        plugin.getPetManager().preview(player, type, seconds);
        plugin.getConfigManager().sendMessage(player, "admin_preview_start", Map.of(
            "{pet_display_name}", type.displayName(),
            "{seconds}", String.valueOf(seconds)));
    }

    /** Modèles du dossier models/ : nom, nombre d'entités et taille d'origine. */
    private void handleModelsCommand(@NotNull CommandSender sender) {
        Map<String, ModelLibrary.Model> models = plugin.getConfigManager().getModels().all();
        if (models.isEmpty()) {
            plugin.getConfigManager().sendMessage(sender, "admin_models_empty");
            return;
        }
        plugin.getConfigManager().sendMessage(sender, "admin_models_header", Map.of("{count}", String.valueOf(models.size())));
        for (ModelLibrary.Model model : models.values()) {
            sender.sendMessage(plugin.getConfigManager().getMessage("admin_models_line", Map.of(
                "{model}", model.name(),
                "{parts}", String.valueOf(model.parts().size()),
                "{x}", format(model.size().x),
                "{y}", format(model.size().y),
                "{z}", format(model.size().z)), false));
        }
    }

    private static String format(float value) {
        return String.format(Locale.ROOT, "%.2f", value);
    }

    @NotNull
    @Override
    public List<String> onTabComplete(@NotNull CommandSender sender, @NotNull Command command, @NotNull String alias, @NotNull String[] args) {
        final List<String> completions = new ArrayList<>();
        List<String> options = new ArrayList<>();

        if (args.length == 1) {
            options.addAll(usableSubcommands(sender));
        } else if (args.length == 2 && args[0].equalsIgnoreCase("preview")) {
            if (sender.hasPermission("shcompagnons.admin.preview")) {
                options.addAll(plugin.getConfigManager().getPetTypes());
            }
        } else if (args.length == 2) {
            String subCommand = args[0].toLowerCase(Locale.ROOT);
            if (subCommand.equals("set") || subCommand.equals("unset") || subCommand.equals("info")) {
                if (sender.hasPermission("shcompagnons.admin." + subCommand)) {
                    options.addAll(Bukkit.getOnlinePlayers().stream().map(Player::getName).collect(Collectors.toList()));
                    if (plugin.getRemotePlayers() != null) {
                        options.addAll(plugin.getRemotePlayers().names());
                    }
                }
            }
        } else if (args.length == 3) {
            if (args[0].equalsIgnoreCase("set")) {
                if (sender.hasPermission("shcompagnons.admin.set")) {
                    options.addAll(plugin.getConfigManager().getPetTypes());
                }
            }
        }
        StringUtil.copyPartialMatches(args[args.length - 1], options, completions);
        Collections.sort(completions);
        return completions;
    }
}
