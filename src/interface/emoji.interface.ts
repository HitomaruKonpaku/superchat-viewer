import { Thumbnail } from './thumbnail.interface'

export interface Emoji {
  id: string
  channel_id: string
  search_terms: string[]
  thumbnails: Thumbnail[]
}
