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
import org.Cry_Legende.sHCompagnons.model.Looks;
import org.Cry_Legende.sHCompagnons.model.Part;
import org.Cry_Legende.sHCompagnons.model.Track;
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
import java.util.Arrays;
import java.util.Iterator;
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
 * Deux animations se combinent : celle du compagnon entier (rebond, montée et descente...), commune à toutes les
 * pièces, et celle que le modèle donne à certaines pièces (ailes, oreilles...). Une pièce ne reçoit jamais qu'une
 * cible à la fois : la prochaine image clé de l'une ou de l'autre, calculée avec les deux. Un changement de texture
 * (clignement) part avec la cible en cours, pour ne pas faire sauter le trajet.
 *
 * Les joueurs qui voient le compagnon sont exactement ceux qui voient son propriétaire (événements de suivi de
 * Paper) plus le propriétaire lui-même. Un propriétaire invisible n'est plus vu de personne : son compagnon
 * disparaît de chez les autres (et de chez lui si la config le demande) et revient avec lui. Accroupi, le
 * propriétaire fige l'orientation de son compagnon. Les événements peuvent venir de plusieurs fils : tout passe par
 * le verrou du compagnon, les envois du tick compris.
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
    // Joueurs chez qui le modèle vient d'apparaître, encore réduit à un point le temps que leur client télécharge les
    // textures des têtes : tick de l'apparition. Le modèle se déploie quand le délai est passé.
    private final Map<UUID, Integer> preloading = new java.util.HashMap<>();
    // Textures que les animations afficheront plus tard, montrées pendant ce délai sur les têtes du modèle pour que
    // le client les ait déjà quand elles servent ; hosts : pièces qui portent un objet
    private final List<EntityData<?>> laterLooks = new ArrayList<>();
    private final List<Integer> hosts = new ArrayList<>();
    private final int preloadTicks;
    private static final int PRELOAD_STEP_TICKS = 2;
    private static final int REVEAL_TICKS = 3;
    private static final float PRELOAD_SCALE = 1.0e-4f;
    private boolean hidden;
    private boolean removed;
    // Le propriétaire est invisible (potion, WorldGuard, setInvisible...) : le modèle ne reste que chez lui, si la config le veut
    private boolean invisible;
    // Numéro d'entité du propriétaire sous lequel le compagnon est rangé (il change à la réapparition)
    private volatile int ownerEntityId;

    // Cadence et lissage de l'orientation : ceux de la config, ralentis pour un modèle de beaucoup de pièces
    private final int turnInterval;
    private final int turnSmoothing;
    private float sentYaw;
    private int nextTurnTick;
    // Propriétaire accroupi : orientation figée. Au relevé, le client rattrape le regard plus lentement, puis le lissage normal revient
    private boolean frozen;
    private int smoothingEndsTick;

    // Animation du compagnon entier : le client va de frameFrom (au tick segmentStart) à frame (au tick nextKeyframeTick)
    private double animationTime;
    private int nextKeyframeTick;
    private int segmentStart;
    private Animation.Frame frameFrom = Animation.Frame.REST;
    private Animation.Frame frame = Animation.Frame.REST;

    // Animation propre aux pièces du modèle. poses : dernière pose visée par pièce (repère du modèle) ; looks :
    // apparence affichée ; poseDue, lookDue : tick de la prochaine image clé et du prochain changement d'apparence
    // de la pièce ; headed : tick visé par le dernier envoi ; partsEpoch : tick du début des cycles
    private final boolean animated;
    private final Affine[] poses;
    private final EntityData<?>[] looks;
    private final int[] poseDue;
    private final int[] lookDue;
    private final int[] headed;
    private int partsEpoch = Integer.MIN_VALUE;
    private int nextPartTick;

    // Repos : le propriétaire n'a ni bougé ni tourné la tête depuis restAfterTicks, l'animation est arrêtée
    private static final int REST_TRANSITION_TICKS = 15;
    private final Location probe = new Location(null, 0, 0, 0);
    private World seenWorld;
    private double seenX;
    private double seenY;
    private double seenZ;
    private float seenYaw;
    private float seenPitch;
    private int lastActiveTick = Integer.MIN_VALUE;
    private boolean resting;

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
        // Tourner coûte un paquet par pièce : au-delà de turnPartsPerTick pièces par tick, l'orientation est envoyée
        // moins souvent et lissée plus longtemps par le client (le compagnon suit avec un peu plus d'inertie)
        int budget = settings.turnPartsPerTick();
        this.turnInterval = Math.max(settings.turnInterval(), (count + budget - 1) / budget);
        this.turnSmoothing = turnInterval > settings.turnInterval() ? Math.max(settings.turnSmoothing(), turnInterval + 1) : settings.turnSmoothing();
        this.ownerEntityId = owner.getEntityId();
        this.sentYaw = owner.getYaw();
        this.freeYaw = sentYaw;
        if (type.animation().moves()) {
            this.frame = type.animation().frame(0, type.animationAmplitude());
            this.frameFrom = frame;
        }
        this.poses = new Affine[count];
        this.looks = new EntityData<?>[count];
        this.poseDue = new int[count];
        this.lookDue = new int[count];
        this.headed = new int[count];
        boolean any = false;
        for (int i = 0; i < count; i++) {
            Part part = type.parts().get(i);
            poses[i] = part.transform();
            looks[i] = part.staticData().getFirst();
            any |= part.track() != null || part.looks() != null;
        }
        this.animated = any;
        for (int i = 0; i < count; i++) {
            Part part = type.parts().get(i);
            if (part.type() != com.github.retrooper.packetevents.protocol.entity.type.EntityTypes.ITEM_DISPLAY) {
                continue;
            }
            hosts.add(i);
            Looks cycle = part.looks();
            for (int key = 1; cycle != null && key < cycle.keys(); key++) {
                EntityData<?> look = cycle.look(key);
                if (laterLooks.stream().noneMatch(known -> known == look)) {
                    laterLooks.add(look);
                }
            }
        }
        // Chaque tête montre une texture à venir pendant PRELOAD_STEP_TICKS : le délai s'allonge s'il en faut plus
        int steps = hosts.isEmpty() ? 0 : (laterLooks.size() + hosts.size() - 1) / hosts.size();
        this.preloadTicks = settings.preloadTicks() == 0 ? 0 : Math.max(settings.preloadTicks(), steps * PRELOAD_STEP_TICKS + 2);
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
        invisible = owner.isInvisible();
        if (!hidden) {
            queueEveryone();
        }
    }

    /** Ce joueur doit-il avoir le modèle chez lui ? Le propriétaire invisible n'est vu que de lui-même, si la config le veut. */
    private boolean mayShowTo(UUID viewer) {
        if (viewer.equals(owner.getUniqueId())) {
            return settings.showToOwner() && (!invisible || settings.showToOwnerWhenInvisible());
        }
        return !invisible;
    }

    /** Met en attente ceux qui doivent voir le modèle et ne l'ont pas encore. */
    private void queueEveryone() {
        for (Player viewer : owner.getTrackedBy()) {
            if (mayShowTo(viewer.getUniqueId()) && !shown.containsKey(viewer.getUniqueId())) {
                pending.put(viewer.getUniqueId(), viewer);
            }
        }
        if (mayShowTo(owner.getUniqueId()) && !shown.containsKey(owner.getUniqueId())) {
            pending.put(owner.getUniqueId(), owner);
        }
    }

    /** Ce joueur commence à voir le propriétaire : le modèle suivra au prochain tick. */
    public synchronized void track(Player viewer) {
        if (!hidden && !removed && mayShowTo(viewer.getUniqueId()) && !shown.containsKey(viewer.getUniqueId())) {
            pending.put(viewer.getUniqueId(), viewer);
        }
    }

    /** Ce joueur ne voit plus le propriétaire : le modèle disparaît aussitôt de chez lui. */
    public synchronized void untrack(Player viewer) {
        pending.remove(viewer.getUniqueId());
        preloading.remove(viewer.getUniqueId());
        if (shown.remove(viewer.getUniqueId()) != null) {
            Packets.send(viewer, List.of(new WrapperPlayServerDestroyEntities(ids)));
        }
    }

    /** Joueur déconnecté : rien à lui envoyer. */
    public synchronized void forget(UUID viewer) {
        pending.remove(viewer);
        preloading.remove(viewer);
        shown.remove(viewer);
    }

    /**
     * Le client du propriétaire a perdu le modèle (réapparition, changement de monde) : renvoyé au prochain tick.
     * Un modèle resté chez lui est remplacé (mêmes numéros d'entité).
     */
    public synchronized void resendToOwner() {
        shown.remove(owner.getUniqueId());
        if (!hidden && !removed && mayShowTo(owner.getUniqueId())) {
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
        invisible = owner.isInvisible();
        queueEveryone();
    }

    /**
     * Le propriétaire devient invisible ou visible : le modèle est retiré de chez ceux qui ne doivent plus le voir,
     * ou renvoyé à ceux qui le revoient. L'invisibilité est lue à chaque tick (un seul test de drapeau), ce qui
     * couvre potion, WorldGuard et setInvisible d'un autre plugin ; l'événement de potion arrive avant l'effet et
     * setInvisible n'en envoie aucun.
     */
    private void applyInvisibility() {
        if (!invisible) {
            queueEveryone();
            return;
        }
        pending.keySet().removeIf(viewer -> !mayShowTo(viewer));
        for (Iterator<Player> it = shown.values().iterator(); it.hasNext(); ) {
            Player viewer = it.next();
            if (!mayShowTo(viewer.getUniqueId())) {
                it.remove();
                preloading.remove(viewer.getUniqueId());
                Packets.send(viewer, List.of(new WrapperPlayServerDestroyEntities(ids)));
            }
        }
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
        preloading.clear();
    }

    /** Un tick du serveur (fil principal). */
    public synchronized void tick(int now) {
        if (hidden || removed) {
            return;
        }
        boolean invisibleNow = owner.isInvisible();
        if (invisibleNow != invisible) {
            invisible = invisibleNow;
            applyInvisibility();
        }
        trackActivity(now);
        if (!pending.isEmpty()) {
            spawnPending(now);
        }
        if (!preloading.isEmpty()) {
            preload(now);
        }
        if (shown.isEmpty()) {
            return;
        }
        if (attached) {
            turn(now);
        } else if (now >= nextFreeTick) {
            followFree(now);
        }
        if (!resting) {
            animate(now);
        }
    }

    /**
     * Met le compagnon au repos quand son propriétaire est immobile depuis restAfterTicks (ni déplacement, ni
     * mouvement de tête), et le réveille au premier mouvement. Au repos, le modèle revient doucement à sa position
     * neutre et plus aucune image clé n'est envoyée : un joueur absent ne coûte plus rien à ceux qui le voient.
     */
    private void trackActivity(int now) {
        owner.getLocation(probe);
        boolean moved = probe.getWorld() != seenWorld
            || Math.abs(probe.getX() - seenX) + Math.abs(probe.getY() - seenY) + Math.abs(probe.getZ() - seenZ) > 0.01
            || Math.abs(probe.getYaw() - seenYaw) + Math.abs(probe.getPitch() - seenPitch) > 1.0f;
        if (moved || lastActiveTick == Integer.MIN_VALUE) {
            seenWorld = probe.getWorld();
            seenX = probe.getX();
            seenY = probe.getY();
            seenZ = probe.getZ();
            seenYaw = probe.getYaw();
            seenPitch = probe.getPitch();
            lastActiveTick = now;
            if (resting) {
                resting = false;
                animationTime = 0;
                nextKeyframeTick = now;
                partsEpoch = Integer.MIN_VALUE;
            }
            return;
        }
        int after = settings.restAfterTicks();
        if (!resting && after > 0 && (type.animation().moves() || animated) && now - lastActiveTick >= after) {
            resting = true;
            rest();
        }
    }

    private void spawnPending(int now) {
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
                packets.add(new WrapperPlayServerEntityMetadata(ids[i], fullData(i, preloadTicks > 0)));
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
            // Rangé avant la remise du lot : le fil réseau peut le traiter aussitôt
            shown.put(viewer.getUniqueId(), viewer);
            if (preloadTicks > 0) {
                preloading.put(viewer.getUniqueId(), now);
            }
            Packets.send(viewer, packets, mount);
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

    /**
     * Préchargement des textures. Un client télécharge la texture d'une tête la première fois qu'il l'affiche, et
     * montre une tête par défaut en attendant. Le modèle apparaît donc d'abord réduit à un point : ses têtes sont
     * affichées, donc téléchargées, sans être vues, et celles qui portent un objet montrent tour à tour les textures
     * que les animations utiliseront. Le délai passé, le modèle se déploie en quelques ticks, textures prêtes.
     */
    private void preload(int now) {
        for (Iterator<Map.Entry<UUID, Integer>> it = preloading.entrySet().iterator(); it.hasNext(); ) {
            Map.Entry<UUID, Integer> entry = it.next();
            Player viewer = shown.get(entry.getKey());
            if (viewer == null) {
                it.remove();
                continue;
            }
            int elapsed = now - entry.getValue();
            if (elapsed >= preloadTicks) {
                it.remove();
                List<PacketWrapper<?>> packets = new ArrayList<>(ids.length);
                for (int i = 0; i < ids.length; i++) {
                    Affine affine = placed(poses[i], frame);
                    List<EntityData<?>> data = new ArrayList<>(7);
                    data.add(new EntityData<>(Part.INTERPOLATION_DELAY, EntityDataTypes.INT, 0));
                    data.add(new EntityData<>(Part.TRANSFORMATION_DURATION, EntityDataTypes.INT, REVEAL_TICKS));
                    // État courant de la pièce : les images clés envoyées aux autres pendant le délai ne l'ont pas été ici
                    data.add(new EntityData<>(Part.TRANSLATION, EntityDataTypes.VECTOR3F, vector(affine.translation())));
                    data.add(new EntityData<>(Part.LEFT_ROTATION, EntityDataTypes.QUATERNION, quaternion(affine.left())));
                    data.add(new EntityData<>(Part.SCALE, EntityDataTypes.VECTOR3F, vector(affine.scale())));
                    if (hosts.contains(i) && !laterLooks.isEmpty()) {
                        data.add(looks[i]);
                    }
                    packets.add(new WrapperPlayServerEntityMetadata(ids[i], data));
                }
                Packets.send(viewer, packets);
                continue;
            }
            if (elapsed < 1 || elapsed % PRELOAD_STEP_TICKS != 1) {
                continue;
            }
            int first = (elapsed / PRELOAD_STEP_TICKS) * hosts.size();
            if (first >= laterLooks.size()) {
                continue;
            }
            List<PacketWrapper<?>> packets = new ArrayList<>(hosts.size());
            for (int h = 0; h < hosts.size() && first + h < laterLooks.size(); h++) {
                packets.add(new WrapperPlayServerEntityMetadata(ids[hosts.get(h)], List.of(laterLooks.get(first + h))));
            }
            Packets.send(viewer, packets);
        }
    }

    /** Toutes les métadonnées d'une pièce, pour son apparition ; « tiny » : réduite à un point (préchargement). */
    private List<EntityData<?>> fullData(int index, boolean tiny) {
        Part part = type.parts().get(index);
        List<EntityData<?>> data = new ArrayList<>(part.staticData().size() + 8);
        data.addAll(part.staticData());
        // Apparence en cours d'une pièce qui en change, à la place de celle de la pose de base
        data.set(0, looks[index]);
        data.add(new EntityData<>(Part.POS_ROT_DURATION, EntityDataTypes.INT, attached ? turnSmoothing : settings.freeUpdateTicks()));
        Affine affine = placed(poses[index], frame);
        data.add(new EntityData<>(Part.TRANSLATION, EntityDataTypes.VECTOR3F, vector(affine.translation())));
        data.add(new EntityData<>(Part.LEFT_ROTATION, EntityDataTypes.QUATERNION, quaternion(affine.left())));
        data.add(new EntityData<>(Part.SCALE, EntityDataTypes.VECTOR3F,
            vector(tiny ? new Vector3f(affine.scale()).mul(PRELOAD_SCALE) : affine.scale())));
        data.add(new EntityData<>(Part.RIGHT_ROTATION, EntityDataTypes.QUATERNION, quaternion(affine.right())));
        return data;
    }

    /**
     * Transformation d'une pièce : sa pose dans le modèle, le placement du compagnon et l'image de l'animation du
     * compagnon entier (décalage, rotation sur lui-même).
     */
    private Affine placed(Affine pose, Animation.Frame frame) {
        PetType.Placement placement = type.placement();
        Vector3f offset = new Vector3f(placement.offset()).add(frame.offset());
        Quaternionf rotation = new Quaternionf(placement.rotation());
        if (frame.spin() != 0) {
            rotation.rotateY((float) Math.toRadians(frame.spin()));
        }
        return pose.placed(offset, rotation, placement.scale());
    }

    /**
     * ATTACHED : nouvelle orientation quand le joueur a assez tourné la tête, lissée par le client. Accroupi, rien
     * n'est envoyé (le client ne fait pas tourner un passager avec son véhicule : le compagnon garde son orientation)
     * ; au relevé il reprend le regard du joueur en resume_smoothing_ticks, un lissage plus long que d'habitude.
     */
    private void turn(int now) {
        if (smoothingEndsTick != 0 && now >= smoothingEndsTick) {
            smoothingEndsTick = 0;
            sendSmoothing(turnSmoothing);
        }
        if (settings.freezeTurnWhenSneaking() && owner.isSneaking()) {
            frozen = true;
            return;
        }
        if (now < nextTurnTick) {
            return;
        }
        float yaw = owner.getYaw();
        boolean resuming = frozen;
        if (Math.abs(Location.normalizeYaw(yaw - sentYaw)) < settings.turnThreshold()) {
            frozen = false;
            return;
        }
        frozen = false;
        sentYaw = yaw;
        nextTurnTick = now + turnInterval;
        int resumeSmoothing = Math.max(settings.sneakResumeTicks(), turnSmoothing);
        boolean slow = resuming && resumeSmoothing > turnSmoothing;
        for (Player viewer : shown.values()) {
            List<PacketWrapper<?>> packets = new ArrayList<>(slow ? ids.length * 2 : ids.length);
            for (int id : ids) {
                if (slow) {
                    packets.add(smoothingPacket(id, resumeSmoothing));
                }
                packets.add(new WrapperPlayServerEntityRotation(id, yaw, 0.0f, false));
            }
            Packets.send(viewer, packets);
        }
        if (slow) {
            smoothingEndsTick = now + resumeSmoothing + 1;
        }
    }

    private static PacketWrapper<?> smoothingPacket(int id, int ticks) {
        return new WrapperPlayServerEntityMetadata(id, List.of(new EntityData<>(Part.POS_ROT_DURATION, EntityDataTypes.INT, ticks)));
    }

    /** Remet à tous la durée de lissage de l'orientation. */
    private void sendSmoothing(int ticks) {
        for (Player viewer : shown.values()) {
            List<PacketWrapper<?>> packets = new ArrayList<>(ids.length);
            for (int id : ids) {
                packets.add(smoothingPacket(id, ticks));
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
            // Accroupi : la position suit toujours, l'orientation reste figée ; au relevé elle rattrape le regard par paliers
            if (!(settings.freezeTurnWhenSneaking() && owner.isSneaking())) {
                freeYaw = Location.normalizeYaw(freeYaw + Location.normalizeYaw(owner.getYaw() - freeYaw) * k);
            }
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

    /**
     * Animations : nouvelle image clé du compagnon entier quand la précédente est atteinte, et images clés propres
     * aux pièces animées du modèle. Le client fait chaque trajet seul, de ce qu'il affiche à la cible, en « durée » ticks.
     */
    private void animate(int now) {
        boolean moves = type.animation().moves();
        boolean whole = moves && now >= nextKeyframeTick;
        boolean turns = false;
        if (whole) {
            Animation animation = type.animation();
            double next = animation.nextKey(animationTime);
            int duration = Math.max(1, (int) Math.round((next - animationTime) / type.animationSpeed()));
            animationTime = animation.wrap(next);
            frameFrom = frame;
            frame = animation.frame(next, type.animationAmplitude());
            // La rotation n'est renvoyée que si l'animation fait tourner le modèle (SPIN) : 18 octets de moins par pièce
            turns = frame.spin() != frameFrom.spin();
            segmentStart = now;
            nextKeyframeTick = now + duration;
        }
        if (animated && partsEpoch == Integer.MIN_VALUE) {
            partsEpoch = now;
            Arrays.fill(poseDue, now);
            Arrays.fill(lookDue, now);
            nextPartTick = now;
        }
        if (!whole && !(animated && now >= nextPartTick)) {
            return;
        }

        // Une liste de métadonnées par pièce à mettre à jour, partagée par tous les joueurs (seuls les paquets sont par joueur)
        List<List<EntityData<?>>> updates = new ArrayList<>(ids.length);
        int[] updated = new int[ids.length];
        int nextPart = Integer.MAX_VALUE;
        for (int i = 0; i < ids.length; i++) {
            Part part = type.parts().get(i);
            Track track = part.track();
            Looks cycle = part.looks();
            EntityData<?> look = null;
            if (cycle != null) {
                if (now >= lookDue[i]) {
                    int local = Math.floorMod(now - partsEpoch, cycle.loop());
                    lookDue[i] = now + cycle.nextTick(local) - local;
                    EntityData<?> wanted = cycle.look(cycle.keyAt(local));
                    if (wanted != looks[i]) {
                        looks[i] = wanted;
                        look = wanted;
                    }
                }
                nextPart = Math.min(nextPart, lookDue[i]);
            }
            // La pièce vise la plus proche des deux prochaines images clés : celle du compagnon entier ou la sienne
            int until = moves ? nextKeyframeTick : Integer.MAX_VALUE;
            Affine pose = poses[i];
            boolean due = false;
            if (track != null) {
                due = now >= poseDue[i];
                if (due) {
                    int local = Math.floorMod(now - partsEpoch, track.loop());
                    poseDue[i] = now + track.nextTick(local) - local;
                }
                nextPart = Math.min(nextPart, poseDue[i]);
                until = Math.min(until, poseDue[i]);
                if (whole || due) {
                    pose = track.at(Math.floorMod(until - partsEpoch, track.loop()));
                }
            }
            if (!whole && !due && look == null) {
                continue;
            }
            if (until == Integer.MAX_VALUE) {
                // Pièce immobile : la nouvelle apparence seule
                updated[updates.size()] = ids[i];
                updates.add(List.of(look));
                continue;
            }
            boolean reshaped = !pose.equals(poses[i]);
            // Pièce qui garde sa pose jusqu'à sa prochaine image clé et suit déjà le reste du compagnon : rien à envoyer
            if (!whole && look == null && !reshaped && (!moves || headed[i] == nextKeyframeTick)) {
                continue;
            }
            poses[i] = pose;
            headed[i] = until;
            Affine affine = placed(pose, frameAt(until));
            List<EntityData<?>> data = new ArrayList<>(8);
            data.add(new EntityData<>(Part.INTERPOLATION_DELAY, EntityDataTypes.INT, 0));
            data.add(new EntityData<>(Part.TRANSFORMATION_DURATION, EntityDataTypes.INT, Math.max(1, until - now)));
            data.add(new EntityData<>(Part.TRANSLATION, EntityDataTypes.VECTOR3F, vector(affine.translation())));
            if (turns || reshaped) {
                data.add(new EntityData<>(Part.LEFT_ROTATION, EntityDataTypes.QUATERNION, quaternion(affine.left())));
            }
            if (reshaped) {
                data.add(new EntityData<>(Part.SCALE, EntityDataTypes.VECTOR3F, vector(affine.scale())));
                if (track.turnsRight()) {
                    data.add(new EntityData<>(Part.RIGHT_ROTATION, EntityDataTypes.QUATERNION, quaternion(affine.right())));
                }
            }
            if (look != null) {
                data.add(look);
            }
            updated[updates.size()] = ids[i];
            updates.add(data);
        }
        nextPartTick = nextPart;
        sendUpdates(updated, updates);
    }

    /** Image du compagnon entier à ce tick, sur le trajet en cours entre deux images clés. */
    private Animation.Frame frameAt(int tick) {
        if (tick >= nextKeyframeTick || nextKeyframeTick <= segmentStart) {
            return frame;
        }
        float k = (tick - segmentStart) / (float) (nextKeyframeTick - segmentStart);
        float turn = frame.spin() - frameFrom.spin();
        if (turn > 180) {
            turn -= 360;
        } else if (turn < -180) {
            turn += 360;
        }
        return new Animation.Frame(new Vector3f(frameFrom.offset()).lerp(frame.offset(), k), frameFrom.spin() + turn * k);
    }

    /** Repos : toutes les pièces reviennent doucement à la pose et à l'apparence de base du modèle, à sa position neutre. */
    private void rest() {
        frame = Animation.Frame.REST;
        frameFrom = frame;
        animationTime = 0;
        List<List<EntityData<?>>> updates = new ArrayList<>(ids.length);
        for (int i = 0; i < ids.length; i++) {
            Part part = type.parts().get(i);
            poses[i] = part.transform();
            Affine affine = placed(poses[i], frame);
            List<EntityData<?>> data = new ArrayList<>(8);
            data.add(new EntityData<>(Part.INTERPOLATION_DELAY, EntityDataTypes.INT, 0));
            data.add(new EntityData<>(Part.TRANSFORMATION_DURATION, EntityDataTypes.INT, REST_TRANSITION_TICKS));
            data.add(new EntityData<>(Part.TRANSLATION, EntityDataTypes.VECTOR3F, vector(affine.translation())));
            data.add(new EntityData<>(Part.LEFT_ROTATION, EntityDataTypes.QUATERNION, quaternion(affine.left())));
            if (part.track() != null) {
                data.add(new EntityData<>(Part.SCALE, EntityDataTypes.VECTOR3F, vector(affine.scale())));
                if (part.track().turnsRight()) {
                    data.add(new EntityData<>(Part.RIGHT_ROTATION, EntityDataTypes.QUATERNION, quaternion(affine.right())));
                }
            }
            EntityData<?> look = part.staticData().getFirst();
            if (look != looks[i]) {
                looks[i] = look;
                data.add(look);
            }
            updates.add(data);
        }
        sendUpdates(ids, updates);
    }

    /** Envoie à tous une mise à jour de métadonnées par pièce (updates.get(n) pour l'entité entities[n]). */
    private void sendUpdates(int[] entities, List<List<EntityData<?>>> updates) {
        if (updates.isEmpty()) {
            return;
        }
        for (Player viewer : shown.values()) {
            // Modèle encore réduit à un point chez ce joueur : il recevra l'état courant en se déployant
            if (!preloading.isEmpty() && preloading.containsKey(viewer.getUniqueId())) {
                continue;
            }
            List<PacketWrapper<?>> packets = new ArrayList<>(updates.size());
            for (int n = 0; n < updates.size(); n++) {
                packets.add(new WrapperPlayServerEntityMetadata(entities[n], updates.get(n)));
            }
            Packets.send(viewer, packets);
        }
    }

    private static com.github.retrooper.packetevents.util.Vector3f vector(Vector3fc v) {
        return new com.github.retrooper.packetevents.util.Vector3f(v.x(), v.y(), v.z());
    }

    private static Quaternion4f quaternion(Quaternionfc q) {
        return new Quaternion4f(q.x(), q.y(), q.z(), q.w());
    }
}
