import React, { Suspense } from 'react'
import PropertiesClient from './PropertiesClient'

export const revalidate = 3600

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}>Loading properties…</div>}>
      <PropertiesClient />
    </Suspense>
  )
}
