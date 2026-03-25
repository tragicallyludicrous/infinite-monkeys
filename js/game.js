// ====================================
// ---  Constants ---
// ====================================
const DEVELOPER_MODE = true;
const STARTING_CASH = 3000;
const BASE_MONKEY_COST = 2000;
const MONKEY_COST_MULTIPLIER = 1.15;
const PASSAGE = "TO BE OR NOT TO BE";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
const TYPE_TIME = 4000;
const PAYOUT_BASE = 100;
const SCORE_MULTPLIER = Math.E; // Euler's number
const BASE_AUTOCLICKER_COST = 4000;
const AUTOCLICKER_COST_MULTIPLIER = 1.35;
const AUTOCLICKER_THRESHOLD = 4;
const AUTOCLICKER_TIME = 1000;
const BASE_SPEED_COST = 1000;
const SPEED_COST_MULTIPLIER = (1 + Math.sqrt(5)) / 2; // Phi
const SPEED_BOOST_THRESHOLD = 3;
const NAMESPACE_LOOPS = 0;
const TICK_INTERVAL = 100;
const BASE_MONKEYPACK_COST = 18000;
const MONKEYPACK_THRESHOLD = 10;
const BASE_MONKEYFARM_COST = 144000;
const MONKEYFARM_THRESHOLD = 50;
const BASE_INT_COST = 10000;
const INT_BOOST_THRESHOLD = 250;
const INT_COST_MULTIPLIER = (1 + Math.sqrt(5)) / 2; // Phi

const cashFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// ====================================
// --- Initial Globals ---
// ====================================

let gameState = {
  ticks: 0,
  cash: STARTING_CASH,
  historicCash: [],
  monkeys: [],
  monkeyCost: BASE_MONKEY_COST,
  generations: 0,
  topScore: 0,
  topScoringMonkey: 0,
  bestPassage: 0,
  autoClickerFlag: false,
  autoClickers: [],
  autoClickerCost: BASE_AUTOCLICKER_COST,
  speedBoosterFlag: false,
  monkeyPackFlag: false,
  monkeyPacks: [],
  monkeyPackCost: BASE_MONKEYPACK_COST,
  intBoosterFlag: false,
  typewriterUpgradeFlag: false,
  monkeyFarms: [],
  monkeyFarmCost: BASE_MONKEYFARM_COST,
  monkeyFarmFlag: false,
  intBoosterFlag: false,

  ETA: "Never",
};

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

// ====================================
// --- Buying Stuff ---
// ====================================

function buyMonkey() {
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

function buyAutoClicker() {
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

function buySpeedBooster(object) {
  cash = gameState.cash;
  if (cash >= object.speedBoosterCost) {
    gameState.cash -= object.speedBoosterCost;
    object.speed++;
    object.speedBoosterCost *= SPEED_COST_MULTIPLIER;
    updateCard(object);
  }
}
function buyIntBooster(object) {
  cash = gameState.cash;
  if (cash >= object.intBoosterCost) {
    gameState.cash -= object.intBoosterCost;
    object.intelligence++;
    object.intBoosterCost *= INT_COST_MULTIPLIER;
    updateCard(object);
  }
}

function buyMonkeyThing(thing, size) {
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
// --- Helpers ---
// ====================================

function getRandomHighlightColor() {
  // Generate a random integer between a minimum and maximum value (inclusive)
  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate R, G, B values within a high range (e.g., 200 to 255) for lightness
  const r = randomInteger(200, 255);
  const g = randomInteger(200, 255);
  const b = randomInteger(200, 255);

  // Convert each decimal value to a two-digit hex string and combine
  const hr = r.toString(16).padStart(2, "0");
  const hg = g.toString(16).padStart(2, "0");
  const hb = b.toString(16).padStart(2, "0");

  return "#" + hr + hg + hb;
}

function randomLetter() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

function randomWord(source) {
  return source[Math.floor(Math.random() * source.length)];
}

function randomObject() {
  const all = [
    ...gameState.monkeys,
    ...gameState.monkeyPacks,
    ...gameState.monkeyFarms,
  ];
  const available = all.filter((m) => !m.typing);
  return available[Math.floor(Math.random() * available.length)];
}

// Get score of a typed passage
function score(object, output) {
  // if a correct letter is next to another correct letter, its worth an extra point, compounding.
  let streak = 0;
  let score = 0;

  for (let i = 0; i < PASSAGE.length; i++) {
    if (output[i] == PASSAGE[i]) {
      streak++;
      score += streak;
    } else {
      streak = 0;
    }
  }

  if (streak > 1) {
    if (streak > object.best_streak) {
      object.best_streak = streak;
      objectNotify(object, `New Best Streak! ${streak}`);
    }
  }

  payout = PAYOUT_BASE * SCORE_MULTPLIER ** score;

  gameState.cash += payout;

  payoutLog(payout);

  return score;
}

function secondsPerTick() {
  return TICK_INTERVAL / 1000;
}

function ticksPerSecond() {
  return 1000 / TICK_INTERVAL;
}

function payoutLog(num) {
  const logEntry = { tick: gameState.ticks, payout: num };
  const oneMinute = 60 * ticksPerSecond();
  entries = gameState.historicCash;
  entries.push(logEntry);
  gameState.historicCash = entries.filter(
    (e) => e.tick >= gameState.ticks - oneMinute,
  );
}

function cashPerSec() {
  oneMinute = 300 * ticksPerSecond();
  timeElapsed = gameState.ticks / ticksPerSecond();

  sum = Object.values(gameState.historicCash).reduce(
    (accumulator, currentValue) => accumulator + currentValue.payout,
    0,
  );
  average = sum / Math.min(300, timeElapsed); //the lesser of 300 or timeElapsed;
  return average;
}

function yearFormatter(years) {
  const postfixes = [
    "",
    " Thousand",
    " Million",
    " Billion",
    " Trillion",
    " Quadrillion",
    " Quintillion",
    " Sextillion",
    " Septillion",
    " Octillion",
    " Nonillion",
    " Decillion",
    " Undecillion",
    " Duodecillion",
    " Tredecillion",
    " Quattuordecillion",
    " Quindecillion",
    " Sexdecillion",
  ];
  let count = 0;

  while (Math.abs(years) >= 1000 && count < postfixes.length - 1) {
    years /= 1000;
    count++;
  }

  return years.toFixed(1).replace(/\.0$/, "") + postfixes[count];
}

function monkeyProb(object) {
  const pLuck = 1 / ALPHABET.length;
  const pInt = (object.intelligence - 1) / (ALPHABET.length - 1);
  const pNoInt =
    (ALPHABET.length - 1 - object.intelligence) / (ALPHABET.length - 1);
  const probability = (pInt + pNoInt * pLuck) ** PASSAGE.length;
  return probability * object.threads;
}

function ETAtoString() {
  if (gameState.generations === 0) return; // no data yet, skip ETA

  let probability = 0;
  gameState.monkeys.forEach((object) => {
    probability += monkeyProb(object);
  });
  gameState.monkeyPacks.forEach((object) => {
    probability += monkeyProb(object);
  });
  gameState.monkeyFarms.forEach((object) => {
    probability += monkeyProb(object);
  });

  const requiredGenerations = 1 / probability;
  const genPerTick = gameState.generations / gameState.ticks;
  const requiredTicks = requiredGenerations / genPerTick;
  gameState.ETA = requiredTicks;

  const seconds = Math.floor(gameState.ETA * secondsPerTick());
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);
  const daysOnly = days % 365;
  const hoursOnly = hours % 24;
  const minutesOnly = minutes % 60;
  const secondsOnly = seconds % 60;

  let string = yearFormatter(years) + " years";

  if (years <= 10) {
    string = `${years} years, ${daysOnly} days`;
    if (years < 1) {
      string = `${daysOnly} days, ${hoursOnly} hours`;
      if (days < 10) {
        string = `${days} days, ${hoursOnly} hours, ${minutesOnly} minutes`;
        if (days < 1) {
          string = `${hours} hours, ${minutesOnly} minutes, ${secondsOnly} seconds`;
        }
      }
    }
  }
  return string;
}

// ====================================
// ---  MONKEY LOGIC ---
// ====================================

function monkeyName() {
  const monkeyNames = gameState.monkeys.map((i) => i.name);
  let name;
  let namespace = adjectives.length * nouns.length;
  let tries = 0;

  do {
    name = randomWord(adjectives) + " " + randomWord(nouns);

    if (NAMESPACE_LOOPS > 0) {
      name += ` #${NAMESPACE_LOOPS + 1}`;
    }
    if (tries == namespace) {
      NAMESPACE_LOOPS++;
      tries = 0;
    }
    tries++;
  } while (monkeyNames.includes(name));
  return name;
}

function spawn(object) {
  const type = object.type;
  const wrapper = document.createElement("div");
  const card = document.createElement("div");
  wrapper.id = `${type}-wrapper-${object.id}`;
  wrapper.className = `${type}-wrapper`;
  card.className = `${type}-card`;
  card.id = `${type}-${object.id}`;
  card.innerHTML = renderCard(object);
  card.addEventListener("click", (event) => {
    if (event.target.id === `type-${type}-${object.id}`) {
      objectType(object);
    } else if (event.target.id === `speed-up-${object.type}-${object.id}`) {
      buySpeedBooster(object);
    } else if (event.target.id === `int-up-${object.type}-${object.id}`) {
      buyIntBooster(object);
    }
  });
  const parent = document.getElementById(`monkeydiv`);
  parent.prepend(wrapper);
  wrapper.appendChild(card);
}

function updateCard(object) {
  document.getElementById(`${object.type}-${object.id}`).innerHTML =
    renderCard(object);
}

function renderCard(object) {
  const type = object.type;
  const intDisplay = gameState.intBoosterFlag ? "" : "display:none";
  const twDisplay = gameState.typewriterUpgradeFlag ? "" : "display:none";
  const suDisplay = !gameState.speedBoosterFlag ? "display:none" : "";
  const iuDisplay = !gameState.intBoosterFlag ? "display:none" : "";
  const suButton = gameState.cash < object.speedBoosterCost ? "disabled" : "";
  const iuButton = gameState.cash < object.intBoosterCost ? "disabled" : "";
  const typeButton = object.typing ? "disabled" : "";

  return `
        <p><i>${object.header}</i></p>
        <h3>${object.name}</h3>
        <p>Speed: ${object.speed}</p>
        <button id="speed-up-${object.type}-${object.id}" style="${suDisplay}" ${suButton}>Speed Booster: ${cashFormatter.format(object.speedBoosterCost)}</button>
        <p style="${intDisplay}">Intelligence: ${object.intelligence}</p>
        <button id="int-up-${object.type}-${object.id}" style="${iuDisplay}" ${iuButton}>Intelligence Booster: ${cashFormatter.format(object.intBoosterCost)}</button>
        <p style="${twDisplay}">Typewriter: ${object.typewriter}</p>
        <p>High Score: ${object.high_score}</p>
        <p>Best Attempt: ${renderOutput([object.best_attempt])}</p>
        <button id="type-${type}-${object.id}" ${typeButton}>Type!</button>
        <p id="${object.type}-${object.id}-typebox">${renderOutput(object.outputs)}</p>
    `;
}
function objectType(object) {
  if (object.typing) return;
  object.typing = true;
  document.getElementById(`type-${object.type}-${object.id}`).disabled = true;
  object.outputs = [];
  const threads = object.threads;
  let completed = 0;
  let payoutSum = 0;
  let oldHighScore = object.high_score;

  for (let i = 0; i < threads; i++) {
    let typed = 0;
    object.outputs[i] = "";
    const interval = setInterval(
      () => {
        rand = Math.floor(Math.random() * (ALPHABET.length - 1)) + 1;
        if (object.intelligence > 1 && rand < object.intelligence) {
          object.outputs[i] += PASSAGE[typed];
        } else {
          object.outputs[i] += randomLetter();
        }
        document.getElementById(
          `${object.type}-${object.id}-typebox`,
        ).innerHTML = renderOutput(object.outputs);

        typed++;
        if (typed >= PASSAGE.length) {
          clearInterval(interval);
          // score this attempt
          gameState.generations++;
          object.latest_score = score(object, object.outputs[i]);
          payoutSum +=
            gameState.historicCash[gameState.historicCash.length - 1].payout;

          if (object.latest_score > object.high_score) {
            object.high_score = object.latest_score;
            object.best_attempt = object.outputs[i];

            if (object.high_score > gameState.topScore) {
              gameState.topScore = object.high_score;
              tsm = document.getElementById("top-scoring-monkey");
              tsm.innerHTML = `Top Scoring Monkey: ${object.name}`;
              tsm.style.display = "block";

              gameState.bestPassage = [object.outputs[i]];

              bp = document.getElementById("best-passage");
              bp.innerHTML = `<b>Best Passage:</b> ${renderOutput(gameState.bestPassage)}`;
              bp.style.display = "block";
            }
          }

          completed++;
          if (completed >= threads) {
            object.typing = false;
            objectNotify(object, `${cashFormatter.format(payoutSum)}`, "green");
            if (object.high_score > oldHighScore)
              objectNotify(object, "New High Score!");
            updateCard(object);
          }
        }
      },
      TYPE_TIME / (object.speed * PASSAGE.length),
    );
  }
}

function renderOutput(outputs) {
  let html = "";
  for (let i = 0; i < outputs.length; i++) {
    let styledOutput = "";
    for (let j = 0; j < PASSAGE.length; j++) {
      if (outputs[i][j] == PASSAGE[j]) {
        styledOutput += `<span class="correct">${outputs[i][j]}</span>`;
      } else if (outputs[i][j] == undefined) {
        break;
      } else {
        styledOutput += `<span>${outputs[i][j]}</span>`;
      }
    }
    html += `<br /> ${styledOutput}`;
  }

  return html;
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
  box.style.top = rect.top + window.scrollY + "px";
  box.style.left = rect.left + window.scrollX + "px";
  box.style.width = rect.width + 5px;
  box.style.height = rect.height + 5px;
  setTimeout(() => {
    button.click();
    autoClicker.busy = false;
  }, AUTOCLICKER_TIME / autoClicker.speed);
}

function runAutoClickers() {
  for (let i = 0; i < gameState.autoClickers.length; i++) {
    const clicker = gameState.autoClickers[i];
    if (!clicker.busy) autoClick(clicker);
  }
}

// ====================================
// ---  Unlock Flags ---
// ====================================

function flagSet() {
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

function updateStats() {
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

  passageDisplay.innerHTML = `<b>Passage:</b> ${PASSAGE}`;

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

function buttonUpdate() {
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

function checkWin() {
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

  if (gameState.bestPassage == PASSAGE) {
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
// ====================================
// --- POPUP NOTIFICATIONS ---
// ====================================

function objectNotify(object, message, color = "cornflowerblue") {
  const toast = document.createElement("span");
  const parent = document.getElementById(`${object.type}-wrapper-${object.id}`);
  const existingToasts = parent.querySelectorAll(".toast").length;
  const offset = existingToasts * 50;
  toast.style.top = `calc(25% + ${offset}px)`;
  parent.appendChild(toast);
  toast.innerHTML = message;
  toast.style.backgroundColor = color;
  toast.classList.add("toast");
  setTimeout(() => {
    toast.classList.add("visible");
  }, 10);
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => {
      parent.removeChild(toast);
    }, 500);
  }, 2000);
}

function HUDNotify(message, color = "cornflowerblue") {
  const toast = document.createElement("span");
  const parent = document.getElementById("hud");
  const existingToasts = parent.querySelectorAll(".toast").length;
  const offset = existingToasts * 50;
  toast.style.top = `calc(50% + ${offset}px)`;
  parent.appendChild(toast);
  toast.innerHTML = message;
  toast.style.backgroundColor = color;
  toast.classList.add("toast");
  setTimeout(() => {
    toast.classList.add("visible");
  }, 10);
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => {
      parent.removeChild(toast);
    }, 500);
  }, 5000);
}

// ====================================
// --- DEV MODE ---
// ====================================
function devModeActivate() {
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

function buySpeedBooster(monkey) {
  cash = gameState.cash;
  if (cash >= monkey.speedBoosterCost) {
    gameState.cash -= monkey.speedBoosterCost;
    monkey.speed++;
    console.log(monkey.speed);
    monkey.speedBoosterCost *= SPEED_COST_MULTIPLIER;
    updateCard(monkey);
  }
}
// ====================================
// --- MAIN LOOP ---
// ====================================
if (DEVELOPER_MODE) {
  devModeActivate();

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

mainLoop = window.setInterval(function () {
  gameState.ticks += 1;
  flagSet();
  buttonUpdate();
  updateStats();
  runAutoClickers();
  checkWin();
}, TICK_INTERVAL);
