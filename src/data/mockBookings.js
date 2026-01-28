// Mock booking data for demo purposes
// This aligns with the session booking counts in courses.js

const firstNames = [
  'Emma', 'Sarah', 'James', 'Michael', 'Sophie', 'David', 'Laura', 'Daniel',
  'Rachel', 'Thomas', 'Jessica', 'Christopher', 'Hannah', 'Matthew', 'Emily',
  'Andrew', 'Charlotte', 'Robert', 'Olivia', 'William', 'Amy', 'Joseph',
  'Rebecca', 'Benjamin', 'Lucy', 'Samuel', 'Grace', 'Alexander', 'Chloe',
  'George', 'Natalie', 'Edward', 'Victoria', 'Henry', 'Elizabeth', 'Oliver',
  'Megan', 'Jack', 'Lauren', 'Harry', 'Abigail', 'Charlie', 'Bethany',
  'Luke', 'Samantha', 'Adam', 'Stephanie', 'Nathan', 'Claire', 'Ryan',
  'Catherine', 'Peter', 'Nicola', 'Mark', 'Helen', 'Paul', 'Karen', 'Simon',
  'Michelle', 'Ian', 'Joanne', 'Richard', 'Tracy', 'Steven', 'Alison',
  'Jonathan', 'Sharon', 'Kevin', 'Jennifer', 'Gary', 'Amanda', 'Philip',
  'Susan', 'Alan', 'Julie', 'Stephen', 'Donna', 'Stuart', 'Louise',
  'Keith', 'Caroline', 'Darren', 'Paula', 'Carl', 'Wendy', 'Lee', 'Andrea',
  'Scott', 'Jane', 'Martin', 'Diane', 'Neil', 'Maria', 'Dean', 'Jacqueline',
  'Craig', 'Anne', 'Wayne', 'Frances', 'Barry', 'Margaret', 'Derek', 'Patricia',
  'Colin', 'Sandra', 'Graham', 'Christine', 'Trevor', 'Janet', 'Malcolm', 'Deborah'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson',
  'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
  'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis',
  'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Scott',
  'Green', 'Baker', 'Adams', 'Nelson', 'Hill', 'Campbell', 'Mitchell',
  'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker',
  'Collins', 'Edwards', 'Stewart', 'Flores', 'Morris', 'Murphy', 'Rivera',
  'Cook', 'Rogers', 'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey',
  'Bell', 'Gomez', 'Kelly', 'Howard', 'Ward', 'Cox', 'Diaz', 'Richardson',
  'Wood', 'Watson', 'Brooks', 'Bennett', 'Gray', 'James', 'Reyes', 'Cruz',
  'Hughes', 'Price', 'Myers', 'Long', 'Foster', 'Sanders', 'Ross', 'Morales',
  'Powell', 'Sullivan', 'Russell', 'Ortiz', 'Jenkins', 'Gutierrez', 'Perry',
  'Butler', 'Barnes', 'Fisher', 'Henderson', 'Coleman', 'Simmons', 'Patterson',
  'Jordan', 'Reynolds', 'Hamilton', 'Graham', 'Kim', 'Gonzales', 'Alexander',
  'Ramos', 'Wallace', 'Griffin', 'West', 'Cole', 'Hayes', 'Bryant', 'Ellis'
]

const organisations = [
  'NHS Greater Manchester',
  'Leeds Teaching Hospitals NHS Trust',
  'Sheffield Teaching Hospitals',
  'University Hospitals Birmingham',
  'Oxford University Hospitals',
  'Cambridge University Hospitals',
  'Guy\'s and St Thomas\' NHS Foundation Trust',
  'King\'s College Hospital NHS Foundation Trust',
  'Imperial College Healthcare NHS Trust',
  'University College London Hospitals',
  'Royal Free London NHS Foundation Trust',
  'Barts Health NHS Trust',
  'Manchester University NHS Foundation Trust',
  'Liverpool University Hospitals NHS Foundation Trust',
  'Bristol Royal Infirmary',
  'Nottingham University Hospitals',
  'Newcastle upon Tyne Hospitals',
  'Southampton University Hospital',
  'Norfolk and Norwich University Hospital',
  'Royal Devon University Healthcare',
  'Derbyshire Healthcare NHS Foundation Trust',
  'Lancashire Teaching Hospitals',
  'Gloucestershire Hospitals NHS Foundation Trust',
  'Hampshire Hospitals NHS Foundation Trust',
  'Buckinghamshire Healthcare NHS Trust',
  'Mid Yorkshire Teaching NHS Trust',
  'Barnsley Hospital NHS Foundation Trust',
  'Doncaster and Bassetlaw Teaching Hospitals',
  'Rotherham NHS Foundation Trust',
  'Chesterfield Royal Hospital',
  'Hull University Teaching Hospitals',
  'York and Scarborough Teaching Hospitals',
  'Harrogate and District NHS Foundation Trust',
  'Airedale NHS Foundation Trust',
  'Calderdale and Huddersfield NHS Foundation Trust',
  'Bradford Teaching Hospitals',
  'St Helens and Knowsley Teaching Hospitals',
  'Warrington and Halton Teaching Hospitals',
  'East Cheshire NHS Trust',
  'Stockport NHS Foundation Trust',
  'Pennine Care NHS Foundation Trust',
  'Greater Manchester Mental Health',
  'South West Yorkshire Partnership NHS Foundation Trust',
  'Leeds and York Partnership NHS Foundation Trust',
  'Tees, Esk and Wear Valleys NHS Foundation Trust',
  'Cumbria, Northumberland, Tyne and Wear NHS Foundation Trust',
  'Northamptonshire Healthcare NHS Foundation Trust',
  'Lincolnshire Partnership NHS Foundation Trust',
  'Coventry and Warwickshire Partnership NHS Trust',
  'Black Country Healthcare NHS Foundation Trust'
]

const jobTitles = [
  'Staff Nurse',
  'Senior Staff Nurse',
  'Ward Sister',
  'Charge Nurse',
  'Healthcare Assistant',
  'Senior Healthcare Assistant',
  'Nursing Associate',
  'Clinical Support Worker',
  'Band 5 Nurse',
  'Band 6 Nurse',
  'Band 7 Nurse',
  'Deputy Ward Manager',
  'Ward Manager',
  'Matron',
  'Practice Nurse',
  'District Nurse',
  'Community Nurse',
  'Specialist Nurse',
  'Advanced Nurse Practitioner',
  'Nurse Practitioner',
  'Emergency Nurse Practitioner',
  'Theatre Nurse',
  'Scrub Nurse',
  'Recovery Nurse',
  'ITU Nurse',
  'HDU Nurse',
  'Paediatric Nurse',
  'Neonatal Nurse',
  'Mental Health Nurse',
  'Learning Disability Nurse',
  'Midwife',
  'Student Nurse',
  'Newly Qualified Nurse',
  'Physiotherapist',
  'Occupational Therapist',
  'Radiographer',
  'Paramedic',
  'Pharmacist',
  'Clinical Pharmacist',
  'Care Coordinator',
  'Team Leader',
  'Clinical Team Leader'
]

// Generate a random UK phone number
function generatePhone() {
  const prefixes = ['07700', '07712', '07845', '07901', '07456', '07789', '07555', '07123', '07999', '07800']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const number = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
  return `${prefix} ${number}`
}

// Generate booking reference
function generateBookingRef(index) {
  return `MHT-${String(index + 1).padStart(5, '0')}`
}

// Generate email from name
function generateEmail(firstName, lastName, org) {
  const orgDomain = org.toLowerCase()
    .replace(/nhs trust|nhs foundation trust|teaching hospitals|university hospitals|hospitals|healthcare/gi, '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-z]/g, '')
    .slice(0, 12)

  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${orgDomain}.nhs.uk`
}

// Create mock bookings for a session
function createSessionBookings(sessionId, courseId, courseName, count, startIndex) {
  const bookings = []

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[(startIndex + i) % firstNames.length]
    const lastName = lastNames[(startIndex + i * 3) % lastNames.length]
    const org = organisations[(startIndex + i) % organisations.length]
    const jobTitle = jobTitles[(startIndex + i * 2) % jobTitles.length]

    bookings.push({
      id: `booking-${sessionId}-${i + 1}`,
      bookingRef: generateBookingRef(startIndex + i),
      sessionId: sessionId,
      courseId: courseId,
      courseName: courseName,
      isElearning: false,
      attendee: {
        firstName,
        lastName,
        email: generateEmail(firstName, lastName, org),
        phone: generatePhone(),
        organisation: org,
        jobTitle,
      },
      payment: {
        amount: getSessionPrice(sessionId),
        method: 'card',
        status: 'completed',
        transactionId: `txn_${Date.now()}_${startIndex + i}`,
      },
      createdAt: generateCreatedAt(),
      status: 'confirmed',
    })
  }

  return bookings
}

// Get session price (matches courses.js)
function getSessionPrice(sessionId) {
  const prices = {
    'session-001': 85,
    'session-002': 85,
    'session-003': 65,
    'session-004': 55,
    'session-005': 55,
    'session-006': 95,
    'session-007': 125,
    'session-008': 35,
    'session-009': 55,
    'session-010': 55,
    'session-011': 245,
    'session-012': 75,
  }
  return prices[sessionId] || 0
}

// Generate a random created date in the past 30 days
function generateCreatedAt() {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 30) + 1
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return date.toISOString()
}

// Session booking counts (spotsTotal - spotsRemaining from courses.js)
const sessionBookingCounts = {
  'session-001': { count: 12, courseId: 'basic-life-support', name: 'Basic Life Support (BLS)' },
  'session-002': { count: 5, courseId: 'basic-life-support', name: 'Basic Life Support (BLS)' },
  'session-003': { count: 13, courseId: 'manual-handling', name: 'Manual Handling in Healthcare' },
  'session-004': { count: 8, courseId: 'safeguarding-adults', name: 'Safeguarding Adults Level 2' },
  'session-005': { count: 12, courseId: 'safeguarding-children', name: 'Safeguarding Children Level 2' },
  'session-006': { count: 14, courseId: 'medication-administration', name: 'Safe Medication Administration' },
  'session-007': { count: 6, courseId: 'wound-care', name: 'Wound Care Management' },
  'session-008': { count: 12, courseId: 'infection-prevention', name: 'Infection Prevention & Control' },
  'session-009': { count: 10, courseId: 'mental-health-awareness', name: 'Mental Health Awareness' },
  'session-010': { count: 5, courseId: 'dementia-awareness', name: 'Dementia Awareness' },
  'session-011': { count: 8, courseId: 'team-leadership', name: 'Healthcare Team Leadership' },
  'session-012': { count: 9, courseId: 'suicide-prevention', name: 'Suicide Prevention & Awareness' },
}

// Generate all mock bookings
export function generateMockBookings() {
  let allBookings = []
  let runningIndex = 0

  Object.entries(sessionBookingCounts).forEach(([sessionId, config]) => {
    const sessionBookings = createSessionBookings(
      sessionId,
      config.courseId,
      config.name,
      config.count,
      runningIndex
    )
    allBookings = [...allBookings, ...sessionBookings]
    runningIndex += config.count
  })

  return allBookings
}

// Seed mock bookings to localStorage if not already present or if data is stale
export function seedMockBookings(forceReseed = false) {
  const MOCK_DATA_VERSION = '2.0' // Increment this to force re-seed
  const existingVersion = localStorage.getItem('miad_bookings_version')
  const existingBookings = JSON.parse(localStorage.getItem('miad_bookings') || '[]')

  // Re-seed if: forced, version mismatch, or no bookings exist
  if (forceReseed || existingVersion !== MOCK_DATA_VERSION || existingBookings.length === 0) {
    const mockBookings = generateMockBookings()
    localStorage.setItem('miad_bookings', JSON.stringify(mockBookings))
    localStorage.setItem('miad_bookings_version', MOCK_DATA_VERSION)
    console.log(`Seeded ${mockBookings.length} mock bookings to localStorage (v${MOCK_DATA_VERSION})`)
    return mockBookings
  }

  return existingBookings
}

// Export the session counts for reference
export { sessionBookingCounts }

export default generateMockBookings
