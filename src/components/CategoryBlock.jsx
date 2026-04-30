import { useState } from 'react'
import { ProductRow } from './ProductRow'

export function CategoryBlock({ category, dispatch }) {
  const [open, setOpen] = useState(true)
  const [prodName, setProdName] = useState('')
  const [prodQty, setProdQty] = useState('')
  const [prodLow, setProdLow] = useState('')
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)

  function handleAddProduct() {
    if (!prodName.trim()) { setFormError('Product name is required'); return }
    const qty = parseInt(prodQty)
    if (isNaN(qty) || qty < 0) { setFormError('Enter a valid stock count'); return }
    const low = parseInt(prodLow)
    if (isNaN(low) || low < 0) { setFormError('Enter a valid low-stock threshold'); return }
    dispatch({ type: 'ADD_PRODUCT', catId: category.id, name: prodName.trim(), qty, low })
    setProdName('')
    setProdQty('')
    setProdLow('')
    setFormError('')
    setShowForm(false)
  }

  return (
    <div className="category-block">
      <div className="category-header">
        <button className="cat-toggle" onClick={() => setOpen(v => !v)}>
          <span className="cat-chevron">{open ? '▾' : '▸'}</span>
          <span className="cat-name">{category.name}</span>
          <span className="cat-count">{category.products.length}</span>
        </button>
        <button
          className="btn-delete-cat"
          onClick={() => dispatch({ type: 'DELETE_CATEGORY', catId: category.id })}
          title="Delete category"
        >
          Delete
        </button>
      </div>

      {open && (
        <div className="category-body">
          {category.products.length === 0 && (
            <p className="empty-msg">No products yet — add one below.</p>
          )}
          {category.products.map(p => (
            <ProductRow key={p.id} product={p} catId={category.id} dispatch={dispatch} />
          ))}

          {showForm ? (
            <div className="add-product-form">
              <input
                placeholder="Product name"
                value={prodName}
                onChange={e => { setProdName(e.target.value); setFormError('') }}
              />
              <input
                type="number"
                min="0"
                placeholder="Initial stock"
                value={prodQty}
                onChange={e => { setProdQty(e.target.value); setFormError('') }}
              />
              <input
                type="number"
                min="0"
                placeholder="Low-stock threshold"
                value={prodLow}
                onChange={e => { setProdLow(e.target.value); setFormError('') }}
              />
              {formError && <span className="error-msg">{formError}</span>}
              <div className="form-buttons">
                <button className="btn-add-product" onClick={handleAddProduct}>Add Product</button>
                <button className="btn-cancel" onClick={() => { setShowForm(false); setFormError('') }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn-show-form" onClick={() => setShowForm(true)}>
              + Add product
            </button>
          )}
        </div>
      )}
    </div>
  )
}
