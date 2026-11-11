package org.Cry_Legende.sHCompagnons.pet;

import com.github.retrooper.packetevents.protocol.entity.data.EntityData;
import com.github.retrooper.packetevents.protocol.entity.data.EntityDataTypes;
import com.github.retrooper.packetevents.util.Quaternion4f;
import com.github.retrooper.packetevents.util.Vector3d;
import com.github.retrooper.packetevents.wrapper.PacketWrapper;
import com.github.retrooper.packetevents.wrapper.play.server.WrapperPlayServerBundle;
import com.github.retrooper.packetevents.wrapper.play.server.WrapperPlayServerDestroyEntities;
import com.github.retrooper.packetevents.wrapper.play.server.WrapperPlayServerEntityMetadata;
import com.github.retrooper.packetevents.wrapper.play.server.WrapperPlayServerEntityRotation;
import com.github.retrooper.packetevents.wrapper.play.server.WrapperPlayServerEntityTeleport;
import com.github.retrooper.packetevents.wrapper.play.server.WrapperPlayServerSetPassengers;
import com.github.retrooper.packetevents.wrapper.play.server.WrapperPlayServerSpawnEntity;
import org.Cry_Legende.sHCompagnons.config.ConfigManager;
import org.Cry_Legende.sHCompagnons.config.PetType;
import org.Cry_Legende.sHCompagnons.model.Affine;
import org.Cry_Legende.sHCompagnons.model.Part;
import org.bukkit.GameMode;
import org.bukkit.Location;
import org.bukkit.World;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Player;
import org.joml.Quaternionf;
import org.joml.Quaternionfc;
import org.joml.Vector3f;
import org.joml.Vector3fc;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Compagnon d'un joueur : un modèle d'entités d'affichage qui n'existe que chez les clients.
 *
 * En mode ATTACHED, la première pièce est passagère du joueur et les autres sont passagères d'elle : le client les
 * déplace avec le joueur à chaque image, sans aucun paquet de position. En mode FREE, la première pièce est
 * déplacée par le serveur toutes les quelques ticks et le client lisse le trajet. Le serveur n'envoie ensuite que
 * l'orientation quand le joueur tourne la tête, les images clés de l'animation et les changements de texture.
 *
 * Les joueurs qui voient le compagnon sont exactement ceux qui voient son propriétaire (événements de suivi de
 * Paper) plus le propriétaire lui-même. Les événements peuvent venir de plusieurs fils : tout passe par le verrou
 * du compagnon, les envois du tick compris.
 */
public final class Pet {

    private static final Vector3d ZERO = new Vector3d(0, 0, 0);

    private final Player owner;
    private final PetType type;
    private final ConfigManager.Settings settings;
    private final boolean attached;
    private final int[] ids;
    private final UUID[] uuids;

    // Joueurs qui ont le modèle chez eux ; lu sans verrou par l'écouteur de paquets
    private final Map<UUID, Player> shown = new ConcurrentHashMap<>();
    // Joueurs à qui envoyer le modèle au prochain tick (après le paquet d'apparition du propriétaire)
    private final Map<UUID, Player> pending = new ConcurrentHashMap<>();
    private boolean hidden;
    private boolean removed;
    // Numéro d'entité du propriétaire sous lequel le compagnon est rangé (il change à la réapparition)
    private volatile int ownerEntityId;

    private float sentYaw;
    private int nextTurnTick;

    private double animationTime;
    private int nextKeyframeTick;
    private Animation.Frame frame = Animation.Frame.REST;

    private int skinIndex;
    private int skinTicksLeft;

    private World freeWorld;
    private double freeX;
    private double freeY;
    private double freeZ;
    private float freeYaw;
    private int nextFreeTick;
    private double lastSentX;
    private double lastSentY;
    private double lastSentZ;

    public Pet(Player owner, PetType type, ConfigManager.Settings settings) {
        this.owner = owner;
        this.type = type;
        this.settings = settings;
        this.attached = type.follow() == PetType.FollowMode.ATTACHED;
        int count = type.parts().size();
        this.ids = new int[count];
        this.uuids = new UUID[count];
        for (int i = 0; i < count; i++) {
            ids[i] = Packets.newEntityId();
            uuids[i] = UUID.randomUUID();
        }
        this.ownerEntityId = owner.getEntityId();
        this.sentYaw = owner.getYaw();
        this.freeYaw = sentYaw;
        this.skinTicksLeft = type.skins().isEmpty() ? 0 : type.skins().getFirst().ticks();
        if (type.animation().moves()) {
            this.frame = type.animation().frame(0, type.animationAmplitude());
        }
    }

    public Player owner() {
        return owner;
    }

    public PetType type() {
        return type;
    }

    public int ownerEntityId() {
        return ownerEntityId;
    }

    public void ownerEntityId(int id) {
        this.ownerEntityId = id;
    }

    /** Première pièce, montée sur le joueur en mode ATTACHED (-1 en mode FREE). */
    public int attachedRoot() {
        return attached ? ids[0] : -1;
    }

    /** Ce joueur a-t-il le modèle chez lui ? */
    public boolean shownTo(UUID viewer) {
        return shown.containsKey(viewer);
    }

    /** Premier affichage : tous ceux qui voient déjà le propriétaire, et lui-même. */
    public synchronized void start() {
        hidden = owner.getGameMode() == GameMode.SPECTATOR || owner.isDead();
        if (!hidden) {
            queueEveryone();
        }
    }

    private void queueEveryone() {
        for (Player viewer : owner.getTrackedBy()) {
            pending.put(viewer.getUniqueId(), viewer);
        }
        if (settings.showToOwner()) {
            pending.put(owner.getUniqueId(), owner);
        }
    }

    /** Ce joueur commence à voir le propriétaire : le modèle suivra au prochain tick. */
    public synchronized void track(Player viewer) {
        if (!hidden && !removed && !shown.containsKey(viewer.getUniqueId())) {
            pending.put(viewer.getUniqueId(), viewer);
        }
    }

    /** Ce joueur ne voit plus le propriétaire : le modèle disparaît aussitôt de chez lui. */
    public synchronized void untrack(Player viewer) {
        pending.remove(viewer.getUniqueId());
        if (shown.remove(viewer.getUniqueId()) != null) {
            Packets.send(viewer, List.of(new WrapperPlayServerDestroyEntities(ids)));
        }
    }

    /** Joueur déconnecté : rien à lui envoyer. */
    public synchronized void forget(UUID viewer) {
        pending.remove(viewer);
        shown.remove(viewer);
    }

    /**
     * Le client du propriétaire a perdu le modèle (réapparition, changement de monde) : renvoyé au prochain tick.
     * Un modèle resté chez lui est remplacé (mêmes numéros d'entité).
     */
    public synchronized void resendToOwner() {
        shown.remove(owner.getUniqueId());
        if (!hidden && !removed && settings.showToOwner()) {
            pending.put(owner.getUniqueId(), owner);
        }
    }

    /** Caché pour tous (mort, spectateur). */
    public synchronized void hide() {
        hidden = true;
        pending.clear();
        destroyForAll(false);
    }

    /** De nouveau visible après {@link #hide()}. */
    public synchronized void show() {
        if (!hidden || removed) {
            return;
        }
        hidden = false;
        queueEveryone();
    }

    /**
     * Retrait définitif. Si le propriétaire reste en ligne, sa liste de passagers est renvoyée sans le compagnon :
     * UnlimitedNametags la relit et oublie l'ancienne pièce.
     */
    public synchronized void remove(boolean ownerStays) {
        removed = true;
        pending.clear();
        destroyForAll(ownerStays && attached);
    }

    private void destroyForAll(boolean refreshPassengers) {
        for (Player viewer : shown.values()) {
            List<PacketWrapper<?>> packets = new ArrayList<>(2);
            packets.add(new WrapperPlayServerDestroyEntities(ids));
            PacketWrapper<?> passengers = null;
            if (refreshPassengers) {
                passengers = new WrapperPlayServerSetPassengers(owner.getEntityId(), realPassengers());
                packets.add(passengers);
            }
            Packets.send(viewer, packets, passengers);
        }
        shown.clear();
    }

    /** Un tick du serveur (fil principal). */
    public synchronized void tick(int now) {
        if (hidden || removed) {
            return;
        }
        if (!pending.isEmpty()) {
            spawnPending();
        }
        if (shown.isEmpty()) {
            return;
        }
        if (attached) {
            turn(now);
        } else if (now >= nextFreeTick) {
            followFree(now);
        }
        if (type.animation().moves() && now >= nextKeyframeTick) {
            nextKeyframe(now);
        }
        if (type.cyclesSkins() && skinTicksLeft > 0 && --skinTicksLeft == 0) {
            nextSkin();
        }
    }

    private void spawnPending() {
        if (!attached && freeWorld == null) {
            resetFree();
            lastSentX = freeX;
            lastSentY = freeY;
            lastSentZ = freeZ;
            sentYaw = freeYaw;
        }
        for (Player viewer : pending.values()) {
            if (!viewer.isOnline()) {
                continue;
            }
            List<PacketWrapper<?>> packets = new ArrayList<>(type.parts().size() * 2 + 4);
            packets.add(new WrapperPlayServerBundle());
            Vector3d position = rootPosition();
            for (int i = 0; i < ids.length; i++) {
                packets.add(new WrapperPlayServerSpawnEntity(ids[i], Optional.of(uuids[i]), type.parts().get(i).type(),
                    position, 0.0f, sentYaw, 0.0f, 0, Optional.of(ZERO)));
                packets.add(new WrapperPlayServerEntityMetadata(ids[i], fullData(i)));
            }
            if (ids.length > 1) {
                int[] riders = new int[ids.length - 1];
                System.arraycopy(ids, 1, riders, 0, riders.length);
                packets.add(new WrapperPlayServerSetPassengers(ids[0], riders));
            }
            PacketWrapper<?> mount = null;
            if (attached) {
                int[] real = realPassengers();
                int[] riders = new int[real.length + 1];
                System.arraycopy(real, 0, riders, 0, real.length);
                riders[real.length] = ids[0];
                mount = new WrapperPlayServerSetPassengers(owner.getEntityId(), riders);
                packets.add(mount);
            }
            packets.add(new WrapperPlayServerBundle());
            Packets.send(viewer, packets, mount);
            shown.put(viewer.getUniqueId(), viewer);
        }
        pending.clear();
    }

    /** Vrais passagers du propriétaire (un joueur assis sur sa tête...), gardés dans la liste envoyée. */
    private int[] realPassengers() {
        List<Entity> passengers = owner.getPassengers();
        int[] out = new int[passengers.size()];
        for (int i = 0; i < out.length; i++) {
            out[i] = passengers.get(i).getEntityId();
        }
        return out;
    }

    private Vector3d rootPosition() {
        if (!attached) {
            return new Vector3d(freeX, freeY, freeZ);
        }
        Location location = owner.getLocation();
        return new Vector3d(location.getX(), location.getY() + owner.getHeight(), location.getZ());
    }

    /** Toutes les métadonnées d'une pièce, pour son apparition. */
    private List<EntityData<?>> fullData(int index) {
        Part part = type.parts().get(index);
        List<EntityData<?>> data = new ArrayList<>(part.staticData().size() + 8);
        data.addAll(part.staticData());
        if (index == 0 && type.cyclesSkins()) {
            data.add(new EntityData<>(Part.ITEM, EntityDataTypes.ITEMSTACK, type.skins().get(skinIndex).item()));
        }
        data.add(new EntityData<>(Part.POS_ROT_DURATION, EntityDataTypes.INT, attached ? settings.turnSmoothing() : settings.freeUpdateTicks()));
        Affine affine = placed(part, frame);
        data.add(new EntityData<>(Part.TRANSLATION, EntityDataTypes.VECTOR3F, vector(affine.translation())));
        data.add(new EntityData<>(Part.LEFT_ROTATION, EntityDataTypes.QUATERNION, quaternion(affine.left())));
        data.add(new EntityData<>(Part.SCALE, EntityDataTypes.VECTOR3F, vector(affine.scale())));
        data.add(new EntityData<>(Part.RIGHT_ROTATION, EntityDataTypes.QUATERNION, quaternion(affine.right())));
        return data;
    }

    /** Transformation d'une pièce : placement du compagnon, image d'animation (décalage, rotation sur lui-même). */
    private Affine placed(Part part, Animation.Frame frame) {
        PetType.Placement placement = type.placement();
        Vector3f offset = new Vector3f(placement.offset()).add(frame.offset());
        Quaternionf rotation = new Quaternionf(placement.rotation());
        if (frame.spin() != 0) {
            rotation.rotateY((float) Math.toRadians(frame.spin()));
        }
        return part.transform().placed(offset, rotation, placement.scale());
    }

    /** ATTACHED : nouvelle orientation quand le joueur a assez tourné la tête, lissée par le client. */
    private void turn(int now) {
        if (now < nextTurnTick) {
            return;
        }
        float yaw = owner.getYaw();
        if (Math.abs(Location.normalizeYaw(yaw - sentYaw)) < settings.turnThreshold()) {
            return;
        }
        sentYaw = yaw;
        nextTurnTick = now + settings.turnInterval();
        for (Player viewer : shown.values()) {
            List<PacketWrapper<?>> packets = new ArrayList<>(ids.length);
            for (int id : ids) {
                packets.add(new WrapperPlayServerEntityRotation(id, yaw, 0.0f, false));
            }
            Packets.send(viewer, packets);
        }
    }

    /** FREE : la première pièce rattrape le joueur par paliers, le client lisse chaque palier. */
    private void followFree(int now) {
        nextFreeTick = now + settings.freeUpdateTicks();
        Location location = owner.getLocation();
        double targetY = location.getY() + owner.getHeight();
        double dx = location.getX() - freeX;
        double dy = targetY - freeY;
        double dz = location.getZ() - freeZ;
        if (location.getWorld() != freeWorld || dx * dx + dy * dy + dz * dz > settings.freeTeleportDistance() * settings.freeTeleportDistance()) {
            resetFree();
        } else {
            float k = settings.freeCatchUp();
            freeX += dx * k;
            freeY += dy * k;
            freeZ += dz * k;
            freeYaw = Location.normalizeYaw(freeYaw + Location.normalizeYaw(owner.getYaw() - freeYaw) * k);
        }
        double moved = Math.abs(freeX - lastSentX) + Math.abs(freeY - lastSentY) + Math.abs(freeZ - lastSentZ);
        boolean turned = Math.abs(Location.normalizeYaw(freeYaw - sentYaw)) >= settings.turnThreshold();
        if (moved < 0.003 && !turned) {
            return;
        }
        lastSentX = freeX;
        lastSentY = freeY;
        lastSentZ = freeZ;
        sentYaw = freeYaw;
        Vector3d position = new Vector3d(freeX, freeY, freeZ);
        for (Player viewer : shown.values()) {
            List<PacketWrapper<?>> packets = new ArrayList<>(ids.length);
            packets.add(new WrapperPlayServerEntityTeleport(ids[0], position, freeYaw, 0.0f, false));
            for (int i = 1; i < ids.length; i++) {
                packets.add(new WrapperPlayServerEntityRotation(ids[i], freeYaw, 0.0f, false));
            }
            Packets.send(viewer, packets);
        }
    }

    private void resetFree() {
        Location location = owner.getLocation();
        freeWorld = location.getWorld();
        freeX = location.getX();
        freeY = location.getY() + owner.getHeight();
        freeZ = location.getZ();
        freeYaw = owner.getYaw();
    }

    /** Image clé suivante : le client va de la position actuelle à celle-ci en « durée » ticks. */
    private void nextKeyframe(int now) {
        Animation animation = type.animation();
        double next = animation.nextKey(animationTime);
        int duration = Math.max(1, (int) Math.round((next - animationTime) / type.animationSpeed()));
        animationTime = animation.wrap(next);
        frame = animation.frame(next, type.animationAmplitude());
        nextKeyframeTick = now + duration;
        List<Affine> transforms = new ArrayList<>(ids.length);
        for (Part part : type.parts()) {
            transforms.add(placed(part, frame));
        }
        for (Player viewer : shown.values()) {
            List<PacketWrapper<?>> packets = new ArrayList<>(ids.length);
            for (int i = 0; i < ids.length; i++) {
                Affine affine = transforms.get(i);
                packets.add(new WrapperPlayServerEntityMetadata(ids[i], List.of(
                    new EntityData<>(Part.INTERPOLATION_DELAY, EntityDataTypes.INT, 0),
                    new EntityData<>(Part.TRANSFORMATION_DURATION, EntityDataTypes.INT, duration),
                    new EntityData<>(Part.TRANSLATION, EntityDataTypes.VECTOR3F, vector(affine.translation())),
                    new EntityData<>(Part.LEFT_ROTATION, EntityDataTypes.QUATERNION, quaternion(affine.left())))));
            }
            Packets.send(viewer, packets);
        }
    }

    private void nextSkin() {
        skinIndex = (skinIndex + 1) % type.skins().size();
        PetType.Skin skin = type.skins().get(skinIndex);
        skinTicksLeft = skin.ticks();
        for (Player viewer : shown.values()) {
            Packets.send(viewer, List.of(new WrapperPlayServerEntityMetadata(ids[0], List.of(
                new EntityData<>(Part.ITEM, EntityDataTypes.ITEMSTACK, skin.item())))));
        }
    }

    private static com.github.retrooper.packetevents.util.Vector3f vector(Vector3fc v) {
        return new com.github.retrooper.packetevents.util.Vector3f(v.x(), v.y(), v.z());
    }

    private static Quaternion4f quaternion(Quaternionfc q) {
        return new Quaternion4f(q.x(), q.y(), q.z(), q.w());
    }
}
