import { useMemo, useState } from "react";

import { useActiveProfile } from "@/lib/store/profiles";
import { usePullRecords } from "@/lib/store/summons";
import {
  getBannerRuns,
  characterImageMap,
  runForPull,
  runLabel,
  BANNER_RULES,
} from "@/lib/domain/assets";
import { pityPoolForRun, pityPoolOfPull } from "@/lib/domain/pityEngine";
import type { BannerOption } from "./history-filters";

const LIMIT = 20;

/** Filtering + pagination state for the summon history table. */
export function useSummonHistory(lockedBannerRunId?: string) {
  const profile = useActiveProfile();
  const allPulls = usePullRecords(profile?.id);

  const isLocked = Boolean(lockedBannerRunId);
  const [filterState, setFilterState] = useState({
    profileId: profile?.id,
    search: "",
    bannerFilter: "all",
    poolFilter: "all",
    rarityFilter: "all",
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
          page: 1,
        };
  const { search, bannerFilter, poolFilter, rarityFilter, page } = currentState;

  const runs = useMemo(() => getBannerRuns(), []);
  const banners = useMemo<BannerOption[]>(
    () => runs.map((r) => ({ runId: r.runId, label: runLabel(r) })),
    [runs]
  );
  const pools = useMemo(
    () => [...new Set(runs.map((r) => pityPoolForRun(r, BANNER_RULES)))].sort(),
    [runs]
  );
  const charImageByName = useMemo(() => characterImageMap(), []);
  const effectiveBannerFilter = lockedBannerRunId ?? bannerFilter;

  const filtered = useMemo(() => {
    let rows = [...allPulls];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (effectiveBannerFilter !== "all") {
      rows = rows.filter((p) => runForPull(p)?.runId === effectiveBannerFilter);
    }
    if (poolFilter !== "all") {
      rows = rows.filter((p) => pityPoolOfPull(p, BANNER_RULES) === poolFilter);
    }
    if (rarityFilter !== "all") {
      rows = rows.filter((p) => p.rarity === parseInt(rarityFilter));
    }
    rows.sort((a, b) => b.createTime.localeCompare(a.createTime));
    return rows;
  }, [allPulls, search, effectiveBannerFilter, poolFilter, rarityFilter]);

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

  return {
    profile,
    allPulls,
    banners,
    pools,
    charImageByName,
    isLocked,
    search,
    bannerFilter: effectiveBannerFilter,
    poolFilter,
    rarityFilter,
    setSearch: setSearchValue,
    setBanner,
    setPool,
    setRarity,
    total,
    totalPages,
    safePage,
    pageData,
    handlePageChange,
  };
}
