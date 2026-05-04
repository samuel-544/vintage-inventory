// One-time migration script — adds Accessories and Taps categories from Vintage5/6/7 images.
// Run once with:  node migrate-new-categories.js

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Parse .env.local
const env = readFileSync('.env.local', 'utf8')
const supabaseUrl = env.match(/VITE_SUPABASE_URL=([^\n\r]+)/)?.[1]?.trim()
const supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=([^\n\r]+)/)?.[1]?.trim()

if (!supabaseUrl || !supabaseKey) {
  console.error('Could not read Supabase credentials from .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ── Categories ────────────────────────────────────────────────────────────────

const categories = [
  { id: 'v-cat-6', division: 'vintage', name: 'Accessories' },
  { id: 'v-cat-7', division: 'vintage', name: 'Taps' },
]

// ── Products ──────────────────────────────────────────────────────────────────
// faulty_qty = incomplete / missing parts (from image annotations)

const accessories = [
  // ── Left column (Vintage5) ─────────────────────────────────────────────────
  { id: 'v6-p1',  name: '911',        qty: 19, faulty_qty: 0 },
  { id: 'v6-p2',  name: '69213C',     qty: 10, faulty_qty: 0 },
  { id: 'v6-p3',  name: 'TI007-3',    qty: 18, faulty_qty: 0 },
  { id: 'v6-p4',  name: '25217',      qty: 24, faulty_qty: 0 },
  { id: 'v6-p5',  name: '69288C',     qty: 15, faulty_qty: 0 },
  { id: 'v6-p6',  name: '303C',       qty:  3, faulty_qty: 0 },
  { id: 'v6-p7',  name: '7208',       qty:  4, faulty_qty: 0 },
  { id: 'v6-p8',  name: 'F9056',      qty: 21, faulty_qty: 0 },
  { id: 'v6-p9',  name: '25010',      qty: 11, faulty_qty: 0 },
  { id: 'v6-p10', name: '692150',     qty: 11, faulty_qty: 0 },
  // (two crossed-out entries skipped)
  { id: 'v6-p11', name: 'F0352',      qty:  2, faulty_qty: 0 },
  { id: 'v6-p12', name: 'TAIZG-100',  qty:  2, faulty_qty: 0 },
  { id: 'v6-p13', name: '69201MC',    qty:  1, faulty_qty: 0 },
  { id: 'v6-p14', name: '25009',      qty:  4, faulty_qty: 0 },
  { id: 'v6-p15', name: 'H5183',      qty:  6, faulty_qty: 0 },
  { id: 'v6-p16', name: '303 BK',     qty: 17, faulty_qty: 0 },
  { id: 'v6-p17', name: 'H5181',      qty: 13, faulty_qty: 0 },
  { id: 'v6-p18', name: '6532',       qty:  2, faulty_qty: 0 },
  // (one crossed-out entry skipped)
  { id: 'v6-p19', name: '69218C',     qty: 11, faulty_qty: 0 },

  // ── Right column (Vintage5) ────────────────────────────────────────────────
  { id: 'v6-p20', name: '301 BK',     qty: 36, faulty_qty: 1 }, // +1 noted
  { id: 'v6-p21', name: '3413',       qty: 16, faulty_qty: 0 },
  { id: 'v6-p22', name: '69303',      qty:  2, faulty_qty: 0 },
  { id: 'v6-p23', name: '305-103A',   qty:  2, faulty_qty: 0 },
  { id: 'v6-p24', name: '306 BK',     qty:  8, faulty_qty: 0 },
  { id: 'v6-p25', name: '69203C',     qty:  5, faulty_qty: 0 },
  { id: 'v6-p26', name: '89201C',     qty: 12, faulty_qty: 0 },
  { id: 'v6-p27', name: '3482',       qty: 16, faulty_qty: 0 },
  { id: 'v6-p28', name: '3472',       qty:  9, faulty_qty: 0 },
  { id: 'v6-p29', name: '6411',       qty:  2, faulty_qty: 0 },
  { id: 'v6-p30', name: '6430',       qty: 11, faulty_qty: 0 },
  { id: 'v6-p31', name: '3462',       qty:  7, faulty_qty: 0 },
  { id: 'v6-p32', name: 'TI08-5',     qty: 11, faulty_qty: 0 },
  { id: 'v6-p33', name: 'TA126-30C',  qty: 12, faulty_qty: 0 },
  { id: 'v6-p34', name: '6403',       qty:  3, faulty_qty: 0 },
  { id: 'v6-p35', name: '6405',       qty:  5, faulty_qty: 1 }, // No glass holder
  { id: 'v6-p36', name: '6715',       qty:  7, faulty_qty: 0 },
  { id: 'v6-p37', name: '6705',       qty: 13, faulty_qty: 0 },
  { id: 'v6-p38', name: '25012',      qty:  4, faulty_qty: 0 },
  { id: 'v6-p39', name: '25013',      qty: 17, faulty_qty: 0 }, // 7+10 from two locations
  // (one crossed-out entry skipped)
]

const taps = [
  // ── Vintage6 ───────────────────────────────────────────────────────────────
  { id: 'v7-p1',  name: '8013H',        qty: 11, faulty_qty: 0 },
  { id: 'v7-p2',  name: '8013C',        qty: 19, faulty_qty: 0 },
  { id: 'v7-p3',  name: 'R3030',        qty: 16, faulty_qty: 0 },
  { id: 'v7-p4',  name: '6022',         qty:  5, faulty_qty: 0 },
  { id: 'v7-p5',  name: '6012 GR',      qty:  6, faulty_qty: 1 }, // 6 + 1 (Incomplete)
  { id: 'v7-p6',  name: '890J8C',       qty: 12, faulty_qty: 0 }, // 11+1 total
  { id: 'v7-p7',  name: '6012C',        qty:  5, faulty_qty: 0 },
  { id: 'v7-p8',  name: 'L032Q',        qty: 16, faulty_qty: 0 }, // 15+1 total
  { id: 'v7-p9',  name: '8040H',        qty: 11, faulty_qty: 0 },
  { id: 'v7-p10', name: '8040C',        qty: 19, faulty_qty: 0 },
  { id: 'v7-p11', name: 'JB5L',         qty:  7, faulty_qty: 0 },
  { id: 'v7-p12', name: 'YD042L',       qty:  7, faulty_qty: 1 }, // 7 + 1 (Incomplete)
  { id: 'v7-p13', name: '821001C',      qty:  4, faulty_qty: 0 },
  { id: 'v7-p14', name: '1640H',        qty: 16, faulty_qty: 0 },
  { id: 'v7-p15', name: 'T5206',        qty:  0, faulty_qty: 1 }, // Incomplete — no washers

  // ── Vintage7 (continuation) ────────────────────────────────────────────────
  { id: 'v7-p16', name: '4D05E',        qty:  1, faulty_qty: 0 },
  { id: 'v7-p17', name: '6050 Gungrey', qty:  1, faulty_qty: 0 },
  { id: 'v7-p18', name: '1640X',        qty: 22, faulty_qty: 0 }, // 21+1 total
  { id: 'v7-p19', name: 'Jx5001',       qty: 23, faulty_qty: 0 },
]

function buildProductRows(products, categoryId) {
  return products.map(p => ({
    id:            p.id,
    category_id:   categoryId,
    name:          p.name,
    qty:           p.qty,
    original_qty:  p.qty,
    low_threshold: 5,
    display_qty:   0,
    faulty_qty:    p.faulty_qty,
  }))
}

// ── Run ───────────────────────────────────────────────────────────────────────

async function run() {
  console.log('Inserting categories…')
  const { error: catErr } = await supabase.from('categories').insert(categories)
  if (catErr) {
    console.error('Category insert failed:', catErr.message)
    process.exit(1)
  }
  console.log(`  ✓ ${categories.length} categories inserted`)

  const accRows = buildProductRows(accessories, 'v-cat-6')
  const tapRows = buildProductRows(taps, 'v-cat-7')

  console.log('Inserting Accessories products…')
  const { error: accErr } = await supabase.from('products').insert(accRows)
  if (accErr) {
    console.error('Accessories insert failed:', accErr.message)
    process.exit(1)
  }
  console.log(`  ✓ ${accRows.length} Accessories products inserted`)

  console.log('Inserting Taps products…')
  const { error: tapErr } = await supabase.from('products').insert(tapRows)
  if (tapErr) {
    console.error('Taps insert failed:', tapErr.message)
    process.exit(1)
  }
  console.log(`  ✓ ${tapRows.length} Taps products inserted`)

  console.log('\nDone. Refresh the app to see the new categories.')
}

run()
