import { useEffect, useState } from 'react'
import { MdRefresh, MdCloudOff, MdCloudDone, MdCheckCircle } from 'react-icons/md'
import { saveRoute, getRoute, saveMutation, getMutations, clearMutation } from './db'

const API_URL = 'http://localhost:8000'

function App() {
  const [route, setRoute] = useState<any[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [loading, setLoading] = useState(false)
  const [mutationsPending, setMutationsPending] = useState(0)

  // Token hardcoded for demo purposes; normally handled via login/OIDC flow
  const token = localStorage.getItem('token') || ''

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); syncMutations(); }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Load local route on mount
    getRoute().then(data => {
      if (data) setRoute(data)
    })
    
    // Check pending mutations
    getMutations().then(m => setMutationsPending(m.length))

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const syncMutations = async () => {
    const mutations = await getMutations()
    if (mutations.length === 0) return
    
    for (const m of mutations) {
      try {
        const formData = new FormData()
        formData.append('destination', m.destination)
        
        await fetch(`${API_URL}/items/${m.itemId}/override`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        })
        
        if (m.id) await clearMutation(m.id)
      } catch (e) {
        console.error('Sync failed for item', m.itemId)
      }
    }
    const left = await getMutations()
    setMutationsPending(left.length)
  }

  const fetchRoute = async () => {
    if (!isOnline) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/routes/today`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setRoute(data)
        await saveRoute(data)
      } else {
        alert("Authentication required. Please set token in localStorage.")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleOverride = async (itemId: number, dest: string) => {
    // Optimistic UI update
    setRoute(prev => prev.filter(p => p.item_id !== itemId))
    
    if (isOnline) {
      try {
        const formData = new FormData()
        formData.append('destination', dest)
        await fetch(`${API_URL}/items/${itemId}/override`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        })
      } catch (e) {
        await saveMutation(itemId, dest)
        setMutationsPending(p => p + 1)
      }
    } else {
      await saveMutation(itemId, dest)
      setMutationsPending(p => p + 1)
    }
  }

  return (
    <div className="container">
      <header className="header glass">
        <h1>LCX Route</h1>
        <div className={`status-badge ${isOnline ? 'status-online' : 'status-offline'}`}>
          {isOnline ? <MdCloudDone size={16} /> : <MdCloudOff size={16} />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </header>

      {mutationsPending > 0 && (
        <div className="card glass" style={{borderColor: 'var(--accent)'}}>
          <p style={{color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 500}}>
            {mutationsPending} action(s) waiting to sync...
          </p>
        </div>
      )}

      {route.map((pt, i) => (
        <div key={pt.item_id} className="card glass">
          <div className="card-header">
            <span className="item-id">Stop #{i + 1}</span>
            <span className="item-dest">Item {pt.item_id}</span>
          </div>
          <div className="card-body">
            <p>Lat: {pt.lat.toFixed(4)}</p>
            <p>Lon: {pt.lon.toFixed(4)}</p>
          </div>
          <div className="btn-group">
            <button className="btn-primary" onClick={() => handleOverride(pt.item_id, 'REPAIR_HUB')}>
              <MdCheckCircle size={18} /> Picked Up
            </button>
            <button className="btn-outline" onClick={() => handleOverride(pt.item_id, 'COMMUNITY_MARKETPLACE')}>
              Direct to Community
            </button>
          </div>
        </div>
      ))}

      {route.length === 0 && (
        <div className="card glass" style={{textAlign: 'center', padding: '3rem 1rem'}}>
          <p style={{color: 'var(--text-secondary)'}}>No stops for today.</p>
        </div>
      )}

      <div className="sync-bar glass">
        <button className="btn-primary" onClick={fetchRoute} disabled={loading || !isOnline}>
          <MdRefresh size={20} className={loading ? 'spinning' : ''} />
          {loading ? 'Syncing...' : 'Sync Day Route'}
        </button>
      </div>
    </div>
  )
}

export default App
