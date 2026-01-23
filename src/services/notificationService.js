// Notification Service
// Handles booking confirmations, joining instructions, and reminders

import zoomService from './zoomService'

// Email templates
const EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  JOINING_INSTRUCTIONS: 'joining_instructions',
  REMINDER_24H: 'reminder_24h',
  REMINDER_1H: 'reminder_1h',
  ELEARNING_ACCESS: 'elearning_access',
  CERTIFICATE_READY: 'certificate_ready',
  BOOKING_CANCELLED: 'booking_cancelled',
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(bookingData) {
  const { attendee, course, session, bookingRef, isElearning } = bookingData

  const emailContent = isElearning
    ? generateElearningConfirmation(attendee, course, bookingRef)
    : generateWebinarConfirmation(attendee, course, session, bookingRef)

  return await sendEmail({
    to: attendee.email,
    subject: emailContent.subject,
    body: emailContent.body,
    template: EMAIL_TEMPLATES.BOOKING_CONFIRMATION,
    metadata: {
      bookingRef,
      courseId: course.id,
      sessionId: session?.id,
    },
  })
}

/**
 * Send joining instructions with Zoom link
 */
export async function sendJoiningInstructions(bookingData, meetingData) {
  const { attendee, course, session, bookingRef } = bookingData

  const instructions = zoomService.generateJoiningInstructions(meetingData, {
    courseName: course.name,
    attendeeName: `${attendee.firstName} ${attendee.lastName}`,
    date: formatDate(session.date),
    time: session.time,
    trainer: session.trainer,
  })

  return await sendEmail({
    to: attendee.email,
    subject: instructions.subject,
    body: instructions.content,
    template: EMAIL_TEMPLATES.JOINING_INSTRUCTIONS,
    metadata: {
      bookingRef,
      meetingId: meetingData.id,
    },
  })
}

/**
 * Send 24-hour reminder
 */
export async function sendReminder24h(bookingData, meetingData) {
  const { attendee, course, session, bookingRef } = bookingData

  const emailContent = generateReminder(attendee, course, session, meetingData, '24 hours')

  return await sendEmail({
    to: attendee.email,
    subject: `Reminder: ${course.name} tomorrow`,
    body: emailContent,
    template: EMAIL_TEMPLATES.REMINDER_24H,
    metadata: { bookingRef },
  })
}

/**
 * Send 1-hour reminder
 */
export async function sendReminder1h(bookingData, meetingData) {
  const { attendee, course, session, bookingRef } = bookingData

  const emailContent = generateReminder(attendee, course, session, meetingData, '1 hour')

  return await sendEmail({
    to: attendee.email,
    subject: `Starting Soon: ${course.name}`,
    body: emailContent,
    template: EMAIL_TEMPLATES.REMINDER_1H,
    metadata: { bookingRef },
  })
}

/**
 * Send e-learning access instructions
 */
export async function sendElearningAccess(bookingData) {
  const { attendee, course, bookingRef } = bookingData

  const enrollmentLink = generateElearningEnrollmentLink(attendee.email, course.id)

  const emailContent = `
Dear ${attendee.firstName},

Your e-learning course is ready to access!

**Course:** ${course.name}
**Booking Reference:** ${bookingRef}

**Getting Started:**

1. Click the link below to create your account:
   ${enrollmentLink}

2. You will need to verify your email using 2-factor authentication

3. Once verified, you can start learning immediately

**Course Details:**
- Duration: ${course.duration}
- Certification: ${course.certification}
- Access Period: 12 months from enrollment

**Need Help?**
Contact our support team:
- Email: training@miad.co.uk
- Phone: 0800 123 4567

Happy learning!

Miad Healthcare Training Team
  `.trim()

  return await sendEmail({
    to: attendee.email,
    subject: `Access Your E-Learning: ${course.name}`,
    body: emailContent,
    template: EMAIL_TEMPLATES.ELEARNING_ACCESS,
    metadata: { bookingRef, courseId: course.id },
  })
}

/**
 * Send certificate ready notification
 */
export async function sendCertificateReady(attendee, course, certificateUrl) {
  const emailContent = `
Dear ${attendee.firstName},

Congratulations on completing ${course.name}!

Your certificate is now available for download:
${certificateUrl}

**Certificate Details:**
- Course: ${course.name}
- Certification: ${course.certification}
- Valid for: ${course.validityPeriod}
- Completion Date: ${formatDate(new Date())}

You can also access your certificate anytime from your Miad account.

Thank you for choosing Miad Healthcare Training.

Best regards,
Miad Healthcare Training Team
  `.trim()

  return await sendEmail({
    to: attendee.email,
    subject: `Certificate Ready: ${course.name}`,
    body: emailContent,
    template: EMAIL_TEMPLATES.CERTIFICATE_READY,
  })
}

/**
 * Send booking cancellation notification
 */
export async function sendCancellationNotification(bookingData, reason) {
  const { attendee, course, session, bookingRef } = bookingData

  const emailContent = `
Dear ${attendee.firstName},

We're writing to confirm the cancellation of your booking:

**Cancelled Booking:**
- Reference: ${bookingRef}
- Course: ${course.name}
${session ? `- Date: ${formatDate(session.date)}` : ''}

${reason ? `**Reason:** ${reason}` : ''}

If you did not request this cancellation, please contact us immediately.

**Need to Rebook?**
Visit our website to view available sessions:
https://miad.co.uk/courses

Contact us:
- Email: training@miad.co.uk
- Phone: 0800 123 4567

We hope to see you at a future training session.

Best regards,
Miad Healthcare Training Team
  `.trim()

  return await sendEmail({
    to: attendee.email,
    subject: `Booking Cancelled: ${course.name} (${bookingRef})`,
    body: emailContent,
    template: EMAIL_TEMPLATES.BOOKING_CANCELLED,
    metadata: { bookingRef },
  })
}

/**
 * Send trainer notification for new booking
 */
export async function notifyTrainer(trainer, session, attendee) {
  const emailContent = `
Hi ${trainer.name},

A new delegate has been booked onto your session:

**Session Details:**
- Course: ${session.courseName}
- Date: ${formatDate(session.date)}
- Time: ${session.time}

**New Delegate:**
- Name: ${attendee.firstName} ${attendee.lastName}
- Email: ${attendee.email}
- Organisation: ${attendee.organisation || 'Not specified'}

Current Delegates: ${session.delegateCount} / ${session.capacity}

View full register in your Trainer App.

Best regards,
Miad Admin System
  `.trim()

  return await sendEmail({
    to: trainer.email,
    subject: `New Booking: ${session.courseName} (${formatDate(session.date)})`,
    body: emailContent,
    template: 'trainer_notification',
    metadata: { sessionId: session.id },
  })
}

// Core email sending function (mock for prototype)
async function sendEmail({ to, subject, body, template, metadata = {} }) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Log for debugging
  console.log('📧 Email Sent:', {
    to,
    subject,
    template,
    timestamp: new Date().toISOString(),
  })

  // In production, this would integrate with:
  // - SendGrid, Mailgun, or AWS SES for transactional emails
  // - Email queue for reliable delivery
  // - Tracking for opens/clicks

  return {
    success: true,
    messageId: `msg_${Date.now()}`,
    to,
    subject,
    template,
    sentAt: new Date().toISOString(),
  }
}

// Helper functions
function generateWebinarConfirmation(attendee, course, session, bookingRef) {
  return {
    subject: `Booking Confirmed: ${course.name} - ${formatDate(session.date)}`,
    body: `
Dear ${attendee.firstName},

Thank you for booking with Miad Healthcare Training.

**Booking Confirmed:**
- Reference: ${bookingRef}
- Course: ${course.name}
- Date: ${formatDate(session.date)}
- Time: ${session.time}
- Trainer: ${session.trainer}
- Delivery: Live Webinar via Zoom

**What Happens Next:**
1. You will receive joining instructions with your Zoom link 24 hours before the session
2. A reminder will be sent 1 hour before the session starts
3. Your certificate will be emailed upon successful completion

**Course Information:**
- Duration: ${course.duration}
- Certification: ${course.certification}
- Valid for: ${course.validityPeriod}

If you need to make any changes to your booking, please contact us:
- Email: training@miad.co.uk
- Phone: 0800 123 4567

We look forward to seeing you!

Best regards,
Miad Healthcare Training Team
    `.trim(),
  }
}

function generateElearningConfirmation(attendee, course, bookingRef) {
  return {
    subject: `E-Learning Access: ${course.name}`,
    body: `
Dear ${attendee.firstName},

Thank you for your purchase. Your e-learning course is ready!

**Order Confirmed:**
- Reference: ${bookingRef}
- Course: ${course.name}
- Access: Immediate (12 months)

**Getting Started:**
A separate email with your login instructions will arrive shortly.

**Course Information:**
- Duration: ${course.duration}
- Certification: ${course.certification}
- Valid for: ${course.validityPeriod}

**What to Expect:**
1. Interactive online modules
2. Progress tracking
3. Assessment at the end
4. Automatic certificate on completion

Need help? Contact us:
- Email: training@miad.co.uk
- Phone: 0800 123 4567

Happy learning!

Miad Healthcare Training Team
    `.trim(),
  }
}

function generateReminder(attendee, course, session, meetingData, timeframe) {
  return `
Dear ${attendee.firstName},

This is a reminder that your training session starts in ${timeframe}.

**Session Details:**
- Course: ${course.name}
- Date: ${formatDate(session.date)}
- Time: ${session.time}
- Trainer: ${session.trainer}

**Join the Session:**
Click here to join: ${meetingData.joinUrl}

Meeting ID: ${meetingData.meetingId}
Password: ${meetingData.password}

**Quick Checklist:**
- Test your audio and video
- Find a quiet space
- Have a notepad ready

See you soon!

Miad Healthcare Training Team
  `.trim()
}

function generateElearningEnrollmentLink(email, courseId) {
  // In production, this would be a secure, time-limited enrollment link
  const token = btoa(`${email}:${courseId}:${Date.now()}`)
  return `https://learn.miad.co.uk/enroll?token=${token}`
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default {
  sendBookingConfirmation,
  sendJoiningInstructions,
  sendReminder24h,
  sendReminder1h,
  sendElearningAccess,
  sendCertificateReady,
  sendCancellationNotification,
  notifyTrainer,
  EMAIL_TEMPLATES,
}
