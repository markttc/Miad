// Event Audit Trail Data
// Stores audit entries for all event/session changes

const STORAGE_KEY = 'miad_event_audit_trail'

// Audit action types
export const auditActionTypes = {
  EVENT_CREATED: 'event_created',
  EVENT_UPDATED: 'event_updated',
  EVENT_CANCELLED: 'event_cancelled',
  EVENT_RESCHEDULED: 'event_rescheduled',
  TRAINER_CHANGED: 'trainer_changed',
  CAPACITY_CHANGED: 'capacity_changed',
  PRICE_CHANGED: 'price_changed',
  BOOKING_ADDED: 'booking_added',
  BOOKING_CANCELLED: 'booking_cancelled',
  ATTENDEE_TRANSFERRED: 'attendee_transferred',
  ZOOM_LINK_ADDED: 'zoom_link_added',
  ZOOM_LINK_UPDATED: 'zoom_link_updated',
  NOTES_ADDED: 'notes_added',
}

// Human-readable action labels
export const actionLabels = {
  [auditActionTypes.EVENT_CREATED]: 'Event Created',
  [auditActionTypes.EVENT_UPDATED]: 'Event Updated',
  [auditActionTypes.EVENT_CANCELLED]: 'Event Cancelled',
  [auditActionTypes.EVENT_RESCHEDULED]: 'Event Rescheduled',
  [auditActionTypes.TRAINER_CHANGED]: 'Trainer Changed',
  [auditActionTypes.CAPACITY_CHANGED]: 'Capacity Changed',
  [auditActionTypes.PRICE_CHANGED]: 'Price Changed',
  [auditActionTypes.BOOKING_ADDED]: 'Booking Added',
  [auditActionTypes.BOOKING_CANCELLED]: 'Booking Cancelled',
  [auditActionTypes.ATTENDEE_TRANSFERRED]: 'Attendee Transferred',
  [auditActionTypes.ZOOM_LINK_ADDED]: 'Zoom Link Added',
  [auditActionTypes.ZOOM_LINK_UPDATED]: 'Zoom Link Updated',
  [auditActionTypes.NOTES_ADDED]: 'Note Added',
}

// Action icons (for use with lucide-react)
export const actionIcons = {
  [auditActionTypes.EVENT_CREATED]: 'Plus',
  [auditActionTypes.EVENT_UPDATED]: 'Edit2',
  [auditActionTypes.EVENT_CANCELLED]: 'XCircle',
  [auditActionTypes.EVENT_RESCHEDULED]: 'Calendar',
  [auditActionTypes.TRAINER_CHANGED]: 'UserCheck',
  [auditActionTypes.CAPACITY_CHANGED]: 'Users',
  [auditActionTypes.PRICE_CHANGED]: 'DollarSign',
  [auditActionTypes.BOOKING_ADDED]: 'UserPlus',
  [auditActionTypes.BOOKING_CANCELLED]: 'UserMinus',
  [auditActionTypes.ATTENDEE_TRANSFERRED]: 'ArrowRightLeft',
  [auditActionTypes.ZOOM_LINK_ADDED]: 'Video',
  [auditActionTypes.ZOOM_LINK_UPDATED]: 'Video',
  [auditActionTypes.NOTES_ADDED]: 'FileText',
}

// Action colors
export const actionColors = {
  [auditActionTypes.EVENT_CREATED]: 'green',
  [auditActionTypes.EVENT_UPDATED]: 'blue',
  [auditActionTypes.EVENT_CANCELLED]: 'red',
  [auditActionTypes.EVENT_RESCHEDULED]: 'amber',
  [auditActionTypes.TRAINER_CHANGED]: 'purple',
  [auditActionTypes.CAPACITY_CHANGED]: 'cyan',
  [auditActionTypes.PRICE_CHANGED]: 'amber',
  [auditActionTypes.BOOKING_ADDED]: 'green',
  [auditActionTypes.BOOKING_CANCELLED]: 'red',
  [auditActionTypes.ATTENDEE_TRANSFERRED]: 'purple',
  [auditActionTypes.ZOOM_LINK_ADDED]: 'blue',
  [auditActionTypes.ZOOM_LINK_UPDATED]: 'blue',
  [auditActionTypes.NOTES_ADDED]: 'gray',
}

// Mock initial audit data
const mockAuditEntries = [
  {
    id: 'audit_001',
    sessionId: 'session-001',
    action: auditActionTypes.EVENT_CREATED,
    timestamp: '2026-01-10T09:00:00Z',
    performedBy: 'Admin User',
    details: {
      courseName: 'Basic Life Support (BLS)',
      date: '2026-02-15',
      trainer: 'Dr Sarah Mitchell',
    },
    previousValue: null,
    newValue: null,
  },
  {
    id: 'audit_002',
    sessionId: 'session-001',
    action: auditActionTypes.TRAINER_CHANGED,
    timestamp: '2026-01-12T14:30:00Z',
    performedBy: 'Admin User',
    details: {
      reason: 'Original trainer unavailable',
    },
    previousValue: 'James Thompson',
    newValue: 'Dr Sarah Mitchell',
  },
  {
    id: 'audit_003',
    sessionId: 'session-001',
    action: auditActionTypes.BOOKING_ADDED,
    timestamp: '2026-01-15T11:20:00Z',
    performedBy: 'System',
    details: {
      attendeeName: 'John Smith',
      attendeeEmail: 'john.smith@nhs.net',
      bookingRef: 'BK-2026-001',
    },
    previousValue: null,
    newValue: null,
  },
  {
    id: 'audit_004',
    sessionId: 'session-001',
    action: auditActionTypes.CAPACITY_CHANGED,
    timestamp: '2026-01-18T09:45:00Z',
    performedBy: 'Admin User',
    details: {
      reason: 'Increased demand',
    },
    previousValue: '15',
    newValue: '20',
  },
  {
    id: 'audit_005',
    sessionId: 'session-002',
    action: auditActionTypes.EVENT_CREATED,
    timestamp: '2026-01-08T10:00:00Z',
    performedBy: 'Admin User',
    details: {
      courseName: 'Manual Handling',
      date: '2026-02-20',
      trainer: 'Emma Roberts',
    },
    previousValue: null,
    newValue: null,
  },
  {
    id: 'audit_006',
    sessionId: 'session-002',
    action: auditActionTypes.PRICE_CHANGED,
    timestamp: '2026-01-14T16:00:00Z',
    performedBy: 'Admin User',
    details: {
      reason: 'Early bird pricing ended',
    },
    previousValue: '£75',
    newValue: '£95',
  },
  {
    id: 'audit_007',
    sessionId: 'session-003',
    action: auditActionTypes.EVENT_CREATED,
    timestamp: '2026-01-05T11:00:00Z',
    performedBy: 'Admin User',
    details: {
      courseName: 'Safeguarding Adults',
      date: '2026-02-22',
      trainer: 'Dr Helen Clarke',
    },
    previousValue: null,
    newValue: null,
  },
  {
    id: 'audit_008',
    sessionId: 'session-003',
    action: auditActionTypes.BOOKING_ADDED,
    timestamp: '2026-01-16T10:15:00Z',
    performedBy: 'System',
    details: {
      attendeeName: 'Sarah Williams',
      attendeeEmail: 'sarah.williams@careuk.org',
      bookingRef: 'BK-2026-002',
    },
    previousValue: null,
    newValue: null,
  },
  {
    id: 'audit_009',
    sessionId: 'session-003',
    action: auditActionTypes.BOOKING_ADDED,
    timestamp: '2026-01-17T14:30:00Z',
    performedBy: 'System',
    details: {
      attendeeName: 'Michael Brown',
      attendeeEmail: 'mbrown@nhs.net',
      bookingRef: 'BK-2026-003',
    },
    previousValue: null,
    newValue: null,
  },
  {
    id: 'audit_010',
    sessionId: 'session-004',
    action: auditActionTypes.EVENT_CREATED,
    timestamp: '2026-01-06T09:30:00Z',
    performedBy: 'Admin User',
    details: {
      courseName: 'Medication Administration',
      date: '2026-02-25',
      trainer: 'Dr Michael Foster',
    },
    previousValue: null,
    newValue: null,
  },
  {
    id: 'audit_011',
    sessionId: 'session-004',
    action: auditActionTypes.EVENT_RESCHEDULED,
    timestamp: '2026-01-19T11:00:00Z',
    performedBy: 'Admin User',
    details: {
      previousDate: '2026-02-24',
      previousTime: '09:00 - 13:00',
    },
    previousValue: '2026-02-24 09:00 - 13:00',
    newValue: '2026-02-25 09:00 - 13:00',
  },
]

// Load audit entries from localStorage
export function loadAuditEntries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load audit entries:', e)
  }
  return mockAuditEntries
}

// Save audit entries to localStorage
export function saveAuditEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (e) {
    console.error('Failed to save audit entries:', e)
  }
}

// Initialize/seed audit data if empty or outdated
export function initializeAuditData() {
  const entries = loadAuditEntries()
  // Check if we have the newer mock data (with session-001 format)
  const hasNewFormat = entries.some((e) => e.sessionId && e.sessionId.includes('-00'))
  if (entries.length === 0 || !hasNewFormat) {
    saveAuditEntries(mockAuditEntries)
    return mockAuditEntries
  }
  return entries
}

export default {
  auditActionTypes,
  actionLabels,
  actionIcons,
  actionColors,
  loadAuditEntries,
  saveAuditEntries,
  initializeAuditData,
}
