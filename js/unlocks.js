import { gameState } from "./state.js";
import {
  INT_BOOST_THRESHOLD,
  MONKEYFARM_THRESHOLD,
  MONKEYPACK_THRESHOLD,
  AUTOCLICKER_THRESHOLD,
  SPEED_BOOST_THRESHOLD,
} from "./config.js";
import { HUDNotify } from "./notifications.js";

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
