import type { Strategy, CustomStrategyConfig } from "./strategyTypes";

// ---------------------------------------------------------------------------
// 1. Flat Betting
// ---------------------------------------------------------------------------

const flatStrategy: Strategy = {
  id: "flat",
  name: "Flat Betting",
  description: "Always bet the same base amount. Lowest risk, steady gameplay.",

  init: () => ({
    step: 0,
    sequence: [],
    cycleProfit: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
  }),

  getNextBet: (_state, baseBet) => baseBet,

  applyOutcome: (state, won) => ({
    ...state,
    consecutiveWins: won ? state.consecutiveWins + 1 : 0,
    consecutiveLosses: won ? 0 : state.consecutiveLosses + 1,
  }),

  reset: () => flatStrategy.init(0),
};

// ---------------------------------------------------------------------------
// 2. Martingale
// ---------------------------------------------------------------------------

const martingaleStrategy: Strategy = {
  id: "martingale",
  name: "Martingale",
  description: "Double your bet after each loss, reset to base after a win. Classic negative progression.",

  init: () => ({
    step: 0,
    sequence: [],
    cycleProfit: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
  }),

  getNextBet: (state, baseBet) => baseBet * Math.pow(2, state.step),

  applyOutcome: (state, won) => ({
    ...state,
    step: won ? 0 : state.step + 1,
    consecutiveWins: won ? state.consecutiveWins + 1 : 0,
    consecutiveLosses: won ? 0 : state.consecutiveLosses + 1,
  }),

  reset: (baseBet) => martingaleStrategy.init(baseBet),
};

// ---------------------------------------------------------------------------
// 3. Fibonacci
// ---------------------------------------------------------------------------

function fibAt(n: number): number {
  if (n <= 0) return 1;
  if (n === 1) return 1;
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

const fibonacciStrategy: Strategy = {
  id: "fibonacci",
  name: "Fibonacci",
  description: "Move forward 1 step on loss, back 2 on win. Based on the Fibonacci sequence: 1,1,2,3,5,8,13...",

  init: () => ({
    step: 0,
    sequence: [],
    cycleProfit: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
  }),

  getNextBet: (state, baseBet) => baseBet * fibAt(state.step),

  applyOutcome: (state, won) => ({
    ...state,
    step: won ? Math.max(0, state.step - 2) : state.step + 1,
    consecutiveWins: won ? state.consecutiveWins + 1 : 0,
    consecutiveLosses: won ? 0 : state.consecutiveLosses + 1,
  }),

  reset: (baseBet) => fibonacciStrategy.init(baseBet),
};

// ---------------------------------------------------------------------------
// 4. D'Alembert
// ---------------------------------------------------------------------------

const dalembertStrategy: Strategy = {
  id: "dalembert",
  name: "D'Alembert",
  description: "Increase bet by 1 unit after loss, decrease by 1 after win. Gentle progression.",

  init: () => ({
    step: 0,
    sequence: [],
    cycleProfit: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
  }),

  getNextBet: (state, baseBet) => baseBet * (1 + state.step),

  applyOutcome: (state, won) => ({
    ...state,
    step: won ? Math.max(0, state.step - 1) : state.step + 1,
    consecutiveWins: won ? state.consecutiveWins + 1 : 0,
    consecutiveLosses: won ? 0 : state.consecutiveLosses + 1,
  }),

  reset: (baseBet) => dalembertStrategy.init(baseBet),
};

// ---------------------------------------------------------------------------
// 5. Labouchere (Cancellation)
// ---------------------------------------------------------------------------

const labouchereStrategy: Strategy = {
  id: "labouchere",
  name: "Labouchere",
  description: "Bet = first + last of a number sequence. Win removes both ends; loss appends the bet amount.",

  init: () => ({
    step: 0,
    sequence: [1, 2, 3], // Starting sequence in units
    cycleProfit: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
  }),

  getNextBet: (state, baseBet) => {
    const seq = state.sequence;
    if (seq.length === 0) return baseBet;
    if (seq.length === 1) return baseBet * seq[0];
    return baseBet * (seq[0] + seq[seq.length - 1]);
  },

  applyOutcome: (state, won) => {
    const seq = [...state.sequence];
    if (won) {
      // Remove first and last
      if (seq.length >= 2) {
        seq.shift();
        seq.pop();
      } else {
        seq.shift();
      }
    } else {
      // Append bet size in units
      if (seq.length === 0) {
        seq.push(1);
      } else if (seq.length === 1) {
        seq.push(seq[0]);
      } else {
        seq.push(seq[0] + seq[seq.length - 1]);
      }
    }
    return {
      ...state,
      sequence: seq.length === 0 ? [1, 2, 3] : seq, // Reset if completed
      consecutiveWins: won ? state.consecutiveWins + 1 : 0,
      consecutiveLosses: won ? 0 : state.consecutiveLosses + 1,
    };
  },

  reset: (baseBet) => labouchereStrategy.init(baseBet),
};

// ---------------------------------------------------------------------------
// 6. Oscar's Grind
// ---------------------------------------------------------------------------

const oscarsGrindStrategy: Strategy = {
  id: "oscars_grind",
  name: "Oscar's Grind",
  description: "Same bet after loss, +1 unit after win. Reset cycle when +1 unit profit reached.",

  init: () => ({
    step: 1, // Current bet in units
    sequence: [],
    cycleProfit: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
  }),

  getNextBet: (state, baseBet) => baseBet * state.step,

  applyOutcome: (state, won) => {
    let newStep = state.step;
    let cycleProfit = state.cycleProfit;

    if (won) {
      cycleProfit += state.step; // Won bet_size units
      if (cycleProfit >= 1) {
        // Cycle complete — reset
        return {
          step: 1,
          sequence: [],
          cycleProfit: 0,
          consecutiveWins: state.consecutiveWins + 1,
          consecutiveLosses: 0,
        };
      }
      // Increase bet by 1 unit
      newStep = state.step + 1;
    } else {
      cycleProfit -= state.step; // Lost bet_size units
      // Keep same bet
    }

    return {
      ...state,
      step: newStep,
      cycleProfit,
      consecutiveWins: won ? state.consecutiveWins + 1 : 0,
      consecutiveLosses: won ? 0 : state.consecutiveLosses + 1,
    };
  },

  reset: (baseBet) => oscarsGrindStrategy.init(baseBet),
};

// ---------------------------------------------------------------------------
// 7. Paroli (Reverse Martingale)
// ---------------------------------------------------------------------------

const paroliStrategy: Strategy = {
  id: "paroli",
  name: "Paroli",
  description: "Double bet after each win (up to 3 wins), reset after a loss. Positive progression.",

  init: () => ({
    step: 0, // Number of consecutive wins in current progression
    sequence: [],
    cycleProfit: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0,
  }),

  getNextBet: (state, baseBet) => baseBet * Math.pow(2, state.step),

  applyOutcome: (state, won) => {
    if (won) {
      const newStep = state.step + 1;
      // Reset after 3 consecutive wins
      if (newStep >= 3) {
        return {
          step: 0,
          sequence: [],
          cycleProfit: 0,
          consecutiveWins: state.consecutiveWins + 1,
          consecutiveLosses: 0,
        };
      }
      return {
        ...state,
        step: newStep,
        consecutiveWins: state.consecutiveWins + 1,
        consecutiveLosses: 0,
      };
    }
    // Loss — reset
    return {
      ...state,
      step: 0,
      consecutiveWins: 0,
      consecutiveLosses: state.consecutiveLosses + 1,
    };
  },

  reset: (baseBet) => paroliStrategy.init(baseBet),
};

// ---------------------------------------------------------------------------
// 8. Custom Strategy
// ---------------------------------------------------------------------------

function createCustomStrategy(config: CustomStrategyConfig): Strategy {
  function applyAction(currentUnits: number, action: CustomStrategyConfig["onWin"]): number {
    switch (action) {
      case "same": return currentUnits;
      case "double": return currentUnits * 2;
      case "add_unit": return currentUnits + 1;
      case "subtract_unit": return Math.max(1, currentUnits - 1);
      case "reset": return 1;
    }
  }

  return {
    id: "custom",
    name: "Custom",
    description: "User-defined progression rules.",

    init: () => ({
      step: 1, // Current bet in units
      sequence: [],
      cycleProfit: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    }),

    getNextBet: (state, baseBet) => {
      const units = Math.min(state.step, config.maxBetUnits);
      return baseBet * units;
    },

    applyOutcome: (state, won) => {
      const newUnits = applyAction(state.step, won ? config.onWin : config.onLoss);
      const clampedUnits = Math.min(newUnits, config.maxBetUnits);

      const newConsWins = won ? state.consecutiveWins + 1 : 0;
      const newConsLosses = won ? 0 : state.consecutiveLosses + 1;

      // Check reset conditions
      if (config.resetAfterWins !== null && newConsWins >= config.resetAfterWins) {
        return {
          step: 1,
          sequence: [],
          cycleProfit: 0,
          consecutiveWins: 0,
          consecutiveLosses: 0,
        };
      }
      if (config.resetAfterLosses !== null && newConsLosses >= config.resetAfterLosses) {
        return {
          step: 1,
          sequence: [],
          cycleProfit: 0,
          consecutiveWins: 0,
          consecutiveLosses: 0,
        };
      }

      return {
        ...state,
        step: clampedUnits,
        consecutiveWins: newConsWins,
        consecutiveLosses: newConsLosses,
      };
    },

    reset: () => ({
      step: 1,
      sequence: [],
      cycleProfit: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
    }),
  };
}

// ---------------------------------------------------------------------------
// Strategy registry
// ---------------------------------------------------------------------------

const STRATEGIES: Record<string, Strategy> = {
  flat: flatStrategy,
  martingale: martingaleStrategy,
  fibonacci: fibonacciStrategy,
  dalembert: dalembertStrategy,
  labouchere: labouchereStrategy,
  oscars_grind: oscarsGrindStrategy,
  paroli: paroliStrategy,
};

export function getStrategy(id: string, customConfig?: CustomStrategyConfig): Strategy {
  if (id === "custom" && customConfig) {
    return createCustomStrategy(customConfig);
  }
  return STRATEGIES[id] ?? flatStrategy;
}

export function getAllStrategies(): Strategy[] {
  return Object.values(STRATEGIES);
}

export function getStrategyById(id: string): Strategy | undefined {
  return STRATEGIES[id];
}

// Re-export individual strategies for testing
export {
  flatStrategy,
  martingaleStrategy,
  fibonacciStrategy,
  dalembertStrategy,
  labouchereStrategy,
  oscarsGrindStrategy,
  paroliStrategy,
};
