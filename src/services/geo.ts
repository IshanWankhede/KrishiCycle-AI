/**
 * Geodesic Polygon Area Calculation (Pure TypeScript implementation)
 * Uses spherical polygon formula on WGS-84 Earth radius (R = 6,378,137 m)
 */

export interface CalculatedArea {
  sqMeters: number;
  acres: number;
  hectares: number;
  guntha: number;
}

const EARTH_RADIUS = 6378137; // in meters

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Calculates surface area of a polygon defined by [latitude, longitude] pairs.
 */
export const calculateGeodesicArea = (coordinates: [number, number][]): CalculatedArea => {
  if (!coordinates || coordinates.length < 3) {
    return { sqMeters: 0, acres: 0, hectares: 0, guntha: 0 };
  }

  let totalAngle = 0;
  const numPoints = coordinates.length;

  for (let i = 0; i < numPoints; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % numPoints];
    const p3 = coordinates[(i + 2) % numPoints];

    const lon1 = toRadians(p1[1]);
    const lat1 = toRadians(p1[0]);
    const lon3 = toRadians(p3[1]);

    // Spherical excess integration
    totalAngle += (lon3 - lon1) * Math.sin(lat1);
  }

  const sqMeters = Math.abs((totalAngle * EARTH_RADIUS * EARTH_RADIUS) / 2);

  // Conversion factors:
  // 1 Acre = 4046.8564224 square meters
  // 1 Hectare = 10000 square meters
  // 1 Acre = 40 Guntha (standard in Maharashtra agriculture land measurement)
  // 1 Guntha = 101.17141 square meters
  const acres = sqMeters / 4046.8564224;
  const hectares = sqMeters / 10000;
  const guntha = acres * 40;

  return {
    sqMeters: Math.round(sqMeters),
    acres: Number(acres.toFixed(2)),
    hectares: Number(hectares.toFixed(2)),
    guntha: Number(guntha.toFixed(1)),
  };
};

/**
 * Calculate distance between two coordinates in km
 */
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((EARTH_RADIUS * c / 1000).toFixed(1));
};
