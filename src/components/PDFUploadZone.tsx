import React, { useCallback } from 'react';
import { DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PDFUploadZoneProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
}

const PDFUploadZone: React.FC<PDFUploadZoneProps> = ({ onFileUpload, uploadedFile }) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      onFileUpload(pdfFile);
    }
  }, [onFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      onFileUpload(pdfFile);
    }
  };

  const handleRemoveFile = () => {
    onFileUpload(null as any);
  };

  return (
    <div className="space-y-4">
      {uploadedFile ? (
        <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DocumentIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">{uploadedFile.name}</p>
                <p className="text-sm text-green-700">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 text-green-600 hover:text-green-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-200"
        >
          <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Upload PDF Study Material
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop your PDF file here, or click to browse
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Choose PDF File
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Maximum file size: 10MB
          </p>
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-1">How AI uses your PDF:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Extracts text content from your PDF</li>
          <li>Generates questions based on the extracted content</li>
          <li>Ensures questions are relevant to your study material</li>
          <li>Maintains accuracy and context from your notes</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFUploadZone;
