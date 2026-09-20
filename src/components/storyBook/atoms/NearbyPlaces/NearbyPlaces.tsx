'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Typography } from '../Typography'
import Divider from '../Divider'
import { useIsMobile } from '@/hooks/useMobile'
import { NearbyPlacesGroup } from '@/hooks/queries/useNearbyPlaces'
import { GoogleMap, useJsApiLoader, OverlayViewF, OVERLAY_MOUSE_TARGET } from '@react-google-maps/api'
import ImagePreview from '../ImagePreview'
import { PiArrowUpRight, PiStar, PiX, PiArrowsOut, PiArrowsIn, PiArrowsOutSimple } from 'react-icons/pi'
import { useTranslation } from '@/hooks/useTranslation'

interface FlatPlace {
    id: number
    name: string
    distance_km: string
    address: string
    latitude: string
    longitude: string
    rating: string
    google_place_id: string
    categoryName: string
    categoryIcon: string
}

interface NearbyPlacesProps {
    placesGroups?: NearbyPlacesGroup[]
    lat?: string | number
    lng?: string | number
    className?: string
}

const INITIAL_VISIBLE = 5

function formatDistance(km: string): string {
    const val = parseFloat(km)
    if (val < 1) return `${Math.round(val * 1000)} M`
    return `${val.toFixed(1)} KM`
}

const mapContainerStyle = { width: '100%', height: '100%' }

const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    scrollwheel: true,
    styles: [
        { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }] },
        { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    ],
}

const getPinOffset = (w: number, h: number) => ({ x: -(w / 2), y: -h })
const getPopupOffset = (_w: number, _h: number) => ({ x: -(_w / 2), y: -(_h + 60) })

// ─── PropertyPin ────────────────────────────────────────────────────────────

const PropertyPin: React.FC = () => (
    <div style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.30))', cursor: 'default' }}>
        <svg width="33" height="48" viewBox="0 0 33 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_8674_44538)">
                <path d="M0.394059 16.2449C0.440106 8.69524 6.13461 2.1083 13.6454 0.790911C22.2153 -0.713951 30.6368 5.02682 32.1922 13.7672C32.6578 16.3817 32.2536 18.8746 31.3736 21.3371C29.895 25.4767 27.828 29.3428 25.6279 33.1378C23.0493 37.5866 20.2506 41.8934 17.3036 46.109C17.2166 46.2307 17.1348 46.3573 17.0376 46.4739C16.6283 46.9451 16.1422 46.9501 15.7636 46.4587C15.4361 46.0381 15.1343 45.5922 14.8324 45.1514C10.8672 39.3752 7.10672 33.4824 3.96016 27.2197C2.65549 24.6154 1.4685 21.9603 0.772672 19.1229C0.542436 18.1804 0.363361 17.2279 0.394059 16.255V16.2449ZM16.4287 5.65005C10.6575 5.55884 5.50018 10.2052 5.51553 16.5185C5.52577 22.3961 10.4682 27.1944 16.4594 27.1691C22.5018 27.1488 27.3266 22.2846 27.301 16.2601C27.2703 10.4281 22.3483 5.61964 16.4338 5.65005H16.4287Z" fill="var(--primary-color, #1A73E8)" />
                <ellipse cx="16.3727" cy="16.5186" rx="11.4606" ry="11.3498" fill="white" />
                <path d="M16.352 21.6153C15.0371 21.6153 13.7222 21.6153 12.4073 21.6153C11.6347 21.6153 11.3635 21.3721 11.3533 20.602C11.338 19.3656 11.3431 18.1293 11.3533 16.8981C11.3533 16.5434 11.3328 16.3103 10.857 16.2799C10.3045 16.2444 10.064 15.6516 10.3659 15.1905C10.4477 15.0639 10.5603 14.9625 10.6677 14.8561C12.3101 13.2246 13.9575 11.5981 15.605 9.97166C16.2087 9.37883 16.5515 9.3687 17.1399 9.95139C18.8027 11.588 20.4553 13.2297 22.1181 14.8663C22.3381 15.0841 22.5325 15.3121 22.5018 15.6466C22.466 16.057 22.2256 16.3255 21.8265 16.3154C21.3916 16.3002 21.3814 16.5181 21.3814 16.8373C21.3916 18.0736 21.3865 19.3099 21.3814 20.5412C21.3814 21.3671 21.1255 21.6153 20.2967 21.6153C18.9818 21.6153 17.6669 21.6153 16.352 21.6153Z" fill="var(--primary-color, #1A73E8)" />
            </g>
            <defs>
                <clipPath id="clip0_8674_44538">
                    <rect width="32.7447" height="47.6286" fill="white" />
                </clipPath>
            </defs>
        </svg>
    </div>
)

const getPropertyPinOffset = (w: number, h: number) => ({ x: -(w / 2), y: -h })

// ─── PlacePin ───────────────────────────────────────────────────────────────

interface PlacePinProps {
    iconUrl: string
    isActive: boolean
    onHover: (hovered: boolean) => void
}

const PlacePin: React.FC<PlacePinProps> = ({ iconUrl, isActive, onHover }) => {
    const w = isActive ? 44 : 36
    const tailH = isActive ? 14 : 11
    const totalH = w + tailH
    const cx = w / 2
    const iconSize = isActive ? 22 : 18
    const iconOffset = (w - iconSize) / 2

    return (
        <div
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            className="cursor-pointer select-none"
            style={{ width: w, height: totalH, position: 'relative', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.28))' }}
        >
            <svg width={w} height={totalH} viewBox={`0 0 ${w} ${totalH}`} style={{ position: 'absolute', top: 0, left: 0 }}>
                <circle cx={cx} cy={cx} r={cx - 2} fill="white" stroke="#d1d5db" strokeWidth="1.5" />
                <polygon points={`${cx - 5},${w - 5} ${cx + 5},${w - 5} ${cx},${totalH}`} fill="white" />
            </svg>
            <img src={iconUrl} alt="" style={{ position: 'absolute', top: iconOffset, left: iconOffset, width: iconSize, height: iconSize, objectFit: 'contain' }} />
        </div>
    )
}

// ─── PlacePopup ─────────────────────────────────────────────────────────────

interface PlacePopupProps {
    place: FlatPlace
    onClose: () => void
}

const PlacePopup: React.FC<PlacePopupProps> = ({ place, onClose }) => (
    <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '12px 14px', width: 220, position: 'relative', pointerEvents: 'all' }}>
        <button onClick={e => { e.stopPropagation(); onClose() }} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}>
            <PiX size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <img src={place.categoryIcon} alt={place.categoryName} style={{ width: 16, height: 16, objectFit: 'contain' }} />
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{place.categoryName}</span>
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1.3, paddingRight: 16 }}>{place.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{formatDistance(place.distance_km)}</span>
            {place.rating && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#6b7280' }}>
                    <PiStar style={{ color: '#f59e0b' }} />{place.rating}
                </span>
            )}
        </div>
        <a
            href={`https://www.google.com/maps/place/?q=place_id:${place.google_place_id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--primary-color, #1A73E8)', textDecoration: 'none' }}
        >
            View on Google Maps <PiArrowUpRight size={13} />
        </a>
        <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '9px solid white', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.08))' }} />
    </div>
)

// ─── MapView (reusable for normal + fullscreen) ──────────────────────────────

interface MapViewProps {
    center: google.maps.LatLngLiteral
    places: FlatPlace[]
    activePlace: FlatPlace | null
    onPlaceHover: (place: FlatPlace | null) => void
    onPopupClose: () => void
    onMapClick: () => void
    onLoad: (m: google.maps.Map) => void
    onUnmount: () => void
}

const MapView: React.FC<MapViewProps> = ({ center, places, activePlace, onPlaceHover, onPopupClose, onMapClick, onLoad, onUnmount }) => {
    // Set initial center once on load — never re-center on re-renders
    const handleLoad = useCallback((m: google.maps.Map) => {
        m.setCenter(center)
        m.setZoom(12)
        onLoad(m)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            options={mapOptions}
            onLoad={handleLoad}
            onUnmount={onUnmount}
            onClick={onMapClick}
        >
            <OverlayViewF position={center} mapPaneName={OVERLAY_MOUSE_TARGET} getPixelPositionOffset={getPropertyPinOffset} zIndex={500}>
                <PropertyPin />
            </OverlayViewF>
            {places.map(place => {
                const pos = { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) }
                const isActive = activePlace?.id === place.id
                return (
                    <OverlayViewF key={place.id} position={pos} mapPaneName={OVERLAY_MOUSE_TARGET} getPixelPositionOffset={getPinOffset} zIndex={isActive ? 100 : 1}>
                        <PlacePin iconUrl={place.categoryIcon} isActive={isActive} onHover={hovered => onPlaceHover(hovered ? place : null)} />
                    </OverlayViewF>
                )
            })}
            {activePlace && (
                <OverlayViewF
                    position={{ lat: parseFloat(activePlace.latitude), lng: parseFloat(activePlace.longitude) }}
                    mapPaneName={OVERLAY_MOUSE_TARGET}
                    getPixelPositionOffset={getPopupOffset}
                    zIndex={999}
                >
                    <div style={{ position: 'relative', zIndex: 999 }}>
                        <PlacePopup place={activePlace} onClose={onPopupClose} />
                    </div>
                </OverlayViewF>
            )}
        </GoogleMap>
    )
}

// ─── Main component ──────────────────────────────────────────────────────────

const NearbyPlaces: React.FC<NearbyPlacesProps> = ({ placesGroups, lat, lng, className = '' }) => {

    const { t } = useTranslation();

    const isMobile = useIsMobile()
    const [activePlace, setActivePlace] = useState<FlatPlace | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showAll, setShowAll] = useState(false)
    const mapRef = useRef<google.maps.Map | null>(null)
    const fsMapRef = useRef<google.maps.Map | null>(null)

    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY ?? '' })

    const onLoad = useCallback((m: google.maps.Map) => { mapRef.current = m }, [])
    const onUnmount = useCallback(() => { mapRef.current = null }, [])
    const onFsLoad = useCallback((m: google.maps.Map) => { fsMapRef.current = m }, [])
    const onFsUnmount = useCallback(() => { fsMapRef.current = null }, [])

    if (!placesGroups || placesGroups.length === 0) return null

    const allPlaces: FlatPlace[] = placesGroups.flatMap(group =>
        group.places.map(place => ({
            id: place.id,
            name: place.name,
            distance_km: place.distance_km,
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            rating: place.rating,
            google_place_id: place.google_place_id,
            categoryName: group.category.name,
            categoryIcon: group.category.icon,
        }))
    )

    const totalExtra = allPlaces.length - INITIAL_VISIBLE
    const visiblePlaces = showAll ? allPlaces : allPlaces.slice(0, INITIAL_VISIBLE)

    const propertyCenter =
        lat && lng ? { lat: parseFloat(String(lat)), lng: parseFloat(String(lng)) } : { lat: 20.5937, lng: 78.9629 }

    const handlePlaceClick = (place: FlatPlace) => {
        setActivePlace(place)
        const ref = isFullscreen ? fsMapRef.current : mapRef.current
        if (ref) {
            ref.panTo({ lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) })
            ref.setZoom(15)
        }
    }

    const handlePlaceHover = (place: FlatPlace | null) => {
        setActivePlace(place)
    }

    const mapSharedProps = {
        center: propertyCenter,
        places: allPlaces,
        activePlace,
        onPlaceHover: handlePlaceHover,
        onPopupClose: () => setActivePlace(null),
        onMapClick: () => setActivePlace(null),
    }

    return (
        <>
            <div className={`bg-white rounded-2xl md:border ${isMobile ? 'container' : ''} overflow-hidden p-4 flex flex-col gap-y-4 items-start w-full ${className}`}>
                <Typography variant="h5" weight="semibold">{t("locationNearPlaces")}</Typography>

                <Divider width='bleed'/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Map */}
                    <div className="rounded-xl overflow-hidden h-72 md:h-full min-h-64 relative">
                        {isLoaded ? (
                            <>
                                <MapView
                                    {...mapSharedProps}
                                    onLoad={onLoad}
                                    onUnmount={onUnmount}
                                />
                                {/* Fullscreen button — top right */}
                                <button
                                    onClick={() => setIsFullscreen(true)}
                                    className="absolute top-3 right-3 z-10 bg-black rounded-full p-2"
                                    title="Fullscreen"
                                >
                                    <PiArrowsOutSimple className="text-xl text-white" />
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-full bodyBg animate-pulse rounded-xl" />
                        )}
                    </div>

                    {/* Places list */}
                    <div className="flex flex-col gap-0 bodyBg rounded-2xl p-4">
                        <Typography variant="h6" weight="semibold" className="mb-3">{t("nearbyPlaces")}</Typography>
                        <div className='flex flex-col gap-4'>
                            {visiblePlaces.map(place => {
                                const isActive = activePlace?.id === place.id
                                return (
                                    <button
                                        key={place.id}
                                        onClick={() => handlePlaceClick(place)}
                                        className={`flex items-center justify-between py-3 border-b border-gray-100 last:border-0 w-full text-left transition-colors rounded-lg px-2 -mx-2 bg-white ${isActive ? 'border primaryBorder' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="shrink-0 h-6 w-6 flex items-center justify-center">
                                                <ImagePreview src={place.categoryIcon} alt={place.categoryName} className="h-5 w-5 object-contain" />
                                            </span>
                                            <Typography variant="desc1" weight={isActive ? 'semibold' : 'medium'} className="truncate">
                                                {place.name}
                                            </Typography>
                                        </div>
                                        <Typography variant="desc2" className="textSecondaryColor shrink-0 ml-4">
                                            {formatDistance(place.distance_km)}
                                        </Typography>
                                    </button>
                                )
                            })}
                        </div>

                        {totalExtra > 0 && !showAll && (
                            <button
                                onClick={() => setShowAll(true)}
                                className="mt-2 text-sm font-medium primaryColor text-left"
                            >
                                View {totalExtra}+ More
                            </button>
                        )}
                        {showAll && (
                            <button
                                onClick={() => setShowAll(false)}
                                className="mt-2 text-sm font-medium primaryColor text-left"
                            >
                                Show Less
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Fullscreen map — full viewport, no modal ── */}
            {isFullscreen && isLoaded && (
                <div className="fixed inset-0 z-50">
                    <MapView
                        {...mapSharedProps}
                        onLoad={onFsLoad}
                        onUnmount={onFsUnmount}
                    />
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-2 hover:bg-gray-50 transition-colors"
                        title="Exit fullscreen"
                    >
                        <PiArrowsIn className="text-lg text-gray-600" />
                    </button>
                </div>
            )}

        </>
    )
}

export default NearbyPlaces
