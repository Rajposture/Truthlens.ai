"use client";

import {
  FileText,
  FolderOpen,
  Calendar,
} from "lucide-react";

interface DocumentItem {
  filename: string;
  path: string;
  uploaded_at?: string;
}

interface Props {
  documents: DocumentItem[];
  loading?: boolean;
}

export default function DocumentsTable({
  documents,
  loading = false,
}: Props) {
  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-950
      "
    >
      {/* Header */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-zinc-800
          px-6
          py-5
        "
      >
        <div>
          <h2 className="text-xl font-bold">
            Document Library
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Indexed files available in
            TruthLens
          </p>
        </div>

        <div
          className="
            rounded-xl
            border
            border-zinc-800
            px-4
            py-2
            text-sm
            text-zinc-400
          "
        >
          {documents.length} Documents
        </div>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr
              className="
                border-b
                border-zinc-800
                bg-zinc-900/50
              "
            >
              <th className="p-4 text-left">
                Document
              </th>

              <th className="p-4 text-left">
                Location
              </th>

              <th className="p-4 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan={3}
                  className="
                    p-8
                    text-center
                    text-zinc-500
                  "
                >
                  Loading documents...
                </td>

              </tr>

            ) : documents.length === 0 ? (

              <tr>

                <td
                  colSpan={3}
                  className="
                    p-10
                    text-center
                    text-zinc-500
                  "
                >
                  No indexed documents found
                </td>

              </tr>

            ) : (

              documents.map(
                (
                  doc,
                  index
                ) => (

                  <tr
                    key={index}
                    className="
                      border-b
                      border-zinc-800/50
                      transition
                      hover:bg-zinc-900/30
                    "
                  >

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            rounded-xl
                            bg-blue-500/10
                            p-2
                          "
                        >
                          <FileText
                            className="
                              h-5
                              w-5
                              text-blue-400
                            "
                          />
                        </div>

                        <div>

                          <p className="font-medium">
                            {doc.filename}
                          </p>

                          <p
                            className="
                              text-xs
                              text-zinc-500
                            "
                          >
                            Indexed Document
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="p-4">

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-zinc-400
                        "
                      >
                        <FolderOpen
                          className="
                            h-4
                            w-4
                          "
                        />

                        <span className="text-sm">
                          {doc.path}
                        </span>

                      </div>

                    </td>

                    <td className="p-4">

                      <span
                        className="
                          rounded-full
                          border
                          border-green-500/20
                          bg-green-500/10
                          px-3
                          py-1
                          text-xs
                          font-medium
                          text-green-400
                        "
                      >
                        Indexed
                      </span>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>
    </div>
  );
}