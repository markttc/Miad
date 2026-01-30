import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronRight,
  Calendar,
  Clock,
  Users,
  UserCheck,
  UserX,
  CheckCircle,
  AlertCircle,
  Search,
  Download,
  Mail,
  Phone,
  Building,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { upcomingSessions, courses } from '../../data/courses'
import {
  attendanceStatuses,
  loadTrainingRegister,
  updateAttendance,
  loadTrainers,
} from '../../data/trainers'
import MiadLogo from '../../assets/miad-logo.svg'

function TrainingRegisterPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [selectedSessionId, setSelectedSessionId] = useState(searchParams.get('session') || '')
  const [register, setRegister] = useState(loadTrainingRegister())
  const [bookings, setBookings] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const trainers = loadTrainers()

  useEffect(() => {
    // Load bookings for selected session
    if (selectedSessionId) {
      const allBookings = JSON.parse(localStorage.getItem('miad_bookings') || '[]')
      const sessionBookings = allBookings.filter((b) => b.sessionId === selectedSessionId)
      setBookings(sessionBookings)
    } else {
      setBookings([])
    }
  }, [selectedSessionId])

  if (!isAdmin) {
    navigate('/login?type=admin')
    return null
  }

  // Get sessions sorted by date
  const sessions = useMemo(() => {
    return upcomingSessions
      .map((session) => ({
        ...session,
        course: courses.find((c) => c.id === session.courseId),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [])

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (!searchQuery) return bookings
    const query = searchQuery.toLowerCase()
    return bookings.filter((booking) =>
      booking.attendee?.firstName?.toLowerCase().includes(query) ||
      booking.attendee?.lastName?.toLowerCase().includes(query) ||
      booking.attendee?.email?.toLowerCase().includes(query) ||
      booking.bookingRef?.toLowerCase().includes(query)
    )
  }, [bookings, searchQuery])

  // Calculate stats for selected session
  const stats = useMemo(() => {
    if (!selectedSessionId) return null

    const sessionRegister = register[selectedSessionId] || {}
    const total = bookings.length
    const pending = bookings.filter((b) => !sessionRegister[b.id] || sessionRegister[b.id].status === 'pending').length
    const completed = bookings.filter((b) => sessionRegister[b.id]?.status === 'completed').length
    const noShow = bookings.filter((b) => sessionRegister[b.id]?.status === 'no-show').length
    const incomplete = bookings.filter((b) => sessionRegister[b.id]?.status === 'incomplete').length
    const arrived = bookings.filter((b) => sessionRegister[b.id]?.status === 'arrived').length

    return { total, pending, arrived, completed, noShow, incomplete }
  }, [bookings, register, selectedSessionId])

  // Handle attendance update
  const handleAttendanceChange = (bookingId, status) => {
    const updatedRegister = updateAttendance(selectedSessionId, bookingId, status)
    setRegister(updatedRegister)
  }

  // Get status for a booking
  const getBookingStatus = (bookingId) => {
    return register[selectedSessionId]?.[bookingId]?.status || 'pending'
  }

  // Get status config
  const getStatusConfig = (status) => {
    return attendanceStatuses.find((s) => s.id === status) || attendanceStatuses[0]
  }

  // Get trainer for session
  const getSessionTrainer = (session) => {
    return trainers.find((t) =>
      `${t.firstName} ${t.lastName}` === session.trainer
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-purple-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-6">
            <Link to="/">
              <img src={MiadLogo} alt="Miad Healthcare" className="h-7" />
            </Link>
            <div className="border-l border-gray-700 pl-6">
              <div className="flex items-center gap-2 text-sm text-white mb-1">
                <Link to="/admin" className="hover:text-white">Dashboard</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/admin/trainers" className="hover:text-white">Trainers</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">Training Register</span>
              </div>
              <h1 className="text-xl font-bold text-white">Digital Training Register</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Session Selector */}
        <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Select Session</h2>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Choose a session...</option>
            {sessions.map((session) => {
              const isPast = new Date(session.date) < new Date()
              return (
                <option key={session.id} value={session.id}>
                  {new Date(session.date).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })} - {session.course?.name} ({session.time}) {isPast ? '(Past)' : ''}
                </option>
              )
            })}
          </select>
        </div>

        {selectedSession && (
          <>
            {/* Session Info */}
            <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedSession.course?.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-white">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedSession.date).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedSession.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedSession.trainer}
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" />
                  Export Register
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
                <p className="text-sm text-white">Total</p>
                <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-white">Pending</p>
                <p className="text-2xl font-bold text-white">{stats?.pending || 0}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-green-800/50">
                <p className="text-sm text-white">Completed</p>
                <p className="text-2xl font-bold text-green-400">{stats?.completed || 0}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-red-800/50">
                <p className="text-sm text-white">No Show</p>
                <p className="text-2xl font-bold text-red-400">{stats?.noShow || 0}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-amber-800/50">
                <p className="text-sm text-white">Incomplete</p>
                <p className="text-2xl font-bold text-amber-400">{stats?.incomplete || 0}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              <input
                type="text"
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Attendees List */}
            <div className="bg-gray-800 rounded-xl border border-purple-800/50 overflow-hidden">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-white">
                    {bookings.length === 0 ? 'No bookings for this session' : 'No matching attendees found'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-white border-b border-gray-700">
                        <th className="px-4 py-3 font-medium">Reference</th>
                        <th className="px-4 py-3 font-medium">Attendee</th>
                        <th className="px-4 py-3 font-medium">Organisation</th>
                        <th className="px-4 py-3 font-medium">Contact</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredBookings.map((booking) => {
                        const currentStatus = getBookingStatus(booking.id)
                        const statusConfig = getStatusConfig(currentStatus)

                        return (
                          <tr key={booking.id} className="hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3">
                              <code className="text-purple-400 font-mono text-sm">
                                {booking.bookingRef}
                              </code>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-white font-medium">
                                {booking.attendee?.firstName} {booking.attendee?.lastName}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-white text-sm flex items-center gap-1">
                                <Building className="w-4 h-4 text-white" />
                                {booking.attendee?.organisation || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <p className="text-xs text-white flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {booking.attendee?.email}
                                </p>
                                <p className="text-xs text-white flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {booking.attendee?.phone}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${
                                statusConfig.color === 'green' ? 'bg-green-900/50 text-green-400' :
                                statusConfig.color === 'red' ? 'bg-red-900/50 text-red-400' :
                                statusConfig.color === 'amber' ? 'bg-amber-900/50 text-amber-400' :
                                statusConfig.color === 'blue' ? 'bg-blue-900/50 text-blue-400' :
                                'bg-gray-700 text-white'
                              }`}>
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleAttendanceChange(booking.id, 'arrived')}
                                  className={`p-2 rounded transition-colors ${
                                    currentStatus === 'arrived'
                                      ? 'bg-blue-900/50 text-blue-400'
                                      : 'text-white hover:text-blue-400 hover:bg-gray-700'
                                  }`}
                                  title="Mark as Arrived"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleAttendanceChange(booking.id, 'completed')}
                                  className={`p-2 rounded transition-colors ${
                                    currentStatus === 'completed'
                                      ? 'bg-green-900/50 text-green-400'
                                      : 'text-white hover:text-green-400 hover:bg-gray-700'
                                  }`}
                                  title="Mark as Completed"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleAttendanceChange(booking.id, 'no-show')}
                                  className={`p-2 rounded transition-colors ${
                                    currentStatus === 'no-show'
                                      ? 'bg-red-900/50 text-red-400'
                                      : 'text-white hover:text-red-400 hover:bg-gray-700'
                                  }`}
                                  title="Mark as No Show"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleAttendanceChange(booking.id, 'incomplete')}
                                  className={`p-2 rounded transition-colors ${
                                    currentStatus === 'incomplete'
                                      ? 'bg-amber-900/50 text-amber-400'
                                      : 'text-white hover:text-amber-400 hover:bg-gray-700'
                                  }`}
                                  title="Mark as Did Not Complete"
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </button>
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

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-white">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>Arrived</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Completed Successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-red-400" />
                <span>No Show</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Did Not Complete</span>
              </div>
            </div>
          </>
        )}

        {!selectedSession && (
          <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-white">Select a session above to view and manage the training register</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrainingRegisterPage
