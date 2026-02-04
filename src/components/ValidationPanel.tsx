import { memo, useMemo } from 'react';
import type { FunnelNode, FunnelEdge, ValidationIssue } from '../types';
import { validateFunnel } from '../utils/validation';

interface ValidationPanelProps {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
  open: boolean;
  onNodeFocus?: (nodeId: string) => void;
}

/** Satisfied rule messages when things are OK (for ✅ list) */
function getSatisfiedMessages(nodes: FunnelNode[], edges: FunnelEdge[]): string[] {
  const out: string[] = [];
  const thankYous = nodes.filter((n) => n.data.nodeType === 'thankYou');
  const outgoingByNode = new Map<string, number>();
  edges.forEach((e) => outgoingByNode.set(e.source, (outgoingByNode.get(e.source) ?? 0) + 1));
  thankYous.forEach((n) => {
    if ((outgoingByNode.get(n.id) ?? 0) === 0) {
      out.push(`Thank You has no out edges`);
    }
  });
  if (out.length > 1) out.length = 1; // one line is enough
  return out;
}

function ValidationPanelComponent({ nodes, edges, open, onNodeFocus }: ValidationPanelProps) {
  const issues = useMemo(() => validateFunnel(nodes, edges), [nodes, edges]);
  const satisfied = useMemo(() => getSatisfiedMessages(nodes, edges), [nodes, edges]);

  if (!open) return null;

  return (
    <div
      className="absolute right-4 top-4 z-20 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
      role="region"
      aria-label="Validation"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
        <h3 className="text-sm font-semibold text-slate-800">Validation</h3>
      </div>
      <ul className="max-h-56 overflow-y-auto py-2" role="list">
        {issues.map((issue) => (
          <IssueRow key={issue.id} issue={issue} onNodeFocus={onNodeFocus} />
        ))}
        {issues.length === 0 && satisfied.length > 0 && (
          <li className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-700">
            <span aria-hidden>✅</span>
            {satisfied[0]}
          </li>
        )}
        {issues.length === 0 && satisfied.length === 0 && nodes.length > 0 && (
          <li className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600">
            <span aria-hidden>✅</span>
            Funnel rules OK
          </li>
        )}
        {issues.length === 0 && nodes.length === 0 && (
          <li className="px-3 py-2 text-sm text-slate-500">Add pages to validate.</li>
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
        ${issue.nodeId && onNodeFocus ? 'cursor-pointer hover:bg-slate-50' : ''}
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
      <span className="shrink-0" aria-hidden>
        ⚠︎
      </span>
      <span className={issue.type === 'error' ? 'text-red-800' : 'text-amber-800'}>
        {issue.message}
      </span>
    </li>
  );
}

export const ValidationPanel = memo(ValidationPanelComponent);
