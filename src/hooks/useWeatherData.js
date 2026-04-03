import { useMqtt } from './useMqtt';
import { useOpenMeteo } from './useOpenMeteo';

/**
 * Merges Arduino (MQTT) sensor readings with Open-Meteo internet data.
 * Arduino values take priority when available; internet data fills in gaps.
 */
export function useWeatherData() {
  const internet = useOpenMeteo();
  const { arduinoData, connected: mqttConnected, enabled: mqttEnabled } = useMqtt();

  const merged = internet.data
    ? {
        ...internet.data,
        // Override individual fields from Arduino when present
        ...(arduinoData?.temperature !== undefined && { temperature: arduinoData.temperature }),
        ...(arduinoData?.humidity !== undefined && { humidity: arduinoData.humidity }),
        ...(arduinoData?.pressure !== undefined && { pressure: arduinoData.pressure }),
        ...(arduinoData?.co2 !== undefined && { co2: arduinoData.co2 }),
        source: arduinoData ? 'arduino+internet' : 'internet',
      }
    : arduinoData;

  return {
    data: merged,
    loading: internet.loading,
    error: internet.error,
    lastUpdated: internet.lastUpdated,
    refresh: internet.refresh,
    mqttConnected,
    mqttEnabled,
  };
}
