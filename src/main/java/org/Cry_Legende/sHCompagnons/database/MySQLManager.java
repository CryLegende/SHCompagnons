package org.Cry_Legende.sHCompagnons.database;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.bukkit.Bukkit;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;


import java.sql.*;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.logging.Level;

public class MySQLManager implements DatabaseManager {

    private final SHCompagnons plugin;
    private HikariDataSource dataSource;

    public MySQLManager(@NotNull SHCompagnons plugin) {
        this.plugin = plugin;
    }

    @Override
    public void init() {
        HikariConfig config = new HikariConfig();
        // Configuration de base
        config.setJdbcUrl("jdbc:mysql://" + plugin.getConfigManager().getDbHost() + ":" + plugin.getConfigManager().getDbPort() + "/" + plugin.getConfigManager().getDbName() + "?useSSL=" + plugin.getConfigManager().isDbUseSSL());
        config.setUsername(plugin.getConfigManager().getDbUser());
        config.setPassword(plugin.getConfigManager().getDbPass());

        // Pooling (ajustez si nécessaire)
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000); // 30 secondes
        config.setIdleTimeout(600000); // 10 minutes
        config.setMaxLifetime(1800000); // 30 minutes

        // Propriétés MySQL recommandées pour la performance (via config.yml ou directement ici)
        plugin.getConfigManager().getDbProperties().forEach(config::addDataSourceProperty);
        // Exemples de propriétés souvent utilisées (si non dans config.yml):
        // config.addDataSourceProperty("cachePrepStmts", "true");
        // config.addDataSourceProperty("prepStmtCacheSize", "250");
        // config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        // config.addDataSourceProperty("useServerPrepStmts", "true");


        try {
            this.dataSource = new HikariDataSource(config);
            plugin.getLogger().info("Connexion MySQL (HikariCP) établie à " + config.getJdbcUrl());
            createTables();
        } catch (Exception e) { // HikariDataSource peut lever diverses exceptions
            plugin.getLogger().log(Level.SEVERE, "Impossible d'établir la connexion MySQL (HikariCP): ", e);
            throw new RuntimeException("Echec de l'initialisation du pool de connexions MySQL", e);
        }
    }

    private void createTables() throws SQLException {
        String query = "CREATE TABLE IF NOT EXISTS player_pets (" +
            "uuid VARCHAR(36) PRIMARY KEY NOT NULL," +
            "pet_type VARCHAR(255) NULL" + // pet_type peut être null
            ");";
        try (Connection conn = dataSource.getConnection(); Statement statement = conn.createStatement()) {
            statement.execute(query);
            plugin.getLogger().info("Table 'player_pets' (MySQL) vérifiée/créée.");
        }
    }

    @NotNull
    @Override
    public CompletableFuture<String> getPlayerPetType(@NotNull UUID playerUUID) {
        return CompletableFuture.supplyAsync(() -> {
            String query = "SELECT pet_type FROM player_pets WHERE uuid = ?;";
            try (Connection conn = dataSource.getConnection();
                 PreparedStatement ps = conn.prepareStatement(query)) {
                ps.setString(1, playerUUID.toString());
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    return rs.getString("pet_type");
                }
            } catch (SQLException e) {
                plugin.getLogger().log(Level.SEVERE, "Erreur MySQL (getPlayerPetType) pour " + playerUUID, e);
            }
            return null;
        }, runnable -> Bukkit.getScheduler().runTaskAsynchronously(plugin, runnable));
    }

    @NotNull
    @Override
    public CompletableFuture<Void> setPlayerPetType(@NotNull UUID playerUUID, @Nullable String petType) {
        return CompletableFuture.runAsync(() -> {
            // UPSERT pour MySQL: INSERT ... ON DUPLICATE KEY UPDATE
            String query = "INSERT INTO player_pets (uuid, pet_type) VALUES (?, ?) ON DUPLICATE KEY UPDATE pet_type = VALUES(pet_type);";
            try (Connection conn = dataSource.getConnection();
                 PreparedStatement ps = conn.prepareStatement(query)) {
                ps.setString(1, playerUUID.toString());
                if (petType != null) {
                    ps.setString(2, petType);
                } else {
                    ps.setNull(2, Types.VARCHAR);
                }
                ps.executeUpdate();
            } catch (SQLException e) {
                plugin.getLogger().log(Level.SEVERE, "Erreur MySQL (setPlayerPetType) pour " + playerUUID, e);
            }
        }, runnable -> Bukkit.getScheduler().runTaskAsynchronously(plugin, runnable));
    }

    @NotNull
    @Override
    public CompletableFuture<Void> removePlayerPet(@NotNull UUID playerUUID) {
        return setPlayerPetType(playerUUID, null);
    }

    @Override
    public void close() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            plugin.getLogger().info("Pool de connexions MySQL (HikariCP) fermé.");
        }
    }
}
