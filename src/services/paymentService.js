// Payment Service
// Handles Stripe integration for payment processing

// In production, these would come from environment variables
const STRIPE_CONFIG = {
  publishableKey: import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo',
  // Secret key would only be used server-side
}

/**
 * Create a payment intent for a booking
 * In production, this would call your backend which creates the intent via Stripe API
 */
export async function createPaymentIntent({ amount, currency = 'gbp', metadata = {} }) {
  // Simulate API call to backend
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock response (in production, this comes from Stripe via your backend)
  const clientSecret = `pi_${Date.now()}_secret_${generateRandomString(24)}`

  return {
    success: true,
    data: {
      clientSecret,
      paymentIntentId: `pi_${Date.now()}`,
      amount,
      currency,
      status: 'requires_payment_method',
    },
  }
}

/**
 * Process a card payment
 * In production, this would use Stripe.js confirmCardPayment
 */
export async function processCardPayment({
  clientSecret,
  cardDetails,
  billingDetails,
}) {
  // Simulate payment processing
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Validate card (basic mock validation)
  if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 16) {
    return {
      success: false,
      error: 'Invalid card number',
    }
  }

  // Mock successful payment (in production, Stripe handles this)
  const paymentId = `py_${Date.now()}`

  return {
    success: true,
    data: {
      paymentId,
      status: 'succeeded',
      amount: billingDetails?.amount,
      receiptUrl: `https://pay.stripe.com/receipts/${paymentId}`,
      processedAt: new Date().toISOString(),
    },
  }
}

/**
 * Create a checkout session for redirect-based payment
 * Alternative to embedded payment form
 */
export async function createCheckoutSession({
  lineItems,
  successUrl,
  cancelUrl,
  customerEmail,
  metadata = {},
}) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const sessionId = `cs_${Date.now()}`

  return {
    success: true,
    data: {
      sessionId,
      url: `https://checkout.stripe.com/pay/${sessionId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
    },
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentIntentId) {
  await new Promise((resolve) => setTimeout(resolve, 200))

  return {
    success: true,
    data: {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 8500, // £85.00 in pence
      currency: 'gbp',
      receiptEmail: 'customer@example.com',
    },
  }
}

/**
 * Process refund
 */
export async function processRefund({
  paymentIntentId,
  amount,
  reason,
}) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const refundId = `re_${Date.now()}`

  return {
    success: true,
    data: {
      refundId,
      paymentIntentId,
      amount,
      status: 'succeeded',
      reason,
      processedAt: new Date().toISOString(),
    },
  }
}

/**
 * Validate card number (Luhn algorithm)
 */
export function validateCardNumber(number) {
  const cleaned = number.replace(/\s/g, '')

  if (!/^\d{13,19}$/.test(cleaned)) {
    return { valid: false, error: 'Invalid card number length' }
  }

  // Luhn algorithm
  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  const valid = sum % 10 === 0

  return {
    valid,
    error: valid ? null : 'Invalid card number',
    cardType: getCardType(cleaned),
  }
}

/**
 * Get card type from number
 */
export function getCardType(number) {
  const cleaned = number.replace(/\s/g, '')

  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
  }

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleaned)) {
      return type
    }
  }

  return 'unknown'
}

/**
 * Format card number with spaces
 */
export function formatCardNumber(number) {
  const cleaned = number.replace(/\s/g, '')
  const cardType = getCardType(cleaned)

  // Amex: 4-6-5 format
  if (cardType === 'amex') {
    return cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3').trim()
  }

  // Others: 4-4-4-4 format
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

/**
 * Validate expiry date
 */
export function validateExpiry(month, year) {
  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  const expMonth = parseInt(month, 10)
  const expYear = parseInt(year, 10)

  if (expMonth < 1 || expMonth > 12) {
    return { valid: false, error: 'Invalid month' }
  }

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return { valid: false, error: 'Card has expired' }
  }

  return { valid: true }
}

/**
 * Validate CVC
 */
export function validateCVC(cvc, cardType) {
  const length = cardType === 'amex' ? 4 : 3

  if (!/^\d+$/.test(cvc) || cvc.length !== length) {
    return { valid: false, error: `CVC must be ${length} digits` }
  }

  return { valid: true }
}

// Helper function
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default {
  createPaymentIntent,
  processCardPayment,
  createCheckoutSession,
  getPaymentStatus,
  processRefund,
  validateCardNumber,
  validateExpiry,
  validateCVC,
  formatCardNumber,
  getCardType,
  STRIPE_CONFIG,
}
