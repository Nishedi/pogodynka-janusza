import { useState, useMemo } from 'react';
import SensorCard from './SensorCard';
import StatusBar from './StatusBar';
import { useWeatherData } from '../hooks/useWeatherData';

function getTargetDate(offset) {
  if (offset === 0) return null;
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function formatDateLabel(offset) {
  if (offset === 0) return 'Dziś';
  if (offset === -1) return 'Wczoraj';
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
}

function formatSunTime(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function uvLabel(uv) {
  if (uv === undefined || uv === null) return '';
  if (uv <= 2) return 'niski';
  if (uv <= 5) return 'umiarkowany';
  if (uv <= 7) return 'wysoki';
  if (uv <= 10) return 'bardzo wysoki';
  return 'ekstremalny';
}

function co2Label(ppm) {
  if (ppm === undefined || ppm === null) return '';
  if (ppm < 800) return 'dobra';
  if (ppm < 1200) return 'umiarkowana';
  return 'zła';
}

export default function WeatherDashboard() {
  const [dateOffset, setDateOffset] = useState(0);
  const targetDate = useMemo(() => getTargetDate(dateOffset), [dateOffset]);
  const { data, loading, error, lastUpdated, refresh, mqttConnected, mqttEnabled } = useWeatherData(targetDate);
  const [seniorMode, setSeniorMode] = useState(true);

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="loader" />
        <p className="loader-text">Pobieranie danych pogodowych…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="error-wrapper">
        <div className="error-icon">⚠️</div>
        <p className="error-text">Błąd pobierania danych</p>
        <p className="error-detail">{error}</p>
        <button className="retry-btn" onClick={refresh}>Spróbuj ponownie</button>
      </div>
    );
  }

  const d = data ?? {};

  return (
    <div className={`dashboard${seniorMode ? ' senior' : ''}`}>
      {/* Header */}
      <header className="header">
        <div className="header-main">
          <h1 className="app-title">🏠 Domowa pogodynka Janusza</h1>
          <div className="location">📍 Babimost, lubuskie</div>
        </div>
        <div className="header-right">
          {d.weatherIcon && (
            <div className="weather-overview">
              <span className="weather-main-icon">{d.weatherIcon}</span>
              <span className="weather-main-desc">{d.weatherDescription}</span>
            </div>
          )}
          <button
            className={`senior-btn${seniorMode ? ' senior-btn-active' : ''}`}
            onClick={() => setSeniorMode(m => !m)}
            aria-label={seniorMode ? 'Wyłącz tryb dla seniora' : 'Włącz tryb dla seniora'}
            title={seniorMode ? 'Wyłącz tryb dla seniora' : 'Włącz tryb dla seniora'}
          >
            {seniorMode ? 'A−' : 'A+'}
          </button>
        </div>
      </header>

      {/* Status bar */}
      <StatusBar
        source={d.source}
        mqttConnected={mqttConnected}
        mqttEnabled={mqttEnabled}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      {/* Day navigation */}
      <div className="day-nav">
        <button
          className="day-nav-btn"
          onClick={() => setDateOffset(o => o - 1)}
          aria-label="Poprzedni dzień"
        >
          ◀
        </button>
        <span className="day-nav-label">{formatDateLabel(dateOffset)}</span>
        <button
          className="day-nav-btn"
          onClick={() => setDateOffset(o => o + 1)}
          disabled={dateOffset >= 0}
          aria-label="Następny dzień"
        >
          ▶
        </button>
      </div>

      {/* Primary sensors */}
      <section className="section-title">Temperatura i wilgotność</section>
      <div className="cards-grid">
        <SensorCard
          icon="🌡️"
          label="Temperatura"
          value={d.temperature}
          unit="°C"
          sub={d.feelsLike !== undefined ? `Odczuwalna: ${d.feelsLike?.toFixed(1)} °C` : undefined}
          color="#ff6b6b"
        />
        <SensorCard
          icon="💧"
          label="Wilgotność"
          value={d.humidity !== undefined ? Math.round(d.humidity) : undefined}
          unit="%"
          color="#4facfe"
        />
      </div>

      {/* Pressure & precipitation */}
      <section className="section-title">Ciśnienie i opady</section>
      <div className="cards-grid">
        <SensorCard
          icon="🔵"
          label="Ciśnienie"
          value={d.pressure !== undefined ? Math.round(d.pressure) : undefined}
          unit="hPa"
          color="#a18cd1"
        />
        <SensorCard
          icon="🌧️"
          label="Opady"
          value={d.precipitation}
          unit="mm"
          color="#48c6ef"
        />
      </div>

      {/* Wind */}
      <section className="section-title">Wiatr</section>
      <div className="cards-grid cards-grid-3">
        <SensorCard
          icon="💨"
          label="Prędkość"
          value={d.windSpeed}
          unit="km/h"
          color="#43e97b"
        />
        <SensorCard
          icon="🧭"
          label="Kierunek"
          value={d.windDirectionText}
          sub={d.windDirection !== undefined ? `${Math.round(d.windDirection)}°` : undefined}
          color="#f9ca24"
        />
        <SensorCard
          icon="🌬️"
          label="Porywy"
          value={d.windGusts}
          unit="km/h"
          color="#f0932b"
        />
      </div>

      {/* Extra */}
      <section className="section-title">Dodatkowe</section>
      <div className="cards-grid cards-grid-3">
        <SensorCard
          icon="☁️"
          label="Zachmurzenie"
          value={d.cloudCover !== undefined ? Math.round(d.cloudCover) : undefined}
          unit="%"
          color="#74b9ff"
        />
        <SensorCard
          icon="🌞"
          label="Indeks UV"
          value={d.uvIndex !== undefined ? d.uvIndex?.toFixed(1) : undefined}
          sub={uvLabel(d.uvIndex)}
          color="#fdcb6e"
        />
        {d.co2 !== undefined ? (
          <SensorCard
            icon="🌿"
            label="CO₂"
            value={d.co2 !== undefined ? Math.round(d.co2) : undefined}
            unit="ppm"
            sub={co2Label(d.co2)}
            color="#00b894"
          />
        ) : (
          <SensorCard
            icon="🌅"
            label="Wschód/Zachód"
            value={null}
            sub={
              d.sunrise && d.sunset
                ? `↑ ${formatSunTime(d.sunrise)}  ↓ ${formatSunTime(d.sunset)}`
                : undefined
            }
            color="#e17055"
          />
        )}
      </div>

      <footer className="footer">
        Dane: Open-Meteo · Arduino ready
      </footer>
    </div>
  );
}
