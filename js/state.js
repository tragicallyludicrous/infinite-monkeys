import {
  STARTING_CASH,
  BASE_MONKEY_COST,
  BASE_AUTOCLICKER_COST,
  BASE_MONKEYPACK_COST,
  BASE_MONKEYFARM_COST,
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
  topScoringMonkey: 0,
  bestPassage: 0,
  autoClickerFlag: false,
  autoClickers: [],
  autoClickerCost: BASE_AUTOCLICKER_COST,
  speedBoosterFlag: false,
  monkeyPackFlag: false,
  monkeyPacks: [],
  monkeyPackCost: BASE_MONKEYPACK_COST,
  intBoosterFlag: false,
  typewriterUpgradeFlag: false,
  monkeyFarms: [],
  monkeyFarmCost: BASE_MONKEYFARM_COST,
  monkeyFarmFlag: false,
  intBoosterFlag: false,
  winFlag: false,
  autoClickerTargets: [],
  passage: PASSAGE,
  ETA: "Never",
};
