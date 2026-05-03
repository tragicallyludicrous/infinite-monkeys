import {
  ALPHABET,
  TICK_INTERVAL,
  PAYOUT_BASE,
  SCORE_MULTPLIER,
} from "./config.js";

import { objectNotify } from "./notifications.js";
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

// Get score of a typed passage
export function score(object, output) {
  // if a correct letter is next to another correct letter, its worth an extra point, compounding.
  let streak = 0;
  let score = 0;

  for (let i = 0; i < gameState.passage.length; i++) {
    if (output[i] == gameState.passage[i]) {
      streak++;
      score += streak;
    } else {
      streak = 0;
    }
  }

  if (streak > 1) {
    if (streak > object.bestStreak) {
      object.bestStreak = streak;
      objectNotify(object, `New Best Streak! ${streak}`);
    }
  }

  const payout = PAYOUT_BASE * SCORE_MULTPLIER ** score;

  gameState.cash += payout;

  payoutLog(payout);

  return score;
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
  const oneMinute = 300 * ticksPerSecond();
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
  const pInt = (object.intelligence - 1) / (ALPHABET.length - 1);
  const pNoInt =
    (ALPHABET.length - 1 - object.intelligence) / (ALPHABET.length - 1);
  const probability = (pInt + pNoInt * pLuck) ** gameState.passage.length;
  return probability * object.threads;
}

export function ETAtoString() {
  if (gameState.generations === 0) return; // no data yet, skip ETA

  let probability = 0;
  gameState.monkeys.forEach((object) => {
    probability += monkeyProb(object);
  });
  gameState.monkeyPacks.forEach((object) => {
    probability += monkeyProb(object);
  });
  gameState.monkeyFarms.forEach((object) => {
    probability += monkeyProb(object);
  });

  const requiredGenerations = 1 / probability;
  const genPerTick = gameState.generations / gameState.ticks;
  const requiredTicks = requiredGenerations / genPerTick;
  gameState.ETA = requiredTicks;

  const seconds = Math.floor(gameState.ETA * secondsPerTick());
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);
  const daysOnly = days % 365;
  const hoursOnly = hours % 24;
  const minutesOnly = minutes % 60;
  const secondsOnly = seconds % 60;

  let string = yearFormatter(years) + " years";

  if (years <= 10) {
    string = `${years} years, ${daysOnly} days`;
    if (years < 1) {
      string = `${daysOnly} days, ${hoursOnly} hours`;
      if (days < 10) {
        string = `${days} days, ${hoursOnly} hours, ${minutesOnly} minutes`;
        if (days < 1) {
          string = `${hours} hours, ${minutesOnly} minutes, ${secondsOnly} seconds`;
        }
      }
    }
  }
  return string;
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
