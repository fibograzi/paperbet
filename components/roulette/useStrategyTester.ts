"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SimulationConfig } from "@/lib/roulette/strategyTypes";
import type { SimulationOutput, WorkerOutMessage } from "@/lib/roulette/simulationTypes";

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

function createWorker(): Worker {
  return new Worker(new URL("../../workers/simulation.worker.ts", import.meta.url));
}

export function useStrategyTester(): UseStrategyTesterReturn {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<TesterState>({
    isRunning: false,
    progress: 0,
    sessionsCompleted: 0,
    results: null,
    error: null,
  });

  useEffect(() => {
    workerRef.current = createWorker();
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const attachMessageHandler = useCallback((worker: Worker) => {
    worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
      const msg = e.data;
      if (msg.type === "progress") {
        setState((prev) => ({
          ...prev,
          progress: msg.percentage,
          sessionsCompleted: msg.sessionsCompleted,
        }));
      } else if (msg.type === "result") {
        setState({
          isRunning: false,
          progress: 100,
          sessionsCompleted: msg.output.summary.totalSessions,
          results: msg.output,
          error: null,
        });
      } else if (msg.type === "error") {
        setState((prev) => ({
          ...prev,
          isRunning: false,
          error: msg.message,
        }));
      }
    };
    worker.onerror = (e) => {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        error: `Worker error: ${e.message}`,
      }));
    };
  }, []);

  const startSimulation = useCallback(
    (config: SimulationConfig) => {
      if (!workerRef.current) return;
      attachMessageHandler(workerRef.current);
      setState({
        isRunning: true,
        progress: 0,
        sessionsCompleted: 0,
        results: null,
        error: null,
      });
      workerRef.current.postMessage({ type: "start", input: { config } });
    },
    [attachMessageHandler],
  );

  const cancelSimulation = useCallback(() => {
    workerRef.current?.terminate();
    const newWorker = createWorker();
    workerRef.current = newWorker;
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
