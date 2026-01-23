// Attendee Audit Trail Data
// Per-attendee audit log tracking who made bookings, payments, and communications

const STORAGE_KEY = 'miad_attendee_audit_trail'

// Audit action types for attendee-level events
export const attendeeAuditActions = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_MODIFIED: 'booking_modified',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_REFUNDED: 'payment_refunded',
  EMAIL_SENT: 'email_sent',
  SMS_SENT: 'sms_sent',
  CERTIFICATE_ISSUED: 'certificate_issued',
  ATTENDANCE_MARKED: 'attendance_marked',
}

// Human-readable action labels
export const actionLabels = {
  [attendeeAuditActions.BOOKING_CREATED]: 'Booking Created',
  [attendeeAuditActions.BOOKING_CANCELLED]: 'Booking Cancelled',
  [attendeeAuditActions.BOOKING_MODIFIED]: 'Booking Modified',
  [attendeeAuditActions.PAYMENT_RECEIVED]: 'Payment Received',
  [attendeeAuditActions.PAYMENT_REFUNDED]: 'Payment Refunded',
  [attendeeAuditActions.EMAIL_SENT]: 'Email Sent',
  [attendeeAuditActions.SMS_SENT]: 'SMS Sent',
  [attendeeAuditActions.CERTIFICATE_ISSUED]: 'Certificate Issued',
  [attendeeAuditActions.ATTENDANCE_MARKED]: 'Attendance Marked',
}

// Action colors for badges
export const actionColors = {
  [attendeeAuditActions.BOOKING_CREATED]: 'green',
  [attendeeAuditActions.BOOKING_CANCELLED]: 'red',
  [attendeeAuditActions.BOOKING_MODIFIED]: 'blue',
  [attendeeAuditActions.PAYMENT_RECEIVED]: 'green',
  [attendeeAuditActions.PAYMENT_REFUNDED]: 'amber',
  [attendeeAuditActions.EMAIL_SENT]: 'cyan',
  [attendeeAuditActions.SMS_SENT]: 'purple',
  [attendeeAuditActions.CERTIFICATE_ISSUED]: 'green',
  [attendeeAuditActions.ATTENDANCE_MARKED]: 'blue',
}

// Mock attendee audit entries
const mockAuditEntries = [
  {
    id: 'att-audit-001',
    timestamp: '2026-01-20T09:15:00Z',
    bookingRef: 'MHT-ABC123',
    action: attendeeAuditActions.BOOKING_CREATED,

    attendee: {
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma.wilson@nhs.net',
      phone: '07700 123456',
      organisation: 'Sunrise Care Home',
    },

    bookedBy: {
      type: 'ttc_employee',
      name: 'Admin User',
      role: 'admin',
    },

    source: {
      channel: 'offline',
      notes: 'Phone booking - customer called main line',
    },

    payment: {
      taken: true,
      amount: 95.0,
      method: 'card',
      transactionRef: 'TXN-20260120-001',
    },

    course: {
      name: 'Basic Life Support (BLS)',
      date: '2026-02-15',
      time: '09:00 - 13:00',
    },

    communications: [
      { type: 'email', template: 'booking_confirmation', sentAt: '2026-01-20T09:20:00Z', status: 'delivered' },
      { type: 'sms', template: 'booking_reminder', sentAt: '2026-02-14T09:00:00Z', status: 'delivered' },
    ],
  },
  {
    id: 'att-audit-002',
    timestamp: '2026-01-19T14:30:00Z',
    bookingRef: 'MHT-DEF456',
    action: attendeeAuditActions.BOOKING_CREATED,

    attendee: {
      firstName: 'James',
      lastName: 'Thompson',
      email: 'j.thompson@careservices.co.uk',
      phone: '07800 234567',
      organisation: 'Meadowbrook Healthcare',
    },

    bookedBy: {
      type: 'attendee_self',
      name: 'James Thompson',
      role: 'customer',
    },

    source: {
      channel: 'online',
      ipAddress: '86.134.22.156',
    },

    payment: {
      taken: true,
      amount: 125.0,
      method: 'card',
      transactionRef: 'TXN-20260119-002',
    },

    course: {
      name: 'Safeguarding Adults Level 3',
      date: '2026-02-22',
      time: '09:00 - 17:00',
    },

    communications: [
      { type: 'email', template: 'booking_confirmation', sentAt: '2026-01-19T14:35:00Z', status: 'delivered' },
      { type: 'email', template: 'payment_receipt', sentAt: '2026-01-19T14:35:00Z', status: 'delivered' },
    ],
  },
  {
    id: 'att-audit-003',
    timestamp: '2026-01-18T11:00:00Z',
    bookingRef: 'MHT-GHI789',
    action: attendeeAuditActions.BOOKING_CREATED,

    attendee: {
      firstName: 'Sarah',
      lastName: 'Davies',
      email: 's.davies@healthgroup.com',
      phone: '07900 345678',
      organisation: 'Greenfield NHS Trust',
    },

    bookedBy: {
      type: 'customer_admin',
      name: 'Linda Peters',
      role: 'compliance_manager',
    },

    source: {
      channel: 'online',
      ipAddress: '194.74.65.200',
    },

    payment: {
      taken: false,
      amount: 95.0,
      method: 'purchase_order',
      poNumber: 'PO-2026-0042',
    },

    course: {
      name: 'Manual Handling',
      date: '2026-02-20',
      time: '09:00 - 13:00',
    },

    communications: [
      { type: 'email', template: 'booking_confirmation', sentAt: '2026-01-18T11:05:00Z', status: 'delivered' },
    ],
  },
  {
    id: 'att-audit-004',
    timestamp: '2026-01-17T16:45:00Z',
    bookingRef: 'MHT-JKL012',
    action: attendeeAuditActions.BOOKING_CREATED,

    attendee: {
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'mbrown@nhs.net',
      phone: '07400 456789',
      organisation: 'Castle View Care Home',
    },

    bookedBy: {
      type: 'attendee_self',
      name: 'Michael Brown',
      role: 'customer',
    },

    source: {
      channel: 'online',
      ipAddress: '92.41.178.45',
    },

    payment: {
      taken: true,
      amount: 150.0,
      method: 'card',
      transactionRef: 'TXN-20260117-004',
    },

    course: {
      name: 'Medication Administration',
      date: '2026-02-25',
      time: '09:00 - 17:00',
    },

    communications: [
      { type: 'email', template: 'booking_confirmation', sentAt: '2026-01-17T16:50:00Z', status: 'delivered' },
      { type: 'sms', template: 'booking_confirmation_sms', sentAt: '2026-01-17T16:50:00Z', status: 'delivered' },
    ],
  },
  {
    id: 'att-audit-005',
    timestamp: '2026-01-16T10:20:00Z',
    bookingRef: 'MHT-MNO345',
    action: attendeeAuditActions.BOOKING_CREATED,

    attendee: {
      firstName: 'Sophie',
      lastName: 'Clark',
      email: 'sophie.clark@medicalcentre.org.uk',
      phone: '07500 567890',
      organisation: 'Valley Medical Practice',
    },

    bookedBy: {
      type: 'ttc_employee',
      name: 'Admin User',
      role: 'admin',
    },

    source: {
      channel: 'offline',
      notes: 'Email request from customer',
    },

    payment: {
      taken: false,
      amount: 95.0,
      method: 'pending',
    },

    course: {
      name: 'Basic Life Support (BLS)',
      date: '2026-03-01',
      time: '09:00 - 13:00',
    },

    communications: [
      { type: 'email', template: 'booking_confirmation', sentAt: '2026-01-16T10:25:00Z', status: 'delivered' },
    ],
  },
  {
    id: 'att-audit-006',
    timestamp: '2026-01-15T14:00:00Z',
    bookingRef: 'MHT-PQR678',
    action: attendeeAuditActions.BOOKING_CREATED,

    attendee: {
      firstName: 'Oliver',
      lastName: 'Harris',
      email: 'o.harris@careservices.co.uk',
      phone: '07700 678901',
      organisation: 'Bluebell Care Services',
    },

    bookedBy: {
      type: 'customer_admin',
      name: 'Tom Richardson',
      role: 'training_coordinator',
    },

    source: {
      channel: 'online',
      ipAddress: '185.12.45.89',
    },

    payment: {
      taken: true,
      amount: 175.0,
      method: 'bacs',
      transactionRef: 'BACS-20260115-006',
    },

    course: {
      name: 'Infection Prevention & Control',
      date: '2026-02-28',
      time: '09:00 - 17:00',
    },

    communications: [
      { type: 'email', template: 'booking_confirmation', sentAt: '2026-01-15T14:05:00Z', status: 'delivered' },
      { type: 'email', template: 'payment_received', sentAt: '2026-01-15T14:30:00Z', status: 'delivered' },
    ],
  },
  {
    id: 'att-audit-007',
    timestamp: '2026-01-14T09:30:00Z',
    bookingRef: 'MHT-STU901',
    action: attendeeAuditActions.BOOKING_CREATED,

    attendee: {
      firstName: 'Charlotte',
      lastName: 'Evans',
      email: 'charlotte.e@nhs.net',
      phone: '07800 789012',
      organisation: 'Riverside Community Hospital',
    },

    bookedBy: {
      type: 'attendee_self',
      name: 'Charlotte Evans',
      role: 'customer',
    },

    source: {
      channel: 'online',
      ipAddress: '78.150.32.100',
    },

    payment: {
      taken: true,
      amount: 95.0,
      method: 'card',
      transactionRef: 'TXN-20260114-007',
    },

    course: {
      name: 'Moving & Handling People',
      date: '2026-02-18',
      time: '09:00 - 13:00',
    },

    communications: [
      { type: 'email', template: 'booking_confirmation', sentAt: '2026-01-14T09:35:00Z', status: 'delivered' },
    ],
  },
  {
    id: 'att-audit-008',
    timestamp: '2026-01-13T15:45:00Z',
    bookingRef: 'MHT-VWX234',
    action: attendeeAuditActions.BOOKING_CANCELLED,

    attendee: {
      firstName: 'Daniel',
      lastName: 'Roberts',
      email: 'd.roberts@healthgroup.com',
      phone: '07900 890123',
      organisation: 'Harmony Health Group',
    },

    bookedBy: {
      type: 'ttc_employee',
      name: 'Admin User',
      role: 'admin',
    },

    source: {
      channel: 'offline',
      notes: 'Customer requested cancellation via phone',
    },

    payment: {
      taken: true,
      amount: 95.0,
      method: 'card',
      refunded: true,
      refundAmount: 95.0,
    },

    course: {
      name: 'Fire Safety Awareness',
      date: '2026-02-12',
      time: '09:00 - 12:00',
    },

    communications: [
      { type: 'email', template: 'cancellation_confirmation', sentAt: '2026-01-13T15:50:00Z', status: 'delivered' },
      { type: 'email', template: 'refund_confirmation', sentAt: '2026-01-13T16:00:00Z', status: 'delivered' },
    ],
  },
]

// Load audit entries from localStorage
export function loadAttendeeAuditEntries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load attendee audit entries:', e)
  }
  return mockAuditEntries
}

// Save audit entries to localStorage
export function saveAttendeeAuditEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (e) {
    console.error('Failed to save attendee audit entries:', e)
  }
}

// Initialize/seed audit data
export function initializeAttendeeAuditData() {
  const entries = loadAttendeeAuditEntries()
  if (entries.length === 0 || !entries[0].bookedBy) {
    saveAttendeeAuditEntries(mockAuditEntries)
    return mockAuditEntries
  }
  return entries
}

// Add a new audit entry
export function addAttendeeAuditEntry(entry) {
  const entries = loadAttendeeAuditEntries()
  const newEntry = {
    ...entry,
    id: `att-audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
  }
  entries.unshift(newEntry)
  saveAttendeeAuditEntries(entries)
  return newEntry
}

// Add communication to an existing entry
export function addCommunicationToAuditEntry(entryId, communication) {
  const entries = loadAttendeeAuditEntries()
  const entry = entries.find((e) => e.id === entryId)
  if (entry) {
    if (!entry.communications) {
      entry.communications = []
    }
    entry.communications.push({
      ...communication,
      sentAt: new Date().toISOString(),
    })
    saveAttendeeAuditEntries(entries)
    return entry
  }
  return null
}

// Get audit entries by booking reference
export function getAuditEntriesByBookingRef(bookingRef) {
  const entries = loadAttendeeAuditEntries()
  return entries.filter((e) => e.bookingRef === bookingRef)
}

// Get audit entries by attendee email
export function getAuditEntriesByAttendeeEmail(email) {
  const entries = loadAttendeeAuditEntries()
  return entries.filter((e) => e.attendee.email.toLowerCase() === email.toLowerCase())
}

// Get audit statistics
export function getAuditStats() {
  const entries = loadAttendeeAuditEntries()
  return {
    total: entries.length,
    byBookerType: {
      ttc_employee: entries.filter((e) => e.bookedBy?.type === 'ttc_employee').length,
      attendee_self: entries.filter((e) => e.bookedBy?.type === 'attendee_self').length,
      customer_admin: entries.filter((e) => e.bookedBy?.type === 'customer_admin').length,
    },
    bySource: {
      online: entries.filter((e) => e.source?.channel === 'online').length,
      offline: entries.filter((e) => e.source?.channel === 'offline').length,
    },
    byPayment: {
      paid: entries.filter((e) => e.payment?.taken).length,
      pending: entries.filter((e) => !e.payment?.taken).length,
    },
  }
}

export default {
  attendeeAuditActions,
  actionLabels,
  actionColors,
  loadAttendeeAuditEntries,
  saveAttendeeAuditEntries,
  initializeAttendeeAuditData,
  addAttendeeAuditEntry,
  addCommunicationToAuditEntry,
  getAuditEntriesByBookingRef,
  getAuditEntriesByAttendeeEmail,
  getAuditStats,
}
