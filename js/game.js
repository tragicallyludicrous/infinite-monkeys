import { gameState } from "./state.js";

import {
  DEVELOPER_MODE,
  STARTING_CASH,
  BASE_MONKEY_COST,
  MONKEY_COST_MULTIPLIER,
  PASSAGE,
  ALPHABET,
  TYPE_TIME,
  PAYOUT_BASE,
  SCORE_MULTPLIER,
  BASE_AUTOCLICKER_COST,
  AUTOCLICKER_COST_MULTIPLIER,
  AUTOCLICKER_THRESHOLD,
  AUTOCLICKER_TIME,
  BASE_SPEED_COST,
  SPEED_COST_MULTIPLIER,
  SPEED_BOOST_THRESHOLD,
  NAMESPACE_LOOPS,
  TICK_INTERVAL,
  BASE_MONKEYPACK_COST,
  MONKEYPACK_THRESHOLD,
  BASE_MONKEYFARM_COST,
  MONKEYFARM_THRESHOLD,
  BASE_INT_COST,
  INT_BOOST_THRESHOLD,
  INT_COST_MULTIPLIER,
  cashFormatter,
} from "./config.js";

import {
  cashPerSec,
  ETAtoString,
  getRandomHighlightColor,
  monkeyProb,
  passageFormatter,
  payoutLog,
  randomLetter,
  randomObject,
  randomWord,
  score,
  secondsPerTick,
  ticksPerSecond,
  yearFormatter,
} from "./helpers.js";

import {
  monkeyName,
  spawn,
  updateCard,
  renderCard,
  objectType,
  renderOutput,
} from "./monkeys.js";

import { adjectives, nouns } from "./monkeynames.js";

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

// ====================================
// --- Buying Stuff ---
// ====================================

export function buyMonkey() {
  const { cash, monkeyCost, monkeys } = gameState;
  if (cash >= monkeyCost) {
    gameState.cash -= monkeyCost;
    const monkey = {
      header: "Monkey",
      type: "monkey",
      id: monkeys.length + 1,
      name: monkeyName(),
      speed: 1,
      speedBoosterCost: BASE_SPEED_COST,
      intBoosterCost: BASE_INT_COST,
      intelligence: 1,
      typewriter: "basic",
      outputs: [],
      latest_score: 0,
      high_score: 0,
      best_streak: 0,
      best_attempt: "",
      typing: false,
      threads: 1,
    };
    gameState.monkeys.push(monkey);
    spawn(monkey);
  }
}

export function buyAutoClicker() {
  const { cash, autoClickerCost, autoClickers } = gameState;
  if (cash >= autoClickerCost) {
    gameState.cash -= autoClickerCost;
    const autoClicker = {
      type: "autoClicker",
      id: autoClickers.length + 1,
      speed: 1,
      color: getRandomHighlightColor(),
      target: null,
      busy: false,
    };
    gameState.autoClickers.push(autoClicker);
    spawnAutoClicker(autoClicker);
  }
}

export function buySpeedBooster(object) {
  const cash = gameState.cash;
  if (cash >= object.speedBoosterCost) {
    gameState.cash -= object.speedBoosterCost;
    object.speed++;
    object.speedBoosterCost *= SPEED_COST_MULTIPLIER;
    updateCard(object);
  }
}

export function buyIntBooster(object) {
  const cash = gameState.cash;
  if (cash >= object.intBoosterCost) {
    gameState.cash -= object.intBoosterCost;
    object.intelligence++;
    object.intBoosterCost *= INT_COST_MULTIPLIER;
    updateCard(object);
  }
}

export function buyMonkeyThing(thing, size) {
  const cash = gameState.cash;
  const cost = gameState[thing + "Cost"];
  const array = gameState[thing + "s"];

  if (cash >= cost) {
    gameState.cash -= cost;
    const newUnit = {
      header: thing,
      type: thing,
      id: array.length + 1,
      name: `${thing} ${monkeyName()}`,
      speed: 1,
      speedBoosterCost: BASE_SPEED_COST * (size * 0.8),
      intBoosterCost: BASE_INT_COST * (size * 0.8),
      intelligence: 1,
      typewriter: "basic",
      outputs: [],
      latest_score: 0,
      high_score: 0,
      best_streak: 0,
      best_attempt: "",
      typing: false,
      threads: size,
    };
    array.push(newUnit);
    spawn(newUnit);
  }
}

// ====================================
// ---  AUTOCLICKER LOGIC ---
// ====================================

function spawnAutoClicker(autoClicker) {
  const box = document.createElement("div");
  box.className = "autoClicker";
  box.id = "autoclicker-" + autoClicker.id;
  box.style.backgroundColor = autoClicker.color;
  document.body.appendChild(box);
}

// highlight Random Button
function autoClick(autoClicker) {
  autoClicker.busy = true;
  const object = randomObject();
  if (!object) {
    autoClicker.busy = false;
    return;
  }
  const button = document.getElementById(
    "type-" + object.type + "-" + object.id,
  );
  const rect = button.getBoundingClientRect();
  const box = document.getElementById("autoclicker-" + autoClicker.id);
  box.style.top = rect.top + window.scrollY - 2 + "px";
  box.style.left = rect.left + window.scrollX - 2 + "px";
  box.style.width = rect.width + 4 + "px";
  box.style.height = rect.height + 4 + "px";
  setTimeout(() => {
    button.click();
    autoClicker.busy = false;
    const idx = gameState.autoClickerTargets.indexOf(object);
    if (idx !== -1) gameState.autoClickerTargets.splice(idx, 1);
  }, AUTOCLICKER_TIME / autoClicker.speed);
}

export function runAutoClickers() {
  for (let i = 0; i < gameState.autoClickers.length; i++) {
    const clicker = gameState.autoClickers[i];
    if (!clicker.busy) autoClick(clicker);
  }
}

// ====================================
// ---  Unlock Flags ---
// ====================================

export function flagSet() {
  const {
    monkeys,
    monkeyPacks,
    monkeyFarms,
    autoClickerFlag,
    speedBoosterFlag,
    monkeyPackFlag,
    monkeyFarmFlag,
    intBoosterFlag,
  } = gameState;
  const totalMonkeys =
    monkeys.length + monkeyPacks.length * 10 + monkeyFarms.length * 100;
  // --- AUTOCLICKERS ---
  if (monkeys.length >= AUTOCLICKER_THRESHOLD && !autoClickerFlag) {
    gameState.autoClickerFlag = true;
    HUDNotify("Autoclickers Now For Sale!", "maroon");
  }

  // --- SPEEDBOOSTERS ---
  if (monkeys.length >= SPEED_BOOST_THRESHOLD && !speedBoosterFlag) {
    gameState.speedBoosterFlag = true;
    document.querySelectorAll("[id^='speed-up-']").forEach((btn) => {
      btn.style.display = "";
    });
    HUDNotify("<s>Amphetamines</s> Speedboosters Now For Sale!", "maroon");
  }
  // --- INTBOOSTERS ---
  if (totalMonkeys >= INT_BOOST_THRESHOLD && !intBoosterFlag) {
    gameState.intBoosterFlag = true;
    document.querySelectorAll("[id^='int-up-']").forEach((btn) => {
      btn.style.display = "";
    });
    HUDNotify(
      "This is taking too long...Let's try a different tack.",
      "maroon",
    );
  }

  // -- MONKEYPACKS ---
  if (totalMonkeys >= MONKEYPACK_THRESHOLD && !monkeyPackFlag) {
    gameState.monkeyPackFlag = true;
    HUDNotify("We're buying 10-packs now.", "maroon");
  }

  // -- MONKEYFARMS ---
  if (totalMonkeys >= MONKEYFARM_THRESHOLD && !monkeyFarmFlag) {
    gameState.monkeyFarmFlag = true;
    HUDNotify("MOAR MONKEYS", "maroon");
  }
}

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
    endingDiv = document.getElementById("ending-div");
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
