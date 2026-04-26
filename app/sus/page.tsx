'use client'

import { useRouter } from 'next/navigation'
import { useContext, useEffect } from 'react'
import { ConfigContext } from '../../src/provider/config.provider'

export default function HomePage() {
  const router = useRouter()
  const { setSus } = useContext(ConfigContext)

  useEffect(() => {
    setSus('1')
    router.replace('/channels')

    return () => {
    }
  }, [])

  return (
    <>
    </>
  )
}
