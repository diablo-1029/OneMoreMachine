/** Starting balance values. Tune here; nothing else hardcodes these numbers. */
export const BALANCE = {
  startingMoney: 200,
  costs: {
    miner: 40,
    conveyor: 5,
    furnace: 60,
    assembler: 80,
    seller: 50,
    splitter: 30,
    merger: 30,
    storage: 100,
    wind_turbine: 200,
  },
  power: {
    /** Free power every factory has before building a generator. */
    baseSupply: 40,
    turbineOutput: 15,
    /** Draw of a standard (Mk I) machine. */
    use: { miner: 2, furnace: 3, assembler: 4 },
  },
  /** Fraction of the build cost returned on removal. Full refunds keep experimenting stress-free. */
  refundRate: 1,
  /** A crafter buffers up to this many recipe-batches of each input. */
  inputBufferBatches: 2,
};
