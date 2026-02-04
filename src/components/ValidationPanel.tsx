import { memo, useMemo } from 'react';
import type { FunnelNode, FunnelEdge, ValidationIssue } from '../types';
import { validateFunnel, countIssues } from '../utils/validation';

interface ValidationPanelProps {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
  onNodeFocus?: (nodeId: string) => void;
}

/**
 * Panel that displays validation issues for the current funnel.
 * Shows errors and warnings with clickable links to problematic nodes.
 */
function ValidationPanelComponent({ nodes, edges, onNodeFocus }: ValidationPanelProps) {
  const issues = useMemo(() => validateFunnel(nodes, edges), [nodes, edges]);
  const { errors, warnings } = useMemo(() => countIssues(issues), [issues]);

  if (issues.length === 0) {
    return (
      <div
        className="absolute bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 shadow-md max-w-xs"
        role="status"
        aria-label="Funnel validation status"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-green-700">
            {nodes.length === 0 ? 'Add pages to start building' : 'Funnel looks good!'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm overflow-hidden"
      role="region"
      aria-label="Funnel validation issues"
    >
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Validation
          </h3>
          <div className="flex items-center gap-2 text-xs">
            {errors > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {errors} error{errors !== 1 ? 's' : ''}
              </span>
            )}
            {warnings > 0 && (
              <span className="flex items-center gap-1 text-yellow-600">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {warnings} warning{warnings !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Issues list */}
      <ul className="max-h-48 overflow-y-auto" role="list" aria-label="Validation issues">
        {issues.map((issue) => (
          <IssueItem key={issue.id} issue={issue} onNodeFocus={onNodeFocus} />
        ))}
      </ul>
    </div>
  );
}

interface IssueItemProps {
  issue: ValidationIssue;
  onNodeFocus?: (nodeId: string) => void;
}

const IssueItem = memo(function IssueItem({ issue, onNodeFocus }: IssueItemProps) {
  const isError = issue.type === 'error';

  const handleClick = () => {
    if (issue.nodeId && onNodeFocus) {
      onNodeFocus(issue.nodeId);
    }
  };

  return (
    <li
      className={`
        px-4 py-2 border-b border-gray-100 last:border-b-0
        ${issue.nodeId && onNodeFocus ? 'cursor-pointer hover:bg-gray-50' : ''}
      `}
      onClick={handleClick}
      role={issue.nodeId ? 'button' : 'listitem'}
      tabIndex={issue.nodeId ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && issue.nodeId) {
          handleClick();
        }
      }}
    >
      <div className="flex items-start gap-2">
        {isError ? (
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        <span className={`text-sm ${isError ? 'text-red-700' : 'text-yellow-700'}`}>
          {issue.message}
        </span>
      </div>
    </li>
  );
});

export const ValidationPanel = memo(ValidationPanelComponent);
