import XLSX from 'xlsx-js-style'

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  headerBg:   '2C3E50',
  headerText: 'FFFFFF',
  catBg:      'D6E4F0',
  catText:    '1A3A52',
  totalBg:    'D5D8DC',
  altRow:     'F2F3F4',
  white:      'FFFFFF',
  status: {
    CRITICAL:     { bg: 'C0392B', text: 'FFFFFF' },
    'LOW STOCK':  { bg: 'E67E22', text: 'FFFFFF' },
    'IN STOCK':   { bg: '1E8449', text: 'FFFFFF' },
    'HIGH STOCK': { bg: '1A5276', text: 'FFFFFF' },
  },
  source: {
    'Store Dispatch':        { bg: 'FDFEFE', text: '000000' },
    'Display Item':          { bg: 'FEF9E7', text: '7D6608' },
    'Restock':               { bg: 'EAFAF1', text: '1E8449' },
    'Goods Returned':        { bg: 'EBF5FB', text: '1A5276' },
    'Reserved':              { bg: 'F5EEF8', text: '6C3483' },
    'Collected (Reserved)':  { bg: 'FEF5E7', text: '7E5109' },
    'Reservation Cancelled': { bg: 'FDEDEC', text: '922B21' },
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function dateTag() {
  return new Date().toISOString().slice(0, 10)
}

function statusLabel(qty) {
  if (qty <= 5)   return 'CRITICAL'
  if (qty <= 50)  return 'LOW STOCK'
  if (qty <= 300) return 'IN STOCK'
  return 'HIGH STOCK'
}

function s(font = {}, fill = null, align = {}) {
  const base = {
    font: { name: 'Calibri', sz: 11, ...font },
    alignment: { vertical: 'center', wrapText: false, ...align },
  }
  if (fill) base.fill = { patternType: 'solid', fgColor: { rgb: fill } }
  return base
}

function applyStyle(ws, r, c, style) {
  const addr = XLSX.utils.encode_cell({ r, c })
  if (ws[addr]) ws[addr].s = style
}

function applyRowStyle(ws, r, numCols, style) {
  for (let c = 0; c < numCols; c++) applyStyle(ws, r, c, style)
}

// ─── Category Report ─────────────────────────────────────────────────────────
export function generateCategoryReport(category, divisionName) {
  const prods = category.products
  const total = prods.reduce((sum, p) => sum + p.qty, 0)

  const rows = [
    [`${divisionName} Inventory`],                      // 0 — title
    [`${category.name} Inventory`],                     // 1 — subtitle
    [],                                                  // 2 — spacer
    ['#', 'Product Name', 'Qty In Store', 'Status'],    // 3 — headers
    ...prods.map((p, i) => [i + 1, p.name, p.qty, statusLabel(p.qty)]),
    [],                                                  // after data — spacer
    ['', 'TOTAL PIECES', total],
    [],
    ['QUICK STATS'],
    ['', 'Total SKUs', prods.length],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 5 }, { wch: 32 }, { wch: 14 }, { wch: 14 }]

  // Title
  applyStyle(ws, 0, 0, s({ bold: true, sz: 14, color: { rgb: C.headerBg } }))
  // Subtitle
  applyStyle(ws, 1, 0, s({ bold: true, sz: 12, color: { rgb: C.catText } }))

  // Header row
  const hStyle = s(
    { bold: true, color: { rgb: C.headerText } },
    C.headerBg,
    { horizontal: 'center' }
  )
  applyRowStyle(ws, 3, 4, hStyle)

  // Data rows
  prods.forEach((p, i) => {
    const r = 4 + i
    const fill = i % 2 === 0 ? null : C.altRow
    const baseStyle = s({}, fill, {})
    applyStyle(ws, r, 0, { ...baseStyle, alignment: { horizontal: 'center', vertical: 'center' } })
    applyStyle(ws, r, 1, baseStyle)
    applyStyle(ws, r, 2, { ...baseStyle, alignment: { horizontal: 'center', vertical: 'center' } })

    // Status cell — always coloured
    const { bg, text } = C.status[statusLabel(p.qty)]
    applyStyle(ws, r, 3, s(
      { bold: true, color: { rgb: text } }, bg,
      { horizontal: 'center' }
    ))
  })

  // Total row
  const totalRow = 4 + prods.length + 1
  const tStyle = s({ bold: true }, C.totalBg, {})
  applyRowStyle(ws, totalRow, 3, tStyle)

  // Quick stats header
  const statsRow = totalRow + 2
  applyStyle(ws, statsRow, 0, s({ bold: true, sz: 12, color: { rgb: C.headerBg } }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, category.name.slice(0, 31))

  const safeName = category.name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
  return {
    data: XLSX.write(wb, { bookType: 'xlsx', type: 'array' }),
    filename: `${divisionName.replace(/\s+/g, '-')}-${safeName}-${dateTag()}.xlsx`
  }
}

// ─── Full Stock Report ────────────────────────────────────────────────────────
export function generateStockReport(state) {
  const wb = XLSX.utils.book_new()

  for (const [divKey, divData] of Object.entries(state.divisions)) {
    const divName = divKey === 'vintage' ? 'Vintage Lighting' : 'Incredible'
    const rows = []

    // Title rows
    rows.push([`${divName} — Full Stock Report`])         // 0
    rows.push([`Generated: ${new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}`]) // 1
    rows.push([])                                          // 2
    rows.push(['#', 'Product Name', 'Store Stock', 'Reserved', 'Display', 'Faulty', 'Status']) // 3

    let rowIdx = 4
    const catHeaderRows = []
    const dataRows = []    // { r, status, alt }
    const totalRows = []

    for (const cat of divData.categories) {
      // Category header
      rows.push([cat.name])
      catHeaderRows.push(rowIdx)
      rowIdx++

      let catTotal = 0
      cat.products.forEach((p, i) => {
        rows.push([i + 1, p.name, p.qty, p.reserved || 0, p.display || 0, p.faulty || 0, statusLabel(p.qty)])
        dataRows.push({ r: rowIdx, status: statusLabel(p.qty), alt: i % 2 !== 0 })
        catTotal += p.qty
        rowIdx++
      })

      // Category subtotal
      rows.push(['', `${cat.name} Total`, catTotal])
      totalRows.push(rowIdx)
      rowIdx++

      rows.push([])
      rowIdx++
    }

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [
      { wch: 5 }, { wch: 32 }, { wch: 13 }, { wch: 10 },
      { wch: 10 }, { wch: 8 }, { wch: 14 }
    ]

    // Title styling
    applyStyle(ws, 0, 0, s({ bold: true, sz: 14, color: { rgb: C.headerBg } }))
    applyStyle(ws, 1, 0, s({ sz: 10, color: { rgb: '7F8C8D' } }))

    // Column headers
    const hStyle = s({ bold: true, color: { rgb: C.headerText } }, C.headerBg, { horizontal: 'center' })
    applyRowStyle(ws, 3, 7, hStyle)

    // Category headers
    catHeaderRows.forEach(r => {
      applyRowStyle(ws, r, 7, s({ bold: true, color: { rgb: C.catText } }, C.catBg, {}))
    })

    // Data rows
    dataRows.forEach(({ r, status, alt }) => {
      const fill = alt ? C.altRow : null
      const base = s({}, fill, {})
      for (let c = 0; c < 6; c++) applyStyle(ws, r, c, c === 1 ? base : { ...base, alignment: { horizontal: 'center', vertical: 'center' } })
      const { bg, text } = C.status[status]
      applyStyle(ws, r, 6, s({ bold: true, color: { rgb: text } }, bg, { horizontal: 'center' }))
    })

    // Subtotal rows
    totalRows.forEach(r => {
      applyRowStyle(ws, r, 7, s({ bold: true }, C.totalBg, {}))
    })

    XLSX.utils.book_append_sheet(wb, ws, divName)
  }

  return {
    data: XLSX.write(wb, { bookType: 'xlsx', type: 'array' }),
    filename: `Stock-Report-${dateTag()}.xlsx`
  }
}

// ─── Dispatch Log Report ──────────────────────────────────────────────────────
const SOURCE_LABEL = {
  store:     'Store Dispatch',
  display:   'Display Item',
  restock:   'Restock',
  returned:  'Goods Returned',
  reserved:  'Reserved',
  collected: 'Collected (Reserved)',
  cancelled: 'Reservation Cancelled',
}

export function generateDispatchReport(log) {
  const rows = [
    ['Vintage Lighting & Interiors — Dispatch Log'],
    [`Generated: ${new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}`],
    [],
    ['Date / Time', 'Product', 'Division', 'Movement Type', 'Qty', 'Remaining Stock'],
  ]

  for (const e of log) {
    rows.push([e.time, e.productName, e.division, SOURCE_LABEL[e.source] || e.source, e.qtyDispatched, e.qtyRemaining])
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 20 }, { wch: 32 }, { wch: 20 }, { wch: 22 }, { wch: 8 }, { wch: 16 }
  ]

  // Title
  applyStyle(ws, 0, 0, s({ bold: true, sz: 14, color: { rgb: C.headerBg } }))
  applyStyle(ws, 1, 0, s({ sz: 10, color: { rgb: '7F8C8D' } }))

  // Headers
  const hStyle = s({ bold: true, color: { rgb: C.headerText } }, C.headerBg, { horizontal: 'center' })
  applyRowStyle(ws, 3, 6, hStyle)

  // Data rows
  log.forEach((e, i) => {
    const r = 4 + i
    const label = SOURCE_LABEL[e.source] || e.source
    const { bg, text } = C.source[label] || C.source['Store Dispatch']
    const fill = bg === 'FDFEFE' ? (i % 2 !== 0 ? C.altRow : null) : bg

    for (let c = 0; c < 6; c++) {
      applyStyle(ws, r, c, s(
        { color: { rgb: bg === 'FDFEFE' ? '000000' : text } },
        fill,
        { horizontal: c === 1 || c === 0 ? 'left' : 'center' }
      ))
    }
    // Movement type cell always gets its source colour
    applyStyle(ws, r, 3, s(
      { bold: true, color: { rgb: text } }, bg,
      { horizontal: 'center' }
    ))
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dispatch Log')

  return {
    data: XLSX.write(wb, { bookType: 'xlsx', type: 'array' }),
    filename: `Dispatch-Log-${dateTag()}.xlsx`
  }
}

// ─── Shared export / share helper ────────────────────────────────────────────
export async function exportAndShare({ data, filename }) {
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: blob.type })
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename })
        return
      } catch (e) {
        if (e.name === 'AbortError') return
      }
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
