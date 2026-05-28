"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
}

export function FileUploadZone({ value, onChange }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onChange(file);
    },
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
  };

  if (value) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
        <FileText size={18} className="text-gray-500 shrink-0" />
        <span className="text-sm text-gray-700 flex-1 truncate">{value.name}</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
        isDragging
          ? "border-gray-900 bg-gray-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <Upload size={18} className="text-gray-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          Choose a file or drag & drop it here
        </p>
        <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, PDF up to 10MB</p>
      </div>
      <button
        type="button"
        className="text-xs font-medium text-gray-900 border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-gray-100 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("file-upload-input")?.click();
        }}
      >
        Browse Files
      </button>
      <input
        id="file-upload-input"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
}
