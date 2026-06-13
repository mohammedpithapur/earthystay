'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ApiFetcher, CalendarEvent } from '@/lib/api'
import { getPropertyCalendar, createAdminBlock, deleteAdminBlock } from '@/lib/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function getEventsForDate(dateStr: string, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter(ev => dateStr >= ev.check_in && dateStr < ev.check_out)
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ── Types ─────────────────────────────────────────────────────────────────────

interface CalendarModalProps {
  propertyId: string
  propertyName: string
  onClose: () => void
  fetchWithAuth: ApiFetcher
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tooltip({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'contents' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute', zIndex: 20, bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#0d0b07', border: '1px solid #3d3425',
          color: '#c4a96d', fontSize: '0.72rem', lineHeight: 1.5,
          padding: '8px 10px', borderRadius: '8px', whiteSpace: 'pre-line',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)', pointerEvents: 'none',
          minWidth: '170px', textAlign: 'left',
        }}>
          {tip}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CalendarModal({ propertyId, propertyName, onClose, fetchWithAuth }: CalendarModalProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Block form
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockNote, setBlockNote] = useState('')
  const [blocking, setBlocking] = useState(false)
  const [blockError, setBlockError] = useState<string | null>(null)
  const [blockSuccess, setBlockSuccess] = useState<string | null>(null)

  // Click-to-select range state
  const [selStart, setSelStart] = useState<string | null>(null)
  const [selHover, setSelHover] = useState<string | null>(null)

  const todayStr = toDateStr(today)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Load current month + 1 month either side
      const fromD = new Date(viewYear, viewMonth - 1, 1)
      const toD = new Date(viewYear, viewMonth + 2, 0)
      const from = toDateStr(fromD)
      const to = toDateStr(toD)
      const data = await getPropertyCalendar(propertyId, from, to, fetchWithAuth)
      setEvents(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load calendar')
    } finally {
      setLoading(false)
    }
  }, [propertyId, viewYear, viewMonth, fetchWithAuth])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function handleDayClick(dateStr: string) {
    const dayEvents = getEventsForDate(dateStr, events)
    // Cannot start selection on a day with a guest booking
    if (dayEvents.some(e => e.type === 'guest_booking')) return

    if (!selStart) {
      setSelStart(dateStr)
      setBlockStart(dateStr)
      setBlockEnd('')
      setBlockError(null)
      setBlockSuccess(null)
    } else {
      const s = selStart < dateStr ? selStart : dateStr
      const e = selStart < dateStr ? dateStr : selStart
      // check_out = day after last night
      const eDate = new Date(e)
      eDate.setDate(eDate.getDate() + 1)
      const eNext = toDateStr(eDate)
      setBlockStart(s)
      setBlockEnd(eNext)
      setSelStart(null)
      setSelHover(null)
    }
  }

  function getCellStyle(dateStr: string): React.CSSProperties {
    const dayEvents = getEventsForDate(dateStr, events)
    const types = new Set(dayEvents.map(e => e.type))

    const selMin = selStart && selHover ? (selStart < selHover ? selStart : selHover) : null
    const selMax = selStart && selHover ? (selStart > selHover ? selStart : selHover) : null
    const inSel = selMin && selMax && dateStr >= selMin && dateStr <= selMax
    const inBlock = blockStart && blockEnd && dateStr >= blockStart && dateStr < blockEnd

    const isToday = dateStr === todayStr

    if (inSel || inBlock) return { background: 'rgba(201,168,76,0.22)', border: '1px solid #c9a84c', color: '#e8d5a3', fontWeight: '600' }
    if (types.has('guest_booking')) return { background: '#2a1a0a', border: '1px solid rgba(201,168,76,0.4)', color: '#c9a84c' }
    if (types.has('admin_block')) return { background: '#0f0d08', border: '1px solid #c9a84c', color: '#5a5040' }
    if (types.has('shadow_block')) return {
      background: 'repeating-linear-gradient(45deg,#1a1611,#1a1611 4px,#221d12 4px,#221d12 8px)',
      border: '1px solid #2e2618', color: '#4a4030',
    }
    if (isToday) return { border: '1px solid rgba(201,168,76,0.5)', color: '#e8d5a3', fontWeight: '700' }
    return { border: '1px solid transparent', color: '#c4a96d' }
  }

  async function handleCreateBlock() {
    if (!blockStart || !blockEnd) { setBlockError('Please select start and end dates'); return }
    if (blockEnd <= blockStart) { setBlockError('End date must be after start date'); return }
    setBlocking(true); setBlockError(null); setBlockSuccess(null)
    try {
      await createAdminBlock(
        propertyId,
        { check_in: blockStart, check_out: blockEnd, note: blockNote.trim() || null },
        fetchWithAuth
      )
      setBlockSuccess('Dates blocked successfully!')
      setBlockStart(''); setBlockEnd(''); setBlockNote(''); setSelStart(null)
      await fetchEvents()
    } catch (e: unknown) {
      setBlockError(e instanceof Error ? e.message : 'Failed to block dates')
    } finally {
      setBlocking(false)
    }
  }

  async function handleUnblock(block: CalendarEvent) {
    setBlockError(null); setBlockSuccess(null)
    try {
      await deleteAdminBlock(propertyId, block.id, fetchWithAuth)
      setBlockSuccess('Block removed successfully')
      await fetchEvents()
    } catch (e: unknown) {
      setBlockError(e instanceof Error ? e.message : 'Failed to remove block')
    }
  }

  // Build grid
  const totalDays = daysInMonth(viewYear, viewMonth)
  const firstDay = firstDayOfMonth(viewYear, viewMonth)
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const adminBlocks = events
    .filter(e => e.type === 'admin_block')
    .sort((a, b) => a.check_in.localeCompare(b.check_in))

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#1a1611', border: '1px solid #3d3425',
    color: '#e8d5a3', borderRadius: 8, padding: '8px 10px',
    fontSize: '0.82rem', marginBottom: 10, boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div
      className="cal-wrapper"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`
        .cal-wrapper {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0,0,0,0.82);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .cal-dialog {
          background: #1a1611;
          border: 1px solid #3d3425;
          border-radius: 16px;
          width: 100%;
          max-width: 1060px;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 30px 80px rgba(0,0,0,0.75);
          overflow: hidden;
        }
        .cal-modal-body {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        .cal-area {
          flex: 1;
          padding: 20px 24px;
          overflow-y: auto;
        }
        .cal-sidebar {
          width: 285px;
          border-left: 1px solid #2e2618;
          display: flex;
          flex-direction: column;
          background: #130f0a;
          overflow-y: auto;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .cal-wrapper {
            padding: 8px;
          }
          .cal-dialog {
            max-height: 96vh;
          }
          .cal-modal-body {
            flex-direction: column;
            overflow-y: auto;
          }
          .cal-area {
            flex: none;
            padding: 16px 14px;
            overflow-y: visible;
          }
          .cal-sidebar {
            width: 100%;
            border-left: none;
            border-top: 1px solid #2e2618;
            flex: none;
            overflow-y: visible;
          }
        }
      `}</style>
      <div className="cal-dialog">

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #2e2618', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e8d5a3' }}>📅 Property Calendar</div>
            <div style={{ fontSize: '0.78rem', color: '#8a7a5a', marginTop: 2 }}>{propertyName}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close calendar"
            style={{
              background: 'none', border: '1px solid #3d3425', color: '#8a7a5a',
              width: 36, height: 36, borderRadius: 8, cursor: 'pointer', fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div className="cal-modal-body">

          {/* Calendar area */}
          <div className="cal-area">

            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <button onClick={prevMonth} aria-label="Previous month" style={{
                background: 'none', border: '1px solid #3d3425', color: '#c9a84c',
                width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: '1.1rem',
              }}>‹</button>
              <div style={{ fontWeight: 700, color: '#e8d5a3', minWidth: 175, textAlign: 'center', fontSize: '1rem' }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </div>
              <button onClick={nextMonth} aria-label="Next month" style={{
                background: 'none', border: '1px solid #3d3425', color: '#c9a84c',
                width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: '1.1rem',
              }}>›</button>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6b5e3e', fontSize: '0.85rem' }}>
                Loading calendar…
              </div>
            ) : error ? (
              <div style={{ background: '#2a0a0a', border: '1px solid #7a2020', color: '#e57373', padding: '10px 12px', borderRadius: 8, fontSize: '0.8rem' }}>
                {error}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {/* Day headers */}
                {DAY_NAMES.map(d => (
                  <div key={d} style={{
                    textAlign: 'center', fontSize: '0.68rem', color: '#6b5e3e',
                    fontWeight: 600, padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{d}</div>
                ))}

                {/* Day cells */}
                {cells.map((day, idx) => {
                  if (!day) return <div key={`e${idx}`} style={{ minHeight: 50 }} />

                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                  const dayEvents = getEventsForDate(dateStr, events)
                  const guestEvs = dayEvents.filter(e => e.type === 'guest_booking')
                  const adminEvs = dayEvents.filter(e => e.type === 'admin_block')
                  const shadowEvs = dayEvents.filter(e => e.type === 'shadow_block')

                  const tips: string[] = []
                  guestEvs.forEach(e => tips.push(`👤 ${e.guest_name} | ${e.booking_ref} | ₹${(e.total ?? 0).toLocaleString('en-IN')}`))
                  adminEvs.forEach(e => tips.push(`🔒 Admin Block${e.note ? ': ' + e.note : ''}`))
                  shadowEvs.forEach(e => tips.push(`⬜ Group block${e.parent_booking_ref ? ': ' + e.parent_booking_ref : ''}`))
                  const tipText = tips.join('\n')

                  const isGuest = guestEvs.length > 0

                  const cellEl = (
                    <div
                      key={dateStr}
                      style={{
                        minHeight: 50, borderRadius: 8,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', cursor: isGuest ? 'not-allowed' : 'pointer',
                        position: 'relative', userSelect: 'none', transition: 'filter 0.12s',
                        ...getCellStyle(dateStr),
                      }}
                      onClick={() => handleDayClick(dateStr)}
                      onMouseEnter={() => selStart && setSelHover(dateStr)}
                      onMouseLeave={() => setSelHover(null)}
                    >
                      <span>{day}</span>
                      {dayEvents.length > 0 && (
                        <span style={{ fontSize: '0.55rem', marginTop: 2 }}>
                          {guestEvs.length > 0 ? '●' : adminEvs.length > 0 ? '🔒' : '◌'}
                        </span>
                      )}
                    </div>
                  )

                  return tipText ? (
                    <Tooltip key={dateStr} tip={tipText}>{cellEl}</Tooltip>
                  ) : <div key={dateStr}>{cellEl}</div>
                })}
              </div>
            )}

            {/* Legend */}
            <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { bg: '#2a1a0a', border: '1px solid rgba(201,168,76,0.4)', label: 'Guest Booking' },
                { bg: '#0f0d08', border: '1px solid #c9a84c', label: 'Admin Block' },
                { bg: 'repeating-linear-gradient(45deg,#1a1611,#1a1611 4px,#221d12 4px,#221d12 8px)', border: '1px solid #2e2618', label: 'Shadow Block (Group)' },
                { bg: 'rgba(201,168,76,0.22)', border: '1px solid #c9a84c', label: 'Selected Range' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.7rem', color: '#8a7a5a' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, flexShrink: 0, background: item.bg, border: item.border }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="cal-sidebar">
            {/* Block form */}
            <div style={{ padding: 20, borderBottom: '1px solid #1f1a10' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8a7a5a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Block Dates
              </div>

              {blockError && (
                <div style={{ background: '#2a0a0a', border: '1px solid #7a2020', color: '#e57373', borderRadius: 8, padding: '8px 10px', fontSize: '0.75rem', marginBottom: 10, lineHeight: 1.4 }}>
                  {blockError}
                </div>
              )}
              {blockSuccess && (
                <div style={{ background: '#0a2a0a', border: '1px solid #2a5a2a', color: '#81c784', borderRadius: 8, padding: '8px 10px', fontSize: '0.75rem', marginBottom: 10 }}>
                  {blockSuccess}
                </div>
              )}

              <label style={{ fontSize: '0.7rem', color: '#8a7a5a', display: 'block', marginBottom: 4 }}>Check-in</label>
              <input
                id="cal-block-start"
                type="date"
                value={blockStart}
                min={todayStr}
                onChange={e => { setBlockStart(e.target.value); setBlockError(null); setBlockSuccess(null) }}
                style={inputStyle}
              />

              <label style={{ fontSize: '0.7rem', color: '#8a7a5a', display: 'block', marginBottom: 4 }}>Check-out</label>
              <input
                id="cal-block-end"
                type="date"
                value={blockEnd}
                min={blockStart || todayStr}
                onChange={e => { setBlockEnd(e.target.value); setBlockError(null); setBlockSuccess(null) }}
                style={inputStyle}
              />

              <label style={{ fontSize: '0.7rem', color: '#8a7a5a', display: 'block', marginBottom: 4 }}>Reason (optional)</label>
              <input
                id="cal-block-note"
                type="text"
                placeholder="e.g. Maintenance, Owner stay…"
                value={blockNote}
                maxLength={200}
                onChange={e => setBlockNote(e.target.value)}
                style={inputStyle}
              />

              <button
                id="cal-block-submit"
                onClick={handleCreateBlock}
                disabled={blocking || !blockStart || !blockEnd}
                style={{
                  width: '100%',
                  background: (blocking || !blockStart || !blockEnd) ? '#2e2618' : 'linear-gradient(135deg,#c9a84c,#a07c30)',
                  color: (blocking || !blockStart || !blockEnd) ? '#6b5e3e' : '#0d0b07',
                  border: 'none', borderRadius: 8, padding: '10px',
                  fontSize: '0.82rem', fontWeight: 700,
                  cursor: (blocking || !blockStart || !blockEnd) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', marginTop: 2,
                }}
              >
                {blocking ? 'Blocking…' : '🔒 Block Dates'}
              </button>

              <p style={{ fontSize: '0.68rem', color: '#5a5040', marginTop: 8, lineHeight: 1.5 }}>
                Click two calendar days to pick a range, or use the date pickers above.
                Blocks cannot overlap guest bookings.
              </p>
            </div>

            {/* Active blocks */}
            <div style={{ padding: 20, flex: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8a7a5a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Active Blocks{adminBlocks.length > 0 ? ` (${adminBlocks.length})` : ''}
              </div>

              {adminBlocks.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: '#5a5040', lineHeight: 1.5 }}>
                  No admin blocks in the current view period.
                </p>
              ) : adminBlocks.map(block => (
                <div key={block.id} style={{
                  background: '#1a1611', border: '1px solid #2e2618', borderRadius: 8,
                  padding: '10px 12px', marginBottom: 8,
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.77rem', color: '#c4a96d', fontWeight: 600 }}>
                      {block.check_in} → {block.check_out}
                    </div>
                    {block.note && (
                      <div style={{ fontSize: '0.7rem', color: '#7a6a4a', marginTop: 2, wordBreak: 'break-word' }}>
                        {block.note}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnblock(block)}
                    aria-label={`Unblock ${block.check_in} to ${block.check_out}`}
                    style={{
                      background: 'none', border: '1px solid #7a2020', color: '#e57373',
                      borderRadius: 6, padding: '4px 8px', fontSize: '0.7rem',
                      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
                    }}
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
