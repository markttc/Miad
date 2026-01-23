import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Video,
  Clock,
  Users,
  Calendar,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Filter,
  Zap,
  Award,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react'
import { courses, upcomingSessions, courseCategories, getCourseById } from '../data/courses'
import DateTimeSlicer from '../components/admin/DateTimeSlicer'

function WebinarsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'
  const [selectedSession, setSelectedSession] = useState(null)

  // Get upcoming webinar sessions with course info
  const webinarSessions = useMemo(() => {
    return upcomingSessions
      .filter((session) => new Date(session.date) > new Date())
      .map((session) => ({
        ...session,
        course: getCourseById(session.courseId),
      }))
      .filter((session) => session.course)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [])

  // Get categories with webinar courses
  const availableCategories = useMemo(() => {
    const cats = new Set()
    webinarSessions.forEach((session) => {
      if (session.course) cats.add(session.course.category)
    })
    return courseCategories.filter((cat) => cats.has(cat.id))
  }, [webinarSessions])

  // Apply filters
  const filteredSessions = useMemo(() => {
    return webinarSessions.filter((session) => {
      // Date filter from slicer
      if (dateFilter) {
        const sessionDate = new Date(session.date)
        if (sessionDate < dateFilter.start || sessionDate > dateFilter.end) {
          return false
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && session.course.category !== selectedCategory) {
        return false
      }

      return true
    })
  }, [webinarSessions, dateFilter, selectedCategory])

  // Calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDay = firstDay.getDay() || 7

    const days = []

    for (let i = 1; i < startingDay; i++) {
      days.push(null)
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const sessionsOnDay = filteredSessions.filter((s) => s.date === dateStr)
      days.push({ date, sessions: sessionsOnDay })
    }

    return days
  }, [currentMonth, filteredSessions])

  // Stats
  const stats = useMemo(() => {
    const totalSpots = filteredSessions.reduce((sum, s) => sum + s.spotsTotal, 0)
    const availableSpots = filteredSessions.reduce((sum, s) => sum + s.spotsRemaining, 0)
    const lowAvailability = filteredSessions.filter((s) => s.spotsRemaining < 5).length
    return {
      total: filteredSessions.length,
      totalSpots,
      availableSpots,
      lowAvailability,
    }
  }, [filteredSessions])

  const monthYear = currentMonth.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getAvailabilityColor = (session) => {
    const percentage = (session.spotsRemaining / session.spotsTotal) * 100
    if (percentage === 0) return 'red'
    if (percentage < 25) return 'amber'
    if (percentage < 50) return 'cyan'
    return 'green'
  }

  const colorClasses = {
    red: {
      bg: 'bg-red-600',
      bgLight: 'bg-red-900/40',
      border: 'border-red-500',
      text: 'text-red-400',
    },
    amber: {
      bg: 'bg-amber-600',
      bgLight: 'bg-amber-900/40',
      border: 'border-amber-500',
      text: 'text-amber-400',
    },
    cyan: {
      bg: 'bg-[#13d8a0]',
      bgLight: 'bg-[#13d8a0]/20',
      border: 'border-[#13d8a0]',
      text: 'text-[#13d8a0]',
    },
    green: {
      bg: 'bg-green-600',
      bgLight: 'bg-green-900/40',
      border: 'border-green-500',
      text: 'text-green-400',
    },
  }

  const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPast = (date) => {
    if (!date) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-12 bg-gradient-to-b from-[#13d8a0]/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#13d8a0]/10 rounded-full border border-[#13d8a0]/30 mb-6">
              <Video className="w-4 h-4 text-[#13d8a0]" />
              <span className="text-sm text-white">Interactive Live Sessions</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Live{' '}
              <span className="text-[#13d8a0]">
                Webinar Training
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-6">
              Join expert-led live sessions via Zoom. Ask questions, interact with trainers,
              and learn alongside other healthcare professionals.
            </p>

            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-[#13d8a0]" />
              All sessions delivered via Zoom
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-4 bg-gray-800/50 border-y border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-gray-400">Sessions Available</p>
            </div>
            <div className="w-px bg-gray-700" />
            <div>
              <p className="text-2xl font-bold text-[#13d8a0]">{stats.availableSpots}</p>
              <p className="text-xs text-gray-400">Places Remaining</p>
            </div>
            <div className="w-px bg-gray-700" />
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.lowAvailability}</p>
              <p className="text-xs text-gray-400">Filling Fast</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & View Toggle */}
      <section className="py-4 border-b border-gray-800 sticky top-16 bg-gray-900/95 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter:</span>
            </div>

            <DateTimeSlicer onChange={setDateFilter} />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-[#13d8a0] text-white'
                    : 'bg-gray-800 text-white hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#13d8a0] text-white'
                    : 'bg-gray-800 text-white hover:text-white'
                }`}
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-16">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">No webinars found matching your filters</p>
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setDateFilter(null)
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'calendar' ? (
            <div className="flex gap-8">
              {/* Calendar View */}
              <div className="flex-1">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-semibold text-white">{monthYear}</h2>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="bg-gray-800 rounded-xl border border-[#13d8a0]/30 p-4">
                  {/* Week Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDays.map((day) => (
                      <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarData.map((dayData, index) => {
                      if (!dayData) {
                        return <div key={`empty-${index}`} className="aspect-square" />
                      }

                      const { date, sessions } = dayData
                      const hasSession = sessions.length > 0
                      const past = isPast(date)
                      const today = isToday(date)

                      // Get most urgent availability color if multiple sessions
                      let cellColor = null
                      if (hasSession) {
                        const colors = sessions.map(getAvailabilityColor)
                        if (colors.includes('red')) cellColor = 'red'
                        else if (colors.includes('amber')) cellColor = 'amber'
                        else if (colors.includes('cyan')) cellColor = 'cyan'
                        else cellColor = 'green'
                      }

                      const colors = cellColor ? colorClasses[cellColor] : null

                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => hasSession && !past && setSelectedSession(sessions[0])}
                          disabled={past || !hasSession}
                          className={`aspect-square rounded-lg text-sm font-medium transition-all relative flex flex-col items-center justify-center ${
                            past
                              ? 'text-gray-700 cursor-not-allowed bg-gray-800/50'
                              : hasSession
                              ? `${colors?.bg} hover:opacity-90 text-white cursor-pointer`
                              : 'bg-gray-900/50 text-gray-500 cursor-default'
                          } ${today ? 'ring-2 ring-[#13d8a0]' : ''}`}
                        >
                          <span className="text-base">{date.getDate()}</span>
                          {hasSession && (
                            <span className="text-[10px] opacity-80">
                              {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <div className="w-4 h-4 rounded bg-green-600" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <div className="w-4 h-4 rounded bg-cyan-600" />
                    <span>Filling</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <div className="w-4 h-4 rounded bg-amber-600" />
                    <span>Low Availability</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <div className="w-4 h-4 rounded bg-red-600" />
                    <span>Full</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Sessions Panel */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-gray-800 rounded-xl border border-[#13d8a0]/30 p-4 sticky top-32">
                  <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#13d8a0]" />
                    Upcoming Sessions
                  </h3>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-white">
                    {filteredSessions.slice(0, 8).map((session) => {
                      const color = getAvailabilityColor(session)
                      const colors = colorClasses[color]

                      return (
                        <button
                          key={session.id}
                          onClick={() => setSelectedSession(session)}
                          className={`w-full p-3 rounded-lg text-left transition-all ${colors.bgLight} border ${colors.border} hover:opacity-80`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-center w-10 flex-shrink-0">
                              <div className="text-lg font-bold text-white">
                                {new Date(session.date).getDate()}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {new Date(session.date).toLocaleDateString('en-GB', { month: 'short' })}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium truncate">
                                {session.course.name}
                              </p>
                              <p className="text-xs text-gray-400">{session.time}</p>
                              <p className={`text-xs ${colors.text} mt-1`}>
                                {session.spotsRemaining} spots left
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {filteredSessions.length > 8 && (
                    <p className="text-xs text-gray-500 text-center mt-3 pt-3 border-t border-gray-700">
                      +{filteredSessions.length - 8} more sessions
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSessions.map((session) => {
                const color = getAvailabilityColor(session)
                const colors = colorClasses[color]

                return (
                  <div
                    key={session.id}
                    className={`bg-gray-800 rounded-xl border-l-4 ${colors.border} p-5 hover:bg-gray-750 transition-colors`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`text-center w-12 py-1.5 ${colors.bgLight} rounded-lg`}>
                          <div className="text-lg font-bold text-white">
                            {new Date(session.date).getDate()}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(session.date).toLocaleDateString('en-GB', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <span className={`px-2 py-0.5 ${colors.bgLight} ${colors.text} text-xs font-medium rounded`}>
                            {session.spotsRemaining === 0
                              ? 'Full'
                              : session.spotsRemaining < 5
                              ? `${session.spotsRemaining} spots left!`
                              : `${session.spotsRemaining} available`}
                          </span>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-white">£{session.price}</div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {session.course.name}
                    </h3>

                    <div className="space-y-1.5 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {session.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        {session.trainer}
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-500" />
                        {session.course.certification}
                      </div>
                    </div>

                    {/* Action */}
                    <Link
                      to={`/book/${session.courseId}?session=${session.id}`}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm text-center transition-colors flex items-center justify-center gap-2 ${
                        session.spotsRemaining === 0
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : `${colors.bg} hover:opacity-90 text-white`
                      }`}
                    >
                      {session.spotsRemaining === 0 ? (
                        'Fully Booked'
                      ) : (
                        <>
                          Book Now
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedSession(null)} />
          <div className="relative bg-gray-800 rounded-xl border border-[#13d8a0]/30 p-6 max-w-lg w-full">
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Date Badge */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center w-16 py-2 bg-[#13d8a0]/10 rounded-lg border border-[#13d8a0]/30">
                <div className="text-xs text-[#13d8a0]">
                  {new Date(selectedSession.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                </div>
                <div className="text-2xl font-bold text-white">
                  {new Date(selectedSession.date).getDate()}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(selectedSession.date).toLocaleDateString('en-GB', { month: 'short' })}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedSession.course.name}</h2>
                <p className="text-gray-400">{selectedSession.time}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Trainer</span>
                <span className="text-white font-medium">{selectedSession.trainer}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Duration</span>
                <span className="text-white font-medium">{selectedSession.course.duration}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Certification</span>
                <span className="text-white font-medium">{selectedSession.course.certification}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Places</span>
                <span className={`font-medium ${
                  selectedSession.spotsRemaining < 5 ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {selectedSession.spotsRemaining} of {selectedSession.spotsTotal} available
                </span>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div>
                <p className="text-sm text-gray-400">Price per delegate</p>
                <p className="text-2xl font-bold text-white">£{selectedSession.price}</p>
              </div>
              <Link
                to={`/book/${selectedSession.courseId}?session=${selectedSession.id}`}
                className="btn-primary px-6 py-3"
              >
                Book This Session
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-8">What to Expect</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#13d8a0]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-[#13d8a0]" />
              </div>
              <h3 className="font-semibold text-white mb-2">Zoom Delivery</h3>
              <p className="text-sm text-gray-400">
                Joining instructions and Zoom link sent automatically before your session.
                No software installation required.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#13d8a0]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[#13d8a0]" />
              </div>
              <h3 className="font-semibold text-white mb-2">Interactive Sessions</h3>
              <p className="text-sm text-gray-400">
                Ask questions, participate in discussions, and interact with expert trainers
                and fellow learners.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#13d8a0]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-[#13d8a0]" />
              </div>
              <h3 className="font-semibold text-white mb-2">Instant Certification</h3>
              <p className="text-sm text-gray-400">
                Receive your certificate immediately upon successful completion of the training session.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default WebinarsPage
