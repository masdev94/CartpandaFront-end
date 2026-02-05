import { memo, useMemo } from 'react';
import { HiOutlineCheckCircle, HiOutlineXMark, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import type { FunnelNode, FunnelEdge, ValidationIssue } from '../types';
import { validateFunnel } from '../utils/validation';

interface ValidationPanelProps {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
  open: boolean;
  onNodeFocus?: (nodeId: string) => void;
  onClose?: () => void;
}

function ValidationPanelComponent({ nodes, edges, open, onNodeFocus, onClose }: ValidationPanelProps) {
  const issues = useMemo(() => validateFunnel(nodes, edges), [nodes, edges]);

  if (!open) return null;

  const statusMessage =
    issues.length > 0
      ? null
      : nodes.length === 0
        ? 'Add pages to validate.'
        : 'Funnel rules OK';

  return (
    <div
      className="absolute right-4 top-4 z-20 left-4 w-auto max-w-[18rem] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800 dark:shadow-xl dark:shadow-black/20 sm:left-auto sm:max-w-none sm:w-80"
      role="region"
      aria-label="Validation"
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700/80">
        <h3 className="px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Validation</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600"
            aria-label="Close validation"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        )}
      </div>
      <ul className="max-h-56 overflow-y-auto py-2" role="list">
        {issues.map((issue) => (
          <IssueRow key={issue.id} issue={issue} onNodeFocus={onNodeFocus} />
        ))}
        {statusMessage && (
          <li className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
            <HiOutlineCheckCircle className="h-5 w-5 shrink-0" aria-hidden />
            {statusMessage}
          </li>
        )}
      </ul>
    </div>
  );
}

function IssueRow({
  issue,
  onNodeFocus,
}: {
  issue: ValidationIssue;
  onNodeFocus?: (nodeId: string) => void;
}) {
  const onClick = () => issue.nodeId && onNodeFocus?.(issue.nodeId);

  return (
    <li
      className={`
        flex items-start gap-2 px-3 py-2 text-sm
        ${issue.nodeId && onNodeFocus ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50' : ''}
      `}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && issue.nodeId) {
          e.preventDefault();
          onClick();
        }
      }}
      role={issue.nodeId ? 'button' : 'listitem'}
      tabIndex={issue.nodeId ? 0 : undefined}
    >
      <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" aria-hidden />
      <span className={issue.type === 'error' ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-200'}>
        {issue.message}
      </span>
    </li>
  );
}

export const ValidationPanel = memo(ValidationPanelComponent);
