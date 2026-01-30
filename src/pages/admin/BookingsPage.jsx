import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronRight,
  Search,
  Filter,
  Users,
  Video,
  Monitor,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  Eye,
  Send,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  Plus,
  CreditCard,
  FileText,
  Ban,
  History,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { reseedBookingsData } from '../../data/bookings'
import DateTimeSlicer from '../../components/admin/DateTimeSlicer'
import AdminCreateBookingModal from '../../components/admin/AdminCreateBookingModal'
import CancelBookingModal from '../../components/admin/CancelBookingModal'
import MiadLogo from '../../assets/miad-logo.svg'

function BookingsPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState(null)

  const loadBookings = () => {
    const allBookings = reseedBookingsData()
    setBookings(allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  }

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login?type=admin')
      return
    }

    loadBookings()
    setLoading(false)
  }, [isAdmin, navigate])

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          booking.bookingRef?.toLowerCase().includes(query) ||
          booking.attendee?.firstName?.toLowerCase().includes(query) ||
          booking.attendee?.lastName?.toLowerCase().includes(query) ||
          booking.attendee?.email?.toLowerCase().includes(query) ||
          booking.courseName?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Type filter
      if (typeFilter === 'webinar' && booking.isElearning) return false
      if (typeFilter === 'elearning' && !booking.isElearning) return false

      // Status filter
      if (statusFilter !== 'all' && booking.status !== statusFilter) return false

      // Payment method filter
      if (paymentFilter !== 'all') {
        const method = booking.payment?.method || 'card'
        if (paymentFilter === 'card' && method !== 'card') return false
        if (paymentFilter === 'po' && method !== 'purchase_order' && method !== 'invoice') return false
      }

      // Date range filter
      if (dateFilter) {
        const bookingDate = booking.sessionDate
          ? new Date(booking.sessionDate)
          : new Date(booking.createdAt)
        if (bookingDate < dateFilter.start || bookingDate > dateFilter.end) {
          return false
        }
      }

      return true
    })
  }, [bookings, searchQuery, typeFilter, statusFilter, paymentFilter, dateFilter])

  const stats = useMemo(() => ({
    total: bookings.length,
    webinars: bookings.filter((b) => !b.isElearning).length,
    elearning: bookings.filter((b) => b.isElearning).length,
    revenue: bookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0),
  }), [bookings])

  if (!isAdmin) return null

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
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                <Link to="/admin" className="hover:text-white">Dashboard</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">Bookings</span>
              </div>
              <h1 className="text-xl font-bold text-white">Booking Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">Total Bookings</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">Webinar Bookings</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.webinars}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">E-Learning</p>
            <p className="text-2xl font-bold text-green-400">{stats.elearning}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">Total Revenue</p>
            <p className="text-2xl font-bold text-amber-400">£{stats.revenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="text"
              placeholder="Search by name, email, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <DateTimeSlicer onChange={setDateFilter} />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Types</option>
            <option value="webinar">Webinars</option>
            <option value="elearning">E-Learning</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Payments</option>
            <option value="card">Card</option>
            <option value="po">Purchase Order</option>
          </select>

          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>

          <Link
            to="/admin/bookings/audit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
          >
            <History className="w-4 h-4" />
            Audit Trail
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#13d8a0] hover:bg-[#0fb88a] text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Booking
          </button>
        </div>

        {/* Bookings Table */}
        <div className="bg-gray-800 rounded-xl border border-purple-800/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-300">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-300 border-b border-gray-700">
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Attendee</th>
                    <th className="px-4 py-3 font-medium">Course</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="text-purple-400 font-mono text-sm">
                          {booking.bookingRef}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">
                            {booking.attendee?.firstName} {booking.attendee?.lastName}
                          </p>
                          <p className="text-xs text-gray-300">{booking.attendee?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-300 max-w-[200px] truncate">
                          {booking.courseName}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {booking.isElearning ? (
                          <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-medium rounded inline-flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            E-Learning
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-cyan-900/50 text-cyan-400 text-xs font-medium rounded inline-flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            Webinar
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {booking.sessionDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-300" />
                            {new Date(booking.sessionDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-300">Immediate</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">
                          £{booking.payment?.amount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {booking.payment?.method === 'purchase_order' || booking.payment?.method === 'invoice' ? (
                          <span className="px-2 py-1 bg-amber-900/50 text-amber-400 text-xs font-medium rounded inline-flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            PO
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-medium rounded inline-flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            Card
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {booking.status === 'confirmed' ? (
                          <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-medium rounded inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs font-medium rounded inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-300 hover:text-[#13d8a0] hover:bg-gray-700 rounded transition-colors"
                            title="Resend Confirmation"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => setBookingToCancel(booking)}
                              className="p-2 text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                              title="Cancel Booking"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={(booking) => {
            setSelectedBooking(null)
            setBookingToCancel(booking)
          }}
        />
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <AdminCreateBookingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadBookings()
          }}
        />
      )}

      {/* Cancel Booking Modal */}
      {bookingToCancel && (
        <CancelBookingModal
          booking={bookingToCancel}
          onClose={() => setBookingToCancel(null)}
          onCancel={async (cancelData) => {
            // Import dynamically to avoid circular dependencies
            const { cancelBookingWithRefund } = await import('../../services/bookingService')
            await cancelBookingWithRefund(cancelData.bookingId, {
              reason: cancelData.reason,
              issueRefund: cancelData.issueRefund,
              refundAmount: cancelData.refundAmount,
              adminUser: 'Admin User',
            })
            loadBookings()
          }}
        />
      )}
    </div>
  )
}

function BookingDetailModal({ booking, onClose, onCancel }) {
  const isPOPayment = booking.payment?.method === 'purchase_order' || booking.payment?.method === 'invoice'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl border border-purple-800/50 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Reference */}
        <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-800/50">
          <p className="text-sm text-gray-300">Booking Reference</p>
          <p className="text-2xl font-mono font-bold text-purple-400">{booking.bookingRef}</p>
        </div>

        {/* Attendee Info */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-3">
            Attendee Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-300">Name</p>
              <p className="text-white">
                {booking.attendee?.firstName} {booking.attendee?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Email</p>
              <p className="text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-300" />
                {booking.attendee?.email}
              </p>
            </div>
            {booking.attendee?.phone && (
              <div>
                <p className="text-sm text-gray-300">Phone</p>
                <p className="text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-300" />
                  {booking.attendee.phone}
                </p>
              </div>
            )}
            {booking.attendee?.organisation && (
              <div>
                <p className="text-sm text-gray-300">Organisation</p>
                <p className="text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-300" />
                  {booking.attendee.organisation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Course Info */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-3">
            Course Details
          </h3>
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <p className="text-white font-medium">{booking.courseName}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                {booking.isElearning ? (
                  <><Monitor className="w-4 h-4" /> E-Learning</>
                ) : (
                  <><Video className="w-4 h-4" /> Webinar</>
                )}
              </span>
              {booking.sessionDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(booking.sessionDate).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
              {booking.sessionTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {booking.sessionTime}
                </span>
              )}
            </div>
            {booking.trainer && (
              <p className="text-sm text-gray-300 mt-2">Trainer: {booking.trainer}</p>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-3">
            Payment
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-300">Amount</p>
              <p className="text-xl font-bold text-white">£{booking.payment?.amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-300">Method</p>
              {isPOPayment ? (
                <span className="px-2 py-1 bg-amber-900/50 text-amber-400 text-xs font-medium rounded inline-flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Purchase Order
                </span>
              ) : (
                <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-medium rounded inline-flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  Card
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-300">Status</p>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                booking.payment?.status === 'refunded' || booking.payment?.status === 'partial_refund'
                  ? 'bg-red-900/50 text-red-400'
                  : 'bg-green-900/50 text-green-400'
              }`}>
                {booking.payment?.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-300">Booked</p>
              <p className="text-white text-sm">
                {new Date(booking.createdAt).toLocaleString('en-GB')}
              </p>
            </div>
          </div>

          {/* PO Details */}
          {isPOPayment && booking.payment?.purchaseOrder && (
            <div className="mt-4 p-3 bg-amber-900/20 rounded-lg border border-amber-800/50">
              <p className="text-xs text-amber-400 font-medium mb-2">Purchase Order Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-300">PO Number</p>
                  <p className="text-white font-mono">{booking.payment.purchaseOrder.poNumber}</p>
                </div>
                <div>
                  <p className="text-gray-300">Account</p>
                  <p className="text-white">{booking.payment.purchaseOrder.customerAccountName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Refund Details */}
          {booking.payment?.refund && (
            <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-800/50">
              <p className="text-xs text-red-400 font-medium mb-2">Refund Information</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-300">Refund Amount</p>
                  <p className="text-white">£{booking.payment.refund.amount}</p>
                </div>
                <div>
                  <p className="text-gray-300">Status</p>
                  <p className="text-white capitalize">{booking.payment.refund.status}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-300">Reason</p>
                  <p className="text-white">{booking.payment.refund.reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Zoom Info */}
        {booking.zoomMeeting && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-3">
              Zoom Meeting
            </h3>
            <div className="p-4 bg-cyan-900/20 rounded-lg border border-cyan-800/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-300">Meeting ID</p>
                  <code className="text-cyan-400">{booking.zoomMeeting.meetingId}</code>
                </div>
                <div>
                  <p className="text-gray-300">Password</p>
                  <code className="text-cyan-400">{booking.zoomMeeting.password}</code>
                </div>
              </div>
              <a
                href={booking.zoomMeeting.joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-cyan-400 hover:underline text-sm inline-block"
              >
                {booking.zoomMeeting.joinUrl}
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Resend Confirmation
          </button>
          <button className="flex-1 bg-[#13d8a0] hover:bg-[#0fb88a] text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Download Invoice
          </button>
          {booking.status === 'confirmed' && (
            <button
              onClick={() => onCancel(booking)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Ban className="w-4 h-4" />
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingsPage
