// src/components/common/FileUpload.tsx

import React, { useRef, useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';

// Small local helper to merge class names (avoids missing "@/utils/helpers" import)
const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // En MB
  onChange: (file: File | null) => void;
  error?: string;
  helperText?: string;
  value?: File | null;
}

/**
 * Componente para subir archivos
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '.xlsx,.xls',
  maxSize = 5,
  onChange,
  error,
  helperText,
  value,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validar tamaño
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`El archivo no puede superar los ${maxSize}MB`);
      return;
    }

    // Validar tipo
    if (accept) {
      const extensions = accept.split(',').map((ext) => ext.trim());
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!extensions.includes(fileExt)) {
        alert(`Solo se permiten archivos: ${accept}`);
        return;
      }
    }

    onChange(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors cursor-pointer',
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300',
          error ? 'border-red-300' : '',
          'hover:border-primary-400 hover:bg-gray-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {value ? (
          // Archivo seleccionado
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FileText className="h-10 w-10 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {value.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(value.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          // Sin archivo
          <div className="p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">
                Arrastra tu archivo aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {accept} • Máximo {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <AlertCircle size={16} className="mr-1" />
          {error}
        </div>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};