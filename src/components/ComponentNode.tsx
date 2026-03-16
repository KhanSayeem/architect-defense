import { Handle, Position } from '@xyflow/react';
import { ComponentType, COMPONENT_LIBRARY, useGameStore } from '../store/gameStore';
import { cn } from '../lib/utils';
import { Server, Database, Users, Network, HardDrive, X } from 'lucide-react';

const ICONS: Record<ComponentType, any> = {
  user: Users,
  loadBalancer: Network,
  webServer: Server,
  database: Database,
  cache: HardDrive,
};

export function ComponentNode({ id, data, isConnectable, selected }: any) {
  const type = data.type as ComponentType;
  const spec = COMPONENT_LIBRARY[type];
  const Icon = ICONS[type];
  const status = data.status || 'healthy';
  const currentLoad = data.currentLoad || 0;
  const { removeNode, simulationStatus } = useGameStore();
  const isRunning = simulationStatus === 'running';

  const statusColors = {
    healthy: 'border-emerald-500/50 bg-zinc-900 text-zinc-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    strained: 'border-amber-500/50 bg-zinc-900 text-zinc-100 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    failing: 'border-red-500/50 bg-zinc-900 text-zinc-100 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
  };

  const isSource = type === 'user';
  const isSink = type === 'database';

  return (
    <div className="relative">
      {selected && !isRunning && !isSource && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeNode(id);
          }}
          className="absolute -top-2 -right-2 z-10 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <div
        className={cn(
          'w-48 rounded-xl border p-3 transition-colors duration-300',
          statusColors[status as keyof typeof statusColors],
          selected && !isRunning ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950' : ''
        )}
      >
      {!isSource && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-zinc-400 border-zinc-900"
        />
      )}
      
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          "p-1.5 rounded-md",
          status === 'healthy' ? 'text-emerald-400 bg-emerald-500/10' : 
          status === 'strained' ? 'text-amber-400 bg-amber-500/10' : 
          'text-red-400 bg-red-500/10'
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold leading-none">{spec.name}</h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">Max: {spec.maxCapacity} TPS</p>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-xs text-zinc-300">
          <span>Load:</span>
          <span className="font-mono font-medium">{Math.round(currentLoad)} TPS</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              status === 'healthy' ? 'bg-emerald-500' : status === 'strained' ? 'bg-amber-500' : 'bg-red-500'
            )}
            style={{ width: `${Math.min(100, (currentLoad / spec.maxCapacity) * 100)}%` }}
          />
        </div>
      </div>

      {!isSink && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-3 h-3 bg-zinc-400 border-zinc-900"
        />
      )}
      </div>
    </div>
  );
}
