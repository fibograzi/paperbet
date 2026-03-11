"use client";

import { useRef, useState, useCallback } from "react";
import type { SimulationConfig } from "@/lib/roulette/strategyTypes";
import type { SimulationOutput } from "@/lib/roulette/simulationTypes";
import { runSession, computeSimulationOutput } from "@/lib/roulette/simulationEngine";

interface TesterState {
  isRunning: boolean;
  progress: number;
  sessionsCompleted: number;
  results: SimulationOutput | null;
  error: string | null;
}

interface UseStrategyTesterReturn extends TesterState {
  startSimulation: (config: SimulationConfig) => void;
  cancelSimulation: () => void;
  clearResults: () => void;
}

/** How many sessions to run before yielding to the UI thread */
const BATCH_SIZE = 50;

export function useStrategyTester(): UseStrategyTesterReturn {
  const abortRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<TesterState>({
    isRunning: false,
    progress: 0,
    sessionsCompleted: 0,
    results: null,
    error: null,
  });

  const startSimulation = useCallback((config: SimulationConfig) => {
    // Cancel any running simulation
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({
      isRunning: true,
      progress: 0,
      sessionsCompleted: 0,
      results: null,
      error: null,
    });

    // Run async on main thread, yielding between batches
    (async () => {
      const startTime = Date.now();
      const sessions = [];

      try {
        for (let i = 0; i < config.numberOfSessions; i++) {
          if (controller.signal.aborted) return;

          sessions.push(runSession(config));

          // Yield to UI every BATCH_SIZE sessions
          if ((i + 1) % BATCH_SIZE === 0 || i === config.numberOfSessions - 1) {
            const pct = ((i + 1) / config.numberOfSessions) * 100;
            setState((prev) => ({
              ...prev,
              progress: pct,
              sessionsCompleted: i + 1,
            }));
            // Yield to allow React to re-render the progress bar
            await new Promise<void>((r) => setTimeout(r, 0));
          }
        }

        if (controller.signal.aborted) return;

        const output = computeSimulationOutput(
          config,
          sessions,
          Date.now() - startTime,
        );

        setState({
          isRunning: false,
          progress: 100,
          sessionsCompleted: config.numberOfSessions,
          results: output,
          error: null,
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setState((prev) => ({
          ...prev,
          isRunning: false,
          error: `Simulation error: ${err instanceof Error ? err.message : String(err)}`,
        }));
      }
    })();
  }, []);

  const cancelSimulation = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({
      ...prev,
      isRunning: false,
      progress: 0,
      sessionsCompleted: 0,
    }));
  }, []);

  const clearResults = useCallback(() => {
    setState({
      isRunning: false,
      progress: 0,
      sessionsCompleted: 0,
      results: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    startSimulation,
    cancelSimulation,
    clearResults,
  };
}
