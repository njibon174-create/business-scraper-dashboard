'use client'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { supabase } from './supabase'
import Papa from 'papaparse'

// ────────────────────────────────────────────────────────────────
// CSV — preserved exactly
// ────────────────────────────────────────────────────────────────
function exportCSV(data) {
  const rows = data.map(b => ({
    Name: b.name || '', Phone: b.phone || '',
    Website: b.website || '', Facebook: b.facebook_url || '',
    Address: b.address || '', Lat: b.lat || '', Lng: b.lng || '',
  }))
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `businesses_${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ────────────────────────────────────────────────────────────────
// ICONS — inline SVG, no external deps
// ────────────────────────────────────────────────────────────────
const Icon = {
  Search:       () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Refresh:      () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  Download:     () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Building:     () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>,
  Globe:        () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Facebook:     () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  Phone:        () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  MapPin:       () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Star:         () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  X:            () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ChevronDown:  () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>,
  Plus:         () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Map:          () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  List:         () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  ExternalLink: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Copy:         () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Filter:       () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Check:        () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
  Zap:          () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
}

// ────────────────────────────────────────────────────────────────
// SKELETON
// ────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`skeleton rounded ${className}`} />
}

// ────────────────────────────────────────────────────────────────
// KPI CARD
// ────────────────────────────────────────────────────────────────
function KPICard({ icon: IconCmp, label, value, sub, accent, index, loading }) {
  const accentColors = {
    0: { border: 'rgba(59,130,246,0.25)', glow: 'rgba(59,130,246,0.12)', icon: '#3b82f6', iconBg: 'rgba(59,130,246,0.12)' },
    1: { border: 'rgba(6,182,212,0.25)',   glow: 'rgba(6,182,212,0.12)',  icon: '#06b6d4', iconBg: 'rgba(6,182,212,0.12)' },
    2: { border: 'rgba(139,92,246,0.25)',  glow: 'rgba(139,92,246,0.12)', icon: '#8b5cf6', iconBg: 'rgba(139,92,246,0.12)' },
    3: { border: 'rgba(16,185,129,0.25)', glow: 'rgba(16,185,129,0.12)', icon: '#10b981', iconBg: 'rgba(16,185,129,0.12)' },
  }
  const c = accentColors[index] || accentColors[0]

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-4 gb-card">
        <div className="flex items-start gap-3">
          <Skeleton className="w-11 h-11 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-2 w-24" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="glass-card rounded-xl p-4 gb-card group transition-all duration-200 cursor-default"
      style={{
        borderColor: c.border,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 0 20px ${c.glow}, 0 8px 24px rgba(0,0,0,0.3)`
        e.currentTarget.style.borderColor = c.border.replace('0.25', '0.5')
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = c.border
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: c.iconBg, color: c.icon }}
        >
          <IconCmp />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.7)' }}>
            {label}
          </p>
          <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
          {sub && <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>{sub}</p>}
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// BADGE
// ────────────────────────────────────────────────────────────────
function Badge({ icon, label, variant }) {
  const vars = {
    found:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.25)' },
    miss:   { bg: 'rgba(71,85,105,0.25)',   color: '#64748b', border: 'rgba(71,85,105,0.3)' },
    blue:   { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
    purple: { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  }
  const v = vars[variant] || vars.miss
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border"
      style={{ background: v.bg, color: v.color, borderColor: v.border }}
    >
      {icon} {label}
    </span>
  )
}

// ────────────────────────────────────────────────────────────────
// BUSINESS CARD
// ────────────────────────────────────────────────────────────────
function BusinessCard({ business, selected, onClick }) {
  const hasWebsite  = !!business.website
  const hasFacebook = !!business.facebook_url
  const hasPhone    = !!business.phone

  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-all duration-150"
      style={{
        background: selected ? 'rgba(59,130,246,0.08)' : 'transparent',
        borderLeft: selected ? '2px solid #3b82f6' : '2px solid transparent',
      }}
    >
      <div
        className="px-4 py-3.5 transition-all duration-150 hover:bg-white/[0.03]"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          ...(selected ? {
            background: 'rgba(59,130,246,0.06)',
            boxShadow: 'inset 0 0 30px rgba(59,130,246,0.04)',
          } : {}),
        }}
      >
        {/* Name + category */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-white truncate">{business.name}</p>
            {business.category && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(148,163,184,0.6)' }}>
                {business.category}
              </p>
            )}
          </div>
          {business.lat && business.lng && (
            <span className="flex-shrink-0 mt-0.5" style={{ color: '#10b981', fontSize: 11 }}>
              <Icon.MapPin />
            </span>
          )}
        </div>

        {/* Address */}
        {business.address && (
          <p className="text-xs mt-1.5 truncate" style={{ color: 'rgba(148,163,184,0.5)' }}>
            {business.address}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {hasPhone    && <Badge icon={<Icon.Phone />}     label="Phone"    variant="found" />}
          {!hasPhone   && <Badge icon={<Icon.Phone />}     label="No Phone" variant="miss" />}
          {hasWebsite  && <Badge icon={<Icon.Globe />}    label="Web"      variant="blue" />}
          {!hasWebsite && <Badge icon={<Icon.Globe />}    label="No Web"   variant="miss" />}
          {hasFacebook && <Badge icon={<Icon.Facebook />} label="FB"       variant="purple" />}
          {!hasFacebook && <Badge icon={<Icon.Facebook />} label="No FB"  variant="miss" />}
        </div>
      </div>
    </button>
  )
}

// ────────────────────────────────────────────────────────────────
// DETAILS DRAWER
// ────────────────────────────────────────────────────────────────
function DetailsDrawer({ business, onClose }) {
  if (!business) return null
  const hasLocation = !!(business.lat && business.lng)

  return (
    <div className="w-full h-full flex flex-col">

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2 className="font-semibold text-sm text-white">Business Details</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(148,163,184,0.6)', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(148,163,184,0.6)' }}
        >
          <Icon.X />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Name */}
        <div>
          <h3 className="text-base font-bold text-white">{business.name}</h3>
          {business.category && (
            <p className="text-sm mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>{business.category}</p>
          )}
        </div>

        {/* Source tag */}
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <Icon.Zap /> Google Places API
        </div>

        <Divider />

        {/* Address */}
        {business.address && (
          <FieldRow icon={<Icon.MapPin />} label="Address" value={business.address} copyable />
        )}

        {/* Phone */}
        {business.phone && (
          <FieldRow icon={<Icon.Phone />} label="Phone" value={business.phone} copyable href={`tel:${business.phone}`} />
        )}

        {/* Website */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.5)' }}>
            <Icon.Globe /> Website
          </p>
          {business.website ? (
            <a
              href={business.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: '#60a5fa' }}
              onMouseEnter={e => e.currentTarget.style.color = '#93c5fd'}
              onMouseLeave={e => e.currentTarget.style.color = '#60a5fa'}
            >
              Visit Website <Icon.ExternalLink />
            </a>
          ) : (
            <p className="text-sm italic" style={{ color: 'rgba(71,85,105,0.8)' }}>Not found</p>
          )}
        </div>

        {/* Facebook */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.5)' }}>
            <Icon.Facebook /> Facebook
          </p>
          {business.facebook_url ? (
            <a
              href={business.facebook_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: '#a78bfa' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
              onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
            >
              Open Facebook <Icon.ExternalLink />
            </a>
          ) : (
            <p className="text-sm italic" style={{ color: 'rgba(71,85,105,0.8)' }}>Not found</p>
          )}
        </div>

        {/* Map */}
        {hasLocation && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.5)' }}>
              <Icon.MapPin /> Location
            </p>
            <a
              href={`https://www.google.com/maps?q=${business.lat},${business.lng}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: '#10b981' }}
              onMouseEnter={e => e.currentTarget.style.color = '#34d399'}
              onMouseLeave={e => e.currentTarget.style.color = '#10b981'}
            >
              Open in Maps <Icon.ExternalLink />
            </a>
            <p className="text-xs font-mono" style={{ color: 'rgba(71,85,105,0.8)' }}>
              {business.lat}, {business.lng}
            </p>
          </div>
        )}

        <Divider />

        {/* Last Updated */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.5)' }}>
            Last Updated
          </p>
          <p className="text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
            {business.updated_at ? new Date(business.updated_at).toLocaleString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div
        className="px-5 py-4 space-y-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={() => exportCSV([business])}
          className="w-full btn-primary flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Icon.Download /> Export This Business
        </button>
        {business.phone && (
          <button
            onClick={() => navigator.clipboard.writeText(business.phone)}
            className="w-full btn-ghost flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Icon.Copy /> Copy Phone
          </button>
        )}
        {business.address && (
          <button
            onClick={() => navigator.clipboard.writeText(business.address)}
            className="w-full btn-ghost flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Icon.Copy /> Copy Address
          </button>
        )}
      </div>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
}

function FieldRow({ icon, label, value, href, copyable }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider flex items-center gap-1" style={{ color: 'rgba(148,163,184,0.5)' }}>
        {icon} {label}
      </p>
      <div className="flex items-center gap-2">
        {href
          ? <a href={href} className="text-sm" style={{ color: '#60a5fa' }}>{value}</a>
          : <p className="text-sm text-white">{value}</p>
        }
        {copyable && (
          <button
            onClick={() => navigator.clipboard.writeText(value)}
            className="p-0.5 rounded transition-colors"
            style={{ color: 'rgba(148,163,184,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.4)'}
            title="Copy"
          >
            <Icon.Copy />
          </button>
        )}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// FILTER BAR
// ────────────────────────────────────────────────────────────────
function FilterBar({ filters, onChange, total, filtered }) {
  const { search, hasWebsite, hasFacebook, sortBy } = filters

  return (
    <div
      className="px-4 py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(6,10,20,0.6)' }}
    >
      <div className="flex flex-col gap-3">

        {/* Search */}
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'rgba(148,163,184,0.5)' }}
          >
            <Icon.Search />
          </span>
          <input
            type="text"
            placeholder="Search businesses, phone, address…"
            value={search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg transition-all outline-none"
            style={{
              background: 'rgba(15,22,41,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#e2e8f0',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(59,130,246,0.5)'
              e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
              e.target.style.background = 'rgba(15,22,41,0.95)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'rgba(255,255,255,0.08)'
              e.target.style.boxShadow = 'none'
              e.target.style.background = 'rgba(15,22,41,0.8)'
            }}
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            value={hasWebsite}
            onChange={v => onChange({ ...filters, hasWebsite: v })}
            options={[
              { value: 'any',     label: '🌐 Website: Any' },
              { value: 'found',   label: '✓ Website: Found' },
              { value: 'missing', label: '✗ Website: Missing' },
            ]}
          />
          <FilterSelect
            value={hasFacebook}
            onChange={v => onChange({ ...filters, hasFacebook: v })}
            options={[
              { value: 'any',     label: '📘 Facebook: Any' },
              { value: 'found',   label: '✓ Facebook: Found' },
              { value: 'missing', label: '✗ Facebook: Missing' },
            ]}
          />
          <FilterSelect
            value={sortBy}
            onChange={v => onChange({ ...filters, sortBy: v })}
            options={[
              { value: 'name',   label: '↕ Sort: Name' },
              { value: 'newest', label: '↕ Sort: Newest' },
            ]}
          />
          <div className="ml-auto text-xs whitespace-nowrap" style={{ color: 'rgba(148,163,184,0.45)' }}>
            {filtered} of {total}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-2.5 pr-7 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-all outline-none appearance-none"
        style={{
          background: 'rgba(15,22,41,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(148,163,184,0.8)',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'rgba(59,130,246,0.4)'
          e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.08)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(255,255,255,0.08)'
          e.target.style.boxShadow = 'none'
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span
        className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'rgba(148,163,184,0.4)' }}
      >
        <Icon.ChevronDown />
      </span>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// EMPTY STATE
// ────────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, onResetFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-2xl">{hasFilters ? '🔍' : '📭'}</span>
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">
        {hasFilters ? 'No businesses match your filters' : 'No businesses found'}
      </h3>
      <p className="text-xs max-w-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>
        {hasFilters
          ? 'Try adjusting your search or filters.'
          : 'Run the scraper to collect business data from Google Places API.'}
      </p>
      {hasFilters && (
        <button
          onClick={onResetFilters}
          className="mt-4 px-4 py-2 text-xs font-medium rounded-lg transition-all btn-ghost"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// SUPABASE EDGE FUNCTION URL — set via VITE env
// ────────────────────────────────────────────────────────────────
const EDGE_FUNCTION_URL = import.meta.env.VITE_EDGE_FUNCTION_URL || ''

function NewScrapePanel({ onClose, onScrapeStarted }) {
  const [location,   setLocation]   = useState('Dhaka, Bangladesh')
  const [bizType,    setBizType]    = useState('')
  const [keywords,   setKeywords]   = useState('')
  const [count,      setCount]      = useState(50)
  const [scraping,   setScraping]   = useState(false)
  const [runInfo,    setRunInfo]    = useState(null)     // { run_number, run_id, workflow_url }
  const [runError,   setRunError]   = useState(null)
  const [statusMsg,  setStatusMsg]  = useState('')
  const intervalRef = useRef(null)

  const stopScraping = () => {
    setScraping(false)
    clearInterval(intervalRef.current)
    setStatusMsg('')
  }

  const handleScrape = async () => {
    if (!bizType.trim()) return

    const query = `${bizType.trim()} in ${location.trim()}`
    setScraping(true)
    setRunInfo(null)
    setRunError(null)
    setStatusMsg(`Triggering workflow for: "${query}"…`)

    if (!EDGE_FUNCTION_URL) {
      setRunError('Edge Function URL not configured. Set VITE_EDGE_FUNCTION_URL in Vercel.')
      setScraping(false)
      return
    }

    try {
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setRunError(data.error || `HTTP ${res.status}`)
        setScraping(false)
        return
      }

      setRunInfo(data)
      setStatusMsg(`✅ Workflow #${data.run_number} triggered! Data will appear in dashboard shortly.`)
      setScraping(false)

      // Notify parent to refresh
      if (onScrapeStarted) onScrapeStarted(data)

      // Auto-close after 4s
      setTimeout(() => {
        if (onClose) onClose()
      }, 4000)

    } catch (err) {
      setRunError(err.message || 'Network error')
      setScraping(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => () => clearInterval(intervalRef.current), [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(6,9,15,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="glass-card rounded-xl w-full max-w-lg mx-4 overflow-hidden"
        style={{ animation: 'scaleIn 0.2s ease-out', border: '1px solid rgba(99,179,237,0.15)' }}
      >

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Icon.Zap /> New Search
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>
              Configure your business scrape
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(148,163,184,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(148,163,184,0.5)' }}
          >
            <Icon.X />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>Business Type *</label>
              <DarkInput value={bizType} onChange={setBizType} placeholder="e.g. Restaurant, Cafe, Hotel" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>Location</label>
              <DarkInput value={location} onChange={setLocation} placeholder="e.g. Dhaka, Bangladesh" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>Keywords</label>
              <DarkInput value={keywords} onChange={setKeywords} placeholder="Biryani, Cafe…" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>Results</label>
              <DarkInput type="number" value={count} onChange={v => setCount(Number(v))} min={10} max={200} />
            </div>
          </div>

          {/* Data options */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.5)' }}>
              Data to Collect
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: optWebsite, set: setOptWebsite, label: 'Website', icon: <Icon.Globe /> },
                { val: optPhone,   set: setOptPhone,   label: 'Phone',   icon: <Icon.Phone /> },
                { val: optFb,      set: setOptFb,       label: 'Facebook', icon: <Icon.Facebook /> },
                { val: optAddress, set: setOptAddress, label: 'Address', icon: <Icon.MapPin /> },
              ].map(({ val, set, label, icon }) => (
                <button
                  key={label}
                  onClick={() => set(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: val ? 'rgba(59,130,246,0.12)' : 'rgba(15,22,41,0.6)',
                    border: `1px solid ${val ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    color: val ? '#60a5fa' : 'rgba(148,163,184,0.6)',
                  }}
                >
                  {icon}
                  {label}
                  {val && <Icon.Check />}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          {scraping && (
            <div
              className="rounded-lg px-4 py-3.5 space-y-2.5"
              style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
            >
              <div className="flex justify-between text-xs font-medium" style={{ color: '#60a5fa' }}>
                <span className="flex items-center gap-1"><Icon.Zap /> Searching Google Places…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(59,130,246,0.15)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }}
                >
                  <div
                    className="absolute inset-y-0 w-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'progress-shine 1.2s infinite linear',
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs" style={{ color: 'rgba(148,163,184,0.7)' }}>
                <span>Found: <strong className="text-white">{found}</strong></span>
                <span>Websites: <strong style={{ color: '#60a5fa' }}>{Math.round(found * 0.7)}</strong></span>
                <span>Facebook: <strong style={{ color: '#a78bfa' }}>{Math.round(found * 0.5)}</strong></span>
                <span>Phones: <strong style={{ color: '#10b981' }}>{Math.round(found * 0.9)}</strong></span>
              </div>
              <button
                onClick={stopScraping}
                className="w-full mt-1 px-4 py-1.5 text-xs font-medium rounded-lg transition-all btn-ghost"
              >
                Stop
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleScrape}
            disabled={!bizType.trim() || scraping}
            className="flex-1 btn-primary flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40"
          >
            <Icon.Zap /> Trigger GitHub Workflow
          </button>
        </div>

        {/* Status / Error message */}
        {statusMsg && (
          <div className="px-6 pb-4">
            <div className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
              {statusMsg}
            </div>
          </div>
        )}
        {runError && (
          <div className="px-6 pb-4">
            <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              ⚠ {runError}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DarkInput({ value, onChange, placeholder, type = 'text', ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      {...rest}
      className="w-full px-3 py-2 text-sm rounded-lg transition-all outline-none"
      style={{
        background: 'rgba(15,22,41,0.8)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#e2e8f0',
      }}
      onFocus={e => {
        e.target.style.borderColor = 'rgba(59,130,246,0.5)'
        e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
      }}
      onBlur={e => {
        e.target.style.borderColor = 'rgba(255,255,255,0.08)'
        e.target.style.boxShadow = 'none'
      }}
    />
  )
}

// ────────────────────────────────────────────────────────────────
// KPI SKELETON
// ────────────────────────────────────────────────────────────────
function KPICardSkeleton({ index }) {
  return <KPICard icon={() => null} label="" value="" index={index} loading />
}

// ────────────────────────────────────────────────────────────────
// COUNT-UP HOOK
// ────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) { setVal(0); return }
    const start = performance.now()
    const tick = now => {
      const pct = Math.min((now - start) / duration, 1)
      setVal(Math.round(pct * target))
      if (pct < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return val
 }

// ────────────────────────────────────────────────────────────────
// MAIN APP
// ────────────────────────────────────────────────────────────────
export default function App() {
  const [businesses,  setBusinesses]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error,      setError]      = useState(null)
  const [selectedBiz,setSelectedBiz]= useState(null)
  const [drawerOpen, setDrawerOpen]  = useState(false)
  const [showScrape, setShowScrape]  = useState(false)
  const [viewMode,   setViewMode]   = useState('split') // 'split' | 'list' | 'map'
  const [copied,     setCopied]     = useState(null)

  const [filters, setFilters] = useState({
    search: '', hasWebsite: 'any', hasFacebook: 'any', sortBy: 'name',
  })

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchBusinesses = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('businesses')
      .select('*')
      .order('updated_at', { ascending: false })
    if (err) setError(err.message)
    else     { setBusinesses(data || []); setError(null) }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchBusinesses() }, [fetchBusinesses])

  const handleRefresh = () => { setRefreshing(true); fetchBusinesses() }

  // ── Filtered ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...businesses]
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      list = list.filter(b =>
        (b.name    || '').toLowerCase().includes(q) ||
        (b.phone   || '').toLowerCase().includes(q) ||
        (b.address || '').toLowerCase().includes(q)
      )
    }
    if (filters.hasWebsite === 'found')   list = list.filter(b => b.website)
    if (filters.hasWebsite === 'missing') list = list.filter(b => !b.website)
    if (filters.hasFacebook === 'found')  list = list.filter(b => b.facebook_url)
    if (filters.hasFacebook === 'missing')list = list.filter(b => !b.facebook_url)
    if (filters.sortBy === 'name')
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return list
  }, [businesses, filters])

  // ── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:  businesses.length,
    web:    businesses.filter(b => b.website).length,
    fb:     businesses.filter(b => b.facebook_url).length,
    phone:  businesses.filter(b => b.phone).length,
  }), [businesses])

  const hasFilters = !!(filters.search || filters.hasWebsite !== 'any' || filters.hasFacebook !== 'any')
  const clearFilters = () => setFilters({ search: '', hasWebsite: 'any', hasFacebook: 'any', sortBy: 'name' })

  const handleSelectBiz = (biz) => {
    setSelectedBiz(biz)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setTimeout(() => setSelectedBiz(null), 250)
  }

  const showMobileList = viewMode === 'list' || viewMode === 'split'
  const locBizs = filtered.filter(b => b.lat && b.lng)

  // Count-up values
  const countTotal = useCountUp(stats.total)
  const countWeb   = useCountUp(stats.web)
  const countFb    = useCountUp(stats.fb)
  const countPhone = useCountUp(stats.phone)

  const pct = n => stats.total > 0 ? Math.round(n / stats.total * 100) : 0

  return (
    <div
      className="bg-atmosphere bg-grid min-h-screen flex flex-col"
      style={{ animation: 'fadeUp 0.4s ease-out' }}
    >

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 sticky top-0 z-30"
        style={{
          background: 'rgba(6,9,15,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-4">

          {/* Left: Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 0 16px rgba(59,130,246,0.35)' }}
            >
              <span style={{ color: '#fff' }}><Icon.Building /></span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Business Scraper</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="status-dot" />
                <span className="text-xs" style={{ color: '#10b981' }}>Google Places API Connected</span>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setShowScrape(true)}
                className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                <Icon.Plus /> New Search
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                <Icon.Refresh className={refreshing ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={() => exportCSV(filtered)}
                disabled={filtered.length === 0}
                className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
              >
                <Icon.Download /> Export
              </button>
            </div>

            {/* Mobile */}
            <div className="flex sm:hidden items-center gap-1">
              <button
                onClick={() => setViewMode(v => v === 'list' ? 'split' : 'list')}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(148,163,184,0.8)' }}
              >
                {viewMode === 'list' ? <Icon.Map /> : <Icon.List />}
              </button>
              <button
                onClick={() => setShowScrape(true)}
                className="p-2 rounded-lg btn-primary"
              >
                <Icon.Plus />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── KPI CARDS ─────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-4 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading
            ? [0,1,2,3].map(i => <KPICardSkeleton key={i} index={i} />)
            : <>
                <KPICard index={0} icon={Icon.Building} label="Total Businesses" value={countTotal.toLocaleString()} sub={`${pct(stats.total)}% collected`} />
                <KPICard index={1} icon={Icon.Globe}   label="Websites Found"   value={countWeb.toLocaleString()}   sub={`${pct(stats.web)}% coverage`} />
                <KPICard index={2} icon={Icon.Facebook} label="Facebook Found"  value={countFb.toLocaleString()}    sub={`${pct(stats.fb)}% coverage`} />
                <KPICard index={3} icon={Icon.Phone}    label="Phones Found"     value={countPhone.toLocaleString()} sub={`${pct(stats.phone)}% coverage`} />
              </>
          }
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Business List */}
        {showMobileList && (
          <div
            className="flex flex-col overflow-hidden"
            style={{
              width: viewMode === 'list' ? '100%' : '40%',
              minWidth: 280,
              borderRight: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(9,14,24,0.6)',
              animation: 'fadeUp 0.3s ease-out',
            }}
          >
            <FilterBar filters={filters} onChange={setFilters} total={businesses.length} filtered={filtered.length} />

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[0,1,2,3,4,5].map(i => (
                    <div key={i} className="rounded-lg p-4" style={{ background: 'rgba(15,22,41,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-3" />
                      <div className="flex gap-2"><Skeleton className="h-5 w-12" /><Skeleton className="h-5 w-12" /></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-red-400"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    !
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#f87171' }}>Failed to load</p>
                  <p className="text-xs mb-4" style={{ color: 'rgba(148,163,184,0.5)' }}>{error}</p>
                  <button onClick={fetchBusinesses} className="px-4 py-2 text-xs font-medium rounded-lg btn-ghost">Retry</button>
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState hasFilters={hasFilters} onResetFilters={clearFilters} />
              ) : (
                filtered.map(biz => (
                  <BusinessCard
                    key={biz.place_id}
                    business={biz}
                    selected={selectedBiz?.place_id === biz.place_id}
                    onClick={() => handleSelectBiz(biz)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Map Panel */}
        {viewMode !== 'list' && (
          <div
            className="flex-1 relative overflow-hidden"
            style={{ background: 'rgba(6,10,18,0.8)' }}
          >
            {locBizs.length > 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', boxShadow: '0 0 30px rgba(59,130,246,0.1)' }}
                >
                  <span style={{ fontSize: 36 }}>🗺️</span>
                </div>
                <p className="text-sm font-semibold text-white">Map View</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(148,163,184,0.5)' }}>
                  {locBizs.length} businesses with location data
                </p>
                <div className="mt-5 space-y-1.5 max-w-xs">
                  {locBizs.slice(0, 4).map(b => (
                    <div key={b.place_id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-left"
                      style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#3b82f6', boxShadow: '0 0 6px rgba(59,130,246,0.6)' }} />
                      <span className="text-xs text-white truncate">{b.name}</span>
                      <span className="text-xs ml-auto flex-shrink-0" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'monospace' }}>{b.lat}, {b.lng}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-5" style={{ color: 'rgba(148,163,184,0.35)' }}>
                  Add Google Maps JavaScript API key to enable interactive map
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-8">
                <div className="text-4xl mb-3">🗺️</div>
                <p className="text-sm font-medium text-white">No location data yet</p>
                <p className="text-xs mt-1 max-w-xs" style={{ color: 'rgba(148,163,184,0.45)' }}>
                  Run the scraper to collect lat/lng coordinates.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Details Drawer — Desktop */}
        {drawerOpen && (
          <div
            className="hidden md:flex flex-shrink-0 overflow-hidden"
            style={{
              width: 340,
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(9,14,24,0.95)',
              animation: 'slideRight 0.25s ease-out',
            }}
          >
            <DetailsDrawer business={selectedBiz} onClose={handleCloseDrawer} />
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(6,9,15,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={handleCloseDrawer}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 md:hidden rounded-t-2xl overflow-hidden flex flex-col max-h-[88vh]"
            style={{
              background: 'rgba(9,14,24,0.97)',
              borderTop: '1px solid rgba(99,179,237,0.2)',
              boxShadow: '0 -8px 40px rgba(59,130,246,0.15)',
              animation: 'slideUp 0.25s ease-out',
            }}
          >
            <div
              className="w-12 h-1.5 rounded-full mx-auto mt-3 mb-1 flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            />
            <DetailsDrawer business={selectedBiz} onClose={handleCloseDrawer} />
          </div>
        </>
      )}

      {/* New Scrape Panel */}
      {showScrape && <NewScrapePanel onClose={() => setShowScrape(false)} onScrapeStarted={handleRefresh} />}
    </div>
  )
}
