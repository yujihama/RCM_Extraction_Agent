
import React, { useState } from 'react';
import { RcmData, Template } from '../types';
import { STANDARD_COLUMNS } from '../constants';
import { downloadCsv } from '../utils/fileUtils';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { SaveIcon } from './icons/SaveIcon';

interface PreviewAndDownloadStepProps {
  data: RcmData;
  templates: Template[];
  onSaveTemplate: (name: string) => void;
  onStartOver: () => void;
}

const PreviewAndDownloadStep: React.FC<PreviewAndDownloadStepProps> = ({ data, templates, onSaveTemplate, onStartOver }) => {
  const [templateName, setTemplateName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (templateName.trim()) {
      onSaveTemplate(templateName.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000); // Reset after 3 seconds
    }
  };

  const isExistingTemplate = templates.some(t => t.name === templateName.trim());

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center items-center mb-4">
            <CheckIcon className="w-12 h-12 text-green-400 mr-3"/>
            <h2 className="text-3xl font-bold">Transformation Complete</h2>
        </div>
        <p className="text-slate-400">Review the standardized data below. You can now download it as a CSV or save the transformation rules as a template for future use.</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
          {/* Save Template */}
          <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center"><SaveIcon className="w-5 h-5 mr-2 text-indigo-400"/>Save as Template</h3>
              <p className="text-sm text-slate-400">Save the current mapping rules to quickly process similar files in the future.</p>
              <div className="flex gap-2">
                  <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name..."
                      className="flex-grow bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <button onClick={handleSave} disabled={!templateName.trim()} className="px-4 py-2 bg-indigo-600 rounded-md text-white font-semibold hover:bg-indigo-700 disabled:bg-slate-600 transition-colors">
                      {isSaved ? 'Saved!' : (isExistingTemplate ? 'Update' : 'Save')}
                  </button>
              </div>
          </div>
          {/* Download CSV */}
          <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center"><DownloadIcon className="w-5 h-5 mr-2 text-green-400"/>Download Data</h3>
              <p className="text-sm text-slate-400">Download the transformed data in the standardized CSV format.</p>
              <button onClick={() => downloadCsv(data, 'rcm-export.csv')} className="w-full px-6 py-3 bg-green-600 rounded-md text-white font-semibold hover:bg-green-700 transition-colors">
                  Download CSV
              </button>
          </div>
      </div>

      {/* Data Preview */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Transformed Data Preview</h3>
        <div className="overflow-x-auto bg-slate-800/50 border border-slate-700 rounded-lg max-h-[500px]">
          <table className="min-w-full divide-y divide-slate-700 text-sm">
            <thead className="bg-slate-800 sticky top-0">
              <tr>
                {STANDARD_COLUMNS.map(header => (
                  <th key={header} className="px-4 py-2 text-left font-semibold text-slate-300">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {STANDARD_COLUMNS.map(header => (
                    <td key={header} className="px-4 py-2 text-slate-400 whitespace-nowrap max-w-xs truncate">{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="text-center pt-5">
        <button onClick={onStartOver} className="px-8 py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
            Process Another File
        </button>
      </div>

    </div>
  );
};

export default PreviewAndDownloadStep;
