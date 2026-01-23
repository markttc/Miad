// Booking Service
// Orchestrates the complete booking flow including Zoom and notifications

import zoomService from './zoomService'
import notificationService from './notificationService'
import {
  getCustomerAccountById,
  debitAccount,
  creditAccount,
  checkCreditAvailability,
} from './customerAccountService'

// Storage key for bookings (localStorage for prototype)
const BOOKINGS_STORAGE_KEY = 'miad_bookings'

/**
 * Complete the booking process for a training course
 */
export async function createBooking({
  course,
  session,
  attendee,
  paymentData,
  isElearning = false,
}) {
  try {
    // 1. Generate booking reference
    const bookingRef = generateBookingReference()

    // 2. Create the booking record
    const booking = {
      id: `booking_${Date.now()}`,
      bookingRef,
      status: 'confirmed',
      createdAt: new Date().toISOString(),

      // Course info
      courseId: course.id,
      courseName: course.name,
      coursePrice: course.price,

      // Session info (for webinars)
      sessionId: session?.id || null,
      sessionDate: session?.date || null,
      sessionTime: session?.time || null,
      trainer: session?.trainer || null,

      // Delivery type
      isElearning,
      deliveryMethod: isElearning ? 'elearning' : 'webinar',

      // Attendee info
      attendee: {
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        email: attendee.email,
        phone: attendee.phone || null,
        organisation: attendee.organisation || null,
        jobTitle: attendee.jobTitle || null,
        marketingOptIn: attendee.marketingOptIn || false,
      },

      // Payment info
      payment: {
        amount: session?.price || course.price,
        currency: 'GBP',
        status: 'completed',
        method: 'stripe',
        processedAt: new Date().toISOString(),
      },

      // Zoom meeting (for webinars)
      zoomMeeting: null,

      // Notification tracking
      notifications: {
        confirmationSent: false,
        joiningInstructionsSent: false,
        reminder24hSent: false,
        reminder1hSent: false,
      },
    }

    // 3. For webinars, create Zoom meeting and register attendee
    if (!isElearning && session) {
      const meetingResult = await zoomService.createMeeting({
        topic: `${course.name} - ${session.date}`,
        startTime: `${session.date}T${session.time.split(' - ')[0]}:00`,
        duration: parseInt(course.duration) * 60 || 240,
        hostEmail: 'training@miad.co.uk',
      })

      if (meetingResult.success) {
        booking.zoomMeeting = meetingResult.data

        // Register the attendee
        await zoomService.addRegistrant(meetingResult.data.id, {
          email: attendee.email,
          firstName: attendee.firstName,
          lastName: attendee.lastName,
        })
      }
    }

    // 4. Save booking to storage
    saveBooking(booking)

    // 5. Send confirmation email
    const confirmationResult = await notificationService.sendBookingConfirmation({
      attendee,
      course,
      session,
      bookingRef,
      isElearning,
    })

    if (confirmationResult.success) {
      booking.notifications.confirmationSent = true
      updateBooking(booking.id, { notifications: booking.notifications })
    }

    // 6. For e-learning, send access instructions
    if (isElearning) {
      await notificationService.sendElearningAccess({
        attendee,
        course,
        bookingRef,
      })
    }

    // 7. For webinars, schedule joining instructions (in production, this would be a scheduled job)
    // For the prototype, we'll simulate this
    if (!isElearning && booking.zoomMeeting) {
      // In production: schedule for 24h before session
      console.log('📅 Scheduled: Joining instructions for', booking.sessionDate)
    }

    return {
      success: true,
      data: {
        bookingId: booking.id,
        bookingRef,
        booking,
      },
    }
  } catch (error) {
    console.error('Booking failed:', error)
    return {
      success: false,
      error: error.message || 'Booking failed',
    }
  }
}

/**
 * Get all bookings for a user (by email)
 */
export function getBookingsByEmail(email) {
  const bookings = getAllBookings()
  return bookings.filter(
    (b) => b.attendee.email.toLowerCase() === email.toLowerCase()
  )
}

/**
 * Get a booking by reference
 */
export function getBookingByRef(bookingRef) {
  const bookings = getAllBookings()
  return bookings.find((b) => b.bookingRef === bookingRef)
}

/**
 * Get a booking by ID
 */
export function getBookingById(bookingId) {
  const bookings = getAllBookings()
  return bookings.find((b) => b.id === bookingId)
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId, reason) {
  const booking = getBookingById(bookingId)
  if (!booking) {
    return { success: false, error: 'Booking not found' }
  }

  // Update status
  booking.status = 'cancelled'
  booking.cancelledAt = new Date().toISOString()
  booking.cancellationReason = reason

  // Cancel Zoom meeting if exists
  if (booking.zoomMeeting) {
    await zoomService.deleteMeeting(booking.zoomMeeting.id)
  }

  // Send cancellation notification
  await notificationService.sendCancellationNotification(
    {
      attendee: booking.attendee,
      course: { name: booking.courseName },
      session: booking.sessionDate ? { date: booking.sessionDate } : null,
      bookingRef: booking.bookingRef,
    },
    reason
  )

  // Save updated booking
  updateBooking(bookingId, booking)

  return { success: true, booking }
}

/**
 * Create admin offline booking (for TTC staff)
 */
export async function createAdminBooking({
  course,
  session,
  attendee,
  paymentMethod, // 'card' | 'purchase_order'
  paymentData,   // { cardDetails } or { poNumber, customerAccountId }
  adminUser,
}) {
  try {
    // 1. Generate booking reference
    const bookingRef = generateBookingReference()
    const isElearning = !session

    // 2. Handle Purchase Order payment
    let purchaseOrderData = null
    if (paymentMethod === 'purchase_order') {
      // Check credit availability
      const amount = session?.price || course.price
      const creditCheck = checkCreditAvailability(paymentData.customerAccountId, amount)

      if (!creditCheck.available) {
        return {
          success: false,
          error: creditCheck.reason,
        }
      }

      // Get customer account details
      const customerAccount = getCustomerAccountById(paymentData.customerAccountId)

      // Debit the account
      const debitResult = debitAccount(
        paymentData.customerAccountId,
        amount,
        bookingRef,
        `${course.name} - ${attendee.firstName} ${attendee.lastName}`,
        adminUser
      )

      purchaseOrderData = {
        poNumber: paymentData.poNumber,
        customerAccountId: paymentData.customerAccountId,
        customerAccountName: customerAccount.organisationName,
      }
    }

    // 3. Create the booking record
    const booking = {
      id: `booking_${Date.now()}`,
      bookingRef,
      status: 'confirmed',
      createdAt: new Date().toISOString(),

      // Source tracking
      source: 'admin_offline',
      createdBy: {
        type: 'admin',
        adminName: adminUser,
      },

      // Course info
      courseId: course.id,
      courseName: course.name,
      coursePrice: course.price,

      // Session info (for webinars)
      sessionId: session?.id || null,
      sessionDate: session?.date || null,
      sessionTime: session?.time || null,
      trainer: session?.trainer || null,

      // Delivery type
      isElearning,
      deliveryMethod: isElearning ? 'elearning' : 'webinar',

      // Customer account reference (for PO bookings)
      customerAccountId: paymentData?.customerAccountId || null,

      // Attendee info
      attendee: {
        firstName: attendee.firstName,
        lastName: attendee.lastName,
        email: attendee.email,
        phone: attendee.phone || null,
        organisation: attendee.organisation || null,
        jobTitle: attendee.jobTitle || null,
        marketingOptIn: attendee.marketingOptIn || false,
      },

      // Payment info
      payment: {
        amount: session?.price || course.price,
        currency: 'GBP',
        status: 'completed',
        method: paymentMethod,
        processedAt: new Date().toISOString(),
        purchaseOrder: purchaseOrderData,
        refund: null,
      },

      // Zoom meeting (for webinars)
      zoomMeeting: null,

      // Notification tracking
      notifications: {
        confirmationSent: false,
        joiningInstructionsSent: false,
        reminder24hSent: false,
        reminder1hSent: false,
      },
    }

    // 4. For webinars, create Zoom meeting and register attendee
    if (!isElearning && session) {
      const meetingResult = await zoomService.createMeeting({
        topic: `${course.name} - ${session.date}`,
        startTime: `${session.date}T${session.time.split(' - ')[0]}:00`,
        duration: parseInt(course.duration) * 60 || 240,
        hostEmail: 'training@miad.co.uk',
      })

      if (meetingResult.success) {
        booking.zoomMeeting = meetingResult.data

        // Register the attendee
        await zoomService.addRegistrant(meetingResult.data.id, {
          email: attendee.email,
          firstName: attendee.firstName,
          lastName: attendee.lastName,
        })
      }
    }

    // 5. Save booking to storage
    saveBooking(booking)

    // 6. Send confirmation email
    const confirmationResult = await notificationService.sendBookingConfirmation({
      attendee,
      course,
      session,
      bookingRef,
      isElearning,
    })

    if (confirmationResult.success) {
      booking.notifications.confirmationSent = true
      updateBooking(booking.id, { notifications: booking.notifications })
    }

    // 7. For e-learning, send access instructions
    if (isElearning) {
      await notificationService.sendElearningAccess({
        attendee,
        course,
        bookingRef,
      })
    }

    return {
      success: true,
      data: {
        bookingId: booking.id,
        bookingRef,
        booking,
      },
    }
  } catch (error) {
    console.error('Admin booking failed:', error)
    return {
      success: false,
      error: error.message || 'Booking failed',
    }
  }
}

/**
 * Cancel booking with optional refund
 */
export async function cancelBookingWithRefund(
  bookingId,
  {
    reason,
    issueRefund = false,
    refundAmount = null,
    adminUser,
  }
) {
  const booking = getBookingById(bookingId)
  if (!booking) {
    return { success: false, error: 'Booking not found' }
  }

  if (booking.status === 'cancelled') {
    return { success: false, error: 'Booking is already cancelled' }
  }

  const amount = refundAmount ?? booking.payment.amount

  // Handle refund based on payment method
  let refundData = null
  if (issueRefund && amount > 0) {
    if (booking.payment.method === 'card') {
      // In production, this would call Stripe refund API
      // For prototype, we simulate the refund
      refundData = {
        refundId: `ref_${Date.now()}`,
        amount: amount,
        status: 'succeeded',
        reason: reason,
        processedAt: new Date().toISOString(),
        processedBy: adminUser,
      }
      console.log(`💳 Refund processed: £${amount} for booking ${booking.bookingRef}`)
    } else if (booking.payment.method === 'purchase_order' && booking.customerAccountId) {
      // Credit the customer account
      try {
        creditAccount(
          booking.customerAccountId,
          amount,
          booking.bookingRef,
          `Refund - ${reason}`,
          adminUser
        )
        refundData = {
          refundId: `cred_${Date.now()}`,
          amount: amount,
          status: 'succeeded',
          reason: reason,
          processedAt: new Date().toISOString(),
          processedBy: adminUser,
          type: 'account_credit',
        }
        console.log(`📋 Account credited: £${amount} for booking ${booking.bookingRef}`)
      } catch (error) {
        return { success: false, error: `Failed to credit account: ${error.message}` }
      }
    }
  }

  // Update booking status
  const updatedBooking = {
    ...booking,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancellationReason: reason,
    payment: {
      ...booking.payment,
      status: refundData ? (amount >= booking.payment.amount ? 'refunded' : 'partial_refund') : booking.payment.status,
      refund: refundData,
    },
  }

  // Cancel Zoom meeting if exists
  if (booking.zoomMeeting) {
    await zoomService.deleteMeeting(booking.zoomMeeting.id)
  }

  // Send cancellation notification
  await notificationService.sendCancellationNotification(
    {
      attendee: booking.attendee,
      course: { name: booking.courseName },
      session: booking.sessionDate ? { date: booking.sessionDate } : null,
      bookingRef: booking.bookingRef,
    },
    reason
  )

  // Save updated booking
  updateBooking(bookingId, updatedBooking)

  return {
    success: true,
    booking: updatedBooking,
    refund: refundData,
  }
}

/**
 * Search existing bookings to find customer info
 */
export function searchBookingsForCustomer(query) {
  const bookings = getAllBookings()
  const lowerQuery = query.toLowerCase()

  // Find unique customers from bookings
  const customerMap = new Map()

  bookings.forEach((booking) => {
    const attendee = booking.attendee
    const key = attendee.email.toLowerCase()

    if (
      attendee.email.toLowerCase().includes(lowerQuery) ||
      attendee.firstName.toLowerCase().includes(lowerQuery) ||
      attendee.lastName.toLowerCase().includes(lowerQuery) ||
      (attendee.organisation && attendee.organisation.toLowerCase().includes(lowerQuery))
    ) {
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          ...attendee,
          bookingCount: 1,
          lastBooking: booking.createdAt,
        })
      } else {
        const existing = customerMap.get(key)
        existing.bookingCount++
        if (booking.createdAt > existing.lastBooking) {
          existing.lastBooking = booking.createdAt
        }
      }
    }
  })

  return Array.from(customerMap.values()).sort((a, b) =>
    new Date(b.lastBooking) - new Date(a.lastBooking)
  )
}

/**
 * Get all bookings (exported for admin use)
 */
export function getAllBookingsExport() {
  return getAllBookings()
}

/**
 * Resend joining instructions
 */
export async function resendJoiningInstructions(bookingId) {
  const booking = getBookingById(bookingId)
  if (!booking) {
    return { success: false, error: 'Booking not found' }
  }

  if (!booking.zoomMeeting) {
    return { success: false, error: 'No Zoom meeting associated with this booking' }
  }

  await notificationService.sendJoiningInstructions(
    {
      attendee: booking.attendee,
      course: { name: booking.courseName },
      session: {
        date: booking.sessionDate,
        time: booking.sessionTime,
        trainer: booking.trainer,
      },
      bookingRef: booking.bookingRef,
    },
    booking.zoomMeeting
  )

  return { success: true }
}

/**
 * Process scheduled notifications (called by a cron job in production)
 */
export async function processScheduledNotifications() {
  const bookings = getAllBookings()
  const now = new Date()

  for (const booking of bookings) {
    if (booking.status !== 'confirmed' || booking.isElearning) continue

    const sessionDate = new Date(booking.sessionDate)
    const hoursUntilSession = (sessionDate - now) / (1000 * 60 * 60)

    // Send 24h reminder
    if (hoursUntilSession <= 24 && hoursUntilSession > 23 && !booking.notifications.reminder24hSent) {
      await notificationService.sendReminder24h(
        {
          attendee: booking.attendee,
          course: { name: booking.courseName },
          session: {
            date: booking.sessionDate,
            time: booking.sessionTime,
            trainer: booking.trainer,
          },
          bookingRef: booking.bookingRef,
        },
        booking.zoomMeeting
      )
      booking.notifications.reminder24hSent = true
      updateBooking(booking.id, { notifications: booking.notifications })
    }

    // Send 1h reminder
    if (hoursUntilSession <= 1 && hoursUntilSession > 0 && !booking.notifications.reminder1hSent) {
      await notificationService.sendReminder1h(
        {
          attendee: booking.attendee,
          course: { name: booking.courseName },
          session: {
            date: booking.sessionDate,
            time: booking.sessionTime,
            trainer: booking.trainer,
          },
          bookingRef: booking.bookingRef,
        },
        booking.zoomMeeting
      )
      booking.notifications.reminder1hSent = true
      updateBooking(booking.id, { notifications: booking.notifications })
    }

    // Send joining instructions 24h before if not sent
    if (hoursUntilSession <= 24 && !booking.notifications.joiningInstructionsSent && booking.zoomMeeting) {
      await notificationService.sendJoiningInstructions(
        {
          attendee: booking.attendee,
          course: { name: booking.courseName },
          session: {
            date: booking.sessionDate,
            time: booking.sessionTime,
            trainer: booking.trainer,
          },
          bookingRef: booking.bookingRef,
        },
        booking.zoomMeeting
      )
      booking.notifications.joiningInstructionsSent = true
      updateBooking(booking.id, { notifications: booking.notifications })
    }
  }
}

// Storage helpers
function getAllBookings() {
  try {
    const data = localStorage.getItem(BOOKINGS_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveBooking(booking) {
  const bookings = getAllBookings()
  bookings.push(booking)
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings))
}

function updateBooking(bookingId, updates) {
  const bookings = getAllBookings()
  const index = bookings.findIndex((b) => b.id === bookingId)
  if (index !== -1) {
    bookings[index] = { ...bookings[index], ...updates }
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings))
  }
}

function generateBookingReference() {
  return `MIAD-${Date.now().toString(36).toUpperCase()}`
}

export default {
  createBooking,
  createAdminBooking,
  getBookingsByEmail,
  getBookingByRef,
  getBookingById,
  cancelBooking,
  cancelBookingWithRefund,
  resendJoiningInstructions,
  processScheduledNotifications,
  searchBookingsForCustomer,
  getAllBookingsExport,
}
