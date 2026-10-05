/** Tuning for prestige ("selling up"). Nothing else hardcodes these numbers. */
export const PRESTIGE = {
  /**
   * A run is worth floor(cbrt(earned / this)) stars: $50k for the first, $400k for two,
   * $1.35M for three. Each further star takes a good deal more than the last.
   */
  earningsScale: 50_000,
  /** Each star adds this much to every sale price, for good. */
  saleBonusPerStar: 0.1,
  /** Each star adds this much to the money a new factory starts with. */
  startingMoneyPerStar: 100,
};
