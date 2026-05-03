import { gameState } from "./state.js";
import { monkeyTypes, BASE_SPEED_COST, BASE_INT_COST } from "./config.js";
import { getAllMonkeys, cashFormatter } from "./helpers.js";

export function createCard(monkey) {
  const { type, id } = monkey;
  const prefix = `${type}-${id}`;

  const wrapper = document.createElement("div");
  const card = document.createElement("div");

  wrapper.id = `${prefix}-wrapper`;
  wrapper.className = `${type}-wrapper`;

  card.className = `${type}-card`;
  card.id = prefix;

  card.addEventListener("click", (event) => {
    if (event.target.id === `${prefix}-soliloquize`) {
      monkey.soliloquize();
    } else if (event.target.closest(`#${prefix}-speed-up-button`)) {
      monkey.buySpeedBooster();
      updateCardStats(monkey);
    } else if (event.target.closest(`#${prefix}-int-up-button`)) {
      monkey.buyIntBooster();
      updateCardStats(monkey);
    }
  });

  const parent = document.getElementById(`monkeydiv`);
  parent.prepend(wrapper);
  wrapper.appendChild(card);

  document.getElementById(`${prefix}`).innerHTML = `
          <p><i>${monkey.header}</i></p>
          <h3>${monkey.name}</h3>
          
          <div id="${prefix}-speed-display" style="display:none"><p>Speed: <span id="${prefix}-speed-level">1</span></p>
          <button id="${prefix}-speed-up-button">Speed Booster: <span id="${prefix}-speed-up-cost">${cashFormatter.format(BASE_SPEED_COST)}</span></button></div>
          
          <div id="${prefix}-int-display" style="display:none"><p>Intelligence: <span id="${prefix}-int-level">1</span></p>
          <button id="${prefix}-int-up-button">Intelligence Booster: <span id="${prefix}-int-up-cost">${cashFormatter.format(BASE_INT_COST)}</span></button></div>
          
          <div id="${prefix}-hs-display" style="display:none"><p>High Score: <span id="${prefix}-hs">0</span></p></div>
          
          <div id="${prefix}-ba-display" style="display:none">Best Attempt:<p> <span id="${prefix}-ba">N/A</span></p></div>
          
          <p><button id="${prefix}-soliloquize">Soliloquize!</button></p>
          
          <p id="${prefix}-typebox"></p>`;

  monkey.elements = {
    // Speed
    speedDisplay: document.getElementById(prefix + "-speed-display"),
    speedLevel: document.getElementById(prefix + "-speed-level"),
    speedUpButton: document.getElementById(prefix + "-speed-up-button"),
    speedUpCost: document.getElementById(prefix + "-speed-up-cost"),

    // Intelligence
    intDisplay: document.getElementById(prefix + "-int-display"),
    intLevel: document.getElementById(prefix + "-int-level"),
    intUpButton: document.getElementById(prefix + "-int-up-button"),
    intUpCost: document.getElementById(prefix + "-int-up-cost"),

    // High Score
    hsDisplay: document.getElementById(prefix + "-hs-display"),
    hs: document.getElementById(prefix + "-hs"),

    // Best Attempt
    baDisplay: document.getElementById(prefix + "-ba-display"),
    ba: document.getElementById(prefix + "-ba"),

    // Soliloquize Button
    soliloquize: document.getElementById(prefix + "-soliloquize"),
  };
  updateCardFlags();
}

export function renderSingleOutput(text) {
  let html = "";
  if (!text) return;
  let styledOutput = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] == gameState.passage[i]) {
      styledOutput += `<span class="correct">${text[i]}</span>`;
    } else if (text[i] == undefined) {
      break;
    } else {
      styledOutput += `<span>${text[i]}</span>`;
    }
  }

  return styledOutput;
}

export function renderOutputs(monkey) {
  let outputs = monkey.outputs;
  if (!outputs) return "";
  let html = "";
  for (let i in outputs) {
    let styledOutput = "";

    for (let j = 0; j < monkey.typingProgress; j++) {
      if (outputs[i][j] == gameState.passage[j]) {
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

export function renderPassages() {
  for (let m of getAllMonkeys()) {
    document.getElementById(`${m.type}-${m.id}-typebox`).innerHTML =
      renderOutputs(m);
  }
}

export function spawnAutoClicker(autoClicker) {
  const box = document.createElement("div");
  box.className = "autoClicker";
  console.log(autoClicker);
  box.id = "autoclicker-" + autoClicker.id;
  box.style.backgroundColor = autoClicker.color;
  document.body.appendChild(box);
}

function updateCardTick(m) {
  // Elements that need to be checked/change every tick
  const el = m.elements;

  // Button availability
  el.speedUpButton.disabled = gameState.cash < m.speedBoosterCost;
  el.intUpButton.disabled = gameState.cash < m.intBoosterCost;
  el.soliloquize.disabled = m.typing;
}

export function updateCardScores(m) {
  const el = m.elements;

  // High Score
  el.hsDisplay.style.display = m.highScore ? "" : "none";
  el.hs.innerText = m.highScore;

  // Best Attempt
  el.baDisplay.style.display = m.highScore ? "" : "none";
  el.ba.innerHTML = renderSingleOutput(m.bestAttempt);
}

export function updateCardStats(m) {
  // Elements that only change when something is clicked
  const el = m.elements;

  // Speed
  el.speedLevel.innerText = m.speed;
  el.speedUpCost.innerText = cashFormatter.format(m.speedBoosterCost);

  // Intelligence
  el.intLevel.innerText = m.intelligence;
  el.intUpCost.innerText = cashFormatter.format(m.intBoosterCost);
}

export function updateCardFlags() {
  // Elements that change upon flag changes

  for (let m of getAllMonkeys()) {
    const el = m.elements;
    el.speedDisplay.style.display = gameState.speedBoosterFlag ? "" : "none";
    el.intDisplay.style.display = gameState.intBoosterFlag ? "" : "none";
  }
}

export function updateCards() {
  for (let m of getAllMonkeys()) {
    updateCardTick(m);
  }
}
