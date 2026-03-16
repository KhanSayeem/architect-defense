import React, { useState } from 'react';
import { useGameStore, LEVELS } from '../store/gameStore';
import { Play, Square, RotateCcw, Activity, DollarSign, Clock, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';
import { SolutionModal } from './SolutionModal';

export function TopBar() {
  const {
    currentLevelId,
    budget,
    spent,
    simulationStatus,
    timeElapsed,
    currentTraffic,
    availability,
    startSimulation,
    stopSimulation,
    resetSimulation,
    loadLevel,
  } = useGameStore();

  const [showSolution, setShowSolution] = useState(false);

  const level = LEVELS.find((l) => l.id === currentLevelId)!;
  const isRunning = simulationStatus === 'running';
  const isWon = simulationStatus === 'won';
  const isLost = simulationStatus === 'lost';

  return (
    <>
      <div className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 shadow-sm z-10 relative">
        <div className="flex items-center gap-6 overflow-hidden">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-zinc-300 tracking-tight whitespace-nowrap">Architect Defense</h1>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-medium text-emerald-400 whitespace-nowrap">Level {level.id}: {level.name}</span>
              <span className="hidden sm:inline shrink-0">•</span>
              <span className="hidden sm:inline truncate">{level.description}</span>
            </div>
          </div>

          <div className="hidden lg:block h-8 w-px bg-zinc-800 mx-2 shrink-0" />

          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Budget</span>
              <div className={cn("flex items-center gap-1 font-mono text-sm font-medium", spent > budget ? "text-red-400" : "text-zinc-300")}>
                <DollarSign className="w-3.5 h-3.5" />
                {spent} / {budget}
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Time</span>
              <div className="flex items-center gap-1 font-mono text-sm font-medium text-zinc-300">
                <Clock className="w-3.5 h-3.5" />
                {timeElapsed}s / {level.duration}s
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Traffic</span>
              <div className="flex items-center gap-1 font-mono text-sm font-medium text-emerald-400">
                <Activity className="w-3.5 h-3.5" />
                {currentTraffic} TPS
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Availability</span>
              <div className={cn("flex items-center gap-1 font-mono text-sm font-medium", availability >= 90 ? "text-emerald-400" : "text-red-400")}>
                {availability.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          {isWon || isLost ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowSolution(true)}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Solution</span>
              </button>
              <button
                onClick={() => loadLevel(currentLevelId < LEVELS.length && isWon ? currentLevelId + 1 : currentLevelId)}
                className={cn(
                  "text-sm font-medium transition-all duration-300 whitespace-nowrap rounded-md",
                  isWon && currentLevelId < LEVELS.length
                    ? "px-2.5 py-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                    : "px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                )}
              >
                {isWon && currentLevelId < LEVELS.length ? 'Next Level' : 'Retry Level'}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={resetSimulation}
                disabled={timeElapsed === 0 && !isRunning}
                className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md disabled:opacity-50 transition-colors shrink-0"
                title="Reset Simulation"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              {isRunning ? (
                <button
                  onClick={stopSimulation}
                  className="flex items-center gap-2 px-4 py-1.5 text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] text-sm font-medium rounded-md transition-all duration-300 whitespace-nowrap shrink-0"
                >
                  <Square className="w-4 h-4 fill-current" /> Stop
                </button>
              ) : (
                <button
                  onClick={startSimulation}
                  disabled={spent > budget}
                  className="flex items-center gap-2 px-4 py-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] text-sm font-medium rounded-md disabled:opacity-50 transition-all duration-300 whitespace-nowrap shrink-0"
                >
                  <Play className="w-4 h-4 fill-current" /> Start
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showSolution && (
        <SolutionModal level={level} onClose={() => setShowSolution(false)} />
      )}
    </>
  );
}
