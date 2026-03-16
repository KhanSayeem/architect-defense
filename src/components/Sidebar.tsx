import React from 'react';
import { COMPONENT_LIBRARY, ComponentType, useGameStore } from '../store/gameStore';
import { Server, Database, Users, Network, HardDrive, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';

const ICONS: Record<ComponentType, any> = {
  user: Users,
  loadBalancer: Network,
  webServer: Server,
  database: Database,
  cache: HardDrive,
};

export function Sidebar() {
  const { simulationStatus } = useGameStore();
  const isRunning = simulationStatus === 'running';

  const onDragStart = (event: React.DragEvent, nodeType: ComponentType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shadow-sm z-10 relative">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950">
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Components</h2>
        <p className="text-xs text-zinc-500 mt-1">Drag onto canvas to build</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {Object.values(COMPONENT_LIBRARY).map((spec) => {
          if (spec.type === 'user') return null; // Users are pre-placed
          
          const Icon = ICONS[spec.type as ComponentType];
          
          return (
            <div
              key={spec.type}
              className={cn(
                "group flex flex-col p-3 rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm cursor-grab active:cursor-grabbing hover:border-emerald-500/50 hover:shadow-md transition-all",
                isRunning && "opacity-50 pointer-events-none"
              )}
              onDragStart={(event) => onDragStart(event, spec.type as ComponentType)}
              draggable={!isRunning}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Icon className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-semibold">{spec.name}</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  ${spec.cost}
                </div>
              </div>
              
              <p className="text-[10px] text-zinc-500 leading-tight mb-2">
                {spec.description}
              </p>
              
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 border-t border-zinc-800 pt-2 mt-auto">
                <span>Max: {spec.maxCapacity} TPS</span>
                <span>Lat: {spec.baseLatency}ms</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
