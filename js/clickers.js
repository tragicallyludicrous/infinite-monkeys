import { randomObject } from "./helpers.js";

import { gameState } from "./state.js";

import { AUTOCLICKER_TIME } from "./config.js";

// ====================================
// ---  AUTOCLICKER LOGIC ---
// ====================================

export function spawnAutoClicker(autoClicker) {
  const box = document.createElement("div");
  box.className = "autoClicker";
  box.id = "autoclicker-" + autoClicker.id;
  box.style.backgroundColor = autoClicker.color;
  document.body.appendChild(box);
}

// highlight Random Button
export function autoClick(autoClicker) {
  autoClicker.busy = true;
  const object = randomObject();
  if (!object) {
    autoClicker.busy = false;
    return;
  }
  const button = document.getElementById(
    "type-" + object.type + "-" + object.id,
  );
  const rect = button.getBoundingClientRect();
  const box = document.getElementById("autoclicker-" + autoClicker.id);
  box.style.top = rect.top + window.scrollY - 2 + "px";
  box.style.left = rect.left + window.scrollX - 2 + "px";
  box.style.width = rect.width + 4 + "px";
  box.style.height = rect.height + 4 + "px";
  setTimeout(() => {
    button.click();
    autoClicker.busy = false;
    const idx = gameState.autoClickerTargets.indexOf(object);
    if (idx !== -1) gameState.autoClickerTargets.splice(idx, 1);
  }, AUTOCLICKER_TIME / autoClicker.speed);
}

export function runAutoClickers() {
  for (let i = 0; i < gameState.autoClickers.length; i++) {
    const clicker = gameState.autoClickers[i];
    if (!clicker.busy) autoClick(clicker);
  }
}
