import { useState } from 'react'

export function ProductRow({ product, catId, dispatch }) {
  const [dispatchQty, setDispatchQty] = useState('')
  const [restockQty, setRestockQty] = useState('')
  const [returnedQty, setReturnedQty] = useState('')
  const [displayDispatchQty, setDisplayDispatchQty] = useState('')
  const [reserveQty, setReserveQty] = useState('')
  const [collectQty, setCollectQty] = useState('')
  const [cancelResQty, setCancelResQty] = useState('')

  const [dispatchError, setDispatchError] = useState('')
  const [restockError, setRestockError] = useState('')
  const [returnedError, setReturnedError] = useState('')
  const [displayDispatchError, setDisplayDispatchError] = useState('')
  const [reserveError, setReserveError] = useState('')
  const [collectError, setCollectError] = useState('')
  const [cancelResError, setCancelResError] = useState('')

  const [showRestock, setShowRestock] = useState(false)
  const [showReturned, setShowReturned] = useState(false)
  const [showDisplayDispatch, setShowDisplayDispatch] = useState(false)
  const [showReserve, setShowReserve] = useState(false)
  const [showCollect, setShowCollect] = useState(false)
  const [showCancelRes, setShowCancelRes] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const [editName, setEditName] = useState('')
  const [editQty, setEditQty] = useState('')
  const [editDisplay, setEditDisplay] = useState('')
  const [editFaulty, setEditFaulty] = useState('')
  const [editError, setEditError] = useState('')

  const isLow = product.qty <= 5

  function closeAllToggles() {
    setShowRestock(false); setShowReturned(false)
    setShowDisplayDispatch(false); setShowReserve(false)
    setShowCollect(false); setShowCancelRes(false)
  }

  function handleOpenEdit() {
    setEditName(product.name)
    setEditQty(String(product.qty))
    setEditDisplay(String(product.display))
    setEditFaulty(String(product.faulty))
    setEditError('')
    setShowEdit(true)
  }

  function handleSaveEdit() {
    if (!editName.trim()) { setEditError('Name is required'); return }
    const qty = parseInt(editQty)
    if (isNaN(qty) || qty < 0) { setEditError('Invalid store stock'); return }
    const display = editDisplay === '' ? 0 : parseInt(editDisplay)
    if (isNaN(display) || display < 0) { setEditError('Invalid display count'); return }
    const faulty = editFaulty === '' ? 0 : parseInt(editFaulty)
    if (isNaN(faulty) || faulty < 0) { setEditError('Invalid faulty count'); return }
    dispatch({ type: 'EDIT_PRODUCT', catId, prodId: product.id, name: editName.trim(), qty, display, faulty })
    setShowEdit(false)
  }

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

  function handleGoodsReturned() {
    const qty = parseInt(returnedQty)
    if (!qty || qty <= 0) { setReturnedError('Enter a valid quantity'); return }
    dispatch({ type: 'GOODS_RETURNED', catId, prodId: product.id, qty })
    setReturnedQty('')
    setReturnedError('')
    setShowReturned(false)
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

  function handleReserve() {
    const qty = parseInt(reserveQty)
    if (!qty || qty <= 0) { setReserveError('Enter a valid quantity'); return }
    if (qty > product.qty) { setReserveError(`Only ${product.qty} in stock`); return }
    dispatch({ type: 'RESERVE', catId, prodId: product.id, qty })
    setReserveQty('')
    setReserveError('')
    setShowReserve(false)
  }

  function handleCollect() {
    const qty = parseInt(collectQty)
    if (!qty || qty <= 0) { setCollectError('Enter a valid quantity'); return }
    if (qty > product.reserved) { setCollectError(`Only ${product.reserved} reserved`); return }
    dispatch({ type: 'COLLECT_RESERVATION', catId, prodId: product.id, qty })
    setCollectQty('')
    setCollectError('')
    setShowCollect(false)
  }

  function handleCancelRes() {
    const qty = parseInt(cancelResQty)
    if (!qty || qty <= 0) { setCancelResError('Enter a valid quantity'); return }
    if (qty > product.reserved) { setCancelResError(`Only ${product.reserved} reserved`); return }
    dispatch({ type: 'CANCEL_RESERVATION', catId, prodId: product.id, qty })
    setCancelResQty('')
    setCancelResError('')
    setShowCancelRes(false)
  }

  return (
    <>
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
          {product.faulty > 0 && (
            <>
              <span className="qty-num faulty-qty">{product.faulty}</span>
              <span className="qty-sub">faulty</span>
            </>
          )}
          {product.reserved > 0 && (
            <>
              <span className="qty-num reserved-qty">{product.reserved}</span>
              <span className="qty-sub">reserved</span>
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

          <div className="stock-in-toggles">
            <button
              className="btn-restock-toggle"
              onClick={() => { closeAllToggles(); setShowRestock(v => !v); setRestockError('') }}
            >
              {showRestock ? 'Cancel' : '+ Restock'}
            </button>
            <button
              className="btn-returned-toggle"
              onClick={() => { closeAllToggles(); setShowReturned(v => !v); setReturnedError('') }}
            >
              {showReturned ? 'Cancel' : '+ Returned'}
            </button>
            <button
              className="btn-reserve-toggle"
              onClick={() => { closeAllToggles(); setShowReserve(v => !v); setReserveError('') }}
            >
              {showReserve ? 'Cancel' : '+ Reserve'}
            </button>
          </div>

          {showRestock && (
            <div className="restock-area">
              <input
                type="number" min="1" placeholder="qty"
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

          {showReturned && (
            <div className="restock-area">
              <input
                type="number" min="1" placeholder="qty"
                value={returnedQty}
                className={returnedError ? 'input-error' : ''}
                onChange={e => { setReturnedQty(e.target.value); setReturnedError('') }}
                onKeyDown={e => e.key === 'Enter' && handleGoodsReturned()}
                autoFocus
              />
              <button className="btn-returned" onClick={handleGoodsReturned}>Confirm</button>
              {returnedError && <span className="error-msg">{returnedError}</span>}
            </div>
          )}

          {showReserve && (
            <div className="restock-area">
              <input
                type="number" min="1" placeholder="qty"
                value={reserveQty}
                className={reserveError ? 'input-error' : ''}
                onChange={e => { setReserveQty(e.target.value); setReserveError('') }}
                onKeyDown={e => e.key === 'Enter' && handleReserve()}
                autoFocus
              />
              <button className="btn-reserve" onClick={handleReserve}>Confirm</button>
              {reserveError && <span className="error-msg">{reserveError}</span>}
            </div>
          )}

          {product.display > 0 && (
            <button
              className="btn-display-toggle"
              onClick={() => { closeAllToggles(); setShowDisplayDispatch(v => !v); setDisplayDispatchError('') }}
            >
              {showDisplayDispatch ? 'Cancel' : 'Dispatch Display'}
            </button>
          )}

          {showDisplayDispatch && product.display > 0 && (
            <div className="restock-area">
              <input
                type="number" min="1" placeholder="qty"
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

          {product.reserved > 0 && (
            <div className="stock-in-toggles">
              <button
                className="btn-collect-toggle"
                onClick={() => { closeAllToggles(); setShowCollect(v => !v); setCollectError('') }}
              >
                {showCollect ? 'Cancel' : 'Collect'}
              </button>
              <button
                className="btn-cancel-res-toggle"
                onClick={() => { closeAllToggles(); setShowCancelRes(v => !v); setCancelResError('') }}
              >
                {showCancelRes ? 'Cancel' : 'Cancel Res.'}
              </button>
            </div>
          )}

          {showCollect && product.reserved > 0 && (
            <div className="restock-area">
              <input
                type="number" min="1" placeholder="qty"
                value={collectQty}
                className={collectError ? 'input-error' : ''}
                onChange={e => { setCollectQty(e.target.value); setCollectError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCollect()}
                autoFocus
              />
              <button className="btn-collect" onClick={handleCollect}>Confirm</button>
              {collectError && <span className="error-msg">{collectError}</span>}
            </div>
          )}

          {showCancelRes && product.reserved > 0 && (
            <div className="restock-area">
              <input
                type="number" min="1" placeholder="qty"
                value={cancelResQty}
                className={cancelResError ? 'input-error' : ''}
                onChange={e => { setCancelResQty(e.target.value); setCancelResError('') }}
                onKeyDown={e => e.key === 'Enter' && handleCancelRes()}
                autoFocus
              />
              <button className="btn-cancel-res" onClick={handleCancelRes}>Confirm</button>
              {cancelResError && <span className="error-msg">{cancelResError}</span>}
            </div>
          )}
        </div>

        <div className="row-end-buttons">
          <button className="btn-edit" onClick={handleOpenEdit} title="Edit product">✎</button>
          <button
            className="btn-remove"
            onClick={() => dispatch({ type: 'DELETE_PRODUCT', catId, prodId: product.id })}
            title="Remove product"
          >
            ✕
          </button>
        </div>
      </div>

      {showEdit && (
        <div className="product-edit-form">
          <span className="edit-form-title">Edit product</span>
          <div className="edit-form-fields">
            <label>
              <span>Name</span>
              <input
                value={editName}
                onChange={e => { setEditName(e.target.value); setEditError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
              />
            </label>
            <label>
              <span>Store stock</span>
              <input
                type="number" min="0"
                value={editQty}
                onChange={e => { setEditQty(e.target.value); setEditError('') }}
              />
            </label>
            <label>
              <span>Display pieces</span>
              <input
                type="number" min="0"
                value={editDisplay}
                onChange={e => { setEditDisplay(e.target.value); setEditError('') }}
              />
            </label>
            <label>
              <span>Faulty / incomplete</span>
              <input
                type="number" min="0"
                value={editFaulty}
                onChange={e => { setEditFaulty(e.target.value); setEditError('') }}
              />
            </label>
          </div>
          {editError && <span className="error-msg">{editError}</span>}
          <div className="form-buttons">
            <button className="btn-save-edit" onClick={handleSaveEdit}>Save Changes</button>
            <button className="btn-cancel" onClick={() => setShowEdit(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}
