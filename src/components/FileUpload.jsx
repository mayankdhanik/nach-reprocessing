import React, { useState, useRef } from "react";
import {
  validateFileType,
  validateFileSize,
  showNotification,
} from "../utils/helpers";

const FileUpload = ({ onFileUpload, uploading }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    // Validate file type
    if (!validateFileType(file)) {
      showNotification("Please select a .txt file", "error");
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      showNotification("File size must be less than 10MB", "error");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && onFileUpload) {
      onFileUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            📁 Upload NACH File
          </h2>
          <p className="text-sm text-gray-600">
            Upload your NACH transaction file (.txt format) for processing
          </p>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                Size: {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`btn-primary flex items-center space-x-2 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>⬆️</span>
                    <span>Upload File</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={uploading}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your NACH file here
              </p>
              <p className="text-sm text-gray-500">or click to browse files</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`btn-primary inline-flex items-center space-x-2 cursor-pointer ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span>📂</span>
                <span>Select File</span>
              </label>
            </div>
            <div className="text-xs text-gray-400">
              Supported formats: .txt | Max size: 10MB
            </div>
          </div>
        )}
      </div>

      {/* Upload Guidelines */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          📋 File Upload Guidelines
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Only .txt files are supported</li>
          <li>• File size should not exceed 10MB</li>
          <li>• Ensure the file follows NACH format specification</li>
          <li>• Files should contain pipe-separated values (|)</li>
          <li>• Check file encoding is UTF-8</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
