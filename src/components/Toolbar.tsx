import { memo, useCallback, useRef } from 'react';
import type { FunnelState } from '../types';
import { exportFunnelAsJson, importFunnelFromJson } from '../utils/storage';

interface ToolbarProps {
  onImport: (state: FunnelState) => void;
  onExport: () => FunnelState;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  validationOpen: boolean;
  onToggleValidation: () => void;
  validationIssueCount: number;
}

const btn =
  'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50';

function ToolbarComponent({
  onImport,
  onExport,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  validationOpen,
  onToggleValidation,
  validationIssueCount,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const state = onExport();
    exportFunnelAsJson(state, `funnel-${new Date().toISOString().slice(0, 10)}.json`);
  }, [onExport]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const state = await importFunnelFromJson(file);
      if (state) onImport(state);
      else alert('Invalid file. Please choose a funnel JSON export.');
      e.target.value = '';
    },
    [onImport]
  );

  const handleClear = useCallback(() => {
    if (window.confirm('Clear the entire canvas? This cannot be undone.')) onClear();
  }, [onClear]);

  return (
    <header
      className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 shadow-sm"
      role="toolbar"
      aria-label="Funnel builder toolbar"
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-800">
          Cartpanda Funnel Builder
        </h1>
        <div className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`${btn} text-slate-500 hover:bg-slate-100`}
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
          >
            <UndoIcon />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`${btn} text-slate-500 hover:bg-slate-100`}
            aria-label="Redo"
            title="Redo (Ctrl+Shift+Z)"
          >
            <RedoIcon />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleExport}
          className={`${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
          aria-label="Export JSON"
        >
          Export
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className={`${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
          aria-label="Import JSON"
        >
          Import
        </button>
        <button
          type="button"
          onClick={onToggleValidation}
          className={`${btn} relative border ${validationOpen ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
          aria-label="Validation"
          aria-expanded={validationOpen}
        >
          <span aria-hidden>⚠︎</span>
          Validation
          {validationIssueCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {validationIssueCount}
            </span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden
        />
        <button
          type="button"
          onClick={handleClear}
          className={`${btn} text-red-600 hover:bg-red-50`}
          aria-label="Clear canvas"
        >
          Clear
        </button>
      </div>
    </header>
  );
}

function UndoIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}
function RedoIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
    </svg>
  );
}

export const Toolbar = memo(ToolbarComponent);
