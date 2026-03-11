"use client";

import { useStrategyTester } from "./useStrategyTester";
import StrategyConfigPanel from "./StrategyConfigPanel";
import SimulationProgress from "./SimulationProgress";
import SimulationResults from "./SimulationResults";
import SimulationChart from "./SimulationChart";
import CsvExport from "./CsvExport";
import EducationalPanel from "./EducationalPanel";

export default function StrategyTester() {
  const { isRunning, progress, sessionsCompleted, results, error, startSimulation, cancelSimulation, clearResults } =
    useStrategyTester();

  const totalSessions = results?.config.numberOfSessions ?? 1000;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Page intro */}
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold text-pb-text-primary">
          Roulette Strategy Tester
        </h1>
        <p className="text-pb-text-secondary">
          Monte Carlo simulator — run thousands of independent sessions to see real statistical outcomes.
        </p>
      </div>

      <EducationalPanel variant="info" title="How this simulator works">
        <p>
          Each session is an independent run of your chosen strategy from a fresh bankroll. After
          running thousands of sessions, you see the true statistical distribution — not just one lucky
          or unlucky run. This is how professional analysts evaluate betting systems.
        </p>
      </EducationalPanel>

      {error && (
        <div className="rounded-xl border border-pb-danger/30 bg-pb-danger/10 p-4 text-sm text-pb-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Config panel */}
        <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6">
          <h2 className="font-heading font-semibold text-pb-text-primary mb-5">Configuration</h2>
          <StrategyConfigPanel onRun={startSimulation} isRunning={isRunning} />
        </div>

        {/* Results area */}
        <div className="space-y-5">
          {isRunning && (
            <div className="bg-pb-bg-secondary border border-pb-border rounded-xl">
              <SimulationProgress
                percentage={progress}
                sessionsCompleted={sessionsCompleted}
                totalSessions={
                  results ? results.config.numberOfSessions : totalSessions
                }
                onCancel={cancelSimulation}
              />
            </div>
          )}

          {!isRunning && !results && !error && (
            <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-12 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-pb-bg-tertiary flex items-center justify-center">
                <span className="text-3xl">🎲</span>
              </div>
              <p className="font-heading font-semibold text-pb-text-primary">
                Configure &amp; Run a Simulation
              </p>
              <p className="text-sm text-pb-text-secondary max-w-xs">
                Choose your strategy and parameters on the left, then click{" "}
                <strong>Run Sessions</strong> to see the statistical results.
              </p>
            </div>
          )}

          {!isRunning && results && (
            <>
              <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6">
                <SimulationResults summary={results.summary} />
              </div>

              <div className="bg-pb-bg-secondary border border-pb-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-pb-text-primary">Charts</h3>
                  <CsvExport output={results} />
                </div>
                <SimulationChart output={results} />
              </div>

              <button
                type="button"
                onClick={clearResults}
                className="text-xs text-pb-text-muted hover:text-pb-text-secondary transition-colors underline"
              >
                Clear results and start over
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
