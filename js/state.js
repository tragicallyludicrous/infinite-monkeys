import {
  STARTING_CASH,
  BASE_MONKEY_COST,
  BASE_AUTOCLICKER_COST,
  PASSAGE,
} from "./config.js";

// ====================================
// --- Initial Globals ---
// ====================================

export const gameState = {
  ticks: 0,
  cash: STARTING_CASH,
  historicCash: [],
  monkeys: [],
  monkeyCost: BASE_MONKEY_COST,
  generations: 0,
  topScore: 0,
  topScoringMonkey: null,
  bestPassage: null,
  autoClickerFlag: false,
  autoClickers: [],
  autoClickerCost: BASE_AUTOCLICKER_COST,
  speedBoosterFlag: false,
  monkeyPackFlag: false,
  monkeyPacks: [],
  monkeyPackCost: 0,
  typewriterUpgradeFlag: false,
  monkeyFarms: [],
  monkeyFarmCost: 0,
  monkeyFarmFlag: false,
  intBoosterFlag: false,
  winFlag: false,
  autoClickerTargets: [],
  passage: PASSAGE,
  ETA: "Never",
};
