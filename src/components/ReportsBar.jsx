import { useState } from 'react'
import { generateStockReport, generateDispatchReport, exportAndShare } from '../lib/reports'

export function ReportsBar({ state }) {
  const [stockBusy, setStockBusy] = useState(false)
  const [dispatchBusy, setDispatchBusy] = useState(false)

  async function handleStock() {
    setStockBusy(true)
    try {
      await exportAndShare(generateStockReport(state))
    } finally {
      setStockBusy(false)
    }
  }

  async function handleDispatch() {
    setDispatchBusy(true)
    try {
      await exportAndShare(generateDispatchReport(state.log))
    } finally {
      setDispatchBusy(false)
    }
  }

  return (
    <div className="reports-bar">
      <span className="reports-label">Export</span>
      <button
        className="btn-report btn-report-stock"
        onClick={handleStock}
        disabled={stockBusy}
      >
        {stockBusy ? 'Generating…' : 'Current Stock'}
      </button>
      <button
        className="btn-report btn-report-dispatch"
        onClick={handleDispatch}
        disabled={dispatchBusy}
      >
        {dispatchBusy ? 'Generating…' : 'Dispatch Log'}
      </button>
    </div>
  )
}
