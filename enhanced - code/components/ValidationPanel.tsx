import React from 'react';
import { ValidationIssue } from '../types';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

interface ValidationPanelProps {
  issues: ValidationIssue[];
  nodeCount: number;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ issues, nodeCount }) => {
  if (nodeCount === 0) {
    return (
      <div className="absolute bottom-4 left-80 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 text-gray-400">
          <FiAlertCircle />
          <span className="text-sm">No nodes added yet. Drag nodes from the palette to get started!</span>
        </div>
      </div>
    );
  }

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');

  if (issues.length === 0) {
    return (
      <div className="absolute bottom-4 left-80 right-4 bg-green-900 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <FiCheckCircle className="text-green-400" />
          <span className="text-sm font-medium">Funnel looks good! No validation issues found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-80 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-h-48 overflow-y-auto">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        Validation Issues ({issues.length})
      </h3>

      <div className="space-y-2">
        {errors.map((issue, index) => (
          <div key={`error-${index}`} className="flex items-start gap-2 text-red-400">
            <FiAlertCircle className="flex-shrink-0 mt-0.5" />
            <span className="text-sm">{issue.message}</span>
          </div>
        ))}
        
        {warnings.map((issue, index) => (
          <div key={`warning-${index}`} className="flex items-start gap-2 text-yellow-400">
            <FiAlertTriangle className="flex-shrink-0 mt-0.5" />
            <span className="text-sm">{issue.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidationPanel;
