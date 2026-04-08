export class VideoUtil {
  static toUrl(id: string): string {
    return `https://www.youtube.com/watch?v=${id}`
  }

  static toThumbnailMq(id: string): string {
    return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
  }

  static toThumbnailHq(id: string): string {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  }

  static toThumbnailMaxRes(id: string): string {
    return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
  }
}
