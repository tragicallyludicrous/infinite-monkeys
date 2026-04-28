import { gameState } from "./state.js";

import { runAutoClickers } from "./clickers.js";
import { checkWin, buttonUpdate, updateStats } from "./ui.js";
import { flagSet } from "./unlocks.js";
import { devModeActivate } from "./devmode.js";
import { DEVELOPER_MODE, TICK_INTERVAL } from "./config.js";

// ====================================
// --- MAIN LOOP ---
// ====================================

if (DEVELOPER_MODE) {
  devModeActivate();
}

const mainLoop = window.setInterval(function () {
  gameState.ticks += 1;
  flagSet();
  buttonUpdate();
  updateStats();
  runAutoClickers();
  checkWin();
}, TICK_INTERVAL);
