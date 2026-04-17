export async function fetchWithTimeout(
  url: string,
  opts: RequestInit & { timeout?: number } = {},
) {
  const controller = new AbortController()
  const timeoutMs = opts?.timeout ?? 5e3
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const response = await fetch(url, {
    ...opts,
    signal: controller.signal,
  })

  clearTimeout(timeoutId)

  return response
}
