import { memo, useCallback } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FunnelNodeData } from '../types';
import { NODE_COLORS, NODE_ICON_COMPONENTS } from '../constants/nodeTemplates';

type Props = NodeProps & { data: FunnelNodeData };


function FunnelNodeComponent({ data, selected }: Props) {
  const nodeType = data.nodeType;
  const colors = NODE_COLORS[nodeType];
  const IconComponent = NODE_ICON_COMPONENTS[nodeType];
  const isThankYou = nodeType === 'thankYou';
  const isSalesPage = nodeType === 'salesPage';
  const hasWarning = Boolean(data.hasWarning);

  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <div
      className={`
        relative w-[220px] overflow-visible rounded-xl border border-slate-200 bg-white shadow-md
        transition-all duration-200 ease-out
        dark:border-slate-600 dark:bg-slate-800
        ${selected ? 'ring-2 ring-indigo-500 ring-offset-2 shadow-lg dark:ring-offset-slate-900' : 'hover:shadow-lg'}
      `}
      role="group"
      aria-label={`${data.label} page`}
    >
      <div className="overflow-hidden rounded-xl">
        <div className={`h-1 w-full rounded-t-xl ${colors.border.replace('border-', 'bg-')}`} aria-hidden />
          <div className="p-3 pt-2.5">
            <div className="mb-3 flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${colors.bg} ${colors.border} dark:bg-slate-700 dark:border-slate-600`}
                aria-hidden
              >
                <IconComponent className={`h-4 w-4 ${colors.text} dark:text-slate-200`} />
              </span>
              <h3 className={`min-w-0 flex-1 truncate font-semibold text-sm ${colors.text} dark:text-slate-100`}>
                {data.label}
              </h3>
              {hasWarning && (
                <HiOutlineExclamationTriangle
                  className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400"
                  title="This node has a validation warning"
                  aria-label="Warning"
                />
              )}
            </div>
          <div className="mb-3 flex h-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700/60">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">Preview</span>
          </div>
          <button
            type="button"
            onClick={stopProp}
            className={`flex min-h-[40px] w-full items-center justify-center rounded-lg py-2.5 px-3 text-sm font-medium shadow-sm transition-opacity hover:opacity-90 touch-manipulation ${colors.btn}`}
            tabIndex={-1}
            aria-hidden
          >
            {data.buttonLabel}
          </button>
          </div>
      </div>

      {!isSalesPage && (
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          className="!left-0 !top-1/2 !z-10 !h-11 !w-11 !-translate-y-1/2 !rounded-full !border-2 !border-white !bg-slate-400 hover:!bg-indigo-500 dark:!border-slate-700 dark:!bg-slate-500 md:!h-3 md:!w-3"
          aria-label="Incoming connection"
        />
      )}

      {!isThankYou && (
        <Handle
          type="source"
          position={Position.Right}
          id="source"
          className="!right-0 !top-1/2 !z-10 !h-11 !w-11 !-translate-y-1/2 !rounded-full !border-2 !border-white !bg-slate-500 hover:!bg-indigo-500 dark:!border-slate-700 dark:!bg-slate-500 md:!h-3 md:!w-3"
          aria-label="Outgoing connection"
        />
      )}
    </div>
  );
}

export const FunnelNode = memo(FunnelNodeComponent);
