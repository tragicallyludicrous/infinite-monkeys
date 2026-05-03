import { gameState } from "./state.js";

import { getRandomHighlightColor, getAllMonkeys } from "./helpers.js";

import { AUTOCLICKER_TIME } from "./config.js";

import { spawnAutoClicker } from "./render.js";

// ====================================
// ---  AUTOCLICKER LOGIC ---
// ====================================

export class AutoClicker {
  constructor() {
    const array = gameState.autoClickers;

    this.busy = false;
    this.id = array.length + 1;
    this.color = getRandomHighlightColor();
    array.push(this);
  }

  click() {
    this.busy = true;
    const object = AutoClicker.randomObject();

    if (!object) {
      this.busy = false;
      return;
    }

    const button = document.getElementById(
      object.type + "-" + object.id + "-soliloquize",
    );
    const rect = button.getBoundingClientRect();
    const box = document.getElementById("autoclicker-" + this.id);
    console.log(this.id);

    box.style.top = rect.top + window.scrollY - 2 + "px";
    box.style.left = rect.left + window.scrollX - 2 + "px";
    box.style.width = rect.width + 4 + "px";
    box.style.height = rect.height + 4 + "px";

    setTimeout(() => {
      button.click();
      this.busy = false;
      const idx = gameState.autoClickerTargets.indexOf(object);
      if (idx !== -1) gameState.autoClickerTargets.splice(idx, 1);
    }, AUTOCLICKER_TIME);
  }

  // Picker function for Autoclickers
  static randomObject() {
    // Only pick objects that aren't typing or already targeted
    const available = getAllMonkeys()
      .filter((m) => !m.typing)
      .filter((m) => !gameState.autoClickerTargets.includes(m));

    // Prioritize the object type with the most parallel monkeys
    const maxThreads = Math.max(...available.map((m) => m.threads));
    const best_available = available.filter((m) => m.threads === maxThreads);

    // Choose one of those at random
    const chosen_object =
      best_available[Math.floor(Math.random() * best_available.length)];

    gameState.autoClickerTargets.push(chosen_object);

    return chosen_object;
  }

  static buy(dev = false) {
    const { cash, autoClickerCost, autoClickers } = gameState;
    if (!dev && cash < autoClickerCost) return;
    if (!dev) gameState.cash -= autoClickerCost;
    const newClicker = new AutoClicker();
    spawnAutoClicker(newClicker);
  }

  static runClickers() {
    for (let i of gameState.autoClickers) {
      if (!i.busy) i.click();
    }
  }
}
