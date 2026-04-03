export default function SensorCard({ icon, label, value, unit, sub, color = '#4facfe' }) {
  return (
    <div className="sensor-card" style={{ '--accent': color }}>
      <div className="sensor-icon">{icon}</div>
      <div className="sensor-info">
        <div className="sensor-label">{label}</div>
        <div className="sensor-value">
          {value !== undefined && value !== null ? (
            <>
              <span className="sensor-number">{typeof value === 'number' ? value.toFixed(1) : value}</span>
              {unit && <span className="sensor-unit">{unit}</span>}
            </>
          ) : (
            <span className="sensor-number sensor-na">—</span>
          )}
        </div>
        {sub && <div className="sensor-sub">{sub}</div>}
      </div>
    </div>
  );
}
