import '@mantine/core/styles.css'

import { ColorSchemeScript, mantineHtmlProps, MantineProvider, Stack } from '@mantine/core'
import { Suspense } from 'react'
import { Scroller } from '../components/Scroller/Scroller'
import { LoadingProvider } from '../src/provider/loading.provider'
import { theme } from '../theme'

export const metadata = {
  // title: 'Mantine Next.js template',
  // description: 'I am using Mantine with Next.js!',
  title: 'superchat-viewer',
  description: 'superchat-viewer',
}

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>

      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
          <LoadingProvider>
            <Stack maw={1280} m="auto" mt={8}>
              <Suspense >
                {children}
              </Suspense>
            </Stack>
          </LoadingProvider>
          <Scroller />
        </MantineProvider>
      </body>
    </html>
  )
}
