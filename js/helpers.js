import { ALPHABET, TICKS_PER_SECOND } from "./config.js";

import { monkeyTypes } from "./config.js";
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

export function monkeyProb(object) {
  const pLuck = 1 / ALPHABET.length;
  const pInt = (object.intelligence - 1) / ALPHABET.length;
  return (pInt + (1 - pInt) * pLuck) ** gameState.passage.length;
}

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

  for (let type in monkeyTypes) {
    allMonkeys.push(...gameState[type + "s"]);
  }

  return allMonkeys;
}

export function getTotalMonkeys() {
  return Object.keys(monkeyTypes).reduce(
    (acc, type) => acc + gameState[type + "s"].length * monkeyTypes[type],
    0,
  );
}

export const cashFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
