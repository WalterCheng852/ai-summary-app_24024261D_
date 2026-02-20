'use client';

import ReactMarkdown from 'react-markdown';

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
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold font-serif border-b-4 border-black pb-4 mt-8 mb-4 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-bold font-serif border-b-2 border-black pb-3 mt-8 mb-4 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-bold font-serif border-b border-black pb-2 mt-6 mb-3 tracking-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-bold font-serif mt-6 mb-3">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-base leading-relaxed mb-4 text-black">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc ml-6 space-y-2 mb-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-6 space-y-2 mb-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-base leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-black pl-4 italic text-black/80 my-6 py-2">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isInline = !className?.includes('language-');
            return isInline ? (
              <code className="bg-black/5 px-2 py-1 font-mono text-sm">
                {children}
              </code>
            ) : (
              <pre className="bg-black/5 p-4 overflow-x-auto border border-black my-4">
                <code className="font-mono text-sm text-black">
                  {children}
                </code>
              </pre>
            );
          },
          strong: ({ children }) => (
            <strong className="font-bold">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">
              {children}
            </em>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline hover:bg-black hover:text-white transition-colors duration-100"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-8 h-1 bg-black border-none" />,
          table: ({ children }) => (
            <table className="w-full border-collapse my-6">
              {children}
            </table>
          ),
          thead: ({ children }) => (
            <thead>
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="even:bg-black/5">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border border-black px-4 py-2 text-left bg-black text-white font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-black px-4 py-2">
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
