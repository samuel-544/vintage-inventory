export function DispatchLog({ entries }) {
  if (entries.length === 0) return null

  return (
    <div className="dispatch-log">
      <h2 className="log-title">Dispatch Log</h2>
      <div className="log-list">
        {entries.map(e => (
          <div key={e.id} className={`log-entry ${e.source === 'display' ? 'log-entry-display' : ''}`}>
            <div className="log-main">
              <span className="log-product">{e.productName}</span>
              <span className="log-division">{e.division}</span>
              {e.source === 'display' && <span className="log-display-badge">Display Item</span>}
            </div>
            <div className="log-numbers">
              <span className="log-out">−{e.qtyDispatched}</span>
              <span className="log-remaining">{e.qtyRemaining} remaining</span>
            </div>
            <span className="log-time">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
