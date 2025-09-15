import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

/**
 * MarkdownMessage component for rendering formatted text in chat messages
 * 
 * This component safely renders markdown content with support for:
 * - Bold, italic, and code formatting
 * - Lists (bulleted and numbered)
 * - Links (sanitized for security)
 * - Code blocks with syntax highlighting
 * - Tables and other GitHub Flavored Markdown features
 * 
 * Features:
 * - XSS protection via rehype-sanitize
 * - GitHub Flavored Markdown support
 * - Custom styling for Pudgy Penguins theme
 * - Responsive design
 */
export default function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
        // Custom styling for different markdown elements
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-pudgy-oxford mb-2 border-b border-pudgy-sky/20 pb-1">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold text-pudgy-oxford mb-2">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold text-pudgy-oxford mb-1">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-pudgy-blue">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-pudgy-oxford/80">
            {children}
          </em>
        ),
        code: ({ children, className }) => {
          // Inline code
          if (!className) {
            return (
              <code className="bg-pudgy-azure/50 text-pudgy-oxford px-1.5 py-0.5 rounded text-xs font-mono border border-pudgy-sky/20">
                {children}
              </code>
            );
          }
          // Code block
          return (
            <code className="block bg-pudgy-floral/80 text-pudgy-oxford p-3 rounded-lg text-xs font-mono border border-pudgy-sky/20 overflow-x-auto mb-2">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-pudgy-floral/80 text-pudgy-oxford p-3 rounded-lg text-xs font-mono border border-pudgy-sky/20 overflow-x-auto mb-2">
            {children}
          </pre>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2 space-y-1 pl-2">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 space-y-1 pl-2">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-sm leading-relaxed">
            {children}
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-pudgy-sky/40 pl-4 py-2 mb-2 bg-pudgy-azure/20 rounded-r-lg italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pudgy-blue hover:text-pudgy-sky underline transition-colors duration-200"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-2">
            <table className="min-w-full border border-pudgy-sky/20 rounded-lg overflow-hidden">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-pudgy-azure/30">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-xs font-bold text-pudgy-oxford border-b border-pudgy-sky/20">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-xs border-b border-pudgy-sky/10">
            {children}
          </td>
        ),
        hr: () => (
          <hr className="border-pudgy-sky/30 my-3" />
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
