import { gameState } from "./state.js";
import { AutoClicker } from "./clickers.js";
import { checkWin, buttonUpdate, updateStats, initializeUI } from "./ui.js";
import { flagSet } from "./unlocks.js";
import { devModeActivate } from "./devmode.js";
import { DEVELOPER_MODE, TICK_INTERVAL } from "./config.js";
import { hudNotify } from "./notifications.js";
import { passageFormatter } from "./helpers.js";
import { MonkeyObject } from "./monkeys.js";
import { renderPassages, updateCards, updateGameStats } from "./render.js";

initializeUI();

// ====================================
// --- Event Listeners ---
// ====================================

document
  .getElementById("buy-monkey-button")
  .addEventListener("click", () => MonkeyObject.buy("monkey"));

document
  .getElementById("buy-autoclicker-button")
  .addEventListener("click", () => AutoClicker.buy());

document
  .getElementById("buy-monkeyPack-button")
  .addEventListener("click", () => MonkeyObject.buy("monkeyPack"));

document
  .getElementById("buy-monkeyFarm-button")
  .addEventListener("click", () => MonkeyObject.buy("monkeyFarm"));

document
  .getElementById("updatePassageForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("change-passage").value;
    const newPassage = passageFormatter(input);
    if (newPassage.length >= gameState.passage.length) {
      gameState.passage = newPassage;
      document.getElementById("change-passage").value = "";
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
export let prevState = {};

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
  prevState = {
    bestPassage: gameState.bestPassage,
  };
}, TICK_INTERVAL);
