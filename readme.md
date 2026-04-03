# 🏠 Domowa pogodynka Janusza

Responsywna aplikacja pogodowa (mobile-first) dla miejscowości **Babimost** (woj. lubuskie).

## Funkcje

- 🌡️ Temperatura + odczuwalna
- 💧 Wilgotność względna
- 🔵 Ciśnienie atmosferyczne (hPa)
- 🌧️ Opady (mm)
- 💨 Prędkość i kierunek wiatru + porywy
- ☁️ Zachmurzenie
- 🌞 Indeks UV
- 🌅 Wschód / zachód słońca
- 🌿 CO₂ z Arduino (gdy podłączone)

## Źródła danych

| Tryb | Opis |
|------|------|
| **Internet** | [Open-Meteo](https://open-meteo.com/) – dane co 10 min, bezpłatne, bez klucza API |
| **Arduino** | Odczyt przez MQTT (WebSocket) – zastępuje dane internetowe gdy Arduino jest podłączone |

## Uruchomienie

```bash
npm install
npm run dev
```

Produkcja:

```bash
npm run build
npm run preview
```

## Konfiguracja MQTT (Arduino)

1. Skopiuj `.env.example` → `.env`
2. Ustaw adres brokera MQTT:

```env
VITE_MQTT_BROKER_URL=ws://192.168.1.100:9001
```

Arduino powinno publikować dane na tematy:

| Temat MQTT | Dane |
|-----------|------|
| `home/weather/temperature` | Temperatura °C |
| `home/weather/humidity` | Wilgotność % |
| `home/weather/pressure` | Ciśnienie hPa |
| `home/weather/co2` | CO₂ ppm |
