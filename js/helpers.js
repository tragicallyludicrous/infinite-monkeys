import {
  ALPHABET,
  TICK_INTERVAL,
  PAYOUT_BASE,
  SCORE_MULTPLIER,
} from "./config.js";

import { monkeyTypes } from "./config.js";
import { gameState } from "./state.js";

// ====================================
// --- Helpers ---
// ====================================

export function getRandomHighlightColor() {
  // Generate a random integer between a minimum and maximum value (inclusive)
  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate R, G, B values within a high range (e.g., 200 to 255) for lightness
  const r = randomInteger(200, 255);
  const g = randomInteger(200, 255);
  const b = randomInteger(200, 255);

  // Convert each decimal value to a two-digit hex string and combine
  const hr = r.toString(16).padStart(2, "0");
  const hg = g.toString(16).padStart(2, "0");
  const hb = b.toString(16).padStart(2, "0");

  return "#" + hr + hg + hb;
}

export function randomLetter() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

export function randomWord(source) {
  return source[Math.floor(Math.random() * source.length)];
}

export function passageFormatter(text) {
  return text.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
}

export function secondsPerTick() {
  return TICK_INTERVAL / 1000;
}

export function ticksPerSecond() {
  return 1000 / TICK_INTERVAL;
}

export function payoutLog(num) {
  const logEntry = { tick: gameState.ticks, payout: num };
  const oneMinute = 60 * ticksPerSecond();
  const entries = gameState.historicCash;
  entries.push(logEntry);
  gameState.historicCash = entries.filter(
    (e) => e.tick >= gameState.ticks - oneMinute,
  );
}

export function cashPerSec() {
  const timeElapsed = gameState.ticks / ticksPerSecond();

  const sum = Object.values(gameState.historicCash).reduce(
    (accumulator, currentValue) => accumulator + currentValue.payout,
    0,
  );
  const average = sum / Math.min(300, timeElapsed); //the lesser of 300 or timeElapsed;
  return average;
}

export function yearFormatter(years) {
  const postfixes = [
    "",
    " Thousand",
    " Million",
    " Billion",
    " Trillion",
    " Quadrillion",
    " Quintillion",
    " Sextillion",
    " Septillion",
    " Octillion",
    " Nonillion",
    " Decillion",
    " Undecillion",
    " Duodecillion",
    " Tredecillion",
    " Quattuordecillion",
    " Quindecillion",
    " Sexdecillion",
  ];
  let count = 0;

  while (Math.abs(years) >= 1000 && count < postfixes.length - 1) {
    years /= 1000;
    count++;
  }

  return years.toFixed(1).replace(/\.0$/, "") + postfixes[count];
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

export function etaToString() {
  if (gameState.generations === 0) return; // no data yet, skip ETA

  const etaFormatter = new Intl.DurationFormat("en", { style: "long" });
  
  const seconds = Math.floor(getEta() * secondsPerTick());
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);

  if (years > 10) return `${yearFormatter(years)} years`;
  
  if (days < 1) {
    return etaFormatter.format({ hours, minutes: minutes % 60, seconds: seconds % 60 });
  }
  if (days < 10) {
    return etaFormatter.format({ days, hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60 });
  }
  if (years < 1) {
    return etaFormatter.format({ days, hours: hours % 24 });
  }
  return etaFormatter.format({ years, days: days % 365 });
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
