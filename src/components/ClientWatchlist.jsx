import { useState, useMemo } from 'react'

export function ClientWatchlist({ state, dispatch }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [formError, setFormError] = useState('')

  const allProducts = useMemo(() => {
    const products = []
    for (const [divName, div] of Object.entries(state.divisions)) {
      for (const cat of div.categories) {
        for (const prod of cat.products) {
          products.push({ ...prod, catId: cat.id, catName: cat.name,
            divLabel: divName === 'vintage' ? 'Vintage Lighting' : 'Incredible' })
        }
      }
    }
    return products
  }, [state.divisions])

  const productMap = useMemo(() => {
    const map = {}
    for (const p of allProducts) map[p.id] = p
    return map
  }, [allProducts])

  const watchlists = state.watchlists || []

  const alerts = useMemo(() => {
    return watchlists
      .filter(w => w.status === 'active')
      .map(w => ({
        ...w,
        affectedItems: w.items
          .filter(item => { const p = productMap[item.productId]; return p && p.qty < item.qtyWanted })
          .map(item => ({ ...item, currentQty: productMap[item.productId]?.qty ?? 0 }))
      }))
      .filter(w => w.affectedItems.length > 0)
  }, [watchlists, productMap])

  const alertedIds = new Set(alerts.map(a => a.id))
  const activeWatchlists = watchlists.filter(w => w.status === 'active')
  const normalWatchlists = activeWatchlists.filter(w => !alertedIds.has(w.id))

  const filteredProducts = productSearch.length >= 2
    ? allProducts
        .filter(p =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
          !selectedItems.find(i => i.productId === p.id)
        )
        .slice(0, 8)
    : []

  function addItem(product) {
    setSelectedItems(prev => [...prev, {
      productId: product.id,
      productName: product.name,
      catId: product.catId,
      qtyWanted: 1,
      stockAtTimeAdded: product.qty
    }])
    setProductSearch('')
    setFormError('')
  }

  function updateItemQty(productId, qty) {
    setSelectedItems(prev => prev.map(i =>
      i.productId === productId ? { ...i, qtyWanted: qty } : i
    ))
  }

  function removeItem(productId) {
    setSelectedItems(prev => prev.filter(i => i.productId !== productId))
  }

  function handleSubmit() {
    if (!clientName.trim()) { setFormError('Client name is required'); return }
    if (!clientPhone.trim()) { setFormError('Phone number is required'); return }
    if (selectedItems.length === 0) { setFormError('Add at least one item'); return }
    if (selectedItems.some(i => !i.qtyWanted || i.qtyWanted < 1)) {
      setFormError('All items need a valid quantity'); return
    }
    dispatch({
      type: 'ADD_WATCHLIST',
      watchlist: {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        clientName: clientName.trim(),
        phone: clientPhone.trim(),
        items: selectedItems,
        status: 'active',
        createdAt: new Date().toISOString()
      }
    })
    setClientName(''); setClientPhone(''); setSelectedItems([])
    setFormError(''); setShowForm(false); setProductSearch('')
  }

  function buildWhatsAppUrl(watchlist, affectedItems) {
    const lines = affectedItems.map(i =>
      `• ${i.productName}: you wanted ${i.qtyWanted} pcs, only ${i.currentQty} in stock`
    ).join('\n')
    const msg = [
      `Hello ${watchlist.clientName},`,
      ``,
      `This is a stock alert from Vintage Lighting & Interiors.`,
      ``,
      `The items you were interested in have reduced in stock:`,
      lines,
      ``,
      `Please contact us urgently to confirm your order before stock runs out.`,
      ``,
      `Vintage Lighting & Interiors`
    ].join('\n')
    const phone = watchlist.phone.replace(/[^0-9+]/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  function closeForm() {
    setShowForm(false); setFormError(''); setSelectedItems([])
    setClientName(''); setClientPhone(''); setProductSearch('')
  }

  return (
    <div className="watchlist-section">
      <button
        className={`watchlist-toggle ${alerts.length > 0 ? 'has-alerts' : ''}`}
        onClick={() => setIsOpen(v => !v)}
      >
        <span className="wl-toggle-label">Client Interests</span>
        {alerts.length > 0 && (
          <span className="wl-alert-badge">
            {alerts.length} stock alert{alerts.length > 1 ? 's' : ''}
          </span>
        )}
        {activeWatchlists.length > 0 && alerts.length === 0 && (
          <span className="wl-count">{activeWatchlists.length} active</span>
        )}
        <span className="wl-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="watchlist-body">

          {/* ── Alerted watchlists ── */}
          {alerts.map(w => (
            <div key={w.id} className="wl-alert-card">
              <div className="wl-alert-header">
                <span className="wl-alert-icon">⚠</span>
                <div className="wl-alert-client-info">
                  <span className="wl-client-name">{w.clientName}</span>
                  <span className="wl-phone">{w.phone}</span>
                </div>
                <a
                  href={buildWhatsAppUrl(w, w.affectedItems)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  Notify via WhatsApp
                </a>
                <button
                  className="btn-wl-done"
                  onClick={() => dispatch({ type: 'CLOSE_WATCHLIST', id: w.id })}
                >
                  Done
                </button>
              </div>

              <div className="wl-alert-items">
                {/* Affected items first */}
                {w.affectedItems.map(item => (
                  <div key={item.productId} className="wl-alert-item">
                    <span className="wl-ai-name">{item.productName}</span>
                    <span className="wl-ai-wanted">wanted {item.qtyWanted}</span>
                    <span className="wl-ai-current">only {item.currentQty} left</span>
                  </div>
                ))}
                {/* Unaffected items, dimmed */}
                {w.items
                  .filter(i => !w.affectedItems.find(a => a.productId === i.productId))
                  .map(item => {
                    const prod = productMap[item.productId]
                    return (
                      <div key={item.productId} className="wl-alert-item wl-alert-item-ok">
                        <span className="wl-ai-name">{item.productName}</span>
                        <span className="wl-ai-wanted">wanted {item.qtyWanted}</span>
                        <span className="wl-ai-ok">{prod?.qty ?? '—'} in stock ✓</span>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          ))}

          {/* ── Normal active watchlists ── */}
          {normalWatchlists.map(w => (
            <div key={w.id} className="wl-entry">
              <div className="wl-entry-header">
                <div className="wl-entry-client">
                  <span className="wl-client-name">{w.clientName}</span>
                  <span className="wl-phone">{w.phone}</span>
                </div>
                <div className="wl-entry-actions">
                  <button
                    className="btn-wl-done"
                    onClick={() => dispatch({ type: 'CLOSE_WATCHLIST', id: w.id })}
                  >
                    Mark Done
                  </button>
                  <button
                    className="btn-wl-delete"
                    onClick={() => dispatch({ type: 'DELETE_WATCHLIST', id: w.id })}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="wl-entry-items">
                {w.items.map(item => {
                  const prod = productMap[item.productId]
                  const currentQty = prod?.qty ?? '—'
                  const isOk = prod && prod.qty >= item.qtyWanted
                  return (
                    <div key={item.productId} className="wl-entry-item">
                      <span className="wl-ei-name">{item.productName}</span>
                      <span className="wl-ei-wanted">wants {item.qtyWanted} pcs</span>
                      <span className={`wl-ei-stock ${isOk ? 'ok' : 'low'}`}>
                        {currentQty} in stock
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {activeWatchlists.length === 0 && !showForm && (
            <p className="wl-empty">No client interests registered yet.</p>
          )}

          {/* ── Add form ── */}
          {showForm ? (
            <div className="wl-form">
              <span className="wl-form-title">Register Client Interest</span>

              <div className="wl-form-row">
                <label className="wl-form-field">
                  <span>Client Name</span>
                  <input
                    placeholder="e.g. John Kariuki"
                    value={clientName}
                    onChange={e => { setClientName(e.target.value); setFormError('') }}
                  />
                </label>
                <label className="wl-form-field">
                  <span>WhatsApp Phone</span>
                  <input
                    placeholder="e.g. +254712345678"
                    value={clientPhone}
                    onChange={e => { setClientPhone(e.target.value); setFormError('') }}
                  />
                </label>
              </div>

              <div className="wl-product-picker">
                <span className="wl-picker-label">Search &amp; add items</span>
                <div className="wl-picker-search">
                  <input
                    placeholder="Type product name…"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                  />
                  {filteredProducts.length > 0 && (
                    <div className="wl-dropdown">
                      {filteredProducts.map(p => (
                        <button
                          key={p.id}
                          className="wl-dropdown-item"
                          onClick={() => addItem(p)}
                        >
                          <span className="wl-di-name">{p.name}</span>
                          <span className="wl-di-meta">{p.catName} · {p.qty} in stock</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="wl-selected">
                  {selectedItems.map(item => (
                    <div key={item.productId} className="wl-selected-item">
                      <span className="wl-si-name">{item.productName}</span>
                      <label className="wl-si-qty">
                        <span>qty wanted</span>
                        <input
                          type="number" min="1"
                          value={item.qtyWanted}
                          onChange={e => updateItemQty(item.productId, parseInt(e.target.value) || 1)}
                        />
                      </label>
                      <span className="wl-si-stock">({item.stockAtTimeAdded} in stock now)</span>
                      <button className="btn-wl-remove-item" onClick={() => removeItem(item.productId)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {formError && <span className="error-msg">{formError}</span>}
              <div className="form-buttons">
                <button className="btn-wl-save" onClick={handleSubmit}>Save Interest</button>
                <button className="btn-cancel" onClick={closeForm}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn-show-form" onClick={() => setShowForm(true)}>
              + Add Client Interest
            </button>
          )}
        </div>
      )}
    </div>
  )
}
