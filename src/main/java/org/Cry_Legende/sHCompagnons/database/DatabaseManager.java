package org.Cry_Legende.sHCompagnons.database;

// import org.bukkit.entity.Player; // Not directly used in this interface

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;


import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public interface DatabaseManager {
    void init() throws Exception;

    @NotNull
    CompletableFuture<String> getPlayerPetType(@NotNull UUID playerUUID);

    @NotNull
    CompletableFuture<Void> setPlayerPetType(@NotNull UUID playerUUID, @Nullable String petType); // petType can be null to remove

    @NotNull
    CompletableFuture<Void> removePlayerPet(@NotNull UUID playerUUID); // Equivalent to setPlayerPetType(uuid, null)

    void close();
}
