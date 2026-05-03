import { gameState } from "./state.js";

import { spawnAutoClicker, autoClick, runAutoClickers } from "./clickers.js";

import {
  DEVELOPER_MODE,
  STARTING_CASH,
  BASE_MONKEY_COST,
  MONKEY_COST_MULTIPLIER,
  PASSAGE,
  ALPHABET,
  TYPE_TIME,
  PAYOUT_BASE,
  SCORE_MULTPLIER,
  BASE_AUTOCLICKER_COST,
  AUTOCLICKER_COST_MULTIPLIER,
  AUTOCLICKER_THRESHOLD,
  AUTOCLICKER_TIME,
  BASE_SPEED_COST,
  SPEED_COST_MULTIPLIER,
  SPEED_BOOST_THRESHOLD,
  NAMESPACE_LOOPS,
  TICK_INTERVAL,
  BASE_MONKEYPACK_COST,
  MONKEYPACK_THRESHOLD,
  BASE_MONKEYFARM_COST,
  MONKEYFARM_THRESHOLD,
  BASE_INT_COST,
  INT_BOOST_THRESHOLD,
  INT_COST_MULTIPLIER,
  cashFormatter,
} from "./config.js";

import {
  cashPerSec,
  ETAtoString,
  getRandomHighlightColor,
  monkeyProb,
  passageFormatter,
  payoutLog,
  randomLetter,
  randomObject,
  randomWord,
  score,
  secondsPerTick,
  ticksPerSecond,
  yearFormatter,
} from "./helpers.js";

import { monkeyName, renderOutput } from "./monkeys.js";

import { adjectives, nouns } from "./monkeynames.js";

import { HUDNotify } from "./notifications.js";

// ====================================
// --- Buying Stuff ---
// ====================================

export function buyAutoClicker() {
  const { cash, autoClickerCost, autoClickers } = gameState;
  if (cash >= autoClickerCost) {
    gameState.cash -= autoClickerCost;
    const autoClicker = {
      type: "autoClicker",
      id: autoClickers.length + 1,
      speed: 1,
      color: getRandomHighlightColor(),
      target: null,
      busy: false,
    };
    gameState.autoClickers.push(autoClicker);
    spawnAutoClicker(autoClicker);
  }
}

export function buySpeedBooster(object) {
  const cash = gameState.cash;
  if (cash >= object.speedBoosterCost) {
    gameState.cash -= object.speedBoosterCost;
    object.speed++;
    object.speedBoosterCost *= SPEED_COST_MULTIPLIER;
  }
}

export function buyIntBooster(object) {
  const cash = gameState.cash;
  if (cash >= object.intBoosterCost) {
    gameState.cash -= object.intBoosterCost;
    object.intelligence++;
    object.intBoosterCost *= INT_COST_MULTIPLIER;
  }
}
