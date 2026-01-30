import { useState, useRef, useEffect } from 'react'
import {
  Calendar,
  Clock,
  ChevronDown,
  X,
  CalendarDays,
  CalendarRange,
} from 'lucide-react'

const presets = [
  { id: 'today', label: 'Today', getRange: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(today)
    end.setHours(23, 59, 59, 999)
    return { start: today, end }
  }},
  { id: 'this-week', label: 'This Week', getRange: () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }},
  { id: 'this-month', label: 'This Month', getRange: () => {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
    return { start, end }
  }},
  { id: 'next-7-days', label: 'Next 7 Days', getRange: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(today)
    end.setDate(today.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { start: today, end }
  }},
  { id: 'next-30-days', label: 'Next 30 Days', getRange: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(today)
    end.setDate(today.getDate() + 29)
    end.setHours(23, 59, 59, 999)
    return { start: today, end }
  }},
  { id: 'next-3-months', label: 'Next 3 Months', getRange: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(today)
    end.setMonth(today.getMonth() + 3)
    end.setHours(23, 59, 59, 999)
    return { start: today, end }
  }},
  { id: 'last-7-days', label: 'Last 7 Days', getRange: () => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const start = new Date(today)
    start.setDate(today.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    return { start, end: today }
  }},
  { id: 'last-30-days', label: 'Last 30 Days', getRange: () => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const start = new Date(today)
    start.setDate(today.getDate() - 29)
    start.setHours(0, 0, 0, 0)
    return { start, end: today }
  }},
]

function DateTimeSlicer({
  onChange,
  showTimeFilter = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activePreset, setActivePreset] = useState(null)
  const [customRange, setCustomRange] = useState({ start: '', end: '' })
  const [timeRange, setTimeRange] = useState({ start: '00:00', end: '23:59' })
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePresetSelect = (preset) => {
    setActivePreset(preset.id)
    const range = preset.getRange()
    setCustomRange({
      start: range.start.toISOString().split('T')[0],
      end: range.end.toISOString().split('T')[0],
    })
    onChange?.({
      start: range.start,
      end: range.end,
      preset: preset.id,
      timeRange: showTimeFilter ? timeRange : null,
    })
    setIsOpen(false)
  }

  const handleCustomDateChange = (field, value) => {
    const newRange = { ...customRange, [field]: value }
    setCustomRange(newRange)
    setActivePreset('custom')

    if (newRange.start && newRange.end) {
      const start = new Date(newRange.start)
      start.setHours(0, 0, 0, 0)
      const end = new Date(newRange.end)
      end.setHours(23, 59, 59, 999)

      onChange?.({
        start,
        end,
        preset: 'custom',
        timeRange: showTimeFilter ? timeRange : null,
      })
    }
  }

  const handleTimeChange = (field, value) => {
    const newTimeRange = { ...timeRange, [field]: value }
    setTimeRange(newTimeRange)

    if (customRange.start && customRange.end) {
      const start = new Date(customRange.start)
      start.setHours(0, 0, 0, 0)
      const end = new Date(customRange.end)
      end.setHours(23, 59, 59, 999)

      onChange?.({
        start,
        end,
        preset: activePreset,
        timeRange: newTimeRange,
      })
    }
  }

  const clearFilter = () => {
    setActivePreset(null)
    setCustomRange({ start: '', end: '' })
    setTimeRange({ start: '00:00', end: '23:59' })
    onChange?.(null)
  }

  const getDisplayLabel = () => {
    if (!activePreset) return 'Date Range'
    if (activePreset === 'custom') {
      if (customRange.start && customRange.end) {
        const start = new Date(customRange.start)
        const end = new Date(customRange.end)
        return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
      }
      return 'Custom Range'
    }
    return presets.find((p) => p.id === activePreset)?.label || 'Date Range'
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-3 bg-gray-800 border rounded-lg text-white transition-colors ${
          activePreset
            ? 'border-white bg-white/10'
            : 'border-white/30 hover:border-white/50'
        }`}
      >
        <CalendarRange className="w-4 h-4 text-white" />
        <span className="text-sm">{getDisplayLabel()}</span>
        {activePreset ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              clearFilter()
            }}
            className="p-0.5 hover:bg-white/20 rounded"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        ) : (
          <ChevronDown className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-gray-800 border border-white/30 rounded-xl shadow-xl overflow-hidden">
          {/* Presets */}
          <div className="p-3 border-b border-gray-700">
            <p className="text-xs font-medium text-white uppercase tracking-wide mb-2">
              Quick Select
            </p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                    activePreset === preset.id
                      ? 'bg-white text-gray-900'
                      : 'bg-gray-900/50 text-white hover:bg-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Range */}
          <div className="p-3 border-b border-gray-700">
            <p className="text-xs font-medium text-white uppercase tracking-wide mb-2">
              Custom Range
            </p>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <label className="block text-xs text-white mb-1">From</label>
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => handleCustomDateChange('start', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              <div className="text-white pt-5">→</div>
              <div className="flex-1">
                <label className="block text-xs text-white mb-1">To</label>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => handleCustomDateChange('end', e.target.value)}
                  min={customRange.start}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
            </div>
          </div>

          {/* Time Filter (optional) */}
          {showTimeFilter && (
            <div className="p-3 border-b border-gray-700">
              <p className="text-xs font-medium text-white uppercase tracking-wide mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Time Filter
              </p>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-xs text-white mb-1">Start Time</label>
                  <input
                    type="time"
                    value={timeRange.start}
                    onChange={(e) => handleTimeChange('start', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>
                <div className="text-white pt-5">→</div>
                <div className="flex-1">
                  <label className="block text-xs text-white mb-1">End Time</label>
                  <input
                    type="time"
                    value={timeRange.end}
                    onChange={(e) => handleTimeChange('end', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-3 flex justify-between">
            <button
              onClick={clearFilter}
              className="px-3 py-1.5 text-sm text-white hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 text-sm bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateTimeSlicer
