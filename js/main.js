import { gameState } from "./state.js";
import { AutoClicker } from "./clickers.js";
import { checkWin, buttonUpdate, updateStats } from "./ui.js";
import { flagSet } from "./unlocks.js";
import { devModeActivate } from "./devmode.js";
import { DEVELOPER_MODE, TICK_INTERVAL } from "./config.js";
import { hudNotify } from "./notifications.js";
import { passageFormatter } from "./helpers.js";
import { MonkeyObject } from "./monkeys.js";
import { renderPassages, updateCards } from "./render.js";

// ====================================
// --- Event Listeners ---
// ====================================

document
  .getElementById("buyMonkeyButton")
  .addEventListener("click", () => MonkeyObject.buy("monkey"));

document
  .getElementById("buyAutoClickerButton")
  .addEventListener("click", () => AutoClicker.buy());

document
  .getElementById("buyMonkeyPackButton")
  .addEventListener("click", () => MonkeyObject.buy("monkeyPack"));

document
  .getElementById("buyMonkeyFarmButton")
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

const mainLoop = window.setInterval(function () {
  gameState.ticks += 1;
  updateCards();
  renderPassages();
  flagSet();
  buttonUpdate();
  updateStats();
  AutoClicker.runClickers();
  checkWin();
}, TICK_INTERVAL);
