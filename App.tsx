
import React, { useState, useCallback, useEffect } from 'react';
import { AppStep, RcmData, TransformationPlan, Template } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import FileUploadStep from './components/FileUploadStep';
import MappingStep from './components/MappingStep';
import PreviewAndDownloadStep from './components/PreviewAndDownloadStep';
import { analyzeRcmFile, applyTransformations } from './services/geminiService';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.FileUpload);
  const [file, setFile] = useState<File | null>(null);
  const [originalData, setOriginalData] = useState<RcmData>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [transformationPlan, setTransformationPlan] = useState<TransformationPlan | null>(null);
  const [transformedData, setTransformedData] = useState<RcmData>([]);
  const [templates, setTemplates] = useLocalStorage<Template[]>('rcm-templates', []);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string>('');

  const handleFileProcessed = useCallback(async (processedFile: File, data: RcmData, fileHeaders: string[]) => {
    setIsLoading(true);
    setLoadingMessage('AI is analyzing the file structure...');
    setError(null);
    setFile(processedFile);
    setOriginalData(data);
    setHeaders(fileHeaders);

    try {
      const { plan, reasoning } = await analyzeRcmFile(data, fileHeaders, templates);
      setTransformationPlan(plan);
      setAiReasoning(reasoning);
      setStep(AppStep.Mapping);
    } catch (e) {
      console.error(e);
      setError('Failed to get analysis from AI. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [templates]);

  const handleMappingApproved = useCallback(async (approvedPlan: TransformationPlan) => {
    setIsLoading(true);
    setLoadingMessage('Applying transformations and generating final data...');
    setError(null);
    setTransformationPlan(approvedPlan);

    try {
      const finalData = await applyTransformations(originalData, approvedPlan);
      setTransformedData(finalData);
      setStep(AppStep.Preview);
    } catch (e) {
      console.error(e);
      setError('Failed to apply transformations with AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [originalData]);

  const handleSaveTemplate = useCallback((name: string) => {
    if (transformationPlan) {
      const newTemplate: Template = { id: Date.now().toString(), name, plan: transformationPlan };
      setTemplates(prev => {
        const existingIndex = prev.findIndex(t => t.name === name);
        if(existingIndex > -1){
            const newTemplates = [...prev];
            newTemplates[existingIndex] = newTemplate;
            return newTemplates;
        }
        return [...prev, newTemplate];
      });
    }
  }, [transformationPlan, setTemplates]);

  const handleDeleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, [setTemplates]);

  const handleStartOver = () => {
    setStep(AppStep.FileUpload);
    setFile(null);
    setOriginalData([]);
    setHeaders([]);
    setTransformationPlan(null);
    setTransformedData([]);
    setError(null);
    setAiReasoning('');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full mt-20">
          <Spinner />
          <p className="mt-4 text-slate-300 animate-pulse">{loadingMessage}</p>
        </div>
      );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full mt-20 text-center">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <button
                    onClick={handleStartOver}
                    className="px-6 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Start Over
                </button>
            </div>
        );
    }

    switch (step) {
      case AppStep.FileUpload:
        return <FileUploadStep onFileProcessed={handleFileProcessed} />;
      case AppStep.Mapping:
        return (
          <MappingStep
            originalData={originalData}
            headers={headers}
            initialPlan={transformationPlan}
            aiReasoning={aiReasoning}
            templates={templates}
            onApprove={handleMappingApproved}
            onDeleteTemplate={handleDeleteTemplate}
            onStartOver={handleStartOver}
          />
        );
      case AppStep.Preview:
        return (
          <PreviewAndDownloadStep
            data={transformedData}
            onSaveTemplate={handleSaveTemplate}
            onStartOver={handleStartOver}
            templates={templates}
          />
        );
      default:
        return <FileUploadStep onFileProcessed={handleFileProcessed} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
