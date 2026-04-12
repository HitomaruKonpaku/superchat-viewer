'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createContext, Dispatch, SetStateAction, useState } from 'react'

interface IContext {
  searchParams: URLSearchParams
  setSearchParams: Dispatch<SetStateAction<URLSearchParams>>
  clearParams: () => void
  applyParams: (obj: Record<string, any>) => void
  qs: () => string
}

export const SearchParamsContext = createContext<IContext>(null as any)

export const SearchParamsProvider = ({ children }: { children: any }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [_searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams(searchParams.toString()))

  function updateRouter() {
    const qs = _searchParams.toString()
    const href = `${pathname}?${qs}`
    router.push(href)
  }

  function clearParams() {
    setSearchParams(new URLSearchParams())
  }

  function applyParams(obj: Record<string, any>) {
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      if ([undefined, null, ''].includes(value)) {
        _searchParams.delete(key)
      } else {
        _searchParams.set(key, value)
      }
    })
    updateRouter()
  }

  function qs() {
    return searchParams.toString()
  }

  return (
    <SearchParamsContext.Provider value={{
      searchParams: _searchParams,
      setSearchParams,
      clearParams,
      applyParams,
      qs,
    }}>
      {children}
    </SearchParamsContext.Provider>
  )
}
