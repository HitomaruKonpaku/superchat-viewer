import { ImageProps } from '@mantine/core'
import { ComponentPropsWithoutRef, forwardRef, useEffect, useRef } from 'react'
import { ImageUtil } from '../../src/util/image.util'
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

      const id = ImageUtil.parseYtId(props.src)
      fallbackSrcRef.current = ImageUtil.getFallbackSrc('emoji', id)
    }, [props.src])

    return (
      <BaseImage
        ref={ref}
        alt='emoji'
        fallbackSrc={fallbackSrcRef.current}
        {...props}
      />
    )
  },
)
