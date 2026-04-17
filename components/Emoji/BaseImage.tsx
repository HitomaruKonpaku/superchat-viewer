import { Image, ImageProps } from '@mantine/core'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

type BaseProps = ImageProps
  & Omit<ComponentPropsWithoutRef<'img'>, 'alt'>
  & {
    alt?: string
  }

export const BaseImage = forwardRef<HTMLImageElement, BaseProps>(
  ({ ...others }, ref) => {
    return (
      <Image
        ref={ref}
        referrerPolicy='no-referrer'
        {...others}
      />
    )
  },
)
