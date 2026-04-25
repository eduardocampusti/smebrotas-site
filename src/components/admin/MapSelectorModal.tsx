import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Correção para ícones do Leaflet no ambiente Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

L.Marker.prototype.options.icon = DefaultIcon

// Coordenadas padrão: Brotas de Macaúbas, BA
const BROTAS_CENTER: [number, number] = [-12.0005, -42.6288]

interface MapSelectorModalProps {
  initialCoords?: { lat: number | null; lng: number | null }
  address?: string
  onConfirm: (lat: number, lng: number) => void
  onClose: () => void
}

// Componente auxiliar para atualizar o centro do mapa programaticamente
function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

// Componente para capturar cliques no mapa
function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapSelectorModal({ initialCoords, address, onConfirm, onClose }: MapSelectorModalProps) {
  const [position, setPosition] = useState<[number, number]>(() => {
    if (initialCoords?.lat && initialCoords?.lng) {
      return [initialCoords.lat, initialCoords.lng]
    }
    return BROTAS_CENTER
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>(position)

  // Busca inicial por endereço se não houver coordenadas
  useEffect(() => {
    if (!initialCoords?.lat && address && address.trim().length > 5) {
      handleSearch(address)
    }
  }, [])

  const handleSearch = async (query: string) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    try {
      // Adiciona contexto de Brotas de Macaúbas se a busca for muito genérica
      const fullQuery = query.toLowerCase().includes('brotas') ? query : `${query}, Brotas de Macaúbas, BA`
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)]
        setPosition(newPos)
        setMapCenter(newPos)
      }
    } catch (error) {
      console.error('Erro na busca Nominatim:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleMarkerDrag = (e: L.LeafletEvent) => {
    const marker = e.target as L.Marker
    const { lat, lng } = marker.getLatLng()
    setPosition([lat, lng])
  }

  const eventHandlers = useMemo(
    () => ({
      dragend: handleMarkerDrag,
    }),
    []
  )

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">map</span>
              Selecionar Localização
            </h3>
            <p className="text-xs text-slate-500 font-medium">Clique no mapa ou arraste o marcador para definir o ponto</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        {/* Search Bar Overlay */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Buscar endereço ou local..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-sm"
            />
          </div>
          <button 
            onClick={() => handleSearch(searchQuery)}
            disabled={isSearching}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Buscar'
            )}
          </button>
        </div>

        {/* Map Container */}
        <div className="relative h-[450px] w-full bg-slate-100 dark:bg-slate-800">
          <MapContainer 
            center={mapCenter} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} />
            <MapEvents onLocationSelect={(lat, lng) => {
              setPosition([lat, lng])
              setMapCenter([lat, lng])
            }} />
            <Marker 
              position={position} 
              draggable={true}
              eventHandlers={eventHandlers}
            />
          </MapContainer>
          
          {/* Zoom Controls Custom */}
          <div className="absolute right-4 bottom-4 z-[1000] flex flex-col gap-2">
            <button 
              onClick={() => {}} // Leaflet handles this via default, but we can custom if needed
              className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors font-bold text-xl"
            >
              +
            </button>
          </div>

          {/* Coordinates Info Overlay */}
          <div className="absolute left-4 bottom-4 z-[1000] px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Latitude</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{position[0].toFixed(6)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Longitude</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{position[1].toFixed(6)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm(position[0], position[1])}
            className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all transform active:scale-95"
          >
            Confirmar Localização
          </button>
        </div>
      </div>
    </div>
  )
}
