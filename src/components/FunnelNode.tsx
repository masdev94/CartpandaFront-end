import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FunnelNodeData } from '../types';
import { NODE_COLORS, NODE_ICONS } from '../constants/nodeTemplates';

type Props = NodeProps & { data: FunnelNodeData };

/**
 * Node card: icon + title (+ optional ⚠️), thumbnail, primary button label.
 * ○ Left = incoming (target). ● Right = outgoing (source). Thank You has no outgoing.
 */
function FunnelNodeComponent({ data, selected }: Props) {
  const nodeType = data.nodeType;
  const colors = NODE_COLORS[nodeType];
  const icon = NODE_ICONS[nodeType];
  const isThankYou = nodeType === 'thankYou';
  const hasWarning = Boolean(data.hasWarning);

  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <div
      className={`
        relative w-[200px] rounded-lg border-2 bg-white shadow-md transition-shadow
        ${colors.border}
        ${selected ? 'ring-2 ring-indigo-500 ring-offset-2 shadow-lg' : ''}
      `}
      role="button"
      aria-label={`${data.label} page`}
      tabIndex={0}
    >
      {/* Incoming: left ○ */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="!left-0 !top-1/2 !-translate-y-1/2 !h-3 !w-3 !rounded-full !border-2 !border-white !bg-slate-400 hover:!bg-indigo-500"
        aria-label="Incoming connection"
      />

      <div className="px-3 py-3 pl-5 pr-5">
        {/* Title row: icon + label + optional warning */}
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg leading-none" aria-hidden>
            {icon}
          </span>
          <h3 className={`min-w-0 flex-1 truncate font-semibold text-sm ${colors.text}`}>
            {data.label}
          </h3>
          {hasWarning && (
            <span
              className="shrink-0 text-amber-500"
              title="This node has a validation warning"
              aria-label="Warning"
            >
              ⚠︎
            </span>
          )}
        </div>
        {/* Thumbnail placeholder */}
        <div className="mb-2 flex h-14 items-center justify-center rounded border border-slate-200 bg-slate-50/80">
          <span className="text-xs text-slate-400">thumbnail</span>
        </div>
        {/* Primary button label (static) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={stopProp}
            className={`w-full rounded py-2 px-3 text-xs font-medium ${colors.btn}`}
            tabIndex={-1}
            aria-hidden
          >
            {data.buttonLabel}
          </button>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">Primary button: &quot;{data.buttonLabel}&quot;</p>
      </div>

      {/* Outgoing: right ●. Thank You has no outgoing (×) */}
      {!isThankYou && (
        <Handle
          type="source"
          position={Position.Right}
          id="source"
          className="!right-0 !top-1/2 !-translate-y-1/2 !h-3 !w-3 !rounded-full !border-2 !border-white !bg-slate-500 hover:!bg-indigo-500"
          aria-label="Outgoing connection"
        />
      )}
    </div>
  );
}

export const FunnelNode = memo(FunnelNodeComponent);
