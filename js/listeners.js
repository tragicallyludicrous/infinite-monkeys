import { HUDNotify } from "./notifications.js";

// ====================================
// --- Event Listeners ---
// ====================================

document
  .getElementById("buyMonkeyButton")
  .addEventListener("click", () => buyMonkey());

document
  .getElementById("buyAutoClickerButton")
  .addEventListener("click", () => buyAutoClicker());

document
  .getElementById("buyMonkeyPackButton")
  .addEventListener("click", () => buyMonkeyThing("monkeyPack", 10));

document
  .getElementById("buyMonkeyFarmButton")
  .addEventListener("click", () => buyMonkeyThing("monkeyFarm", 100));

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
