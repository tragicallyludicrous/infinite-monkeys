import { gameState } from "./state.js";
import { AutoClicker } from "./clickers.js";
import { checkWin, buttonUpdate, updateStats, initializeUI } from "./hud.js";
import { flagSet } from "./unlocks.js";
import { devModeActivate } from "./devmode.js";
import { DEVELOPER_MODE, TICK_INTERVAL, monkeyTypes } from "./config.js";
import { hudNotify } from "./notifications.js";
import { passageFormatter } from "./format.js";
import { MonkeyObject } from "./monkeys.js";
import { renderPassages, updateCards, updateGameStats } from "./cards.js";
import { getInput, getButton } from "./dom.js";

initializeUI();

// ====================================
// --- Event Listeners ---
// ====================================

export function monkeyListeners(dev = "") {
  // Listeners for monkeybuttons
  for (const m of Object.keys(monkeyTypes)) {
    getButton(`${dev}buy-${m}-button`).addEventListener("click", () => {
      MonkeyObject.buy(m, dev);
    });
  }
}

monkeyListeners();

document
  .getElementById("buy-autoclicker-button")
  .addEventListener("click", () => AutoClicker.buy());

document
  .getElementById("updatePassageForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const input = getInput("change-passage");
    const newPassage = passageFormatter(input.value);
    if (newPassage.length >= gameState.passage.length) {
      gameState.passage = newPassage;
      input.value = "";
    } else {
      hudNotify("New passage must be at least as long as old one!", "maroon");
    }
  });

// ====================================
// --- MAIN LOOP ---
// ====================================

if (DEVELOPER_MODE) {
  devModeActivate();
}

const mainLoop = window.setInterval(function () {
  gameState.ticks += 1;
  updateCards();
  renderPassages();
  flagSet();
  buttonUpdate();
  updateStats();
  updateGameStats();
  AutoClicker.runClickers();
  checkWin();
}, TICK_INTERVAL);
