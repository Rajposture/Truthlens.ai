"use client";

import { Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
value: string;
loading: boolean;
attachments: File[];

onChange: (value: string) => void;
onSend: () => void;
onAttach: (files: File[]) => void;
onRemoveAttachment: (index: number) => void;
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
const fileInputRef = useRef<HTMLInputElement>(null);
const textareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
if (!textareaRef.current) return;


textareaRef.current.style.height = "auto";
textareaRef.current.style.height =
  textareaRef.current.scrollHeight + "px";


}, [value]);

return ( <div className="w-full">
{attachments.length > 0 && ( <div className="mb-4 flex flex-wrap gap-2">
{attachments.map((file, index) => (
<div
key={`${file.name}-${index}`}
className="
flex
items-center
gap-2
rounded-full
border
border-white/10
bg-white/[0.05]
px-4
py-2
backdrop-blur-xl
"
> <span
             className="
               max-w-[180px]
               truncate
               text-sm
               text-white/80
             "
           >
{file.name} </span>


          <button
            type="button"
            onClick={() => onRemoveAttachment(index)}
            className="
              text-white/50
              hover:text-white
            "
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )}

  <div
    className="
      relative
      overflow-hidden
      rounded-[34px]
      border
      border-white/10
      bg-white/[0.04]
      backdrop-blur-3xl
      shadow-[0_10px_50px_rgba(0,0,0,0.35)]
    "
  >
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
      rows={1}
      placeholder="Message TruthLens AI..."
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSend();
        }
      }}
      className="
        relative
        z-10
        min-h-[80px]
        max-h-[260px]
        w-full
        resize-none
        overflow-y-auto
        bg-transparent
        px-6
        pt-6
        text-[15px]
        text-white
        placeholder:text-white/40
        outline-none
      "
    />

    <div
      className="
        relative
        z-10
        flex
        items-center
        justify-between
        px-5
        pb-5
      "
    >
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-white/10
          bg-white/[0.05]
          px-4
          py-2
          text-white/80
          backdrop-blur-xl
          transition-all
          hover:bg-white/[0.08]
        "
      >
        <Paperclip size={16} />
        Attach
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={onSend}
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-orange-500
          text-white
          shadow-lg
          transition-all
          hover:scale-105
          hover:bg-orange-400
          disabled:opacity-50
        "
      >
        <Send size={18} />
      </button>
    </div>
  </div>

  <input
    ref={fileInputRef}
    hidden
    multiple
    type="file"
    onChange={(e) => {
      const files = Array.from(e.target.files || []);

      if (files.length === 0) return;

      onAttach(files);
    }}
  />
</div>


);
}
