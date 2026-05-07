export function DispatchLog({ entries }) {
  if (entries.length === 0) return null

  function entryClass(source) {
    if (source === 'display')   return 'log-entry log-entry-display'
    if (source === 'restock')   return 'log-entry log-entry-restock'
    if (source === 'returned')  return 'log-entry log-entry-returned'
    if (source === 'reserved')  return 'log-entry log-entry-reserved'
    if (source === 'collected') return 'log-entry log-entry-collected'
    return 'log-entry'
  }

  function qtyDisplay(e) {
    if (e.source === 'store' || e.source === 'display' || e.source === 'collected')
      return <span className="log-out">−{e.qtyDispatched}</span>
    if (e.source === 'restock' || e.source === 'returned')
      return <span className="log-in">+{e.qtyDispatched}</span>
    return <span className="log-neutral">{e.qtyDispatched}</span>
  }

  function remainingLabel(source) {
    if (source === 'cancelled') return 'still reserved'
    if (source === 'display')   return 'on display'
    if (source === 'reserved')  return 'in store'
    return 'remaining'
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
              {e.source === 'display'   && <span className="log-badge log-badge-display">Display Item</span>}
              {e.source === 'restock'   && <span className="log-badge log-badge-restock">Restocked</span>}
              {e.source === 'returned'  && <span className="log-badge log-badge-returned">Goods Returned</span>}
              {e.source === 'reserved'  && <span className="log-badge log-badge-reserved">Reserved</span>}
              {e.source === 'collected' && <span className="log-badge log-badge-collected">Collected</span>}
              {e.source === 'cancelled' && <span className="log-badge log-badge-cancelled">Res. Cancelled</span>}
            </div>
            <div className="log-numbers">
              {qtyDisplay(e)}
              <span className="log-remaining">{e.qtyRemaining} {remainingLabel(e.source)}</span>
            </div>
            <span className="log-time">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
