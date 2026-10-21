package org.Cry_Legende.sHCompagnons.config;

import org.Cry_Legende.sHCompagnons.pet.AnimationType;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class PetConfig {
    private final String typeKey;
    private final String displayName;
    private final AnimationType animationType;
    private final List<SkinEntry> skins;
    private final int globalSkinUpdateIntervalTicks; // Intervalle global pour ce pet (en ticks)

    public static class SkinEntry {
        private final String value;
        private final Integer skinUpdateIntervalTicks; // Intervalle spécifique à cette skin (en ticks), peut être null

        public SkinEntry(@NotNull String value, @Nullable Integer skinUpdateIntervalTicks) {
            this.value = value;
            this.skinUpdateIntervalTicks = skinUpdateIntervalTicks;
        }

        @NotNull
        public String getValue() {
            return value;
        }

        @Nullable
        public Integer getSkinUpdateIntervalTicks() {
            return skinUpdateIntervalTicks;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            SkinEntry skinEntry = (SkinEntry) o;
            return value.equals(skinEntry.value) && Objects.equals(skinUpdateIntervalTicks, skinEntry.skinUpdateIntervalTicks);
        }

        @Override
        public int hashCode() {
            return Objects.hash(value, skinUpdateIntervalTicks);
        }
    }

    // Constructeur pour compatibilité (un seul skin)
    public PetConfig(@NotNull String typeKey, @NotNull String displayName, @NotNull AnimationType animationType, @NotNull String singleSkinValue) {
        this.typeKey = typeKey;
        this.displayName = displayName;
        this.animationType = animationType;
        this.skins = Collections.singletonList(new SkinEntry(singleSkinValue, null));
        this.globalSkinUpdateIntervalTicks = 0; // Pas de changement de skin
    }

    // Nouveau constructeur pour plusieurs skins
    public PetConfig(@NotNull String typeKey, @NotNull String displayName, @NotNull AnimationType animationType, @NotNull List<SkinEntry> skins, int globalSkinUpdateIntervalTicks) {
        this.typeKey = typeKey;
        this.displayName = displayName;
        this.animationType = animationType;
        this.skins = skins == null || skins.isEmpty() ?
            Collections.singletonList(new SkinEntry("ERROR_NO_SKIN_DEFINED_IN_LIST", null)) :
            Collections.unmodifiableList(new ArrayList<>(skins));
        this.globalSkinUpdateIntervalTicks = globalSkinUpdateIntervalTicks;
    }

    @NotNull
    public String getTypeKey() {
        return typeKey;
    }

    @NotNull
    public String getDisplayName() {
        return displayName;
    }

    @NotNull
    public AnimationType getAnimationType() {
        return animationType;
    }

    @NotNull
    public List<SkinEntry> getSkins() {
        return skins;
    }

    @NotNull
    public String getCurrentSkinValue(int index) {
        if (skins.isEmpty() || index < 0 || index >= skins.size()) {
            return skins.isEmpty() ? "ERROR_SKIN_INDEX_OUT_OF_BOUNDS" : skins.get(0).getValue();
        }
        return skins.get(index).getValue();
    }

    public int getGlobalSkinUpdateIntervalTicks() {
        return globalSkinUpdateIntervalTicks;
    }

    public boolean hasMultipleSkins() {
        return skins.size() > 1;
    }

    public int getEffectiveSkinUpdateIntervalTicks(int skinIndex) {
        if (!hasMultipleSkins() || skinIndex < 0 || skinIndex >= skins.size()) {
            return 0; // Pas de cycle
        }
        SkinEntry entry = skins.get(skinIndex);
        if (entry.getSkinUpdateIntervalTicks() != null && entry.getSkinUpdateIntervalTicks() > 0) {
            return entry.getSkinUpdateIntervalTicks();
        }
        return this.globalSkinUpdateIntervalTicks > 0 ? this.globalSkinUpdateIntervalTicks : 0;
    }

    @Deprecated
    @NotNull
    public String getSkinValue() { // Pour ancienne compatibilité, retourne la première skin
        return skins.get(0).getValue();
    }
}
