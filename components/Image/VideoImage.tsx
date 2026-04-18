import { ImageProps } from '@mantine/core'
import { ComponentPropsWithoutRef, forwardRef } from 'react'
import { BaseImage } from './BaseImage'

type VideoImageProps = ImageProps
  & Omit<ComponentPropsWithoutRef<'img'>, 'alt'>
  & {
    alt?: string
  }

export const VideoImage = forwardRef<HTMLImageElement, VideoImageProps>(
  ({ ...props }, ref) => {
    return (
      <BaseImage
        ref={ref}
        alt='video_thumbnail'
        maw={320}
        mah={180}
        radius='sm'
        {...props}
      />
    )
  },
)
