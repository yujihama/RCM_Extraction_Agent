
import React, { useState, useCallback } from 'react';
import { RcmData } from '../types';
import { parseFile } from '../utils/fileUtils';
import { UploadIcon } from './icons/UploadIcon';
import { FileIcon } from './icons/FileIcon';

interface FileUploadStepProps {
  onFileProcessed: (file: File, data: RcmData, headers: string[]) => void;
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({ onFileProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
        setFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileChange(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const { data, headers } = await parseFile(file);
      onFileProcessed(file, data, headers);
    } catch (err) {
      console.error(err);
      setError('Failed to parse the file. It might be corrupted or in an unsupported format.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 shadow-xl p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2 text-slate-100">Upload RCM File</h2>
        <p className="text-slate-400 mb-6">Drag & drop or select an Excel or CSV file to begin analysis.</p>

        <label
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex justify-center w-full h-48 px-4 transition bg-slate-900/50 border-2 border-slate-700 border-dashed rounded-md appearance-none cursor-pointer hover:border-indigo-400 focus:outline-none">
            <span className="flex items-center space-x-2">
                <UploadIcon className="w-8 h-8 text-slate-500"/>
                <span className="font-medium text-slate-400">
                    Drop file to attach, or <span className="text-indigo-400 underline">browse</span>
                </span>
            </span>
            <input type="file" name="file_upload" className="hidden" accept=".xlsx,.xls,.csv" onChange={(e) => handleFileChange(e.target.files)} />
        </label>

        {file && (
            <div className="mt-6 flex items-center justify-center bg-slate-700/50 p-3 rounded-md text-left">
                <FileIcon className="w-6 h-6 text-slate-400 mr-3 flex-shrink-0" />
                <div className="flex-grow">
                    <p className="font-medium text-slate-200">{file.name}</p>
                    <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button onClick={() => setFile(null)} className="ml-4 text-slate-500 hover:text-red-400">&times;</button>
            </div>
        )}

        {error && <p className="mt-4 text-red-400">{error}</p>}

        <button
            onClick={handleSubmit}
            disabled={!file || isProcessing}
            className="mt-8 w-full px-6 py-3 bg-indigo-600 rounded-md text-white font-semibold hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
            {isProcessing ? 'Processing...' : 'Analyze with AI'}
        </button>
        </div>
    </div>
  );
};

export default FileUploadStep;
