/**
 * Geocoding Service for KrishiCycle AI 2.0
 * Uses OpenStreetMap Nominatim API with 1 req/sec rate limiting, in-memory caching,
 * and adaptive zoom levels according to place granularity.
 */

export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
  name: string;
  placeType: 'village' | 'town' | 'city' | 'district' | 'state' | 'country' | 'other';
  boundingBox?: [number, number, number, number]; // [south, north, west, east]
  rawClass?: string;
  rawType?: string;
}

// In-memory cache to prevent duplicate requests
const geocodeCache = new Map<string, GeoResult[]>();

// Rate limiter state: Nominatim requires <= 1 request/sec
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1050;

/**
 * Throttle requests to respect Nominatim policy
 */
async function throttle(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    const waitTime = MIN_REQUEST_INTERVAL_MS - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();
}

/**
 * Infer place type and appropriate Leaflet zoom level
 */
export function getZoomForPlaceType(type: GeoResult['placeType']): number {
  switch (type) {
    case 'village':
      return 15;
    case 'town':
      return 14;
    case 'city':
      return 13;
    case 'district':
      return 11;
    case 'state':
      return 8;
    case 'country':
      return 5;
    default:
      return 13;
  }
}

/**
 * Classify OpenStreetMap place type from Nominatim address details
 */
function classifyPlaceType(item: any): GeoResult['placeType'] {
  const type = (item.type || '').toLowerCase();
  const address = item.address || {};

  if (address.village || address.hamlet || address.suburb || address.neighbourhood || type === 'village' || type === 'hamlet') {
    return 'village';
  }
  if (address.town || type === 'town') {
    return 'town';
  }
  if (address.city || address.municipality || type === 'city') {
    return 'city';
  }
  if (address.state_district || address.county || type === 'administrative' || type === 'district') {
    return 'district';
  }
  if (address.state || type === 'state') {
    return 'state';
  }
  if (address.country || type === 'country') {
    return 'country';
  }
  return 'other';
}

/**
 * Formats clean, human-readable display label
 */
function formatDisplayName(item: any): string {
  const addr = item.address || {};
  const primary = addr.village || addr.town || addr.city || addr.suburb || item.name || '';
  const secondary = addr.state_district || addr.county || addr.district || '';
  const state = addr.state || '';

  const parts = [primary, secondary, state].filter(Boolean);
  if (parts.length > 0) {
    // Unique parts
    const unique = Array.from(new Set(parts));
    return unique.join(', ');
  }
  return item.display_name.split(',').slice(0, 3).join(', ');
}

/**
 * Search Nominatim for matching locations
 */
export async function geocodeLocation(query: string): Promise<GeoResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const cacheKey = trimmed.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  await throttle();

  try {
    const encoded = encodeURIComponent(trimmed);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&addressdetails=1&limit=5&countrycodes=in&email=contact@krishicycle.ai`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`Nominatim geocoding failed with status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const results: GeoResult[] = data.map((item: any) => {
      const placeType = classifyPlaceType(item);
      const bbox: [number, number, number, number] | undefined = item.boundingbox
        ? [
            parseFloat(item.boundingbox[0]),
            parseFloat(item.boundingbox[1]),
            parseFloat(item.boundingbox[2]),
            parseFloat(item.boundingbox[3]),
          ]
        : undefined;

      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: formatDisplayName(item),
        name: item.name || formatDisplayName(item),
        placeType,
        boundingBox: bbox,
        rawClass: item.class,
        rawType: item.type,
      };
    });

    geocodeCache.set(cacheKey, results);
    return results;
  } catch (err) {
    console.error('Geocoding error:', err);
    return [];
  }
}

/**
 * Reverse geocode GPS coordinates to human-readable address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult | null> {
  const cacheKey = `rev_${lat.toFixed(4)}_${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)![0] || null;
  }

  await throttle();

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&email=contact@krishicycle.ai`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timer);

    if (!res.ok) return null;

    const item = await res.json();
    if (!item || !item.lat) return null;

    const placeType = classifyPlaceType(item);
    const result: GeoResult = {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: formatDisplayName(item),
      name: item.name || formatDisplayName(item),
      placeType,
      rawClass: item.class,
      rawType: item.type,
    };

    geocodeCache.set(cacheKey, [result]);
    return result;
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return null;
  }
}

/**
 * Constructs a structured query from farmer profile components
 */
export function buildLocationQuery(options: {
  farmLocation?: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
}): string {
  const parts: string[] = [];

  // Check if farm location is a place name rather than just a plot/gat number
  if (options.farmLocation) {
    const cleanLoc = options.farmLocation.trim();
    // Ignore pure survey numbers like "Gat 142/A"
    if (!cleanLoc.toLowerCase().startsWith('gat') && !cleanLoc.toLowerCase().startsWith('survey')) {
      parts.push(cleanLoc);
    }
  }

  if (options.village && !parts.some((p) => p.toLowerCase().includes(options.village!.toLowerCase()))) {
    parts.push(options.village);
  }

  if (
    options.taluka &&
    !options.taluka.toLowerCase().includes('taluka') &&
    !parts.some((p) => p.toLowerCase().includes(options.taluka!.toLowerCase()))
  ) {
    parts.push(options.taluka);
  }

  if (
    options.district &&
    !parts.some((p) => p.toLowerCase().includes(options.district!.toLowerCase()))
  ) {
    parts.push(options.district);
  }

  if (
    options.state &&
    !parts.some((p) => p.toLowerCase().includes(options.state!.toLowerCase()))
  ) {
    parts.push(options.state);
  }

  parts.push('India');
  return parts.join(', ');
}
