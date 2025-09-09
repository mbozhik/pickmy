import {H3, P} from '~/UI/Typography'

export default function Markdown({content}: {content: string}) {
  if (!content) return null

  // Split content into blocks by lines starting with #
  const blocks = content.split(/\n(?=#)/).filter((block) => block.trim())

  return (
    <section data-block="markdown">
      {blocks.map((block, blockIndex) => {
        const lines = block.trim().split('\n')
        const firstLine = lines[0]

        // Check if first line is a header (# or ##)
        if (firstLine.startsWith('#')) {
          const isMainHeader = firstLine.startsWith('# ') && !firstLine.startsWith('## ')
          const headerText = firstLine.replace(/^#+\s*/, '').trim()
          const contentLines = lines.slice(1).filter((line) => line.trim())

          return (
            <div key={blockIndex} className="space-y-2">
              {isMainHeader ? <H3 className="mt-4">{headerText}</H3> : <P className="mt-1 text-neutral-700">{headerText}</P>}

              {contentLines.length > 0 && (
                <div className="space-y-1">
                  {contentLines.map((line, lineIndex) => (
                    <P className="mt-1 text-neutral-700" key={lineIndex}>
                      {line.trim()}
                    </P>
                  ))}
                </div>
              )}
            </div>
          )
        }

        // If no header, treat as regular paragraph
        return (
          <div key={blockIndex} className="space-y-1">
            {lines
              .filter((line) => line.trim())
              .map((line, lineIndex) => (
                <P className="mt-1 text-neutral-700" key={lineIndex}>
                  {line.trim()}
                </P>
              ))}
          </div>
        )
      })}
    </section>
  )
}
