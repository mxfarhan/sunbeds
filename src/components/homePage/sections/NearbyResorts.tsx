'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import SectionInfo from '@/components/storyBook/molecules/SectionInfo';
import { ResortCard } from '@/hooks/queries/useResortsHome';
import ResortCardItem from './ResortCardItem';
import PlacesAddressSearch from './PlacesAddressSearch';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDirection } from '@/utils/helpers';
import { NearbyLocation } from '@/hooks/useMarketCountry';
import { PiMapPin, PiNavigationArrow } from 'react-icons/pi';
import {
  RESORT_CARD_CAROUSEL_DESKTOP,
  RESORT_CARD_CAROUSEL_MOBILE,
} from './resortCardLayout';

const RADIUS_OPTIONS = [20, 40, 60, 100, 150, 200] as const;

interface NearbyResortsProps {
  resorts: ResortCard[];
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  location: NearbyLocation | null;
  locationDenied: boolean;
  locationError?: 'denied' | 'insecure' | 'unavailable' | null;
  onRequestGps: () => void;
  onPlaceSelected: (place: NearbyLocation) => void;
}

const NearbyResorts = ({
  resorts,
  radiusKm,
  onRadiusChange,
  location,
  locationDenied,
  locationError = null,
  onRequestGps,
  onPlaceSelected,
}: NearbyResortsProps) => {
  const { t } = useTranslation();
  const [editingLocation, setEditingLocation] = useState(false);
  const hasLocation = Boolean(location?.latitude && location?.longitude);

  const handlePlaceSelected = (place: {
    address: string;
    latitude: number;
    longitude: number;
    place_id?: string;
  }) => {
    onPlaceSelected({
      latitude: place.latitude,
      longitude: place.longitude,
      address: place.address,
      place_id: place.place_id,
      source: 'places',
    });
    setEditingLocation(false);
  };

  const handleLocateMe = () => {
    // Keep the panel open so Safari insecure / denied errors stay visible;
    // selecting a Places address still closes via handlePlaceSelected.
    onRequestGps();
  };

  const locationLabel =
    location?.address?.trim() ||
    (hasLocation ? t('currentLocation') || 'Current location' : '');

  const locationLine = hasLocation && locationLabel ? (
    <div className="mb-4 max-w-full">
      <button
        type="button"
        onClick={() => setEditingLocation((open) => !open)}
        className="group flex items-center gap-1.5 max-w-full min-w-0 primaryColor text-sm font-medium text-left hover:opacity-80 transition-opacity"
        title={t('editLocation') || 'Edit location'}
        aria-expanded={editingLocation}
      >
        <PiMapPin className="shrink-0 text-base" />
        <span className="shrink-0 opacity-70" aria-hidden>
          ·
        </span>
        <span className="min-w-0 truncate underline-offset-2 group-hover:underline">
          {locationLabel}
        </span>
      </button>

      {editingLocation && (
        <div className="mt-3 rounded-2xl border bg-[var(--neutral-50,#f8fafc)] p-4 space-y-3">
          {locationError === 'insecure' ? (
            <p className="text-sm textSecondaryColor">
              {t('locationInsecureHint') ||
                'Location needs HTTPS on iPhone Safari. Open the site over https, or search an address below.'}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleLocateMe}
              className="inline-flex items-center justify-center gap-2 rounded-xl primaryBg text-white px-4 py-2.5 text-sm font-medium"
            >
              <PiNavigationArrow className="text-lg" />
              {t('locateMe') || t('enableLocation') || 'Locate me'}
            </button>
          )}
          <div className="flex items-center gap-2 text-xs textSecondaryColor">
            <span className="flex-1 h-px bg-gray-200" />
            {t('or') || 'or'}
            <span className="flex-1 h-px bg-gray-200" />
          </div>
          <PlacesAddressSearch
            className="w-full"
            placeholder={t('searchAddress') || 'Search an address...'}
            onPlaceSelected={handlePlaceSelected}
          />
        </div>
      )}
    </div>
  ) : null;

  return (
    <section className="container mt-8 md:mt-10">
      <div className="flex items-center justify-between gap-4 mb-5">
        <SectionInfo title={t('nearbyResorts') || 'Nearby resorts'} className="mb-0" />
        {hasLocation && (
          <Select
            value={String(radiusKm)}
            onValueChange={(value) => onRadiusChange(Number(value))}
          >
            <SelectTrigger className="h-10 min-w-[7.5rem] rounded-xl border-gray-200 bg-white shadow-sm px-3">
              <SelectValue placeholder={`${radiusKm} km`} />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {RADIUS_OPTIONS.map((km) => (
                <SelectItem key={km} value={String(km)}>
                  {km} {t('km') || 'km'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!hasLocation ? (
        <div className="rounded-2xl border bg-[var(--neutral-50,#f8fafc)] p-5 space-y-4">
          <p className="text-sm textSecondaryColor">
            {locationError === 'insecure'
              ? t('locationInsecureHint') ||
                'Location needs HTTPS on iPhone Safari. Open the site over https, or search an address below.'
              : locationDenied || locationError === 'denied'
                ? t('locationDeniedHint') ||
                  'Location is blocked. Enable it in browser settings, or search an address below.'
                : t('enableLocationHint') ||
                  'Enable location to see nearby resorts, or search for an address.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {locationError !== 'insecure' && (
              <button
                type="button"
                onClick={onRequestGps}
                className="inline-flex items-center justify-center gap-2 rounded-xl primaryBg text-white px-4 py-2.5 text-sm font-medium shrink-0"
              >
                <PiMapPin className="text-lg" />
                {t('enableLocation') || 'Enable location'}
              </button>
            )}
            {locationError !== 'insecure' && (
              <span className="text-xs textSecondaryColor text-center sm:text-left">{t('or') || 'or'}</span>
            )}
            <PlacesAddressSearch
              className="flex-1 w-full"
              onPlaceSelected={handlePlaceSelected}
            />
          </div>
        </div>
      ) : !resorts.length ? (
        <div className="space-y-3">
          {locationLine}
          <p className="text-sm textSecondaryColor py-4">
            {t('noNearbyResorts') || 'No resorts found within this distance.'}
          </p>
          {!editingLocation && (
            <PlacesAddressSearch onPlaceSelected={handlePlaceSelected} />
          )}
        </div>
      ) : (
        <>
          {locationLine}
          <Carousel opts={{ align: 'start', loop: false }} className="w-full hidden md:block" dir={getDirection()}>
            <div className="flex justify-end gap-4 mb-4">
              <CarouselPrevious className="relative translate-y-0 left-0 rtl:rotate-180" />
              <CarouselNext className="relative translate-y-0 right-0 rtl:rotate-180" />
            </div>
            <CarouselContent className="-ml-4">
              {resorts.map((resort) => (
                <CarouselItem key={resort.id} className={RESORT_CARD_CAROUSEL_DESKTOP}>
                  <ResortCardItem resort={resort} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <Carousel opts={{ align: 'start', loop: false }} className="w-full md:hidden" dir={getDirection()}>
            <CarouselContent className="-ml-2">
              {resorts.map((resort) => (
                <CarouselItem key={resort.id} className={RESORT_CARD_CAROUSEL_MOBILE}>
                  <ResortCardItem resort={resort} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </>
      )}
    </section>
  );
};

export default NearbyResorts;
