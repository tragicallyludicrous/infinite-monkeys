// ====================================
// ---  Constants ---
// ====================================

export const DEVELOPER_MODE = true;
export const STARTING_CASH = 3000;
export const BASE_MONKEY_COST = 2000;
export const MONKEY_COST_MULTIPLIER = 1.15;
export const PASSAGE = "TO BE OR NOT TO BE";
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
export const TYPE_TIME = 4000;
export const PAYOUT_BASE = 100;
export const SCORE_MULTPLIER = Math.E; // Euler's number
export const BASE_AUTOCLICKER_COST = 4000;
export const AUTOCLICKER_COST_MULTIPLIER = 1.35;
export const AUTOCLICKER_THRESHOLD = 4;
export const AUTOCLICKER_TIME = 1000;
export const BASE_SPEED_COST = 1000;
export const SPEED_COST_MULTIPLIER = (1 + Math.sqrt(5)) / 2; // Phi
export const SPEED_BOOST_THRESHOLD = 3;
export const NAMESPACE_LOOPS = 0;
export const TICK_INTERVAL = 100;
export const SECONDS_PER_TICK = TICK_INTERVAL / 1000;
export const TICKS_PER_SECOND = 1000 / TICK_INTERVAL;
export const BASE_INT_COST = 10000;
export const INT_BOOST_THRESHOLD = 250;
export const INT_COST_MULTIPLIER = (1 + Math.sqrt(5)) / 2; // Phi
export const BULK_DISCOUNT_MULTIPLIER = 0.8; // How much cheaper is buying 10 of a monkeytype

/**
 * @typedef {{ size: number, threshold: number, unlockMessage: string | null }} MonkeyType
 * @type {Record<string, MonkeyType>}
 */
export const monkeyTypes = {
  monkey: { size: 1, threshold: 0, unlockMessage: null },

  monkeyPack: {
    size: 10,
    threshold: 10,
    unlockMessage: "We're buying 10-packs now.",
  },
  monkeyFarm: {
    size: 100,
    threshold: 50,
    unlockMessage: "MOAR MONKEYS",
  },
  monkeyStadium: {
    size: 1000,
    threshold: 500,
    unlockMessage: "Hope you have a good computer...",
  },
};
