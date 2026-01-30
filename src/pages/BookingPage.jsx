import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Award,
  Video,
  Monitor,
  Users,
  Calendar,
  CheckCircle,
  CreditCard,
  Mail,
  User,
  Building,
  Phone,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { getCourseById, getSessionsByCourse, upcomingSessions } from '../data/courses'

const BOOKING_STEPS = ['details', 'attendee', 'payment', 'confirmation']

function BookingPage() {
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const sessionId = searchParams.get('session')
  const bookingType = searchParams.get('type') || 'webinar'

  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  const [selectedSession, setSelectedSession] = useState(null)
  const [attendeeInfo, setAttendeeInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organisation: '',
    jobTitle: '',
    marketingOptIn: false,
  })
  const [errors, setErrors] = useState({})

  const course = getCourseById(courseId)
  const availableSessions = getSessionsByCourse(courseId)

  useEffect(() => {
    if (sessionId) {
      const session = upcomingSessions.find((s) => s.id === sessionId)
      if (session) setSelectedSession(session)
    }
  }, [sessionId])

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Course not found</p>
          <Link to="/courses" className="btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

  const isElearning = bookingType === 'elearning' || !course.deliveryMethods.includes('webinar')

  const validateAttendeeInfo = () => {
    const newErrors = {}
    if (!attendeeInfo.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!attendeeInfo.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!attendeeInfo.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeInfo.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setAttendeeInfo((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleNextStep = () => {
    if (currentStep === 0 && !isElearning && !selectedSession) {
      alert('Please select a session')
      return
    }
    if (currentStep === 1 && !validateAttendeeInfo()) {
      return
    }
    setCurrentStep((prev) => Math.min(prev + 1, BOOKING_STEPS.length - 1))
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate booking reference
    const ref = `MIAD-${Date.now().toString(36).toUpperCase()}`
    setBookingRef(ref)
    setBookingComplete(true)
    setCurrentStep(3)
    setIsProcessing(false)
  }

  const price = selectedSession?.price || course.price

  // Confirmation Screen
  if (bookingComplete) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#13d8a0] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-300">
              Your training has been booked successfully.
            </p>
          </div>

          <div className="card mb-6">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-300 mb-1">Booking Reference</p>
              <p className="text-2xl font-mono font-bold text-[#13d8a0]">{bookingRef}</p>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="font-semibold text-white mb-4">Booking Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-300">Course</dt>
                  <dd className="text-white font-medium">{course.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-300">Type</dt>
                  <dd className="text-white">
                    {isElearning ? 'E-Learning (Instant Access)' : 'Live Webinar'}
                  </dd>
                </div>
                {selectedSession && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-gray-300">Date</dt>
                      <dd className="text-white">
                        {new Date(selectedSession.date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-300">Time</dt>
                      <dd className="text-white">{selectedSession.time}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-300">Trainer</dt>
                      <dd className="text-white">{selectedSession.trainer}</dd>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-300">Attendee</dt>
                  <dd className="text-white">
                    {attendeeInfo.firstName} {attendeeInfo.lastName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-300">Email</dt>
                  <dd className="text-white">{attendeeInfo.email}</dd>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-700">
                  <dt className="text-gray-300">Total Paid</dt>
                  <dd className="text-xl font-bold text-white">£{price}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="card bg-[#13d8a0]/10 border-[#13d8a0]/30">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#13d8a0] mt-0.5" />
              <div>
                <h4 className="font-medium text-white mb-1">What happens next?</h4>
                <p className="text-sm text-gray-300">
                  {isElearning ? (
                    <>
                      You will receive an email with instructions to create your e-learning account
                      using 2FA. Once verified, you can start your training immediately.
                    </>
                  ) : (
                    <>
                      You will receive a confirmation email with your booking details, followed by
                      joining instructions with Zoom link closer to your training date.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {isElearning && (
              <Link to="/elearning/my-courses" className="btn-primary">
                Go to My E-Learning
              </Link>
            )}
            <Link to="/courses" className="btn-secondary">
              Browse More Courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-300 hover:text-white flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Book Training</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['Course Details', 'Your Details', 'Payment'].map((label, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-[#13d8a0] text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`ml-2 text-sm ${
                  index <= currentStep ? 'text-white' : 'text-gray-300'
                }`}
              >
                {label}
              </span>
              {index < 2 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-[#13d8a0]' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 0: Course/Session Details */}
            {currentStep === 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">
                  {isElearning ? 'E-Learning Course' : 'Select Session'}
                </h2>

                {/* Course Info */}
                <div className="p-4 bg-gray-900 rounded-lg mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {isElearning ? (
                      <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs font-medium rounded inline-flex items-center gap-1">
                        <Monitor className="w-3.5 h-3.5" /> E-Learning
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-[#13d8a0]/20 text-[#13d8a0] text-xs font-medium rounded inline-flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" /> Live Webinar
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{course.name}</h3>
                  <p className="text-sm text-gray-300 mt-1">{course.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" /> {course.certification}
                    </span>
                  </div>
                </div>

                {/* Session Selection (for webinars) */}
                {!isElearning && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                      Available Sessions
                    </h3>
                    {availableSessions.length === 0 ? (
                      <div className="text-center py-8 text-gray-300">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        No sessions available for this course
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {availableSessions.map((session) => (
                          <label
                            key={session.id}
                            className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                              selectedSession?.id === session.id
                                ? 'border-[#13d8a0] bg-[#13d8a0]/10'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="session"
                                  checked={selectedSession?.id === session.id}
                                  onChange={() => setSelectedSession(session)}
                                  className="w-4 h-4 text-[#13d8a0]"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-300" />
                                    <span className="text-white font-medium">
                                      {new Date(session.date).toLocaleDateString('en-GB', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                      })}
                                    </span>
                                    <span className="text-gray-300">{session.time}</span>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-300">
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3.5 h-3.5" />
                                      {session.trainer}
                                    </span>
                                    <span>
                                      {session.spotsRemaining} spots left
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-lg font-semibold text-white">
                                £{session.price}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isElearning && (
                  <div className="p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white">Instant Access</h4>
                        <p className="text-sm text-gray-300">
                          Start learning immediately after purchase. Complete at your own pace
                          with 12 months access.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Attendee Details */}
            {currentStep === 1 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Your Details</h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        First Name <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input
                          type="text"
                          name="firstName"
                          value={attendeeInfo.firstName}
                          onChange={handleInputChange}
                          className={`input-field pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                          placeholder="John"
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-sm text-red-400 mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Last Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={attendeeInfo.lastName}
                        onChange={handleInputChange}
                        className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                        placeholder="Smith"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-400 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input
                        type="email"
                        name="email"
                        value={attendeeInfo.email}
                        onChange={handleInputChange}
                        className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="john.smith@nhs.net"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-400 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input
                        type="tel"
                        name="phone"
                        value={attendeeInfo.phone}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                        placeholder="+44 7700 900000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Organisation
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input
                        type="text"
                        name="organisation"
                        value={attendeeInfo.organisation}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                        placeholder="NHS Trust / Care Provider"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={attendeeInfo.jobTitle}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Staff Nurse"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="marketingOptIn"
                        checked={attendeeInfo.marketingOptIn}
                        onChange={handleInputChange}
                        className="w-4 h-4 mt-0.5 rounded border-gray-600 text-[#13d8a0] focus:ring-[#13d8a0]"
                      />
                      <span className="text-sm text-gray-300">
                        I would like to receive updates about new courses, special offers,
                        and healthcare training news from Miad.
                      </span>
                    </label>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Payment</h2>

                <div className="p-4 bg-gray-900 rounded-lg mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-6 h-6 text-[#13d8a0]" />
                    <span className="font-medium text-white">Pay securely with Stripe</span>
                  </div>

                  {/* Simulated Stripe Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="MM / YY"
                          maxLength={7}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Your payment is secured with 256-bit SSL encryption
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="font-semibold text-white mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm mb-6">
                <div>
                  <p className="text-gray-300">Course</p>
                  <p className="text-white font-medium">{course.name}</p>
                </div>

                <div>
                  <p className="text-gray-300">Delivery</p>
                  <p className="text-white">
                    {isElearning ? 'E-Learning (Instant Access)' : 'Live Webinar via Zoom'}
                  </p>
                </div>

                {selectedSession && (
                  <div>
                    <p className="text-gray-300">Session</p>
                    <p className="text-white">
                      {new Date(selectedSession.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })} - {selectedSession.time}
                    </p>
                  </div>
                )}

                {attendeeInfo.firstName && (
                  <div>
                    <p className="text-gray-300">Attendee</p>
                    <p className="text-white">
                      {attendeeInfo.firstName} {attendeeInfo.lastName}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-300">Total</span>
                  <span className="text-2xl font-bold text-white">£{price}</span>
                </div>

                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevStep}
                      className="btn-secondary flex-1"
                    >
                      Back
                    </button>
                  )}

                  {currentStep < 2 ? (
                    <button
                      onClick={handleNextStep}
                      className="btn-primary flex-1"
                      disabled={currentStep === 0 && !isElearning && !selectedSession}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Pay £{price}</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
