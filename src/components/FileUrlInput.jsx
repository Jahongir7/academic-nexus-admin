import React, { useState, useRef } from 'react';
import { Upload, ExternalLink, Loader2, CheckCircle2, X } from 'lucide-react';

/**
 * FileUrlInput - Input component for manual URL entry or automatic Cloudinary upload
 * Upload API: POST https://mamun.university/api/cloudinary/upload
 */
const FileUrlInput = ({
  label = "Havola",
  value = "",
  onChange,
  placeholder = "https://example.com/file.jpg",
  accept = "image/*,.pdf,.doc,.docx",
  required = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('https://mamun.university/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if ((json.status === 200 || res.ok) && json.data?.url) {
        onChange(json.data.url);
      } else if (json.url) {
        onChange(json.url);
      } else {
        throw new Error(json.message || "Faylni yuklashda xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Faylni yuklashda xatolik");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      {/* Input container matching screenshot */}
      <div className="flex items-center rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition shadow-sm">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 shrink-0 transition"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Yuklanmoqda...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Yuklash</span>
            </>
          )}
        </button>

        {/* URL Text Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="flex-1 px-3 py-2 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none min-w-0"
        />

        {/* Actions / External Link / Clear */}
        <div className="flex items-center gap-1 pr-2">
          {value && (
            <>
              <button
                type="button"
                onClick={() => onChange("")}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition rounded"
                title="Tozalash"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-indigo-400 transition rounded"
                title="Havolani ochish"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-[11px] text-rose-400 font-medium mt-1">{error}</p>}

      {/* Preview Image if image URL */}
      {value && (value.endsWith('.jpg') || value.endsWith('.png') || value.endsWith('.webp') || value.endsWith('.jpeg') || value.includes('storage.mamun.university') || value.includes('cloudinary')) && (
        <div className="mt-2 relative inline-block group">
          <img
            src={value}
            alt="Preview"
            className="h-20 w-auto object-cover rounded-lg border border-slate-700 bg-slate-950"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  );
};

export default FileUrlInput;
