import { useReducer, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { seedData } from '../data/initialData'

export const initialState = {
  division: 'vintage',
  divisions: {
    vintage:    { categories: [] },
    incredible: { categories: [] }
  },
  log: [],
  search: ''
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.state, search: '' }

    case 'SET_DIVISION':
      return { ...state, division: action.division, search: '' }

    case 'SET_SEARCH':
      return { ...state, search: action.value }

    case 'ADD_CATEGORY': {
      const div = state.divisions[state.division]
      return {
        ...state,
        divisions: {
          ...state.divisions,
          [state.division]: {
            categories: [...div.categories, { id: action.id || uid(), name: action.name, products: [] }]
          }
        }
      }
    }

    case 'DELETE_CATEGORY': {
      const div = state.divisions[state.division]
      return {
        ...state,
        divisions: {
          ...state.divisions,
          [state.division]: {
            categories: div.categories.filter(c => c.id !== action.catId)
          }
        }
      }
    }

    case 'ADD_PRODUCT': {
      const div = state.divisions[state.division]
      return {
        ...state,
        divisions: {
          ...state.divisions,
          [state.division]: {
            categories: div.categories.map(c =>
              c.id !== action.catId ? c : {
                ...c,
                products: [...c.products, {
                  id: action.id || uid(),
                  name: action.name,
                  qty: action.qty,
                  original: action.qty,
                  low: action.low
                }]
              }
            )
          }
        }
      }
    }

    case 'DELETE_PRODUCT': {
      const div = state.divisions[state.division]
      return {
        ...state,
        divisions: {
          ...state.divisions,
          [state.division]: {
            categories: div.categories.map(c =>
              c.id !== action.catId ? c : {
                ...c,
                products: c.products.filter(p => p.id !== action.prodId)
              }
            )
          }
        }
      }
    }

    case 'DISPATCH': {
      const div = state.divisions[state.division]
      let dispatchedProduct = null
      const newCats = div.categories.map(c =>
        c.id !== action.catId ? c : {
          ...c,
          products: c.products.map(p => {
            if (p.id !== action.prodId) return p
            dispatchedProduct = { ...p, qty: p.qty - action.qty }
            return dispatchedProduct
          })
        }
      )
      if (!dispatchedProduct) return state
      const logEntry = {
        id: action.logId || uid(),
        productName: dispatchedProduct.name,
        division: state.division === 'vintage' ? 'Vintage Lighting' : 'Incredible',
        qtyDispatched: action.qty,
        qtyRemaining: dispatchedProduct.qty,
        time: new Date().toLocaleString('en-KE', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        })
      }
      return {
        ...state,
        divisions: {
          ...state.divisions,
          [state.division]: { categories: newCats }
        },
        log: [logEntry, ...state.log].slice(0, 100)
      }
    }

    case 'RESTOCK': {
      const div = state.divisions[state.division]
      return {
        ...state,
        divisions: {
          ...state.divisions,
          [state.division]: {
            categories: div.categories.map(c =>
              c.id !== action.catId ? c : {
                ...c,
                products: c.products.map(p =>
                  p.id !== action.prodId ? p : { ...p, qty: p.qty + action.qty }
                )
              }
            )
          }
        }
      }
    }

    default:
      return state
  }
}

function findProduct(state, catId, prodId) {
  for (const div of Object.values(state.divisions)) {
    for (const cat of div.categories) {
      if (cat.id === catId) {
        const prod = cat.products.find(p => p.id === prodId)
        if (prod) return prod
      }
    }
  }
  return null
}

async function syncToSupabase(action, preState) {
  switch (action.type) {
    case 'ADD_CATEGORY':
      await supabase.from('categories').insert({
        id: action.id,
        division: preState.division,
        name: action.name
      })
      break

    case 'DELETE_CATEGORY':
      await supabase.from('categories').delete().eq('id', action.catId)
      break

    case 'ADD_PRODUCT':
      await supabase.from('products').insert({
        id: action.id,
        category_id: action.catId,
        name: action.name,
        qty: action.qty,
        original_qty: action.qty,
        low_threshold: action.low
      })
      break

    case 'DELETE_PRODUCT':
      await supabase.from('products').delete().eq('id', action.prodId)
      break

    case 'DISPATCH': {
      const product = findProduct(preState, action.catId, action.prodId)
      if (!product) break
      const newQty = product.qty - action.qty
      await Promise.all([
        supabase.from('products').update({ qty: newQty }).eq('id', action.prodId),
        supabase.from('dispatch_log').insert({
          product_id: action.prodId,
          product_name: product.name,
          division: preState.division === 'vintage' ? 'Vintage Lighting' : 'Incredible',
          qty_dispatched: action.qty,
          qty_remaining: newQty
        })
      ])
      break
    }

    case 'RESTOCK': {
      const product = findProduct(preState, action.catId, action.prodId)
      if (!product) break
      await supabase.from('products').update({ qty: product.qty + action.qty }).eq('id', action.prodId)
      break
    }
  }
}

async function seedDatabase() {
  const catRows = []
  const prodRows = []
  for (const [divName, divData] of Object.entries(seedData.divisions)) {
    for (const cat of divData.categories) {
      catRows.push({ id: cat.id, division: divName, name: cat.name })
      for (const prod of cat.products) {
        prodRows.push({
          id: prod.id,
          category_id: cat.id,
          name: prod.name,
          qty: prod.qty,
          original_qty: prod.original,
          low_threshold: prod.low
        })
      }
    }
  }

  const { error: catErr } = await supabase.from('categories').insert(catRows)
  if (catErr) throw new Error('Failed to seed categories: ' + catErr.message)

  // Insert products in batches of 50 to avoid request size limits
  for (let i = 0; i < prodRows.length; i += 50) {
    const batch = prodRows.slice(i, i + 50)
    const { error: prodErr } = await supabase.from('products').insert(batch)
    if (prodErr) throw new Error('Failed to seed products: ' + prodErr.message)
  }
}

export function useInventory() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState('Connecting to database…')
  const [syncError, setSyncError] = useState(null)

  useEffect(() => { loadFromSupabase() }, [])

  async function loadFromSupabase() {
    setLoading(true)
    setLoadingMsg('Connecting to database…')
    try {
      let [
        { data: cats,  error: e1 },
        { data: prods, error: e2 },
        { data: log,   error: e3 }
      ] = await Promise.all([
        supabase.from('categories').select('*').order('created_at'),
        supabase.from('products').select('*').order('created_at'),
        supabase.from('dispatch_log').select('*').order('dispatched_at', { ascending: false }).limit(100)
      ])

      if (e1 || e2 || e3) throw e1 || e2 || e3

      if (!cats || cats.length === 0) {
        setLoadingMsg('First-time setup — saving your stock data to the database…')
        await seedDatabase()
        setLoadingMsg('Almost done — fetching inventory…')
        // Re-fetch after seeding (not recursive — seeded flag prevents loop)
        const { data: seededCats } = await supabase.from('categories').select('*').order('created_at')
        const { data: seededProds } = await supabase.from('products').select('*').order('created_at')
        if (!seededCats || seededCats.length === 0) {
          throw new Error('Seeding completed but tables are still empty. Check Supabase RLS settings.')
        }
        cats  = seededCats
        prods = seededProds || []
      }

      const buildDivision = (divName) => ({
        categories: cats
          .filter(c => c.division === divName)
          .map(c => ({
            id: c.id,
            name: c.name,
            products: (prods || [])
              .filter(p => p.category_id === c.id)
              .map(p => ({
                id: p.id,
                name: p.name,
                qty: p.qty,
                original: p.original_qty,
                low: p.low_threshold
              }))
          }))
      })

      dispatch({
        type: 'SET_STATE',
        state: {
          division: 'vintage',
          divisions: {
            vintage:    buildDivision('vintage'),
            incredible: buildDivision('incredible')
          },
          log: (log || []).map(e => ({
            id: String(e.id),
            productName: e.product_name,
            division: e.division,
            qtyDispatched: e.qty_dispatched,
            qtyRemaining: e.qty_remaining,
            time: new Date(e.dispatched_at).toLocaleString('en-KE', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            })
          })),
          search: ''
        }
      })
    } catch (err) {
      console.error('Failed to load from Supabase:', err)
      setSyncError('Error: ' + (err?.message || JSON.stringify(err)))
    } finally {
      setLoading(false)
    }
  }

  const syncedDispatch = useCallback(async (action) => {
    const enriched = { ...action }
    if (action.type === 'ADD_CATEGORY') enriched.id = uid()
    if (action.type === 'ADD_PRODUCT')  enriched.id = uid()

    const preState = state
    dispatch(enriched)

    try {
      await syncToSupabase(enriched, preState)
      setSyncError(null)
    } catch (err) {
      console.error('Sync failed:', err)
      setSyncError('Change saved locally but not synced. Check connection.')
    }
  }, [state])

  return { state, dispatch: syncedDispatch, loading, loadingMsg, syncError }
}
