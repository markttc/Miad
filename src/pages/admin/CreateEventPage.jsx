import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Calendar,
  Clock,
  Users,
  User,
  Video,
  Save,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Globe,
  Lock,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { courses, courseCategories } from '../../data/courses'
import { logEventCreated } from '../../services/eventAuditService'
import MiadLogo from '../../assets/miad-logo.svg'

// Mock trainers data
// Tooltip component
function Tooltip({ children, content }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 w-72 p-3 text-sm bg-gray-900 border border-purple-800/50 rounded-lg shadow-xl -top-2 left-full ml-2">
          <div className="absolute -left-2 top-3 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-gray-900" />
          {content}
        </div>
      )}
    </div>
  )
}

// Mock trainers data
const trainers = [
  { id: 't1', name: 'Dr Sarah Mitchell', specialties: ['basic-life-support', 'medication-administration'] },
  { id: 't2', name: 'James Thompson', specialties: ['basic-life-support', 'manual-handling'] },
  { id: 't3', name: 'Emma Roberts', specialties: ['manual-handling', 'health-safety'] },
  { id: 't4', name: 'Dr Helen Clarke', specialties: ['safeguarding-adults', 'safeguarding-children'] },
  { id: 't5', name: 'Dr Michael Foster', specialties: ['medication-administration', 'wound-care'] },
  { id: 't6', name: 'Susan Walker RN', specialties: ['wound-care', 'venepuncture'] },
  { id: 't7', name: 'Dr Patricia Lee', specialties: ['infection-prevention', 'aseptic-technique'] },
  { id: 't8', name: 'Dr Richard Evans', specialties: ['mental-health-awareness', 'suicide-prevention'] },
  { id: 't9', name: 'Dr Lisa Morgan', specialties: ['dementia-awareness', 'mental-health-awareness'] },
  { id: 't10', name: 'Andrew Phillips', specialties: ['team-leadership', 'conflict-resolution'] },
]

function CreateEventPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    courseId: '',
    courseType: 'open', // 'open' or 'closed'
    clientName: '',
    date: '',
    startTime: '09:00',
    endTime: '13:00',
    trainerId: '',
    capacity: 20,
    price: '',
    notes: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isAdmin) {
    navigate('/login?type=admin')
    return null
  }

  const selectedCourse = courses.find((c) => c.id === formData.courseId)

  // Filter trainers based on selected course
  const availableTrainers = formData.courseId
    ? trainers.filter((t) => t.specialties.includes(formData.courseId))
    : trainers

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is updated
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    // Auto-set price when course is selected
    if (name === 'courseId') {
      const course = courses.find((c) => c.id === value)
      if (course) {
        setFormData((prev) => ({ ...prev, courseId: value, price: course.price.toString() }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.courseId) newErrors.courseId = 'Please select a course'
    if (!formData.date) newErrors.date = 'Please select a date'
    if (!formData.trainerId) newErrors.trainerId = 'Please select a trainer'
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price'
    }

    // Client name required for closed courses
    if (formData.courseType === 'closed' && !formData.clientName.trim()) {
      newErrors.clientName = 'Please enter the client or organisation name'
    }

    // Date must be in the future
    if (formData.date && new Date(formData.date) <= new Date()) {
      newErrors.date = 'Date must be in the future'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a session ID for the new event
    const newSessionId = `session-${Date.now()}`
    const selectedTrainer = trainers.find((t) => t.id === formData.trainerId)

    // Log the event creation to the audit trail
    logEventCreated(newSessionId, {
      courseName: selectedCourse?.name,
      date: formData.date,
      time: `${formData.startTime} - ${formData.endTime}`,
      trainer: selectedTrainer?.name || formData.trainerId,
      capacity: formData.capacity,
      price: formData.price,
      courseType: formData.courseType,
      clientName: formData.clientName || null,
    }, 'Admin User')

    // In production, this would save to the database
    console.log('Creating event:', formData)

    setIsSubmitting(false)
    setIsSuccess(true)

    // Redirect after 2 seconds
    setTimeout(() => {
      navigate('/admin/events')
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Event Created!</h2>
          <p className="text-white">Redirecting to events list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-purple-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-6">
            <Link to="/">
              <img src={MiadLogo} alt="Miad Healthcare" className="h-7" />
            </Link>
            <div className="border-l border-gray-700 pl-6">
              <div className="flex items-center gap-2 text-sm text-white mb-1">
                <Link to="/admin" className="hover:text-white">Dashboard</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/admin/events" className="hover:text-white">Events</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">Create Event</span>
              </div>
              <h1 className="text-xl font-bold text-white">Create New Event</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Course Selection */}
          <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-400" />
              Course Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select Course <span className="text-red-400">*</span>
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.courseId ? 'border-red-500' : 'border-purple-800/50'
                  }`}
                >
                  <option value="">Select a course...</option>
                  {courseCategories.map((category) => (
                    <optgroup key={category.id} label={category.name}>
                      {courses
                        .filter((c) => c.category === category.id && c.deliveryMethods.includes('webinar'))
                        .map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name} ({course.duration})
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                {errors.courseId && (
                  <p className="text-sm text-red-400 mt-1">{errors.courseId}</p>
                )}
              </div>

              {selectedCourse && (
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-white">{selectedCourse.description}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <span className="text-white">Duration: {selectedCourse.duration}</span>
                    <span className="text-white">Certification: {selectedCourse.certification}</span>
                    <span className="text-white">Valid: {selectedCourse.validityPeriod}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Course Type Selection */}
          <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              Course Type
              <Tooltip
                content={
                  <div className="text-white">
                    <p className="font-medium text-white mb-2">Open vs Closed Courses</p>
                    <p className="mb-2">
                      <span className="text-cyan-400 font-medium">Open courses</span> are publicly
                      available for anyone to book. They appear on the website and accept individual
                      bookings from different organisations.
                    </p>
                    <p>
                      <span className="text-purple-400 font-medium">Closed courses</span> are private
                      sessions for a specific client or organisation. They are not publicly listed
                      and all delegates come from the same company.
                    </p>
                  </div>
                }
              >
                <HelpCircle className="w-4 h-4 text-white hover:text-purple-400 transition-colors" />
              </Tooltip>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Open Course Option */}
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, courseType: 'open', clientName: '' }))}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.courseType === 'open'
                    ? 'border-cyan-500 bg-cyan-900/20'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.courseType === 'open' ? 'bg-cyan-600' : 'bg-gray-700'
                    }`}
                  >
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-semibold ${
                          formData.courseType === 'open' ? 'text-cyan-400' : 'text-white'
                        }`}
                      >
                        Open Course
                      </h3>
                      <Tooltip
                        content={
                          <div className="text-white">
                            <ul className="space-y-1 text-sm">
                              <li>• Listed on public website</li>
                              <li>• Anyone can book a place</li>
                              <li>• Mixed delegates from different companies</li>
                              <li>• Standard pricing applies</li>
                            </ul>
                          </div>
                        }
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-white" />
                      </Tooltip>
                    </div>
                    <p className="text-sm text-white mt-1">
                      Publicly available for individual bookings
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.courseType === 'open'
                        ? 'border-cyan-500 bg-cyan-500'
                        : 'border-gray-600'
                    }`}
                  >
                    {formData.courseType === 'open' && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </button>

              {/* Closed Course Option */}
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, courseType: 'closed' }))}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.courseType === 'closed'
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.courseType === 'closed' ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  >
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-semibold ${
                          formData.courseType === 'closed' ? 'text-purple-400' : 'text-white'
                        }`}
                      >
                        Closed Course
                      </h3>
                      <Tooltip
                        content={
                          <div className="text-white">
                            <ul className="space-y-1 text-sm">
                              <li>• Private session for one client</li>
                              <li>• Not listed publicly</li>
                              <li>• All delegates from same organisation</li>
                              <li>• Custom pricing available</li>
                              <li>• Can be held at client venue</li>
                            </ul>
                          </div>
                        }
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-white" />
                      </Tooltip>
                    </div>
                    <p className="text-sm text-white mt-1">
                      Private session for a specific client
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.courseType === 'closed'
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-600'
                    }`}
                  >
                    {formData.courseType === 'closed' && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Client Name field for closed courses */}
            {formData.courseType === 'closed' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Client / Organisation Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.clientName ? 'border-red-500' : 'border-purple-800/50'
                  }`}
                  placeholder="Enter client or organisation name..."
                />
                {errors.clientName && (
                  <p className="text-sm text-red-400 mt-1">{errors.clientName}</p>
                )}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Schedule
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.date ? 'border-red-500' : 'border-purple-800/50'
                  }`}
                />
                {errors.date && (
                  <p className="text-sm text-red-400 mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Trainer & Capacity */}
          <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Trainer & Capacity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Trainer <span className="text-red-400">*</span>
                </label>
                <select
                  name="trainerId"
                  value={formData.trainerId}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.trainerId ? 'border-red-500' : 'border-purple-800/50'
                  }`}
                >
                  <option value="">Select a trainer...</option>
                  {availableTrainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
                {errors.trainerId && (
                  <p className="text-sm text-red-400 mt-1">{errors.trainerId}</p>
                )}
                {formData.courseId && availableTrainers.length === 0 && (
                  <p className="text-sm text-amber-400 mt-1">
                    No trainers available for this course
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-purple-400">£</span>
              Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Price per Delegate <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white">£</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.price ? 'border-red-500' : 'border-purple-800/50'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-400 mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Notes (Internal)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Optional internal notes..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link
              to="/admin/events"
              className="text-white hover:text-white flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEventPage
