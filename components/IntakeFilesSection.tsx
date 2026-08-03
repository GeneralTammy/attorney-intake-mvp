"use client";

// components/IntakeFilesSection.tsx
//
// Drop into app/dashboard/intakes/[id]/page.tsx (the attorney-facing
// intake detail page — a client component, so this fetches from
// /api/intakes/[id]/files instead of querying Supabase directly.

import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";

interface IntakeFile {
  id: string;
  file_name: string;
  file_size: number;
  content_type: string;
  uploaded_by: string;
  created_at: string;
  signed_url: string | null;
}

export default function IntakeFilesSection({ intakeId }: { intakeId: string }) {
  const [files, setFiles] = useState<IntakeFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchFiles = async () => {
      try {
        const res = await fetch(`/api/intakes/${intakeId}/files`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setFiles(data.files || []);
        }
      } catch (err) {
        console.error("Error fetching intake files:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (intakeId) fetchFiles();
    return () => {
      cancelled = true;
    };
  }, [intakeId]);

  if (loading) {
    return (
      <div className="text-sm text-[#94A3B8] py-3">Loading documents...</div>
    );
  }

  if (files.length === 0) {
    return (
      <section className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-6 sm:p-7">
        <h2 className="text-sm font-semibold text-[#0E1320] mb-2">
          Supporting Documents
        </h2>
        <p className="text-sm text-[#94A3B8]">
          No documents uploaded for this intake.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-[#E8EAF1] shadow-sm p-6 sm:p-7">
      <h2 className="text-sm font-semibold text-[#0E1320] mb-4">
        Supporting Documents ({files.length})
      </h2>
      <ul className="list-none p-0 space-y-2">
        {files.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between px-3 py-2.5 border border-[#E5E7F0] rounded-lg"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText size={15} className="text-[#94A3B8] flex-shrink-0" />
              <span className="text-sm text-[#0E1320] truncate">
                {f.file_name}
              </span>
              <span className="text-xs text-[#94A3B8] flex-shrink-0">
                ({Math.round(f.file_size / 1024)} KB)
              </span>
            </div>
            {f.signed_url && (
              <a
                href={f.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#3B5BDB] text-xs font-medium flex-shrink-0"
              >
                <Download size={13} /> Download
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
