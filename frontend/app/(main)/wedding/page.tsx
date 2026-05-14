'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WeddingPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/events?type=Wedding')
  }, [router])

  return null
}
