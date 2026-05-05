import { gameState } from "./state.js";
import { monkeyTypes } from "./config.js";
import {
  INT_BOOST_THRESHOLD,
  MONKEYFARM_THRESHOLD,
  MONKEYPACK_THRESHOLD,
  AUTOCLICKER_THRESHOLD,
  SPEED_BOOST_THRESHOLD,
} from "./config.js";
import { hudNotify } from "./notifications.js";
import { updateCardFlags } from "./cards.js";
import { getTotalMonkeys } from "./economy.js";

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

  // -- MONKEYPACKS ---
  if (totalMonkeys >= MONKEYPACK_THRESHOLD && !monkeyPackFlag) {
    gameState.monkeyPackFlag = true;
    hudNotify("We're buying 10-packs now.", "maroon");
  }

  // -- MONKEYFARMS ---
  if (totalMonkeys >= MONKEYFARM_THRESHOLD && !monkeyFarmFlag) {
    gameState.monkeyFarmFlag = true;
    updateCardFlags();
    hudNotify("MOAR MONKEYS", "maroon");
  }
}
