import { gameState } from "./state.js";

import { buySpeedBooster, buyIntBooster } from "./buying.js";

import { randomWord, randomLetter, score, payoutLog } from "./helpers.js";
import { renderSingleOutput } from "./render.js";

import { monkeyTypes } from "./config.js";

import {
  ALPHABET,
  BASE_INT_COST,
  BASE_SPEED_COST,
  NAMESPACE_LOOPS,
  PASSAGE,
  TYPE_TIME,
  PAYOUT_BASE,
  SCORE_MULTPLIER,
  cashFormatter,
} from "./config.js";

import { adjectives, nouns } from "./monkeynames.js";

import { objectNotify } from "./notifications.js";

// ====================================
// ---  MONKEY HELPERS ---
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
        <p>High Score: ${object.highScore}</p>
        <p>Best Attempt: ${renderOutput([object.bestAttempt])}</p>
        <button id="type-${type}-${object.id}" ${typeButton}>Type!</button>
        <p id="${object.type}-${object.id}-typebox">${renderOutput(object.outputs)}</p>
    `;
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

// ====================================
// ---  CORE MONKEY OBJECT ---
// ====================================

export class MonkeyObject {
  constructor(thing) {
    const size = monkeyTypes[thing];
    const cash = gameState.cash;
    const cost = gameState[thing + "Cost"];
    const array = gameState[thing + "s"];
    let header = null;

    if (thing === "Monkey") {
      header = monkey;
    } else {
      // Turn 'monkeyPack' into 'MonkeyPack' for the user
      header = thing.charAt(0).toUpperCase() + thing.slice(1);
    }

    this.header = header;
    this.type = thing;
    this.id = array.length + 1;
    this.name = `${monkeyName()}`;
    this.speed = 1;
    this.speedBoosterCost = BASE_SPEED_COST * (size * 0.8);
    this.intBoosterCost = BASE_INT_COST * (size * 0.8);
    this.intelligence = 1;
    this.outputs = [];
    this.latestScore = null;
    this.highScore = null;
    this.bestStreak = null;
    this.bestAttempt = null;
    this.typing = false;
    this.typingProgress = 0;
    this.threads = size;
    this.spawn(array);
  }

  spawn(array) {
    array.push(this);

    const { type, id } = this;

    const wrapper = document.createElement("div");
    const card = document.createElement("div");

    wrapper.id = `${type}-wrapper-${id}`;
    wrapper.className = `${type}-wrapper`;
    card.className = `${type}-card`;
    card.id = `${type}-${id}`;
    card.innerHTML = this.renderCard();
    card.addEventListener("click", (event) => {
      if (event.target.id === `type-${type}-${this.id}`) {
        this.soliloquize();
      } else if (event.target.id === `speed-up-${type}-${this.id}`) {
        buySpeedBooster(this);
      } else if (event.target.id === `int-up-${type}-${this.id}`) {
        buyIntBooster(this);
      }
    });
    const parent = document.getElementById(`monkeydiv`);
    parent.prepend(wrapper);
    wrapper.appendChild(card);
  }

  renderCard() {
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
    } = this;

    const { intBoosterFlag, speedBoosterFlag, cash } = gameState;

    const intDisplay = intBoosterFlag ? "" : "display:none";
    const suDisplay = !speedBoosterFlag ? "display:none" : "";
    const iuDisplay = !intBoosterFlag ? "display:none" : "";
    const suButton = cash < speedBoosterCost ? "disabled" : "";
    const iuButton = cash < intBoosterCost ? "disabled" : "";
    const typeButton = typing ? "disabled" : "";

    return `
          <p><i>${header}</i></p>
          <h3>${name}</h3>
          <p>Speed: ${speed}</p>
          <button id="speed-up-${type}-${id}" style="${suDisplay}" ${suButton}>Speed Booster: ${cashFormatter.format(speedBoosterCost)}</button>
          <p style="${intDisplay}">Intelligence: ${intelligence}</p>
          <button id="int-up-${type}-${id}" style="${iuDisplay}" ${iuButton}>Intelligence Booster: ${cashFormatter.format(intBoosterCost)}</button>
          <p>High Score: ${highScore}</p>
          <p>Best Attempt: ${renderSingleOutput(bestAttempt)}</p>
          <button id="type-${type}-${id}" ${typeButton}>Type!</button>
          <p id="${type}-${id}-typebox"></p>
      `;
  }
  updateCard() {
    document.getElementById(`${this.type}-${this.id}`).innerHTML =
      this.renderCard();
  }

  typeOnePassage() {
    let passageAttempt = "";
    for (let i = 0; i < gameState.passage.length; i++) {
      if (this.intelligence > 1) {
        const rand = Math.floor(Math.random() * (ALPHABET.length - 1) + 1);
        if (this.intelligence > rand) {
          passageAttempt += gameState.passage[i];
        } 
      } else {
          passageAttempt += randomLetter();
        }
    }
    return passageAttempt;
  }

  typeAllPassages() {
    for (let i = 0; i < this.threads; i++) {
      this.outputs.push(this.typeOnePassage());
    }
  }

  score(output) {
    // if a correct letter is next to another correct letter, its worth an extra point, compounding.
    let streak = 0;
    let score = 0;

    for (let i = 0; i < output.length; i++) {
      console.log(score);
      if (output[i] == gameState.passage[i]) {
        streak++;
        score += streak;
        if (streak > this.bestStreak) {
          this.bestStreak = streak;
          objectNotify(this, `New Best Streak! ${streak}`);
        }
      } else {
        streak = 0;
      }
    }

    if (score > this.highScore) {
      this.highScore = score;
    }
    if (score > gameState.topScore) {
      gameState.topScore = score;
      gameState.topScoringMonkey = this;
    }
    return score;
  }

  payout(score) {
    const payout = PAYOUT_BASE * SCORE_MULTPLIER ** score;
    return payout;
  }

  soliloquize() {
    const {
      typing,
      typingProgress,
      type,
      id,
      speed,
    } = this;
    if (this.typing) return;

    this.typing = true;

    this.typingProgress = 0;

    // Disable 'Type!' button
    document.getElementById(`type-${type}-${id}`).disabled = true;
    this.outputs = [];

    // Pre-type the passages all at once
    this.typeAllPassages();

    const interval = setInterval(
      () => {
        this.typingProgress++;
      },
      TYPE_TIME / (speed * gameState.passage.length),
    );

    // at the end, calculate score, run notifications and update cash
    setTimeout(() => {
      clearInterval(interval);
      this.typing = false;
      const scores = this.outputs.map(o => this.score(o));
      const localHighScore = Math.max(scores);

      // debug
      console.log("scores: " + scores);

      const totalPayout = scores
        .map((s) => this.payout(s))
        .reduce((acc, payout) => acc + payout, 0);

      gameState.cash += totalPayout;

      payoutLog(totalPayout);

      objectNotify(this, `${cashFormatter.format(totalPayout)}`, "green");

      document.getElementById(`type-${type}-${id}`).disabled = false;

      if (localHighScore > this.highScore) {
        objectNotify(this, "New High Score!");
        this.updateCard(this);
        this.highScore = localHighScore;
        if (localHighScore > gameState.topScore) {
          gameState.topScore = localHighScore;
          gameState.topScoringMonkey = this;
        }
      }
    }, TYPE_TIME / speed);
  }
}
