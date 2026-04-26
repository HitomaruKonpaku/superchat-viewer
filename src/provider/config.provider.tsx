'use client'

import { useLocalStorage } from '@mantine/hooks'
import { createContext } from 'react'

interface IContext {
  sus?: string
  setSus: (value: string) => void,
}

export const ConfigContext = createContext<IContext>(null as any)

export const ConfigProvider = ({ children }: { children: any }) => {
  const [sus, setSus] = useLocalStorage({
    key: 'sus',
  })

  return (
    <ConfigContext.Provider value={{
      sus,
      setSus,
    }}>
      {children}
    </ConfigContext.Provider>
  )
}
