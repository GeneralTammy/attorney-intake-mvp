"use client";

// components/FileUploadField.tsx
//
// Drop into app/intake/[token]/page.tsx (the public client intake form).
// Posts to /api/public/intake/[token]/upload — matches the existing
// public route's token-based auth pattern (no user session needed).

import { useState, useRef } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

interface UploadedFile {
  name: string;
  status: "uploading" | "done" | "error";
  error?: string;
}

export default function FileUploadField({ token }: { token: string }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList) => {
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_FILE_SIZE) {
        setFiles((prev) => [
          ...prev,
          { name: file.name, status: "error", error: "File exceeds 10MB" },
        ]);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFiles((prev) => [
          ...prev,
          { name: file.name, status: "error", error: "Unsupported file type" },
        ]);
        continue;
      }

      setFiles((prev) => [...prev, { name: file.name, status: "uploading" }]);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`/api/public/intake/${token}/upload`, {
          method: "POST",
          body: formData,
        });
        const result = await res.json();

        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name && f.status === "uploading"
              ? { ...f, status: res.ok ? "done" : "error", error: result.error }
              : f,
          ),
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.name === file.name && f.status === "uploading"
              ? { ...f, status: "error", error: "Upload failed" }
              : f,
          ),
        );
      }
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-[#334155] mb-2">
        Supporting Documents (optional)
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-[#3B5BDB] rounded-xl p-6 text-center cursor-pointer bg-[#F5F7FF] hover:bg-[#EEF2FF] transition"
      >
        <p className="text-sm text-[#3B5BDB] font-medium">
          Click or drag files here to upload
        </p>
        <p className="text-xs text-[#94A3B8] mt-1">
          PDF, JPG, or PNG — up to 10MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="list-none p-0 mt-3 space-y-1">
          {files.map((f, i) => (
            <li
              key={i}
              className={`text-xs py-1 ${
                f.status === "error"
                  ? "text-[#C93B3B]"
                  : f.status === "done"
                    ? "text-[#12A06E]"
                    : "text-[#64748B]"
              }`}
            >
              {f.name} —{" "}
              {f.status === "uploading"
                ? "Uploading..."
                : f.status === "done"
                  ? "Uploaded"
                  : `Error: ${f.error}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
