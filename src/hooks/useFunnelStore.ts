import { useCallback, useState, useEffect, useRef } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import type { FunnelNode, FunnelEdge, FunnelNodeType, FunnelState, FunnelNodeData } from '../types';
import { DEFAULT_LABELS, DEFAULT_BUTTON_LABELS } from '../constants/nodeTemplates';
import { saveFunnelToStorage, loadFunnelFromStorage } from '../utils/storage';
import { isValidConnection } from '../utils/validation';

// Track indices for auto-incrementing labels
interface NodeCounters {
  upsell: number;
  downsell: number;
}

export function useFunnelStore() {
  // Use generic Node and Edge types to avoid type conflicts with React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FunnelNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  // Track counters for auto-incrementing labels
  const countersRef = useRef<NodeCounters>({ upsell: 0, downsell: 0 });
  
  // Undo/Redo history
  const [history, setHistory] = useState<FunnelState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFunnelFromStorage();
    if (saved && saved.nodes.length > 0) {
      setNodes(saved.nodes);
      setEdges(saved.edges);
      
      // Restore counters from existing nodes
      saved.nodes.forEach(node => {
        if (node.data.nodeType === 'upsell' && node.data.index) {
          countersRef.current.upsell = Math.max(countersRef.current.upsell, node.data.index);
        }
        if (node.data.nodeType === 'downsell' && node.data.index) {
          countersRef.current.downsell = Math.max(countersRef.current.downsell, node.data.index);
        }
      });
      
      // Initialize history
      setHistory([saved]);
      setHistoryIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Save to localStorage when state changes
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const state: FunnelState = { nodes, edges };
      saveFunnelToStorage(state);
      
      // Add to history (but not during undo/redo)
      if (!isUndoRedoRef.current) {
        setHistory(prev => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(state);
          // Limit history size
          if (newHistory.length > 50) {
            newHistory.shift();
            return newHistory;
          }
          return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
      }
      isUndoRedoRef.current = false;
    }
  }, [nodes, edges, historyIndex]);
  
  // Generate label with auto-increment for upsells and downsells
  const generateLabel = useCallback((nodeType: FunnelNodeType): { label: string; index?: number } => {
    if (nodeType === 'upsell') {
      countersRef.current.upsell++;
      return { label: `Upsell ${countersRef.current.upsell}`, index: countersRef.current.upsell };
    }
    if (nodeType === 'downsell') {
      countersRef.current.downsell++;
      return { label: `Downsell ${countersRef.current.downsell}`, index: countersRef.current.downsell };
    }
    return { label: DEFAULT_LABELS[nodeType] };
  }, []);
  
  // Add a new node to the canvas
  const addNode = useCallback((nodeType: FunnelNodeType, position: { x: number; y: number }) => {
    const { label, index } = generateLabel(nodeType);
    
    const newNode: FunnelNode = {
      id: nanoid(),
      type: nodeType,
      position,
      data: {
        label,
        nodeType,
        buttonLabel: DEFAULT_BUTTON_LABELS[nodeType],
        index,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, [generateLabel, setNodes]);
  
  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    const error = isValidConnection(sourceNode, targetNode, edges);
    if (error) {
      // Could show a toast here, but for now just prevent the connection
      console.warn('Invalid connection:', error);
      return;
    }
    
    setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: 'arrowclosed' as const },
    }, eds));
  }, [nodes, edges, setEdges]);
  
  // Handle node changes - just pass through the onNodesChange from React Flow
  // Handle edge changes - just pass through the onEdgesChange from React Flow
  
  // Delete a node
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);
  
  // Delete an edge
  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  }, [setEdges]);
  
  // Clear all nodes and edges
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    countersRef.current = { upsell: 0, downsell: 0 };
  }, [setNodes, setEdges]);
  
  // Load state from imported JSON
  const loadState = useCallback((state: FunnelState) => {
    setNodes(state.nodes);
    setEdges(state.edges);
    
    // Restore counters
    countersRef.current = { upsell: 0, downsell: 0 };
    state.nodes.forEach(node => {
      if (node.data.nodeType === 'upsell' && node.data.index) {
        countersRef.current.upsell = Math.max(countersRef.current.upsell, node.data.index);
      }
      if (node.data.nodeType === 'downsell' && node.data.index) {
        countersRef.current.downsell = Math.max(countersRef.current.downsell, node.data.index);
      }
    });
  }, [setNodes, setEdges]);
  
  // Get current state for export
  const getState = useCallback((): FunnelState => {
    return { nodes, edges };
  }, [nodes, edges]);
  
  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoRef.current = true;
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);
  
  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);
  
  // Check if undo/redo is available
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  return {
    nodes: nodes as FunnelNode[],
    edges: edges as FunnelEdge[],
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    deleteEdge,
    clearCanvas,
    loadState,
    getState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
