import { memo } from 'react';
import { MiniMap as ReactFlowMiniMap } from '@xyflow/react';
import type { FunnelNodeType } from '../types';

// Colors for minimap nodes
const nodeColorMap: Record<FunnelNodeType, string> = {
  salesPage: '#3B82F6',    // blue-500
  orderPage: '#22C55E',    // green-500
  upsell: '#A855F7',       // purple-500
  downsell: '#F97316',     // orange-500
  thankYou: '#10B981',     // emerald-500
};

function getNodeColor(node: { type?: string }): string {
  const nodeType = node.type as FunnelNodeType;
  return nodeColorMap[nodeType] || '#6B7280';
}

/**
 * Mini-map component for the funnel builder.
 * Shows a bird's-eye view of the canvas with colored nodes.
 */
function MiniMapComponent() {
  return (
    <ReactFlowMiniMap
      nodeColor={getNodeColor}
      nodeStrokeWidth={3}
      pannable
      zoomable
      className="!bg-gray-50 !border !border-gray-200 !rounded-lg !shadow-md"
      aria-label="Canvas mini-map showing overview of all nodes"
    />
  );
}

export const MiniMap = memo(MiniMapComponent);
