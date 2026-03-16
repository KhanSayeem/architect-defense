import React, { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useGameStore, ComponentType } from '../store/gameStore';
import { ComponentNode } from './ComponentNode';
import { DeletableEdge } from './DeletableEdge';

const nodeTypes = {
  userNode: ComponentNode,
  loadBalancerNode: ComponentNode,
  webServerNode: ComponentNode,
  databaseNode: ComponentNode,
  cacheNode: ComponentNode,
};

const edgeTypes = {
  deletable: DeletableEdge,
};

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnect,
    addNode,
    removeNode,
    simulationStatus,
    tick,
  } = useGameStore();

  const isRunning = simulationStatus === 'running';

  // Simulation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000); // 1 tick per second
    }
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as ComponentType;

      if (typeof type === 'undefined' || !type || isRunning) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode, isRunning],
  );

  const onNodesDelete = useCallback(
    (deleted: any[]) => {
      deleted.forEach((node) => removeNode(node.id));
    },
    [removeNode]
  );

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'deletable' }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        className="bg-zinc-950"
        colorMode="dark"
        nodesDraggable={!isRunning}
        nodesConnectable={!isRunning}
        elementsSelectable={!isRunning}
        edgesReconnectable={!isRunning}
      >
        <Background color="#27272a" gap={16} />
        <Controls className="bg-zinc-900 border border-zinc-800 shadow-sm rounded-md fill-zinc-400" />
        
        {isRunning && (
          <Panel position="top-center" className="text-emerald-400 text-sm font-medium animate-pulse">
            Simulation Running...
          </Panel>
        )}

        {simulationStatus === 'won' && (
          <Panel position="top-center" className="text-emerald-400 text-sm font-medium animate-in fade-in zoom-in duration-500">
            Wave Survived!
          </Panel>
        )}

        {simulationStatus === 'lost' && (
          <Panel position="top-center" className="text-red-400 text-sm font-medium animate-in fade-in zoom-in duration-500">
            System Crashed
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
