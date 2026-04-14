import { Thumbnail } from './thumbnail.interface'

export interface Emoji {
  id: string
  channel_id: string
  label: string
  thumbnails: Thumbnail[]
}
