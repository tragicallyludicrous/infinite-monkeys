import { gameState } from "./state.js";

import { buyMonkey, buyMonkeyThing, buyAutoClicker } from "./buying.js";

import { updateCard } from "./monkeys.js";

import { DEVELOPER_MODE } from "./config.js";

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
    .addEventListener("click", () => devAddMonkey());
  document
    .getElementById("dev-buy-monkeyPack")
    .addEventListener("click", () => devAddMonkeyPack());
  document
    .getElementById("dev-buy-monkeyFarm")
    .addEventListener("click", () => devAddMonkeyFarm());
  document
    .getElementById("dev-buy-autoClicker")
    .addEventListener("click", () => devAddAutoClicker());
  document
    .getElementById("dev-speed-upgrade")
    .addEventListener("click", () => devAddSpeed());
  document
    .getElementById("dev-int-upgrade")
    .addEventListener("click", () => devAddInt());
}

function devAddMonkey() {
  gameState.cash += gameState.monkeyCost;
  buyMonkey();
}

function devAddMonkeyPack() {
  gameState.cash += gameState.monkeyPackCost;
  buyMonkeyThing("monkeyPack", 10);
}

function devAddMonkeyFarm() {
  gameState.cash += gameState.monkeyFarmCost;
  buyMonkeyThing("monkeyFarm", 100);
}

function devAddAutoClicker() {
  gameState.cash += gameState.autoClickerCost;
  buyAutoClicker();
}

function devAddSpeed() {
  for (let i = 0; i < gameState.monkeys.length; i++) {
    gameState.monkeys[i].speed++;
    updateCard(gameState.monkeys[i]);
  }
  for (let i = 0; i < gameState.monkeyPacks.length; i++) {
    gameState.monkeyPacks[i].speed++;
    updateCard(gameState.monkeyPacks[i]);
  }
  for (let i = 0; i < gameState.monkeyFarms.length; i++) {
    gameState.monkeyFarms[i].speed++;
    updateCard(gameState.monkeyFarms[i]);
  }
}

function devAddInt() {
  for (let i = 0; i < gameState.monkeys.length; i++) {
    gameState.monkeys[i].intelligence++;
    updateCard(gameState.monkeys[i]);
  }
  for (let i = 0; i < gameState.monkeyPacks.length; i++) {
    gameState.monkeyPacks[i].intelligence++;
    updateCard(gameState.monkeyPacks[i]);
  }
  for (let i = 0; i < gameState.monkeyFarms.length; i++) {
    gameState.monkeyFarms[i].intelligence++;
    updateCard(gameState.monkeyFarms[i]);
  }
}
