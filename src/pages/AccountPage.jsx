import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Calendar,
  Video,
  Monitor,
  Clock,
  MapPin,
  ExternalLink,
  Download,
  Edit2,
  LogOut,
  ChevronRight,
  BookOpen,
  Award,
  Mail,
  Copy,
  CheckCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { bookingService } from '../services'

function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?type=booker&return=/account')
      return
    }

    // Load user's bookings
    if (user?.email) {
      const userBookings = bookingService.getBookingsByEmail(user.email)
      setBookings(userBookings)
    }
    setLoading(false)
  }, [isAuthenticated, user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && (!b.sessionDate || new Date(b.sessionDate) > new Date())
  )

  const pastBookings = bookings.filter(
    (b) => b.status !== 'confirmed' || (b.sessionDate && new Date(b.sessionDate) <= new Date())
  )

  const elearningBookings = bookings.filter((b) => b.isElearning)

  if (!isAuthenticated) {
    return null // Redirect handled in useEffect
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Account</h1>
            <p className="text-gray-300 mt-1">
              Welcome back! Manage your bookings and course access.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2 self-start"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* User Info Card */}
        <div className="card mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Booker Account'}
              </h2>
              <p className="text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{upcomingBookings.length}</div>
            <div className="text-sm text-gray-300">Upcoming Sessions</div>
          </div>
          <div className="card text-center">
            <Monitor className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{elearningBookings.length}</div>
            <div className="text-sm text-gray-300">E-Learning Courses</div>
          </div>
          <div className="card text-center">
            <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{pastBookings.length}</div>
            <div className="text-sm text-gray-300">Completed</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
          {[
            { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
            { id: 'elearning', label: 'E-Learning', count: elearningBookings.length },
            { id: 'past', label: 'Past Bookings', count: pastBookings.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500" />
          </div>
        ) : (
          <>
            {/* Upcoming Bookings */}
            {activeTab === 'upcoming' && (
              <div className="space-y-4">
                {upcomingBookings.length === 0 ? (
                  <div className="card text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">No upcoming sessions</p>
                    <Link to="/webinars" className="btn-primary inline-flex items-center gap-2">
                      Browse Webinars
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  upcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCopy={copyToClipboard}
                      copiedId={copiedId}
                    />
                  ))
                )}
              </div>
            )}

            {/* E-Learning */}
            {activeTab === 'elearning' && (
              <div className="space-y-4">
                {elearningBookings.length === 0 ? (
                  <div className="card text-center py-12">
                    <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4">No e-learning courses purchased</p>
                    <Link to="/elearning" className="btn-primary inline-flex items-center gap-2">
                      Browse E-Learning
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  elearningBookings.map((booking) => (
                    <ElearningCard key={booking.id} booking={booking} />
                  ))
                )}
              </div>
            )}

            {/* Past Bookings */}
            {activeTab === 'past' && (
              <div className="space-y-4">
                {pastBookings.length === 0 ? (
                  <div className="card text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-300">No past bookings</p>
                  </div>
                ) : (
                  pastBookings.map((booking) => (
                    <PastBookingCard key={booking.id} booking={booking} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking, onCopy, copiedId }) {
  const sessionDate = booking.sessionDate ? new Date(booking.sessionDate) : null

  return (
    <div className="card">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-cyan-900/50 text-cyan-400 text-xs font-medium rounded inline-flex items-center gap-1">
              <Video className="w-3.5 h-3.5" />
              Live Webinar
            </span>
            <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-medium rounded">
              Confirmed
            </span>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">{booking.courseName}</h3>

          <div className="space-y-1 text-sm text-gray-300">
            {sessionDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {sessionDate.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            )}
            {booking.sessionTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {booking.sessionTime}
              </div>
            )}
            {booking.trainer && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {booking.trainer}
              </div>
            )}
          </div>

          {/* Booking Reference */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-300">Reference:</span>
              <code className="text-cyan-400 font-mono">{booking.bookingRef}</code>
              <button
                onClick={() => onCopy(booking.bookingRef, booking.id)}
                className="text-gray-300 hover:text-white"
              >
                {copiedId === booking.id ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 lg:items-end">
          {booking.zoomMeeting && (
            <a
              href={booking.zoomMeeting.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Join Session
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <Link
            to={`/account/booking/${booking.id}`}
            className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Zoom Details (collapsed by default) */}
      {booking.zoomMeeting && (
        <details className="mt-4 pt-4 border-t border-gray-700">
          <summary className="text-sm text-cyan-400 cursor-pointer hover:text-cyan-300">
            Joining Instructions
          </summary>
          <div className="mt-3 p-4 bg-gray-900 rounded-lg text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Meeting ID:</span>
              <code className="text-white font-mono">{booking.zoomMeeting.meetingId}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Password:</span>
              <code className="text-white font-mono">{booking.zoomMeeting.password}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Join Link:</span>
              <a
                href={booking.zoomMeeting.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline truncate max-w-[200px]"
              >
                {booking.zoomMeeting.joinUrl}
              </a>
            </div>
          </div>
        </details>
      )}
    </div>
  )
}

function ElearningCard({ booking }) {
  // Mock e-learning platform URL
  const elearningUrl = `https://learn.miad.co.uk/course/${booking.courseId}?ref=${booking.bookingRef}`

  return (
    <div className="card">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-medium rounded inline-flex items-center gap-1">
              <Monitor className="w-3.5 h-3.5" />
              E-Learning
            </span>
            <span className="px-2 py-1 bg-amber-900/50 text-amber-400 text-xs font-medium rounded">
              In Progress
            </span>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">{booking.courseName}</h3>

          <div className="text-sm text-gray-300">
            <p>Purchased: {new Date(booking.createdAt).toLocaleDateString('en-GB')}</p>
            <p>Access expires: {new Date(new Date(booking.createdAt).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</p>
          </div>

          {/* Progress (mock) */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-300">Progress</span>
              <span className="text-white">0%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-cyan-500" style={{ width: '0%' }} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 lg:items-end">
          <a
            href={elearningUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-green-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-cyan-700 transition-all text-sm inline-flex items-center gap-2"
          >
            <Monitor className="w-4 h-4" />
            Continue Learning
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

function PastBookingCard({ booking }) {
  return (
    <div className="card opacity-75">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              booking.isElearning
                ? 'bg-green-900/50 text-green-400'
                : 'bg-cyan-900/50 text-cyan-400'
            }`}>
              {booking.isElearning ? 'E-Learning' : 'Webinar'}
            </span>
            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs font-medium rounded">
              {booking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-white mb-1">{booking.courseName}</h3>

          <div className="text-sm text-gray-300">
            {booking.sessionDate && (
              <span>
                {new Date(booking.sessionDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
            <span className="mx-2">•</span>
            <span>Ref: {booking.bookingRef}</span>
          </div>
        </div>

        {/* Certificate Download (mock) */}
        {booking.status !== 'cancelled' && (
          <button className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2">
            <Download className="w-4 h-4" />
            Certificate
          </button>
        )}
      </div>
    </div>
  )
}

export default AccountPage
