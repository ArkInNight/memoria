import { useMemo, useState } from "react";

import { profileStore } from "@/stores/profile-store";
import { summonStore } from "@/stores/summon-store";
import { catalogStore } from "@/stores/catalog-store";
import { getPityPoolForRun, getPityPoolOfSummon } from "@/core/summon-engine";
import type { BannerOption } from "./history-filters";

const LIMIT = 10;

/** Filtering + pagination state for the summon history table. */
export function useSummonHistory(lockedBannerRunId?: string) {
  const profile = profileStore.useActiveProfile();
  const allSummons = summonStore.useSummons(profile?.id);
  const deletedSummons = summonStore.useDeletedSummons(profile?.id);

  const isLocked = Boolean(lockedBannerRunId);
  const [filterState, setFilterState] = useState({
    profileId: profile?.id,
    search: "",
    bannerFilter: "all",
    poolFilter: "all",
    rarityFilter: "all",
    view: "active" as "active" | "trash",
    page: 1,
  });
  const currentState =
    filterState.profileId === profile?.id
      ? filterState
      : {
          profileId: profile?.id,
          search: "",
          bannerFilter: "all",
          poolFilter: "all",
          rarityFilter: "all",
          view: "active" as "active" | "trash",
          page: 1,
        };
  const { search, bannerFilter, poolFilter, rarityFilter, view, page } = currentState;

  const runs = useMemo(() => catalogStore.getBannerInstances(), []);
  const banners = useMemo<BannerOption[]>(
    () =>
      runs.map((run) => ({
        instanceId: run.instanceId,
        label: catalogStore.getInstanceLabel(run),
      })),
    [runs]
  );
  const pools = useMemo(
    () => [...new Set(runs.map((run) => getPityPoolForRun(run, catalogStore.bannerRules)))].sort(),
    [runs]
  );
  const imageUrlOf = catalogStore.characterImageUrl;
  const effectiveBannerFilter = lockedBannerRunId ?? bannerFilter;

  const filtered = useMemo(() => {
    let rows = [...(view === "trash" ? deletedSummons : allSummons)];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (effectiveBannerFilter !== "all" && view !== "trash") {
      rows = rows.filter(
        (summon) => catalogStore.getInstanceForSummon(summon)?.instanceId === effectiveBannerFilter
      );
    }
    if (poolFilter !== "all") {
      rows = rows.filter(
        (summon) =>
          getPityPoolOfSummon(
            summon,
            catalogStore.getInstanceForSummon,
            catalogStore.bannerRules
          ) === poolFilter
      );
    }
    if (rarityFilter !== "all") {
      rows = rows.filter((p) => p.rarity === parseInt(rarityFilter));
    }
    rows.sort((a, b) => b.createTime.localeCompare(a.createTime));
    return rows;
  }, [allSummons, deletedSummons, view, search, effectiveBannerFilter, poolFilter, rarityFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * LIMIT, safePage * LIMIT);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilterState({ ...currentState, page: newPage });
    }
  };

  const setSearchValue = (value: string) => {
    setFilterState({ ...currentState, search: value, page: 1 });
  };

  const setBanner = (value: string) => {
    if (isLocked) return;
    setFilterState({ ...currentState, bannerFilter: value, page: 1 });
  };

  const setPool = (value: string) => {
    if (isLocked) return;
    setFilterState({
      ...currentState,
      bannerFilter: "all",
      poolFilter: value,
      page: 1,
    });
  };

  const setRarity = (value: string) => {
    setFilterState({ ...currentState, rarityFilter: value, page: 1 });
  };

  const setView = (value: "active" | "trash") => {
    setFilterState({ ...currentState, view: value, page: 1 });
  };

  return {
    profile,
    allSummons,
    deletedSummons,
    banners,
    pools,
    imageUrlOf,
    isLocked,
    search,
    bannerFilter: effectiveBannerFilter,
    poolFilter,
    rarityFilter,
    view,
    setSearch: setSearchValue,
    setBanner,
    setPool,
    setRarity,
    setView,
    total,
    totalPages,
    safePage,
    pageData,
    handlePageChange,
  };
}
