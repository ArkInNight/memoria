import type { BannerRuleMap } from "@/shared";

export const bannerRules = {
  debut: {
    pityPool: "character",
    carryOver: true,
    rateUp: "5050",
  },
  rerun: {
    pityPool: "character",
    carryOver: true,
    rateUp: "5050",
  },
  limited: {
    pityPool: "limited",
    carryOver: false,
    rateUp: "5050",
  },
  collaboration: {
    pityPool: "collaboration",
    carryOver: false,
    rateUp: "5050",
  },
  ripples: {
    pityPool: "ripples",
    carryOver: true,
    rateUp: "100-first",
  },
  promise: {
    pityPool: "promise",
    carryOver: false,
    rateUp: "5050",
  },
  revelation: {
    pityPool: "revelation",
    carryOver: false,
    rateUp: "5050",
  },
  boon: {
    pityPool: "boon",
    carryOver: false,
    rateUp: "100",
  },
  invitation: {
    pityPool: "invitation",
    carryOver: false,
    rateUp: "5050",
  },
  covenant: {
    pityPool: "covenant",
    carryOver: false,
    rateUp: "5050",
  },
  snow: {
    pityPool: "snow",
    carryOver: false,
    rateUp: "5050",
  },
  yearning: {
    pityPool: "yearning",
    carryOver: false,
    rateUp: "5050",
  },
  beginner: {
    pityPool: "beginner",
    carryOver: true,
    rateUp: "none",
  },
  standard: {
    pityPool: "standard",
    carryOver: true,
    rateUp: "none",
  },
} satisfies BannerRuleMap;
