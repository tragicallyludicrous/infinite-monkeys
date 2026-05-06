import {
  STARTING_CASH,
  BASE_MONKEY_COST,
  BASE_AUTOCLICKER_COST,
  PASSAGE,
  monkeyTypes,
} from "./config.js";

// ====================================
// --- Initial Globals ---
// ====================================

const types = Object.keys(monkeyTypes);

export const gameState = {
  // Scalars
  ticks: 0,
  cash: STARTING_CASH,
  passage: PASSAGE,

  historicCash: [],
  generations: 0,
  topScore: 0,
  topScoringMonkey: null,
  bestPassage: null,
  autoClickerFlag: false,
  autoClickers: [],
  autoClickerCost: BASE_AUTOCLICKER_COST,
  speedBoosterFlag: false,

  // Monkeys
  monkeys: Object.fromEntries(types.map((t) => [t, []])),
  costs: Object.fromEntries(types.map((t) => [t, BASE_MONKEY_COST])),
  flags: Object.fromEntries(
    types.filter((t) => t != "monkey").map((t) => [t, false]),
  ),

  typewriterUpgradeFlag: false,
  intBoosterFlag: false,
  winFlag: false,
  autoClickerTargets: [],

  ETA: "Never",
};
