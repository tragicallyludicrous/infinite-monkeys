import { gameState } from "./state.js";
import { monkeyTypes, cashFormatter } from "./config.js";
import { getAllMonkeys } from "./helpers.js";

function createCard(monkey) {
  const {
    type,
    id,
    speedBoosterCost,
    intBoosterCost,
    header,
    name,
    speed,
    intelligence,
    highScore,
    bestAttempt,
    typing,
    renderOutput,
  } = monkey;

  const { intBoosterFlag, speedBoosterFlag, cash } = gameState;

  const hsDisplay = monkey.highScore ? "" : "display:none";
  const baDisplay = monkey.bestAttempt ? "" : "display:none";
  const intDisplay = intBoosterFlag ? "" : "display:none";
  const suDisplay = !speedBoosterFlag ? "display:none" : "";
  const iuDisplay = !intBoosterFlag ? "display:none" : "";
  const suButton = cash < speedBoosterCost ? "disabled" : "";
  const iuButton = cash < intBoosterCost ? "disabled" : "";
  const typeButton = typing ? "disabled" : "";

  document.getElementById(`${type}-${id}`).innerHTML = `
          <p><i>${header}</i></p>
          <h3>${name}</h3>
          <p>Speed: ${speed}</p>
          <button id="speed-up-${type}-${id}" style="${suDisplay}" ${suButton}>Speed Booster: ${cashFormatter.format(speedBoosterCost)}</button>
          <p style="${intDisplay}">Intelligence: ${intelligence}</p>
          <button id="int-up-${type}-${id}" style="${iuDisplay}" ${iuButton}>Intelligence Booster: ${cashFormatter.format(intBoosterCost)}</button>
          <p style="${hsDisplay}">High Score: ${highScore}</p>
          <p style="${baDisplay}">Best Attempt: ${renderSingleOutput(bestAttempt)}</p>
          <button id="type-${type}-${id}" ${typeButton}>Type!</button>
          <p id="${type}-${id}-typebox"></p>
      `;
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

    for (let j = 0; j <= monkey.typingProgress; j++) {
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

export function updateCards() {
  for (let m of getAllMonkeys()) {
    updateCard(m);
  }
}
