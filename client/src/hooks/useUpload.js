import { useState, useCallback } from 'react';
import { getUploadConfig, uploadFile } from '../api/upload.js';
import { validateFiles } from '../utils/format.js';

export function useUpload() {
  const [config, setConfig] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const loadConfig = useCallback(async () => {
    const data = await getUploadConfig();
    setConfig(data);
    return data;
  }, []);

  const addFiles = useCallback(
    async (fileList) => {
      let uploadConfig = config;
      if (!uploadConfig) {
        uploadConfig = await loadConfig();
      }

      const incoming = Array.from(fileList);
      const { valid, errors: validationErrors } = validateFiles(incoming, uploadConfig);

      setErrors(validationErrors);
      if (valid.length > 0) {
        setFiles((prev) => [...prev, ...valid]);
      }
    },
    [config, loadConfig],
  );

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setErrors([]);
    setProgress(0);
    setCompleted(false);
    setUploadedCount(0);
    setCurrentFile('');
  }, []);

  const startUpload = useCallback(async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setErrors([]);
    setCompleted(false);

    const total = files.length;
    let succeeded = 0;
    const uploadErrors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFile(file.name);
      setCurrentIndex(i);

      try {
        await uploadFile(file, (fileProgress) => {
          const overall = ((i + fileProgress) / total) * 100;
          setProgress(Math.round(overall));
        });
        succeeded += 1;
        setUploadedCount(succeeded);
      } catch (err) {
        uploadErrors.push(
          `${file.name}: ${err.response?.data?.error || err.message || 'Upload failed'}`,
        );
      }
    }

    setProgress(100);
    setUploading(false);
    setCurrentFile('');

    if (uploadErrors.length > 0) {
      setErrors(uploadErrors);
    }

    if (succeeded > 0) {
      setCompleted(true);
      setFiles([]);
    }
  }, [files]);

  return {
    config,
    files,
    uploading,
    progress,
    currentFile,
    currentIndex,
    errors,
    completed,
    uploadedCount,
    loadConfig,
    addFiles,
    removeFile,
    clearFiles,
    startUpload,
  };
}
