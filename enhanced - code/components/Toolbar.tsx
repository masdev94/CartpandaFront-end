import React, { useRef } from 'react';
import { FiDownload, FiUpload, FiTrash2, FiSave } from 'react-icons/fi';

interface ToolbarProps {
  onExport: () => void;
  onImport: (json: string) => void;
  onReset: () => void;
  onSave: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onExport, onImport, onReset, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    onExport();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImport(content);
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear the entire funnel? This cannot be undone.')) {
      onReset();
    }
  };

  return (
    <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between border-b border-gray-700">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">Upsell Funnel Builder</h1>
        <span className="text-xs text-gray-400">by Cartpanda</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="
            px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium
            transition-colors duration-200 flex items-center gap-2
          "
          aria-label="Save funnel"
          title="Save to localStorage"
        >
          <FiSave /> Save
        </button>

        <button
          onClick={handleExport}
          className="
            px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium
            transition-colors duration-200 flex items-center gap-2
          "
          aria-label="Export funnel as JSON"
          title="Export to JSON file"
        >
          <FiDownload /> Export
        </button>

        <button
          onClick={handleImportClick}
          className="
            px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium
            transition-colors duration-200 flex items-center gap-2
          "
          aria-label="Import funnel from JSON"
          title="Import from JSON file"
        >
          <FiUpload /> Import
        </button>

        <button
          onClick={handleReset}
          className="
            px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium
            transition-colors duration-200 flex items-center gap-2
          "
          aria-label="Clear funnel"
          title="Clear entire canvas"
        >
          <FiTrash2 /> Clear
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="File input for JSON import"
        />
      </div>
    </div>
  );
};

export default Toolbar;
