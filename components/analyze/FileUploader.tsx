'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (file: File) => void;
}

export function FileUploader({ onUpload }: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];
    
    if (!file) {
      setError('Please upload a file');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size too large');
      return;
    }

    onUpload(file);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted'}
            ${error ? 'border-red-500' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload Your Lineups</h3>
            <p className="text-sm text-muted-foreground">
              Drag & drop your CSV file here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Supports DraftKings and FanDuel formats
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}