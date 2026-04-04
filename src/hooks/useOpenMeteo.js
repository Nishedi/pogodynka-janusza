import { useState, useEffect, useCallback } from 'react';

const LATITUDE = 52.1636;
const LONGITUDE = 15.8153;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const WMO_DESCRIPTIONS = {
  0: 'Czyste niebo',
  1: 'Przeważnie czyste',
  2: 'Częściowe zachmurzenie',
  3: 'Zachmurzenie całkowite',
  45: 'Mgła',
  48: 'Mgła z szronem',
  51: 'Mżawka lekka',
  53: 'Mżawka umiarkowana',
  55: 'Mżawka gęsta',
  61: 'Deszcz lekki',
  63: 'Deszcz umiarkowany',
  65: 'Deszcz silny',
  71: 'Opady śniegu lekkie',
  73: 'Opady śniegu umiarkowane',
  75: 'Opady śniegu silne',
  77: 'Ziarna śniegu',
  80: 'Przelotny deszcz lekki',
  81: 'Przelotny deszcz umiarkowany',
  82: 'Przelotny deszcz silny',
  85: 'Przelotne opady śniegu lekkie',
  86: 'Przelotne opady śniegu silne',
  95: 'Burza',
  96: 'Burza z gradem lekkim',
  99: 'Burza z gradem silnym',
};

const WMO_ICONS = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '❄️',
  77: '❄️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '❄️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

function getWindDirection(degrees) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}

const HOURLY_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'surface_pressure',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'weather_code',
  'cloud_cover',
  'uv_index',
  'precipitation',
];

export function useOpenMeteo(targetDate = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchWeather = useCallback(async () => {
    try {
      let temperature, feelsLike, humidity, pressure, windSpeed, windDirection,
        windGusts, cloudCover, uvIndex, precipitation, wCode, sunrise, sunset, uvIndexMax;

      if (!targetDate) {
        // Current weather
        const params = new URLSearchParams({
          latitude: LATITUDE,
          longitude: LONGITUDE,
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'surface_pressure',
            'wind_speed_10m',
            'wind_direction_10m',
            'wind_gusts_10m',
            'weather_code',
            'cloud_cover',
            'uv_index',
            'precipitation',
          ].join(','),
          daily: ['sunrise', 'sunset', 'uv_index_max'].join(','),
          timezone: 'Europe/Warsaw',
          forecast_days: 1,
        });

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const c = json.current;
        temperature = c.temperature_2m;
        feelsLike = c.apparent_temperature;
        humidity = c.relative_humidity_2m;
        pressure = c.surface_pressure;
        windSpeed = c.wind_speed_10m;
        windDirection = c.wind_direction_10m;
        windGusts = c.wind_gusts_10m;
        cloudCover = c.cloud_cover;
        uvIndex = c.uv_index;
        precipitation = c.precipitation;
        wCode = c.weather_code ?? 0;
        sunrise = json.daily?.sunrise?.[0];
        sunset = json.daily?.sunset?.[0];
        uvIndexMax = json.daily?.uv_index_max?.[0];
      } else {
        // Historical day – fetch hourly data and pick noon (hour index 12)
        const params = new URLSearchParams({
          latitude: LATITUDE,
          longitude: LONGITUDE,
          hourly: HOURLY_FIELDS.join(','),
          daily: ['sunrise', 'sunset', 'uv_index_max'].join(','),
          timezone: 'Europe/Warsaw',
          start_date: targetDate,
          end_date: targetDate,
        });

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const h = json.hourly;
        const idx = 12; // noon
        temperature = h.temperature_2m?.[idx];
        feelsLike = h.apparent_temperature?.[idx];
        humidity = h.relative_humidity_2m?.[idx];
        pressure = h.surface_pressure?.[idx];
        windSpeed = h.wind_speed_10m?.[idx];
        windDirection = h.wind_direction_10m?.[idx];
        windGusts = h.wind_gusts_10m?.[idx];
        cloudCover = h.cloud_cover?.[idx];
        uvIndex = h.uv_index?.[idx];
        precipitation = h.precipitation?.[idx];
        wCode = h.weather_code?.[idx] ?? 0;
        sunrise = json.daily?.sunrise?.[0];
        sunset = json.daily?.sunset?.[0];
        uvIndexMax = json.daily?.uv_index_max?.[0];
      }

      setData({
        temperature,
        feelsLike,
        humidity,
        pressure,
        windSpeed,
        windDirection,
        windDirectionText: windDirection !== null && windDirection !== undefined ? getWindDirection(windDirection) : undefined,
        windGusts,
        cloudCover,
        uvIndex,
        precipitation,
        weatherCode: wCode,
        weatherDescription: WMO_DESCRIPTIONS[wCode] ?? 'Nieznane',
        weatherIcon: WMO_ICONS[wCode] ?? '🌡️',
        sunrise,
        sunset,
        uvIndexMax,
        source: 'internet',
      });
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [targetDate]);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetchWeather();
    if (!targetDate) {
      const interval = setInterval(fetchWeather, REFRESH_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [fetchWeather, targetDate]);

  return { data, loading, error, lastUpdated, refresh: fetchWeather };
}
