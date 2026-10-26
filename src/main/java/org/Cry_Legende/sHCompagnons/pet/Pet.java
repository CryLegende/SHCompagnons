package org.Cry_Legende.sHCompagnons.pet;

import com.comphenix.protocol.PacketType;
import com.comphenix.protocol.events.PacketContainer;
import com.comphenix.protocol.reflect.StructureModifier;
import com.comphenix.protocol.utility.MinecraftReflection;
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

import java.lang.reflect.Constructor;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;

public class Pet {

    private static final AtomicInteger lastEntityId = new AtomicInteger(Integer.MAX_VALUE - 20000);

    // Classes et constructeurs de PositionMoveRotation (paquet de téléportation 1.21.2+), résolus une seule fois
    private static volatile Class<?> positionValuesClass;
    private static volatile Constructor<?> positionVecConstructor;
    private static volatile Constructor<?> positionValuesConstructor;
    // Le déplacement relatif a-t-il encore ses champs short (absents en 26.x) ? null tant que non vérifié
    private static volatile Boolean relativeMoveHasShorts;

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

    // Les viewers sont recalculés à chaque tick (monde, distance, visibilité) par updateViewersForNearbyPlayers :
    // les paquets de mouvement et d'équipement leur sont envoyés directement, sans reparcourir tous les joueurs
    // du serveur ni recalculer les distances pour chaque paquet. Les destructions passent par despawnFor*.
    private void sendPacketToRelevantViewers(PacketContainer packet) {
        sendPacketsToRelevantViewers(List.of(packet));
    }

    private void sendPacketsToRelevantViewers(List<PacketContainer> packets) {
        if (!owner.isOnline() || currentLocation == null || currentLocation.getWorld() == null) return;
        if (!this.logicallyVisible || viewers.isEmpty()) {
            return;
        }
        for (UUID viewerId : viewers) {
            Player recipient = Bukkit.getPlayer(viewerId);
            if (recipient != null) {
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
        // Ordre des champs du paquet d'apparition : xRot (tangage), yRot (lacet), yHeadRot. Le lacet écrit en premier
        // tombait dans le tangage : le compagnon apparaissait tourné vers le sud tant que son maître ne bougeait pas.
        byte yawByte = (byte) (currentLocation.getYaw() * 256.0F / 360.0F);
        spawnPacket.getBytes()
            .write(0, (byte) (currentLocation.getPitch() * 256.0F / 360.0F))
            .write(1, yawByte);
        if (spawnPacket.getBytes().size() > 2) {
            spawnPacket.getBytes().write(2, yawByte);
        }
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
            // Réalignement réel : sans lui, l'avertissement se répétait à chaque tick et le compagnon restait bloqué.
            prepareForWorldChange();
            respawn();
            return;
        }

        // Joueurs du monde du maître seulement, position du maître lue une fois (appelé à chaque tick par compagnon).
        Location ownerLocation = owner.getLocation();
        List<Player> playersInVicinity = new ArrayList<>();
        Set<UUID> vicinityIds = new HashSet<>();
        for (Player p : ownerWorld.getPlayers()) {
            if (p.getLocation().distanceSquared(ownerLocation) <= PET_VIEW_DISTANCE_SQUARED) {
                playersInVicinity.add(p);
                vicinityIds.add(p.getUniqueId());
            }
        }
        Iterator<UUID> viewerIterator = viewers.iterator();
        while (viewerIterator.hasNext()) {
            UUID viewerId = viewerIterator.next();
            Player viewer = Bukkit.getPlayer(viewerId);
            if (viewer == null || !viewer.isOnline() || !vicinityIds.contains(viewerId) || !shouldObserverSeePet(viewer)) {
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
        Boolean shorts = relativeMoveHasShorts;
        if (shorts != null && !shorts) {
            sendAbsoluteMove(newActualLocation);
            return;
        }
        PacketContainer relMoveLook = plugin.getProtocolManager().createPacket(PacketType.Play.Server.REL_ENTITY_MOVE_LOOK);
        if (shorts == null) {
            // Structure du paquet constante pour une version du serveur : vérifiée une seule fois
            relativeMoveHasShorts = shorts = relMoveLook.getShorts().size() >= 3;
        }
        if (!shorts) {
            sendAbsoluteMove(newActualLocation);
            return;
        }
        relMoveLook.getIntegers().write(0, entityId);
        relMoveLook.getShorts().write(0, dx).write(1, dy).write(2, dz);
        relMoveLook.getBytes()
            .write(0, (byte) (newActualLocation.getYaw() * 256.0F / 360.0F))
            .write(1, (byte) (newActualLocation.getPitch() * 256.0F / 360.0F));
        relMoveLook.getBooleans().write(0, owner.isOnGround());

        PacketContainer headRotationPacket = createHeadRotationPacket(newActualLocation.getYaw());

        sendPacketsToRelevantViewers(List.of(relMoveLook, headRotationPacket));
    }

    /** Minecraft 26.x : le paquet de déplacement relatif ne porte plus de champs short, on envoie la position absolue. */
    private void sendAbsoluteMove(@NotNull Location newActualLocation) {
        PacketContainer absolute = createTeleportPacket(newActualLocation);
        sendPacketsToRelevantViewers(List.of(absolute, createHeadRotationPacket(newActualLocation.getYaw())));
    }


    private void sendLookPacket(float yaw, float pitch) {
        if (!owner.isOnline() || viewers.isEmpty()) return;
        PacketContainer lookPacket = plugin.getProtocolManager().createPacket(PacketType.Play.Server.ENTITY_LOOK);
        if (lookPacket.getBytes().size() < 2 && currentLocation != null) {
            // Minecraft 26.x : plus de champs byte dans le paquet de rotation, on renvoie la position absolue
            Location rotated = currentLocation.clone();
            rotated.setYaw(yaw);
            rotated.setPitch(pitch);
            sendPacketToRelevantViewers(createTeleportPacket(rotated));
            return;
        }
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

        PacketContainer teleportPacket = createTeleportPacket(this.currentLocation);

        PacketContainer headRotationPacket = createHeadRotationPacket(this.currentLocation.getYaw());
        sendPacketsToRelevantViewers(List.of(teleportPacket, headRotationPacket));
    }

    /**
     * Paquet de téléportation absolue de l'entité. Avant la 1.21.2 il porte trois double et deux byte ; ensuite
     * (1.21.2 à 26.x) la position voyage dans un PositionMoveRotation, suivi de la liste des déplacements relatifs
     * (vide : tout est absolu).
     */
    private PacketContainer createTeleportPacket(Location location) {
        PacketContainer teleportPacket = plugin.getProtocolManager().createPacket(PacketType.Play.Server.ENTITY_TELEPORT);
        teleportPacket.getIntegers().write(0, entityId);
        if (teleportPacket.getDoubles().size() >= 3) {
            teleportPacket.getDoubles()
                .write(0, location.getX())
                .write(1, location.getY())
                .write(2, location.getZ());
            teleportPacket.getBytes()
                .write(0, (byte) (location.getYaw() * 256.0F / 360.0F))
                .write(1, (byte) (location.getPitch() * 256.0F / 360.0F));
        } else {
            writePositionMoveRotation(teleportPacket, location);
        }
        teleportPacket.getBooleans().write(0, owner.isOnGround());
        return teleportPacket;
    }

    private void writePositionMoveRotation(PacketContainer packet, Location location) {
        try {
            if (positionValuesConstructor == null) {
                Class<?> vecClass = MinecraftReflection.getVec3DClass();
                Class<?> valuesClass = MinecraftReflection.getMinecraftClass("world.entity.PositionMoveRotation");
                positionVecConstructor = vecClass.getConstructor(double.class, double.class, double.class);
                positionValuesClass = valuesClass;
                positionValuesConstructor = valuesClass.getConstructor(vecClass, vecClass, float.class, float.class);
            }
            Object position = positionVecConstructor.newInstance(location.getX(), location.getY(), location.getZ());
            Object motion = positionVecConstructor.newInstance(0D, 0D, 0D);
            Object values = positionValuesConstructor.newInstance(position, motion, location.getYaw(), location.getPitch());
            packet.getModifier().withType(positionValuesClass).write(0, values);
            StructureModifier<Object> relatives = packet.getModifier().withType(Set.class);
            if (relatives.size() > 0) {
                relatives.write(0, Collections.emptySet());
            }
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("PositionMoveRotation introuvable ou changé dans cette version du serveur", e);
        }
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
