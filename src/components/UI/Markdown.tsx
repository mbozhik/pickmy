import {ReactNode} from 'react'
import {P, H3} from '~/UI/Typography'

// HOW TO USE:
// # Heading
// - List item
// ^^ Bold text
// Regular text becomes P

function parseInlineFormatting(content: string): ReactNode {
  const parts = content.split(/(\^\^[^\^]+\^\^)/g)

  return parts.map((part, index) => {
    if (part.startsWith('^^') && part.endsWith('^^')) {
      const boldText = part.slice(2, -2)
      return (
        <span key={index} className="font-bold">
          {boldText}
        </span>
      )
    }
    return part
  })
}

// Parse markdown content into React elements
function parseMarkdown(content: string): ReactNode[] {
  const lines = content.split('\n')
  const elements: ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Skip empty lines
    if (!trimmedLine) continue

    // # becomes H3
    if (trimmedLine.startsWith('# ')) {
      const headerText = trimmedLine.substring(2)
      elements.push(
        <H3 key={i} className="mt-6 first:mt-0 mb-3">
          {parseInlineFormatting(headerText)}
        </H3>,
      )
      continue
    }

    // List detection - any line starting with "- "
    if (trimmedLine.startsWith('- ')) {
      const listItems: string[] = []

      // Collect consecutive list items
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        listItems.push(lines[i].trim().substring(2))
        i++
      }

      elements.push(
        <ul key={i} className="space-y-1 ml-0 mb-4">
          {listItems.map((item, itemIndex) => (
            <li key={itemIndex} className="flex">
              <P className="text-neutral-700 mr-2">•</P>
              <P className="text-neutral-700 flex-1">{parseInlineFormatting(item)}</P>
            </li>
          ))}
        </ul>,
      )

      i-- // Adjust index since we consumed the last line
      continue
    }

    // Everything else becomes P
    elements.push(
      <P key={i} className="text-neutral-700 mb-3">
        {parseInlineFormatting(line)}
      </P>,
    )
  }

  return elements
}

export default function Markdown({content}: {content: string}) {
  if (!content) return null

  const elements = parseMarkdown(content)

  return (
    <section data-block="markdown" className="space-y-2">
      {elements}
    </section>
  )
}
