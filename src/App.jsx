import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from './supabase'
import Papa from 'papaparse'

// ── CSV Export ────────────────────────────────────────────────────────────────
function exportCSV(data) {
  const rows = data.map(b => ({
    Name:     b.name     || '',
    Phone:    b.phone    || '',
    Website:  b.website  || '',
    Facebook: b.facebook_url || '',
    Address:  b.address  || '',
    Lat:      b.lat      || '',
    Lng:      b.lng      || '',
  }))

  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `businesses_${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ── Stats Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div className={`rounded-xl p-5 shadow-sm border ${accent ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ? 'text-blue-600' : 'text-gray-800'}`}>{value}</p>
    </div>
  )
}

// ── Link Cell ─────────────────────────────────────────────────────────────────
function LinkCell({ href, label }) {
  if (!href) return <span className="text-gray-400 italic">—</span>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {label || href}
    </a>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [businesses, setBusinesses]   = useState([])
  const [loading,   setLoading]       = useState(true)
  const [error,     setError]         = useState(null)
  const [search,    setSearch]        = useState('')
  const [fbFilter,  setFbFilter]      = useState('all') // 'all' | 'has' | 'none'

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBusinesses = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('businesses')
      .select('*')
      .order('name')

    if (err) {
      setError(err.message)
    } else {
      setBusinesses(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchBusinesses() }, [fetchBusinesses])

  // ── Derived ───────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     businesses.length,
    withFb:    businesses.filter(b => b.facebook_url).length,
    withWeb:   businesses.filter(b => b.website).length,
  }), [businesses])

  const filtered = useMemo(() => {
    let list = businesses

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b => (b.name || '').toLowerCase().includes(q))
    }

    if (fbFilter === 'has')   list = list.filter(b => b.facebook_url)
    if (fbFilter === 'none')  list = list.filter(b => !b.facebook_url)

    return list
  }, [businesses, search, fbFilter])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">📊 Business Scraper Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {stats.total} business{stats.total !== 1 ? 'es' : ''} in database
              </p>
            </div>
            <button
              onClick={() => exportCSV(filtered)}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ⬇ Export CSV ({filtered.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Businesses"  value={stats.total}  />
          <StatCard label="With Facebook"     value={stats.withFb} accent />
          <StatCard label="With Website"      value={stats.withWeb} />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={fbFilter}
            onChange={e => setFbFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Businesses</option>
            <option value="has">Has Facebook</option>
            <option value="none">No Facebook</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <span className="text-2xl mr-3">⏳</span>
              <span className="text-sm">Loading businesses…</span>
            </div>

          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <p className="text-sm font-medium mb-2">❌ Error loading data</p>
              <p className="text-xs text-gray-400">{error}</p>
              <button
                onClick={fetchBusinesses}
                className="mt-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-100 transition-colors"
              >
                Retry
              </button>
            </div>

          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-3xl mb-3">{businesses.length === 0 ? '📭' : '🔍'}</p>
              <p className="text-sm font-medium">
                {businesses.length === 0
                  ? 'No businesses found. Run the scraper first!'
                  : 'No businesses match your filters.'}
              </p>
            </div>

          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Website</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Facebook</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(b => (
                    <tr key={b.place_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{b.name}</td>
                      <td className="px-4 py-3 text-gray-600">{b.phone || <span className="text-gray-400 italic">—</span>}</td>
                      <td className="px-4 py-3"><LinkCell href={b.website} label="🌐 Visit" /></td>
                      <td className="px-4 py-3"><LinkCell href={b.facebook_url} label="📘 Facebook" /></td>
                      <td className="px-4 py-3 text-gray-500 max-w-[250px] truncate">{b.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
