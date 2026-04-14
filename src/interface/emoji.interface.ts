import { Thumbnail } from './thumbnail.interface'

export interface Emoji {
  id: string
  channel_id: string
  shortcuts: string[]
  thumbnails: Thumbnail[]
}
