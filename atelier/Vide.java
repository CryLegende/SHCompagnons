// Lit des fichiers de modèles avec l'importeur de SHCompagnons (poses et animations comprises) et écrit en JSON ce
// que le plugin en retient : pièces décomposées (translation, rotations, échelle) et images clés gardées par pièce.
// Usage : java -cp "<SHCompagnons>/target/classes;<joml.jar>;<packetevents-api.jar>" Vide.java <sortie.json> <fichier.txt>...
import com.github.retrooper.packetevents.protocol.entity.data.EntityData;
import org.Cry_Legende.sHCompagnons.model.Affine;
import org.Cry_Legende.sHCompagnons.model.Looks;
import org.Cry_Legende.sHCompagnons.model.Snbt;
import org.Cry_Legende.sHCompagnons.model.SummonImporter;
import org.Cry_Legende.sHCompagnons.model.Track;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Locale;

public class Vide {
    public static void main(String[] a) throws Exception {
        StringBuilder out = new StringBuilder("{");
        for (int n = 1; n < a.length; n++) {
            Path p = Path.of(a[n]);
            String name = p.getFileName().toString().replaceAll("\\.[a-z]+$", "");
            SummonImporter.Source source = SummonImporter.split(Files.readString(p));
            List<SummonImporter.RawPart> raw = SummonImporter.parse(source.base());
            SummonImporter.Bounds bounds = SummonImporter.bounds(raw);
            List<SummonImporter.RawPart> base = SummonImporter.centered(raw, bounds);
            String[] tracks = new String[base.size()];
            String[] cycles = new String[base.size()];
            int animated = 0, keys = 0;
            for (SummonImporter.Clip clip : source.clips()) {
                int count = clip.poses().size() + 1;
                int[] ticks = new int[count];
                List<List<SummonImporter.RawPart>> poses = new ArrayList<>();
                poses.add(base);
                for (int k = 1; k < count; k++) {
                    ticks[k] = clip.poses().get(k - 1).tick();
                    List<SummonImporter.RawPart> pose = SummonImporter.centered(SummonImporter.parse(clip.poses().get(k - 1).commands()), bounds);
                    if (pose.size() != base.size()) throw new IllegalStateException(name + " @pose " + ticks[k] + " : " + pose.size() + " entités au lieu de " + base.size());
                    poses.add(pose);
                }
                for (int i = 0; i < base.size(); i++) {
                    Affine[] transforms = new Affine[count];
                    String[] ids = new String[count];
                    for (int k = 0; k < count; k++) {
                        transforms[k] = poses.get(k).get(i).transform();
                        ids[k] = what(poses.get(k).get(i));
                    }
                    Track track = Track.of(clip.loop(), ticks, transforms);
                    if (track != null && tracks[i] == null) {
                        StringBuilder t = new StringBuilder("{\"loop\":" + clip.loop() + ",\"keys\":[");
                        int tick = 0;
                        for (int k = 0; k < track.keys(); k++) {
                            if (k > 0) t.append(',');
                            t.append("{\"tick\":").append(tick).append(',').append(affine(track.at(tick))).append('}');
                            tick = track.nextTick(tick);
                            keys++;
                        }
                        tracks[i] = t.append("]}").toString();
                    }
                    Looks looks = Looks.of(clip.loop(), ticks, new EntityData<?>[count], ids);
                    if (looks != null && cycles[i] == null) {
                        StringBuilder t = new StringBuilder("{\"loop\":" + clip.loop() + ",\"keys\":[");
                        int tick = 0;
                        for (int k = 0; k < looks.keys(); k++) {
                            int index = 0;
                            while (ticks[index] != tick) index++;
                            if (k > 0) t.append(',');
                            t.append("{\"tick\":").append(tick).append(",\"w\":\"").append(ids[index]).append("\"}");
                            tick = looks.nextTick(tick);
                            keys++;
                        }
                        cycles[i] = t.append("]}").toString();
                    }
                }
            }
            for (int i = 0; i < base.size(); i++) if (tracks[i] != null || cycles[i] != null) animated++;
            var size = bounds.size();
            if (n > 1) out.append(',');
            var center = bounds.center();
            out.append('"').append(name).append("\":{\"size\":[").append(size.x).append(',').append(size.y).append(',').append(size.z)
                .append("],\"center\":[").append(center.x).append(',').append(center.y).append(',').append(center.z).append("],\"parts\":[");
            for (int i = 0; i < base.size(); i++) {
                SummonImporter.RawPart part = base.get(i);
                if (i > 0) out.append(',');
                out.append("{\"k\":\"").append(part.type()).append("\",\"w\":\"").append(what(part)).append("\",").append(affine(part.transform()));
                if (tracks[i] != null) out.append(",\"track\":").append(tracks[i]);
                if (cycles[i] != null) out.append(",\"looks\":").append(cycles[i]);
                out.append('}');
            }
            out.append("]}");
            System.out.printf(Locale.ROOT, "%-20s pièces=%2d animées=%d images clés=%d taille=%.2f x %.2f x %.2f%n", name, base.size(), animated, keys, size.x, size.y, size.z);
        }
        Files.writeString(Path.of(a[0]), out.append('}'));
    }

    static String affine(Affine x) {
        return String.format(Locale.ROOT, "\"t\":[%s,%s,%s],\"l\":[%s,%s,%s,%s],\"s\":[%s,%s,%s],\"r\":[%s,%s,%s,%s]",
            x.translation().x(), x.translation().y(), x.translation().z(), x.left().x(), x.left().y(), x.left().z(), x.left().w(),
            x.scale().x(), x.scale().y(), x.scale().z(), x.right().x(), x.right().y(), x.right().z(), x.right().w());
    }

    /** Ce que montre une pièce : « head:<empreinte> », nom de bloc ou d'objet, suivi de « @contexte » s'il y en a un. */
    static String what(SummonImporter.RawPart part) {
        Snbt.Compound d = part.data();
        String what = "";
        if (part.type().equals("block_display")) {
            what = SummonImporter.blockName(d.compound("block_state"));
        } else if (part.type().equals("item_display")) {
            Snbt.Compound item = d.compound("item");
            what = item.string("id");
            String tex = texture(item);
            if (tex != null) {
                String json = new String(Base64.getMimeDecoder().decode(tex.replaceAll("[^A-Za-z0-9+/=]", "")));
                int u = json.indexOf("/texture/");
                what = "head:" + json.substring(u + 9, json.indexOf('"', u));
            }
            String ctx = d.string("item_display");
            if (ctx != null && !ctx.equals("none")) what += "@" + ctx;
        }
        return String.valueOf(what).replace("minecraft:", "");
    }

    static String texture(Snbt.Compound item) {
        Snbt.Compound c = item.compound("components");
        if (c != null && c.compound("minecraft:profile") != null) {
            List<?> props = c.compound("minecraft:profile").list("properties");
            if (props != null && !props.isEmpty() && props.get(0) instanceof Snbt.Compound p) return p.string("value");
        }
        Snbt.Compound tag = item.compound("tag");
        Snbt.Compound owner = tag == null ? null : tag.compound("SkullOwner");
        Snbt.Compound properties = owner == null ? null : owner.compound("Properties");
        List<?> t = properties == null ? null : properties.list("textures");
        if (t != null && !t.isEmpty() && t.get(0) instanceof Snbt.Compound x) return x.string("Value");
        return null;
    }
}
