import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Search,
  Download,
  Eye,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  MessageSquare,
  Globe,
  PhoneCall,
  User,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  loadAttendeeAuditEntries,
  initializeAttendeeAuditData,
  actionLabels,
  actionColors,
  getAuditStats,
} from '../../data/attendeeAuditData'
import DateTimeSlicer from '../../components/admin/DateTimeSlicer'
import MiadLogo from '../../assets/miad-logo.svg'

function AttendeeAuditPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [auditEntries, setAuditEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookerTypeFilter, setBookerTypeFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login?type=admin')
      return
    }

    initializeAttendeeAuditData()
    const entries = loadAttendeeAuditEntries()
    setAuditEntries(entries)
    setLoading(false)
  }, [isAdmin, navigate])

  // Filter entries
  const filteredEntries = useMemo(() => {
    return auditEntries.filter((entry) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          entry.bookingRef?.toLowerCase().includes(query) ||
          entry.attendee?.firstName?.toLowerCase().includes(query) ||
          entry.attendee?.lastName?.toLowerCase().includes(query) ||
          entry.attendee?.email?.toLowerCase().includes(query) ||
          entry.attendee?.organisation?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Booker type filter
      if (bookerTypeFilter !== 'all' && entry.bookedBy?.type !== bookerTypeFilter) {
        return false
      }

      // Source filter
      if (sourceFilter !== 'all' && entry.source?.channel !== sourceFilter) {
        return false
      }

      // Payment filter
      if (paymentFilter !== 'all') {
        if (paymentFilter === 'paid' && !entry.payment?.taken) return false
        if (paymentFilter === 'pending' && entry.payment?.taken) return false
      }

      // Date filter
      if (dateFilter) {
        const entryDate = new Date(entry.timestamp)
        if (entryDate < dateFilter.start || entryDate > dateFilter.end) {
          return false
        }
      }

      return true
    })
  }, [auditEntries, searchQuery, bookerTypeFilter, sourceFilter, paymentFilter, dateFilter])

  const stats = useMemo(() => getAuditStats(), [auditEntries])

  const handleExport = () => {
    const headers = [
      'Timestamp',
      'Booking Ref',
      'Attendee Name',
      'Email',
      'Organisation',
      'Booked By Type',
      'Booked By Name',
      'Source',
      'Payment Status',
      'Amount',
      'Payment Method',
      'Comms Sent',
      'Course',
      'Date',
    ]

    const rows = filteredEntries.map((entry) => [
      new Date(entry.timestamp).toISOString(),
      entry.bookingRef,
      `${entry.attendee?.firstName} ${entry.attendee?.lastName}`,
      entry.attendee?.email,
      entry.attendee?.organisation,
      entry.bookedBy?.type,
      entry.bookedBy?.name,
      entry.source?.channel,
      entry.payment?.taken ? 'Paid' : 'Pending',
      entry.payment?.amount,
      entry.payment?.method,
      entry.communications?.length || 0,
      entry.course?.name,
      entry.course?.date,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendee-audit-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const bookerTypeLabels = {
    ttc_employee: 'Miad Employee',
    attendee_self: 'Self-booking',
    customer_admin: 'Customer Admin',
  }

  const bookerTypeBadgeColors = {
    ttc_employee: 'bg-purple-900/50 text-purple-400',
    attendee_self: 'bg-cyan-900/50 text-cyan-400',
    customer_admin: 'bg-blue-900/50 text-blue-400',
  }

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
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <Link to="/admin" className="hover:text-white">Dashboard</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/admin/bookings" className="hover:text-white">Bookings</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">Attendee Audit</span>
              </div>
              <h1 className="text-xl font-bold text-white">Attendee Audit Trail</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Total Entries</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Online Bookings</p>
            <p className="text-2xl font-bold text-green-400">{stats.bySource.online}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Offline Bookings</p>
            <p className="text-2xl font-bold text-amber-400">{stats.bySource.offline}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Self-bookings</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.byBookerType.attendee_self}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, booking ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Search audit entries"
            />
          </div>

          <DateTimeSlicer onChange={setDateFilter} />

          <select
            value={bookerTypeFilter}
            onChange={(e) => setBookerTypeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Filter by booker type"
          >
            <option value="all">All Booker Types</option>
            <option value="ttc_employee">Miad Employee</option>
            <option value="attendee_self">Self-booking</option>
            <option value="customer_admin">Customer Admin</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Filter by source"
          >
            <option value="all">All Sources</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Filter by payment status"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-400">
          Showing {filteredEntries.length} of {auditEntries.length} entries
        </div>

        {/* Audit Table */}
        <div className="bg-gray-800 rounded-xl border border-purple-800/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No audit entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                    <th scope="col" className="px-4 py-3 font-medium">Timestamp</th>
                    <th scope="col" className="px-4 py-3 font-medium">Booking Ref</th>
                    <th scope="col" className="px-4 py-3 font-medium">Attendee</th>
                    <th scope="col" className="px-4 py-3 font-medium">Booked By</th>
                    <th scope="col" className="px-4 py-3 font-medium">Source</th>
                    <th scope="col" className="px-4 py-3 font-medium">Payment</th>
                    <th scope="col" className="px-4 py-3 font-medium">Comms</th>
                    <th scope="col" className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <div className="text-gray-300">
                          {new Date(entry.timestamp).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-purple-400 font-mono text-sm">{entry.bookingRef}</code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">
                          {entry.attendee?.firstName} {entry.attendee?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{entry.attendee?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${bookerTypeBadgeColors[entry.bookedBy?.type] || 'bg-gray-700 text-gray-400'}`}>
                          {bookerTypeLabels[entry.bookedBy?.type] || entry.bookedBy?.type}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">{entry.bookedBy?.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        {entry.source?.channel === 'online' ? (
                          <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-medium rounded inline-flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Online
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-amber-900/50 text-amber-400 text-xs font-medium rounded inline-flex items-center gap-1">
                            <PhoneCall className="w-3 h-3" />
                            Offline
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {entry.payment?.taken ? (
                          <div>
                            <span className="text-green-400 font-medium">
                              £{entry.payment.amount}
                            </span>
                            <div className="text-xs text-gray-500 capitalize">
                              {entry.payment.method === 'purchase_order' ? 'PO' : entry.payment.method}
                            </div>
                          </div>
                        ) : (
                          <span className="text-amber-400">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(entry.communications?.filter((c) => c.type === 'email').length || 0) > 0 && (
                            <span className="flex items-center gap-1 text-gray-400" title="Emails sent">
                              <Mail className="w-4 h-4" />
                              <span className="text-xs">
                                {entry.communications.filter((c) => c.type === 'email').length}
                              </span>
                            </span>
                          )}
                          {(entry.communications?.filter((c) => c.type === 'sms').length || 0) > 0 && (
                            <span className="flex items-center gap-1 text-gray-400" title="SMS sent">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-xs">
                                {entry.communications.filter((c) => c.type === 'sms').length}
                              </span>
                            </span>
                          )}
                          {(!entry.communications || entry.communications.length === 0) && (
                            <span className="text-gray-500 text-xs">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                          title="View Details"
                          aria-label={`View details for ${entry.attendee?.firstName} ${entry.attendee?.lastName}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <AuditDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  )
}

function AuditDetailModal({ entry, onClose }) {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const bookerTypeLabels = {
    ttc_employee: 'Miad Employee',
    attendee_self: 'Self-booking',
    customer_admin: 'Customer Admin',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl border border-purple-800/50 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Audit Entry Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Booking Reference */}
        <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-800/50">
          <p className="text-sm text-gray-400">Booking Reference</p>
          <p className="text-2xl font-mono font-bold text-purple-400">{entry.bookingRef}</p>
        </div>

        {/* Attendee Details */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
            Attendee Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-white flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                {entry.attendee?.firstName} {entry.attendee?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                {entry.attendee?.email}
              </p>
            </div>
            {entry.attendee?.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {entry.attendee.phone}
                </p>
              </div>
            )}
            {entry.attendee?.organisation && (
              <div>
                <p className="text-sm text-gray-500">Organisation</p>
                <p className="text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  {entry.attendee.organisation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
              Booked By
            </h3>
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="text-white">{bookerTypeLabels[entry.bookedBy?.type]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="text-white">{entry.bookedBy?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="text-white capitalize">{entry.bookedBy?.role}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
              Booking Source
            </h3>
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Channel</span>
                <span className="text-white capitalize">{entry.source?.channel}</span>
              </div>
              {entry.source?.ipAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-500">IP Address</span>
                  <span className="text-white font-mono text-sm">{entry.source.ipAddress}</span>
                </div>
              )}
              {entry.source?.notes && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Notes</span>
                  <span className="text-white text-sm">{entry.source.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
            Payment Details
          </h3>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 text-xs font-medium rounded ${entry.payment?.taken ? 'bg-green-900/50 text-green-400' : 'bg-amber-900/50 text-amber-400'}`}>
                  {entry.payment?.taken ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-xl font-bold text-white">£{entry.payment?.amount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Method</p>
                <span className="text-white flex items-center gap-2">
                  {entry.payment?.method === 'card' && <CreditCard className="w-4 h-4" />}
                  {entry.payment?.method === 'purchase_order' && <FileText className="w-4 h-4" />}
                  <span className="capitalize">
                    {entry.payment?.method === 'purchase_order' ? 'Purchase Order' : entry.payment?.method}
                  </span>
                </span>
              </div>
              {entry.payment?.transactionRef && (
                <div>
                  <p className="text-sm text-gray-500">Transaction Ref</p>
                  <code className="text-white font-mono text-sm">{entry.payment.transactionRef}</code>
                </div>
              )}
              {entry.payment?.poNumber && (
                <div>
                  <p className="text-sm text-gray-500">PO Number</p>
                  <code className="text-white font-mono text-sm">{entry.payment.poNumber}</code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
            Course Details
          </h3>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-white font-medium mb-2">{entry.course?.name}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {entry.course?.date && new Date(entry.course.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {entry.course?.time}
              </span>
            </div>
          </div>
        </div>

        {/* Communications */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
            Communications ({entry.communications?.length || 0})
          </h3>
          {!entry.communications || entry.communications.length === 0 ? (
            <div className="bg-gray-900/50 rounded-lg p-4 text-gray-500 text-center">
              No communications sent yet
            </div>
          ) : (
            <div className="space-y-3">
              {entry.communications.map((comm, idx) => (
                <div
                  key={idx}
                  className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-purple-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {comm.type === 'email' ? (
                        <Mail className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-green-400" />
                      )}
                      <span className="text-white font-medium capitalize">{comm.type}</span>
                      <span className="text-gray-500">-</span>
                      <span className="text-gray-400">{comm.template?.replace(/_/g, ' ')}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      comm.status === 'delivered'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-amber-900/50 text-amber-400'
                    }`}>
                      {comm.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Sent: {new Date(comm.sentAt).toLocaleString('en-GB')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
          Entry created: {new Date(entry.timestamp).toLocaleString('en-GB')}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-[#13d8a0] hover:bg-[#0fb88a] text-white rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default AttendeeAuditPage
