import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Wand2 } from 'lucide-react';
import { Level, useGameStore } from '../store/gameStore';
import { ReactFlow, Background, ReactFlowProvider, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import { ComponentNode } from './ComponentNode';
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  userNode: ComponentNode,
  loadBalancerNode: ComponentNode,
  webServerNode: ComponentNode,
  databaseNode: ComponentNode,
  cacheNode: ComponentNode,
};

interface SolutionModalProps {
  level: Level;
  onClose: () => void;
}

export function SolutionModal({ level, onClose }: SolutionModalProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [nodes, setNodes] = useState(level.solutionNodes);
  const [edges, setEdges] = useState(level.solutionEdges);
  const { applySolution } = useGameStore();

  const onNodesChange = (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds));

  const handleApply = () => {
    applySolution();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Level {level.id} Solution</h2>
              <p className="text-xs text-zinc-500">Optimal architecture for this challenge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 w-full relative bg-zinc-950 min-h-0">
          <ReactFlowProvider>
            <div className="absolute inset-0">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                colorMode="dark"
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
                panOnDrag={true}
                zoomOnScroll={true}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#27272a" gap={16} />
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </div>

        <div className="border-t border-zinc-800 bg-zinc-900/50 flex flex-col shrink-0">
          {showExplanation && (
            <div className="px-6 py-6 space-y-8 overflow-y-auto max-h-[40vh] border-b border-zinc-800/50 bg-zinc-950/50">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                  The Solution
                </h3>
                <p className="text-zinc-200 text-base leading-relaxed">
                  {level.solution.description}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                  Why this is optimal
                </h3>
                <p className="text-zinc-300 text-base leading-relaxed">
                  {level.solution.optimal}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                  Alternative Approaches
                </h3>
                <p className="text-zinc-300 text-base leading-relaxed">
                  {level.solution.alternatives}
                </p>
              </div>
            </div>
          )}
          
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors font-medium text-sm"
            >
              {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showExplanation ? 'Hide Explanation' : 'Explain Solution'}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleApply}
                className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-sm font-bold rounded-md transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Wand2 className="w-4 h-4" />
                Apply Solution
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
