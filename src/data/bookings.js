import { upcomingSessions, courses } from './courses'

// Generate realistic UK names
const firstNames = [
  'Emma', 'Oliver', 'Sophia', 'Harry', 'Amelia', 'Jack', 'Isla', 'George',
  'Mia', 'Noah', 'Olivia', 'Leo', 'Ava', 'Oscar', 'Grace', 'Charlie',
  'Lily', 'Jacob', 'Emily', 'Alfie', 'Poppy', 'Henry', 'Ella', 'William',
  'Sophie', 'James', 'Jessica', 'Thomas', 'Ruby', 'Edward', 'Chloe', 'Samuel',
  'Lucy', 'Daniel', 'Hannah', 'Alexander', 'Freya', 'Joseph', 'Charlotte', 'Benjamin',
  'Daisy', 'Max', 'Alice', 'Ethan', 'Florence', 'Lucas', 'Evie', 'Arthur',
  'Phoebe', 'Sebastian', 'Isabelle', 'Dylan', 'Matilda', 'Finley', 'Eva', 'Logan',
]

const lastNames = [
  'Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Wilson', 'Evans',
  'Thomas', 'Johnson', 'Roberts', 'Walker', 'Wright', 'Robinson', 'Thompson', 'White',
  'Hughes', 'Edwards', 'Green', 'Hall', 'Lewis', 'Harris', 'Clarke', 'Patel',
  'Jackson', 'Wood', 'Turner', 'Martin', 'Cooper', 'Hill', 'Ward', 'Morris',
  'Moore', 'Clark', 'Lee', 'King', 'Baker', 'Harrison', 'Morgan', 'Allen',
  'James', 'Scott', 'Phillips', 'Watson', 'Davis', 'Parker', 'Price', 'Bennett',
]

const organisations = [
  'Sunrise Care Home', 'Meadowbrook Healthcare', "St. Mary's Nursing Home",
  'Oakwood Medical Centre', 'Riverside Community Hospital', 'Bluebell Care Services',
  'Greenfield NHS Trust', 'Harmony Health Group', 'Castle View Care Home',
  'Valley Medical Practice', 'Lakeside Nursing Services', 'Primrose Healthcare Ltd',
  'Woodland Care Centre', 'Silver Birch Residential', 'Thornbury Health Services',
  'Ashford Medical Group', 'Cheltenham Care Partnership', 'Bristol Health Trust',
  'Cardiff Community Care', 'Manchester Health Services', 'Birmingham Care Alliance',
  'Leeds Medical Centre', 'Sheffield Healthcare Trust', 'Liverpool Care Network',
]

const emailDomains = ['nhs.net', 'careservices.co.uk', 'healthgroup.com', 'medicalcentre.org.uk']

function generateBookingRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = 'MHT-'
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return ref
}

function generatePhone() {
  const prefixes = ['07700', '07800', '07900', '07400', '07500']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const number = Math.floor(100000 + Math.random() * 900000)
  return `${prefix} ${number}`
}

function generateZoomMeeting() {
  const meetingId = Math.floor(100000000 + Math.random() * 900000000).toString()
  const password = Math.random().toString(36).substring(2, 8)
  return {
    meetingId: meetingId.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'),
    password,
    joinUrl: `https://zoom.us/j/${meetingId}?pwd=${password}`,
  }
}

// Generate mock bookings based on session data
export function generateMockBookings() {
  const bookings = []
  let bookingIndex = 1

  upcomingSessions.forEach((session) => {
    const course = courses.find((c) => c.id === session.courseId)
    if (!course) return

    const bookedCount = session.spotsTotal - session.spotsRemaining

    for (let i = 0; i < bookedCount; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const emailDomain = emailDomains[Math.floor(Math.random() * emailDomains.length)]
      const organisation = organisations[Math.floor(Math.random() * organisations.length)]

      // Create booking date sometime in the past few weeks
      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30))
      createdAt.setHours(Math.floor(8 + Math.random() * 10), Math.floor(Math.random() * 60))

      const booking = {
        id: `booking-${String(bookingIndex).padStart(4, '0')}`,
        bookingRef: generateBookingRef(),
        attendee: {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`,
          phone: generatePhone(),
          organisation,
        },
        courseId: session.courseId,
        courseName: course.name,
        sessionId: session.id,
        sessionDate: session.date,
        sessionTime: session.time,
        trainer: session.trainer,
        isElearning: false,
        payment: {
          amount: session.price,
          status: 'completed',
          method: Math.random() > 0.3 ? 'card' : 'invoice',
        },
        status: 'confirmed',
        createdAt: createdAt.toISOString(),
        zoomMeeting: generateZoomMeeting(),
      }

      bookings.push(booking)
      bookingIndex++
    }
  })

  // Add some e-learning bookings too
  const elearningCourses = courses.filter((c) => c.deliveryMethods && c.deliveryMethods.includes('e-learning'))

  if (elearningCourses.length > 0) {
    const elearningCount = Math.floor(15 + Math.random() * 10)

    for (let i = 0; i < elearningCount; i++) {
      const course = elearningCourses[Math.floor(Math.random() * elearningCourses.length)]
      if (!course) continue

      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const emailDomain = emailDomains[Math.floor(Math.random() * emailDomains.length)]
      const organisation = organisations[Math.floor(Math.random() * organisations.length)]

      const createdAt = new Date()
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30))
      createdAt.setHours(Math.floor(8 + Math.random() * 10), Math.floor(Math.random() * 60))

      const booking = {
        id: `booking-${String(bookingIndex).padStart(4, '0')}`,
        bookingRef: generateBookingRef(),
        attendee: {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`,
          phone: generatePhone(),
          organisation,
        },
        courseId: course.id,
        courseName: course.name,
        sessionId: null,
        sessionDate: null,
        sessionTime: null,
        trainer: null,
        isElearning: true,
        payment: {
          amount: course.price,
          status: 'completed',
          method: Math.random() > 0.3 ? 'card' : 'invoice',
        },
        status: 'confirmed',
        createdAt: createdAt.toISOString(),
        zoomMeeting: null,
      }

      bookings.push(booking)
      bookingIndex++
    }
  }

  // Sort by creation date (newest first)
  return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// Seed localStorage with mock data if empty or invalid
export function seedBookingsData(forceReseed = false) {
  const existingBookings = localStorage.getItem('miad_bookings')

  let shouldSeed = forceReseed

  if (!shouldSeed) {
    try {
      const parsed = JSON.parse(existingBookings || '[]')
      shouldSeed = !Array.isArray(parsed) || parsed.length === 0 ||
                   (parsed.length > 0 && !parsed[0].bookingRef)
    } catch (e) {
      shouldSeed = true
    }
  }

  if (shouldSeed) {
    const mockBookings = generateMockBookings()
    localStorage.setItem('miad_bookings', JSON.stringify(mockBookings))
    return mockBookings
  }

  return JSON.parse(existingBookings)
}

// Force reseed (useful for development/testing)
export function reseedBookingsData() {
  return seedBookingsData(true)
}
