/** Tuning for contracts. Nothing else hardcodes these numbers. */
export const CONTRACT_BALANCE = {
  /** Contracts on offer at once. */
  slots: 3,
  /** Chance that a new contract asks for a rate rather than a total. */
  rateChance: 0.4,
  /** Completed contracts after which difficulty stops rising. */
  maxLevel: 20,

  /** "Deliver N": N = (base + perLevel × level) × a factor that shrinks for valuable goods. */
  deliverBase: 30,
  deliverPerLevel: 12,
  /** Bonus paid per item, as a fraction of its sale value, plus a flat amount. */
  deliverBonusRate: 0.75,
  deliverFlatBonus: 40,

  /** "Sell N per minute": N = one machine's output × (baseMachines + level / levelsPerMachine). */
  rateBaseMachines: 2,
  rateLevelsPerMachine: 3,
  rateMaxMachines: 7,
  /** Bonus = target rate × item value × this, plus a flat amount. */
  rateBonusMinutes: 3,
  rateFlatBonus: 100,
};
