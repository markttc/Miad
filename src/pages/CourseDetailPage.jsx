import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Award,
  Video,
  Monitor,
  Layers,
  Building,
  Users,
  Calendar,
  CheckCircle,
  ChevronRight,
  BookOpen,
  Star,
} from 'lucide-react'
import { getCourseById, getSessionsByCourse, deliveryMethods, courseCategories } from '../data/courses'

function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [selectedSession, setSelectedSession] = useState(null)

  const course = getCourseById(courseId)
  const availableSessions = getSessionsByCourse(courseId)

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Course not found</p>
          <Link to="/courses" className="btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

  const category = courseCategories.find((c) => c.id === course.category)
  const hasWebinar = course.deliveryMethods.includes('webinar')
  const hasElearning = course.deliveryMethods.includes('elearning')
  const hasBlended = course.deliveryMethods.includes('blended')
  const hasClassroom = course.deliveryMethods.includes('classroom')

  const getDeliveryIcon = (method) => {
    switch (method) {
      case 'webinar':
        return <Video className="w-4 h-4" />
      case 'elearning':
        return <Monitor className="w-4 h-4" />
      case 'blended':
        return <Layers className="w-4 h-4" />
      case 'classroom':
        return <Building className="w-4 h-4" />
      default:
        return null
    }
  }

  const handleBookWebinar = (session = null) => {
    if (session) {
      navigate(`/book/${courseId}?type=webinar&session=${session.id}`)
    } else {
      navigate(`/book/${courseId}?type=webinar`)
    }
  }

  const handleBookElearning = () => {
    navigate(`/book/${courseId}?type=elearning`)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="text-white hover:text-white flex items-center gap-2 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="card">
              {/* Delivery Methods */}
              <div className="flex flex-wrap gap-2 mb-4">
                {course.deliveryMethods.map((method) => (
                  <span
                    key={method}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${
                      method === 'elearning'
                        ? 'bg-green-900/50 text-green-400'
                        : method === 'webinar'
                        ? 'bg-[#13d8a0]/10 text-[#13d8a0]'
                        : method === 'blended'
                        ? 'bg-purple-900/50 text-purple-400'
                        : 'bg-amber-900/50 text-amber-400'
                    }`}
                  >
                    {getDeliveryIcon(method)}
                    {deliveryMethods[method]?.label}
                  </span>
                ))}
              </div>

              {/* Category */}
              {category && (
                <span className="text-sm text-white mb-2 block">{category.name}</span>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{course.name}</h1>

              {/* Description */}
              <p className="text-white text-lg mb-6">{course.description}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 text-white">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#13d8a0]" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#13d8a0]" />
                  <span>{course.validityPeriod} validity</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#13d8a0]" />
                  <span>{course.certification}</span>
                </div>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#13d8a0]" />
                What You Will Learn
              </h2>
              <ul className="space-y-3">
                {course.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#13d8a0] mt-0.5 flex-shrink-0" />
                    <span className="text-white">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Accreditation */}
            <div className="card bg-[#13d8a0]/5 border border-[#13d8a0]/20">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-[#13d8a0]" />
                <div>
                  <h3 className="font-semibold text-white">Accreditation</h3>
                  <p className="text-[#13d8a0]">{course.accreditation}</p>
                </div>
              </div>
            </div>

            {/* Available Sessions (for webinar courses) */}
            {hasWebinar && availableSessions.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#13d8a0]" />
                  Upcoming Live Sessions
                </h2>
                <div className="space-y-3">
                  {availableSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedSession?.id === session.id
                          ? 'border-[#13d8a0] bg-[#13d8a0]/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">
                              {new Date(session.date).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-white">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {session.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {session.trainer}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">£{session.price}</div>
                          <div className="text-sm text-white">
                            {session.spotsRemaining} spots left
                          </div>
                        </div>
                      </div>
                      {selectedSession?.id === session.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookWebinar(session)
                          }}
                          className="mt-4 w-full btn-primary flex items-center justify-center gap-2"
                        >
                          Book This Session
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Options */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Book This Course</h3>

              <div className="mb-6">
                <div className="text-sm text-white">Starting from</div>
                <div className="text-3xl font-bold text-white">£{course.price}</div>
              </div>

              <div className="space-y-3">
                {/* E-Learning Option */}
                {hasElearning && (
                  <button
                    onClick={handleBookElearning}
                    className="w-full p-4 rounded-lg border border-green-700/50 bg-green-900/20 hover:bg-green-900/30 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-green-400" />
                        <div>
                          <div className="font-medium text-white group-hover:text-green-400 transition-colors">
                            E-Learning
                          </div>
                          <div className="text-sm text-white">Start immediately</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white group-hover:text-green-400 transition-colors" />
                    </div>
                  </button>
                )}

                {/* Webinar Option */}
                {hasWebinar && (
                  <button
                    onClick={() => handleBookWebinar()}
                    className="w-full p-4 rounded-lg border border-[#13d8a0]/50 bg-[#13d8a0]/10 hover:bg-[#13d8a0]/20 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-[#13d8a0]" />
                        <div>
                          <div className="font-medium text-white group-hover:text-[#13d8a0] transition-colors">
                            Live Webinar
                          </div>
                          <div className="text-sm text-white">
                            {availableSessions.length} sessions available
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white group-hover:text-[#13d8a0] transition-colors" />
                    </div>
                  </button>
                )}

                {/* Blended Option */}
                {hasBlended && (
                  <button
                    onClick={() => navigate(`/book/${courseId}?type=blended`)}
                    className="w-full p-4 rounded-lg border border-purple-700/50 bg-purple-900/20 hover:bg-purple-900/30 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Layers className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="font-medium text-white group-hover:text-purple-400 transition-colors">
                            Blended Learning
                          </div>
                          <div className="text-sm text-white">Online + practical</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white group-hover:text-purple-400 transition-colors" />
                    </div>
                  </button>
                )}

                {/* Classroom Option */}
                {hasClassroom && (
                  <button
                    onClick={() => navigate(`/book/${courseId}?type=classroom`)}
                    className="w-full p-4 rounded-lg border border-amber-700/50 bg-amber-900/20 hover:bg-amber-900/30 transition-colors text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-amber-400" />
                        <div>
                          <div className="font-medium text-white group-hover:text-amber-400 transition-colors">
                            Classroom
                          </div>
                          <div className="text-sm text-white">In-person training</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white group-hover:text-amber-400 transition-colors" />
                    </div>
                  </button>
                )}
              </div>

              {/* Help Text */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-sm text-white">
                  Need help choosing? Contact us at{' '}
                  <a
                    href="mailto:training@miad.co.uk"
                    className="text-[#13d8a0] hover:underline"
                  >
                    training@miad.co.uk
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage
