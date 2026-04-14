import { Box, Image, Text, Tooltip } from '@mantine/core'
import { memo, useMemo } from 'react'
import { Emoji } from '../../src/interface/emoji.interface'

type IProps = {
  message: string
  emojis?: Emoji[]
}

type ChatMessageRun = {
  type: 'text' | 'emoji'
  value: string
}

function escapeRegex(source: string): string {
  return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildRuns(msg: string, emojiTokens: string[]): ChatMessageRun[] {
  if (!msg) {
    return []
  }

  if (!emojiTokens.length) {
    return [{ type: 'text', value: msg }]
  }

  const pattern = emojiTokens
    .slice()
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join('|')

  const regex = new RegExp(`(${pattern})`, 'g')
  const rawParts = msg.split(regex)
  const tokenSet = new Set(emojiTokens)

  return rawParts
    .filter((part) => part.length > 0)
    .map((part) => {
      if (tokenSet.has(part)) {
        return {
          type: 'emoji',
          value: part.slice(1, -1),
        }
      }
      return {
        type: 'text',
        value: part,
      }
    })
}

function extractEmojiTokens(msg: string): string[] {
  if (!msg) {
    return []
  }

  const matches = msg.match(/:\w+:/g)
  if (!matches) {
    return []
  }

  return Array.from(new Set(matches))
}

function ChatMessageComponent({ message, emojis }: IProps) {
  const emojiTokens = useMemo(() => extractEmojiTokens(message), [message])

  const emojiMap = useMemo(() => {
    const map = new Map<string, Emoji>()
    if (!emojiTokens.length) {
      return map
    }

    const labels = new Set(emojiTokens.map((t) => t.slice(1, -1)))
    for (const emoji of (emojis || [])) {
      if (emoji.label && labels.has(emoji.label)) {
        map.set(emoji.label, emoji)
        if (map.size === labels.size) {
          break
        }
      }
    }

    return map
  }, [emojiTokens, emojis])

  const runs = useMemo(() => buildRuns(message, emojiTokens), [message, emojiTokens])

  return (
    <Box
      ta={'justify'}
      style={{ wordBreak: 'break-word' }}
    >
      {
        runs.map((run, index) => {
          if (run.type === 'emoji') {
            const emoji = emojiMap.get(run.value)
            const emojiLabel = `:${run.value}:`

            if (emoji) {
              const thumbnail = emoji.thumbnails[0]
              if (thumbnail) {
                return (
                  <Tooltip
                    key={index}
                    label={emojiLabel}
                  >
                    <Image
                      src={thumbnail.url}
                      w={thumbnail.width}
                      h={thumbnail.height}
                      mx={1}
                      alt={emojiLabel}
                      referrerPolicy='no-referrer'
                      style={{ display: 'inline-block', verticalAlign: 'middle' }}
                    />
                  </Tooltip>
                )
              }
            }

            return (
              <Text
                key={index}
                mx={1}
                span
                style={{ verticalAlign: 'middle' }}
              >{emojiLabel}</Text>
            )
          }

          return (
            <Text
              key={index}
              mx={1}
              span
              style={{ verticalAlign: 'middle' }}
            >{run.value}</Text>
          )
        })
      }
    </Box>
  )
}

const ChatMessage = memo(ChatMessageComponent)

export default ChatMessage
