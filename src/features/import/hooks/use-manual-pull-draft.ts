import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { ImportResult, Profile, Rarity } from "@/lib/shared";
import { RARITY_ORDER, RARITY_LABEL } from "@/lib/shared";
import {
  CHARACTERS,
  BANNER_RULES,
  getBannerRuns,
  characterRarity,
  runLabel,
} from "@/lib/domain/assets";
import { pityGroupMap, currentPityForGroup, DEFAULT_BANNER_RULE } from "@/lib/domain/pityEngine";
import { importManualPulls, type ManualPullInput } from "@/lib/domain/manualPull";
import { usePullRecords } from "@/lib/store/summons";

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

export interface ManualPullGroup {
  value: string;
  items: string[];
}

/**
 * State and logic for the manual summon entry tab: banner/character pickers,
 * the accumulated draft list, and the pity preview for the selected pool.
 */
export function useManualPullDraft(profile: Profile) {
  const banners = useMemo(() => getBannerRuns(), []);
  const allPulls = usePullRecords(profile?.id);

  const runById = useMemo(() => new Map(banners.map((b) => [b.runId, b])), [banners]);
  const bannerOptions = useMemo(() => banners.map((b) => b.runId), [banners]);
  const bannerToLabel = (value: string) => {
    const run = runById.get(value);
    return run ? runLabel(run) : value;
  };

  const charGroups = useMemo<ManualPullGroup[]>(() => {
    const charsByRarity = new Map<Rarity, string[]>();
    for (const r of RARITY_ORDER) charsByRarity.set(r, []);
    for (const c of CHARACTERS) charsByRarity.get(c.rarity)?.push(c.name);
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
  const [draft, setDraft] = useState<ManualPullInput[]>([]);
  const [result, setResult] = useState<Pick<
    ImportResult,
    "importedCount" | "duplicateCount"
  > | null>(null);
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

  const run = banner ? runById.get(banner) : undefined;
  const poolName = run?.name ?? "";
  const groupOf = useMemo(() => pityGroupMap(BANNER_RULES), []);
  const pityInfo = useMemo<PityInfo | null>(() => {
    if (!poolName) return null;
    const group = groupOf.get(poolName) ?? DEFAULT_BANNER_RULE.pityPool;
    const inGroup = (pool: string) => (groupOf.get(pool) ?? DEFAULT_BANNER_RULE.pityPool) === group;
    const profilePulls = allPulls.filter((p) => inGroup(p.poolName));
    const draftPulls = draft
      .filter((d) => inGroup(d.poolName))
      .map((d) => ({ rarity: d.rarity, createTime: d.createTime }));
    return {
      group,
      pity: currentPityForGroup([...profilePulls, ...draftPulls]),
    };
  }, [poolName, allPulls, draft, groupOf]);

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
    const rarity = characterRarity(name, 3);

    const duplicate = draft.some(
      (d) =>
        d.poolName === poolNameValue &&
        d.poolRunId === banner &&
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
        poolRunId: banner ?? undefined,
        name,
        rarity,
        summonType: "1",
        createTime: time,
        manualPity: pityOverride,
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
      const res = await importManualPulls(profile.id, draft);
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
