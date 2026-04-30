import * as XLSX from 'xlsx'

function dateTag() {
  return new Date().toISOString().slice(0, 10)
}

export function generateStockReport(state) {
  const wb = XLSX.utils.book_new()

  for (const [divKey, divData] of Object.entries(state.divisions)) {
    const divName = divKey === 'vintage' ? 'Vintage Lighting' : 'Incredible'
    const rows = [['Category', 'Product', 'Store Stock', 'Display Pieces', 'Original Stock', 'Status']]

    for (const cat of divData.categories) {
      for (const prod of cat.products) {
        rows.push([
          cat.name,
          prod.name,
          prod.qty,
          prod.display || 0,
          prod.original,
          prod.qty <= 5 ? 'LOW STOCK' : 'OK'
        ])
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [
      { wch: 26 },
      { wch: 30 },
      { wch: 13 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, divName)
  }

  return {
    data: XLSX.write(wb, { bookType: 'xlsx', type: 'array' }),
    filename: `Stock-Report-${dateTag()}.xlsx`
  }
}

export function generateDispatchReport(log) {
  const wb = XLSX.utils.book_new()
  const rows = [['Date / Time', 'Product', 'Division', 'Source', 'Qty Dispatched', 'Qty Remaining']]

  for (const entry of log) {
    rows.push([
      entry.time,
      entry.productName,
      entry.division,
      entry.source === 'display' ? 'Display Item' : 'Store',
      entry.qtyDispatched,
      entry.qtyRemaining
    ])
  }

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [
    { wch: 20 },
    { wch: 30 },
    { wch: 20 },
    { wch: 14 },
    { wch: 15 },
    { wch: 15 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Dispatch Log')

  return {
    data: XLSX.write(wb, { bookType: 'xlsx', type: 'array' }),
    filename: `Dispatch-Log-${dateTag()}.xlsx`
  }
}

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
        // Share failed — fall through to download
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
