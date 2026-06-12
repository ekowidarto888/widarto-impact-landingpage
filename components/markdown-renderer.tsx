import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";

export default function MarkdownRenderer({ content }: { content: string }) {
  // Pastikan tipe data aman dan replace newline berjalan baik
  const processedContent =
    typeof content === "string" ? content.replace(/\\n/g, "\n") : "";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // Styling untuk Paragraf
        // handle bold text
        strong: ({ children }) => (
          <strong className="font-bold">{children}</strong>
        ),
        p: ({ children }) => <p className="leading-normal">{children}</p>,

        // Styling untuk List (Penting untuk bagian "Supported Services:")
        ul: ({ children }) => (
          <ul className="list-disc ml-8 -mt-3.5">{children}</ul>
        ),
        li: ({ children }) => (
          <li className="pl-1 text-base leading-normal">{children}</li>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl lg:text-3xl font-semibold text-white uppercase">{children}</h2>
        ),
        // Styling untuk Heading 4 (Jika ada)
        h4: ({ children }) => (
          <h4 className="text-xl font-semibold">{children}</h4>
        ),

        // Styling untuk Gambar
        img: ({ src, alt }) => {
          if (!src) return null;

          const imageSrc = src as string;
          return (
            <span className="block w-full relative aspect-[3/2] rounded-[10px] lg:rounded-[16px] overflow-hidden my-6">
              <Image
                src={imageSrc}
                alt={alt || "Article image"}
                fill
                className="object-cover rounded-[10px] lg:rounded-[16px]"
                sizes="(max-width: 1024px) 100vw, 60vw"
                loading="lazy"
                draggable={false}
              />
            </span>
          );
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
