import { Suspense } from 'react'
import EventsPageClient from './EventsPageClient'

export default function EventPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>}>
      <EventsPageClient />
    </Suspense>
  )
}
