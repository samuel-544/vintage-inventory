import { useEffect, useRef } from 'react'

export function useNotifications(state, loading) {
  const notifiedThisSession = useRef(false)

  useEffect(() => {
    if (loading) return
    if (notifiedThisSession.current) return
    if (!('Notification' in window)) return

    const productMap = {}
    for (const div of Object.values(state.divisions)) {
      for (const cat of div.categories) {
        for (const prod of cat.products) {
          productMap[prod.id] = prod
        }
      }
    }

    const alerts = (state.watchlists || [])
      .filter(w => w.status === 'active')
      .map(w => ({
        ...w,
        affectedItems: w.items.filter(item => {
          const p = productMap[item.productId]
          return p && p.qty < item.qtyWanted
        })
      }))
      .filter(w => w.affectedItems.length > 0)

    if (alerts.length === 0) return

    notifiedThisSession.current = true

    async function fire() {
      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }
      if (permission !== 'granted') return

      for (const alert of alerts) {
        const items = alert.affectedItems.map(i => i.productName).join(', ')
        new Notification('⚠ Stock Alert — Client Waiting', {
          body: `${alert.clientName} needs: ${items}`,
          icon: '/favicon.ico',
          tag: alert.id
        })
      }
    }

    fire()
  }, [loading, state.watchlists, state.divisions])
}
