import { gameState } from "./state.js";
import { cashFormatter } from "./config.js";
import {
  BASE_AUTOCLICKER_COST,
  BASE_MONKEY_COST,
  MONKEY_COST_MULTIPLIER,
  AUTOCLICKER_COST_MULTIPLIER,
} from "./config.js";
import { secondsPerTick, ETAtoString, cashPerSec } from "./helpers.js";

// ====================================
// ---  UI Updates ---
// ====================================

export function updateStats() {
  // Destructure variables for read-only use
  const { cash, monkeys, autoClickers, monkeyPacks, monkeyFarms } = gameState;
  const passageDisplay = document.getElementById("passage-to-match");
  const ETADisplay = document.getElementById("ETA");
  const cashDisplay = document.getElementById("cash-display");
  const autoClickersDisplay = document.getElementById("autoclickers-display");
  const monkeysDisplay = document.getElementById("monkeys-display");
  const cashPerSecDisplay = document.getElementById("cash-per-second");
  const totalMonkeys =
    monkeys.length + monkeyPacks.length * 10 + monkeyFarms.length * 100;
  const totalMonkeyUnits =
    monkeys.length + monkeyPacks.length + monkeyFarms.length;
  const generations = document.getElementById("generations");

  passageDisplay.innerHTML = `<b>Passage:</b> ${gameState.passage}`;

  // Passage Updater Minimum
  document.getElementById("change-passage").minLength =
    gameState.passage.length;

  // ETA
  if (gameState.generations != 0) {
    ETADisplay.innerHTML = `<b>ETA: </b>${ETAtoString()}`;
    cashPerSecDisplay.innerHTML = `<b>Cash/sec: </b>${cashFormatter.format(cashPerSec())}`;
  }

  gameState.monkeyCost =
    BASE_MONKEY_COST * MONKEY_COST_MULTIPLIER ** totalMonkeyUnits;

  gameState.autoClickerCost =
    BASE_AUTOCLICKER_COST *
    AUTOCLICKER_COST_MULTIPLIER ** gameState.autoClickers.length;

  gameState.monkeyPackCost = gameState.monkeyCost * 8;
  gameState.monkeyFarmCost = gameState.monkeyPackCost * 8;

  if (cashDisplay.innerHTML != "Cash: " + cashFormatter.format(cash)) {
    cashDisplay.innerHTML = "Cash: " + cashFormatter.format(cash);
  }

  if (monkeysDisplay.innerHTML != "Monkeys: " + totalMonkeys) {
    monkeysDisplay.innerHTML = "Monkeys: " + totalMonkeys;
  }

  if (generations.innerHTML != `<b>Attempts: </b>${gameState.generations}`) {
    generations.innerHTML = `<b>Attempts: </b>${gameState.generations}`;
  }
  if (autoClickersDisplay.innerHTML != "AutoClickers: " + autoClickers.length) {
    autoClickersDisplay.innerHTML = "AutoClickers: " + autoClickers.length;
  }
}

export function buttonUpdate() {
  // Destructure variables for read-only use
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

  const monkeyButton = document
    .getElementById("buyMonkeyButton")
    .querySelector("button");
  const buyAutoClickerButton = document.getElementById("buyAutoClickerButton");
  const buyMonkeyPackButton = document.getElementById("buyMonkeyPackButton");
  const buyMonkeyFarmButton = document.getElementById("buyMonkeyFarmButton");

  // --- MONKEY BUYING ---
  monkeyButton.disabled = cash < monkeyCost;

  if (
    monkeyButton.innerHTML != `Buy Monkey: ${cashFormatter.format(monkeyCost)}`
  ) {
    monkeyButton.innerHTML = `Buy Monkey: ${cashFormatter.format(monkeyCost)}`;
  }

  // --- AUTOCLICKER BUYING ---
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

  // --- MONKEYPACK BUYING ---
  if (monkeyPackFlag && buyMonkeyPackButton.style.display == "none") {
    buyMonkeyPackButton.style.display = "block";
  }

  buyMonkeyPackButton.querySelector("button").disabled = cash < monkeyPackCost;

  if (
    buyMonkeyPackButton.querySelector("button").innerHTML !=
    `Buy MonkeyPack: ${cashFormatter.format(monkeyPackCost)}`
  ) {
    buyMonkeyPackButton.querySelector("button").innerHTML =
      `Buy MonkeyPack: ${cashFormatter.format(monkeyPackCost)}`;
  }

  // --- MONKEYFARM BUYING ---
  if (monkeyFarmFlag && buyMonkeyFarmButton.style.display == "none") {
    buyMonkeyFarmButton.style.display = "block";
  }

  buyMonkeyFarmButton.querySelector("button").disabled = cash < monkeyFarmCost;

  if (
    buyMonkeyFarmButton.querySelector("button").innerHTML !=
    `Buy MonkeyFarm: ${cashFormatter.format(monkeyFarmCost)}`
  ) {
    buyMonkeyFarmButton.querySelector("button").innerHTML =
      `Buy MonkeyFarm: ${cashFormatter.format(monkeyFarmCost)}`;
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
