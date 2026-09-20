'use client';

import { useEffect, useState } from 'react';
import { readStoredNearbyLocation } from '@/hooks/useMarketCountry';

/**
 * Road distance (km) from the user's saved Nearby location to a destination.
 * Uses OSRM table API (same fallback as backend when Google Routes is off).
 */
export function useRoadDistanceKm(
  destLat: number | string | null | undefined,
  destLng: number | string | null | undefined
): number | null {
  const [km, setKm] = useState<number | null>(null);

  useEffect(() => {
    const user = readStoredNearbyLocation();
    const lat = destLat != null ? Number(destLat) : NaN;
    const lng = destLng != null ? Number(destLng) : NaN;
    if (!user?.latitude || !user?.longitude || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      setKm(null);
      return;
    }

    let cancelled = false;
    const coords = `${user.longitude},${user.latitude};${lng},${lat}`;
    const url = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=distance`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || data.code !== 'Ok') return;
        const meters = data.distances?.[0]?.[1];
        if (meters == null || meters < 0) return;
        setKm(Math.round((meters / 1000) * 10) / 10);
      })
      .catch(() => {
        if (!cancelled) setKm(null);
      });

    return () => {
      cancelled = true;
    };
  }, [destLat, destLng]);

  return km;
}
