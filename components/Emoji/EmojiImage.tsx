import { ImageProps } from '@mantine/core'
import { ComponentPropsWithoutRef, forwardRef, useEffect, useRef } from 'react'
import { BaseImage } from './BaseImage'

type EmojiImageProps = ImageProps
  & Omit<ComponentPropsWithoutRef<'img'>, 'alt'>
  & {
    alt?: string
  }

export const EmojiImage = forwardRef<HTMLImageElement, EmojiImageProps>(
  ({ ...props }, ref) => {
    const fallbackSrcRef = useRef<string | undefined>(undefined)

    useEffect(() => {
      if (!props.src) {
        return
      }

      try {
        const idx = props.src.lastIndexOf('=')
        const id = props.src
          .substring(0, idx != -1 ? idx : props.src.length + 1)
          .replace('https://yt3.ggpht.com/', '')

        const url = new URL(location.href)
        url.search = ''
        url.pathname = [
          'public',
          'emoji',
          '24',
          id,
        ].join('/')

        fallbackSrcRef.current = url.href
      } catch {
        // ignore
      }
    }, [props.src])

    return (
      <BaseImage
        ref={ref}
        fallbackSrc={fallbackSrcRef.current}
        {...props}
      />
    )
  },
)
