package org.Cry_Legende.sHCompagnons.database;

import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.bukkit.Bukkit;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.io.File;
import java.sql.*;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.logging.Level;

public class SQLiteManager implements DatabaseManager {

    private final SHCompagnons plugin;
    private Connection connection;
    private final String dbPath;

    public SQLiteManager(@NotNull SHCompagnons plugin, @NotNull String dbPath) {
        this.plugin = plugin;
        this.dbPath = dbPath;
    }

    @Override
    public void init() throws SQLException {
        try {
            Class.forName("org.sqlite.JDBC"); // Shaded, so should be found
            File dbFile = new File(dbPath);
            if (!dbFile.getParentFile().exists()) {
                if (!dbFile.getParentFile().mkdirs()) {
                    throw new SQLException("Impossible de créer les dossiers parents pour la base de données SQLite: " + dbFile.getParentFile());
                }
            }
            connection = DriverManager.getConnection("jdbc:sqlite:" + dbPath);
            plugin.getLogger().info("Connexion SQLite établie avec: " + dbPath);
            createTables();
        } catch (ClassNotFoundException e) {
            plugin.getLogger().log(Level.SEVERE, "Driver SQLite (org.sqlite.JDBC) non trouvé! Assurez-vous qu'il est inclus (shaded).", e);
            throw new SQLException("Driver SQLite non trouvé", e);
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Impossible d'établir la connexion SQLite à " + dbPath + ": " + e.getMessage(), e);
            throw e;
        }
    }

    private void createTables() throws SQLException {
        String query = "CREATE TABLE IF NOT EXISTS player_pets (" +
            "uuid VARCHAR(36) PRIMARY KEY NOT NULL," +
            "pet_type VARCHAR(255) NULL" + // pet_type peut être null si le joueur n'a pas de pet
            ");";
        try (Statement statement = connection.createStatement()) {
            statement.execute(query);
            plugin.getLogger().info("Table 'player_pets' (SQLite) vérifiée/créée.");
        }
    }

    @NotNull
    @Override
    public CompletableFuture<String> getPlayerPetType(@NotNull UUID playerUUID) {
        return CompletableFuture.supplyAsync(() -> {
            String query = "SELECT pet_type FROM player_pets WHERE uuid = ?;";
            try (PreparedStatement ps = connection.prepareStatement(query)) {
                ps.setString(1, playerUUID.toString());
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    return rs.getString("pet_type"); // Peut être null
                }
            } catch (SQLException e) {
                plugin.getLogger().log(Level.SEVERE, "Erreur SQLite (getPlayerPetType) pour " + playerUUID, e);
            }
            return null; // Aucun pet trouvé ou erreur
        }, runnable -> Bukkit.getScheduler().runTaskAsynchronously(plugin, runnable));
    }

    @NotNull
    @Override
    public CompletableFuture<Void> setPlayerPetType(@NotNull UUID playerUUID, @Nullable String petType) {
        return CompletableFuture.runAsync(() -> {
            // UPSERT: Insérer ou remplacer. Si petType est null, cela va effectivement enregistrer null.
            String query = "INSERT OR REPLACE INTO player_pets (uuid, pet_type) VALUES (?, ?);";
            try (PreparedStatement ps = connection.prepareStatement(query)) {
                ps.setString(1, playerUUID.toString());
                if (petType != null) {
                    ps.setString(2, petType);
                } else {
                    ps.setNull(2, Types.VARCHAR);
                }
                ps.executeUpdate();
            } catch (SQLException e) {
                plugin.getLogger().log(Level.SEVERE, "Erreur SQLite (setPlayerPetType) pour " + playerUUID, e);
            }
        }, runnable -> Bukkit.getScheduler().runTaskAsynchronously(plugin, runnable));
    }

    @NotNull
    @Override
    public CompletableFuture<Void> removePlayerPet(@NotNull UUID playerUUID) {
        // Ceci est équivalent à setPlayerPetType(playerUUID, null) avec la logique UPSERT
        return setPlayerPetType(playerUUID, null);
        /*
        // Ou une suppression explicite si l'on veut absolument enlever la ligne (moins flexible si on veut juste "pas de pet")
        return CompletableFuture.runAsync(() -> {
            String query = "DELETE FROM player_pets WHERE uuid = ?;";
            try (PreparedStatement ps = connection.prepareStatement(query)) {
                ps.setString(1, playerUUID.toString());
                ps.executeUpdate();
            } catch (SQLException e) {
                plugin.getLogger().log(Level.SEVERE, "Erreur SQLite (removePlayerPet) pour " + playerUUID, e);
            }
        }, runnable -> Bukkit.getScheduler().runTaskAsynchronously(plugin, runnable));
        */
    }


    @Override
    public void close() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                plugin.getLogger().info("Connexion SQLite fermée.");
            }
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Erreur lors de la fermeture de la connexion SQLite.", e);
        }
    }
}
