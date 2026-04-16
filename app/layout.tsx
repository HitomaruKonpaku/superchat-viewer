import '@mantine/core/styles.css'

import { ColorSchemeScript, mantineHtmlProps, MantineProvider, Stack } from '@mantine/core'
import { Suspense } from 'react'
import { Scroller } from '../components/Scroller/Scroller'
import { ChannelEmojiProvider } from '../src/provider/channel-emoji.provider'
import { LoadingProvider } from '../src/provider/loading.provider'
import { SearchParamsProvider } from '../src/provider/search-params.provider'
import { theme } from '../theme'

export const metadata = {
  // title: 'Mantine Next.js template',
  // description: 'I am using Mantine with Next.js!',
  title: 'superchat-viewer',
  description: 'superchat-viewer',
}

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang='en' {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel='shortcut icon' href='/favicon.svg' />
        <meta
          name='viewport'
          content='minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no'
        />

        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link href='https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap' rel="stylesheet" />
      </head>

      <body>
        <MantineProvider theme={theme} defaultColorScheme='dark' forceColorScheme='dark'>
          <LoadingProvider>
            <Suspense>
              <SearchParamsProvider>
                <ChannelEmojiProvider>
                  <Stack maw={1280} m='auto' mt={8}>
                    {children}
                  </Stack>
                </ChannelEmojiProvider>
              </SearchParamsProvider>
            </Suspense>
          </LoadingProvider>
          <Scroller />
        </MantineProvider>
      </body>
    </html>
  )
}
