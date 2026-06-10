"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Message } from "./types";

interface Props {
message: Message;
}

export default function MessageBubble({
message,
}: Props) {
const isUser =
message.role === "user";

// USER MESSAGE
if (isUser) {
return ( <div className="flex justify-end">
<div
className="
max-w-[60%]


        rounded-[24px]

        border
        border-orange-500/20

        bg-orange-500/[0.12]

        px-5
        py-3

        text-white

        backdrop-blur-xl

        shadow-[0_0_30px_rgba(249,115,22,0.15)]
      "
    >
      {message.content}
    </div>
  </div>
);


}

// ASSISTANT MESSAGE
return ( <div className="w-full">
<div
className="
prose
prose-invert
prose-lg


      max-w-none

      leading-8

      prose-p:text-white/90
      prose-p:max-w-[75ch]

      prose-li:text-white/80
      prose-li:max-w-[75ch]

      prose-headings:text-white
      prose-strong:text-white

      prose-code:text-orange-300

      prose-pre:bg-black/20
      prose-pre:border
      prose-pre:border-white/10
      prose-pre:rounded-2xl

      prose-a:text-orange-300
    "
  >
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
      ]}
    >
      {message.content}
    </ReactMarkdown>
  </div>

  {!!message.sources?.length && (
    <div className="mt-6">
      <div
        className="
          mb-3

          text-xs
          uppercase

          tracking-[0.15em]

          text-white/40
        "
      >
        Sources
      </div>

      <div className="space-y-2">
        {message.sources.map(
          (source) => (
            <div
              key={source}
              className="
                rounded-xl

                border
                border-orange-500/10

                bg-orange-500/[0.05]

                px-4
                py-3

                text-xs
                text-orange-300

                backdrop-blur-xl
              "
            >
              {source}
            </div>
          )
        )}
      </div>
    </div>
  )}
</div>


);
}
