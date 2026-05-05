import { gameState } from "./state.js";
import {
  BASE_AUTOCLICKER_COST,
  BASE_MONKEY_COST,
  MONKEY_COST_MULTIPLIER,
  AUTOCLICKER_COST_MULTIPLIER,
  monkeyTypes,
} from "./config.js";
import {
  secondsPerTick,
  ETAtoString,
  cashPerSec,
  cashFormatter,
  getTotalMonkeys,
} from "./helpers.js";

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
  const { cash, monkeys, autoClickers, monkeyPacks, monkeyFarms } = gameState;
  const passageDisplay = document.getElementById("passage-to-match");
  const etaDisplay = document.getElementById("ETA");
  const cashDisplay = document.getElementById("cash-display");
  const autoClickersDisplay = document.getElementById("autoclickers-display");
  const monkeysDisplay = document.getElementById("monkeys-display");
  const cashPerSecDisplay = document.getElementById("cash-per-second");
  const totalMonkeys = getTotalMonkeys();
  const totalMonkeyUnits =
    monkeys.length + monkeyPacks.length + monkeyFarms.length;
  const generations = document.getElementById("generations");

  passageDisplay.innerHTML = `<b>Passage:</b> ${gameState.passage}`;

  // Passage Updater Minimum
  document.getElementById("change-passage").minLength =
    gameState.passage.length;

  // ETA
  if (gameState.generations != 0) {
    etaDisplay.innerHTML = `<b>ETA: </b>${ETAtoString()}`;
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

  generations.innerHTML = `<b>Attempts: </b>${gameState.generations}`;
  
  autoClickersDisplay.innerHTML = "AutoClickers: " + autoClickers.length;
}

export function buttonUpdate() {
  const {
    cash,
    monkeyCost,
    autoClickerCost,
    autoClickerFlag,
    monkeyPackFlag,
    monkeyPackCost,
    monkeyFarmCost,
    monkeyFarmFlag,
  } = gameState;



  // --- MONKEY BUYING ---

for (const type of Object.keys(monkeyTypes)) {
  const btn = document.getElementById(`buy-${type}-button`);
  const cost = gameState[`${type}Cost`];
  const flag = type === "monkey" || gameState[`${type}Flag`];

  btn.disabled = gameState.cash < cost;

  if (
    btn.innerHTML !=
    `Buy Monkey: ${cashFormatter.format(cost)}`
  ) {
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


  [
    ...gameState.monkeys,
    ...gameState.monkeyPacks,
    ...gameState.monkeyFarms,
  ].forEach((obj) => {
    const btnSpd = document.getElementById(`speed-up-${obj.type}-${obj.id}`);
    const btnInt = document.getElementById(`int-up-${obj.type}-${obj.id}`);
    if (btnSpd) btnSpd.disabled = gameState.cash < obj.speedBoosterCost;
    if (btnInt) btnInt.disabled = gameState.cash < obj.intBoosterCost;
  });
}

export function checkWin() {
  const ETAInSeconds = Math.floor(gameState.ETA * secondsPerTick());
  const ETAInYears = ETAInSeconds / 31536000;

  const ticksInSeconds = Math.floor(gameState.ticks * secondsPerTick());
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
