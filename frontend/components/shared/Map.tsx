'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

type LeafletIconDefaultPrototype = {
  _getIconUrl?: unknown
}

// Fix default marker icon issue with Next.js
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as LeafletIconDefaultPrototype)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

interface MapProps {
  latitude: number
  longitude: number
  propertyName: string
  address: string
}

export default function Map({ latitude, longitude, propertyName, address }: MapProps) {
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={14}
      style={{ height: '400px', width: '100%', zIndex: 1 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>
          <div style={{ fontFamily: 'Georgia, serif' }}>
            <strong>{propertyName}</strong>
            <br />
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{address}</span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}
