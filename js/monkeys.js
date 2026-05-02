import { gameState } from "./state.js";

import { buySpeedBooster, buyIntBooster } from "./buying.js";

import { randomWord, randomLetter, score } from "./helpers.js";
import { renderLetter } from "./render.js";

import {
  ALPHABET,
  BASE_INT_COST,
  BASE_SPEED_COST,
  NAMESPACE_LOOPS,
  PASSAGE,
  TYPE_TIME,
  cashFormatter,
} from "./config.js";

import { adjectives, nouns } from "./monkeynames.js";

import { objectNotify } from "./notifications.js";

// ====================================
// ---  MONKEY HELPERS ---
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
    const monkeyTypes = {
      monkey: 1,
      monkeyPack: 10,
      monkeyFarm: 100,
    };
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
    this.threads = size;
    this.spawn(array);
  }

  spawn(array) {
    // Debug
    console.log(this);
    array.push(this);

    const type = this.type;
    const wrapper = document.createElement("div");
    const card = document.createElement("div");

    wrapper.id = `${type}-wrapper-${this.id}`;
    wrapper.className = `${type}-wrapper`;
    card.className = `${type}-card`;
    card.id = `${type}-${this.id}`;
    card.innerHTML = this.renderCard();
    card.addEventListener("click", (event) => {
      if (event.target.id === `type-${type}-${this.id}`) {
        this.type();
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
    const type = this.type;
    const id = this.id;
    const intDisplay = gameState.intBoosterFlag ? "" : "display:none";
    const suDisplay = !gameState.speedBoosterFlag ? "display:none" : "";
    const iuDisplay = !gameState.intBoosterFlag ? "display:none" : "";
    const suButton = gameState.cash < this.speedBoosterCost ? "disabled" : "";
    const iuButton = gameState.cash < this.intBoosterCost ? "disabled" : "";
    const typeButton = this.typing ? "disabled" : "";

    return `
          <p><i>${this.header}</i></p>
          <h3>${this.name}</h3>
          <p>Speed: ${this.speed}</p>
          <button id="speed-up-${type}-${id}" style="${suDisplay}" ${suButton}>Speed Booster: ${cashFormatter.format(this.speedBoosterCost)}</button>
          <p style="${intDisplay}">Intelligence: ${this.intelligence}</p>
          <button id="int-up-${type}-${id}" style="${iuDisplay}" ${iuButton}>Intelligence Booster: ${cashFormatter.format(this.intBoosterCost)}</button>
          <p>High Score: ${this.highScore}</p>
          <p>Best Attempt: ${this.renderOutput(this.bestAttempt)}</p>
          <button id="type-${type}-${id}" ${typeButton}>Type!</button>
          <p id="${type}-${id}-typebox">${this.renderOutput(this.outputs)}</p>
      `;
  }
  updateCard() {
    document.getElementById(`${this.type}-${this.id}`).innerHTML =
      this.renderCard();
  }
  renderOutput() {
    const outputs = this.outputs;
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

  typeOnePassage() {
    let passageAttempt = "";
    for (i in gameState.passage.length) {
      if (this.intelligence > 1) {
        const rand = Math.floor(Math.random() * (ALPHABET.length - 1) + 1);
        if (this.intelligence > rand) {
          passageAttempt += gameState.passage[i];
        } else {
          passageAttempt += randomLetter();
        }
      }
    }
    return passageAttempt;
  }

  typeAllPassages() {
    for (_ in this.threads) {
      this.outputs.push(this.typeOnePassage());
    }
  }

  score(output) {
    // if a correct letter is next to another correct letter, its worth an extra point, compounding.
    let streak = 0;
    let score = 0;

    for (i in gameState.passage.length) {
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

  type() {
    if (this.typing) return;
    this.typing = true;

    // Disable 'Type!' button
    document.getElementById(`type-${this.type}-${this.id}`).disabled = true;
    this.outputs = [];

    // Pre-type the passages all at once
    this.typeAllPassages();

    // TODO: write renderLetter to display the letters one at a time
    const interval = setInterval(
      () => {
        renderLetter();
      },
      TYPE_TIME / (this.speed * gameState.passage.length),
    );

    // at the end, calculate score, run notifications and update cash
    setTimeout(() => {
      clearInterval(interval);
      this.typing = false;
      const scores = this.outputs.map(score());
      const localHighScore = Math.max(scores);

      // debug
      console.log("scores: " + scores);

      const totalPayout = scores
        .map((s) => this.payout(s))
        .reduce((acc, payout) => acc + this.payout, 0);

      gameState.cash += totalPayout;

      payoutLog(totalPayout);

      objectNotify(this, `${cashFormatter.format(totalPayout)}`, "green");

      if (localHighScore > this.highScore) {
        objectNotify(object, "New High Score!");
        updateCard(object);
        this.highScore = localHighScore;
        if (localHighScore > gameState.topScore) {
          gameState.topScore = localHighScore;
          gameState.topScoringMonkey = this;
        }
      }
    }, TYPE_TIME / this.speed);
  }
}
