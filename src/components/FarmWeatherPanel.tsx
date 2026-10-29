import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  MapPin,
  RefreshCw,
  Calendar,
  Compass,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { WeatherData } from '../types';
import { fetchWeatherForCoordinates, getMockWeather } from '../services/weatherService';
import { MAHARASHTRA_DISTRICTS } from '../data/districts';
import { ProvenanceBadge } from './ProvenanceBadge';
import { useT } from '../i18n/useT';

interface FarmWeatherPanelProps {
  district: string;
  onDistrictChange: (district: string) => void;
  onWeatherSync?: (weather: WeatherData) => void;
  currentLocationName?: string;
}

export const FarmWeatherPanel: React.FC<FarmWeatherPanelProps> = ({
  district,
  onDistrictChange,
  onWeatherSync,
  currentLocationName,
}) => {
  const { t } = useT();
  const [weather, setWeather] = useState<WeatherData>(() => getMockWeather(district));
  const [loading, setLoading] = useState<boolean>(false);
  const [geoLocating, setGeoLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [resolvedLocation, setResolvedLocation] = useState<string>(
    currentLocationName || `${district}, Maharashtra`
  );

  // Load weather when district changes or component mounts
  const loadWeatherForDistrict = async (distName: string) => {
    setLoading(true);
    setGeoError(null);
    const distInfo = MAHARASHTRA_DISTRICTS.find(
      (d) => d.name.toLowerCase() === distName.toLowerCase() || d.id === distName.toLowerCase()
    ) || MAHARASHTRA_DISTRICTS[0];

    try {
      const data = await fetchWeatherForCoordinates(distInfo.lat, distInfo.lng, distInfo.name);
      setWeather(data);
      setResolvedLocation(`${distInfo.name}, ${distInfo.region}, Maharashtra`);
      if (onWeatherSync) {
        onWeatherSync(data);
      }
    } catch {
      const fallback = getMockWeather(distInfo.name);
      setWeather(fallback);
      if (onWeatherSync) {
        onWeatherSync(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherForDistrict(district);
  }, [district]);

  // Request browser GPS location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const liveData = await fetchWeatherForCoordinates(latitude, longitude, district);
          setWeather(liveData);

          // Find closest district in Maharashtra
          let closest = MAHARASHTRA_DISTRICTS[0];
          let minDistance = 999999;
          MAHARASHTRA_DISTRICTS.forEach((d) => {
            const dist = Math.hypot(d.lat - latitude, d.lng - longitude);
            if (dist < minDistance) {
              minDistance = dist;
              closest = d;
            }
          });

          setResolvedLocation(`GPS (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°) · near ${closest.name}`);
          onDistrictChange(closest.name);

          if (onWeatherSync) {
            onWeatherSync(liveData);
          }
        } catch {
          setGeoError('Could not fetch weather for current GPS coordinates. Reverted to district.');
        } finally {
          setGeoLocating(false);
        }
      },
      (error) => {
        setGeoLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('GPS permission was denied. Select your farm district manually below.');
        } else {
          setGeoError('Unable to retrieve your location. Select your farm district manually below.');
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  return (
    <div className="p-6 rounded-4xl bg-gradient-to-br from-surface-card via-primary-dark/20 to-surface-dark border border-lime/30 shadow-xl space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-lime/20 border border-lime/40 flex items-center justify-center text-lime">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                Farm Location & Live Weather
              </span>
              <ProvenanceBadge type={weather.isLive ? 'Live (Open-Meteo)' : 'Estimated'} size="sm" />
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{resolvedLocation}</span>
            </h3>
          </div>
        </div>

        {/* Location Actions: GPS & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDetectGPS}
            disabled={geoLocating}
            className="px-3.5 py-1.5 rounded-full liquid-glass hover:bg-white/10 text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 transition-all"
            title="Automatically detect current farm GPS coordinates"
          >
            <Compass className={`w-3.5 h-3.5 text-lime ${geoLocating ? 'animate-spin' : ''}`} />
            <span>{geoLocating ? 'Locating...' : 'Auto Detect GPS'}</span>
          </button>

          <button
            onClick={() => loadWeatherForDistrict(district)}
            disabled={loading}
            className="p-2 rounded-full liquid-glass hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors"
            title="Refresh weather data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-lime' : ''}`} />
          </button>
        </div>
      </div>

      {/* Geolocation error message if any */}
      {geoError && (
        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Manual District Selection Fallback */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-400 font-medium">Select Farm District:</span>
        <div className="flex flex-wrap gap-1.5">
          {MAHARASHTRA_DISTRICTS.slice(0, 8).map((d) => (
            <button
              key={d.id}
              onClick={() => onDistrictChange(d.name)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                district.toLowerCase() === d.name.toLowerCase()
                  ? 'bg-lime text-ink shadow-glow-lime'
                  : 'liquid-glass text-neutral-300 hover:text-white border border-white/5'
              }`}
            >
              {d.name}
            </button>
          ))}
          <select
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="bg-surface-dark border border-neutral-700 rounded-full px-3 py-1 text-xs text-white"
          >
            {MAHARASHTRA_DISTRICTS.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name} ({d.marathiName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Weather Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Temperature</span>
            <span className="text-xl font-display font-extrabold text-white">
              {weather.temperature}°C
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Rel. Humidity</span>
            <span className="text-xl font-display font-extrabold text-white">
              {weather.humidity}%
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal/10 text-teal">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Precipitation</span>
            <span className="text-xl font-display font-extrabold text-teal">
              {weather.rainChance}%
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Wind Speed</span>
            <span className="text-xl font-display font-extrabold text-white">
              {weather.windSpeed} km/h
            </span>
          </div>
        </div>
      </div>

      {/* Condition & Upcoming Forecast Ribbon */}
      <div className="pt-2 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Current Sky:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-darkcard border border-white/10 font-bold text-white">
            {weather.condition}
          </span>
          <span className="text-[11px] text-neutral-500">
            Updated at {weather.retrievedAt} ({weather.isLive ? 'Open-Meteo v1' : 'Regional Baseline'})
          </span>
        </div>

        {/* 7-Day Forecast Mini Strip */}
        {weather.daily && weather.daily.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {weather.daily.slice(0, 7).map((d, i) => (
              <div
                key={i}
                className="px-2.5 py-1.5 rounded-xl bg-surface-dark/70 border border-white/5 text-center min-w-[58px]"
              >
                <div className="text-[9px] font-mono uppercase text-neutral-400">{d.day}</div>
                <div className="text-xs font-bold text-white mt-0.5">{d.tempMax}°</div>
                <div className="text-[9px] text-teal font-mono">{d.rainChance}% rain</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
