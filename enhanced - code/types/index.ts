export type NodeType = 'salesPage' | 'orderPage' | 'upsell' | 'downsell' | 'thankYou';

export interface NodeData {
  label: string;
  type: NodeType;
  buttonLabel: string;
  icon?: string;
}

export interface FunnelNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface FunnelEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, unknown>;
}

export interface ValidationIssue {
  nodeId?: string;
  type: 'error' | 'warning';
  message: string;
}

export interface NodeTypeConfig {
  type: NodeType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  defaultButtonLabel: string;
  description: string;
}

export interface FunnelState {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
  counters: Record<NodeType, number>;
}
