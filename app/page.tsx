'use client'

import { useRouter } from 'next/navigation'
import { useContext, useEffect } from 'react'
import { LoadingContext } from '../src/provider/loading.provider'

export default function HomePage() {
  const router = useRouter()
  const { setLoading } = useContext(LoadingContext)

  useEffect(() => {
    setLoading(true)
    router.replace('/channels')

    return () => {
      setLoading(false)
    }
  }, [])

  return (
    <>
      {/* <Welcome /> */}
      {/* <ColorSchemeToggle /> */}
    </>
  )
}
