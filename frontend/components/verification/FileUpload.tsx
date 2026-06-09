"use client";

import { Upload, CheckCircle2, FileText } from "lucide-react";

interface FileUploadProps {
  file: File | null;
  uploaded: boolean;
  uploading: boolean;
  onFileSelect: (file: File) => void;
  onUpload: () => void;
}

export default function FileUpload({
  file,
  uploaded,
  uploading,
  onFileSelect,
  onUpload,
}: FileUploadProps) {
  return (
    <div className="space-y-4">

      <label
        className="
          flex
          cursor-pointer
          flex-col
          items-center
          justify-center
          rounded-3xl
          border-2
          border-dashed
          border-zinc-800
          bg-zinc-950
          p-10
          transition-all
          hover:border-blue-500
          hover:bg-zinc-900/40
        "
      >
        <input
          type="file"
          accept=".pdf"
          hidden
          onChange={(e) => {
            const selected =
              e.target.files?.[0];

            if (selected) {
              onFileSelect(selected);
            }
          }}
        />

        <Upload className="h-10 w-10 text-blue-500" />

        <h3 className="mt-4 text-lg font-semibold">
          Upload Document
        </h3>

        <p className="mt-2 text-center text-sm text-zinc-500">
          Drag & drop your PDF here or click to browse
        </p>

      </label>

      {file && (

        <div
          className="
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-900/40
            p-4
          "
        >

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <FileText className="h-5 w-5 text-blue-400" />

              <div>

                <p className="font-medium">
                  {file.name}
                </p>

                <p className="text-xs text-zinc-500">
                  Ready for indexing
                </p>

              </div>

            </div>

            {uploaded ? (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                Indexed
              </div>
            ) : (
              <button
                onClick={onUpload}
                disabled={uploading}
                className="
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-blue-500
                  disabled:opacity-50
                "
              >
                {uploading
                  ? "Uploading..."
                  : "Upload"}
              </button>
            )}

          </div>

        </div>

      )}

    </div>
  );
}