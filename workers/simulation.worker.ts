import { runSimulation } from "../lib/roulette/simulationEngine";
import type { WorkerOutMessage } from "../lib/roulette/simulationTypes";

self.onmessage = (e: MessageEvent) => {
  const { type, input } = e.data;
  if (type !== "start") return;

  try {
    const output = runSimulation(input.config, (pct, completed) => {
      self.postMessage({ type: "progress", percentage: pct, sessionsCompleted: completed } as WorkerOutMessage);
    });
    self.postMessage({ type: "result", output } as WorkerOutMessage);
  } catch (err) {
    self.postMessage({ type: "error", message: String(err) } as WorkerOutMessage);
  }
};
