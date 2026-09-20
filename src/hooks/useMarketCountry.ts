'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountriesApi } from '@/api/apiRoutes';

export interface MarketCountry {
  id: number;
  name: string;
  iso_code: string;
  flag: string;
  is_default?: boolean;
  currency_symbol?: string;
}

const STORAGE_KEY = 'pliiz_selected_country_id';
const LOCATION_KEY = 'pliiz_nearby_location';

export interface NearbyLocation {
  latitude: number;
  longitude: number;
  address?: string;
  place_id?: string;
  source: 'gps' | 'places';
}

function readStoredCountryId(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  const id = raw ? Number(raw) : NaN;
  return Number.isFinite(id) ? id : null;
}

export function readStoredNearbyLocation(): NearbyLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NearbyLocation;
    if (!parsed?.latitude || !parsed?.longitude) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredNearbyLocation(location: NearbyLocation | null) {
  if (typeof window === 'undefined') return;
  if (!location) {
    localStorage.removeItem(LOCATION_KEY);
    return;
  }
  localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}

export function useMarketCountry(detectedCountryId?: number | null) {
  const [selectedCountryId, setSelectedCountryIdState] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const { data: countries = [], isLoading } = useQuery({
    queryKey: ['marketCountries'],
    queryFn: async () => {
      const res = await getCountriesApi();
      if (res?.error) throw new Error(res.message || 'Failed to load countries');
      const list = (res?.data ?? []) as MarketCountry[];
      return Array.isArray(list) ? list : [];
    },
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    setSelectedCountryIdState(readStoredCountryId());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !countries.length || selectedCountryId) return;
    const preferred =
      (detectedCountryId && countries.find((c) => c.id === detectedCountryId)?.id) ||
      countries.find((c) => c.is_default)?.id ||
      countries[0]?.id ||
      null;
    if (preferred) {
      setSelectedCountryIdState(preferred);
      localStorage.setItem(STORAGE_KEY, String(preferred));
    }
  }, [hydrated, countries, selectedCountryId, detectedCountryId]);

  const setSelectedCountryId = useCallback((id: number) => {
    setSelectedCountryIdState(id);
    localStorage.setItem(STORAGE_KEY, String(id));
  }, []);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.id === selectedCountryId) ?? null,
    [countries, selectedCountryId]
  );

  return {
    countries,
    selectedCountryId,
    selectedCountry,
    setSelectedCountryId,
    isLoading,
    hydrated,
  };
}
