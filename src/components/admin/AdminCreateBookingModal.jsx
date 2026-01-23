import { useState, useMemo } from 'react'
import {
  X,
  Search,
  User,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Video,
  Monitor,
  Calendar,
  Clock,
  Users,
  CreditCard,
  FileText,
  CheckCircle,
  Loader2,
  Building,
  Mail,
  Phone,
  Briefcase,
} from 'lucide-react'
import { courses, getSessionsByCourse, courseCategories } from '../../data/courses'
import { searchBookingsForCustomer, createAdminBooking } from '../../services/bookingService'
import CustomerAccountSelector from './CustomerAccountSelector'

const STEPS = ['customer', 'course', 'payment', 'review']

function AdminCreateBookingModal({ onClose, onSuccess, adminUser = 'TTC Admin' }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // Customer state
  const [customerMode, setCustomerMode] = useState('search') // search | new
  const [customerSearch, setCustomerSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organisation: '',
    jobTitle: '',
  })

  // Course state
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [deliveryType, setDeliveryType] = useState('webinar') // webinar | elearning

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card') // card | purchase_order
  const [poNumber, setPONumber] = useState('')
  const [customerAccountId, setCustomerAccountId] = useState('')

  // Booking result
  const [bookingResult, setBookingResult] = useState(null)

  // Get available sessions for selected course
  const availableSessions = selectedCourse ? getSessionsByCourse(selectedCourse.id) : []

  // Calculate price
  const price = selectedSession?.price || selectedCourse?.price || 0

  // Get customer data for booking
  const getCustomerData = () => {
    if (selectedCustomer) {
      return selectedCustomer
    }
    return newCustomer
  }

  // Search customers
  const handleCustomerSearch = (query) => {
    setCustomerSearch(query)
    if (query.length >= 2) {
      const results = searchBookingsForCustomer(query)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  // Validate current step
  const validateStep = () => {
    setError('')

    switch (currentStep) {
      case 0: // Customer
        const customer = getCustomerData()
        if (!customer.firstName?.trim()) {
          setError('First name is required')
          return false
        }
        if (!customer.lastName?.trim()) {
          setError('Last name is required')
          return false
        }
        if (!customer.email?.trim()) {
          setError('Email is required')
          return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
          setError('Please enter a valid email address')
          return false
        }
        return true

      case 1: // Course
        if (!selectedCourse) {
          setError('Please select a course')
          return false
        }
        if (deliveryType === 'webinar' && !selectedSession) {
          setError('Please select a session')
          return false
        }
        return true

      case 2: // Payment
        if (paymentMethod === 'purchase_order') {
          if (!poNumber.trim()) {
            setError('Please enter a Purchase Order number')
            return false
          }
          if (!customerAccountId) {
            setError('Please select a customer account')
            return false
          }
        }
        return true

      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
    setError('')
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    setError('')

    try {
      const customer = getCustomerData()
      const result = await createAdminBooking({
        course: selectedCourse,
        session: deliveryType === 'webinar' ? selectedSession : null,
        attendee: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || '',
          organisation: customer.organisation || '',
          jobTitle: customer.jobTitle || '',
        },
        paymentMethod,
        paymentData: paymentMethod === 'purchase_order'
          ? { poNumber, customerAccountId }
          : {},
        adminUser,
      })

      if (result.success) {
        setBookingResult(result.data)
        setCurrentStep(4) // Success step
        onSuccess?.(result.data)
      } else {
        setError(result.error || 'Failed to create booking')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetAndClose = () => {
    setCurrentStep(0)
    setCustomerMode('search')
    setCustomerSearch('')
    setSearchResults([])
    setSelectedCustomer(null)
    setNewCustomer({ firstName: '', lastName: '', email: '', phone: '', organisation: '', jobTitle: '' })
    setSelectedCourse(null)
    setSelectedSession(null)
    setDeliveryType('webinar')
    setPaymentMethod('card')
    setPONumber('')
    setCustomerAccountId('')
    setBookingResult(null)
    setError('')
    onClose()
  }

  // Success State
  if (currentStep === 4 && bookingResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70" onClick={resetAndClose} />
        <div className="relative bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#13d8a0] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Booking Created!</h2>
            <p className="text-gray-400 mb-4">
              The booking has been successfully created.
            </p>

            <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
              <p className="text-2xl font-mono font-bold text-[#13d8a0]">{bookingResult.bookingRef}</p>
            </div>

            <div className="text-left space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Attendee</span>
                <span className="text-white">
                  {getCustomerData().firstName} {getCustomerData().lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Course</span>
                <span className="text-white">{selectedCourse?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment</span>
                <span className="text-white">
                  £{price} via {paymentMethod === 'card' ? 'Card' : 'PO'}
                </span>
              </div>
            </div>

            <button onClick={resetAndClose} className="w-full btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Create Booking</h2>
            <p className="text-sm text-gray-400">Admin offline booking</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {['Customer', 'Course', 'Payment', 'Review'].map((label, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-[#13d8a0] text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm hidden sm:inline ${
                  index <= currentStep ? 'text-white' : 'text-gray-500'
                }`}>
                  {label}
                </span>
                {index < 3 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                    index < currentStep ? 'bg-[#13d8a0]' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: Customer Selection */}
          {currentStep === 0 && (
            <div>
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setCustomerMode('search')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    customerMode === 'search'
                      ? 'bg-[#13d8a0] text-white'
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Find Existing
                </button>
                <button
                  onClick={() => setCustomerMode('new')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    customerMode === 'new'
                      ? 'bg-[#13d8a0] text-white'
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  New Customer
                </button>
              </div>

              {customerMode === 'search' ? (
                <div>
                  {/* Search Input */}
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                      placeholder="Search by name, email or organisation..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
                    />
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {searchResults.map((customer, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setCustomerSearch('')
                            setSearchResults([])
                          }}
                          className={`w-full p-4 rounded-lg border text-left transition-colors ${
                            selectedCustomer?.email === customer.email
                              ? 'border-[#13d8a0] bg-[#13d8a0]/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {customer.firstName} {customer.lastName}
                              </p>
                              <p className="text-sm text-gray-400">{customer.email}</p>
                              {customer.organisation && (
                                <p className="text-xs text-gray-500">{customer.organisation}</p>
                              )}
                            </div>
                            <div className="ml-auto text-xs text-gray-500">
                              {customer.bookingCount} booking{customer.bookingCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Customer Display */}
                  {selectedCustomer && (
                    <div className="p-4 bg-[#13d8a0]/10 border border-[#13d8a0]/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#13d8a0]">Selected Customer</span>
                        <button
                          onClick={() => setSelectedCustomer(null)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-white font-medium">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{selectedCustomer.email}</p>
                    </div>
                  )}

                  {!selectedCustomer && customerSearch.length < 2 && (
                    <p className="text-center text-gray-500 py-8">
                      Enter at least 2 characters to search
                    </p>
                  )}
                </div>
              ) : (
                /* New Customer Form */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        First Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={newCustomer.firstName}
                        onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Last Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={newCustomer.lastName}
                        onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="tel"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Organisation</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={newCustomer.organisation}
                        onChange={(e) => setNewCustomer({ ...newCustomer, organisation: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={newCustomer.jobTitle}
                        onChange={(e) => setNewCustomer({ ...newCustomer, jobTitle: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Course Selection */}
          {currentStep === 1 && (
            <div>
              {/* Course Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Course <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedCourse?.id || ''}
                  onChange={(e) => {
                    const course = courses.find((c) => c.id === e.target.value)
                    setSelectedCourse(course || null)
                    setSelectedSession(null)
                    // Set delivery type based on course
                    if (course) {
                      if (course.deliveryMethods.includes('webinar')) {
                        setDeliveryType('webinar')
                      } else if (course.deliveryMethods.includes('elearning')) {
                        setDeliveryType('elearning')
                      }
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
                >
                  <option value="">Select a course...</option>
                  {courseCategories.map((category) => (
                    <optgroup key={category.id} label={category.name}>
                      {courses
                        .filter((c) => c.category === category.id)
                        .map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name} - £{course.price}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Course Details */}
              {selectedCourse && (
                <>
                  <div className="p-4 bg-gray-900/50 rounded-lg mb-6">
                    <h3 className="font-medium text-white mb-2">{selectedCourse.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{selectedCourse.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedCourse.duration}
                      </span>
                      <span>£{selectedCourse.price}</span>
                    </div>
                  </div>

                  {/* Delivery Type Toggle */}
                  {selectedCourse.deliveryMethods.length > 1 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Delivery Method
                      </label>
                      <div className="flex gap-2">
                        {selectedCourse.deliveryMethods.includes('webinar') && (
                          <button
                            onClick={() => setDeliveryType('webinar')}
                            className={`flex-1 py-3 px-4 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                              deliveryType === 'webinar'
                                ? 'border-[#13d8a0] bg-[#13d8a0]/10 text-[#13d8a0]'
                                : 'border-gray-700 text-gray-400 hover:border-gray-600'
                            }`}
                          >
                            <Video className="w-4 h-4" />
                            Live Webinar
                          </button>
                        )}
                        {selectedCourse.deliveryMethods.includes('elearning') && (
                          <button
                            onClick={() => {
                              setDeliveryType('elearning')
                              setSelectedSession(null)
                            }}
                            className={`flex-1 py-3 px-4 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                              deliveryType === 'elearning'
                                ? 'border-green-500 bg-green-500/10 text-green-400'
                                : 'border-gray-700 text-gray-400 hover:border-gray-600'
                            }`}
                          >
                            <Monitor className="w-4 h-4" />
                            E-Learning
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Session Selection */}
                  {deliveryType === 'webinar' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Session <span className="text-red-400">*</span>
                      </label>
                      {availableSessions.length === 0 ? (
                        <div className="p-4 bg-amber-900/20 border border-amber-800 rounded-lg text-amber-300 text-sm">
                          No sessions available for this course
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {availableSessions.map((session) => (
                            <button
                              key={session.id}
                              onClick={() => setSelectedSession(session)}
                              className={`w-full p-4 rounded-lg border text-left transition-colors ${
                                selectedSession?.id === session.id
                                  ? 'border-[#13d8a0] bg-[#13d8a0]/10'
                                  : 'border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-white font-medium">
                                      {new Date(session.date).toLocaleDateString('en-GB', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                      })}
                                    </span>
                                    <span className="text-gray-400">{session.time}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3.5 h-3.5" />
                                      {session.trainer}
                                    </span>
                                    <span>{session.spotsRemaining} spots left</span>
                                  </div>
                                </div>
                                <span className="text-lg font-bold text-white">£{session.price}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* E-Learning Info */}
                  {deliveryType === 'elearning' && (
                    <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-white">Instant Access</h4>
                          <p className="text-sm text-gray-400">
                            The attendee will receive access instructions immediately after booking.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <div>
              {/* Price Summary */}
              <div className="p-4 bg-gray-900/50 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount to charge</span>
                  <span className="text-2xl font-bold text-white">£{price}</span>
                </div>
              </div>

              {/* Payment Method Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-4 px-4 rounded-lg border transition-colors flex flex-col items-center gap-2 ${
                      paymentMethod === 'card'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-green-400' : 'text-gray-400'}`} />
                    <span className={paymentMethod === 'card' ? 'text-white' : 'text-gray-400'}>
                      Card Payment
                    </span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('purchase_order')}
                    className={`flex-1 py-4 px-4 rounded-lg border transition-colors flex flex-col items-center gap-2 ${
                      paymentMethod === 'purchase_order'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <FileText className={`w-6 h-6 ${paymentMethod === 'purchase_order' ? 'text-amber-400' : 'text-gray-400'}`} />
                    <span className={paymentMethod === 'purchase_order' ? 'text-white' : 'text-gray-400'}>
                      Purchase Order
                    </span>
                  </button>
                </div>
              </div>

              {/* Card Payment Info */}
              {paymentMethod === 'card' && (
                <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                  <p className="text-sm text-green-300">
                    Payment will be recorded as processed via admin terminal.
                    In production, this would integrate with Stripe for MOTO payments.
                  </p>
                </div>
              )}

              {/* Purchase Order Fields */}
              {paymentMethod === 'purchase_order' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Purchase Order Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPONumber(e.target.value)}
                      placeholder="e.g., PO-2026-001234"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Customer Account <span className="text-red-400">*</span>
                    </label>
                    <CustomerAccountSelector
                      value={customerAccountId}
                      onChange={setCustomerAccountId}
                      requiredAmount={price}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Review Booking Details</h3>

              {/* Customer */}
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Customer</h4>
                <p className="text-white font-medium">
                  {getCustomerData().firstName} {getCustomerData().lastName}
                </p>
                <p className="text-sm text-gray-400">{getCustomerData().email}</p>
                {getCustomerData().organisation && (
                  <p className="text-sm text-gray-500">{getCustomerData().organisation}</p>
                )}
              </div>

              {/* Course */}
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Course</h4>
                <p className="text-white font-medium">{selectedCourse?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {deliveryType === 'webinar' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#13d8a0]/10 text-[#13d8a0] text-xs rounded">
                      <Video className="w-3 h-3" /> Live Webinar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded">
                      <Monitor className="w-3 h-3" /> E-Learning
                    </span>
                  )}
                </div>
                {selectedSession && (
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(selectedSession.date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })} at {selectedSession.time}
                  </p>
                )}
              </div>

              {/* Payment */}
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Payment</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                      paymentMethod === 'card'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-amber-900/50 text-amber-400'
                    }`}>
                      {paymentMethod === 'card' ? (
                        <><CreditCard className="w-3 h-3" /> Card</>
                      ) : (
                        <><FileText className="w-3 h-3" /> Purchase Order</>
                      )}
                    </span>
                    {paymentMethod === 'purchase_order' && poNumber && (
                      <p className="text-sm text-gray-400 mt-1">PO: {poNumber}</p>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-white">£{price}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700">
          <button
            onClick={currentStep === 0 ? onClose : handleBack}
            className="btn-secondary"
          >
            {currentStep === 0 ? 'Cancel' : (
              <span className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </span>
            )}
          </button>

          {currentStep < 3 ? (
            <button onClick={handleNext} className="btn-primary flex items-center gap-1">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="btn-primary flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Create Booking
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminCreateBookingModal
