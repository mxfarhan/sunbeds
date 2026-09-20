'use client';

import { useEffect, useRef, useState } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { useTranslation } from '@/hooks/useTranslation';

const libraries: ('places')[] = ['places'];

interface PlacesAddressSearchProps {
  onPlaceSelected: (place: {
    address: string;
    latitude: number;
    longitude: number;
    place_id?: string;
  }) => void;
  className?: string;
  placeholder?: string;
}

const PlacesAddressSearch = ({
  onPlaceSelected,
  className = '',
  placeholder,
}: PlacesAddressSearchProps) => {
  const { t } = useTranslation();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'pliiz-places-loader',
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY ?? '',
    libraries,
  });

  useEffect(() => {
    if (!isLoaded && inputRef.current) {
      // keep input usable even before maps loads
    }
  }, [isLoaded]);

  const onLoad = (instance: google.maps.places.Autocomplete) => {
    setAutocomplete(instance);
  };

  const onPlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    const loc = place.geometry?.location;
    if (!loc) return;

    onPlaceSelected({
      address: place.formatted_address || place.name || '',
      latitude: loc.lat(),
      longitude: loc.lng(),
      place_id: place.place_id,
    });

    if (inputRef.current && (place.formatted_address || place.name)) {
      inputRef.current.value = place.formatted_address || place.name || '';
    }
  };

  if (!isLoaded) {
    return (
      <div className={`relative ${className}`}>
        <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 textSecondaryColor text-lg" />
        <input
          disabled
          className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm outline-none"
          placeholder={t('loading') || 'Loading...'}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged} options={{ fields: ['formatted_address', 'geometry', 'name', 'place_id'] }}>
        <div className="relative">
          <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 textSecondaryColor text-lg pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[var(--primary-color)]"
            placeholder={placeholder || t('searchAddress') || 'Search an address...'}
          />
        </div>
      </Autocomplete>
    </div>
  );
};

export default PlacesAddressSearch;
