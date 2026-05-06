import { MonkeyObject } from "./monkeys.js";
import { getAllMonkeys } from "./economy.js";
import { AutoClicker } from "./clickers.js";
import { monkeyTypes } from "./config.js";
import { camelToPascal } from "./format.js";
import { getButton } from "./dom.js";
import { monkeyListeners } from "./main.js";
import { gameState } from "./state.js";

// ====================================
// --- DEV MODE ---
// ====================================

function enumerateDevTypes() {
  let html = "";
  for (const m of Object.keys(monkeyTypes)) {
    html += `<button id="dev-buy-${m}-button">Add ${camelToPascal(m)}</button>`;
  }
  return html;
}

export function devModeActivate() {
  document.getElementById("dev-mode").style.display = "block";
  document.getElementById("dev-mode").innerHTML = `
  <h3>DEVELOPER MODE</h3>
  <button id="dev-add-cash">Add $1,000,000</button>
  ${enumerateDevTypes()}
  <button id="dev-buy-autoClicker">Add AutoClicker</button>
  <button id="dev-speed-upgrade">Upgrade Speed (ALL)</button>
  <button id="dev-int-upgrade">Upgrade Int (ALL)</button>
  <hr>
`;

  document
    .getElementById("dev-add-cash")
    .addEventListener("click", () => (gameState.cash += 1000000));

  monkeyListeners("dev-");

  document
    .getElementById("dev-buy-autoClicker")
    .addEventListener("click", () => AutoClicker.buy("dev-"));
  document
    .getElementById("dev-speed-upgrade")
    .addEventListener("click", () => devAddSpeed());
  document
    .getElementById("dev-int-upgrade")
    .addEventListener("click", () => devAddInt());
}

function devAddSpeed() {
  for (let i of getAllMonkeys()) {
    i.buySpeedBooster(true);
  }
}

function devAddInt() {
  for (let i of getAllMonkeys()) {
    i.buyIntBooster(true);
  }
}
