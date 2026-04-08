export class HolodexUtil {
  static toChannelUrl(id: string): string {
    return `https://holodex.net/channel/${id}`
  }

  static toVideoUrl(id: string): string {
    return `https://holodex.net/watch/${id}`
  }
}
