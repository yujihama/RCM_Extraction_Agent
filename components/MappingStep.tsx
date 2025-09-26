
import React, { useState, useEffect } from 'react';
import { RcmData, TransformationPlan, Template, StandardColumn, TransformationType } from '../types';
import { STANDARD_COLUMNS } from '../constants';
import { TrashIcon } from './icons/TrashIcon';
import { BrainIcon } from './icons/BrainIcon';

interface MappingStepProps {
  originalData: RcmData;
  headers: string[];
  initialPlan: TransformationPlan | null;
  aiReasoning: string;
  templates: Template[];
  onApprove: (plan: TransformationPlan) => void;
  onDeleteTemplate: (id: string) => void;
  onStartOver: () => void;
}

const MappingStep: React.FC<MappingStepProps> = ({ originalData, headers, initialPlan, aiReasoning, templates, onApprove, onDeleteTemplate, onStartOver }) => {
  const [plan, setPlan] = useState<TransformationPlan>(initialPlan || []);

  useEffect(() => {
    if (initialPlan) {
      setPlan(initialPlan);
    }
  }, [initialPlan]);

  const handleSourceChange = (target: StandardColumn, newSource: string[]) => {
    setPlan(prevPlan =>
      prevPlan.map(rule =>
        rule.target === target ? { ...rule, source: newSource } : rule
      )
    );
  };
  
  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "") {
        setPlan(initialPlan || []);
        return;
    }
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
        setPlan(selectedTemplate.plan);
    }
  };


  const sampleData = originalData.slice(0, 5);

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Review & Approve Mapping</h2>
            <button onClick={onStartOver} className="text-sm text-slate-400 hover:text-slate-200">Start Over</button>
        </div>

        {/* AI Reasoning Panel */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-3">
                <BrainIcon className="w-6 h-6 text-indigo-400"/>
                <h3 className="text-lg font-semibold text-slate-200">AI Analysis & Suggestion</h3>
            </div>
            <p className="text-slate-300 whitespace-pre-wrap">{aiReasoning}</p>
        </div>
        
        {/* Template Selector */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <label htmlFor="template-select" className="block text-sm font-medium text-slate-300 mb-2">Apply a Saved Template</label>
            <div className="flex gap-2">
                <select 
                    id="template-select"
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">-- Use AI Suggestion --</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
        </div>
        
        {/* Mapping Configuration */}
        <div>
            <h3 className="text-xl font-semibold mb-4">Column Mapping Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {STANDARD_COLUMNS.map(column => {
                const rule = plan.find(r => r.target === column);
                return (
                    <div key={column} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
                        <h4 className="font-bold text-indigo-400">{column}</h4>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 block">Source Column(s)</label>
                            <select
                                multiple
                                value={rule?.source || []}
                                onChange={(e) => handleSourceChange(column, Array.from(e.target.selectedOptions, option => option.value))}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 h-24"
                            >
                                {headers.map(header => <option key={header} value={header}>{header}</option>)}
                            </select>
                        </div>
                        {rule && <p className="text-xs text-slate-400 bg-slate-700/50 p-2 rounded-md"><span className="font-semibold text-slate-300">AI Suggestion:</span> {rule.reasoning}</p>}
                    </div>
                );
                })}
            </div>
        </div>

        {/* Data Preview */}
        <div>
            <h3 className="text-xl font-semibold mb-4">Source Data Preview</h3>
            <div className="overflow-x-auto bg-slate-800/50 border border-slate-700 rounded-lg">
                <table className="min-w-full divide-y divide-slate-700 text-sm">
                    <thead className="bg-slate-800">
                        <tr>
                        {headers.map(header => (
                            <th key={header} className="px-4 py-2 text-left font-semibold text-slate-300">{header}</th>
                        ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {sampleData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {headers.map(header => (
                            <td key={header} className="px-4 py-2 text-slate-400 whitespace-nowrap max-w-xs truncate">{row[header]}</td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div className="pt-5">
            <button
                onClick={() => onApprove(plan)}
                className="w-full px-6 py-3 bg-indigo-600 rounded-md text-white font-semibold hover:bg-indigo-700 transition-colors"
            >
                Approve & Preview Transformed Data
            </button>
        </div>
    </div>
  );
};

export default MappingStep;
