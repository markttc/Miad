// Zoom Integration Service
// Handles Zoom meeting creation, management, and joining instructions

// In production, these would come from environment variables
const ZOOM_CONFIG = {
  apiBaseUrl: 'https://api.zoom.us/v2',
  // OAuth credentials would be stored securely
  clientId: process.env.VITE_ZOOM_CLIENT_ID || 'demo_client_id',
  clientSecret: process.env.VITE_ZOOM_CLIENT_SECRET || 'demo_secret',
  accountId: process.env.VITE_ZOOM_ACCOUNT_ID || 'demo_account',
}

/**
 * Generate a Zoom meeting for a training session
 * In production, this would call the Zoom API
 */
export async function createMeeting({ topic, startTime, duration, hostEmail }) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Generate mock meeting data (in production, this comes from Zoom API)
  const meetingId = Math.floor(Math.random() * 9000000000) + 1000000000
  const password = generatePassword()

  return {
    success: true,
    data: {
      id: meetingId,
      topic,
      startTime,
      duration,
      timezone: 'Europe/London',
      joinUrl: `https://zoom.us/j/${meetingId}?pwd=${password}`,
      password,
      hostEmail,
      dialIn: {
        uk: '+44 203 481 5237',
        us: '+1 253 215 8782',
      },
      meetingId: formatMeetingId(meetingId),
    },
  }
}

/**
 * Update an existing Zoom meeting
 */
export async function updateMeeting(meetingId, updates) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    success: true,
    data: {
      id: meetingId,
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * Cancel/delete a Zoom meeting
 */
export async function deleteMeeting(meetingId) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    success: true,
    message: `Meeting ${meetingId} has been cancelled`,
  }
}

/**
 * Get meeting details
 */
export async function getMeeting(meetingId) {
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Return mock data
  const password = generatePassword()
  return {
    success: true,
    data: {
      id: meetingId,
      topic: 'Healthcare Training Session',
      status: 'waiting',
      startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      duration: 240,
      timezone: 'Europe/London',
      joinUrl: `https://zoom.us/j/${meetingId}?pwd=${password}`,
      password,
      hostId: 'host_001',
      registrantsCount: 0,
    },
  }
}

/**
 * Add a registrant to a meeting
 */
export async function addRegistrant(meetingId, registrantData) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const registrantId = `reg_${Date.now()}`

  return {
    success: true,
    data: {
      id: registrantId,
      meetingId,
      email: registrantData.email,
      firstName: registrantData.firstName,
      lastName: registrantData.lastName,
      joinUrl: `https://zoom.us/j/${meetingId}?pwd=${generatePassword()}&uname=${encodeURIComponent(registrantData.firstName)}`,
      registrantCreatedAt: new Date().toISOString(),
    },
  }
}

/**
 * Generate joining instructions for a session
 */
export function generateJoiningInstructions(meetingData, sessionData) {
  return {
    subject: `Joining Instructions: ${sessionData.courseName}`,
    content: `
Dear ${sessionData.attendeeName},

Thank you for booking ${sessionData.courseName}.

**Session Details:**
- Date: ${sessionData.date}
- Time: ${sessionData.time}
- Trainer: ${sessionData.trainer}

**How to Join:**
1. Click the link below at your scheduled time:
   ${meetingData.joinUrl}

2. Or join manually:
   - Meeting ID: ${meetingData.meetingId}
   - Password: ${meetingData.password}

**Dial-in Options:**
- UK: ${meetingData.dialIn?.uk || '+44 203 481 5237'}
- US: ${meetingData.dialIn?.us || '+1 253 215 8782'}

**Before Your Session:**
- Test your audio and video
- Find a quiet space with stable internet
- Have a notepad ready for notes

**Technical Support:**
If you have any issues joining, please contact:
training@miad.co.uk or call 0800 123 4567

We look forward to seeing you!

Best regards,
Miad Healthcare Training Team
    `.trim(),
  }
}

/**
 * Reset Zoom account password (automated password rotation)
 */
export async function resetAccountPassword(accountId) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newPassword = generateSecurePassword()

  return {
    success: true,
    data: {
      accountId,
      passwordUpdatedAt: new Date().toISOString(),
      // In production, new credentials would be stored securely
    },
  }
}

/**
 * Get Zoom account status and usage
 */
export async function getAccountStatus() {
  await new Promise((resolve) => setTimeout(resolve, 200))

  return {
    success: true,
    data: {
      accountId: ZOOM_CONFIG.accountId,
      status: 'active',
      plan: 'Pro',
      meetingsToday: 3,
      meetingsThisMonth: 45,
      participantsThisMonth: 890,
      storageUsed: '2.4 GB',
      storageLimit: '5 GB',
    },
  }
}

// Helper functions
function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function generateSecurePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function formatMeetingId(id) {
  const str = id.toString()
  return `${str.slice(0, 3)} ${str.slice(3, 7)} ${str.slice(7)}`
}

export default {
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeeting,
  addRegistrant,
  generateJoiningInstructions,
  resetAccountPassword,
  getAccountStatus,
}
