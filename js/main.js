import { gameState } from "./state.js";
import { runAutoClickers } from "./clickers.js";
import { checkWin, buttonUpdate, updateStats } from "./ui.js";
import { flagSet } from "./unlocks.js";
import { devModeActivate } from "./devmode.js";
import { DEVELOPER_MODE, TICK_INTERVAL } from "./config.js";
import { HUDNotify } from "./notifications.js";
import { passageFormatter } from "./helpers.js";
import { buyAutoClicker } from "./buying.js";
import { MonkeyObject } from "./monkeys.js";
import { renderPassages, renderCards } from "./render.js";

// ====================================
// --- Event Listeners ---
// ====================================

document
  .getElementById("buyMonkeyButton")
  .addEventListener("click", () => MonkeyObject.buy("monkey", 1));

document
  .getElementById("buyAutoClickerButton")
  .addEventListener("click", () => buyAutoClicker());

document
  .getElementById("buyMonkeyPackButton")
  .addEventListener("click", () => MonkeyObject.buy("monkeyPack", 10));

document
  .getElementById("buyMonkeyFarmButton")
  .addEventListener("click", () => MonkeyObject.buy("monkeyFarm", 100));

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
      HUDNotify("New passage must be at least as long as old one!", "maroon");
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
  runAutoClickers();
  checkWin();
}, TICK_INTERVAL);
