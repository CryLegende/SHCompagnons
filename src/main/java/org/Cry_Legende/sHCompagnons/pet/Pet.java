package org.Cry_Legende.sHCompagnons.pet;

import com.comphenix.protocol.PacketType;
import com.comphenix.protocol.events.PacketContainer;
import com.comphenix.protocol.wrappers.*;
import com.comphenix.protocol.wrappers.WrappedDataWatcher.Registry;
import com.comphenix.protocol.wrappers.WrappedDataWatcher.Serializer;
import com.comphenix.protocol.wrappers.WrappedDataWatcher.WrappedDataWatcherObject;

import com.destroystokyo.paper.profile.PlayerProfile;
import com.destroystokyo.paper.profile.ProfileProperty;
import org.Cry_Legende.sHCompagnons.SHCompagnons;
import org.Cry_Legende.sHCompagnons.config.PetConfig;
import org.bukkit.Bukkit;
import org.bukkit.GameMode;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.World;
import org.bukkit.entity.EntityType;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.SkullMeta;
import org.bukkit.scheduler.BukkitRunnable;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import com.comphenix.protocol.wrappers.Vector3F;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;

public class Pet {

    private static final AtomicInteger lastEntityId = new AtomicInteger(Integer.MAX_VALUE - 20000);

    private final SHCompagnons plugin;
    private final Player owner;
    private PetConfig petConfig;
    private final int entityId;
    private UUID entityUUID;
    private Location currentLocation;
    private boolean logicallyVisible = false;
    private boolean isTransitioningWorld = false;

    private final Set<UUID> viewers = ConcurrentHashMap.newKeySet();

    // Animation de mouvement
    private int currentFrameIndex = 0;
    private int nextFrameIndex = 0;
    private float interpolationProgress = 0.0f;
    private final float animationSpeedModifier = 0.5f;
    private float[] currentAnimationYValues;
    private double lateralAnimationAccumulator = 0;

    // Skin cycling
    private int currentSkinIndex = 0;
    private int skinUpdateTicker = 0;
    private int currentSkinUpdateIntervalTicks = 0;
    private boolean isMultiSkinPet = false;
    private PlayerProfile sharedPlayerProfile; // Profil partagé pour cette instance de Pet

    private final double armorstandBaseVerticalOffset;
    private final float rightArmPoseXDeg;
    private final float rightArmPoseYDeg;
    private final float rightArmPoseZDeg;
    private final double followSpeed;
    private final float armorstandYawOffset;

    private static final float[] ANIM_GLIDE_VERTICAL = new float[]{-0.3F, -0.3F, -0.25F, -0.25F, -0.2F, -0.2F, -0.1F, -0.1F, 0.0F, 0.0F, 0.1F, 0.1F, 0.2F, 0.2F, 0.25F, 0.25F, 0.3F, 0.3F, 0.3F, 0.3F, 0.25F, 0.25F, 0.2F, 0.2F, 0.1F, 0.0F, 0.0F, -0.1F, -0.1F, -0.2F, -0.2F, -0.25F, -0.25F, -0.3F, -0.3F};
    private static final float[] ANIM_BOUNCE_VERTICAL = new float[]{-0.3F, -0.15F, 0.1F, 0.2F, 0.25F, 0.3F, 0.3F, 0.25F, 0.2F, 0.1F, -0.15F};
    private final double PET_VIEW_DISTANCE_SQUARED = 60 * 60;


    public Pet(@NotNull SHCompagnons plugin, @NotNull Player owner, @NotNull PetConfig petConfig) {
        this.plugin = plugin;
        this.owner = owner;
        this.petConfig = petConfig;
        this.entityId = lastEntityId.decrementAndGet();
        this.entityUUID = UUID.randomUUID();

        // Créer un PlayerProfile avec un UUID aléatoire mais constant pour CETTE instance de Pet.
        // Le nom peut être générique.
        this.sharedPlayerProfile = Bukkit.createProfile(UUID.randomUUID(), "sHCompagnonSkin");


        this.armorstandBaseVerticalOffset = plugin.getConfigManager().getArmorstandBaseVerticalOffset();
        this.followSpeed = plugin.getConfigManager().getFollowSpeed();
        this.armorstandYawOffset = (float) plugin.getConfigManager().getArmorstandYawOffsetDegrees();
        this.rightArmPoseXDeg = (float) plugin.getConfigManager().getRightArmPoseXDegrees();
        this.rightArmPoseYDeg = (float) plugin.getConfigManager().getRightArmPoseYDegrees();
        this.rightArmPoseZDeg = (float) plugin.getConfigManager().getRightArmPoseZDegrees();

        setAnimationSpecifics(this.petConfig.getAnimationType());
        initializeSkinCycling();
    }

    private void initializeSkinCycling() {
        this.isMultiSkinPet = this.petConfig.hasMultipleSkins();
        this.currentSkinIndex = 0;
        this.skinUpdateTicker = 0;
        if (this.isMultiSkinPet) {
            this.currentSkinUpdateIntervalTicks = this.petConfig.getEffectiveSkinUpdateIntervalTicks(this.currentSkinIndex);
        } else {
            this.currentSkinUpdateIntervalTicks = 0;
        }
    }

    private void setAnimationSpecifics(AnimationType type) {
        this.currentFrameIndex = 0;
        this.interpolationProgress = 0.0f;
        this.lateralAnimationAccumulator = 0;
        switch (type) {
            case GLIDE:
            case GLIDE_WOBBLE:
                this.currentAnimationYValues = ANIM_GLIDE_VERTICAL;
                break;
            case BOUNCING:
                this.currentAnimationYValues = ANIM_BOUNCE_VERTICAL;
                break;
            default:
                this.currentAnimationYValues = new float[]{0.0f};
                break;
        }
        if (this.currentAnimationYValues != null && this.currentAnimationYValues.length > 0) {
            this.nextFrameIndex = (this.currentAnimationYValues.length > 1) ? 1 : 0;
        } else {
            this.currentAnimationYValues = new float[]{0.0f};
            this.nextFrameIndex = 0;
        }
    }

    private boolean shouldObserverSeePet(@NotNull Player observer) {
        if (owner.getGameMode() == GameMode.SPECTATOR && !observer.getUniqueId().equals(owner.getUniqueId())) {
            return false;
        }
        if (observer.getUniqueId().equals(owner.getUniqueId())) {
            return owner.getGameMode() != GameMode.SPECTATOR;
        }
        return observer.canSee(owner);
    }

    private void sendPacketToRelevantViewers(PacketContainer packet) {
        if (!owner.isOnline() || currentLocation == null || currentLocation.getWorld() == null) return;
        if (!this.logicallyVisible && packet.getType() != PacketType.Play.Server.ENTITY_DESTROY) {
            return;
        }
        World petWorld = currentLocation.getWorld();
        for (Player recipient : Bukkit.getOnlinePlayers()) {
            if (!recipient.getWorld().equals(petWorld) ||
                recipient.getLocation().distanceSquared(owner.getLocation()) > PET_VIEW_DISTANCE_SQUARED) {
                continue;
            }

            boolean sendToThisRecipient = false;
            if (packet.getType() == PacketType.Play.Server.ENTITY_DESTROY) {
                if (viewers.contains(recipient.getUniqueId()) || recipient.getUniqueId().equals(owner.getUniqueId())) {
                    sendToThisRecipient = true;
                }
            } else if (shouldObserverSeePet(recipient)) {
                sendToThisRecipient = true;
            }

            if (sendToThisRecipient) {
                try {
                    plugin.getProtocolManager().sendServerPacket(recipient, packet);
                } catch (Exception e) { /*ignore*/ }
            }
        }
    }

    private void sendPacketsToRelevantViewers(List<PacketContainer> packets) {
        if (!owner.isOnline() || currentLocation == null || currentLocation.getWorld() == null) return;
        boolean containsDestroy = packets.stream().anyMatch(p -> p.getType() == PacketType.Play.Server.ENTITY_DESTROY);
        if (!this.logicallyVisible && !containsDestroy) {
            return;
        }

        World petWorld = currentLocation.getWorld();
        for (Player recipient : Bukkit.getOnlinePlayers()) {
            if (!recipient.getWorld().equals(petWorld) ||
                recipient.getLocation().distanceSquared(owner.getLocation()) > PET_VIEW_DISTANCE_SQUARED) {
                continue;
            }

            boolean sendToThisRecipient = false;
            if (containsDestroy) {
                if (viewers.contains(recipient.getUniqueId()) || recipient.getUniqueId().equals(owner.getUniqueId())) {
                    sendToThisRecipient = true;
                }
            } else if (shouldObserverSeePet(recipient)) {
                sendToThisRecipient = true;
            }

            if (sendToThisRecipient) {
                sendPacketsUnchecked(recipient, packets);
            }
        }
    }

    private void sendPacketsUnchecked(Player recipient, List<PacketContainer> packets) {
        if (recipient.isOnline()) {
            try {
                for (PacketContainer packet : packets) {
                    if (packet != null) plugin.getProtocolManager().sendServerPacket(recipient, packet);
                }
            } catch (Exception e) { /*ignore*/ }
        }
    }

    private void sendPacketUnchecked(Player recipient, PacketContainer packet) {
        if (recipient.isOnline() && packet != null) {
            try {
                plugin.getProtocolManager().sendServerPacket(recipient, packet);
            } catch (Exception e) { /*ignore*/ }
        }
    }

    private List<PacketContainer> getSpawnSequencePackets() {
        if (currentLocation == null) return Collections.emptyList();
        PacketContainer spawnPacket = plugin.getProtocolManager().createPacket(PacketType.Play.Server.SPAWN_ENTITY);
        spawnPacket.getIntegers().write(0, entityId);
        spawnPacket.getUUIDs().write(0, entityUUID);
        spawnPacket.getEntityTypeModifier().write(0, EntityType.ARMOR_STAND);
        spawnPacket.getDoubles().write(0, currentLocation.getX()).write(1, currentLocation.getY()).write(2, currentLocation.getZ());
        spawnPacket.getBytes().write(0, (byte) (currentLocation.getYaw() * 256.0F / 360.0F)).write(1, (byte) (currentLocation.getPitch() * 256.0F / 360.0F));
        List<WrappedDataValue> metadata = createMetadataValuesList();
        PacketContainer metadataPacket = plugin.getProtocolManager().createPacket(PacketType.Play.Server.ENTITY_METADATA);
        metadataPacket.getIntegers().write(0, entityId);
        metadataPacket.getDataValueCollectionModifier().write(0, metadata);
        PacketContainer equipmentPacket = createEquipmentPacket();
        PacketContainer headRotationPacket = createHeadRotationPacket(currentLocation.getYaw());
        return List.of(spawnPacket, metadataPacket, equipmentPacket, headRotationPacket);
    }

    public void spawnForPlayer(@NotNull Player viewer) {
        if (!logicallyVisible || currentLocation == null) return;
        if (shouldObserverSeePet(viewer)) {
            sendPacketsUnchecked(viewer, getSpawnSequencePackets());
            viewers.add(viewer.getUniqueId());
            plugin.getLogger().finer("[Pet " + entityId + "] Spawné pour observer: " + viewer.getName());
        } else {
            plugin.getLogger().finer("[Pet " + entityId + "] Non spawné pour " + viewer.getName() + " (ne devrait pas voir le pet).");
        }
    }

    public void despawnForPlayer(@NotNull Player viewer) {
        if (viewers.remove(viewer.getUniqueId())) {
            PacketContainer destroyPacket = plugin.getProtocolManager().createPacket(PacketType.Play.Server.ENTITY_DESTROY);
            destroyPacket.getIntLists().write(0, List.of(entityId));
            sendPacketUnchecked(viewer, destroyPacket);
            plugin.getLogger().finer("[Pet " + entityId + "] Despawné pour observer: " + viewer.getName());
        }
    }

    public void spawn() {
        if (!owner.isOnline() || !owner.isValid()) {
            this.logicallyVisible = false;
            plugin.getLogger().fine("Spawn annulé pour le pet de " + owner.getName() + ": propriétaire invalide/offline.");
            return;
        }
        if (this.logicallyVisible && !viewers.isEmpty() && !this.isTransitioningWorld) {
            plugin.getLogger().finer("[Pet " + entityId + "] Tentative de spawn sur un pet déjà logiquement visible. Nettoyage des viewers actuels.");
            despawnForAllViewers(false);
        } else if (this.isTransitioningWorld) {
            plugin.getLogger().finer("[Pet " + entityId + "] Spawn appelé pendant une transition de monde, attente.");
        }

        float initialPetYaw = Location.normalizeYaw(owner.getLocation().getYaw() + this.armorstandYawOffset);
        this.currentLocation = calculateFinalPetLocation(owner.getLocation(), initialPetYaw);
        this.logicallyVisible = true;
        this.isTransitioningWorld = false;

        initializeSkinCycling();

        updateViewersForNearbyPlayers();
        plugin.getLogger().fine("Pet " + petConfig.getTypeKey() + " (ID: " + entityId + ") logiquement spawné pour " + owner.getName());
    }

    private PacketContainer createHeadRotationPacket(float yaw) {
        PacketContainer headRotationPacket = plugin.getProtocolManager().createPacket(PacketType.Play.Server.ENTITY_HEAD_ROTATION);
        headRotationPacket.getIntegers().write(0, entityId);
        headRotationPacket.getBytes().write(0, (byte) (yaw * 256.0F / 360.0F));
        return headRotationPacket;
    }

    private List<WrappedDataValue> createMetadataValuesList() {
        WrappedDataWatcher watcher = new WrappedDataWatcher();
        Serializer byteSerializer = Registry.get(Byte.class);
        Serializer rotationSerializer = Registry.getVectorSerializer();
        watcher.setObject(new WrappedDataWatcherObject(0, byteSerializer), (byte) 0x20);
        byte armorStandFlags = (byte) (0x04 | 0x08 | 0x10);
        watcher.setObject(new WrappedDataWatcherObject(15, byteSerializer), armorStandFlags);
        Vector3F rightArmPosePL_Degrees = new Vector3F(rightArmPoseXDeg, rightArmPoseYDeg, rightArmPoseZDeg);
        watcher.setObject(new WrappedDataWatcherObject(19, rotationSerializer), rightArmPosePL_Degrees);
        Vector3F defaultPosePL_Degrees = new Vector3F(0f, 0f, 0f);
        watcher.setObject(new WrappedDataWatcherObject(16, rotationSerializer), defaultPosePL_Degrees);
        watcher.setObject(new WrappedDataWatcherObject(17, rotationSerializer), defaultPosePL_Degrees);
        watcher.setObject(new WrappedDataWatcherObject(18, rotationSerializer), defaultPosePL_Degrees);
        watcher.setObject(new WrappedDataWatcherObject(20, rotationSerializer), defaultPosePL_Degrees);
        watcher.setObject(new WrappedDataWatcherObject(21, rotationSerializer), defaultPosePL_Degrees);
        List<WrappedDataValue> finalDataValues = new ArrayList<>();
        if (watcher.getWatchableObjects() != null) {
            watcher.getWatchableObjects().stream()
                .filter(Objects::nonNull)
                .forEach(watchableObject -> {
                    WrappedDataWatcherObject watcherObject = watchableObject.getWatcherObject();
                    finalDataValues.add(new WrappedDataValue(
                        watcherObject.getIndex(),
                        watcherObject.getSerializer(),
                        watchableObject.getRawValue()
                    ));
                });
        }
        return finalDataValues;
    }

    @NotNull
    private ItemStack createPetDisplayItem() {
        ItemStack itemToShow = new ItemStack(Material.PLAYER_HEAD);
        SkullMeta skullMeta = (SkullMeta) itemToShow.getItemMeta();

        if (skullMeta == null) {
            plugin.getLogger().severe("Impossible d'obtenir SkullMeta pour PLAYER_HEAD pour le pet " + petConfig.getTypeKey() + ". L'item sera une barrière.");
            return new ItemStack(Material.BARRIER);
        }

        String currentSkinValue = petConfig.getCurrentSkinValue(currentSkinIndex);
        if (currentSkinValue.startsWith("ERROR_")) {
            plugin.getLogger().severe("Valeur de skin invalide ou index hors limites pour le pet " + petConfig.getTypeKey() + " (index: " + currentSkinIndex + ", value: " + currentSkinValue + "). L'item sera une barrière.");
            return new ItemStack(Material.BARRIER);
        }

        try {
            // Réutiliser this.sharedPlayerProfile
            // 1. Effacer les anciennes propriétés de texture
            this.sharedPlayerProfile.getProperties().clear();
            // 2. Ajouter la nouvelle propriété de texture
            this.sharedPlayerProfile.getProperties().add(new ProfileProperty("textures", currentSkinValue, null /* signature optionnelle */));
            // 3. Appliquer le profil mis à jour à la SkullMeta
            skullMeta.setPlayerProfile(this.sharedPlayerProfile);

            itemToShow.setItemMeta(skullMeta);

        } catch (Exception e) {
            plugin.getLogger().log(Level.SEVERE,
                "Erreur INATTENDUE lors de la création du display item du pet (type: " + petConfig.getTypeKey() + ", skin index: " + currentSkinIndex + "). " +
                    "Texture value (début): " + (currentSkinValue.length() > 10 ? currentSkinValue.substring(0, 10) + "..." : "N/A ou trop courte"), e);
            return new ItemStack(Material.BARRIER);
        }
        return itemToShow;
    }

    private PacketContainer createEquipmentPacket() {
        PacketContainer equipmentPacket = plugin.getProtocolManager().createPacket(PacketType.Play.Server.ENTITY_EQUIPMENT);
        equipmentPacket.getIntegers().write(0, entityId);
        List<Pair<EnumWrappers.ItemSlot, ItemStack>> equipmentList = new ArrayList<>();
        ItemStack petItem = createPetDisplayItem();
        equipmentList.add(new Pair<>(EnumWrappers.ItemSlot.MAINHAND, petItem));
        equipmentList.add(new Pair<>(EnumWrappers.ItemSlot.HEAD, new ItemStack(Material.AIR)));
        equipmentList.add(new Pair<>(EnumWrappers.ItemSlot.OFFHAND, new ItemStack(Material.AIR)));
        equipmentPacket.getSlotStackPairLists().write(0, equipmentList);
        return equipmentPacket;
    }

    private void updateViewersForNearbyPlayers() {
        if (!owner.isOnline()) {
            if (logicallyVisible) {
                despawnForAllViewers(true);
            }
            return;
        }
        if (!logicallyVisible) {
            if (!viewers.isEmpty()) despawnForAllViewers(true);
            return;
        }

        World ownerWorld = owner.getWorld();
        if (currentLocation == null || currentLocation.getWorld() == null || !currentLocation.getWorld().equals(ownerWorld)) {
            if (isTransitioningWorld) return;
            plugin.getLogger().warning("[Pet " + entityId + "] UpdateViewers: currentLocation désynchro. Tentative de réalignement sur le monde du owner: " + ownerWorld.getName());
            return;
        }

        List<Player> playersInVicinity = new ArrayList<>();
        for (Player p : Bukkit.getOnlinePlayers()) {
            if (p.getWorld().equals(ownerWorld) &&
                p.getLocation().distanceSquared(owner.getLocation()) <= PET_VIEW_DISTANCE_SQUARED) {
                playersInVicinity.add(p);
            }
        }
        Iterator<UUID> viewerIterator = viewers.iterator();
        while (viewerIterator.hasNext()) {
            UUID viewerId = viewerIterator.next();
            Player viewer = Bukkit.getPlayer(viewerId);
            if (viewer == null || !viewer.isOnline() || !playersInVicinity.contains(viewer) || !shouldObserverSeePet(viewer)) {
                viewerIterator.remove();
                if (viewer != null && viewer.isOnline()) {
                    PacketContainer destroyPacket = plugin.getProtocolManager().createPacket(PacketType.Play.Server.ENTITY_DESTROY);
                    destroyPacket.getIntLists().write(0, List.of(entityId));
                    sendPacketUnchecked(viewer, destroyPacket);
                    plugin.getLogger().finer("[Pet " + entityId + "] Auto-Despawné pour (raison: éloigné/vanish/offline/nepeutplusvoir): " + viewer.getName());
                }
            }
        }
        for (Player potentialViewer : playersInVicinity) {
            if (!viewers.contains(potentialViewer.getUniqueId())) {
                if (shouldObserverSeePet(potentialViewer)) {
                    spawnForPlayer(potentialViewer);
                }
            }
        }
    }

    private void despawnForAllViewers(boolean setLogicallyInvisibleState) {
        if (!viewers.isEmpty()) {
            PacketContainer destroyPacket = plugin.getProtocolManager().createPacket(PacketType.Play.Server.ENTITY_DESTROY);
            destroyPacket.getIntLists().write(0, List.of(entityId));
            new ArrayList<>(viewers).forEach(viewerId -> {
                Player viewer = Bukkit.getPlayer(viewerId);
                if (viewer != null && viewer.isOnline()) {
                    sendPacketUnchecked(viewer, destroyPacket);
                }
            });
            plugin.getLogger().finer("[Pet " + entityId + "] Despawn pour tous les viewers actuels (count avant clear: " + viewers.size() + ") pour " + owner.getName());
            viewers.clear();
        }
        if (setLogicallyInvisibleState) {
            this.logicallyVisible = false;
        }
    }

    public void update() {
        if (!owner.isOnline() || !owner.isValid()) {
            if (this.logicallyVisible) {
                despawn();
            }
            return;
        }
        if (this.isTransitioningWorld) {
            plugin.getLogger().finest("[Pet " + entityId + "] Update suspendu (transition de monde) pour " + owner.getName());
            return;
        }

        updateViewersForNearbyPlayers();

        if (!this.logicallyVisible || viewers.isEmpty()) {
            return;
        }

        if (isMultiSkinPet && currentSkinUpdateIntervalTicks > 0) {
            skinUpdateTicker++;
            if (skinUpdateTicker >= currentSkinUpdateIntervalTicks) {
                skinUpdateTicker = 0;
                currentSkinIndex = (currentSkinIndex + 1) % petConfig.getSkins().size();
                currentSkinUpdateIntervalTicks = petConfig.getEffectiveSkinUpdateIntervalTicks(currentSkinIndex);

                if (logicallyVisible && !viewers.isEmpty()) {
                    sendPacketToRelevantViewers(createEquipmentPacket());
                    plugin.getLogger().finest("[Pet " + entityId + "] Skin mise à jour à l'index " + currentSkinIndex + " pour " + owner.getName() + ". Prochain intervalle: " + currentSkinUpdateIntervalTicks + " ticks.");
                }
            }
        }

        Location ownerFeetLocation = owner.getLocation();
        Location ownerEyeLocation = owner.getEyeLocation();
        float finalArmorStandYaw = Location.normalizeYaw(ownerEyeLocation.getYaw() + this.armorstandYawOffset);
        Location targetPetAbsoluteLocation = calculateFinalPetLocation(ownerFeetLocation, finalArmorStandYaw);
        AnimationType currentAnimType = petConfig.getAnimationType();
        float yAnimOffset = 0.0f;

        if (currentAnimType == AnimationType.BOUNCING || currentAnimType == AnimationType.GLIDE || currentAnimType == AnimationType.GLIDE_WOBBLE) {
            if (currentAnimationYValues != null && currentAnimationYValues.length > 0) {
                float currentFrameValue = currentAnimationYValues[currentFrameIndex];
                float nextFrameValue = currentAnimationYValues[nextFrameIndex];
                yAnimOffset = currentFrameValue + (nextFrameValue - currentFrameValue) * interpolationProgress;
                interpolationProgress += animationSpeedModifier;
                if (interpolationProgress >= 1.0f) {
                    interpolationProgress -= 1.0f;
                    currentFrameIndex = nextFrameIndex;
                    nextFrameIndex = (currentFrameIndex + 1) % currentAnimationYValues.length;
                }
            }
        }
        targetPetAbsoluteLocation.add(0, yAnimOffset, 0);

        if (currentAnimType == AnimationType.WOBBLE_SIDE || currentAnimType == AnimationType.GLIDE_WOBBLE) {
            lateralAnimationAccumulator += 0.05;
            float wobbleAmplitude = 0.15f;
            double playerViewYawRad = Math.toRadians(ownerEyeLocation.getYaw());
            double sideOffsetMagnitude = Math.sin(lateralAnimationAccumulator) * wobbleAmplitude;

            double dX = Math.cos(playerViewYawRad + Math.PI / 2.0) * sideOffsetMagnitude;
            double dZ = Math.sin(playerViewYawRad + Math.PI / 2.0) * sideOffsetMagnitude;
            targetPetAbsoluteLocation.add(dX, 0, dZ);
        }


        if (this.currentLocation == null) {
            this.currentLocation = targetPetAbsoluteLocation.clone();
            if (!viewers.isEmpty()) {
                teleport(this.currentLocation);
            }
            plugin.getLogger().finer("[Pet " + entityId + "] Initialisation/Réinitialisation de currentLocation et TP forcé pour " + owner.getName());
            return;
        }

        Location newActualPetLocation = this.currentLocation.clone();
        newActualPetLocation.setX(this.currentLocation.getX() + (targetPetAbsoluteLocation.getX() - this.currentLocation.getX()) * followSpeed);
        newActualPetLocation.setY(this.currentLocation.getY() + (targetPetAbsoluteLocation.getY() - this.currentLocation.getY()) * followSpeed);
        newActualPetLocation.setZ(this.currentLocation.getZ() + (targetPetAbsoluteLocation.getZ() - this.currentLocation.getZ()) * followSpeed);
        newActualPetLocation.setYaw(targetPetAbsoluteLocation.getYaw());
        newActualPetLocation.setPitch(0);

        if (this.currentLocation.getWorld() == null || newActualPetLocation.getWorld() == null ||
            !this.currentLocation.getWorld().equals(newActualPetLocation.getWorld()) ||
            this.currentLocation.distanceSquared(newActualPetLocation) > plugin.getConfigManager().getMaxDistanceBeforeTeleportSquared()) {
            teleport(newActualPetLocation);
        } else if (this.currentLocation.distanceSquared(newActualPetLocation) > 0.0001 ||
            Math.abs(Location.normalizeYaw(this.currentLocation.getYaw()) - Location.normalizeYaw(newActualPetLocation.getYaw())) > 0.1) {
            double deltaX = (newActualPetLocation.getX() - this.currentLocation.getX()) * 4096;
            double deltaY = (newActualPetLocation.getY() - this.currentLocation.getY()) * 4096;
            double deltaZ = (newActualPetLocation.getZ() - this.currentLocation.getZ()) * 4096;

            boolean useTeleportPacket = Math.abs(deltaX) > Short.MAX_VALUE || Math.abs(deltaY) > Short.MAX_VALUE || Math.abs(deltaZ) > Short.MAX_VALUE;

            if (useTeleportPacket) {
                teleport(newActualPetLocation);
            } else {
                move(newActualPetLocation, (short) deltaX, (short) deltaY, (short) deltaZ);
            }
        }
        this.currentLocation = newActualPetLocation.clone();
    }


    @NotNull
    public Location calculateFinalPetLocation(@NotNull Location ownerFeetLocation, float finalPetYaw) {
        Location asBaseLocation = ownerFeetLocation.clone();
        asBaseLocation.setY(ownerFeetLocation.getY() + this.armorstandBaseVerticalOffset);
        asBaseLocation.setYaw(finalPetYaw);
        asBaseLocation.setPitch(0);
        return asBaseLocation;
    }

    private void move(@NotNull Location newActualLocation, short dx, short dy, short dz) {
        if (!owner.isOnline() || viewers.isEmpty()) return;
        PacketContainer relMoveLook = plugin.getProtocolManager().createPacket(PacketType.Play.Server.REL_ENTITY_MOVE_LOOK);
        relMoveLook.getIntegers().write(0, entityId);
        relMoveLook.getShorts().write(0, dx).write(1, dy).write(2, dz);
        relMoveLook.getBytes()
            .write(0, (byte) (newActualLocation.getYaw() * 256.0F / 360.0F))
            .write(1, (byte) (newActualLocation.getPitch() * 256.0F / 360.0F));
        relMoveLook.getBooleans().write(0, owner.isOnGround());

        PacketContainer headRotationPacket = createHeadRotationPacket(newActualLocation.getYaw());

        sendPacketsToRelevantViewers(List.of(relMoveLook, headRotationPacket));
    }


    private void sendLookPacket(float yaw, float pitch) {
        if (!owner.isOnline() || viewers.isEmpty()) return;
        PacketContainer lookPacket = plugin.getProtocolManager().createPacket(PacketType.Play.Server.ENTITY_LOOK);
        lookPacket.getIntegers().write(0, entityId);
        lookPacket.getBytes()
            .write(0, (byte) (yaw * 256.0F / 360.0F))
            .write(1, (byte) (pitch * 256.0F / 360.0F));
        lookPacket.getBooleans().write(0, owner.isOnGround());
        sendPacketToRelevantViewers(lookPacket);
    }


    public void teleport(@NotNull Location newActualLocation) {
        if (!owner.isOnline() || !owner.isValid() || newActualLocation.getWorld() == null) {
            if (logicallyVisible) despawn();
            return;
        }

        if (this.currentLocation != null && this.currentLocation.getWorld() != null &&
            !newActualLocation.getWorld().equals(this.currentLocation.getWorld()) && !this.isTransitioningWorld) {
            plugin.getLogger().finer("Pet " + entityId + " de " + owner.getName() + ": Changement de monde détecté via teleport(). Appel de respawn pour gérer la transition.");
            this.prepareForWorldChange();
            this.respawn();
            return;
        }

        this.currentLocation = newActualLocation.clone();

        if (viewers.isEmpty() && !this.logicallyVisible) {
            return;
        }

        PacketContainer teleportPacket = plugin.getProtocolManager().createPacket(PacketType.Play.Server.ENTITY_TELEPORT);
        teleportPacket.getIntegers().write(0, entityId);
        teleportPacket.getDoubles()
            .write(0, this.currentLocation.getX())
            .write(1, this.currentLocation.getY())
            .write(2, this.currentLocation.getZ());
        teleportPacket.getBytes()
            .write(0, (byte) (this.currentLocation.getYaw() * 256.0F / 360.0F))
            .write(1, (byte) (this.currentLocation.getPitch() * 256.0F / 360.0F));
        teleportPacket.getBooleans().write(0, owner.isOnGround());

        PacketContainer headRotationPacket = createHeadRotationPacket(this.currentLocation.getYaw());
        sendPacketsToRelevantViewers(List.of(teleportPacket, headRotationPacket));
    }

    public void despawn() {
        if (!this.logicallyVisible && viewers.isEmpty()) {
            this.logicallyVisible = false;
            return;
        }
        plugin.getLogger().fine("Demande de despawn (méthode publique) pour pet " + entityId + " de " + owner.getName());
        despawnForAllViewers(true);
    }

    public void prepareForWorldChange() {
        this.isTransitioningWorld = true;
        despawnForAllViewers(false);
        plugin.getLogger().finer("[Pet " + entityId + "] Préparé pour changement de monde (" + owner.getName() + "). Logiquement visible: " + logicallyVisible);
    }


    public void respawn() {
        if (!owner.isOnline() || !owner.isValid()) {
            plugin.getLogger().fine("Respawn annulé pour le pet de " + owner.getName() + " (owner invalide/offline). isTransitioning: " + isTransitioningWorld);
            if (this.logicallyVisible || !viewers.isEmpty()) {
                despawnForAllViewers(true);
            }
            this.isTransitioningWorld = false;
            return;
        }
        plugin.getLogger().fine("Demande de respawn pour pet de " + owner.getName() + ". isTransitioning: " + isTransitioningWorld + ", Logiquement visible avant: " + this.logicallyVisible);

        if (!this.isTransitioningWorld && (this.logicallyVisible || !viewers.isEmpty())) {
            despawnForAllViewers(false);
        }

        this.logicallyVisible = true;
        this.isTransitioningWorld = true;


        new BukkitRunnable() {
            @Override
            public void run() {
                if (owner.isOnline() && owner.isValid()) {
                    if (Pet.this.logicallyVisible) {
                        plugin.getLogger().fine("Exécution du spawn différé pour " + owner.getName() + " (après respawn/world change).");
                        Pet.this.spawn();
                    } else {
                        plugin.getLogger().fine("Spawn différé annulé, pet plus logiquement visible pour " + owner.getName());
                        Pet.this.isTransitioningWorld = false;
                    }
                } else {
                    plugin.getLogger().fine("Spawn différé annulé, owner n'est plus valide: " + owner.getName());
                    Pet.this.logicallyVisible = false;
                    Pet.this.isTransitioningWorld = false;
                }
            }
        }.runTaskLater(plugin, 3L);
    }


    public void updateSkinAndAnimation(@NotNull PetConfig newConfig) {
        boolean skinConfigChanged = !this.petConfig.getSkins().equals(newConfig.getSkins()) ||
            this.petConfig.getGlobalSkinUpdateIntervalTicks() != newConfig.getGlobalSkinUpdateIntervalTicks();
        boolean animationTypeChanged = this.petConfig.getAnimationType() != newConfig.getAnimationType();

        this.petConfig = newConfig;

        if (animationTypeChanged) {
            setAnimationSpecifics(newConfig.getAnimationType());
        }
        if (skinConfigChanged) {
            initializeSkinCycling();
        }

        if (logicallyVisible && (skinConfigChanged || animationTypeChanged)) {
            if (!owner.isOnline() || !owner.isValid() || viewers.isEmpty()) return;
            sendPacketToRelevantViewers(createEquipmentPacket());
            plugin.getLogger().fine("Configuration visuelle (skins/animation) du pet de " + owner.getName() + " mise à jour pour les viewers.");
        }
    }

    @NotNull
    public Player getOwner() {
        return owner;
    }

    @NotNull
    public PetConfig getPetConfig() {
        return petConfig;
    }

    @Nullable
    public Location getCurrentLocation() {
        return currentLocation;
    }

    public boolean isLogicallyVisible() {
        return logicallyVisible;
    }

    public int getEntityId() {
        return entityId;
    }

    public void setTransitioningWorld(boolean transitioning) {
        this.isTransitioningWorld = transitioning;
    }
}
