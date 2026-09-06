import React, { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, X, RefreshCw, AlertCircle, FileCheck } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

export default function ImageUploader({
  selectedFile,
  previewUrl,
  isUploading,
  onSelectFile,
  onClearFile,
  onStartVerification,
  error,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const validateAndHandle = (file) => {
    setValidationError(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError("Unsupported format. Allowed formats: JPG, PNG, WEBP.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setValidationError(`File size exceeds the ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    onSelectFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandle(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="w-full">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            validateAndHandle(e.target.files[0]);
          }
        }}
      />

      {/* Upload Box / Dropzone */}
      {!previewUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative cursor-pointer border-2 border-dashed p-8 text-center transition duration-200 ${
            isDragOver
              ? "border-[#00ff66] bg-[#00ff66]/5"
              : "border-white/20 bg-[#0d0d12] hover:border-white/40 hover:bg-[#121218]"
          }`}
        >
          {/* Corner Markers */}
          <div className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 border-white/40 group-hover:border-[#00ff66]" />
          <div className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 border-white/40 group-hover:border-[#00ff66]" />
          <div className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-white/40 group-hover:border-[#00ff66]" />
          <div className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-white/40 group-hover:border-[#00ff66]" />

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-none border border-white/10 bg-white/5 text-zinc-400 transition group-hover:border-[#00ff66]/40 group-hover:text-[#00ff66]">
            <UploadCloud className="h-6 w-6" />
          </div>

          <p className="font-display text-base font-semibold tracking-wide text-white">
            DROP IMAGE HERE <span className="text-zinc-500 font-normal">or</span> CHOOSE FILE
          </p>

          <p className="mt-2 font-mono text-xs text-zinc-500">
            JPG, PNG, OR WEBP (MAX 10MB)
          </p>

          <div className="mt-4 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] text-zinc-400">
            <span>[CLICK OR DRAG TO ATTACH TARGET]</span>
          </div>
        </div>
      ) : (
        /* Image Preview & Actions */
        <div className="border border-white/20 bg-[#0d0d12] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Thumbnail Preview */}
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden border border-white/20 bg-black">
                <img
                  src={previewUrl}
                  alt="Target Preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-0 right-0 bg-[#00ff66] p-0.5 text-black">
                  <FileCheck className="h-3 w-3" />
                </div>
              </div>

              <div>
                <div className="font-mono text-xs font-semibold text-white">
                  {selectedFile?.name || "Target Image Attached"}
                </div>
                <div className="font-mono text-[11px] text-zinc-500">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Ready"} •{" "}
                  {selectedFile?.type.split("/")[1]?.toUpperCase() || "IMAGE"}
                </div>
                <div className="mt-1 font-mono text-[10px] text-[#00ff66]">
                  STATUS: READY FOR INGESTION
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1.5 border border-white/20 bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Replace</span>
              </button>

              <button
                onClick={onClearFile}
                disabled={isUploading}
                className="flex items-center gap-1.5 border border-red-500/30 bg-red-500/10 px-3 py-1.5 font-mono text-xs text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Start Verification Action Button */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <button
              onClick={() => onStartVerification()}
              disabled={isUploading}
              className="group relative flex w-full items-center justify-center gap-3 border border-[#00ff66] bg-[#00ff66] px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black transition hover:bg-transparent hover:text-[#00ff66] disabled:pointer-events-none disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>STARTING VERIFICATION PIPELINE...</span>
                </>
              ) : (
                <>
                  <span>START VERIFICATION</span>
                  <span className="font-normal text-black/70 group-hover:text-[#00ff66]">
                    // 07-STAGE AUDIT
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Validation or API Errors */}
      {(validationError || error) && (
        <div className="mt-3 flex items-start gap-2 border border-red-500/40 bg-red-500/10 p-3 font-mono text-xs text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{validationError || error}</span>
        </div>
      )}
    </div>
  );
}
