import { useState, useEffect, useRef, useCallback } from 'react';
import mqtt from 'mqtt';

// Configure your MQTT broker here.
// For WebSocket connections use ws:// or wss://
// Example: 'ws://192.168.1.100:9001'
// Leave as empty string to disable MQTT and use internet data only.
const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL || '';

const MQTT_TOPICS = {
  temperature: 'home/weather/temperature',
  humidity: 'home/weather/humidity',
  pressure: 'home/weather/pressure',
  co2: 'home/weather/co2',
};

export function useMqtt() {
  const [arduinoData, setArduinoData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [enabled] = useState(() => Boolean(MQTT_BROKER_URL));
  const clientRef = useRef(null);

  const updateField = useCallback((field, rawValue) => {
    const value = parseFloat(rawValue);
    if (isNaN(value)) return;
    setArduinoData((prev) => ({ ...(prev ?? {}), [field]: value, source: 'arduino' }));
  }, []);

  useEffect(() => {
    if (!MQTT_BROKER_URL) return;

    const client = mqtt.connect(MQTT_BROKER_URL, {
      reconnectPeriod: 5000,
      connectTimeout: 10000,
    });
    clientRef.current = client;

    client.on('connect', () => {
      setConnected(true);
      Object.values(MQTT_TOPICS).forEach((topic) => client.subscribe(topic));
    });

    client.on('disconnect', () => setConnected(false));
    client.on('error', () => setConnected(false));
    client.on('offline', () => setConnected(false));

    client.on('message', (topic, message) => {
      const value = message.toString();
      switch (topic) {
        case MQTT_TOPICS.temperature:
          updateField('temperature', value);
          break;
        case MQTT_TOPICS.humidity:
          updateField('humidity', value);
          break;
        case MQTT_TOPICS.pressure:
          updateField('pressure', value);
          break;
        case MQTT_TOPICS.co2:
          updateField('co2', value);
          break;
        default:
          break;
      }
    });

    return () => {
      client.end(true);
    };
  }, [updateField]);

  return { arduinoData, connected, enabled };
}
