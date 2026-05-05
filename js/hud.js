import { gameState } from "./state.js";
import {
  BASE_AUTOCLICKER_COST,
  BASE_MONKEY_COST,
  MONKEY_COST_MULTIPLIER,
  AUTOCLICKER_COST_MULTIPLIER,
  monkeyTypes,
  SECONDS_PER_TICK,
} from "./config.js";
import {
  cashPerSec,
  cashFormatter,
  getTotalMonkeys,
  getEta,
  getAllMonkeys,
} from "./economy.js";
import { getButton, getInput } from "./dom.js";
import { etaToString } from "./format.js";

// ====================================
// ---  UI Updates ---
// ====================================

export function initializeUI() {
  const monkeyShop = document.getElementById("monkey-shop");

  for (let type in monkeyTypes) {
    const header = type.charAt(0).toUpperCase() + type.slice(1);
    const div = document.createElement("div");
    const id = `buy-${type}-button`;
    div.innerHTML = `<button id="${id}" style="display:none">Buy ${header}: ${cashFormatter.format(gameState[type + "Cost"])}</button>`;
    monkeyShop.appendChild(div);
  }

  document.getElementById("buy-monkey-button").style.display = "block";
}

export function updateStats() {
  // Destructure variables for read-only use
  const {
    cash,
    monkeys,
    autoClickers,
    monkeyPacks,
    monkeyFarms,
    topScoringMonkey,
  } = gameState;
  const passageDisplay = document.getElementById("passage-to-match");
  const etaDisplay = document.getElementById("ETA");
  const cashDisplay = document.getElementById("cash-display");
  const autoClickersDisplay = document.getElementById("autoclickers-display");
  const monkeysDisplay = document.getElementById("monkeys-display");
  const cashPerSecDisplay = document.getElementById("cash-per-second");
  const bestMonkey = document.getElementById("top-scoring-monkey");
  const totalMonkeys = getTotalMonkeys();
  const totalMonkeyUnits =
    monkeys.length + monkeyPacks.length + monkeyFarms.length;
  const generations = document.getElementById("generations");

  passageDisplay.innerHTML = `<b>Passage:</b> ${gameState.passage}`;

  // Passage Updater Minimum
  getInput("change-passage").minLength = gameState.passage.length;

  // ETA
  if (gameState.generations != 0) {
    etaDisplay.innerHTML = `<b>ETA: </b>${etaToString()}`;
    cashPerSecDisplay.innerHTML = `<b>Cash/sec: </b>${cashFormatter.format(cashPerSec())}`;
  }

  // Cost of all monkey objects
  gameState.monkeyCost =
    BASE_MONKEY_COST * MONKEY_COST_MULTIPLIER ** totalMonkeyUnits;

  let prev;
  for (let m in monkeyTypes) {
    if (m === "monkey") {
      prev = m;
      continue;
    }
    gameState[m + "Cost"] = gameState[prev + "Cost"] * 8;
    prev = m;
  }

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

    btn.disabled = gameState.cash < cost;

    if (btn.innerHTML != `Buy Monkey: ${cashFormatter.format(cost)}`) {
      btn.innerHTML = `Buy Monkey: ${cashFormatter.format(cost)}`;
    }

    if (flag && btn.style.display == "none") {
      btn.style.display = "block";
    }
  }

  // --- AUTOCLICKER BUYING ---

  const buyAutoClickerButton = document.getElementById(
    "buy-autoclicker-button",
  );

  if (autoClickerFlag && buyAutoClickerButton.style.display == "none") {
    buyAutoClickerButton.style.display = "block";
  }

  buyAutoClickerButton.querySelector("button").disabled =
    cash < autoClickerCost;

  if (
    buyAutoClickerButton.querySelector("button").innerHTML !=
    `Buy AutoClicker: ${cashFormatter.format(autoClickerCost)}`
  ) {
    buyAutoClickerButton.querySelector("button").innerHTML =
      `Buy AutoClicker: ${cashFormatter.format(autoClickerCost)}`;
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
  const ETAInSeconds = Math.floor(getEta() * SECONDS_PER_TICK);
  const ETAInYears = ETAInSeconds / 31536000;

  const ticksInSeconds = Math.floor(gameState.ticks * SECONDS_PER_TICK);
  const ticksInMinutes = Math.floor(ticksInSeconds / 60);
  const ticksInHours = Math.floor(ticksInMinutes / 60);
  const ticksInDays = Math.floor(ticksInHours / 24);

  const hoursOnly = ticksInHours % 24;
  const minutesOnly = ticksInMinutes % 60;
  const secondsOnly = ticksInSeconds % 60;

  let string = "";

  if (ticksInDays > 1) {
    string = `${ticksInDays} days, ${hoursOnly} hours, ${minutesOnly} minutes`;
  } else if (ticksInDays < 1) {
    string = `${ticksInHours} hours, ${minutesOnly} minutes, ${secondsOnly} seconds`;
  } else {
    string = `...way too long.`;
  }

  if (gameState.bestPassage == gameState.passage && !gameState.winFlag) {
    gameState.winFlag = true;
    const endingDiv = document.getElementById("ending-div");
    if (ETAInYears > 1) {
      endingDiv.innerHTML = `
      <h1>You did it.</h1> 
      <p>And you didn't need to sacrifice your monkey-manity to do so.</p>
      <p>Which is literally insane. This shouldn't be possible. Go play the PowerBall.</p>
      <p>Seriously. This was supposed to take ${ETAInYears} and you did it in ${string}.
      <img src="images/goodending.png" />
      `;
    } else {
      endingDiv.innerHTML = `
      <h1>You did it. It only took ${string}</h1> 
      <p>but at what cost???</p>
      <img src="images/badending.jpg" />
      `;
    }
    endingDiv.style.display = "";
  }
}
