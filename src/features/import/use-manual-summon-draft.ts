import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { ImportFeedback, Profile, Rarity, SummonInput } from "@/shared";
import { RARITY_ORDER, RARITY_LABEL } from "@/shared";
import { catalogStore } from "@/stores/catalog-store";
import { getPityTrackMap, currentPityForTrack, DEFAULT_BANNER_RULE } from "@/core/summon-engine";
import { summonStore } from "@/stores/summon-store";

function localNowValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export interface PityInfo {
  group: string;
  pity: number;
}

export interface ManualSummonGroup {
  value: string;
  items: string[];
}

/**
 * State and logic for the manual summon entry tab: banner/character pickers,
 * the accumulated draft list, and the pity preview for the selected pool.
 */
export function useManualSummonDraft(profile: Profile) {
  const banners = useMemo(() => catalogStore.getBannerInstances(), []);
  const allSummons = summonStore.useSummons(profile.id);

  const instanceById = useMemo(() => new Map(banners.map((b) => [b.instanceId, b])), [banners]);
  const bannerOptions = useMemo(() => banners.map((b) => b.instanceId), [banners]);
  const bannerToLabel = (value: string) => {
    const run = instanceById.get(value);
    return run ? catalogStore.getInstanceLabel(run) : value;
  };

  const charGroups = useMemo<ManualSummonGroup[]>(() => {
    const charsByRarity = new Map<Rarity, string[]>();
    for (const r of RARITY_ORDER) charsByRarity.set(r, []);
    for (const c of catalogStore.characters) charsByRarity.get(c.rarity)?.push(c.name);
    for (const list of charsByRarity.values()) list.sort();
    return RARITY_ORDER.map((r) => ({
      value: RARITY_LABEL[r],
      items: [...(charsByRarity.get(r) ?? [])],
    }));
  }, []);

  const [banner, setBanner] = useState<string | null>(null);
  const [character, setCharacter] = useState<string | null>(null);
  const [manualPity, setManualPity] = useState("");
  const [createTime, setCreateTime] = useState(localNowValue);
  const [isPending, setIsPending] = useState(false);
  const [draft, setDraft] = useState<SummonInput[]>([]);
  const [result, setResult] = useState<ImportFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCharacter(null);
    setManualPity("");
  };

  const resetAll = () => {
    setBanner(null);
    resetForm();
    setCreateTime(localNowValue());
    setDraft([]);
  };

  const removeFromList = (index: number) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const clearList = () => setDraft([]);

  const run = banner ? instanceById.get(banner) : undefined;
  const poolName = run?.name ?? "";
  const trackOf = useMemo(
    () => getPityTrackMap(catalogStore.bannerRules, catalogStore.banners),
    []
  );
  const pityInfo = useMemo<PityInfo | null>(() => {
    if (!poolName) return null;
    const track = trackOf.get(poolName) ?? DEFAULT_BANNER_RULE.pityPool;
    const inTrack = (pool: string) => (trackOf.get(pool) ?? DEFAULT_BANNER_RULE.pityPool) === track;
    const profileSummons = allSummons.filter((p) => inTrack(p.poolName));
    const draftSummons = draft
      .filter((d) => inTrack(d.poolName))
      .map((d) => ({ rarity: d.rarity, createTime: d.createTime }));
    return {
      group: track,
      pity: currentPityForTrack([...profileSummons, ...draftSummons]),
    };
  }, [poolName, allSummons, draft, trackOf]);

  const addToList = () => {
    const poolNameValue = run?.name ?? "";
    const name = character ?? "";

    if (!poolNameValue) {
      toast.error("Select a banner first.");
      return;
    }
    if (!name) {
      toast.error("Select a character first.");
      return;
    }
    if (!createTime) {
      toast.error("Fill in the summon time.");
      return;
    }

    let pityOverride: number | undefined;
    if (manualPity.trim() !== "") {
      pityOverride = Number(manualPity);
      if (!Number.isInteger(pityOverride) || pityOverride < 1) {
        toast.error("Pity override must be a whole number of 1 or greater.");
        return;
      }
    }

    const time = createTime.replace("T", " ").padEnd(19, ":00");
    const rarity = catalogStore.characterRarity(name, 3);

    const duplicate = draft.some(
      (d) =>
        d.poolName === poolNameValue &&
        d.poolInstanceId === banner &&
        d.name === name &&
        d.createTime === time
    );
    if (duplicate) {
      toast.error("This record is already in the list.");
      return;
    }

    setDraft((prev) => [
      ...prev,
      {
        poolName: poolNameValue,
        poolInstanceId: banner ?? undefined,
        name,
        rarity,
        summonType: "1",
        createTime: time,
        pityOverride,
      },
    ]);
    resetForm();
    toast.success("Added to list", {
      description: `${name} · ${bannerToLabel(banner ?? "")}`,
    });
  };

  const handleImport = async () => {
    if (draft.length === 0) return;

    setIsPending(true);
    setResult(null);
    setError(null);
    try {
      const res = await summonStore.importManual(profile.id, draft);
      setResult({ importedCount: res.importedCount, duplicateCount: res.duplicateCount });
      toast.success("Import successful", {
        description: `${res.importedCount} summons added to profile "${profile.name}".`,
      });
      resetAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error("Import failed", {
        description: message,
      });
    } finally {
      setIsPending(false);
    }
  };

  return {
    bannerOptions,
    bannerToLabel,
    charGroups,
    banner,
    setBanner,
    character,
    setCharacter,
    manualPity,
    setManualPity,
    createTime,
    setCreateTime,
    isPending,
    draft,
    pityInfo,
    result,
    error,
    addToList,
    removeFromList,
    clearList,
    handleImport,
  };
}
