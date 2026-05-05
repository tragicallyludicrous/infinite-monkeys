import { MonkeyObject } from "./monkeys.js";
import { getAllMonkeys } from "./economy.js";
import { AutoClicker } from "./clickers.js";

// ====================================
// --- DEV MODE ---
// ====================================

export function devModeActivate() {
  document.getElementById("dev-mode").style.display = "block";
  document.getElementById("dev-mode").innerHTML = `
  <h3>DEVELOPER MODE</h3>
  <button id="dev-buy-monkey">Add Monkey</button>
  <button id="dev-buy-monkeyPack">Add MonkeyPack</button>
  <button id="dev-buy-monkeyFarm">Add MonkeyFarm</button>
  <button id="dev-buy-autoClicker">Add AutoClicker</button>
  <button id="dev-speed-upgrade">Upgrade Speed (ALL)</button>
  <button id="dev-int-upgrade">Upgrade Int (ALL)</button>
  <hr>
`;

  document
    .getElementById("dev-buy-monkey")
    .addEventListener("click", () => MonkeyObject.buy("monkey", true));
  document
    .getElementById("dev-buy-monkeyPack")
    .addEventListener("click", () => MonkeyObject.buy("monkeyPack", true));
  document
    .getElementById("dev-buy-monkeyFarm")
    .addEventListener("click", () => MonkeyObject.buy("monkeyFarm", true));
  document
    .getElementById("dev-buy-autoClicker")
    .addEventListener("click", () => AutoClicker.buy(true));
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
