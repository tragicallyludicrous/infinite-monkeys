import { gameState } from "./state.js";

import { buyMonkey, buyMonkeyThing, buyAutoClicker } from "./buying.js";

import { updateCard, MonkeyObject } from "./monkeys.js";

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
    .addEventListener("click", () => devAddMonkeyObject("monkey"));
  document
    .getElementById("dev-buy-monkeyPack")
    .addEventListener("click", () => devAddMonkeyObject("monkeyPack"));
  document
    .getElementById("dev-buy-monkeyFarm")
    .addEventListener("click", () => devAddMonkeyObject("monkeyFarm"));
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
function devAddMonkeyObject(object) {

  gameState.cash += gameState[object + "Cost"];
  new MonkeyObject(object);
}

function devAddAutoClicker() {
  gameState.cash += gameState.autoClickerCost;
  buyAutoClicker();
}

function devAddSpeed() {
  for (let i = 0; i < gameState.monkeys.length; i++) {
    gameState.monkeys[i].speed++;
    gameState.monkeys[i].updateCard();
  }
  for (let i = 0; i < gameState.monkeyPacks.length; i++) {
    gameState.monkeyPacks[i].speed++;
    gameState.monkeyPacks[i].updateCard();
  }
  for (let i = 0; i < gameState.monkeyFarms.length; i++) {
    gameState.monkeyFarms[i].speed++;
    updateCard(gameState.monkeyFarms[i]);
  }
}

function devAddInt() {
  for (let i = 0; i < gameState.monkeys.length; i++) {
    gameState.monkeys[i].intelligence++;
    gameState.monkeys[i].updateCard();
  }
  for (let i = 0; i < gameState.monkeyPacks.length; i++) {
    gameState.monkeyPacks[i].intelligence++;
    gameState.monkeyPacks[i].updateCard();
  }
  for (let i = 0; i < gameState.monkeyFarms.length; i++) {
    gameState.monkeyFarms[i].intelligence++;
    gameState.monkeyFarms[i].updateCard();
  }
}
