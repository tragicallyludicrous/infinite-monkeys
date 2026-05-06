import {
  ALPHABET,
  BULK_DISCOUNT_MULTIPLIER,
  TICKS_PER_SECOND,
} from "./config.js";
import {
  monkeyTypes,
  BASE_MONKEY_COST,
  MONKEY_COST_MULTIPLIER,
} from "./config.js";
import { gameState } from "./state.js";

// ====================================
// --- Helpers ---
// ====================================

export function payoutLog(num) {
  const logEntry = { tick: gameState.ticks, payout: num };
  const oneMinute = 60 * TICKS_PER_SECOND;
  const entries = gameState.historicCash;
  entries.push(logEntry);
  gameState.historicCash = entries.filter(
    (e) => e.tick >= gameState.ticks - oneMinute,
  );
}

export function cashPerSec() {
  const timeElapsed = gameState.ticks / TICKS_PER_SECOND;

  const sum = Object.values(gameState.historicCash).reduce(
    (accumulator, currentValue) => accumulator + currentValue.payout,
    0,
  );
  const average = sum / Math.min(300, timeElapsed); //the lesser of 300 or timeElapsed;
  return average;
}

function monkeyProb(object) {
  const pLuck = 1 / ALPHABET.length;
  const pInt = (object.intelligence - 1) / ALPHABET.length;
  return (pInt + (1 - pInt) * pLuck) ** gameState.passage.length;
}

// Return the number of ticks required to win based on probability
export function getEta() {
  const probability = getAllMonkeys().reduce(
    (acc, object) => acc + monkeyProb(object),
    0,
  );

  const requiredGenerations = 1 / probability;
  const genPerTick = gameState.generations / gameState.ticks;
  return requiredGenerations / genPerTick;
}

export function getAllMonkeys() {
  const allMonkeys = [];

  for (let type of Object.keys(monkeyTypes)) {
    allMonkeys.push(...gameState.monkeys[type]);
  }

  return allMonkeys;
}

export function getTotalMonkeys() {
  return Object.keys(monkeyTypes).reduce(
    (acc, type) =>
      acc + gameState.monkeys[type].length * monkeyTypes[type].size,
    0,
  );
}

// Update the cost of all monkeyObjects
export function getCosts() {
  for (const m of Object.keys(monkeyTypes)) {
    gameState.costs[m] =
      BASE_MONKEY_COST *
      monkeyTypes[m].size *
      (BULK_DISCOUNT_MULTIPLIER ** Math.log10(monkeyTypes[m].size) *
        MONKEY_COST_MULTIPLIER ** (getAllMonkeys().length + 1));
  }
}

export const cashFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
