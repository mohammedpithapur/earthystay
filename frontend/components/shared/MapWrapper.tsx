'use client'
import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '400px',
      backgroundColor: '#E5E0D8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <span style={{ fontSize: '32px' }}>🗺️</span>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Loading map...</p>
    </div>
  )
})

interface MapWrapperProps {
  latitude: number
  longitude: number
  propertyName: string
  address: string
}

export default function MapWrapper(props: MapWrapperProps) {
  return <Map {...props} />
}
