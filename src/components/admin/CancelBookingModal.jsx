import { useState } from 'react'
import {
  X,
  AlertTriangle,
  CreditCard,
  FileText,
  Loader2,
  CheckCircle,
  User,
  Calendar,
  DollarSign,
} from 'lucide-react'

const cancellationReasons = [
  { id: 'customer_requested', label: 'Customer requested cancellation' },
  { id: 'session_cancelled', label: 'Session cancelled by provider' },
  { id: 'duplicate_booking', label: 'Duplicate booking' },
  { id: 'payment_failed', label: 'Payment failed/declined' },
  { id: 'no_show', label: 'Customer no-show' },
  { id: 'other', label: 'Other reason' },
]

function CancelBookingModal({ booking, onClose, onCancel }) {
  const [step, setStep] = useState('confirm') // confirm, processing, success
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [issueRefund, setIssueRefund] = useState(booking?.payment?.method === 'card')
  const [refundAmount, setRefundAmount] = useState(booking?.payment?.amount || 0)
  const [isPartialRefund, setIsPartialRefund] = useState(false)
  const [error, setError] = useState('')

  if (!booking) return null

  const isCardPayment = booking.payment?.method === 'card'
  const isPOPayment = booking.payment?.method === 'purchase_order' || booking.payment?.method === 'invoice'
  const fullAmount = booking.payment?.amount || 0

  const getCancellationReason = () => {
    if (selectedReason === 'other') {
      return customReason || 'Other reason'
    }
    return cancellationReasons.find((r) => r.id === selectedReason)?.label || selectedReason
  }

  const handleCancel = async () => {
    if (!selectedReason) {
      setError('Please select a cancellation reason')
      return
    }

    if (selectedReason === 'other' && !customReason.trim()) {
      setError('Please provide a reason for cancellation')
      return
    }

    setError('')
    setStep('processing')

    try {
      await onCancel({
        bookingId: booking.id,
        reason: getCancellationReason(),
        issueRefund: issueRefund,
        refundAmount: isPartialRefund ? refundAmount : fullAmount,
      })
      setStep('success')
    } catch (err) {
      setError(err.message || 'Failed to cancel booking')
      setStep('confirm')
    }
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />
        <div className="relative bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Booking Cancelled</h2>
            <p className="text-gray-300 mb-4">
              Booking <span className="text-white font-mono">{booking.bookingRef}</span> has been cancelled.
            </p>
            {issueRefund && (
              <p className="text-sm text-green-400 mb-4">
                {isCardPayment ? (
                  <>Refund of £{isPartialRefund ? refundAmount : fullAmount} has been processed.</>
                ) : (
                  <>£{isPartialRefund ? refundAmount : fullAmount} has been credited to the customer account.</>
                )}
              </p>
            )}
            <button onClick={onClose} className="btn-primary w-full">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Processing state
  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-[#13d8a0] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Processing Cancellation</h2>
            <p className="text-gray-300">Please wait...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cancel Booking</h2>
              <p className="text-sm text-gray-300">{booking.bookingRef}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Booking Summary</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-300" />
              <span className="text-white">
                {booking.attendee?.firstName} {booking.attendee?.lastName}
              </span>
              <span className="text-gray-300">({booking.attendee?.email})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-300" />
              <span className="text-white">{booking.courseName}</span>
            </div>
            {booking.sessionDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-300" />
                <span className="text-white">
                  {new Date(booking.sessionDate).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {booking.sessionTime && ` at ${booking.sessionTime}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-gray-300" />
              <span className="text-white">£{fullAmount}</span>
              <span className={`px-2 py-0.5 text-xs rounded ${
                isCardPayment ? 'bg-green-900/50 text-green-400' : 'bg-amber-900/50 text-amber-400'
              }`}>
                {isCardPayment ? 'Card' : 'Purchase Order'}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Reason */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reason for Cancellation <span className="text-red-400">*</span>
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
          >
            <option value="">Select a reason...</option>
            {cancellationReasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.label}
              </option>
            ))}
          </select>

          {selectedReason === 'other' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please provide details..."
              className="mt-3 w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
              rows={3}
            />
          )}
        </div>

        {/* Refund Options */}
        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            {isCardPayment ? (
              <CreditCard className="w-4 h-4 text-green-400" />
            ) : (
              <FileText className="w-4 h-4 text-amber-400" />
            )}
            {isCardPayment ? 'Refund Options' : 'Credit Options'}
          </h3>

          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={issueRefund}
              onChange={(e) => setIssueRefund(e.target.checked)}
              className="w-4 h-4 mt-1 rounded border-gray-600 text-[#13d8a0] focus:ring-[#13d8a0]"
            />
            <div>
              <span className="text-white">
                {isCardPayment ? 'Issue refund to card' : 'Credit customer account'}
              </span>
              <p className="text-xs text-gray-300 mt-1">
                {isCardPayment
                  ? 'Refund will be processed via Stripe (3-5 business days)'
                  : 'Amount will be credited back to the customer credit account'}
              </p>
            </div>
          </label>

          {issueRefund && (
            <div className="pl-7">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="radio"
                  name="refundType"
                  checked={!isPartialRefund}
                  onChange={() => setIsPartialRefund(false)}
                  className="w-4 h-4 border-gray-600 text-[#13d8a0] focus:ring-[#13d8a0]"
                />
                <span className="text-white">Full refund (£{fullAmount})</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="refundType"
                  checked={isPartialRefund}
                  onChange={() => setIsPartialRefund(true)}
                  className="w-4 h-4 border-gray-600 text-[#13d8a0] focus:ring-[#13d8a0]"
                />
                <span className="text-white">Partial refund</span>
              </label>

              {isPartialRefund && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-gray-300">£</span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Math.min(fullAmount, Math.max(0, parseFloat(e.target.value) || 0)))}
                    max={fullAmount}
                    min={0}
                    step="0.01"
                    className="w-32 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
                  />
                  <span className="text-sm text-gray-300">of £{fullAmount}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Warning */}
        <div className="mb-6 p-3 bg-amber-900/30 border border-amber-800 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-300">
            <p className="font-medium">This action cannot be undone</p>
            <p className="text-amber-400/80">
              The attendee will be notified of the cancellation via email.
              {booking.zoomMeeting && ' The Zoom meeting will also be cancelled.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary">
            Keep Booking
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  )
}

export default CancelBookingModal
