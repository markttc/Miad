// Event Audit Trail Service
// Manages audit entries for event/session changes

import {
  loadAuditEntries,
  saveAuditEntries,
  auditActionTypes,
  actionLabels,
  actionColors,
  initializeAuditData,
} from '../data/eventAuditTrail'

// Initialize audit data on first import
initializeAuditData()

// Get all audit entries for a specific session
export function getSessionAuditTrail(sessionId) {
  const entries = loadAuditEntries()
  return entries
    .filter((entry) => entry.sessionId === sessionId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

// Get all audit entries (optionally filtered)
export function getAllAuditEntries(filters = {}) {
  let entries = loadAuditEntries()

  if (filters.sessionId) {
    entries = entries.filter((e) => e.sessionId === filters.sessionId)
  }

  if (filters.action) {
    entries = entries.filter((e) => e.action === filters.action)
  }

  if (filters.performedBy) {
    entries = entries.filter((e) =>
      e.performedBy.toLowerCase().includes(filters.performedBy.toLowerCase())
    )
  }

  if (filters.startDate) {
    entries = entries.filter((e) => new Date(e.timestamp) >= new Date(filters.startDate))
  }

  if (filters.endDate) {
    entries = entries.filter((e) => new Date(e.timestamp) <= new Date(filters.endDate))
  }

  return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

// Add a new audit entry
export function addAuditEntry({
  sessionId,
  action,
  performedBy = 'System',
  details = {},
  previousValue = null,
  newValue = null,
}) {
  const entries = loadAuditEntries()

  const newEntry = {
    id: `audit_${Date.now()}`,
    sessionId,
    action,
    timestamp: new Date().toISOString(),
    performedBy,
    details,
    previousValue,
    newValue,
  }

  entries.push(newEntry)
  saveAuditEntries(entries)

  return newEntry
}

// Log event creation
export function logEventCreated(sessionId, eventData, performedBy = 'Admin User') {
  return addAuditEntry({
    sessionId,
    action: auditActionTypes.EVENT_CREATED,
    performedBy,
    details: {
      courseName: eventData.courseName,
      date: eventData.date,
      time: eventData.time,
      trainer: eventData.trainer,
      capacity: eventData.capacity,
      price: eventData.price,
    },
  })
}

// Log event update with field comparison
export function logEventUpdated(sessionId, previousData, newData, performedBy = 'Admin User') {
  const changes = []
  const auditEntries = []

  // Check for date/time changes (rescheduled)
  if (previousData.date !== newData.date || previousData.time !== newData.time) {
    const entry = addAuditEntry({
      sessionId,
      action: auditActionTypes.EVENT_RESCHEDULED,
      performedBy,
      details: {
        previousDate: previousData.date,
        previousTime: previousData.time,
      },
      previousValue: `${previousData.date} ${previousData.time}`,
      newValue: `${newData.date} ${newData.time}`,
    })
    auditEntries.push(entry)
    changes.push('date/time')
  }

  // Check for trainer change
  if (previousData.trainer !== newData.trainer) {
    const entry = addAuditEntry({
      sessionId,
      action: auditActionTypes.TRAINER_CHANGED,
      performedBy,
      details: {},
      previousValue: previousData.trainer,
      newValue: newData.trainer,
    })
    auditEntries.push(entry)
    changes.push('trainer')
  }

  // Check for capacity change
  if (previousData.spotsTotal !== newData.spotsTotal) {
    const entry = addAuditEntry({
      sessionId,
      action: auditActionTypes.CAPACITY_CHANGED,
      performedBy,
      details: {},
      previousValue: String(previousData.spotsTotal),
      newValue: String(newData.spotsTotal),
    })
    auditEntries.push(entry)
    changes.push('capacity')
  }

  // Check for price change
  if (previousData.price !== newData.price) {
    const entry = addAuditEntry({
      sessionId,
      action: auditActionTypes.PRICE_CHANGED,
      performedBy,
      details: {},
      previousValue: `£${previousData.price}`,
      newValue: `£${newData.price}`,
    })
    auditEntries.push(entry)
    changes.push('price')
  }

  // Check for course change
  if (previousData.courseId !== newData.courseId) {
    const entry = addAuditEntry({
      sessionId,
      action: auditActionTypes.EVENT_UPDATED,
      performedBy,
      details: {
        field: 'course',
      },
      previousValue: previousData.courseName || previousData.courseId,
      newValue: newData.courseName || newData.courseId,
    })
    auditEntries.push(entry)
    changes.push('course')
  }

  // If no specific changes detected, log generic update
  if (auditEntries.length === 0) {
    const entry = addAuditEntry({
      sessionId,
      action: auditActionTypes.EVENT_UPDATED,
      performedBy,
      details: {
        note: 'Event details updated',
      },
    })
    auditEntries.push(entry)
  }

  return { changes, auditEntries }
}

// Log event cancellation
export function logEventCancelled(sessionId, reason, performedBy = 'Admin User') {
  return addAuditEntry({
    sessionId,
    action: auditActionTypes.EVENT_CANCELLED,
    performedBy,
    details: {
      reason,
    },
  })
}

// Log booking added
export function logBookingAdded(sessionId, bookingData, performedBy = 'System') {
  return addAuditEntry({
    sessionId,
    action: auditActionTypes.BOOKING_ADDED,
    performedBy,
    details: {
      attendeeName: `${bookingData.firstName} ${bookingData.lastName}`,
      attendeeEmail: bookingData.email,
      bookingRef: bookingData.bookingRef,
      amount: bookingData.amount,
    },
  })
}

// Log booking cancelled
export function logBookingCancelled(sessionId, bookingData, reason, performedBy = 'Admin User') {
  return addAuditEntry({
    sessionId,
    action: auditActionTypes.BOOKING_CANCELLED,
    performedBy,
    details: {
      attendeeName: bookingData.attendeeName,
      attendeeEmail: bookingData.attendeeEmail,
      bookingRef: bookingData.bookingRef,
      reason,
      refundIssued: bookingData.refundIssued || false,
    },
  })
}

// Log zoom link added/updated
export function logZoomLinkUpdated(sessionId, zoomLink, isNew = false, performedBy = 'Admin User') {
  return addAuditEntry({
    sessionId,
    action: isNew ? auditActionTypes.ZOOM_LINK_ADDED : auditActionTypes.ZOOM_LINK_UPDATED,
    performedBy,
    details: {
      zoomLink,
    },
  })
}

// Log note added
export function logNoteAdded(sessionId, note, performedBy = 'Admin User') {
  return addAuditEntry({
    sessionId,
    action: auditActionTypes.NOTES_ADDED,
    performedBy,
    details: {
      note,
    },
  })
}

// Get audit summary for a session
export function getAuditSummary(sessionId) {
  const entries = getSessionAuditTrail(sessionId)

  const summary = {
    totalEntries: entries.length,
    lastUpdated: entries.length > 0 ? entries[0].timestamp : null,
    actionCounts: {},
    recentActivity: entries.slice(0, 5),
  }

  entries.forEach((entry) => {
    const label = actionLabels[entry.action] || entry.action
    summary.actionCounts[label] = (summary.actionCounts[label] || 0) + 1
  })

  return summary
}

// Format timestamp for display
export function formatAuditTimestamp(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }) + ' at ' + date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default {
  getSessionAuditTrail,
  getAllAuditEntries,
  addAuditEntry,
  logEventCreated,
  logEventUpdated,
  logEventCancelled,
  logBookingAdded,
  logBookingCancelled,
  logZoomLinkUpdated,
  logNoteAdded,
  getAuditSummary,
  formatAuditTimestamp,
}
