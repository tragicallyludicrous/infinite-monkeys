import { gameState } from "./state.js";
import {
  BASE_AUTOCLICKER_COST,
  AUTOCLICKER_COST_MULTIPLIER,
  monkeyTypes,
  TICKS_PER_SECOND,
} from "./config.js";
import {
  cashPerSec,
  cashFormatter,
  getTotalMonkeys,
  getEta,
  getAllMonkeys,
} from "./economy.js";
import { getButton, getInput } from "./dom.js";
import { camelToPascal, ticksToString } from "./format.js";

// ====================================
// ---  UI Updates ---
// ====================================

// Dynamically build out the monkey-buying area of the UI based on monkeyTypes
export function initializeUI() {
  const monkeyShop = document.getElementById("monkey-shop");

  for (const type of Object.keys(monkeyTypes)) {
    const header = camelToPascal(type);
    const div = document.createElement("div");
    const id = `buy-${type}-button`;
    div.innerHTML = `<button id="${id}" style="display:none">Buy ${header}: ${cashFormatter.format(gameState[type + "Cost"])}</button>`;
    monkeyShop.appendChild(div);
  }

  document.getElementById("buy-monkey-button").style.display = "block";
}

export function updateStats() {
  // Destructure variables for read-only use
  const { cash, autoClickers, topScoringMonkey } = gameState;
  const passageDisplay = document.getElementById("passage-to-match");
  const etaDisplay = document.getElementById("ETA");
  const cashDisplay = document.getElementById("cash-display");
  const autoClickersDisplay = document.getElementById("autoclickers-display");
  const monkeysDisplay = document.getElementById("monkeys-display");
  const cashPerSecDisplay = document.getElementById("cash-per-second");
  const bestMonkey = document.getElementById("top-scoring-monkey");
  const totalMonkeys = getTotalMonkeys();

  const generations = document.getElementById("generations");

  passageDisplay.innerHTML = `<b>Passage:</b> ${gameState.passage}`;

  // Passage Updater Minimum
  getInput("change-passage").minLength = gameState.passage.length;

  // ETA
  if (gameState.generations != 0) {
    etaDisplay.innerHTML = `<b>ETA: </b>${ticksToString(getEta())}`;
    cashPerSecDisplay.innerHTML = `<b>Cash/sec: </b>${cashFormatter.format(cashPerSec())}`;
  }

  // Cost of all monkey objects

  // Autoclicker cost
  gameState.autoClickerCost =
    BASE_AUTOCLICKER_COST *
    AUTOCLICKER_COST_MULTIPLIER ** gameState.autoClickers.length;

  // Update simple stats
  cashDisplay.innerHTML = "Cash: " + cashFormatter.format(cash);

  monkeysDisplay.innerHTML = "Monkeys: " + totalMonkeys;

  if (topScoringMonkey) {
    bestMonkey.innerHTML =
      "<b>Top Scoring Monkey:</b> " + topScoringMonkey.name;
    bestMonkey.style.display = "";
  }

  generations.innerHTML = `<b>Attempts: </b>${gameState.generations}`;

  autoClickersDisplay.innerHTML = "AutoClickers: " + autoClickers.length;
}

export function buttonUpdate() {
  const { cash, autoClickerCost, autoClickerFlag } = gameState;

  // --- MONKEY BUYING ---
  // Creates a button, toggles its disabled status and visibility depending on cash/Flags
  // Does this for each monkeyType in config.js

  for (const type of Object.keys(monkeyTypes)) {
    const btn = getButton(`buy-${type}-button`);
    const cost = gameState[`${type}Cost`];
    const flag = type === "monkey" || gameState[`${type}Flag`];
    const header = type.charAt(0).toUpperCase() + type.slice(1);

    btn.disabled = gameState.cash < cost;

    if (btn.innerHTML != `Buy ${header}: ${cashFormatter.format(cost)}`) {
      btn.innerHTML = `Buy ${header}: ${cashFormatter.format(cost)}`;
    }

    if (flag && btn.style.display == "none") {
      btn.style.display = "block";
    }
  }

  // --- AUTOCLICKER BUYING ---

  const buyAutoClickerButton = getButton("buy-autoclicker-button");

  if (autoClickerFlag && buyAutoClickerButton.style.display == "none") {
    buyAutoClickerButton.style.display = "block";
  }

  buyAutoClickerButton.disabled = cash < autoClickerCost;

  if (
    buyAutoClickerButton.innerHTML !=
    `Buy AutoClicker: ${cashFormatter.format(autoClickerCost)}`
  ) {
    buyAutoClickerButton.innerHTML = `Buy AutoClicker: ${cashFormatter.format(autoClickerCost)}`;
  }

  // Int/Speed Button avialability

  for (const m of getAllMonkeys()) {
    const btnSpd = getButton(`speed-up-${m.type}-${m.id}`);
    const btnInt = getButton(`int-up-${m.type}-${m.id}`);
    if (btnSpd) btnSpd.disabled = gameState.cash < m.speedBoosterCost;
    if (btnInt) btnInt.disabled = gameState.cash < m.intBoosterCost;
  }
}

export function checkWin() {
  const oneYear = 31536000 * TICKS_PER_SECOND;

  if (gameState.bestPassage == gameState.passage && !gameState.winFlag) {
    gameState.winFlag = true;
    const endingDiv = document.getElementById("ending-div");
    if (getEta() > oneYear) {
      endingDiv.innerHTML = `
      <h1>You did it.</h1> 
      <p>And you didn't need to sacrifice your monkey-manity to do so.</p>
      <p>Which is literally insane. This shouldn't be possible. Go play the PowerBall.</p>
      <p>Seriously. This was supposed to take ${ticksToString(getEta())} and you did it in ${ticksToString(gameState.ticks)}.
      <img src="images/goodending.png" />
      `;
    } else {
      endingDiv.innerHTML = `
      <h1>You did it. It only took ${ticksToString(gameState.ticks)}</h1> 
      <p>but at what cost???</p>
      <img src="images/badending.jpg" />
      `;
    }
    endingDiv.style.display = "";
  }
}
