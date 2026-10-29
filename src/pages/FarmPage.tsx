import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Undo, 
  Trash2, 
  Check, 
  Plus, 
  CloudSun, 
  Search, 
  Compass, 
  Droplets, 
  Info, 
  Save, 
  Sprout, 
  Crosshair,
  Maximize2,
  Loader2,
  X,
  Navigation
} from 'lucide-react';
import { useFarmStore } from '../store/farmStore';
import { useCropStore } from '../store/cropStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';
import { MAHARASHTRA_DISTRICTS } from '../data/districts';
import { calculateGeodesicArea, CalculatedArea } from '../services/geo';
import { fetchWeatherForCoordinates, detectSeason } from '../services/weatherService';
import { 
  geocodeLocation, 
  reverseGeocode, 
  getZoomForPlaceType, 
  buildLocationQuery, 
  GeoResult 
} from '../services/geocodingService';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { SpecularCard } from '../components/SpecularCard';
import { FieldPolygon, FarmPin } from '../types';

export const FarmPage: React.FC = () => {
  const { 
    fields, 
    selectedFieldId, 
    setSelectedFieldId, 
    addField, 
    deleteField,
    pins, 
    addPin, 
    selectedDistrict, 
    setDistrict,
    currentCenter,
    currentLocationName,
    setCurrentCenter,
    satelliteView, 
    toggleSatelliteView,
    weatherData,
    setWeatherData,
  } = useFarmStore();

  const { user } = useAuthStore();
  const { setInputs } = useCropStore();
  const { showToast } = useUIStore();
  const { t } = useT();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const pinsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const drawingLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const hasInitialGeocodedRef = useRef<boolean>(false);

  // Dynamic Geocoding Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [liveArea, setLiveArea] = useState<CalculatedArea>({ sqMeters: 0, acres: 0, hectares: 0, guntha: 0 });

  // Field metadata modal/inputs
  const [newFieldName] = useState('New Field Plot');
  const [newFieldCrop] = useState('Tomato');
  const [newFieldPrevCrop] = useState('Soybean');
  const [newFieldSoil] = useState(user?.soilType || 'Medium black cotton soil (Regur)');
  const [newFieldWater] = useState(user?.waterSource || 'Well with Drip Fertigation');

  // Pin placement mode
  const [pinMode, setPinMode] = useState<FarmPin['type'] | null>(null);

  const currentDistrictInfo = MAHARASHTRA_DISTRICTS.find(
    (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
  ) || MAHARASHTRA_DISTRICTS[0];

  const season = detectSeason();

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Dynamic Location Geocoding
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await geocodeLocation(searchQuery);
        setSearchResults(results);
        setShowDropdown(true);
        if (results.length === 0) {
          showToast(`No coordinates found for "${searchQuery}". Try adding district or state.`, 'warning');
        }
      } catch (err) {
        showToast('Error looking up location coordinates. Please try again.', 'warning');
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, showToast]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Determine initial center
      const initialCoords: [number, number] = currentCenter || [currentDistrictInfo.lat, currentDistrictInfo.lng];

      const map = L.map(mapContainerRef.current, {
        center: initialCoords,
        zoom: 14,
        zoomControl: true,
      });

      // Tile layers
      const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      const tileLayer = L.tileLayer(osmUrl, {
        attribution: osmAttr,
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      polygonLayerGroupRef.current = L.layerGroup().addTo(map);
      pinsLayerGroupRef.current = L.layerGroup().addTo(map);
      drawingLayerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Handle map resize
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Layer Toggle (Street vs Esri Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    if (satelliteView) {
      const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      const satelliteAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      tileLayerRef.current = L.tileLayer(satelliteUrl, {
        attribution: satelliteAttr,
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    } else {
      const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      tileLayerRef.current = L.tileLayer(osmUrl, {
        attribution: osmAttr,
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }
  }, [satelliteView]);

  // Dynamic Location Auto-Alignment on Load / Profile Load
  useEffect(() => {
    if (!mapInstanceRef.current || hasInitialGeocodedRef.current) return;

    // Check if user has saved field polygons with coordinates
    if (fields && fields.length > 0 && fields[0].coordinates && fields[0].coordinates.length >= 3) {
      const selected = fields.find((f) => f.id === selectedFieldId) || fields[0];
      try {
        const bounds = L.latLngBounds(selected.coordinates.map((c) => [c[0], c[1]]));
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
          hasInitialGeocodedRef.current = true;
          return;
        }
      } catch (err) {
        console.warn('Could not fit initial field bounds:', err);
      }
    }

    // Otherwise, geocode user's farm location from profile
    if (user && (user.farmLocation || user.village || user.district || user.state)) {
      const query = buildLocationQuery({
        farmLocation: user.farmLocation,
        village: user.village,
        taluka: user.taluka,
        district: user.district,
        state: user.state,
      });

      if (query) {
        setIsSearching(true);
        geocodeLocation(query)
          .then((results) => {
            setIsSearching(false);
            if (results && results.length > 0 && mapInstanceRef.current) {
              const top = results[0];
              const zoom = getZoomForPlaceType(top.placeType);
              mapInstanceRef.current.setView([top.lat, top.lng], zoom);
              setCurrentCenter([top.lat, top.lng], zoom, top.displayName);
              setSearchQuery(top.displayName);

              fetchWeatherForCoordinates(top.lat, top.lng, top.name)
                .then(setWeatherData)
                .catch(() => {});

              showToast(`Farm map aligned to ${top.displayName}`, 'info');
            }
          })
          .catch(() => {
            setIsSearching(false);
          });
        hasInitialGeocodedRef.current = true;
      }
    }
  }, [user, fields, selectedFieldId]);

  // Handle manual district dropdown change
  const handleDistrictChange = (districtName: string) => {
    setDistrict(districtName);
    const dInfo = MAHARASHTRA_DISTRICTS.find((d) => d.name.toLowerCase() === districtName.toLowerCase());
    if (dInfo && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([dInfo.lat, dInfo.lng], 13, { duration: 1 });
      setCurrentCenter([dInfo.lat, dInfo.lng], 13, `${dInfo.name}, Maharashtra`);
      setSearchQuery(`${dInfo.name}, Maharashtra`);
      fetchWeatherForCoordinates(dInfo.lat, dInfo.lng, dInfo.name)
        .then(setWeatherData)
        .catch(() => {});
    }
  };

  // Handle Selection of a Geocoded Result
  const handleSelectLocation = (result: GeoResult) => {
    if (!mapInstanceRef.current) return;
    const zoom = getZoomForPlaceType(result.placeType);
    mapInstanceRef.current.flyTo([result.lat, result.lng], zoom, { duration: 1.2 });
    
    setCurrentCenter([result.lat, result.lng], zoom, result.displayName);
    setSearchQuery(result.displayName);
    setShowDropdown(false);
    setSearchResults([]);

    fetchWeatherForCoordinates(result.lat, result.lng, result.name)
      .then(setWeatherData)
      .catch(() => {});

    // Sync district if matching Maharashtra district
    const matchingDistrict = MAHARASHTRA_DISTRICTS.find((d) =>
      result.displayName.toLowerCase().includes(d.name.toLowerCase())
    );
    if (matchingDistrict) {
      setDistrict(matchingDistrict.name);
    }

    showToast(`Centered map on ${result.displayName}`, 'success');
  };

  // GPS Device Geolocation handler
  const handleUseGPSLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    setIsLocatingGPS(true);
    showToast('Locating your farm using device GPS...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocatingGPS(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.5 });
        }

        // Add GPS pin
        addPin({
          id: `gps_${Date.now()}`,
          type: 'house',
          name: `Current Farm GPS (±${accuracy}m)`,
          lat,
          lng,
        });

        // Reverse geocode to find friendly name
        const rev = await reverseGeocode(lat, lng);
        const displayName = rev ? rev.displayName : `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;

        setCurrentCenter([lat, lng], 16, displayName);
        setSearchQuery(displayName);

        fetchWeatherForCoordinates(lat, lng, rev?.name || 'Local Farm')
          .then(setWeatherData)
          .catch(() => {});

        showToast(`Located farm at ${displayName} (Accuracy: ±${accuracy}m)`, 'success');
      },
      (err) => {
        setIsLocatingGPS(false);
        showToast(`GPS lookup failed: ${err.message}. Please search manually.`, 'warning');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Fit boundaries of a specific field polygon
  const handleFitFieldBounds = useCallback((fieldToFit?: FieldPolygon) => {
    const target = fieldToFit || fields.find((f) => f.id === selectedFieldId) || fields[0];
    if (!target || !target.coordinates || target.coordinates.length < 3) {
      showToast('No polygon coordinates available to frame.', 'warning');
      return;
    }

    if (mapInstanceRef.current) {
      try {
        const bounds = L.latLngBounds(target.coordinates.map((c) => [c[0], c[1]]));
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
          showToast(`Framed boundary for "${target.name}"`, 'info');
        }
      } catch (err) {
        showToast('Could not calculate boundary bounds.', 'warning');
      }
    }
  }, [fields, selectedFieldId, showToast]);

  // Render Saved Fields Polygons
  useEffect(() => {
    if (!polygonLayerGroupRef.current || !mapInstanceRef.current) return;
    polygonLayerGroupRef.current.clearLayers();

    fields.forEach((field) => {
      if (field.coordinates && field.coordinates.length >= 3) {
        const isSelected = field.id === selectedFieldId;
        const poly = L.polygon(field.coordinates, {
          color: isSelected ? '#C8F23B' : '#1F5A3D',
          weight: isSelected ? 3 : 2,
          fillColor: isSelected ? '#C8F23B' : '#1F5A3D',
          fillOpacity: isSelected ? 0.35 : 0.2,
        }).addTo(polygonLayerGroupRef.current!);

        poly.bindPopup(`
          <div style="color: #0A110D; font-family: sans-serif; font-size: 12px;">
            <strong>${field.name}</strong><br/>
            Area: ${field.areaAcres} Acres (${field.areaGuntha} Guntha)<br/>
            Current Crop: ${field.currentCrop}<br/>
            Soil: ${field.soilType}<br/>
            <em>User-drawn estimate, not an official land record.</em>
          </div>
        `);

        poly.on('click', () => {
          setSelectedFieldId(field.id);
        });
      }
    });
  }, [fields, selectedFieldId]);

  // Render Pins
  useEffect(() => {
    if (!pinsLayerGroupRef.current) return;
    pinsLayerGroupRef.current.clearLayers();

    pins.forEach((pin) => {
      const pinColors: Record<FarmPin['type'], string> = {
        house: '#C8F23B',
        shed: '#C9B6F2',
        well: '#7CCFC4',
        pond: '#38BDF8',
        pump: '#F4B740',
        road: '#F87171',
      };

      const marker = L.circleMarker([pin.lat, pin.lng], {
        radius: 8,
        color: '#FFFFFF',
        weight: 2,
        fillColor: pinColors[pin.type] || '#C8F23B',
        fillOpacity: 0.9,
      }).addTo(pinsLayerGroupRef.current!);

      marker.bindPopup(`
        <div style="color: #0A110D; font-size: 11px;">
          <strong>${pin.name}</strong> (${pin.type})
        </div>
      `);
    });
  }, [pins]);

  // Map click listener for drawing or pin dropping
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const point: [number, number] = [e.latlng.lat, e.latlng.lng];

      if (pinMode) {
        addPin({
          id: `pin_${Date.now()}`,
          type: pinMode,
          name: `${pinMode.toUpperCase()} Pin`,
          lat: point[0],
          lng: point[1],
        });
        showToast(`Added ${pinMode} pin on farm map.`, 'success');
        setPinMode(null);
        return;
      }

      if (isDrawing) {
        setDrawingPoints((prev) => {
          const next = [...prev, point];
          setLiveArea(calculateGeodesicArea(next));
          return next;
        });
      }
    };

    mapInstanceRef.current.on('click', handleMapClick);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleMapClick);
      }
    };
  }, [isDrawing, pinMode, addPin, showToast]);

  // Render current drawing points & lines
  useEffect(() => {
    if (!drawingLayerGroupRef.current) return;
    drawingLayerGroupRef.current.clearLayers();

    if (drawingPoints.length > 0) {
      drawingPoints.forEach((p, idx) => {
        L.circleMarker(p, {
          radius: idx === 0 ? 8 : 5,
          color: idx === 0 ? '#C8F23B' : '#FFFFFF',
          weight: 2,
          fillColor: idx === 0 ? '#C8F23B' : '#7CCFC4',
          fillOpacity: 1,
        }).addTo(drawingLayerGroupRef.current!);
      });

      if (drawingPoints.length >= 2) {
        L.polyline(drawingPoints, {
          color: '#C8F23B',
          weight: 2,
          dashArray: '4, 8',
        }).addTo(drawingLayerGroupRef.current!);
      }
    }
  }, [drawingPoints]);

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setDrawingPoints([]);
    setLiveArea({ sqMeters: 0, acres: 0, hectares: 0, guntha: 0 });
    showToast('Click points on the map to define your field boundary.', 'info');
  };

  const handleUndoPoint = () => {
    setDrawingPoints((prev) => {
      const updated = prev.slice(0, -1);
      setLiveArea(calculateGeodesicArea(updated));
      return updated;
    });
  };

  const handleClearDrawing = () => {
    setDrawingPoints([]);
    setLiveArea({ sqMeters: 0, acres: 0, hectares: 0, guntha: 0 });
    setIsDrawing(false);
  };

  const handleCompleteField = () => {
    if (drawingPoints.length < 3) {
      showToast('A field requires at least 3 points to form a polygon.', 'warning');
      return;
    }

    const calculated = calculateGeodesicArea(drawingPoints);
    const newField: FieldPolygon = {
      id: `fld_${Date.now()}`,
      name: newFieldName,
      coordinates: drawingPoints,
      areaSqM: calculated.sqMeters,
      areaAcres: calculated.acres,
      areaHectares: calculated.hectares,
      areaGuntha: calculated.guntha,
      currentCrop: newFieldCrop,
      previousCrop: newFieldPrevCrop,
      soilType: newFieldSoil,
      waterSource: newFieldWater,
      lastActivity: 'Field boundary calibrated via geodesic GIS studio',
      notes: 'Carried forward to Crop Decision Engine and Fertilizer Plan',
    };

    addField(newField);
    setIsDrawing(false);
    setDrawingPoints([]);

    // Update cropStore inputs with carried farm context
    setInputs({
      district: selectedDistrict,
      fieldAreaAcres: calculated.acres,
      soilType: newFieldSoil,
      previousCrop: newFieldPrevCrop,
    });

    showToast(`Field "${newField.name}" (${calculated.acres} Acres) created successfully!`, 'success');
  };

  const handleSaveFarmContext = () => {
    const selected = fields.find((f) => f.id === selectedFieldId) || fields[0];
    if (selected) {
      setInputs({
        district: selectedDistrict,
        fieldAreaAcres: selected.areaAcres,
        soilType: selected.soilType,
        previousCrop: selected.previousCrop,
      });
      showToast('Farm context saved! Module 1 inputs are auto-filled.', 'success');
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  return (
    <div className="min-h-screen bg-surface-dark py-6 md:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 w-full overflow-x-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-lime font-bold tracking-wide uppercase">
              Field Boundary & GIS Studio
            </span>
            <ProvenanceBadge type="User-provided" size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {t('farm_title')}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Label every boundary: "User-drawn estimate, not an official land record."
          </p>
        </div>

        {/* Dynamic Location Search, District Selector, GPS & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Micro-Climate Chip */}
          <div className="liquid-glass px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-200">
            <CloudSun className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{weatherData.temperature}°C, {weatherData.condition}</span>
            <ProvenanceBadge type={weatherData.isLive ? 'Live (Open-Meteo)' : 'Demo data'} size="sm" />
          </div>

          {/* Dynamic Geocoding Search Input with Auto-complete Dropdown */}
          <div ref={searchContainerRef} className="relative min-w-[220px] sm:min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farm village or city..."
              className="w-full bg-surface-darkcard border border-neutral-700 rounded-full pl-8 pr-8 py-1.5 text-xs font-medium text-white placeholder-neutral-500 focus:outline-none focus:border-lime transition-all"
            />
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-lime absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                className="w-4 h-4 text-neutral-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}

            {/* Geocoding Dropdown Suggestions */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-[550] bg-surface-darkcard border border-surface-darkborder rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                <div className="px-3 py-1.5 border-b border-white/5 text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Resolved Locations</span>
                  <span className="text-lime">OSM Nominatim</span>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-white/5">
                  {searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation(res)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-white/5 transition-colors flex items-start gap-2.5 cursor-pointer group"
                    >
                      <MapPin className="w-3.5 h-3.5 text-lime shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-lime transition-colors truncate">
                            {res.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-lime/10 border border-lime/30 text-lime font-mono uppercase shrink-0">
                            {res.placeType}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                          {res.displayName}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* GPS Quick Locator Button */}
          <button
            type="button"
            onClick={handleUseGPSLocation}
            disabled={isLocatingGPS}
            title="Locate farm via GPS"
            className="p-2 rounded-full bg-surface-darkcard border border-neutral-700 text-neutral-300 hover:text-lime hover:border-lime/60 transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            {isLocatingGPS ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-lime" />
            ) : (
              <Crosshair className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Quick Fit Field Boundary Button */}
          {selectedField && selectedField.coordinates && selectedField.coordinates.length >= 3 && (
            <button
              type="button"
              onClick={() => handleFitFieldBounds(selectedField)}
              title="Fit map to selected field boundary"
              className="p-2 rounded-full bg-surface-darkcard border border-neutral-700 text-neutral-300 hover:text-lime hover:border-lime/60 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick District Selector (Maharashtra Baseline) */}
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-surface-darkcard border border-neutral-700 rounded-full px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-lime cursor-pointer"
            >
              {MAHARASHTRA_DISTRICTS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.marathiName})
                </option>
              ))}
            </select>
          </div>

          {/* Save Farm Context */}
          <button
            onClick={handleSaveFarmContext}
            className="px-4 py-1.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('farm_btn_save_context')}</span>
          </button>
        </div>
      </div>

      {/* Main Balanced Two-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ============================================================ */}
        {/* ROW 1 - LEFT: Interactive Farm Map (7 cols)                  */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 flex flex-col min-w-0">
          <div className="relative h-[440px] sm:h-[460px] md:h-[480px] w-full rounded-4xl overflow-hidden border border-surface-darkborder shadow-2xl bg-surface-card">
            {/* Leaflet Mount Element */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Top Controls: Location Readout, Street/Satellite Toggle & Boundary Label */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="pointer-events-auto liquid-glass px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-medium text-neutral-300 shadow-lg flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-lime shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-[280px]">
                  {currentLocationName || `${currentDistrictInfo.name}, Maharashtra`}
                </span>
              </div>

              {/* Street vs Satellite Layer Toggle */}
              <button
                type="button"
                onClick={toggleSatelliteView}
                className="pointer-events-auto liquid-glass px-3.5 py-1.5 rounded-full border border-lime/30 text-xs font-bold text-white hover:text-lime shadow-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-lime" />
                <span>Layer: {satelliteView ? 'Satellite (Esri)' : 'Street (OSM)'}</span>
              </button>
            </div>

            {/* Floating Bottom Polygon Drawing Toolbar */}
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-[400] pointer-events-none flex flex-wrap items-center justify-between gap-2">
              {!isDrawing ? (
                <div className="pointer-events-auto flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleStartDrawing}
                    className="px-4 py-2 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Draw New Field Polygon</span>
                  </button>

                  {/* Drop Pins dropdown */}
                  <div className="flex items-center gap-1 liquid-glass rounded-full p-1 border border-white/10">
                    <span className="text-[10px] text-neutral-400 px-2 font-mono">Add Pin:</span>
                    {(['well', 'shed', 'house', 'pond'] as const).map((pType) => (
                      <button
                        key={pType}
                        onClick={() => {
                          setPinMode(pType);
                          showToast(`Click anywhere on map to drop ${pType} pin.`, 'info');
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase transition-colors cursor-pointer ${
                          pinMode === pType ? 'bg-teal text-ink font-bold' : 'text-neutral-300 hover:text-white'
                        }`}
                      >
                        {pType}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pointer-events-auto liquid-glass px-4 py-2 rounded-3xl border border-lime/40 shadow-2xl flex flex-wrap items-center gap-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
                    <span>Drawing: {drawingPoints.length} points</span>
                  </div>

                  <div className="text-xs font-mono font-bold text-lime bg-surface-dark px-2.5 py-1 rounded-full border border-white/10">
                    {liveArea.acres} Acres ({liveArea.guntha} Guntha)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleUndoPoint}
                      disabled={drawingPoints.length === 0}
                      className="px-3 py-1 rounded-full bg-surface-dark border border-neutral-700 text-xs text-neutral-300 disabled:opacity-40 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Undo className="w-3 h-3" />
                      <span>Undo</span>
                    </button>

                    <button
                      onClick={handleClearDrawing}
                      className="px-3 py-1 rounded-full bg-surface-dark border border-neutral-700 text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>

                    <button
                      onClick={handleCompleteField}
                      disabled={drawingPoints.length < 3}
                      className="px-4 py-1.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover disabled:opacity-40 flex items-center gap-1 shadow-glow-lime cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Field</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Disclaimer Badge */}
              <div className="pointer-events-auto liquid-glass px-3 py-1 rounded-full border border-white/10 text-[10px] text-neutral-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Estimate, not official land record</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ROW 1 - RIGHT: My Farm Fields List (5 cols)                  */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 flex flex-col min-w-0">
          <SpecularCard
            radius={32}
            lineColor="#C8F23B"
            className="p-5 sm:p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl flex flex-col justify-between h-full min-h-[440px] sm:min-h-[460px] md:min-h-[480px]"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/60 border border-lime/30 text-lime flex items-center justify-center">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      My Farm Fields ({fields.length})
                    </h3>
                    <span className="text-[10px] text-neutral-400">Click a plot to inspect and center</span>
                  </div>
                </div>
                <ProvenanceBadge type="User-provided" size="sm" />
              </div>

              {/* Saved Fields Scrollable List */}
              <div className="space-y-3 mt-3 overflow-y-auto max-h-[340px] pr-1">
                {fields.map((field) => {
                  const isSelected = field.id === selectedFieldId;
                  return (
                    <div
                      key={field.id}
                      onClick={() => {
                        setSelectedFieldId(field.id);
                        handleFitFieldBounds(field);
                      }}
                      className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-primary-dark/40 to-surface-dark border-lime/50 shadow-glow-lime'
                          : 'bg-surface-dark border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />}
                          <span>{field.name}</span>
                        </h4>
                        <span className="px-2.5 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime font-mono font-bold text-xs shrink-0">
                          {field.areaAcres} Acres
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-xs text-neutral-300">
                        <div>
                          <span className="text-neutral-400">Current Crop: </span>
                          <span className="font-semibold text-white">{field.currentCrop}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Soil: </span>
                          <span className="text-neutral-200">{field.soilType}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-neutral-400">Water: </span>
                          <span className="text-neutral-200">{field.waterSource}</span>
                        </div>
                      </div>

                      {field.notes && (
                        <p className="mt-2 text-[11px] text-neutral-400 italic border-t border-white/5 pt-1.5">
                          {field.notes}
                        </p>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-400">
                        <span>{field.lastActivity}</span>
                        {fields.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteField(field.id);
                              showToast(`Field "${field.name}" removed.`, 'info');
                            }}
                            className="text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Farm Total Summary Pill */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-300">
              <span className="text-[11px] font-mono text-neutral-400">
                Total Land: <strong className="text-white">
                  {fields.reduce((acc, f) => acc + (f.areaAcres || 0), 0).toFixed(1)} Acres
                </strong>
              </span>
              <span className="text-[11px] font-mono text-lime font-semibold">
                {fields.length} Polygons Active
              </span>
            </div>
          </SpecularCard>
        </div>

        {/* ============================================================ */}
        {/* ROW 2 - LEFT: Geodesic Area Readout (7 cols)                 */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 flex flex-col min-w-0">
          <SpecularCard
            radius={32}
            lineColor="#14b8a6"
            className="p-5 sm:p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl h-full flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/60 border border-lime/30 text-lime flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
                      Geodesic Area Readout
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-mono">WGS-84 Sphericalexcess Formula</span>
                  </div>
                </div>
                <ProvenanceBadge type="Estimated" size="sm" />
              </div>

              {/* 4 Metric Readout Cards in Balanced Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center my-2">
                <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                    Acres
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-lime">
                    {isDrawing ? liveArea.acres : (selectedField?.areaAcres ?? 2.5)}
                  </span>
                  <span className="text-[9px] text-neutral-500 mt-1 font-mono">Standard Imperial</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                    Guntha
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {isDrawing ? liveArea.guntha : (selectedField?.areaGuntha ?? 100)}
                  </span>
                  <span className="text-[9px] text-neutral-500 mt-1 font-mono">1/40 Acre (MH)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                    Hectares
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-teal">
                    {isDrawing ? liveArea.hectares : (selectedField?.areaHectares ?? 1.01)}
                  </span>
                  <span className="text-[9px] text-neutral-500 mt-1 font-mono">2.471 Acres</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                    Square Meters
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-neutral-200">
                    {isDrawing ? liveArea.sqMeters.toLocaleString() : (selectedField?.areaSqM?.toLocaleString() ?? '10,117')}
                  </span>
                  <span className="text-[9px] text-neutral-500 mt-1 font-mono">Metric SI Area</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Calculated using ellipsoidal polygon calculus. Accurate to ±0.05% for land parcels.</span>
              <span className="text-lime font-mono text-[10px] font-bold">GIS Active</span>
            </div>
          </SpecularCard>
        </div>

        {/* ============================================================ */}
        {/* ROW 2 - RIGHT: Agro-Climatic Profile Panel (5 cols)          */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 flex flex-col min-w-0">
          <SpecularCard
            radius={32}
            lineColor="#C8F23B"
            className="p-5 sm:p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl h-full flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/60 border border-lime/30 text-lime flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider block">
                      Agro-Climatic Profile
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                      {currentDistrictInfo.name} ({currentDistrictInfo.region})
                    </h4>
                  </div>
                </div>
                <ProvenanceBadge type="Demo data" size="sm" />
              </div>

              {/* Structured Metadata Rows */}
              <div className="mt-3 space-y-2.5 text-xs text-neutral-300 leading-relaxed">
                <div className="p-2.5 rounded-2xl bg-surface-dark/70 border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Rainfall Zone</span>
                  <span className="font-semibold text-white">{currentDistrictInfo.approxRainfallZone}</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-surface-dark/70 border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Typical Soil</span>
                  <span className="font-semibold text-white">{currentDistrictInfo.typicalSoil}</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-surface-dark/70 border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Common Crops</span>
                  <span className="font-semibold text-white">{currentDistrictInfo.commonlyGrownCrops.join(', ')}</span>
                </div>

                <p className="text-[11px] text-neutral-400 italic pt-0.5 leading-normal">
                  {currentDistrictInfo.notes}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Season: <strong className="text-lime">{season}</strong></span>
              <span className="text-teal font-mono text-[10px]">Maharashtra KVK Baseline</span>
            </div>
          </SpecularCard>
        </div>

      </div>
    </div>
  );
};
