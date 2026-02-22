'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold font-serif border-b border-zinc-800 pb-4 mt-8 mb-4 tracking-tight text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-bold font-serif border-b border-zinc-800 pb-3 mt-8 mb-4 tracking-tight text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-bold font-serif border-b border-zinc-800 pb-2 mt-6 mb-3 tracking-tight text-white">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-bold font-serif mt-6 mb-3 text-white">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-lg leading-relaxed mb-4 text-zinc-300">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc ml-6 space-y-2 mb-4 text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-6 space-y-2 mb-4 text-zinc-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 mb-1">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-white pl-4 italic text-zinc-400 my-6 py-2 bg-white/5 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-zinc-800 px-1.5 py-0.5 font-mono text-sm text-zinc-200 rounded">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-zinc-900 p-4 overflow-x-auto border border-zinc-800 my-6 rounded-xl shadow-inner scrollbar-hide">
              {children}
            </pre>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-white">
              {children}
            </em>
          ),
          u: ({ children }) => (
            <u className="underline decoration-1 underline-offset-2 text-white">
              {children}
            </u>
          ),
          hr: () => (
            <hr className="my-8 border-none h-px bg-zinc-800" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-zinc-800">
              <table className="w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-zinc-900 text-white font-bold p-3 text-left border border-zinc-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-3 border border-zinc-800 text-zinc-300">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
