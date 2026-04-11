'use client'

import { Progress } from '@mantine/core'
import { createContext, Dispatch, SetStateAction, useState } from 'react'

interface IContext {
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
}

export const LoadingContext = createContext<IContext>(null as any)

export const LoadingProvider = ({ children }: { children: any }) => {
  const [loading, setLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {
        loading
        && <Progress value={100} radius='xs' size='sm' striped animated pos='fixed' top={0} w='100%' style={{ zIndex: 5 }} />
      }
      {children}
    </LoadingContext.Provider>
  )
}
