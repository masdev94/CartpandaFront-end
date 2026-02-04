import { memo } from 'react';
import { MiniMap as ReactFlowMiniMap } from '@xyflow/react';
import type { FunnelNodeType } from '../types';
import { nodeTypeColors } from '../theme';

function getNodeColor(node: { type?: string }): string {
  const t = node.type as FunnelNodeType;
  return (nodeTypeColors[t]?.dot ?? '#64748B');
}

function MiniMapComponent() {
  return (
    <ReactFlowMiniMap
      nodeColor={getNodeColor}
      nodeStrokeWidth={3}
      pannable
      zoomable
      className="!bg-slate-50 !border !border-slate-200 !rounded-lg !shadow-sm"
      aria-label="Canvas mini-map"
    />
  );
}

export const MiniMap = memo(MiniMapComponent);
