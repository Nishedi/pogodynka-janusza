export default function StatusBar({ source, mqttConnected, mqttEnabled, lastUpdated, onRefresh }) {
  const sourceLabel = {
    internet: 'Internet',
    arduino: 'Arduino',
    'arduino+internet': 'Arduino + Internet',
  }[source] ?? source;

  const formatTime = (date) => {
    if (!date) return '—';
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        <span className={`status-dot ${mqttEnabled ? (mqttConnected ? 'dot-green' : 'dot-red') : 'dot-gray'}`} />
        <span className="status-text">
          {mqttEnabled ? (mqttConnected ? 'Arduino: połączono' : 'Arduino: brak połączenia') : 'Tryb: internet'}
        </span>
      </div>
      <div className="status-right">
        {source && <span className="status-source">{sourceLabel}</span>}
        {lastUpdated && <span className="status-time">· {formatTime(lastUpdated)}</span>}
        <button className="refresh-btn" onClick={onRefresh} title="Odśwież">
          🔄
        </button>
      </div>
    </div>
  );
}
