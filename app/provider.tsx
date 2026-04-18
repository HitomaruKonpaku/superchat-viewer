import { Suspense } from 'react'
import { ChannelEmojiProvider } from '../src/provider/channel-emoji.provider'
import { ConfigProvider } from '../src/provider/config.provider'
import { LoadingProvider } from '../src/provider/loading.provider'
import { SearchParamsProvider } from '../src/provider/search-params.provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      <ConfigProvider>
        <Suspense>
          <SearchParamsProvider>
            <ChannelEmojiProvider>
              {children}
            </ChannelEmojiProvider>
          </SearchParamsProvider>
        </Suspense>
      </ConfigProvider>
    </LoadingProvider>
  )
}
