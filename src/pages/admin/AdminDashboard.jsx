import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronRight,
  Video,
  Monitor,
  PoundSterling,
  LogOut,
  Building,
  Settings,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { bookingService } from '../../services'
import { upcomingSessions, courses } from '../../data/courses'
import MiadLogo from '../../assets/miad-logo.svg'

function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingSessions: 0,
    totalRevenue: 0,
    elearningEnrollments: 0,
  })

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login?type=admin')
      return
    }

    // Load stats from localStorage bookings
    const allBookings = JSON.parse(localStorage.getItem('miad_bookings') || '[]')
    const upcoming = upcomingSessions.filter((s) => new Date(s.date) > new Date())

    setStats({
      totalBookings: allBookings.length,
      upcomingSessions: upcoming.length,
      totalRevenue: allBookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0),
      elearningEnrollments: allBookings.filter((b) => b.isElearning).length,
    })
  }, [isAdmin, navigate])

  if (!isAdmin) return null

  const recentBookings = JSON.parse(localStorage.getItem('miad_bookings') || '[]')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const upcomingSessionsList = upcomingSessions
    .filter((s) => new Date(s.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <div className="bg-gray-800 border-b border-purple-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/">
                <img src={MiadLogo} alt="Miad Healthcare" className="h-7" />
              </Link>
              <div className="border-l border-gray-700 pl-6">
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-white">Welcome back, {user?.name || 'Admin'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  logout()
                  navigate('/login?type=admin')
                }}
                className="flex items-center gap-2 px-4 py-2 text-white hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Users}
            color="cyan"
            link="/admin/bookings"
          />
          <StatCard
            title="Upcoming Sessions"
            value={stats.upcomingSessions}
            icon={Calendar}
            color="purple"
            link="/admin/events"
          />
          <StatCard
            title="E-Learning Enrollments"
            value={stats.elearningEnrollments}
            icon={Monitor}
            color="green"
            link="/admin/bookings?type=elearning"
          />
          <StatCard
            title="Revenue"
            value={`£${stats.totalRevenue.toLocaleString()}`}
            icon={PoundSterling}
            color="amber"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            title="Event Management"
            description="Create and schedule training sessions"
            icon={Calendar}
            link="/admin/events"
            color="purple"
          />
          <QuickActionCard
            title="View Bookings"
            description="Manage all course bookings"
            icon={BookOpen}
            link="/admin/bookings"
            color="cyan"
          />
          <QuickActionCard
            title="Course Admin"
            description="Manage course catalogue"
            icon={LayoutDashboard}
            link="/admin/courses"
            color="green"
          />
          <QuickActionCard
            title="Trainers & Supply Chain"
            description="Manage trainers and registers"
            icon={Users}
            link="/admin/trainers"
            color="purple"
          />
          <QuickActionCard
            title="Venue Management"
            description="Manage training venues"
            icon={Building}
            link="/admin/venues"
            color="cyan"
          />
          <QuickActionCard
            title="System Configuration"
            description="Integrations, comms & features"
            icon={Settings}
            link="/admin/system"
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Bookings</h2>
              <Link
                to="/admin/bookings"
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-white">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        booking.isElearning ? 'bg-green-900/50' : 'bg-cyan-900/50'
                      }`}>
                        {booking.isElearning ? (
                          <Monitor className="w-5 h-5 text-green-400" />
                        ) : (
                          <Video className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {booking.attendee?.firstName} {booking.attendee?.lastName}
                        </p>
                        <p className="text-xs text-white">{booking.courseName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        £{booking.payment?.amount}
                      </p>
                      <p className="text-xs text-white">
                        {new Date(booking.createdAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Upcoming Sessions</h2>
              <Link
                to="/admin/events"
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {upcomingSessionsList.length === 0 ? (
              <div className="text-center py-8 text-white">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessionsList.map((session) => {
                  const course = courses.find((c) => c.id === session.courseId)
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center w-12 py-1 bg-purple-900/50 rounded">
                          <div className="text-lg font-bold text-white">
                            {new Date(session.date).getDate()}
                          </div>
                          <div className="text-xs text-purple-400">
                            {new Date(session.date).toLocaleDateString('en-GB', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{course?.name}</p>
                          <p className="text-xs text-white">
                            {session.time} • {session.trainer}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">
                          {session.spotsTotal - session.spotsRemaining} / {session.spotsTotal}
                        </p>
                        <p className="text-xs text-white">booked</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Alerts Section */}
        <div className="mt-6 bg-amber-900/20 border border-amber-800/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-300">Action Required</h3>
              <p className="text-sm text-amber-200/70 mt-1">
                3 sessions have low availability (less than 5 spots). Consider adding more sessions or promoting these courses.
              </p>
              <Link
                to="/admin/events?filter=low-availability"
                className="text-sm text-amber-400 hover:underline mt-2 inline-block"
              >
                View sessions →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, link }) {
  const colorClasses = {
    cyan: 'bg-cyan-900/30 border-cyan-800/50 text-cyan-400',
    purple: 'bg-purple-900/30 border-purple-800/50 text-purple-400',
    green: 'bg-green-900/30 border-green-800/50 text-green-400',
    amber: 'bg-amber-900/30 border-amber-800/50 text-amber-400',
  }

  const content = (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </div>
  )

  if (link) {
    return <Link to={link}>{content}</Link>
  }

  return content
}

function QuickActionCard({ title, description, icon: Icon, link, color }) {
  const colorClasses = {
    purple: 'from-purple-600 to-pink-600',
    cyan: 'from-cyan-600 to-blue-600',
    green: 'from-green-600 to-cyan-600',
  }

  return (
    <Link
      to={link}
      className="bg-gray-800 rounded-xl border border-purple-800/50 p-6 hover:border-purple-600 transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-white mt-1">{description}</p>
      <div className="mt-4 text-purple-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
        Open <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  )
}

export default AdminDashboard
