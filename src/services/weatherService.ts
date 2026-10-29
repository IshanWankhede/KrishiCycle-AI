import { WeatherData, DailyWeather } from '../types';

export const detectSeason = (date: Date = new Date()): 'Kharif' | 'Rabi' | 'Zaid' => {
  const month = date.getMonth(); // 0-11
  // Kharif: Jun (5) to Oct (9)
  if (month >= 5 && month <= 9) return 'Kharif';
  // Rabi: Nov (10) to Feb (1)
  if (month >= 10 || month <= 1) return 'Rabi';
  // Zaid: Mar (2) to May (4)
  return 'Zaid';
};

export const getMockWeather = (districtName: string = 'Pune'): WeatherData => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daily: DailyWeather[] = days.map((day, idx) => ({
    day,
    tempMax: 31 + (idx % 3),
    tempMin: 20 + (idx % 2),
    rainChance: idx === 2 || idx === 3 ? 65 : 15,
    condition: idx === 2 || idx === 3 ? 'Scattered Showers' : 'Partly Cloudy',
  }));

  return {
    temperature: 29.4,
    humidity: 58,
    rainChance: 20,
    windSpeed: 14,
    condition: 'Optimal Sowing Window (Mild Sun)',
    retrievedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    isLive: false,
    daily,
  };
};

export const fetchWeatherForCoordinates = async (
  lat: number,
  lng: number,
  districtName: string = 'Pune'
): Promise<WeatherData> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&forecast_days=7`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }

    const data = await response.json();

    const weatherCodeMap: Record<number, string> = {
      0: 'Clear Sky',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Foggy',
      51: 'Light Drizzle',
      61: 'Slight Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      80: 'Rain Showers',
      95: 'Thunderstorm',
    };

    const currentCondition = weatherCodeMap[data.current?.weather_code] || 'Partly Cloudy';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const daily: DailyWeather[] = (data.daily?.time || []).map((dateStr: string, idx: number) => {
      const d = new Date(dateStr);
      return {
        day: dayNames[d.getDay()] || `Day ${idx + 1}`,
        tempMax: Math.round(data.daily.temperature_2m_max[idx] ?? 30),
        tempMin: Math.round(data.daily.temperature_2m_min[idx] ?? 20),
        rainChance: Math.round(data.daily.precipitation_probability_max[idx] ?? 10),
        condition: weatherCodeMap[data.daily.weather_code[idx]] || 'Partly Cloudy',
      };
    });

    return {
      temperature: Number((data.current?.temperature_2m ?? 28).toFixed(1)),
      humidity: Math.round(data.current?.relative_humidity_2m ?? 50),
      rainChance: Math.round(data.daily?.precipitation_probability_max?.[0] ?? 20),
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 12),
      condition: currentCondition,
      retrievedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      isLive: true,
      daily: daily.length > 0 ? daily : getMockWeather().daily,
    };
  } catch {
    // Graceful fallback to mock data labelled Demo data
    return getMockWeather(districtName);
  }
};
