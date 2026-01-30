import { useState, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Plus,
  Search,
  Clock,
  Users,
  Edit2,
  Trash2,
  Eye,
  ChevronRight,
  ClipboardList,
  Copy,
  Check,
  Sparkles,
  X,
  Info,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { upcomingSessions as initialSessions, courses, courseCategories } from '../../data/courses'
import ViewEventModal from '../../components/admin/ViewEventModal'
import EditEventModal from '../../components/admin/EditEventModal'
import MiadLogo from '../../assets/miad-logo.svg'

// ============================================================================
// NATURAL LANGUAGE SEARCH PARSER
// ============================================================================

/**
 * Parses natural language queries and returns filter criteria.
 * Designed to work with AI agents and human users alike.
 *
 * Example queries:
 * - "show me all open courses"
 * - "courses with 10 or more available spots"
 * - "full courses this week"
 * - "safeguarding courses with low availability"
 * - "Dr Sarah's sessions tomorrow"
 */
function parseNaturalLanguageQuery(query, sessionsWithCourses) {
  const normalizedQuery = query.toLowerCase().trim()
  const result = {
    textMatch: null,
    availability: null,      // 'open' | 'full' | 'low' | 'filling'
    spotsCondition: null,    // { operator: '>=', value: 10 }
    dateRange: null,         // { start: Date, end: Date }
    category: null,
    trainer: null,
    interpretations: [],     // Human-readable explanations of what was parsed
  }

  if (!normalizedQuery) return result

  // ---- AVAILABILITY STATUS ----
  if (/\b(open|available|has spots|has places|not full|accepting)\b/.test(normalizedQuery)) {
    result.availability = 'open'
    result.interpretations.push('Open courses (has available spots)')
  }
  if (/\b(full|closed|no spots|no places|sold out|fully booked)\b/.test(normalizedQuery)) {
    result.availability = 'full'
    result.interpretations.push('Full courses (no spots remaining)')
  }
  if (/\b(low availability|almost full|filling up|nearly full|few spots)\b/.test(normalizedQuery)) {
    result.availability = 'low'
    result.interpretations.push('Low availability (< 25% spots remaining)')
  }
  if (/\b(filling|half full|partially booked)\b/.test(normalizedQuery)) {
    result.availability = 'filling'
    result.interpretations.push('Filling up (25-50% spots remaining)')
  }

  // ---- SPOTS/PLACES NUMERIC CONDITIONS ----
  // "10 or more spots", "at least 5 places", "more than 10 available"
  const morePattern = /(\d+)\s*(?:or more|plus|\+|at least|minimum|min)\s*(?:spots?|places?|seats?|available)?/i
  const moreThanPattern = /(?:more than|greater than|over|above)\s*(\d+)\s*(?:spots?|places?|seats?|available)?/i
  const lessPattern = /(?:less than|fewer than|under|below)\s*(\d+)\s*(?:spots?|places?|seats?|available)?/i
  const atMostPattern = /(?:at most|maximum|max|up to)\s*(\d+)\s*(?:spots?|places?|seats?|available)?/i
  const exactPattern = /(?:exactly|precisely)\s*(\d+)\s*(?:spots?|places?|seats?|available)?/i

  let match
  if ((match = normalizedQuery.match(morePattern))) {
    result.spotsCondition = { operator: '>=', value: parseInt(match[1]) }
    result.interpretations.push(`${match[1]} or more spots available`)
  } else if ((match = normalizedQuery.match(moreThanPattern))) {
    result.spotsCondition = { operator: '>', value: parseInt(match[1]) }
    result.interpretations.push(`More than ${match[1]} spots available`)
  } else if ((match = normalizedQuery.match(lessPattern))) {
    result.spotsCondition = { operator: '<', value: parseInt(match[1]) }
    result.interpretations.push(`Less than ${match[1]} spots available`)
  } else if ((match = normalizedQuery.match(atMostPattern))) {
    result.spotsCondition = { operator: '<=', value: parseInt(match[1]) }
    result.interpretations.push(`At most ${match[1]} spots available`)
  } else if ((match = normalizedQuery.match(exactPattern))) {
    result.spotsCondition = { operator: '===', value: parseInt(match[1]) }
    result.interpretations.push(`Exactly ${match[1]} spots available`)
  }

  // ---- DATE RANGES ----
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)

  const endOfTomorrow = new Date(tomorrow)
  endOfTomorrow.setHours(23, 59, 59, 999)

  // This week (Mon-Sun)
  const startOfWeek = new Date(today)
  const dayOfWeek = startOfWeek.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday
  startOfWeek.setDate(startOfWeek.getDate() + diff)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  // Next week
  const startOfNextWeek = new Date(endOfWeek)
  startOfNextWeek.setDate(startOfNextWeek.getDate() + 1)
  startOfNextWeek.setHours(0, 0, 0, 0)

  const endOfNextWeek = new Date(startOfNextWeek)
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 6)
  endOfNextWeek.setHours(23, 59, 59, 999)

  // This month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

  // Next month
  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59, 999)

  if (/\btoday\b/.test(normalizedQuery)) {
    result.dateRange = { start: today, end: endOfToday }
    result.interpretations.push('Today only')
  } else if (/\btomorrow\b/.test(normalizedQuery)) {
    result.dateRange = { start: tomorrow, end: endOfTomorrow }
    result.interpretations.push('Tomorrow only')
  } else if (/\bthis week\b/.test(normalizedQuery)) {
    result.dateRange = { start: startOfWeek, end: endOfWeek }
    result.interpretations.push('This week')
  } else if (/\bnext week\b/.test(normalizedQuery)) {
    result.dateRange = { start: startOfNextWeek, end: endOfNextWeek }
    result.interpretations.push('Next week')
  } else if (/\bthis month\b/.test(normalizedQuery)) {
    result.dateRange = { start: startOfMonth, end: endOfMonth }
    result.interpretations.push('This month')
  } else if (/\bnext month\b/.test(normalizedQuery)) {
    result.dateRange = { start: startOfNextMonth, end: endOfNextMonth }
    result.interpretations.push('Next month')
  } else if (/\b(upcoming|future)\b/.test(normalizedQuery)) {
    result.dateRange = { start: today, end: new Date(today.getFullYear() + 1, 11, 31) }
    result.interpretations.push('Upcoming events')
  } else if (/\b(past|previous|completed|finished)\b/.test(normalizedQuery)) {
    result.dateRange = { start: new Date(2020, 0, 1), end: today }
    result.interpretations.push('Past events')
  }

  // ---- CATEGORIES ----
  const categoryMappings = {
    mandatory: ['mandatory', 'required', 'compulsory', 'essential'],
    clinical: ['clinical', 'medical', 'healthcare skills'],
    leadership: ['leadership', 'management', 'team lead'],
    safeguarding: ['safeguarding', 'protection', 'vulnerable'],
    'mental-health': ['mental health', 'psychological', 'dementia', 'suicide', 'wellbeing'],
    'infection-control': ['infection', 'hygiene', 'aseptic', 'ipc'],
  }

  for (const [categoryId, keywords] of Object.entries(categoryMappings)) {
    for (const keyword of keywords) {
      if (normalizedQuery.includes(keyword)) {
        result.category = categoryId
        const categoryName = courseCategories.find(c => c.id === categoryId)?.name || categoryId
        result.interpretations.push(`Category: ${categoryName}`)
        break
      }
    }
    if (result.category) break
  }

  // ---- TRAINER NAMES ----
  const trainers = [...new Set(sessionsWithCourses.map(s => s.trainer))]
  for (const trainer of trainers) {
    const trainerLower = trainer.toLowerCase()
    const trainerParts = trainerLower.split(' ')

    // Check if any part of trainer name is in query
    for (const part of trainerParts) {
      if (part.length > 2 && normalizedQuery.includes(part)) {
        result.trainer = trainer
        result.interpretations.push(`Trainer: ${trainer}`)
        break
      }
    }
    if (result.trainer) break
  }

  // ---- COURSE NAME TEXT MATCH ----
  // Extract remaining text after removing recognized patterns
  let remainingText = normalizedQuery
    .replace(/\b(show|me|all|the|courses?|sessions?|events?|bookings?|with|that|have|has|are|is|and|or)\b/gi, '')
    .replace(/\b(open|available|full|closed|low|filling|upcoming|past|today|tomorrow|this week|next week|this month|next month)\b/gi, '')
    .replace(/\d+\s*(or more|plus|\+|at least|minimum|min|spots?|places?|seats?|available)/gi, '')
    .replace(/\b(more than|greater than|over|above|less than|fewer than|under|below|at most|maximum|max|up to|exactly|precisely)\b/gi, '')
    .trim()

  // Also remove matched category and trainer terms
  if (result.category) {
    const catKeywords = categoryMappings[result.category] || []
    for (const kw of catKeywords) {
      remainingText = remainingText.replace(new RegExp(kw, 'gi'), '')
    }
  }
  if (result.trainer) {
    remainingText = remainingText.replace(new RegExp(result.trainer, 'gi'), '')
  }

  remainingText = remainingText.replace(/\s+/g, ' ').trim()

  // If there's meaningful text left, use it as a text search
  if (remainingText.length > 2) {
    result.textMatch = remainingText
    result.interpretations.push(`Text search: "${remainingText}"`)
  }

  return result
}

/**
 * Apply parsed NL criteria to filter sessions
 */
function applyNLFilter(sessions, criteria) {
  return sessions.filter(session => {
    // Text match (course name, trainer)
    if (criteria.textMatch) {
      const searchText = criteria.textMatch.toLowerCase()
      const matchesText =
        session.course?.name.toLowerCase().includes(searchText) ||
        session.trainer.toLowerCase().includes(searchText) ||
        session.course?.description?.toLowerCase().includes(searchText)
      if (!matchesText) return false
    }

    // Availability status
    if (criteria.availability) {
      const percentage = (session.spotsRemaining / session.spotsTotal) * 100
      switch (criteria.availability) {
        case 'open':
          if (session.spotsRemaining === 0) return false
          break
        case 'full':
          if (session.spotsRemaining > 0) return false
          break
        case 'low':
          if (percentage >= 25 || percentage === 0) return false
          break
        case 'filling':
          if (percentage < 25 || percentage >= 50) return false
          break
      }
    }

    // Spots numeric condition
    if (criteria.spotsCondition) {
      const { operator, value } = criteria.spotsCondition
      const spots = session.spotsRemaining
      switch (operator) {
        case '>=': if (!(spots >= value)) return false; break
        case '>': if (!(spots > value)) return false; break
        case '<=': if (!(spots <= value)) return false; break
        case '<': if (!(spots < value)) return false; break
        case '===': if (spots !== value) return false; break
      }
    }

    // Date range
    if (criteria.dateRange) {
      const sessionDate = new Date(session.date)
      if (sessionDate < criteria.dateRange.start || sessionDate > criteria.dateRange.end) {
        return false
      }
    }

    // Category
    if (criteria.category && session.course?.category !== criteria.category) {
      return false
    }

    // Trainer
    if (criteria.trainer && session.trainer !== criteria.trainer) {
      return false
    }

    return true
  })
}

// ============================================================================
// EVENTS PAGE COMPONENT
// ============================================================================

function EventsPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState(initialSessions)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Modal state
  const [viewingSession, setViewingSession] = useState(null)
  const [editingSession, setEditingSession] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Generate a formatted session ID (EVT-XXXX)
  const formatSessionId = (session) => {
    const numericPart = session.id.replace(/\D/g, '') || session.id
    return `EVT-${String(numericPart).padStart(4, '0')}`
  }

  // Copy session ID to clipboard
  const copySessionId = async (sessionId, formattedId) => {
    try {
      await navigator.clipboard.writeText(formattedId)
      setCopiedId(sessionId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setDateRangeFilter('all')
    setAvailabilityFilter('all')
    setCategoryFilter('all')
  }, [])

  if (!isAdmin) {
    navigate('/login?type=admin')
    return null
  }

  // Get all sessions with course info
  const sessionsWithCourses = useMemo(() => {
    return sessions.map((session) => ({
      ...session,
      course: courses.find((c) => c.id === session.courseId),
    }))
  }, [sessions])

  // Handle saving edited session
  const handleSaveSession = (updatedSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    )
    setEditingSession(null)
  }

  // Parse natural language query
  const nlCriteria = useMemo(() => {
    return parseNaturalLanguageQuery(searchQuery, sessionsWithCourses)
  }, [searchQuery, sessionsWithCourses])

  // Check if AI search is active
  const isAISearchActive = nlCriteria.interpretations.length > 0

  // Calculate date ranges for dropdown filter
  const getDateRangeFromFilter = useCallback((filter) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (filter) {
      case 'today': {
        const end = new Date(today)
        end.setHours(23, 59, 59, 999)
        return { start: today, end }
      }
      case 'tomorrow': {
        const start = new Date(today)
        start.setDate(start.getDate() + 1)
        const end = new Date(start)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
      case 'this-week': {
        const start = new Date(today)
        const dayOfWeek = start.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        start.setDate(start.getDate() + diff)
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
      case 'next-week': {
        const start = new Date(today)
        const dayOfWeek = start.getDay()
        const diff = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
        start.setDate(start.getDate() + diff)
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
      case 'this-month': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
        return { start, end }
      }
      case 'next-month': {
        const start = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        const end = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59, 999)
        return { start, end }
      }
      default:
        return null
    }
  }, [])

  // Apply all filters
  const filteredSessions = useMemo(() => {
    let filtered = sessionsWithCourses

    // Apply NL search first (if query exists)
    if (searchQuery.trim()) {
      filtered = applyNLFilter(filtered, nlCriteria)
    }

    // Apply dropdown filters (these stack on top of NL search)
    // Date range filter
    if (dateRangeFilter !== 'all') {
      const range = getDateRangeFromFilter(dateRangeFilter)
      if (range) {
        filtered = filtered.filter(session => {
          const sessionDate = new Date(session.date)
          return sessionDate >= range.start && sessionDate <= range.end
        })
      }
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(session => {
        const percentage = (session.spotsRemaining / session.spotsTotal) * 100
        switch (availabilityFilter) {
          case 'open': return session.spotsRemaining > 0
          case 'full': return session.spotsRemaining === 0
          case 'low': return percentage > 0 && percentage < 25
          default: return true
        }
      })
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(session => session.course?.category === categoryFilter)
    }

    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [sessionsWithCourses, searchQuery, nlCriteria, dateRangeFilter, availabilityFilter, categoryFilter, getDateRangeFromFilter])

  const getAvailabilityStatus = (session) => {
    const percentage = (session.spotsRemaining / session.spotsTotal) * 100
    if (percentage === 0) return { label: 'Full', color: 'red' }
    if (percentage < 25) return { label: 'Low', color: 'amber' }
    if (percentage < 50) return { label: 'Filling', color: 'cyan' }
    return { label: 'Available', color: 'green' }
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery || dateRangeFilter !== 'all' || availabilityFilter !== 'all' || categoryFilter !== 'all'

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-purple-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/">
                <img src={MiadLogo} alt="Miad Healthcare" className="h-7" />
              </Link>
              <div className="border-l border-gray-700 pl-6">
                <div className="flex items-center gap-2 text-sm text-white mb-1">
                  <Link to="/admin" className="hover:text-white">Dashboard</Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-white">Events</span>
                </div>
                <h1 className="text-xl font-bold text-white">Event Management</h1>
              </div>
            </div>
            <Link
              to="/admin/events/new"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Search Box */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Sparkles className={`w-5 h-5 ${isAISearchActive ? 'text-purple-400' : 'text-white'}`} />
            </div>
            <input
              type="text"
              placeholder='AI Search: Try "open courses with 10+ spots" or "safeguarding this week"...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-10 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                isAISearchActive
                  ? 'border-purple-500 focus:ring-purple-500'
                  : 'border-purple-800/50 focus:ring-purple-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Search Interpretation */}
          {isAISearchActive && (
            <div className="mt-2 flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                <span className="text-purple-400">AI understood:</span>
                {nlCriteria.interpretations.map((interpretation, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded-full text-xs"
                  >
                    {interpretation}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this-week">This Week</option>
            <option value="next-week">Next Week</option>
            <option value="this-month">This Month</option>
            <option value="next-month">Next Month</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Availability</option>
            <option value="open">Open (Has Spots)</option>
            <option value="low">Low Availability</option>
            <option value="full">Full (Closed)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            {courseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-white hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-white">Matching Events</p>
            <p className="text-2xl font-bold text-white">{filteredSessions.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-white">Open</p>
            <p className="text-2xl font-bold text-green-400">
              {filteredSessions.filter((s) => s.spotsRemaining > 0).length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-white">Low Availability</p>
            <p className="text-2xl font-bold text-amber-400">
              {filteredSessions.filter((s) => {
                const pct = (s.spotsRemaining / s.spotsTotal) * 100
                return pct > 0 && pct < 25
              }).length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-white">Full</p>
            <p className="text-2xl font-bold text-red-400">
              {filteredSessions.filter((s) => s.spotsRemaining === 0).length}
            </p>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-gray-800 rounded-xl border border-purple-800/50 overflow-hidden">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-white mb-2">No events found</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Clear filters to see all events
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-white border-b border-gray-700">
                    <th className="px-4 py-3 font-medium">Session ID</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Course</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Trainer</th>
                    <th className="px-4 py-3 font-medium">Bookings</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredSessions.map((session) => {
                    const isUpcoming = new Date(session.date) > new Date()
                    const availability = getAvailabilityStatus(session)
                    const booked = session.spotsTotal - session.spotsRemaining

                    return (
                      <tr key={session.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-gray-900 text-cyan-400 rounded text-sm font-mono">
                              {formatSessionId(session)}
                            </code>
                            <button
                              onClick={() => copySessionId(session.id, formatSessionId(session))}
                              className="p-1 text-white hover:text-cyan-400 transition-colors"
                              title="Copy ID"
                            >
                              {copiedId === session.id ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="text-center w-12 py-1 bg-purple-900/30 rounded">
                              <div className="text-lg font-bold text-white">
                                {new Date(session.date).getDate()}
                              </div>
                              <div className="text-xs text-purple-400">
                                {new Date(session.date).toLocaleDateString('en-GB', { month: 'short' })}
                              </div>
                            </div>
                            <span className="text-sm text-white">
                              {new Date(session.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-white font-medium">{session.course?.name}</p>
                            <p className="text-xs text-white">
                              {courseCategories.find((c) => c.id === session.course?.category)?.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white flex items-center gap-1">
                            <Clock className="w-4 h-4 text-white" />
                            {session.time}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white">{session.trainer}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  availability.color === 'red' ? 'bg-red-500' :
                                  availability.color === 'amber' ? 'bg-amber-500' :
                                  availability.color === 'cyan' ? 'bg-cyan-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${(booked / session.spotsTotal) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-white">
                              {booked}/{session.spotsTotal}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {isUpcoming ? (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              availability.color === 'red' ? 'bg-red-900/50 text-red-400' :
                              availability.color === 'amber' ? 'bg-amber-900/50 text-amber-400' :
                              availability.color === 'cyan' ? 'bg-cyan-900/50 text-cyan-400' :
                              'bg-green-900/50 text-green-400'
                            }`}>
                              {availability.label}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-700 text-white rounded text-xs font-medium">
                              Completed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingSession(session)}
                              className="p-2 text-white hover:text-white hover:bg-gray-700 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/admin/training-register?session=${session.id}`}
                              className="p-2 text-white hover:text-cyan-400 hover:bg-gray-700 rounded transition-colors"
                              title="View Training Register"
                            >
                              <ClipboardList className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setEditingSession(session)}
                              className="p-2 text-white hover:text-purple-400 hover:bg-gray-700 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {isUpcoming && booked === 0 && (
                              <button
                                className="p-2 text-white hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Search Help */}
        <div className="mt-6 bg-gray-800/50 rounded-xl border border-purple-800/30 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-white mb-2">AI Search Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white">
                <div>
                  <span className="text-purple-400">"open courses"</span> - Shows courses with available spots
                </div>
                <div>
                  <span className="text-purple-400">"10 or more spots"</span> - Courses with 10+ availability
                </div>
                <div>
                  <span className="text-purple-400">"safeguarding this week"</span> - Category + date filter
                </div>
                <div>
                  <span className="text-purple-400">"full courses"</span> - Shows fully booked courses
                </div>
                <div>
                  <span className="text-purple-400">"Dr Sarah's sessions"</span> - Filter by trainer
                </div>
                <div>
                  <span className="text-purple-400">"low availability clinical"</span> - Combined filters
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Event Modal */}
      {viewingSession && (
        <ViewEventModal
          session={viewingSession}
          onClose={() => setViewingSession(null)}
          onEdit={(session) => setEditingSession(session)}
        />
      )}

      {/* Edit Event Modal */}
      {editingSession && (
        <EditEventModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSave={handleSaveSession}
        />
      )}
    </div>
  )
}

export default EventsPage
