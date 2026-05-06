// Helpers that reformat things

import { SECONDS_PER_TICK } from "./config.js";
import { gameState } from "./state.js";

export function camelToPascal(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function passageFormatter(text) {
  return text.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
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

export function ticksToString(ticks) {
  if (gameState.generations === 0) return; // no data yet, skip ETA

  const etaFormatter = new Intl.DurationFormat("en", { style: "long" });

  const seconds = Math.floor(ticks * SECONDS_PER_TICK);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);

  if (years > 10) return `${yearFormatter(years)} years`;

  if (days < 1) {
    return etaFormatter.format({
      hours,
      minutes: minutes % 60,
      seconds: seconds % 60,
    });
  }
  if (days < 10) {
    return etaFormatter.format({
      days,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
    });
  }
  if (years < 1) {
    return etaFormatter.format({ days, hours: hours % 24 });
  }
  return etaFormatter.format({ years, days: days % 365 });
}
