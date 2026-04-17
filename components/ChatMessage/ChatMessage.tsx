import { Box, Text, Tooltip } from '@mantine/core'
import { memo, useContext, useMemo } from 'react'
import { EMOJI_DEFAULT_CHANNELS } from '../../src/constant/emoji.constant'
import { Thumbnail } from '../../src/interface/thumbnail.interface'
import { ChannelEmojiContext } from '../../src/provider/channel-emoji.provider'
import { EmojiImage } from '../Emoji/EmojiImage'

type IProps = {
  message: string
  channelId?: string
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

function ChatMessageComponent({ message, channelId }: IProps) {
  const { channelEmojis } = useContext(ChannelEmojiContext)

  const emojiTokens = useMemo(() => extractEmojiTokens(message), [message])

  const runs = useMemo(() => buildRuns(message, emojiTokens), [message, emojiTokens])

  return (
    <Box
      ta={'justify'}
      style={{ wordBreak: 'break-word' }}
    >
      {
        runs.map((run, index) => {
          if (run.type === 'emoji') {
            let thumbnail: Thumbnail | undefined

            if (channelId) {
              thumbnail = channelEmojis?.get(channelId)?.get(run.value)
              if (!thumbnail) {
                for (const key of EMOJI_DEFAULT_CHANNELS) {
                  thumbnail = channelEmojis?.get(key)?.get(run.value)
                  if (thumbnail) {
                    break
                  }
                }
              }
            }

            if (thumbnail) {
              return (
                <Tooltip
                  key={index}
                  label={run.value}
                >
                  <EmojiImage
                    src={thumbnail.url}
                    alt={run.value}
                    w={thumbnail.width}
                    h={thumbnail.height}
                    mx={1}
                    style={{ display: 'inline-block', verticalAlign: 'middle' }}
                  />
                </Tooltip>
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
