"use client";

import {
Paperclip,
Send,
X,
} from "lucide-react";

import {
useEffect,
useRef,
} from "react";

interface Props {
value: string;
loading: boolean;
attachments: File[];

onChange: (
value: string
) => void;

onSend: () => void;

onAttach: (
files: File[]
) => void;

onRemoveAttachment: (
index: number
) => void;
}

export default function ChatComposer({
value,
loading,
attachments,
onChange,
onSend,
onAttach,
onRemoveAttachment,
}: Props) {
const fileInputRef =
useRef<HTMLInputElement>(null);

const textareaRef =
useRef<HTMLTextAreaElement>(null);

useEffect(() => {
if (!textareaRef.current)
return;


textareaRef.current.style.height =
  "auto";

textareaRef.current.style.height =
  `${textareaRef.current.scrollHeight}px`;


}, [value]);

return ( <div className="w-full">


  {/* Attachments */}

  {attachments.length > 0 && (
    <div
      className="
        mb-4
        flex
        flex-wrap
        gap-2
      "
    >
      {attachments.map(
        (file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              backdrop-blur-xl
              px-3
              py-2
              text-sm
              text-white
            "
          >
            <span
              className="
                max-w-[180px]
                truncate
              "
            >
              {file.name}
            </span>

            <button
              onClick={() =>
                onRemoveAttachment(
                  index
                )
              }
              className="
                text-white/60
                hover:text-white
              "
            >
              <X size={14} />
            </button>
          </div>
        )
      )}
    </div>
  )}

  {/* Composer */}

  <div
    className="
      relative
      overflow-hidden
      rounded-[32px]
      border
      border-white/10
      bg-white/[0.04]
      backdrop-blur-2xl
      shadow-[0_8px_40px_rgba(0,0,0,0.25)]
    "
  >
    {/* Glow */}

    <div
      className="
        absolute
        inset-0
        bg-gradient-to-r
        from-orange-500/[0.03]
        via-transparent
        to-orange-500/[0.03]
        pointer-events-none
      "
    />

    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) =>
        onChange(
          e.target.value
        )
      }
      placeholder="Ask anything..."
      rows={1}
      className="
        relative
        z-10
        min-h-[72px]
        max-h-[240px]
        w-full
        resize-none
        overflow-y-auto
        bg-transparent
        px-6
        pt-5
        text-white
        placeholder:text-white/40
        outline-none
      "
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          !e.shiftKey
        ) {
          e.preventDefault();
          onSend();
        }
      }}
    />

    <div
      className="
        relative
        z-10
        flex
        items-center
        justify-between
        px-4
        pb-4
      "
    >
      <button
        onClick={() =>
          fileInputRef.current?.click()
        }
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-white/10
          bg-white/[0.04]
          px-3
          py-2
          backdrop-blur-md
          transition
          hover:bg-white/[0.08]
        "
      >
        <Paperclip size={16} />

        <span className="text-sm">
          Attach
        </span>
      </button>

      <button
        disabled={loading}
        onClick={onSend}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-orange-500/20
          bg-orange-500/80
          px-4
          py-2
          font-medium
          text-white
          backdrop-blur-md
          transition
          hover:bg-orange-500
          disabled:opacity-50
        "
      >
        <Send size={16} />
        Send
      </button>
    </div>
  </div>

  <input
    ref={fileInputRef}
    hidden
    multiple
    type="file"
    onChange={(e) => {
      const files =
        Array.from(
          e.target.files || []
        );

      if (
        files.length === 0
      )
        return;

      onAttach(files);
    }}
  />
</div>


);
}
