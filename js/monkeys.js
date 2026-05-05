import { gameState } from "./state.js";

import {
  randomWord,
  randomLetter,
  payoutLog,
  cashFormatter,
} from "./helpers.js";

import {
  renderSingleOutput,
  createCard,
  updateCardScores,
  updateCardStats,
} from "./render.js";

import {
  INT_COST_MULTIPLIER,
  monkeyTypes,
  SPEED_COST_MULTIPLIER,
} from "./config.js";

import {
  ALPHABET,
  BASE_INT_COST,
  BASE_SPEED_COST,
  NAMESPACE_LOOPS,
  PASSAGE,
  TYPE_TIME,
  PAYOUT_BASE,
  SCORE_MULTPLIER,
} from "./config.js";

import { adjectives, nouns } from "./monkeynames.js";

import { objectNotify } from "./notifications.js";

// ====================================
// ---  CORE MONKEY OBJECT ---
// ====================================

export class MonkeyObject {
  constructor(thing) {
    const size = monkeyTypes[thing];
    const array = gameState[thing + "s"];
    
    this.header = thing.charAt(0).toUpperCase() + thing.slice(1);
    this.type = thing;
    this.id = array.length + 1;
    this.name = ( randomWord(adjectives) + " " + randomWord(nouns) );
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
    array.push(this);
  }



  static buy(thing, dev = false) {
      if (!dev && gameState.cash < gameState[thing + "Cost"]) return;
      if (!dev) gameState.cash -= gameState[thing + "Cost"];
        const newMonkey = new MonkeyObject(thing);
        createCard(newMonkey);
  } 

  typeOnePassage() {
    let passageAttempt = "";
    for (let i = 0; i < gameState.passage.length; i++) {
      if (Math.random() * ALPHABET.length < this.intelligence - 1) {
        passageAttempt += gameState.passage[i];
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
    let streakHigh = false;
    let score = 0;

    for (let i = 0; i < output.length; i++) {
      if (output[i] == gameState.passage[i]) {
        streak++;
        score += streak;
        if (streak > this.bestStreak) {
          this.bestStreak = streak;
          streakHigh = true;
        }
      } else {
        streak = 0;
      }
    }

    if (streakHigh) objectNotify(this, `New Best Streak! ${this.bestStreak}`);

    if (score > gameState.topScore) {
      gameState.topScore = score;
      gameState.topScoringMonkey = this;
      gameState.bestPassage = output;
    }
    return score;
  }

  payout(score) {
    const payout = PAYOUT_BASE * SCORE_MULTPLIER ** score;
    return payout;
  }

  soliloquize() {
    const { typing, typingProgress, type, id, speed } = this;
    if (this.typing) return;

    this.typing = true;

    this.typingProgress = 0;

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
      this.typingProgress = gameState.passage.length;
      gameState.generations += this.threads;
      this.typing = false;
      const scores = this.outputs.map((o) => this.score(o));
      const localHighScore = Math.max(...scores);

      const totalPayout = scores
        .map((s) => this.payout(s))
        .reduce((acc, payout) => acc + payout, 0);

      gameState.cash += totalPayout;

      payoutLog(totalPayout);

      objectNotify(this, `${cashFormatter.format(totalPayout)}`, "green");
      if (localHighScore > this.highScore) {
        objectNotify(this, "New High Score!");
        this.bestAttempt = this.outputs[scores.indexOf(localHighScore)];
        this.highScore = localHighScore;
        if (localHighScore > gameState.topScore) {
          gameState.topScore = localHighScore;
          gameState.topScoringMonkey = this;
        }
        updateCardScores(this);
      }
    }, TYPE_TIME / speed);
  }

  buySpeedBooster(dev = false) {
    if (!dev) gameState.cash -= this.speedBoosterCost;
    this.speedBoosterCost *= SPEED_COST_MULTIPLIER;
    this.speed++;
    updateCardStats(this);
  }

  buyIntBooster(dev = false) {
    if (!dev) gameState.cash -= this.intBoosterCost;
    this.intBoosterCost *= INT_COST_MULTIPLIER;
    this.intelligence++;
    updateCardStats(this);
  }
}
