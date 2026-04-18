import { ImageProps } from '@mantine/core'
import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { BaseImage } from './BaseImage'

type ChannelImageProps = ImageProps
  & Omit<ComponentPropsWithoutRef<'img'>, 'alt'>
  & {
    alt?: string
  }

export const ChannelImage = forwardRef<HTMLImageElement, ChannelImageProps>(
  ({ ...props }, ref) => {
    return (
      <BaseImage
        ref={ref}
        alt='channel_thumbnail'
        w={40}
        h={40}
        radius='sm'
        {...props}
      />
    )
  },
)
