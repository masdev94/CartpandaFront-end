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
}

/**
 * Toolbar with actions for the funnel builder:
 * - Export JSON
 * - Import JSON
 * - Clear canvas
 * - Undo/Redo
 */
function ToolbarComponent({
  onImport,
  onExport,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const state = onExport();
    const timestamp = new Date().toISOString().slice(0, 10);
    exportFunnelAsJson(state, `funnel-${timestamp}.json`);
  }, [onExport]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const state = await importFunnelFromJson(file);
      if (state) {
        onImport(state);
      } else {
        alert('Invalid funnel file. Please select a valid JSON export.');
      }

      // Reset input so the same file can be selected again
      event.target.value = '';
    },
    [onImport]
  );

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
      onClear();
    }
  }, [onClear]);

  const buttonClass = `
    px-3 py-1.5 rounded text-sm font-medium
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `;

  return (
    <header
      className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between"
      role="toolbar"
      aria-label="Funnel builder toolbar"
    >
      <div className="flex items-center gap-2">
        {/* Logo/Title */}
        <h1 className="text-lg font-bold text-gray-800 mr-4">
          <span className="text-blue-600">Funnel</span> Builder
        </h1>

        {/* Undo/Redo */}
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`${buttonClass} text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Undo"
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`${buttonClass} text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Redo"
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className={`${buttonClass} bg-blue-500 text-white hover:bg-blue-600`}
          aria-label="Export funnel as JSON"
        >
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export JSON
          </span>
        </button>

        <button
          onClick={handleImportClick}
          className={`${buttonClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}
          aria-label="Import funnel from JSON"
        >
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import JSON
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        <button
          onClick={handleClear}
          className={`${buttonClass} text-red-600 hover:bg-red-50`}
          aria-label="Clear canvas"
        >
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </span>
        </button>
      </div>
    </header>
  );
}

export const Toolbar = memo(ToolbarComponent);
