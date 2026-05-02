import { gameState } from "./state.js";
import { monkeyTypes } from "./config.js";

export function renderSingleOutput(text) {
  let html = "";
  if (!text) return;
  for (let i = 0; i < text.length; i++) {
    let styledOutput = "";
    if (text[i] == gameState.passage[i]) {
      styledOutput += `<span class="correct">${text[i]}</span>`;
    } else if (text[i] == undefined) {
      break;
    } else {
      styledOutput += `<span>${text[i]}</span>`;
    }
    html += `<br /> ${styledOutput}`;
  }

  return html;
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
  const allMonkeys = [];

  for (let type in monkeyTypes) {
    allMonkeys.push(...gameState[type + "s"]);
  }
  for (let m of allMonkeys) {
    document.getElementById(`${m.type}-${m.id}-typebox`).innerHTML =
      renderOutputs(m);
  }
}
