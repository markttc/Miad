import { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  Users,
  User,
  Video,
  Save,
  AlertCircle,
} from 'lucide-react'
import { courses, courseCategories } from '../../data/courses'
import { logEventUpdated } from '../../services/eventAuditService'

// Mock trainers data (same as CreateEventPage)
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

function EditEventModal({ session, onClose, onSave }) {
  const [formData, setFormData] = useState({
    courseId: '',
    date: '',
    startTime: '09:00',
    endTime: '13:00',
    trainer: '',
    capacity: 20,
    price: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form with session data
  useEffect(() => {
    if (session) {
      // Parse time range (e.g., "09:00 - 13:00")
      const timeParts = session.time.split(' - ')
      const startTime = timeParts[0] || '09:00'
      const endTime = timeParts[1] || '13:00'

      setFormData({
        courseId: session.courseId,
        date: session.date,
        startTime,
        endTime,
        trainer: session.trainer,
        capacity: session.spotsTotal,
        price: session.price.toString(),
      })
    }
  }, [session])

  if (!session) return null

  const selectedCourse = courses.find((c) => c.id === formData.courseId)
  const booked = session.spotsTotal - session.spotsRemaining

  // Filter trainers based on selected course
  const availableTrainers = formData.courseId
    ? trainers.filter((t) => t.specialties.includes(formData.courseId))
    : trainers

  // Check if current trainer is in the list, if not add them
  const trainerInList = availableTrainers.some((t) => t.name === formData.trainer)
  const displayTrainers = trainerInList
    ? availableTrainers
    : [...availableTrainers, { id: 'current', name: formData.trainer, specialties: [] }]

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
    if (!formData.trainer) newErrors.trainer = 'Please select a trainer'
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price'
    }

    // Capacity must be at least the number already booked
    if (formData.capacity < booked) {
      newErrors.capacity = `Capacity cannot be less than ${booked} (already booked)`
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

    const updatedSession = {
      ...session,
      courseId: formData.courseId,
      date: formData.date,
      time: `${formData.startTime} - ${formData.endTime}`,
      trainer: formData.trainer,
      spotsTotal: parseInt(formData.capacity),
      spotsRemaining: parseInt(formData.capacity) - booked,
      price: parseFloat(formData.price),
    }

    // Log the changes to the audit trail
    const previousData = {
      courseId: session.courseId,
      courseName: courses.find((c) => c.id === session.courseId)?.name,
      date: session.date,
      time: session.time,
      trainer: session.trainer,
      spotsTotal: session.spotsTotal,
      price: session.price,
    }

    const newData = {
      courseId: updatedSession.courseId,
      courseName: courses.find((c) => c.id === updatedSession.courseId)?.name,
      date: updatedSession.date,
      time: updatedSession.time,
      trainer: updatedSession.trainer,
      spotsTotal: updatedSession.spotsTotal,
      price: updatedSession.price,
    }

    logEventUpdated(session.id, previousData, newData, 'Admin User')

    setIsSubmitting(false)
    onSave(updatedSession)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl border border-purple-800/50 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-800/50">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Event</h2>
            <p className="text-sm text-white mt-1">
              {booked > 0 && (
                <span className="text-amber-400">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  {booked} booking{booked !== 1 ? 's' : ''} already made
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
            {/* Course Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                <Video className="w-4 h-4 text-purple-400" />
                Course <span className="text-red-400">*</span>
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
              {selectedCourse && (
                <p className="text-sm text-white mt-2">{selectedCourse.description}</p>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.date ? 'border-red-500' : 'border-purple-800/50'
                  }`}
                />
                {errors.date && (
                  <p className="text-sm text-red-400 mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Clock className="w-4 h-4 text-purple-400" />
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
                <label className="text-sm font-medium text-white mb-2 block">
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

            {/* Trainer */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                <User className="w-4 h-4 text-purple-400" />
                Trainer <span className="text-red-400">*</span>
              </label>
              <select
                name="trainer"
                value={formData.trainer}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.trainer ? 'border-red-500' : 'border-purple-800/50'
                }`}
              >
                <option value="">Select a trainer...</option>
                {displayTrainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.name}>
                    {trainer.name}
                  </option>
                ))}
              </select>
              {errors.trainer && (
                <p className="text-sm text-red-400 mt-1">{errors.trainer}</p>
              )}
            </div>

            {/* Capacity & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min={booked || 1}
                  max="100"
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.capacity ? 'border-red-500' : 'border-purple-800/50'
                  }`}
                />
                {errors.capacity && (
                  <p className="text-sm text-red-400 mt-1">{errors.capacity}</p>
                )}
                {booked > 0 && !errors.capacity && (
                  <p className="text-sm text-white mt-1">
                    Minimum: {booked} (already booked)
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <span className="text-purple-400">£</span>
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
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-purple-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditEventModal
