import { useState } from 'react'
import {
  X,
  Calendar,
  Clock,
  Users,
  User,
  Video,
  DollarSign,
  Tag,
  ExternalLink,
  History,
  Plus,
  Edit2,
  XCircle,
  UserCheck,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { courses, courseCategories } from '../../data/courses'
import { getSessionAuditTrail, formatAuditTimestamp } from '../../services/eventAuditService'
import { auditActionTypes, actionLabels, actionColors } from '../../data/eventAuditTrail'

function ViewEventModal({ session, onClose, onEdit }) {
  const [showAuditTrail, setShowAuditTrail] = useState(false)
  const [auditExpanded, setAuditExpanded] = useState(false)

  if (!session) return null

  const course = courses.find((c) => c.id === session.courseId)
  const category = courseCategories.find((c) => c.id === course?.category)
  const booked = session.spotsTotal - session.spotsRemaining
  const isUpcoming = new Date(session.date) > new Date()

  // Get audit trail for this session
  const auditEntries = getSessionAuditTrail(session.id)
  const displayedEntries = auditExpanded ? auditEntries : auditEntries.slice(0, 5)

  // Icon mapping for audit actions
  const getActionIcon = (action) => {
    switch (action) {
      case auditActionTypes.EVENT_CREATED:
        return <Plus className="w-4 h-4" />
      case auditActionTypes.EVENT_UPDATED:
        return <Edit2 className="w-4 h-4" />
      case auditActionTypes.EVENT_CANCELLED:
        return <XCircle className="w-4 h-4" />
      case auditActionTypes.EVENT_RESCHEDULED:
        return <Calendar className="w-4 h-4" />
      case auditActionTypes.TRAINER_CHANGED:
        return <UserCheck className="w-4 h-4" />
      case auditActionTypes.CAPACITY_CHANGED:
        return <Users className="w-4 h-4" />
      case auditActionTypes.PRICE_CHANGED:
        return <DollarSign className="w-4 h-4" />
      case auditActionTypes.BOOKING_ADDED:
        return <UserPlus className="w-4 h-4" />
      case auditActionTypes.BOOKING_CANCELLED:
        return <UserMinus className="w-4 h-4" />
      case auditActionTypes.ATTENDEE_TRANSFERRED:
        return <ArrowRightLeft className="w-4 h-4" />
      case auditActionTypes.ZOOM_LINK_ADDED:
      case auditActionTypes.ZOOM_LINK_UPDATED:
        return <Video className="w-4 h-4" />
      case auditActionTypes.NOTES_ADDED:
        return <FileText className="w-4 h-4" />
      default:
        return <Edit2 className="w-4 h-4" />
    }
  }

  // Color mapping for audit actions
  const getActionColor = (action) => {
    const color = actionColors[action] || 'gray'
    const colorMap = {
      green: 'bg-green-900/50 text-green-400 border-green-800',
      blue: 'bg-blue-900/50 text-blue-400 border-blue-800',
      red: 'bg-red-900/50 text-red-400 border-red-800',
      amber: 'bg-amber-900/50 text-amber-400 border-amber-800',
      purple: 'bg-purple-900/50 text-purple-400 border-purple-800',
      cyan: 'bg-cyan-900/50 text-cyan-400 border-cyan-800',
      gray: 'bg-gray-900/50 text-gray-300 border-gray-800',
    }
    return colorMap[color] || colorMap.gray
  }

  const getAvailabilityStatus = () => {
    const percentage = (session.spotsRemaining / session.spotsTotal) * 100
    if (percentage === 0) return { label: 'Full', color: 'red' }
    if (percentage < 25) return { label: 'Low Availability', color: 'amber' }
    if (percentage < 50) return { label: 'Filling Up', color: 'cyan' }
    return { label: 'Available', color: 'green' }
  }

  const availability = getAvailabilityStatus()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl border border-purple-800/50 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-800/50">
          <div>
            <h2 className="text-xl font-bold text-white">Event Details</h2>
            <p className="text-sm text-gray-300 mt-1">
              {isUpcoming ? 'Upcoming Event' : 'Past Event'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Course Info */}
          <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{course?.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{course?.description}</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs">
                    {category?.name}
                  </span>
                  <span className="text-xs text-gray-300">
                    Duration: {course?.duration}
                  </span>
                  <span className="text-xs text-gray-300">
                    Certification: {course?.certification}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Date</span>
              </div>
              <p className="text-white font-medium">
                {new Date(session.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Time</span>
              </div>
              <p className="text-white font-medium">{session.time}</p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <User className="w-4 h-4" />
                <span className="text-sm">Trainer</span>
              </div>
              <p className="text-white font-medium">{session.trainer}</p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <Tag className="w-4 h-4" />
                <span className="text-sm">Price</span>
              </div>
              <p className="text-white font-medium">£{session.price} per delegate</p>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span className="text-sm">Bookings</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                availability.color === 'red' ? 'bg-red-900/50 text-red-400' :
                availability.color === 'amber' ? 'bg-amber-900/50 text-amber-400' :
                availability.color === 'cyan' ? 'bg-cyan-900/50 text-cyan-400' :
                'bg-green-900/50 text-green-400'
              }`}>
                {availability.label}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      availability.color === 'red' ? 'bg-red-500' :
                      availability.color === 'amber' ? 'bg-amber-500' :
                      availability.color === 'cyan' ? 'bg-cyan-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(booked / session.spotsTotal) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{booked} / {session.spotsTotal}</p>
                <p className="text-xs text-gray-300">{session.spotsRemaining} spots remaining</p>
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <Video className="w-4 h-4" />
              <span className="text-sm">Delivery Method</span>
            </div>
            <p className="text-white font-medium capitalize">{session.deliveryMethod}</p>
            {session.zoomLink && (
              <a
                href={session.zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm mt-2"
              >
                Join Link <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Audit Trail Section */}
          <div className="bg-gray-900/50 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAuditTrail(!showAuditTrail)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2 text-gray-300">
                <History className="w-4 h-4" />
                <span className="text-sm font-medium">Audit Trail</span>
                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">
                  {auditEntries.length} entries
                </span>
              </div>
              {showAuditTrail ? (
                <ChevronUp className="w-5 h-5 text-gray-300" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-300" />
              )}
            </button>

            {showAuditTrail && (
              <div className="border-t border-gray-800">
                {auditEntries.length === 0 ? (
                  <div className="p-4 text-center text-gray-300 text-sm">
                    No audit entries found for this event
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-gray-800">
                      {displayedEntries.map((entry) => (
                        <div key={entry.id} className="p-4 hover:bg-gray-800/30">
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={`p-2 rounded-lg ${getActionColor(entry.action)}`}>
                              {getActionIcon(entry.action)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-white font-medium text-sm">
                                  {actionLabels[entry.action] || entry.action}
                                </p>
                                <span className="text-xs text-gray-300 whitespace-nowrap">
                                  {formatAuditTimestamp(entry.timestamp)}
                                </span>
                              </div>

                              {/* Changes display */}
                              {(entry.previousValue || entry.newValue) && (
                                <div className="mt-1 text-xs">
                                  {entry.previousValue && (
                                    <span className="text-red-400 line-through mr-2">
                                      {entry.previousValue}
                                    </span>
                                  )}
                                  {entry.newValue && (
                                    <span className="text-green-400">
                                      {entry.newValue}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Details */}
                              {entry.details && Object.keys(entry.details).length > 0 && (
                                <div className="mt-1 text-xs text-gray-300">
                                  {entry.details.attendeeName && (
                                    <span>Attendee: {entry.details.attendeeName}</span>
                                  )}
                                  {entry.details.bookingRef && (
                                    <span className="ml-2">Ref: {entry.details.bookingRef}</span>
                                  )}
                                  {entry.details.reason && (
                                    <span>Reason: {entry.details.reason}</span>
                                  )}
                                  {entry.details.note && (
                                    <span>{entry.details.note}</span>
                                  )}
                                </div>
                              )}

                              {/* Performed by */}
                              <p className="mt-1 text-xs text-gray-600">
                                by {entry.performedBy}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Show more/less button */}
                    {auditEntries.length > 5 && (
                      <div className="p-3 border-t border-gray-800">
                        <button
                          onClick={() => setAuditExpanded(!auditExpanded)}
                          className="w-full text-center text-sm text-purple-400 hover:text-purple-300"
                        >
                          {auditExpanded
                            ? `Show less`
                            : `Show ${auditEntries.length - 5} more entries`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-purple-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Close
          </button>
          {isUpcoming && (
            <button
              onClick={() => {
                onClose()
                onEdit(session)
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Edit Event
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewEventModal
