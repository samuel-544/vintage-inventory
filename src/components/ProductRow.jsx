import { useState } from 'react'

export function ProductRow({ product, catId, dispatch }) {
  const [dispatchQty, setDispatchQty] = useState('')
  const [restockQty, setRestockQty] = useState('')
  const [displayDispatchQty, setDisplayDispatchQty] = useState('')
  const [dispatchError, setDispatchError] = useState('')
  const [restockError, setRestockError] = useState('')
  const [displayDispatchError, setDisplayDispatchError] = useState('')
  const [showRestock, setShowRestock] = useState(false)
  const [showDisplayDispatch, setShowDisplayDispatch] = useState(false)
  const isLow = product.qty <= 5

  function handleDispatch() {
    const qty = parseInt(dispatchQty)
    if (!qty || qty <= 0) { setDispatchError('Enter a valid quantity'); return }
    if (qty > product.qty) { setDispatchError(`Only ${product.qty} in stock`); return }
    dispatch({ type: 'DISPATCH', catId, prodId: product.id, qty })
    setDispatchQty('')
    setDispatchError('')
  }

  function handleRestock() {
    const qty = parseInt(restockQty)
    if (!qty || qty <= 0) { setRestockError('Enter a valid quantity'); return }
    dispatch({ type: 'RESTOCK', catId, prodId: product.id, qty })
    setRestockQty('')
    setRestockError('')
    setShowRestock(false)
  }

  function handleDisplayDispatch() {
    const qty = parseInt(displayDispatchQty)
    if (!qty || qty <= 0) { setDisplayDispatchError('Enter a valid quantity'); return }
    if (qty > product.display) { setDisplayDispatchError(`Only ${product.display} on display`); return }
    dispatch({ type: 'DISPATCH_DISPLAY', catId, prodId: product.id, qty })
    setDisplayDispatchQty('')
    setDisplayDispatchError('')
    setShowDisplayDispatch(false)
  }

  return (
    <div className={`product-row ${isLow ? 'low' : ''}`}>
      <div className="prod-info">
        <span className="prod-name">{product.name}</span>
        {isLow && <span className="low-badge">Low Stock</span>}
      </div>

      <div className="qty-block">
        <span className={`qty-num ${isLow ? 'low' : ''}`}>{product.qty}</span>
        <span className="qty-sub">in store</span>
        {product.display > 0 && (
          <>
            <span className="qty-num display-qty">{product.display}</span>
            <span className="qty-sub">on display</span>
          </>
        )}
      </div>

      <div className="prod-actions">
        <div className="dispatch-area">
          <input
            type="number"
            min="1"
            placeholder="qty"
            value={dispatchQty}
            className={dispatchError ? 'input-error' : ''}
            onChange={e => { setDispatchQty(e.target.value); setDispatchError('') }}
            onKeyDown={e => e.key === 'Enter' && handleDispatch()}
          />
          <button className="btn-dispatch" onClick={handleDispatch}>Dispatch</button>
          {dispatchError && <span className="error-msg">{dispatchError}</span>}
        </div>

        <button
          className="btn-restock-toggle"
          onClick={() => { setShowRestock(v => !v); setRestockError('') }}
        >
          {showRestock ? 'Cancel' : '+ Restock'}
        </button>

        {product.display > 0 && (
          <button
            className="btn-display-toggle"
            onClick={() => { setShowDisplayDispatch(v => !v); setDisplayDispatchError('') }}
          >
            {showDisplayDispatch ? 'Cancel' : 'Dispatch Display'}
          </button>
        )}

        {showDisplayDispatch && product.display > 0 && (
          <div className="restock-area">
            <input
              type="number"
              min="1"
              placeholder="qty"
              value={displayDispatchQty}
              className={displayDispatchError ? 'input-error' : ''}
              onChange={e => { setDisplayDispatchQty(e.target.value); setDisplayDispatchError('') }}
              onKeyDown={e => e.key === 'Enter' && handleDisplayDispatch()}
              autoFocus
            />
            <button className="btn-display-confirm" onClick={handleDisplayDispatch}>Confirm</button>
            {displayDispatchError && <span className="error-msg">{displayDispatchError}</span>}
          </div>
        )}

        {showRestock && (
          <div className="restock-area">
            <input
              type="number"
              min="1"
              placeholder="qty"
              value={restockQty}
              className={restockError ? 'input-error' : ''}
              onChange={e => { setRestockQty(e.target.value); setRestockError('') }}
              onKeyDown={e => e.key === 'Enter' && handleRestock()}
              autoFocus
            />
            <button className="btn-restock" onClick={handleRestock}>Confirm</button>
            {restockError && <span className="error-msg">{restockError}</span>}
          </div>
        )}
      </div>

      <button
        className="btn-remove"
        onClick={() => dispatch({ type: 'DELETE_PRODUCT', catId, prodId: product.id })}
        title="Remove product"
      >
        ✕
      </button>
    </div>
  )
}
