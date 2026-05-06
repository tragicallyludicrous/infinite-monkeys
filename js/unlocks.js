import { gameState } from "./state.js";
import {
  INT_BOOST_THRESHOLD,
  AUTOCLICKER_THRESHOLD,
  SPEED_BOOST_THRESHOLD,
  monkeyTypes,
} from "./config.js";
import { hudNotify } from "./notifications.js";
import { updateCardFlags } from "./cards.js";
import { getTotalMonkeys } from "./economy.js";

// ====================================
// ---  Unlock Flags ---
// ====================================

export function flagSet() {
  const { autoClickerFlag, speedBoosterFlag, intBoosterFlag } = gameState;

  const totalMonkeys = getTotalMonkeys();

  // --- AUTOCLICKERS ---
  if (totalMonkeys >= AUTOCLICKER_THRESHOLD && !autoClickerFlag) {
    gameState.autoClickerFlag = true;
    updateCardFlags();
    hudNotify("Autoclickers Now For Sale!", "maroon");
  }

  // --- SPEEDBOOSTERS ---
  if (totalMonkeys >= SPEED_BOOST_THRESHOLD && !speedBoosterFlag) {
    gameState.speedBoosterFlag = true;
    updateCardFlags();
    hudNotify("<s>Amphetamines</s> Speedboosters Now For Sale!", "maroon");
  }
  // --- INTBOOSTERS ---
  if (totalMonkeys >= INT_BOOST_THRESHOLD && !intBoosterFlag) {
    gameState.intBoosterFlag = true;
    updateCardFlags();
    hudNotify(
      "This is taking too long...Let's try a different tack.",
      "maroon",
    );
  }

  // --- MONKEY UNLOCKS ---
  for (const [type, def] of Object.entries(monkeyTypes)) {
    if (type === "monkey") continue; // always unlocked
    if (totalMonkeys >= def.threshold && !gameState.flags[type]) {
      gameState.flags[type] = true;
      updateCardFlags();
      if (def.unlockMessage) hudNotify(def.unlockMessage, "maroon");
    }
  }
}
