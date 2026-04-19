import { ImageProps } from '@mantine/core'
import { ComponentPropsWithoutRef, forwardRef, useEffect, useRef } from 'react'
import { ImageUtil } from '../../src/util/image.util'
import { BaseImage } from './BaseImage'

type BadgeImageProps = ImageProps
  & Omit<ComponentPropsWithoutRef<'img'>, 'alt'>
  & {
    alt?: string
  }

export const BadgeImage = forwardRef<HTMLImageElement, BadgeImageProps>(
  ({ ...props }, ref) => {
    const fallbackSrcRef = useRef<string | undefined>(undefined)

    useEffect(() => {
      if (!props.src) {
        return
      }

      const id = ImageUtil.parseYtId(props.src)
      fallbackSrcRef.current = ImageUtil.getFallbackSrc('badge', id, 32)
    }, [props.src])

    return (
      <BaseImage
        ref={ref}
        alt='badge'
        fallbackSrc={fallbackSrcRef.current}
        {...props}
      />
    )
  },
)
