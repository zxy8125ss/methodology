import React from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
})

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const html = React.useMemo(() => {
    try {
      const rawHtml = marked(content) as string
      return DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'ul', 'ol', 'li', 'blockquote',
          'pre', 'code', 'em', 'strong', 'del', 'hr',
          'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'br', 'span', 'div'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
      })
    } catch {
      return content
    }
  }, [content])

  return (
    <div
      className={`prose ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
