import { useMqtt } from './useMqtt';
import { useOpenMeteo } from './useOpenMeteo';

/**
 * Merges Arduino (MQTT) sensor readings with Open-Meteo internet data.
 * Arduino values take priority when available; internet data fills in gaps.
 */
export function useWeatherData(targetDate = null) {
  const internet = useOpenMeteo(targetDate);
  const { arduinoData, connected: mqttConnected, enabled: mqttEnabled } = useMqtt();

  const merged = internet.data
    ? {
        ...internet.data,
        // Override individual fields from Arduino only for real-time (today) data
        ...(targetDate === null && arduinoData?.temperature !== undefined && { temperature: arduinoData.temperature }),
        ...(targetDate === null && arduinoData?.humidity !== undefined && { humidity: arduinoData.humidity }),
        ...(targetDate === null && arduinoData?.pressure !== undefined && { pressure: arduinoData.pressure }),
        ...(targetDate === null && arduinoData?.co2 !== undefined && { co2: arduinoData.co2 }),
        source: targetDate === null && arduinoData ? 'arduino+internet' : 'internet',
      }
    : (targetDate === null ? arduinoData : null);

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
