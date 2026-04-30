import { useState } from 'react'
import { useInventory } from './store/useInventory'
import { StatsBar } from './components/StatsBar'
import { CategoryBlock } from './components/CategoryBlock'
import { DispatchLog } from './components/DispatchLog'
import { ReportsBar } from './components/ReportsBar'
import './App.css'

export default function App() {
  const { state, dispatch, loading, loadingMsg, syncError } = useInventory()
  const [newCatName, setNewCatName] = useState('')
  const currentDiv = state.divisions[state.division]

  const filtered = currentDiv.categories.map(cat => ({
    ...cat,
    products: cat.products.filter(p =>
      !state.search || p.name.toLowerCase().includes(state.search.toLowerCase())
    )
  })).filter(cat => !state.search || cat.products.length > 0)

  const allProducts = currentDiv.categories.flatMap(c => c.products)
  const lowCount = allProducts.filter(p => p.qty <= 5).length

  function handleAddCategory() {
    if (newCatName.trim()) {
      dispatch({ type: 'ADD_CATEGORY', name: newCatName.trim() })
      setNewCatName('')
    }
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>{loadingMsg}</p>
      <p className="loading-sub">This may take a moment on first load.</p>
    </div>
  )

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">Vintage Lighting &amp; Interiors</h1>
          <p className="app-sub">Inventory Management</p>
        </div>
        <div className="division-tabs">
          {['vintage', 'incredible'].map(d => (
            <button
              key={d}
              className={`tab-btn ${state.division === d ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_DIVISION', division: d })}
            >
              {d === 'vintage' ? 'Vintage Lighting' : 'Incredible'}
            </button>
          ))}
        </div>
      </header>

      {syncError && <div className="sync-error">{syncError}</div>}
      <main className="app-main">
        <StatsBar
          total={allProducts.length}
          categories={currentDiv.categories.length}
          low={lowCount}
        />

        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search products…"
            value={state.search}
            onChange={e => dispatch({ type: 'SET_SEARCH', value: e.target.value })}
          />
          <div className="add-cat-row">
            <input
              className="cat-input"
              placeholder="New category name"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            />
            <button className="btn-add-cat" onClick={handleAddCategory}>
              + Add Category
            </button>
          </div>
        </div>

        <ReportsBar state={state} />

        {filtered.length === 0 && !state.search && (
          <div className="empty-state">
            <p>No categories yet.</p>
            <p>Add your first category above to get started.</p>
          </div>
        )}

        {filtered.length === 0 && state.search && (
          <div className="empty-state">
            <p>No products match &ldquo;<strong>{state.search}</strong>&rdquo;.</p>
          </div>
        )}

        {filtered.map(cat => (
          <CategoryBlock key={cat.id} category={cat} dispatch={dispatch} />
        ))}

        <DispatchLog entries={state.log} />
      </main>
    </div>
  )
}
