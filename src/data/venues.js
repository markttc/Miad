// Venues & Location Management Data

// Audit event types for venue records
export const venueAuditEventTypes = [
  { id: 'venue_created', label: 'Venue Created', color: 'green', icon: 'Plus' },
  { id: 'venue_updated', label: 'Venue Updated', color: 'blue', icon: 'Edit' },
  { id: 'venue_deleted', label: 'Venue Deleted', color: 'red', icon: 'Trash2' },
  { id: 'contact_updated', label: 'Contact Updated', color: 'purple', icon: 'Phone' },
  { id: 'fee_updated', label: 'Fee Updated', color: 'amber', icon: 'PoundSterling' },
  { id: 'capacity_updated', label: 'Capacity Updated', color: 'cyan', icon: 'Users' },
  { id: 'expiry_updated', label: 'Expiry Updated', color: 'orange', icon: 'Calendar' },
]

// Initial venues data
export const initialVenues = [
  {
    id: 'venue-001',
    name: 'Manchester Conference Centre',
    contactName: 'John Davies',
    contactEmail: 'bookings@manchestercc.co.uk',
    contactPhone: '0161 234 5678',
    venueFee: 250,
    expiryDate: '2026-12-31',
    address: {
      line1: '15 Portland Street',
      line2: '',
      city: 'Manchester',
      postcode: 'M1 3BE',
    },
    trainerNotes: 'Free parking available for trainers. AV equipment provided. Request access 30 mins before session.',
    maxCapacity: 30,
    status: 'active',
    createdAt: '2023-06-15T10:00:00Z',
    auditLog: [
      { id: 'audit-v001-1', eventType: 'venue_created', timestamp: '2023-06-15T10:00:00Z', user: 'Admin', details: 'Venue record created' },
      { id: 'audit-v001-2', eventType: 'fee_updated', timestamp: '2023-09-01T14:30:00Z', user: 'Admin', details: 'Venue fee updated from £200 to £250' },
    ],
  },
  {
    id: 'venue-002',
    name: 'Birmingham Training Hub',
    contactName: 'Sarah Williams',
    contactEmail: 'info@birminghamhub.co.uk',
    contactPhone: '0121 456 7890',
    venueFee: 180,
    expiryDate: '2025-06-30',
    address: {
      line1: 'Unit 5, Enterprise Park',
      line2: 'Digbeth',
      city: 'Birmingham',
      postcode: 'B5 6HY',
    },
    trainerNotes: 'Parking limited - use NCP on Rea Street. Whiteboard markers provided. Kitchen facilities available.',
    maxCapacity: 20,
    status: 'active',
    createdAt: '2023-08-20T09:00:00Z',
    auditLog: [
      { id: 'audit-v002-1', eventType: 'venue_created', timestamp: '2023-08-20T09:00:00Z', user: 'Admin', details: 'Venue record created' },
      { id: 'audit-v002-2', eventType: 'capacity_updated', timestamp: '2024-01-15T11:00:00Z', user: 'Admin', details: 'Max capacity updated from 15 to 20' },
    ],
  },
  {
    id: 'venue-003',
    name: 'Leeds Healthcare Academy',
    contactName: 'Michael Brown',
    contactEmail: 'admin@leedshealthcare.org',
    contactPhone: '0113 345 6789',
    venueFee: 200,
    expiryDate: '2025-03-31',
    address: {
      line1: '42 Wellington Street',
      line2: 'Floor 3',
      city: 'Leeds',
      postcode: 'LS1 4DL',
    },
    trainerNotes: 'Medical simulation equipment on-site. Lift access available. Reception will provide visitor badges.',
    maxCapacity: 25,
    status: 'active',
    createdAt: '2023-04-10T14:00:00Z',
    auditLog: [
      { id: 'audit-v003-1', eventType: 'venue_created', timestamp: '2023-04-10T14:00:00Z', user: 'Admin', details: 'Venue record created' },
      { id: 'audit-v003-2', eventType: 'contact_updated', timestamp: '2024-02-20T09:30:00Z', user: 'Admin', details: 'Updated contact details' },
      { id: 'audit-v003-3', eventType: 'expiry_updated', timestamp: '2024-06-01T10:00:00Z', user: 'Admin', details: 'Contract expiry extended to March 2025' },
    ],
  },
  {
    id: 'venue-004',
    name: 'Bristol Community Centre',
    contactName: 'Emma Johnson',
    contactEmail: 'hire@bristolcc.org.uk',
    contactPhone: '0117 987 6543',
    venueFee: 150,
    expiryDate: '2025-09-30',
    address: {
      line1: '88 Gloucester Road',
      line2: '',
      city: 'Bristol',
      postcode: 'BS7 8BN',
    },
    trainerNotes: 'Street parking only. Projector available on request. Tea/coffee facilities in kitchen.',
    maxCapacity: 15,
    status: 'active',
    createdAt: '2024-01-05T11:00:00Z',
    auditLog: [
      { id: 'audit-v004-1', eventType: 'venue_created', timestamp: '2024-01-05T11:00:00Z', user: 'Admin', details: 'Venue record created' },
    ],
  },
  {
    id: 'venue-005',
    name: 'Sheffield Medical Training Centre',
    contactName: 'David Taylor',
    contactEmail: 'bookings@sheffieldmtc.nhs.uk',
    contactPhone: '0114 271 8000',
    venueFee: 0,
    expiryDate: '2025-01-31',
    address: {
      line1: 'Northern General Hospital',
      line2: 'Herries Road',
      city: 'Sheffield',
      postcode: 'S5 7AU',
    },
    trainerNotes: 'NHS partner venue - no fee. Park in staff car park with permit. Report to Education Centre reception.',
    maxCapacity: 40,
    status: 'expiring',
    createdAt: '2022-11-20T10:00:00Z',
    auditLog: [
      { id: 'audit-v005-1', eventType: 'venue_created', timestamp: '2022-11-20T10:00:00Z', user: 'Admin', details: 'Venue record created - NHS partner' },
      { id: 'audit-v005-2', eventType: 'venue_updated', timestamp: '2023-05-15T14:00:00Z', user: 'Admin', details: 'Updated trainer notes with parking information' },
      { id: 'audit-v005-3', eventType: 'expiry_updated', timestamp: '2024-01-10T09:00:00Z', user: 'Admin', details: 'Contract renewed until January 2025' },
    ],
  },
]

// Load venues from localStorage or use initial data
export function loadVenues() {
  const saved = localStorage.getItem('miad_venues')
  if (saved) {
    return JSON.parse(saved)
  }
  localStorage.setItem('miad_venues', JSON.stringify(initialVenues))
  return initialVenues
}

// Save venues to localStorage
export function saveVenues(venues) {
  localStorage.setItem('miad_venues', JSON.stringify(venues))
}

// Create an audit log entry for venues
export function createVenueAuditEntry(eventType, details, user = 'Admin') {
  return {
    id: `audit-v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    eventType,
    timestamp: new Date().toISOString(),
    user,
    details,
  }
}

// Compare two venue objects and generate audit entries for changes
export function generateVenueAuditEntriesForChanges(original, updated, user = 'Admin') {
  const entries = []

  // Check for name change
  if (original.name !== updated.name) {
    entries.push(createVenueAuditEntry(
      'venue_updated',
      `Name changed from "${original.name}" to "${updated.name}"`,
      user
    ))
  }

  // Check for contact updates
  const contactFields = ['contactName', 'contactEmail', 'contactPhone']
  const contactChanges = contactFields.filter(field => original[field] !== updated[field])
  if (contactChanges.length > 0) {
    entries.push(createVenueAuditEntry(
      'contact_updated',
      `Updated contact: ${contactChanges.join(', ')}`,
      user
    ))
  }

  // Check for fee change
  if (original.venueFee !== updated.venueFee) {
    entries.push(createVenueAuditEntry(
      'fee_updated',
      `Venue fee changed from £${original.venueFee} to £${updated.venueFee}`,
      user
    ))
  }

  // Check for expiry date change
  if (original.expiryDate !== updated.expiryDate) {
    entries.push(createVenueAuditEntry(
      'expiry_updated',
      `Expiry date changed from ${original.expiryDate} to ${updated.expiryDate}`,
      user
    ))
  }

  // Check for capacity change
  if (original.maxCapacity !== updated.maxCapacity) {
    entries.push(createVenueAuditEntry(
      'capacity_updated',
      `Max capacity changed from ${original.maxCapacity} to ${updated.maxCapacity}`,
      user
    ))
  }

  // Check for address changes
  const addressFields = ['line1', 'line2', 'city', 'postcode']
  const addressChanges = addressFields.filter(
    field => original.address?.[field] !== updated.address?.[field]
  )
  if (addressChanges.length > 0) {
    entries.push(createVenueAuditEntry(
      'venue_updated',
      `Updated address: ${addressChanges.join(', ')}`,
      user
    ))
  }

  // Check for trainer notes change
  if (original.trainerNotes !== updated.trainerNotes) {
    entries.push(createVenueAuditEntry(
      'venue_updated',
      'Updated trainer notes',
      user
    ))
  }

  // Check for status change
  if (original.status !== updated.status) {
    entries.push(createVenueAuditEntry(
      'venue_updated',
      `Status changed from ${original.status} to ${updated.status}`,
      user
    ))
  }

  return entries
}

// Get venue status based on expiry date
export function getVenueStatus(expiryDate) {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  if (expiry < now) return { status: 'expired', color: 'red' }
  if (expiry <= thirtyDays) return { status: 'expiring', color: 'amber' }
  return { status: 'active', color: 'green' }
}
