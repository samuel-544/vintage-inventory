export function StatsBar({ total, categories, low }) {
  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-num">{total}</span>
        <span className="stat-label">Products</span>
      </div>
      <div className="stat">
        <span className="stat-num">{categories}</span>
        <span className="stat-label">Categories</span>
      </div>
      <div className={`stat ${low > 0 ? 'stat-low' : ''}`}>
        <span className="stat-num">{low}</span>
        <span className="stat-label">Low Stock</span>
      </div>
    </div>
  )
}
