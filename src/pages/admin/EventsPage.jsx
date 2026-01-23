import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Video,
  Edit2,
  Trash2,
  Eye,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { upcomingSessions as initialSessions, courses, courseCategories } from '../../data/courses'
import ViewEventModal from '../../components/admin/ViewEventModal'
import EditEventModal from '../../components/admin/EditEventModal'
import DateTimeSlicer from '../../components/admin/DateTimeSlicer'
import MiadLogo from '../../assets/miad-logo.svg'

function EventsPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState(initialSessions)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)

  // Modal state
  const [viewingSession, setViewingSession] = useState(null)
  const [editingSession, setEditingSession] = useState(null)

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

  // Apply filters
  const filteredSessions = useMemo(() => {
    return sessionsWithCourses.filter((session) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          session.course?.name.toLowerCase().includes(query) ||
          session.trainer.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Category filter
      if (categoryFilter !== 'all' && session.course?.category !== categoryFilter) {
        return false
      }

      // Status filter
      const isUpcoming = new Date(session.date) > new Date()
      if (statusFilter === 'upcoming' && !isUpcoming) return false
      if (statusFilter === 'past' && isUpcoming) return false

      // Date range filter
      if (dateFilter) {
        const sessionDate = new Date(session.date)
        if (sessionDate < dateFilter.start || sessionDate > dateFilter.end) {
          return false
        }
        // Time filter (if provided)
        if (dateFilter.timeRange && session.time) {
          const sessionTime = session.time.split(' - ')[0] // Get start time
          if (sessionTime < dateFilter.timeRange.start || sessionTime > dateFilter.timeRange.end) {
            return false
          }
        }
      }

      return true
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [sessionsWithCourses, searchQuery, categoryFilter, statusFilter, dateFilter])

  const getAvailabilityStatus = (session) => {
    const percentage = (session.spotsRemaining / session.spotsTotal) * 100
    if (percentage === 0) return { label: 'Full', color: 'red' }
    if (percentage < 25) return { label: 'Low', color: 'amber' }
    if (percentage < 50) return { label: 'Filling', color: 'cyan' }
    return { label: 'Available', color: 'green' }
  }

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
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
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
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <DateTimeSlicer
            onChange={setDateFilter}
            showTimeFilter={true}
          />

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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Total Events</p>
            <p className="text-2xl font-bold text-white">{filteredSessions.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Upcoming</p>
            <p className="text-2xl font-bold text-purple-400">
              {filteredSessions.filter((s) => new Date(s.date) > new Date()).length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Low Availability</p>
            <p className="text-2xl font-bold text-amber-400">
              {filteredSessions.filter((s) => s.spotsRemaining < 5).length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Total Capacity</p>
            <p className="text-2xl font-bold text-cyan-400">
              {filteredSessions.reduce((sum, s) => sum + s.spotsTotal, 0)}
            </p>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-gray-800 rounded-xl border border-purple-800/50 overflow-hidden">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No events found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
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
                          <div className="flex items-center gap-3">
                            <div className="text-center w-12 py-1 bg-purple-900/30 rounded">
                              <div className="text-lg font-bold text-white">
                                {new Date(session.date).getDate()}
                              </div>
                              <div className="text-xs text-purple-400">
                                {new Date(session.date).toLocaleDateString('en-GB', { month: 'short' })}
                              </div>
                            </div>
                            <span className="text-sm text-gray-400">
                              {new Date(session.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-white font-medium">{session.course?.name}</p>
                            <p className="text-xs text-gray-500">
                              {courseCategories.find((c) => c.id === session.course?.category)?.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-300 flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            {session.time}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-300">{session.trainer}</span>
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
                            <span className="text-sm text-gray-400">
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
                            <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs font-medium">
                              Completed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingSession(session)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingSession(session)}
                              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {isUpcoming && booked === 0 && (
                              <button
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
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
