import { gameState } from "./state.js";

import { buySpeedBooster, buyIntBooster } from "./buying.js";

import { randomWord, randomLetter, score } from "./helpers.js";

import {
  ALPHABET,
  NAMESPACE_LOOPS,
  TYPE_TIME,
  cashFormatter,
} from "./config.js";

import { adjectives, nouns } from "./monkeynames.js";

import { objectNotify } from "./notifications.js";

// ====================================
// ---  MONKEY LOGIC ---
// ====================================

export function monkeyName() {
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

export function spawn(object) {
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

export function updateCard(object) {
  document.getElementById(`${object.type}-${object.id}`).innerHTML =
    renderCard(object);
}

export function renderCard(object) {
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

export function objectType(object) {
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
        let rand = Math.floor(Math.random() * (ALPHABET.length - 1)) + 1;
        if (object.intelligence > 1 && rand < object.intelligence) {
          object.outputs[i] += gameState.passage[typed];
        } else {
          object.outputs[i] += randomLetter();
        }
        document.getElementById(
          `${object.type}-${object.id}-typebox`,
        ).innerHTML = renderOutput(object.outputs);

        typed++;
        if (typed >= gameState.passage.length) {
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
              const tsm = document.getElementById("top-scoring-monkey");
              tsm.innerHTML = `Top Scoring Monkey: ${object.name}`;
              tsm.style.display = "block";

              gameState.bestPassage = [object.outputs[i]];

              const bp = document.getElementById("best-passage");
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
      TYPE_TIME / (object.speed * gameState.passage.length),
    );
  }
}

export function renderOutput(outputs) {
  let html = "";
  for (let i = 0; i < outputs.length; i++) {
    let styledOutput = "";
    for (let j = 0; j < gameState.passage.length; j++) {
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
