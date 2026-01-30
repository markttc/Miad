import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Check,
  X,
  CalendarDays,
} from 'lucide-react'

const timeSlots = [
  { id: 'morning', label: 'Morning', time: '09:00 - 12:00', icon: Sun, color: 'amber' },
  { id: 'afternoon', label: 'Afternoon', time: '13:00 - 17:00', icon: Sunset, color: 'blue' },
  { id: 'all-day', label: 'All Day', time: '09:00 - 17:00', icon: Check, color: 'green' },
]

// Explicit color classes for Tailwind
const colorClasses = {
  amber: {
    bg: 'bg-amber-600',
    bgHover: 'hover:bg-amber-500',
    bgLight: 'bg-amber-900/30',
    bgLightHover: 'hover:bg-amber-900/50',
    border: 'border-amber-500',
    borderLight: 'border-amber-800/50',
    text: 'text-amber-400',
    legendBg: 'bg-amber-600',
  },
  blue: {
    bg: 'bg-blue-600',
    bgHover: 'hover:bg-blue-500',
    bgLight: 'bg-blue-900/30',
    bgLightHover: 'hover:bg-blue-900/50',
    border: 'border-blue-500',
    borderLight: 'border-blue-800/50',
    text: 'text-blue-400',
    legendBg: 'bg-blue-600',
  },
  green: {
    bg: 'bg-green-600',
    bgHover: 'hover:bg-green-500',
    bgLight: 'bg-green-900/30',
    bgLightHover: 'hover:bg-green-900/50',
    border: 'border-green-500',
    borderLight: 'border-green-800/50',
    text: 'text-green-400',
    legendBg: 'bg-green-600',
  },
}

function AvailabilityCalendar({ availability = {}, onChange }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDay = firstDay.getDay() || 7

    const days = []

    for (let i = 1; i < startingDay; i++) {
      days.push(null)
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [currentDate])

  const upcomingAvailability = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcoming = []
    const entries = Object.entries(availability)

    entries.forEach(([dateStr, slot]) => {
      const date = new Date(dateStr)
      if (date >= today) {
        upcoming.push({ date, slot, dateStr })
      }
    })

    return upcoming
      .sort((a, b) => a.date - b.date)
      .slice(0, 10)
  }, [availability])

  const monthYear = currentDate.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0]
  }

  const getDateAvailability = (date) => {
    if (!date) return null
    const key = formatDateKey(date)
    return availability[key] || null
  }

  const getSlotConfig = (slotId) => {
    return timeSlots.find((s) => s.id === slotId)
  }

  const isDateInPast = (date) => {
    if (!date) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const handleDateClick = (date) => {
    if (!date || isDateInPast(date)) return
    setSelectedDate(date)
  }

  const handleSlotSelect = (slot) => {
    if (!selectedDate) return

    const key = formatDateKey(selectedDate)
    const currentSlot = availability[key]

    const newAvailability = {
      ...availability,
      [key]: currentSlot === slot ? null : slot,
    }

    if (newAvailability[key] === null) {
      delete newAvailability[key]
    }

    onChange(newAvailability)
  }

  const handleClearDate = () => {
    if (!selectedDate) return

    const key = formatDateKey(selectedDate)
    const newAvailability = { ...availability }
    delete newAvailability[key]
    onChange(newAvailability)
    setSelectedDate(null)
  }

  const handleQuickAdd = (date) => {
    setSelectedDate(date)
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const availableDaysCount = useMemo(() => {
    return calendarData.filter((date) => date && getDateAvailability(date)).length
  }, [calendarData, availability])

  return (
    <div className="flex gap-6">
      {/* Calendar Section */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-white hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">{monthYear}</h3>
            <p className="text-sm text-white">
              {availableDaysCount} day{availableDaysCount !== 1 ? 's' : ''} marked available
            </p>
          </div>
          <button
            onClick={goToNextMonth}
            className="p-2 text-white hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-gray-900 rounded-xl p-3">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs text-white font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const slotId = getDateAvailability(date)
              const slotConfig = slotId ? getSlotConfig(slotId) : null
              const colors = slotConfig ? colorClasses[slotConfig.color] : null
              const SlotIcon = slotConfig?.icon
              const isPast = isDateInPast(date)
              const today = isToday(date)
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

              let cellClasses = 'aspect-square rounded-lg text-sm font-medium transition-all relative overflow-hidden flex items-center justify-center'

              if (isPast) {
                cellClasses += ' text-gray-700 cursor-not-allowed bg-gray-800/50'
              } else if (isSelected) {
                cellClasses += ' bg-purple-600 text-white ring-2 ring-purple-400 cursor-pointer'
              } else if (colors) {
                cellClasses += ` ${colors.bg} ${colors.bgHover} text-white cursor-pointer`
              } else {
                cellClasses += ' bg-gray-800 text-white hover:bg-gray-700 cursor-pointer'
              }

              if (today && !isSelected) {
                cellClasses += ' ring-2 ring-purple-500 ring-inset'
              }

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  disabled={isPast}
                  className={cellClasses}
                >
                  <span className="relative z-10">{date.getDate()}</span>
                  {slotConfig && SlotIcon && !isSelected && (
                    <SlotIcon className="absolute bottom-0.5 right-0.5 w-3 h-3 opacity-80" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Slot Selection */}
        {selectedDate && (
          <div className="mt-4 bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">
                {selectedDate.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h4>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 text-white hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => {
                const Icon = slot.icon
                const isActive = getDateAvailability(selectedDate) === slot.id
                const colors = colorClasses[slot.color]

                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      isActive
                        ? `${colors.border} ${colors.bg} text-white`
                        : 'border-gray-700 bg-gray-800 text-white hover:border-gray-600 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-1 ${isActive ? 'text-white' : colors.text}`} />
                    <p className="text-sm font-medium">{slot.label}</p>
                    <p className="text-xs opacity-70">{slot.time}</p>
                  </button>
                )
              })}
            </div>

            {getDateAvailability(selectedDate) && (
              <button
                onClick={handleClearDate}
                className="w-full mt-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-800"
              >
                Remove availability
              </button>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
          {timeSlots.map((slot) => {
            const Icon = slot.icon
            const colors = colorClasses[slot.color]
            return (
              <div key={slot.id} className="flex items-center gap-1.5 text-white">
                <div className={`w-4 h-4 rounded ${colors.legendBg} flex items-center justify-center`}>
                  <Icon className="w-2.5 h-2.5 text-white" />
                </div>
                <span>{slot.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Availability Panel */}
      <div className="w-56 flex-shrink-0">
        <div className="bg-gray-900 rounded-xl p-4 sticky top-0">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-purple-400" />
            Upcoming Availability
          </h4>

          {upcomingAvailability.length === 0 ? (
            <p className="text-xs text-white text-center py-4">
              No availability set yet.
              <br />
              Click dates to add.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingAvailability.map(({ date, slot, dateStr }) => {
                const slotConfig = getSlotConfig(slot)
                const Icon = slotConfig?.icon
                const colors = slotConfig ? colorClasses[slotConfig.color] : null

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleQuickAdd(date)}
                    className={`w-full p-2 rounded-lg text-left transition-all ${colors?.bgLight} ${colors?.bgLightHover} border ${colors?.borderLight}`}
                  >
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className={`w-4 h-4 ${colors?.text}`} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">
                          {date.toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                        <p className={`text-xs ${colors?.text}`}>
                          {slotConfig?.time}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {upcomingAvailability.length > 0 && (
            <p className="text-xs text-white text-center mt-3 pt-3 border-t border-gray-800">
              Click to edit
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AvailabilityCalendar
