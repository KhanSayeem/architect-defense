import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  reconnectEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';

export type ComponentType = 'user' | 'loadBalancer' | 'webServer' | 'database' | 'cache';

export interface ComponentSpecs {
  type: ComponentType;
  name: string;
  cost: number;
  maxCapacity: number;
  baseLatency: number;
  description: string;
}

export const COMPONENT_LIBRARY: Record<ComponentType, ComponentSpecs> = {
  user: {
    type: 'user',
    name: 'User Traffic',
    cost: 0,
    maxCapacity: Infinity,
    baseLatency: 0,
    description: 'The source of incoming requests.',
  },
  loadBalancer: {
    type: 'loadBalancer',
    name: 'Load Balancer',
    cost: 50,
    maxCapacity: 2000,
    baseLatency: 5,
    description: 'Distributes traffic equally among connected servers.',
  },
  webServer: {
    type: 'webServer',
    name: 'Web Server',
    cost: 100,
    maxCapacity: 200,
    baseLatency: 50,
    description: 'Processes logic. Strains at >200 TPS, fails at >300 TPS.',
  },
  database: {
    type: 'database',
    name: 'SQL Database',
    cost: 500,
    maxCapacity: 500,
    baseLatency: 200,
    description: 'Storage bottleneck. Locks up if >500 Concurrent Reads.',
  },
  cache: {
    type: 'cache',
    name: 'Redis Cache',
    cost: 150,
    maxCapacity: 5000,
    baseLatency: 10,
    description: 'High-speed storage to offload the DB.',
  },
};

export interface Level {
  id: number;
  name: string;
  description: string;
  budget: number;
  duration: number; // seconds
  maxTraffic: number;
  getTraffic: (time: number) => number;
  initialNodes: Node[];
  initialEdges: Edge[];
  solutionNodes: Node[];
  solutionEdges: Edge[];
  solution: {
    description: string;
    optimal: string;
    alternatives: string;
  };
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Traffic Spike',
    description: '400 TPS spike at 10s',
    budget: 800,
    duration: 30,
    maxTraffic: 400,
    getTraffic: (time) => (time < 10 ? 50 : 400),
    initialNodes: [
      {
        id: 'user-1',
        type: 'userNode',
        position: { x: 100, y: 200 },
        data: { label: 'Users', type: 'user' },
        deletable: false,
      },
      {
        id: 'web-1',
        type: 'webServerNode',
        position: { x: 400, y: 200 },
        data: { label: 'Web Server', type: 'webServer' },
      },
      {
        id: 'db-1',
        type: 'databaseNode',
        position: { x: 700, y: 200 },
        data: { label: 'SQL DB', type: 'database' },
      },
    ],
    initialEdges: [
      { id: 'e1', source: 'user-1', target: 'web-1' },
      { id: 'e2', source: 'web-1', target: 'db-1' },
    ],
    solutionNodes: [
      { id: 'user-1', type: 'userNode', position: { x: 50, y: 200 }, data: { label: 'Users', type: 'user' } },
      { id: 'lb-1', type: 'loadBalancerNode', position: { x: 250, y: 200 }, data: { label: 'Load Balancer', type: 'loadBalancer' } },
      { id: 'web-1', type: 'webServerNode', position: { x: 450, y: 150 }, data: { label: 'Web Server', type: 'webServer' } },
      { id: 'web-2', type: 'webServerNode', position: { x: 450, y: 250 }, data: { label: 'Web Server', type: 'webServer' } },
      { id: 'db-1', type: 'databaseNode', position: { x: 700, y: 200 }, data: { label: 'SQL DB', type: 'database' } },
    ],
    solutionEdges: [
      { id: 'se1', source: 'user-1', target: 'lb-1', animated: true },
      { id: 'se2', source: 'lb-1', target: 'web-1', animated: true },
      { id: 'se3', source: 'lb-1', target: 'web-2', animated: true },
      { id: 'se4', source: 'web-1', target: 'db-1', animated: true },
      { id: 'se5', source: 'web-2', target: 'db-1', animated: true },
    ],
    solution: {
      description: 'Add a Load Balancer and a second Web Server.',
      optimal: 'A Load Balancer distributes the 400 TPS spike evenly across two Web Servers (200 TPS each), keeping them both within their maximum healthy capacity.',
      alternatives: 'You could try using a Cache, but the bottleneck here is the Web Server processing power, not the Database. Scaling out the web tier is the most cost-effective and robust solution.',
    },
  },
  {
    id: 2,
    name: 'Heavy Reads',
    description: '1,000 TPS read-heavy load',
    budget: 1100,
    duration: 25,
    maxTraffic: 1000,
    getTraffic: () => 1000,
    initialNodes: [
      {
        id: 'user-1',
        type: 'userNode',
        position: { x: 50, y: 350 },
        data: { label: 'Users', type: 'user' },
        deletable: false,
      },
      {
        id: 'lb-1',
        type: 'loadBalancerNode',
        position: { x: 200, y: 350 },
        data: { label: 'Load Balancer', type: 'loadBalancer' },
      },
      {
        id: 'web-1',
        type: 'webServerNode',
        position: { x: 400, y: 200 },
        data: { label: 'Web Server', type: 'webServer' },
      },
      {
        id: 'web-2',
        type: 'webServerNode',
        position: { x: 400, y: 300 },
        data: { label: 'Web Server', type: 'webServer' },
      },
      {
        id: 'web-3',
        type: 'webServerNode',
        position: { x: 400, y: 400 },
        data: { label: 'Web Server', type: 'webServer' },
      },
      {
        id: 'web-4',
        type: 'webServerNode',
        position: { x: 400, y: 500 },
        data: { label: 'Web Server', type: 'webServer' },
      },
      {
        id: 'db-1',
        type: 'databaseNode',
        position: { x: 700, y: 350 },
        data: { label: 'SQL DB', type: 'database' },
      },
    ],
    initialEdges: [
      { id: 'e1', source: 'user-1', target: 'lb-1' },
      { id: 'e2', source: 'lb-1', target: 'web-1' },
      { id: 'e3', source: 'lb-1', target: 'web-2' },
      { id: 'e4', source: 'lb-1', target: 'web-3' },
      { id: 'e5', source: 'lb-1', target: 'web-4' },
      { id: 'e6', source: 'web-1', target: 'db-1' },
      { id: 'e7', source: 'web-2', target: 'db-1' },
      { id: 'e8', source: 'web-3', target: 'db-1' },
      { id: 'e9', source: 'web-4', target: 'db-1' },
    ],
    solutionNodes: [
      { id: 'user-1', type: 'userNode', position: { x: 50, y: 350 }, data: { label: 'Users', type: 'user' } },
      { id: 'lb-1', type: 'loadBalancerNode', position: { x: 200, y: 350 }, data: { label: 'Load Balancer', type: 'loadBalancer' } },
      { id: 'web-1', type: 'webServerNode', position: { x: 400, y: 200 }, data: { label: 'Web Server', type: 'webServer' } },
      { id: 'web-2', type: 'webServerNode', position: { x: 400, y: 300 }, data: { label: 'Web Server', type: 'webServer' } },
      { id: 'web-3', type: 'webServerNode', position: { x: 400, y: 400 }, data: { label: 'Web Server', type: 'webServer' } },
      { id: 'web-4', type: 'webServerNode', position: { x: 400, y: 500 }, data: { label: 'Web Server', type: 'webServer' } },
      { id: 'cache-1', type: 'cacheNode', position: { x: 600, y: 350 }, data: { label: 'Redis Cache', type: 'cache' } },
      { id: 'db-1', type: 'databaseNode', position: { x: 800, y: 350 }, data: { label: 'SQL DB', type: 'database' } },
    ],
    solutionEdges: [
      { id: 'se1', source: 'user-1', target: 'lb-1', animated: true },
      { id: 'se2', source: 'lb-1', target: 'web-1', animated: true },
      { id: 'se3', source: 'lb-1', target: 'web-2', animated: true },
      { id: 'se4', source: 'lb-1', target: 'web-3', animated: true },
      { id: 'se5', source: 'lb-1', target: 'web-4', animated: true },
      { id: 'se6', source: 'web-1', target: 'cache-1', animated: true },
      { id: 'se7', source: 'web-2', target: 'cache-1', animated: true },
      { id: 'se8', source: 'web-3', target: 'cache-1', animated: true },
      { id: 'se9', source: 'web-4', target: 'cache-1', animated: true },
      { id: 'se10', source: 'cache-1', target: 'db-1', animated: true },
    ],
    solution: {
      description: 'Add a Redis Cache between the Web Servers and the Database.',
      optimal: 'The Database crashes at 500 TPS. By adding a Redis Cache, you offload 90% of the read traffic. The DB only handles the 10% cache misses (100 TPS), keeping it well under its 500 TPS limit.',
      alternatives: 'You could try adding more Web Servers, but that just sends more traffic to the already overwhelmed Database. A Read Replica would help, but it costs $300, which might blow your budget compared to a $150 Cache.',
    },
  },
  {
    id: 3,
    name: 'Viral Event',
    description: 'Massive 2,000 TPS surge',
    budget: 1500,
    duration: 40,
    maxTraffic: 2000,
    getTraffic: (time) => (time < 10 ? 500 : 2000),
    initialNodes: [
      {
        id: 'user-1',
        type: 'userNode',
        position: { x: 50, y: 350 },
        data: { label: 'Users', type: 'user' },
        deletable: false,
      },
      {
        id: 'db-1',
        type: 'databaseNode',
        position: { x: 700, y: 350 },
        data: { label: 'SQL DB', type: 'database' },
      },
    ],
    initialEdges: [],
    solutionNodes: [
      { id: 'user-1', type: 'userNode', position: { x: 50, y: 350 }, data: { label: 'Users', type: 'user' } },
      { id: 'lb-1', type: 'loadBalancerNode', position: { x: 200, y: 350 }, data: { label: 'Load Balancer', type: 'loadBalancer' } },
      { id: 'web-1', type: 'webServerNode', position: { x: 400, y: 150 }, data: { label: 'Web Server', type: 'webServer' } },
      { id: 'web-2', type: 'webServerNode', position: { x: 400, y: 250 }, data: { label: 'Web Server', type: 'webServer' } },
      { id: 'web-3', type: 'webServerNode', position: { x: 400, y: 350 }, data: { label: 'Web Server', type: 'webServer' } },
      { id: 'web-4', type: 'webServerNode', position: { x: 400, y: 450 }, data: { label: 'Web Server', type: 'webServer' } },
      { id: 'web-5', type: 'webServerNode', position: { x: 400, y: 550 }, data: { label: 'Web Server', type: 'webServer' } },
      { id: 'cache-1', type: 'cacheNode', position: { x: 600, y: 350 }, data: { label: 'Redis Cache', type: 'cache' } },
      { id: 'db-1', type: 'databaseNode', position: { x: 800, y: 350 }, data: { label: 'SQL DB', type: 'database' } },
    ],
    solutionEdges: [
      { id: 'se1', source: 'user-1', target: 'lb-1', animated: true },
      { id: 'se2', source: 'lb-1', target: 'web-1', animated: true },
      { id: 'se3', source: 'lb-1', target: 'web-2', animated: true },
      { id: 'se4', source: 'lb-1', target: 'web-3', animated: true },
      { id: 'se5', source: 'lb-1', target: 'web-4', animated: true },
      { id: 'se6', source: 'lb-1', target: 'web-5', animated: true },
      { id: 'se7', source: 'web-1', target: 'cache-1', animated: true },
      { id: 'se8', source: 'web-2', target: 'cache-1', animated: true },
      { id: 'se9', source: 'web-3', target: 'cache-1', animated: true },
      { id: 'se10', source: 'web-4', target: 'cache-1', animated: true },
      { id: 'se11', source: 'web-5', target: 'cache-1', animated: true },
      { id: 'se12', source: 'cache-1', target: 'db-1', animated: true },
    ],
    solution: {
      description: 'Scale out to 5 Web Servers, use a Load Balancer, and protect the DB with a Cache.',
      optimal: 'A 2,000 TPS spike requires a Load Balancer to distribute traffic across 5 Web Servers (400 TPS each, which strains them but they survive). The Cache is mandatory to prevent the DB from crashing under the massive load.',
      alternatives: 'You could use 10 Web Servers to keep them perfectly healthy, but that would cost $1,000 just for the web tier, leaving no budget for the DB and Cache. Accepting some strain (yellow state) is a valid cost-optimization strategy.',
    },
  },
];

interface GameState {
  currentLevelId: number;
  nodes: Node[];
  edges: Edge[];
  budget: number;
  spent: number;
  simulationStatus: 'idle' | 'running' | 'won' | 'lost';
  timeElapsed: number;
  currentTraffic: number;
  totalRequests: number;
  successfulRequests: number;
  availability: number;
  
  // Actions
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onReconnect: (oldEdge: Edge, newConnection: Connection) => void;
  addNode: (type: ComponentType, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  tick: () => void;
  loadLevel: (levelId: number) => void;
  calculateSpent: () => void;
  applySolution: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentLevelId: 1,
  nodes: LEVELS[0].initialNodes,
  edges: LEVELS[0].initialEdges,
  budget: LEVELS[0].budget,
  spent: LEVELS[0].initialNodes.reduce((total, node) => total + (COMPONENT_LIBRARY[node.data.type as ComponentType]?.cost || 0), 0),
  simulationStatus: 'idle',
  timeElapsed: 0,
  currentTraffic: 0,
  totalRequests: 0,
  successfulRequests: 0,
  availability: 100,

  applySolution: () => {
    const level = LEVELS.find((l) => l.id === get().currentLevelId);
    if (level) {
      const edges = level.solutionEdges.map(edge => ({
        ...edge,
        type: 'deletable'
      }));
      
      set({
        nodes: JSON.parse(JSON.stringify(level.solutionNodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        simulationStatus: 'idle',
        timeElapsed: 0,
        availability: 100,
        currentTraffic: 0,
        totalRequests: 0,
        successfulRequests: 0,
      });
      get().calculateSpent();
    }
  },

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    get().calculateSpent();
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ ...connection, type: 'deletable', animated: get().simulationStatus === 'running' }, get().edges),
    });
  },
  onReconnect: (oldEdge: Edge, newConnection: Connection) => {
    set({
      edges: reconnectEdge(oldEdge, newConnection, get().edges),
    });
  },
  addNode: (type: ComponentType, position: { x: number; y: number }) => {
    const spec = COMPONENT_LIBRARY[type];
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: `${type}Node`,
      position,
      data: { label: spec.name, type },
    };
    
    set((state) => {
      const newNodes = [...state.nodes, newNode];
      return { nodes: newNodes };
    });
    get().calculateSpent();
  },
  removeNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    }));
    get().calculateSpent();
  },
  removeEdge: (id: string) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    }));
  },
  calculateSpent: () => {
    const { nodes } = get();
    const spent = nodes.reduce((total, node) => {
      const type = node.data.type as ComponentType;
      return total + (COMPONENT_LIBRARY[type]?.cost || 0);
    }, 0);
    set({ spent });
  },
  startSimulation: () => {
    const { spent, budget } = get();
    if (spent > budget) {
      alert("Over budget! Remove some components.");
      return;
    }
    set({
      simulationStatus: 'running',
      timeElapsed: 0,
      totalRequests: 0,
      successfulRequests: 0,
      availability: 100,
      edges: get().edges.map(e => ({ ...e, animated: true })),
    });
  },
  stopSimulation: () => {
    set({
      simulationStatus: 'idle',
      edges: get().edges.map(e => ({ ...e, animated: false })),
    });
  },
  resetSimulation: () => {
    set({
      simulationStatus: 'idle',
      timeElapsed: 0,
      currentTraffic: 0,
      totalRequests: 0,
      successfulRequests: 0,
      availability: 100,
      edges: get().edges.map(e => ({ ...e, animated: false })),
    });
    // Reset node states
    set((state) => ({
      nodes: state.nodes.map(n => ({
        ...n,
        data: { ...n.data, status: 'healthy', currentLoad: 0 }
      }))
    }));
  },
  loadLevel: (levelId: number) => {
    const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    set({
      currentLevelId: level.id,
      nodes: level.initialNodes,
      edges: level.initialEdges,
      budget: level.budget,
      spent: 0,
      simulationStatus: 'idle',
      timeElapsed: 0,
      currentTraffic: 0,
      totalRequests: 0,
      successfulRequests: 0,
      availability: 100,
    });
    get().calculateSpent();
  },
  tick: () => {
    const state = get();
    if (state.simulationStatus !== 'running') return;

    const level = LEVELS.find((l) => l.id === state.currentLevelId)!;
    const newTime = state.timeElapsed + 1;
    
    const traffic = level.getTraffic(newTime);
    
    // --- SIMULATION ENGINE ---
    // 1. Reset node loads
    const nodeLoads: Record<string, number> = {};
    state.nodes.forEach(n => nodeLoads[n.id] = 0);
    
    // 2. Find User nodes and inject traffic
    const userNodes = state.nodes.filter(n => n.data.type === 'user');
    const trafficPerUser = userNodes.length > 0 ? traffic / userNodes.length : 0;
    
    userNodes.forEach(u => {
      nodeLoads[u.id] = trafficPerUser;
    });

    // 3. Propagate traffic (BFS)
    const queue = [...userNodes.map(n => n.id)];
    const visited = new Set<string>();
    
    // We need a way to track how much traffic successfully reaches the end.
    // Actually, traffic is successful if it's processed by a Web Server and DB/Cache without failing.
    // Let's simplify: Traffic flows User -> LB -> Web -> Cache -> DB.
    // We track total dropped packets.
    let totalDroppedThisTick = 0;

    // To handle DAG properly, we should process nodes in topological order, or just iterative propagation.
    // Iterative propagation:
    const nodeIncoming: Record<string, number> = {};
    state.nodes.forEach(n => nodeIncoming[n.id] = 0);
    userNodes.forEach(u => nodeIncoming[u.id] = trafficPerUser);

    const updatedNodes = state.nodes.map(node => {
      const type = node.data.type as ComponentType;
      const incoming = nodeIncoming[node.id] || 0;
      let processed = incoming;
      let dropped = 0;
      let status = 'healthy';

      if (type === 'user') {
        processed = incoming;
      } else if (type === 'loadBalancer') {
        if (incoming > COMPONENT_LIBRARY.loadBalancer.maxCapacity) {
          dropped = incoming - COMPONENT_LIBRARY.loadBalancer.maxCapacity;
          processed = COMPONENT_LIBRARY.loadBalancer.maxCapacity;
          status = 'strained';
        }
      } else if (type === 'webServer') {
        if (incoming > 300) {
          dropped = incoming * 0.5; // Drops 50%
          processed = incoming - dropped;
          status = 'failing';
        } else if (incoming > 200) {
          status = 'strained'; // High latency, but processes
          processed = incoming;
        } else {
          processed = incoming;
        }
      } else if (type === 'cache') {
        if (incoming > COMPONENT_LIBRARY.cache.maxCapacity) {
          dropped = incoming - COMPONENT_LIBRARY.cache.maxCapacity;
          processed = COMPONENT_LIBRARY.cache.maxCapacity;
          status = 'strained';
        }
      } else if (type === 'database') {
        if (incoming > COMPONENT_LIBRARY.database.maxCapacity) {
          dropped = incoming; // Locks up, drops 100%
          processed = 0;
          status = 'failing';
        } else {
          processed = incoming;
        }
      }

      totalDroppedThisTick += dropped;

      // Distribute processed traffic to children
      const outgoingEdges = state.edges.filter(e => e.source === node.id);
      if (outgoingEdges.length > 0) {
        // Load Balancer splits equally. Others might just pass along (or we assume LB is the only splitter for now)
        // If a WebServer connects to a DB, it passes its processed traffic to the DB.
        // If a WebServer connects to a Cache, it passes to Cache.
        // What if WebServer connects to both? Let's assume it passes all traffic to all outgoing edges (e.g. 1 DB = 100% traffic).
        // Actually, Load Balancer splits. Web Server passes 100% to its next hop.
        // Cache passes 10% to DB (cache miss).
        
        if (type === 'loadBalancer') {
          const split = processed / outgoingEdges.length;
          outgoingEdges.forEach(e => {
            nodeIncoming[e.target] = (nodeIncoming[e.target] || 0) + split;
          });
        } else if (type === 'cache') {
          // Cache passes 10% to DB
          const missTraffic = processed * 0.1;
          outgoingEdges.forEach(e => {
            nodeIncoming[e.target] = (nodeIncoming[e.target] || 0) + missTraffic;
          });
        } else {
          // Pass 100% to all outgoing (assuming linear flow User -> LB -> Web -> DB)
          outgoingEdges.forEach(e => {
            nodeIncoming[e.target] = (nodeIncoming[e.target] || 0) + processed;
          });
        }
      } else {
        // If it's a WebServer with no DB, it fails to process?
        // Let's say if it's a WebServer and has no outgoing, it just consumes it (success).
        // But if it's supposed to hit a DB and doesn't, maybe that's fine for MVP.
      }

      return {
        ...node,
        data: {
          ...node.data,
          currentLoad: incoming,
          status,
        }
      };
    });

    // We need to do this in topological order to be accurate.
    // For MVP, a simple 2-pass or just trusting the order of nodes might be flawed.
    // Let's implement a proper topological sort or iterative propagation.
    
    // Better Propagation:
    // 1. Find root nodes (User)
    // 2. Queue = [{id: user.id, traffic: trafficPerUser}]
    // 3. While queue not empty:
    //    pop node, add traffic to its incoming.
    //    calculate processed, dropped.
    //    push children to queue with their share of processed traffic.
    // This handles DAGs well.

    let totalDropped = 0;
    const incomingMap: Record<string, number> = {};
    state.nodes.forEach(n => incomingMap[n.id] = 0);
    
    userNodes.forEach(u => incomingMap[u.id] = trafficPerUser);
    
    // Topo sort
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};
    state.nodes.forEach(n => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });
    state.edges.forEach(e => {
      if (adj[e.source]) {
        adj[e.source].push(e.target);
        inDegree[e.target]++;
      }
    });

    const topoQueue = state.nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
    const sortedNodes: string[] = [];
    while (topoQueue.length > 0) {
      const curr = topoQueue.shift()!;
      sortedNodes.push(curr);
      adj[curr].forEach(neighbor => {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) topoQueue.push(neighbor);
      });
    }

    // Handle cycles by adding remaining nodes
    state.nodes.forEach(n => {
      if (!sortedNodes.includes(n.id)) sortedNodes.push(n.id);
    });

    const finalNodes = [...state.nodes];
    
    sortedNodes.forEach(nodeId => {
      const nodeIndex = finalNodes.findIndex(n => n.id === nodeId);
      if (nodeIndex === -1) return;
      const node = finalNodes[nodeIndex];
      const type = node.data.type as ComponentType;
      const incoming = incomingMap[nodeId] || 0;
      
      let processed = incoming;
      let dropped = 0;
      let status = 'healthy';

      if (type === 'user') {
        processed = incoming;
      } else if (type === 'loadBalancer') {
        if (incoming > COMPONENT_LIBRARY.loadBalancer.maxCapacity) {
          dropped = incoming - COMPONENT_LIBRARY.loadBalancer.maxCapacity;
          processed = COMPONENT_LIBRARY.loadBalancer.maxCapacity;
          status = 'strained';
        }
      } else if (type === 'webServer') {
        if (incoming > 300) {
          dropped = incoming * 0.5;
          processed = incoming - dropped;
          status = 'failing';
        } else if (incoming > 200) {
          status = 'strained';
          processed = incoming;
        }
      } else if (type === 'cache') {
        if (incoming > COMPONENT_LIBRARY.cache.maxCapacity) {
          dropped = incoming - COMPONENT_LIBRARY.cache.maxCapacity;
          processed = COMPONENT_LIBRARY.cache.maxCapacity;
          status = 'strained';
        }
      } else if (type === 'database') {
        if (incoming > COMPONENT_LIBRARY.database.maxCapacity) {
          dropped = incoming; // Lock up
          processed = 0;
          status = 'failing';
        }
      }

      totalDropped += dropped;

      // Distribute
      const children = adj[nodeId];
      if (children.length > 0) {
        if (type === 'loadBalancer') {
          const split = processed / children.length;
          children.forEach(c => incomingMap[c] = (incomingMap[c] || 0) + split);
        } else if (type === 'cache') {
          const miss = processed * 0.1;
          children.forEach(c => incomingMap[c] = (incomingMap[c] || 0) + miss);
        } else {
          children.forEach(c => incomingMap[c] = (incomingMap[c] || 0) + processed);
        }
      } else {
        // If it's a WebServer or LoadBalancer and has no children, traffic is dropped
        if (type === 'webServer' || type === 'loadBalancer') {
          totalDropped += processed;
          status = 'failing';
        }
      }

      finalNodes[nodeIndex] = {
        ...node,
        data: {
          ...node.data,
          currentLoad: incoming,
          status,
        }
      };
    });

    // Check if traffic even reached a WebServer
    // If user is not connected to anything, all traffic is dropped.
    let unhandledTraffic = 0;
    userNodes.forEach(u => {
      if (adj[u.id].length === 0) unhandledTraffic += incomingMap[u.id];
    });
    totalDropped += unhandledTraffic;

    const successfulThisTick = Math.max(0, traffic - totalDropped);
    const newTotalReq = state.totalRequests + traffic;
    const newSuccessReq = state.successfulRequests + successfulThisTick;
    const newAvailability = newTotalReq > 0 ? (newSuccessReq / newTotalReq) * 100 : 100;

    const hasCrashed = finalNodes.some(n => 
      (n.data.type === 'webServer' || n.data.type === 'database') && n.data.status === 'failing'
    );

    // Early finish logic: if system is healthy at max traffic for 10s
    const isAtMaxTraffic = traffic >= level.maxTraffic;
    const isHealthy = !hasCrashed && finalNodes.every(n => n.data.status !== 'failing');
    
    // We'll use a simple heuristic: if we've survived at least 10s of the spike
    // and we're healthy, we can finish.
    // For Level 1: spike starts at 10s, duration 30s. Surviving until 20s is enough.
    // For Level 2: constant traffic, duration 25s. Surviving until 15s is enough.
    // For Level 3: spike starts at 10s, duration 40s. Surviving until 25s is enough.
    const spikeDurationSurvived = isAtMaxTraffic && isHealthy ? (newTime - (level.id === 2 ? 0 : 10)) : 0;
    const isFinishedEarly = isHealthy && spikeDurationSurvived >= 10;
    const isFinished = newTime >= level.duration || isFinishedEarly;

    if (hasCrashed || isFinished) {
      const won = newAvailability >= 90 && !hasCrashed;
      set({
        simulationStatus: won ? 'won' : 'lost',
        timeElapsed: newTime,
        currentTraffic: traffic,
        nodes: finalNodes,
        totalRequests: newTotalReq,
        successfulRequests: newSuccessReq,
        availability: newAvailability,
        edges: state.edges.map(e => ({ ...e, animated: false })),
      });
      return;
    }

    set({
      timeElapsed: newTime,
      currentTraffic: traffic,
      nodes: finalNodes,
      totalRequests: newTotalReq,
      successfulRequests: newSuccessReq,
      availability: newAvailability,
    });
  },
}));
