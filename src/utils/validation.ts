import type { FunnelNode, FunnelEdge, ValidationIssue, FunnelNodeData } from '../types';
import type { Node, Edge } from '@xyflow/react';

type ValidatableNode = FunnelNode | Node<FunnelNodeData>;

export function validateFunnel(nodes: ValidatableNode[], edges: (FunnelEdge | Edge)[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const outgoingEdges = new Map<string, FunnelEdge[]>();
  const incomingEdges = new Map<string, FunnelEdge[]>();

  for (const edge of edges) {
    if (!outgoingEdges.has(edge.source)) outgoingEdges.set(edge.source, []);
    outgoingEdges.get(edge.source)!.push(edge);
    if (!incomingEdges.has(edge.target)) incomingEdges.set(edge.target, []);
    incomingEdges.get(edge.target)!.push(edge);
  }

  for (const node of nodes) {
    const nodeOutgoing = outgoingEdges.get(node.id) || [];
    const nodeIncoming = incomingEdges.get(node.id) || [];
    const nodeType = node.data.nodeType;
    
    if (nodeType === 'thankYou' && nodeOutgoing.length > 0) {
      issues.push({
        id: `thank-you-outgoing-${node.id}`,
        type: 'error',
        message: `"${node.data.label}" should not have outgoing connections`,
        nodeId: node.id,
      });
    }
    
    if (nodeType === 'salesPage') {
      if (nodeOutgoing.length === 0) {
        issues.push({
          id: `sales-no-outgoing-${node.id}`,
          type: 'warning',
          message: `"${node.data.label}" should connect to an Order Page`,
          nodeId: node.id,
        });
      } else if (nodeOutgoing.length > 1) {
        issues.push({
          id: `sales-multiple-outgoing-${node.id}`,
          type: 'warning',
          message: `"${node.data.label}" has multiple outgoing connections (typically should have one)`,
          nodeId: node.id,
        });
      }
    }
    
    if (nodeOutgoing.length === 0 && nodeIncoming.length === 0 && nodes.length > 1) {
      issues.push({
        id: `orphan-${node.id}`,
        type: 'warning',
        message: `"${node.data.label}" is not connected to any other node`,
        nodeId: node.id,
      });
    }
  }

  const salesPages = nodes.filter((n) => n.data.nodeType === 'salesPage');
  if (salesPages.length > 1) {
    const salesPagesWithNoIncoming = salesPages.filter(
      (sp) => (incomingEdges.get(sp.id) || []).length === 0
    );
    if (salesPagesWithNoIncoming.length > 0) {
      issues.push({
        id: 'multiple-starting-points',
        type: 'warning',
        message: 'Multiple starting points detected. Consider having only one Sales Page as entry.',
      });
    }
  }

  return issues;
}

export function isValidConnection(
  sourceNode: ValidatableNode | undefined,
  targetNode: ValidatableNode | undefined,
  existingEdges: (FunnelEdge | Edge)[]
): string | null {
  if (!sourceNode || !targetNode) {
    return 'Invalid nodes';
  }
  
  if (sourceNode.id === targetNode.id) {
    return 'Cannot connect a node to itself';
  }
  
  const existingConnection = existingEdges.find(
    edge => edge.source === sourceNode.id && edge.target === targetNode.id
  );
  if (existingConnection) {
    return 'Connection already exists';
  }
  
  if (sourceNode.data.nodeType === 'thankYou') {
    return 'Thank You pages cannot have outgoing connections';
  }
  
  return null;
}
