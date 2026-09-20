'use client';

export type GeoFailureReason = 'unsupported' | 'insecure' | 'denied' | 'unavailable' | 'timeout';

export interface GeoPosition {
  latitude: number;
  longitude: number;
}

function mapGeoError(error: GeolocationPositionError): GeoFailureReason {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'denied';
    case error.POSITION_UNAVAILABLE:
      return 'unavailable';
    case error.TIMEOUT:
      return 'timeout';
    default:
      return 'unavailable';
  }
}

/**
 * iPhone Safari only allows geolocation on secure contexts (https / localhost).
 * LAN http://192.168.x.x is blocked — detect that before calling the API.
 */
export function getGeolocationBlockReason(): GeoFailureReason | null {
  if (typeof window === 'undefined') return 'unsupported';
  if (!window.isSecureContext) return 'insecure';
  if (!navigator.geolocation) return 'unsupported';
  return null;
}

export function requestBrowserPosition(): Promise<GeoPosition> {
  const blocked = getGeolocationBlockReason();
  if (blocked) {
    return Promise.reject(new Error(blocked));
  }

  return new Promise((resolve, reject) => {
    // Safari: avoid enableHighAccuracy first (slow / flaky); allow a short cache.
    const tryOnce = (highAccuracy: boolean, timeout: number) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          if (!highAccuracy && err.code === err.TIMEOUT) {
            tryOnce(true, 20000);
            return;
          }
          reject(new Error(mapGeoError(err)));
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout,
          maximumAge: 60_000,
        }
      );
    };

    tryOnce(false, 12000);
  });
}

export async function reverseGeocodeAddress(lat: number, lng: number): Promise<string | undefined> {
  const key = process.env.NEXT_PUBLIC_MAP_API_KEY;
  if (!key) return undefined;

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    if (data?.status !== 'OK' || !Array.isArray(data.results) || !data.results[0]) {
      return undefined;
    }
    return data.results[0].formatted_address as string;
  } catch {
    return undefined;
  }
}
