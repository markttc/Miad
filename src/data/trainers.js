// Trainers & Supply Chain Data

// Audit event types for trainer records
export const auditEventTypes = [
  { id: 'profile_update', label: 'Profile Update', color: 'blue', icon: 'User' },
  { id: 'status_change', label: 'Status Change', color: 'amber', icon: 'Shield' },
  { id: 'availability_update', label: 'Availability Update', color: 'green', icon: 'Calendar' },
  { id: 'qualification_added', label: 'Qualification Added', color: 'purple', icon: 'Award' },
  { id: 'qualification_removed', label: 'Qualification Removed', color: 'red', icon: 'Trash2' },
  { id: 'billing_update', label: 'Billing Update', color: 'cyan', icon: 'Landmark' },
  { id: 'trainer_created', label: 'Trainer Created', color: 'green', icon: 'UserPlus' },
]

// Qualification types that trainers can hold
export const qualificationTypes = [
  { id: 'bls-instructor', name: 'BLS Instructor Certificate', courses: ['basic-life-support'] },
  { id: 'manual-handling-trainer', name: 'Manual Handling Trainer', courses: ['manual-handling'] },
  { id: 'fire-safety-trainer', name: 'Fire Safety Trainer Certificate', courses: ['fire-safety'] },
  { id: 'safeguarding-trainer', name: 'Safeguarding Trainer Level 3', courses: ['safeguarding-adults', 'safeguarding-children'] },
  { id: 'medication-trainer', name: 'Medication Administration Trainer', courses: ['medication-administration'] },
  { id: 'wound-care-specialist', name: 'Wound Care Specialist Certification', courses: ['wound-care'] },
  { id: 'infection-control-trainer', name: 'Infection Prevention Trainer', courses: ['infection-prevention'] },
  { id: 'mental-health-trainer', name: 'Mental Health First Aid Instructor', courses: ['mental-health-awareness', 'suicide-prevention'] },
  { id: 'dementia-trainer', name: 'Dementia Care Trainer', courses: ['dementia-awareness'] },
  { id: 'leadership-trainer', name: 'Leadership & Management Trainer', courses: ['team-leadership', 'conflict-resolution'] },
]

// Delivery preference options
export const deliveryPreferences = [
  { id: 'digital', label: 'Digital Only', icon: 'Video' },
  { id: 'classroom', label: 'Classroom Only', icon: 'Building' },
  { id: 'both', label: 'Both Digital & Classroom', icon: 'Layers' },
]

// Attendance status options for training register
export const attendanceStatuses = [
  { id: 'pending', label: 'Pending', color: 'gray', icon: 'Clock' },
  { id: 'arrived', label: 'Arrived', color: 'blue', icon: 'UserCheck' },
  { id: 'completed', label: 'Completed Successfully', color: 'green', icon: 'CheckCircle' },
  { id: 'no-show', label: 'No Show', color: 'red', icon: 'UserX' },
  { id: 'incomplete', label: 'Did Not Complete', color: 'amber', icon: 'AlertCircle' },
]

// Generate mock trainers data
export const initialTrainers = [
  {
    id: 'trainer-001',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@miadtraining.co.uk',
    phone: '07700 123456',
    status: 'active',
    address: {
      line1: '45 Oak Street',
      line2: '',
      city: 'Manchester',
      postcode: 'M1 4BT',
    },
    deliveryPreference: 'both',
    workingRadius: 50, // miles
    qualifications: [
      { typeId: 'bls-instructor', obtainedDate: '2023-03-15', expiryDate: '2026-03-15', certificateRef: 'BLS-2023-1234' },
      { typeId: 'medication-trainer', obtainedDate: '2022-08-20', expiryDate: '2025-08-20', certificateRef: 'MED-2022-5678' },
    ],
    availability: {}, // Will be populated by trainer
    billing: {
      vatRegistered: true,
      companyType: 'Sole Trader',
      accountName: 'Sarah Mitchell',
      sortCode: '12-34-56',
      accountNumber: '12345678',
    },
    notes: 'Highly experienced trainer with NHS background',
    createdAt: '2023-01-15T10:00:00Z',
    auditLog: [
      { id: 'audit-001-1', eventType: 'trainer_created', timestamp: '2023-01-15T10:00:00Z', user: 'Admin', details: 'Trainer record created' },
      { id: 'audit-001-2', eventType: 'status_change', timestamp: '2023-01-20T14:30:00Z', user: 'Admin', details: 'Status changed from pending to active' },
      { id: 'audit-001-3', eventType: 'qualification_added', timestamp: '2023-03-15T09:00:00Z', user: 'Admin', details: 'Added BLS Instructor Certificate' },
      { id: 'audit-001-4', eventType: 'availability_update', timestamp: '2023-06-10T11:20:00Z', user: 'Sarah Mitchell', details: 'Updated availability for June 2023' },
      { id: 'audit-001-5', eventType: 'billing_update', timestamp: '2023-08-05T16:45:00Z', user: 'Admin', details: 'Updated bank details' },
    ],
  },
  {
    id: 'trainer-002',
    firstName: 'James',
    lastName: 'Thompson',
    email: 'james.thompson@miadtraining.co.uk',
    phone: '07800 234567',
    status: 'active',
    address: {
      line1: '12 Maple Avenue',
      line2: 'Flat 3',
      city: 'Birmingham',
      postcode: 'B15 2TT',
    },
    deliveryPreference: 'digital',
    workingRadius: 0,
    qualifications: [
      { typeId: 'bls-instructor', obtainedDate: '2024-01-10', expiryDate: '2027-01-10', certificateRef: 'BLS-2024-9012' },
      { typeId: 'manual-handling-trainer', obtainedDate: '2023-06-01', expiryDate: '2026-06-01', certificateRef: 'MH-2023-3456' },
    ],
    availability: {},
    billing: {
      vatRegistered: false,
      companyType: 'Limited Company',
      accountName: 'JT Training Ltd',
      sortCode: '23-45-67',
      accountNumber: '23456789',
    },
    notes: 'Prefers morning sessions',
    createdAt: '2023-02-20T14:30:00Z',
    auditLog: [
      { id: 'audit-002-1', eventType: 'trainer_created', timestamp: '2023-02-20T14:30:00Z', user: 'Admin', details: 'Trainer record created' },
      { id: 'audit-002-2', eventType: 'status_change', timestamp: '2023-02-25T10:00:00Z', user: 'Admin', details: 'Status changed from pending to active' },
      { id: 'audit-002-3', eventType: 'profile_update', timestamp: '2023-05-12T13:15:00Z', user: 'Admin', details: 'Updated delivery preference to Digital Only' },
    ],
  },
  {
    id: 'trainer-003',
    firstName: 'Emma',
    lastName: 'Roberts',
    email: 'emma.roberts@miadtraining.co.uk',
    phone: '07900 345678',
    status: 'active',
    address: {
      line1: '78 Willow Lane',
      line2: '',
      city: 'Leeds',
      postcode: 'LS1 5PQ',
    },
    deliveryPreference: 'classroom',
    workingRadius: 75,
    qualifications: [
      { typeId: 'manual-handling-trainer', obtainedDate: '2023-09-12', expiryDate: '2026-09-12', certificateRef: 'MH-2023-7890' },
      { typeId: 'fire-safety-trainer', obtainedDate: '2024-02-28', expiryDate: '2027-02-28', certificateRef: 'FS-2024-1234' },
    ],
    availability: {},
    billing: {
      vatRegistered: true,
      companyType: 'Sole Trader',
      accountName: 'Emma Roberts',
      sortCode: '34-56-78',
      accountNumber: '34567890',
    },
    notes: 'Available for weekend sessions',
    createdAt: '2023-04-10T09:15:00Z',
    auditLog: [
      { id: 'audit-003-1', eventType: 'trainer_created', timestamp: '2023-04-10T09:15:00Z', user: 'Admin', details: 'Trainer record created' },
      { id: 'audit-003-2', eventType: 'status_change', timestamp: '2023-04-15T11:00:00Z', user: 'Admin', details: 'Status changed from pending to active' },
      { id: 'audit-003-3', eventType: 'qualification_added', timestamp: '2024-02-28T10:30:00Z', user: 'Admin', details: 'Added Fire Safety Trainer Certificate' },
    ],
  },
  {
    id: 'trainer-004',
    firstName: 'Helen',
    lastName: 'Clarke',
    email: 'helen.clarke@miadtraining.co.uk',
    phone: '07400 456789',
    status: 'active',
    address: {
      line1: '23 Cedar Close',
      line2: '',
      city: 'Bristol',
      postcode: 'BS1 4RT',
    },
    deliveryPreference: 'both',
    workingRadius: 40,
    qualifications: [
      { typeId: 'safeguarding-trainer', obtainedDate: '2023-05-20', expiryDate: '2026-05-20', certificateRef: 'SG-2023-5678' },
    ],
    availability: {},
    billing: {
      vatRegistered: false,
      companyType: 'Partnership',
      accountName: 'Clarke & Associates',
      sortCode: '45-67-89',
      accountNumber: '45678901',
    },
    notes: 'Specialist in safeguarding training',
    createdAt: '2023-03-05T11:00:00Z',
    auditLog: [
      { id: 'audit-004-1', eventType: 'trainer_created', timestamp: '2023-03-05T11:00:00Z', user: 'Admin', details: 'Trainer record created' },
      { id: 'audit-004-2', eventType: 'status_change', timestamp: '2023-03-10T09:30:00Z', user: 'Admin', details: 'Status changed from pending to active' },
      { id: 'audit-004-3', eventType: 'billing_update', timestamp: '2023-07-20T14:00:00Z', user: 'Admin', details: 'Updated company type to Partnership' },
    ],
  },
  {
    id: 'trainer-005',
    firstName: 'Michael',
    lastName: 'Foster',
    email: 'michael.foster@miadtraining.co.uk',
    phone: '07500 567890',
    status: 'pending',
    address: {
      line1: '56 Birch Road',
      line2: 'Suite 2',
      city: 'Sheffield',
      postcode: 'S1 2AB',
    },
    deliveryPreference: 'digital',
    workingRadius: 0,
    qualifications: [
      { typeId: 'medication-trainer', obtainedDate: '2024-06-15', expiryDate: '2027-06-15', certificateRef: 'MED-2024-9012' },
      { typeId: 'wound-care-specialist', obtainedDate: '2024-04-01', expiryDate: '2027-04-01', certificateRef: 'WC-2024-3456' },
    ],
    availability: {},
    billing: {
      vatRegistered: false,
      companyType: '',
      accountName: '',
      sortCode: '',
      accountNumber: '',
    },
    notes: 'New trainer - pending verification',
    createdAt: '2024-07-01T16:45:00Z',
    auditLog: [
      { id: 'audit-005-1', eventType: 'trainer_created', timestamp: '2024-07-01T16:45:00Z', user: 'Admin', details: 'Trainer record created - pending verification' },
    ],
  },
]

// Load trainers from localStorage or use initial data
export function loadTrainers() {
  const saved = localStorage.getItem('miad_trainers')
  if (saved) {
    return JSON.parse(saved)
  }
  localStorage.setItem('miad_trainers', JSON.stringify(initialTrainers))
  return initialTrainers
}

// Save trainers to localStorage
export function saveTrainers(trainers) {
  localStorage.setItem('miad_trainers', JSON.stringify(trainers))
}

// Load training register data
export function loadTrainingRegister() {
  const saved = localStorage.getItem('miad_training_register')
  if (saved) {
    return JSON.parse(saved)
  }
  return {}
}

// Save training register data
export function saveTrainingRegister(register) {
  localStorage.setItem('miad_training_register', JSON.stringify(register))
}

// Get attendance for a specific session
export function getSessionAttendance(sessionId) {
  const register = loadTrainingRegister()
  return register[sessionId] || {}
}

// Update attendance for a booking in a session
export function updateAttendance(sessionId, bookingId, status, notes = '') {
  const register = loadTrainingRegister()
  if (!register[sessionId]) {
    register[sessionId] = {}
  }
  register[sessionId][bookingId] = {
    status,
    notes,
    updatedAt: new Date().toISOString(),
  }
  saveTrainingRegister(register)
  return register
}

// Create an audit log entry
export function createAuditEntry(eventType, details, user = 'Admin') {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    eventType,
    timestamp: new Date().toISOString(),
    user,
    details,
  }
}

// Add audit entry to a trainer
export function addAuditEntry(trainerId, eventType, details, user = 'Admin') {
  const trainers = loadTrainers()
  const trainer = trainers.find(t => t.id === trainerId)
  if (trainer) {
    if (!trainer.auditLog) {
      trainer.auditLog = []
    }
    trainer.auditLog.push(createAuditEntry(eventType, details, user))
    saveTrainers(trainers)
  }
  return trainers
}

// Compare two trainer objects and generate audit entries for changes
export function generateAuditEntriesForChanges(original, updated, user = 'Admin') {
  const entries = []

  // Check for status change
  if (original.status !== updated.status) {
    entries.push(createAuditEntry(
      'status_change',
      `Status changed from ${original.status} to ${updated.status}`,
      user
    ))
  }

  // Check for profile updates (name, email, phone, address, delivery, radius, notes)
  const profileFields = ['firstName', 'lastName', 'email', 'phone', 'deliveryPreference', 'workingRadius', 'notes']
  const profileChanges = []
  profileFields.forEach(field => {
    if (original[field] !== updated[field]) {
      profileChanges.push(field)
    }
  })

  // Check address changes
  const addressFields = ['line1', 'line2', 'city', 'postcode']
  addressFields.forEach(field => {
    if (original.address?.[field] !== updated.address?.[field]) {
      profileChanges.push(`address.${field}`)
    }
  })

  if (profileChanges.length > 0) {
    entries.push(createAuditEntry(
      'profile_update',
      `Updated: ${profileChanges.join(', ')}`,
      user
    ))
  }

  // Check for billing updates
  const billingFields = ['vatRegistered', 'companyType', 'accountName', 'sortCode', 'accountNumber']
  const billingChanges = []
  billingFields.forEach(field => {
    if (original.billing?.[field] !== updated.billing?.[field]) {
      billingChanges.push(field)
    }
  })

  if (billingChanges.length > 0) {
    entries.push(createAuditEntry(
      'billing_update',
      `Updated billing: ${billingChanges.join(', ')}`,
      user
    ))
  }

  // Check for qualification changes
  const originalQuals = original.qualifications || []
  const updatedQuals = updated.qualifications || []

  // Find added qualifications
  updatedQuals.forEach(uq => {
    const exists = originalQuals.find(oq =>
      oq.typeId === uq.typeId && oq.certificateRef === uq.certificateRef
    )
    if (!exists) {
      const qualType = qualificationTypes.find(q => q.id === uq.typeId)
      entries.push(createAuditEntry(
        'qualification_added',
        `Added qualification: ${qualType?.name || uq.typeId}`,
        user
      ))
    }
  })

  // Find removed qualifications
  originalQuals.forEach(oq => {
    const exists = updatedQuals.find(uq =>
      uq.typeId === oq.typeId && uq.certificateRef === oq.certificateRef
    )
    if (!exists) {
      const qualType = qualificationTypes.find(q => q.id === oq.typeId)
      entries.push(createAuditEntry(
        'qualification_removed',
        `Removed qualification: ${qualType?.name || oq.typeId}`,
        user
      ))
    }
  })

  // Check for availability changes
  const originalAvail = JSON.stringify(original.availability || {})
  const updatedAvail = JSON.stringify(updated.availability || {})
  if (originalAvail !== updatedAvail) {
    const addedDates = Object.keys(updated.availability || {}).filter(
      d => !(original.availability || {})[d]
    ).length
    const removedDates = Object.keys(original.availability || {}).filter(
      d => !(updated.availability || {})[d]
    ).length

    let details = 'Updated availability'
    if (addedDates > 0 || removedDates > 0) {
      const parts = []
      if (addedDates > 0) parts.push(`${addedDates} date(s) added`)
      if (removedDates > 0) parts.push(`${removedDates} date(s) removed`)
      details = `Availability updated: ${parts.join(', ')}`
    }

    entries.push(createAuditEntry('availability_update', details, user))
  }

  return entries
}
