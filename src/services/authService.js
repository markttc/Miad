// Authentication Service
// Handles OTP login for bookers and username/password + 2FA for admins

const AUTH_STORAGE_KEY = 'miad_auth'
const OTP_EXPIRY_MINUTES = 10

// Mock admin users (in production, this would be in a database)
const ADMIN_USERS = [
  {
    id: 'admin-001',
    username: 'ttcadmin',
    email: 'admin@ttc-uk.com',
    name: 'TTC Administrator',
    role: 'admin',
    // In production, password would be hashed
    passwordHash: 'admin123', // Demo password
  },
  {
    id: 'admin-002',
    username: 'coursemanager',
    email: 'courses@ttc-uk.com',
    name: 'Course Manager',
    role: 'admin',
    passwordHash: 'course123',
  },
]

// Store for OTPs (in production, use Redis or similar)
const otpStore = new Map()

// Store for 2FA codes
const twoFactorStore = new Map()

/**
 * Request OTP for booker login
 */
export async function requestOTP(email) {
  await simulateDelay(500)

  // Generate 6-digit OTP
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  // Store OTP
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt,
    attempts: 0,
  })

  // In production, send email via notification service
  console.log(`📧 OTP for ${email}: ${otp} (expires: ${expiresAt.toLocaleTimeString()})`)

  return {
    success: true,
    message: 'OTP sent to your email',
    expiresIn: OTP_EXPIRY_MINUTES * 60, // seconds
    // Include OTP for demo/prototype (remove in production with real email)
    _devOtp: otp,
  }
}

/**
 * Verify OTP and login booker
 */
export async function verifyOTP(email, otp) {
  await simulateDelay(300)

  const emailLower = email.toLowerCase()
  const stored = otpStore.get(emailLower)

  if (!stored) {
    return { success: false, error: 'No OTP requested for this email' }
  }

  if (new Date() > stored.expiresAt) {
    otpStore.delete(emailLower)
    return { success: false, error: 'OTP has expired. Please request a new one.' }
  }

  if (stored.attempts >= 3) {
    otpStore.delete(emailLower)
    return { success: false, error: 'Too many attempts. Please request a new OTP.' }
  }

  if (stored.otp !== otp) {
    stored.attempts++
    return { success: false, error: 'Invalid OTP. Please try again.' }
  }

  // OTP valid - create session
  otpStore.delete(emailLower)

  const user = {
    id: `booker-${Date.now()}`,
    email: emailLower,
    role: 'booker',
    loginMethod: 'otp',
    loginAt: new Date().toISOString(),
  }

  const session = createSession(user)
  saveSession(session)

  return {
    success: true,
    user: session.user,
    token: session.token,
  }
}

/**
 * Admin login - Step 1: Verify username/password
 */
export async function adminLogin(username, password) {
  await simulateDelay(500)

  const admin = ADMIN_USERS.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  )

  if (!admin || admin.passwordHash !== password) {
    return { success: false, error: 'Invalid username or password' }
  }

  // Generate 2FA code and send
  const twoFactorCode = generateOTP()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  twoFactorStore.set(admin.id, {
    code: twoFactorCode,
    expiresAt,
    attempts: 0,
  })

  // In production, send via SMS or authenticator app
  console.log(`🔐 2FA code for ${admin.username}: ${twoFactorCode}`)

  return {
    success: true,
    requiresTwoFactor: true,
    adminId: admin.id,
    message: '2FA code sent to your registered device',
    // Include code for demo/prototype (remove in production with real 2FA)
    _devCode: twoFactorCode,
  }
}

/**
 * Admin login - Step 2: Verify 2FA code
 */
export async function verifyTwoFactor(adminId, code) {
  await simulateDelay(300)

  const stored = twoFactorStore.get(adminId)

  if (!stored) {
    return { success: false, error: 'No 2FA session found. Please login again.' }
  }

  if (new Date() > stored.expiresAt) {
    twoFactorStore.delete(adminId)
    return { success: false, error: '2FA code has expired. Please login again.' }
  }

  if (stored.attempts >= 3) {
    twoFactorStore.delete(adminId)
    return { success: false, error: 'Too many attempts. Please login again.' }
  }

  if (stored.code !== code) {
    stored.attempts++
    return { success: false, error: 'Invalid 2FA code. Please try again.' }
  }

  // 2FA valid - create session
  twoFactorStore.delete(adminId)

  const admin = ADMIN_USERS.find((u) => u.id === adminId)
  const user = {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    loginMethod: '2fa',
    loginAt: new Date().toISOString(),
  }

  const session = createSession(user)
  saveSession(session)

  return {
    success: true,
    user: session.user,
    token: session.token,
  }
}

/**
 * Get current session
 */
export function getCurrentSession() {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!data) return null

    const session = JSON.parse(data)

    // Check if session is expired (24 hours for bookers, 8 hours for admins)
    const maxAge = session.user.role === 'admin' ? 8 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    const sessionAge = Date.now() - new Date(session.createdAt).getTime()

    if (sessionAge > maxAge) {
      logout()
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  const session = getCurrentSession()
  return session?.user || null
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return getCurrentSession() !== null
}

/**
 * Check if user is admin
 */
export function isAdmin() {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

/**
 * Check if user is booker
 */
export function isBooker() {
  const user = getCurrentUser()
  return user?.role === 'booker'
}

/**
 * Logout
 */
export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

/**
 * Update booker profile (for when they make a booking)
 */
export function updateBookerProfile(profileData) {
  const session = getCurrentSession()
  if (!session || session.user.role !== 'booker') return false

  session.user = {
    ...session.user,
    ...profileData,
  }

  saveSession(session)
  return true
}

// Helper functions
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function createSession(user) {
  return {
    user,
    token: `token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    createdAt: new Date().toISOString(),
  }
}

function saveSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

function simulateDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default {
  requestOTP,
  verifyOTP,
  adminLogin,
  verifyTwoFactor,
  getCurrentSession,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  isBooker,
  logout,
  updateBookerProfile,
}
