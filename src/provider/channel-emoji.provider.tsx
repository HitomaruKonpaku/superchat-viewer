'use client'

import { createContext, useRef, useState } from 'react'
import { ChannelEmojis, Emoji } from '../interface/emoji.interface'
import { Thumbnail } from '../interface/thumbnail.interface'

interface Item {
  channel_id: string,
  emojis: Partial<Emoji[]>
}

interface IContext {
  channelEmojis: ChannelEmojis
  addItems(items: Item[]): void
}

export const ChannelEmojiContext = createContext<IContext>(null as any)

export const ChannelEmojiProvider = ({ children }: { children: any }) => {
  const valueRef = useRef<ChannelEmojis>(new Map())

  const [, setVersion] = useState(0)

  function addItems(items: Item[]) {
    if (!items.length) {
      return
    }
    items.forEach(v => addItem(v))
    setVersion((v) => v + 1)
  }

  function addItem(item: Item) {
    const empjiMap = new Map<string, Thumbnail>()
    valueRef.current.set(item.channel_id, empjiMap)

    item.emojis.forEach(emoji => {
      if (!emoji) {
        return
      }

      const thumbnail = emoji.thumbnails?.find(v => v)
      if (!thumbnail) {
        return
      }

      emoji.shortcuts?.forEach(key => {
        if (!key) {
          return
        }

        empjiMap.set(key, thumbnail)
      })
    })
  }

  return (
    <ChannelEmojiContext.Provider value={{
      channelEmojis: valueRef.current,
      addItems,
    }}>
      {children}
    </ChannelEmojiContext.Provider>
  )
}
