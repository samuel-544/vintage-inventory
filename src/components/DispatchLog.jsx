export function DispatchLog({ entries }) {
  if (entries.length === 0) return null

  function entryClass(source) {
    if (source === 'display')  return 'log-entry log-entry-display'
    if (source === 'restock')  return 'log-entry log-entry-restock'
    if (source === 'returned') return 'log-entry log-entry-returned'
    return 'log-entry'
  }

  return (
    <div className="dispatch-log">
      <h2 className="log-title">Stock Log</h2>
      <div className="log-list">
        {entries.map(e => (
          <div key={e.id} className={entryClass(e.source)}>
            <div className="log-main">
              <span className="log-product">{e.productName}</span>
              <span className="log-division">{e.division}</span>
              {e.source === 'display'  && <span className="log-badge log-badge-display">Display Item</span>}
              {e.source === 'restock'  && <span className="log-badge log-badge-restock">Restocked</span>}
              {e.source === 'returned' && <span className="log-badge log-badge-returned">Goods Returned</span>}
            </div>
            <div className="log-numbers">
              {(e.source === 'store' || e.source === 'display')
                ? <span className="log-out">−{e.qtyDispatched}</span>
                : <span className="log-in">+{e.qtyDispatched}</span>
              }
              <span className="log-remaining">{e.qtyRemaining} remaining</span>
            </div>
            <span className="log-time">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
