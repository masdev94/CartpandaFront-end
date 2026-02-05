import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import { NodeType, FunnelNode, FunnelEdge, FunnelState } from '../types';
import { NODE_TYPES, STORAGE_KEY } from '../constants/nodeTypes';

interface FunnelStore {
  nodes: Node[];
  edges: Edge[];
  counters: Record<NodeType, number>;
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  
  exportFunnel: () => string;
  importFunnel: (json: string) => void;
  saveFunnel: () => void;
  loadFunnel: () => void;
  resetFunnel: () => void;
}

const initialCounters: Record<NodeType, number> = {
  salesPage: 0,
  orderPage: 0,
  upsell: 0,
  downsell: 0,
  thankYou: 0,
};

const generateNodeLabel = (type: NodeType, counter: number): string => {
  const config = NODE_TYPES[type];
  
  if (type === 'upsell' || type === 'downsell') {
    return `${config.label} ${counter}`;
  }
  
  return config.label;
};

export const useFunnelStore = create<FunnelStore>((set, get) => ({
  nodes: [],
  edges: [],
  counters: { ...initialCounters },

  setNodes: (nodes) => set({ nodes }),
  
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    const newEdge = {
      ...connection,
      id: `edge-${connection.source}-${connection.target}`,
      type: 'smoothstep',
      animated: true,
    };
    
    set({
      edges: addEdge(newEdge, get().edges),
    });
    
    // Auto-save after connection
    setTimeout(() => get().saveFunnel(), 100);
  },

  addNode: (type, position) => {
    const { nodes, counters } = get();
    const config = NODE_TYPES[type];
    
    // Increment counter for this type
    const newCounter = counters[type] + 1;
    const newCounters = { ...counters, [type]: newCounter };
    
    const nodeLabel = generateNodeLabel(type, newCounter);
    
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'customNode',
      position,
      data: {
        label: nodeLabel,
        type,
        buttonLabel: config.defaultButtonLabel,
        icon: config.icon,
      },
    };

    set({
      nodes: [...nodes, newNode],
      counters: newCounters,
    });
    
    // Auto-save after adding node
    setTimeout(() => get().saveFunnel(), 100);
  },

  deleteNode: (nodeId) => {
    const { nodes, edges } = get();
    
    set({
      nodes: nodes.filter((node) => node.id !== nodeId),
      edges: edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    });
    
    // Auto-save after deletion
    setTimeout(() => get().saveFunnel(), 100);
  },

  deleteEdge: (edgeId) => {
    const { edges } = get();
    
    set({
      edges: edges.filter((edge) => edge.id !== edgeId),
    });
    
    // Auto-save after deletion
    setTimeout(() => get().saveFunnel(), 100);
  },

  exportFunnel: () => {
    const { nodes, edges, counters } = get();
    const funnelData: FunnelState = {
      nodes: nodes as FunnelNode[],
      edges: edges as FunnelEdge[],
      counters,
    };
    return JSON.stringify(funnelData, null, 2);
  },

  importFunnel: (json) => {
    try {
      const funnelData: FunnelState = JSON.parse(json);
      
      set({
        nodes: funnelData.nodes || [],
        edges: funnelData.edges || [],
        counters: funnelData.counters || { ...initialCounters },
      });
      
      // Save to localStorage
      get().saveFunnel();
    } catch (error) {
      console.error('Failed to import funnel:', error);
      alert('Failed to import funnel. Please check the JSON format.');
    }
  },

  saveFunnel: () => {
    const { nodes, edges, counters } = get();
    const funnelData: FunnelState = {
      nodes: nodes as FunnelNode[],
      edges: edges as FunnelEdge[],
      counters,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(funnelData));
  },

  loadFunnel: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const funnelData: FunnelState = JSON.parse(saved);
        set({
          nodes: funnelData.nodes || [],
          edges: funnelData.edges || [],
          counters: funnelData.counters || { ...initialCounters },
        });
      }
    } catch (error) {
      console.error('Failed to load funnel:', error);
    }
  },

  resetFunnel: () => {
    set({
      nodes: [],
      edges: [],
      counters: { ...initialCounters },
    });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
