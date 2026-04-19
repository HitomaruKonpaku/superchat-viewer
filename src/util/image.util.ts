export class ImageUtil {
  public static parseYtId(url: string) {
    const id = url
      ?.replace(/=[sw]\d{2,}[\w-]+$/, '')
      ?.replace('https://yt3.ggpht.com/', '')
    return id
  }

  public static getFallbackSrc(type: 'badge' | 'emoji', id: string, size = 24) {
    const url = new URL(location.href)
    url.search = ''
    url.pathname = [
      'public',
      type,
      String(size).padStart(2, '0'),
      id,
    ].join('/')
    return url.href
  }
}
