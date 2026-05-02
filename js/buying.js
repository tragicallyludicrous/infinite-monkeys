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

import { monkeyName, updateCard, renderOutput } from "./monkeys.js";

import { adjectives, nouns } from "./monkeynames.js";

import { HUDNotify } from "./notifications.js";

// ====================================
// --- Buying Stuff ---
// ====================================

export function buyMonkey() {
  const { cash, monkeyCost, monkeys } = gameState;
  if (cash >= monkeyCost) {
    gameState.cash -= monkeyCost;
    const monkey = {
      header: "Monkey",
      type: "monkey",
      id: monkeys.length + 1,
      name: monkeyName(),
      speed: 1,
      speedBoosterCost: BASE_SPEED_COST,
      intBoosterCost: BASE_INT_COST,
      intelligence: 1,
      typewriter: "basic",
      outputs: [],
      latestScore: 0,
      highScore: 0,
      bestStreak: 0,
      bestAttempt: "",
      typing: false,
      threads: 1,
    };
    gameState.monkeys.push(monkey);
    spawn(monkey);
  }
}

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
    updateCard(object);
  }
}

export function buyIntBooster(object) {
  const cash = gameState.cash;
  if (cash >= object.intBoosterCost) {
    gameState.cash -= object.intBoosterCost;
    object.intelligence++;
    object.intBoosterCost *= INT_COST_MULTIPLIER;
    updateCard(object);
  }
}

export function buyMonkeyThing(thing, size) {
  const cash = gameState.cash;
  const cost = gameState[thing + "Cost"];
  const array = gameState[thing + "s"];

  if (cash >= cost) {
    gameState.cash -= cost;
    const newUnit = {
      header: thing,
      type: thing,
      id: array.length + 1,
      name: `${thing} ${monkeyName()}`,
      speed: 1,
      speedBoosterCost: BASE_SPEED_COST * (size * 0.8),
      intBoosterCost: BASE_INT_COST * (size * 0.8),
      intelligence: 1,
      typewriter: "basic",
      outputs: [],
      latestScore: 0,
      highScore: 0,
      bestStreak: 0,
      bestAttempt: "",
      typing: false,
      threads: size,
    };
    array.push(newUnit);
    spawn(newUnit);
  }
}
