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

function buildRuns(msg: string, emojiTokens: Set<string>): ChatMessageRun[] {
  if (!msg) {
    return []
  }

  if (!emojiTokens.size) {
    return [{ type: 'text', value: msg }]
  }

  const pattern = [...emojiTokens]
    .map(escapeRegex)
    .join('|')

  const regex = new RegExp(`(${pattern})`, 'g')
  const rawParts = msg.split(regex)
  const runs = rawParts
    .filter((part) => part.length > 0)
    .map((part) => {
      if (emojiTokens.has(part)) {
        return {
          type: 'emoji',
          value: part,
        }
      }
      return {
        type: 'text',
        value: part,
      }
    }) as ChatMessageRun[]

  return runs
}

function extractEmojiTokens(msg: string): Set<string> {
  if (!msg) {
    return new Set()
  }

  const matches = msg.match(/:[^:\s]+:/g)
  if (!matches) {
    return new Set()
  }

  const tokens = new Set(matches)
  return tokens
}

function ChatMessageComponent({ message, emojis }: IProps) {
  const emojiTokens = useMemo(() => extractEmojiTokens(message), [message])

  const emojiMap = useMemo(() => {
    const map = new Map<string, Emoji>()
    if (!emojiTokens.size) {
      return map
    }

    for (const emoji of (emojis || [])) {
      const key = emoji.shortcuts.find((v) => emojiTokens.has(v))
      if (key) {
        map.set(key, emoji)
        if (map.size === emojiTokens.size) {
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
            if (emoji) {
              const thumbnail = emoji.thumbnails[0]
              if (thumbnail) {
                return (
                  <Tooltip
                    key={index}
                    label={run.value}
                  >
                    <Image
                      src={thumbnail.url}
                      w={thumbnail.width}
                      h={thumbnail.height}
                      mx={1}
                      alt={run.value}
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
              >{run.value}</Text>
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
