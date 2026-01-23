import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  Clock,
  Award,
  Video,
  Monitor,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react'
import { courses, courseCategories, deliveryMethods, getSessionsByCourse } from '../data/courses'
import DateTimeSlicer from '../components/admin/DateTimeSlicer'

function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [dateFilter, setDateFilter] = useState(null)

  const categoryFilter = searchParams.get('category') || 'all'
  const deliveryFilter = searchParams.get('delivery') || 'all'

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          course.name.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.certification.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Category filter
      if (categoryFilter !== 'all' && course.category !== categoryFilter) {
        return false
      }

      // Delivery method filter
      if (deliveryFilter !== 'all' && !course.deliveryMethods.includes(deliveryFilter)) {
        return false
      }

      // Date filter - check if course has sessions within the date range
      if (dateFilter) {
        const sessions = getSessionsByCourse(course.id)
        const hasSessionInRange = sessions.some((session) => {
          const sessionDate = new Date(session.date)
          return sessionDate >= dateFilter.start && sessionDate <= dateFilter.end
        })
        // If filtering by date and course has no sessions in range, exclude it
        // But keep e-learning courses that don't have scheduled sessions
        if (!hasSessionInRange && !course.deliveryMethods.includes('elearning')) {
          return false
        }
      }

      return true
    })
  }, [searchQuery, categoryFilter, deliveryFilter, dateFilter])

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === 'all') {
      newParams.delete(key)
    } else {
      newParams.set(key, value)
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
    setSearchQuery('')
    setDateFilter(null)
  }

  const hasActiveFilters = categoryFilter !== 'all' || deliveryFilter !== 'all' || searchQuery || dateFilter

  const getDeliveryIcon = (method) => {
    switch (method) {
      case 'webinar':
        return <Video className="w-3.5 h-3.5" />
      case 'elearning':
        return <Monitor className="w-3.5 h-3.5" />
      case 'blended':
        return <Layers className="w-3.5 h-3.5" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title mb-2">Healthcare Training Courses</h1>
          <p className="text-gray-400">
            Browse our full range of accredited healthcare training programmes
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-secondary flex items-center justify-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-[#13d8a0] rounded-full text-xs flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Date Filter */}
            <DateTimeSlicer onChange={setDateFilter} />

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="input-field w-48"
            >
              <option value="all">All Categories</option>
              {courseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Delivery Method Filter */}
            <select
              value={deliveryFilter}
              onChange={(e) => updateFilter('delivery', e.target.value)}
              className="input-field w-48"
            >
              <option value="all">All Delivery Methods</option>
              <option value="webinar">Live Webinars</option>
              <option value="elearning">E-Learning</option>
              <option value="blended">Blended Learning</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[#13d8a0] hover:text-[#2eeab5] text-sm font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {showFilters && (
          <div className="lg:hidden card mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Date
                </label>
                <DateTimeSlicer onChange={setDateFilter} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Categories</option>
                  {courseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery Method
                </label>
                <select
                  value={deliveryFilter}
                  onChange={(e) => updateFilter('delivery', e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Delivery Methods</option>
                  <option value="webinar">Live Webinars</option>
                  <option value="elearning">E-Learning</option>
                  <option value="blended">Blended Learning</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full btn-secondary"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white font-medium">{filteredCourses.length}</span> courses
          </p>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">No courses found matching your criteria</p>
            <button onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="card-hover group flex flex-col"
              >
                {/* Delivery Methods */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {course.deliveryMethods.map((method) => (
                    <span
                      key={method}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                        method === 'elearning'
                          ? 'bg-green-900/50 text-green-400'
                          : method === 'webinar'
                          ? 'bg-[#13d8a0]/10 text-[#13d8a0]'
                          : 'bg-purple-900/50 text-purple-400'
                      }`}
                    >
                      {getDeliveryIcon(method)}
                      {deliveryMethods[method]?.label}
                    </span>
                  ))}
                </div>

                {/* Course Info */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#13d8a0] transition-colors">
                  {course.name}
                </h3>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                  {course.description}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {course.validityPeriod}
                  </span>
                </div>

                {/* Accreditation */}
                <div className="text-xs text-[#13d8a0]/70 mb-4">
                  {course.accreditation}
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700 mt-auto">
                  <div>
                    <span className="text-xs text-gray-500">From</span>
                    <span className="text-xl font-bold text-white ml-2">£{course.price}</span>
                  </div>
                  <span className="text-[#13d8a0] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CoursesPage
