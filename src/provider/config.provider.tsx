'use client'

import { useLocalStorage } from '@mantine/hooks'
import { createContext } from 'react'

interface IContext {
  sus: any
}

export const ConfigContext = createContext<IContext>(null as any)

export const ConfigProvider = ({ children }: { children: any }) => {
  const [sus] = useLocalStorage({
    key: 'sus',
  })

  return (
    <ConfigContext.Provider value={{
      sus,
    }}>
      {children}
    </ConfigContext.Provider>
  )
}
