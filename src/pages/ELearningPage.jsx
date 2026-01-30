import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Monitor,
  Clock,
  Award,
  Play,
  CheckCircle,
  Zap,
  BookOpen,
  ChevronRight,
  Search,
  Filter,
  Grid,
  List,
  X,
  Star,
  Users,
  Shield,
  Smartphone,
} from 'lucide-react'
import { courses, courseCategories } from '../data/courses'

function ELearningPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [priceRange, setPriceRange] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCourse, setSelectedCourse] = useState(null)

  // Filter courses that offer e-learning
  const elearningCourses = useMemo(() => {
    return courses.filter((c) => c.deliveryMethods.includes('elearning'))
  }, [])

  // Apply filters
  const filteredCourses = useMemo(() => {
    return elearningCourses.filter((course) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          course.name.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Category filter
      if (selectedCategory !== 'all' && course.category !== selectedCategory) {
        return false
      }

      // Price range filter
      if (priceRange !== 'all') {
        if (priceRange === 'under-50' && course.price >= 50) return false
        if (priceRange === '50-100' && (course.price < 50 || course.price > 100)) return false
        if (priceRange === 'over-100' && course.price <= 100) return false
      }

      return true
    })
  }, [elearningCourses, searchQuery, selectedCategory, priceRange])

  // Get categories that have e-learning courses
  const availableCategories = useMemo(() => {
    return courseCategories.filter((cat) =>
      elearningCourses.some((course) => course.category === cat.id)
    )
  }, [elearningCourses])

  // Stats
  const stats = useMemo(() => {
    const avgPrice = elearningCourses.reduce((sum, c) => sum + c.price, 0) / elearningCourses.length
    return {
      total: elearningCourses.length,
      filtered: filteredCourses.length,
      categories: availableCategories.length,
      avgPrice: Math.round(avgPrice),
    }
  }, [elearningCourses, filteredCourses, availableCategories])

  const getPriceColor = (price) => {
    if (price < 50) return 'green'
    if (price < 100) return 'cyan'
    return 'purple'
  }

  const colorClasses = {
    green: {
      bg: 'bg-[#13d8a0]',
      bgLight: 'bg-[#13d8a0]/20',
      border: 'border-[#13d8a0]',
      text: 'text-[#13d8a0]',
    },
    cyan: {
      bg: 'bg-[#13d8a0]',
      bgLight: 'bg-[#13d8a0]/20',
      border: 'border-[#13d8a0]',
      text: 'text-[#13d8a0]',
    },
    purple: {
      bg: 'bg-purple-600',
      bgLight: 'bg-purple-900/40',
      border: 'border-purple-500',
      text: 'text-purple-400',
    },
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setPriceRange('all')
  }

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || priceRange !== 'all'

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-12 bg-gradient-to-b from-[#13d8a0]/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#13d8a0]/10 rounded-full border border-[#13d8a0]/30 mb-6">
              <Zap className="w-4 h-4 text-[#13d8a0]" />
              <span className="text-sm text-[#2eeab5]">Start Learning Immediately</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Self-Paced{' '}
              <span className="text-[#13d8a0]">
                E-Learning
              </span>
            </h1>

            <p className="text-xl text-white mb-6">
              Complete your training at your own pace. Purchase, enroll, and start learning within minutes.
              Certificates issued automatically on completion.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-[#13d8a0]" />
                Instant Access
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-[#13d8a0]" />
                Learn at Your Pace
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-[#13d8a0]" />
                Auto Certificates
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-[#13d8a0]" />
                Mobile Friendly
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-4 bg-gray-800/50 border-y border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-white">Courses Available</p>
            </div>
            <div className="w-px bg-gray-700" />
            <div>
              <p className="text-2xl font-bold text-[#13d8a0]">{stats.categories}</p>
              <p className="text-xs text-white">Categories</p>
            </div>
            <div className="w-px bg-gray-700" />
            <div>
              <p className="text-2xl font-bold text-[#13d8a0]">£{stats.avgPrice}</p>
              <p className="text-xs text-white">Average Price</p>
            </div>
            <div className="w-px bg-gray-700" />
            <div>
              <p className="text-2xl font-bold text-purple-400">12</p>
              <p className="text-xs text-white">Months Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 border-b border-gray-800 sticky top-16 bg-gray-900/95 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-[#13d8a0]/30 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-[#13d8a0]/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-[#13d8a0]/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#13d8a0]"
            >
              <option value="all">All Prices</option>
              <option value="under-50">Under £50</option>
              <option value="50-100">£50 - £100</option>
              <option value="over-100">Over £100</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-white hover:text-white transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}

            {/* View Toggle */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-white">{filteredCourses.length} courses</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#13d8a0] text-white'
                    : 'bg-gray-800 text-white hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#13d8a0] text-white'
                    : 'bg-gray-800 text-white hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: 1, title: 'Choose', desc: 'Browse courses', icon: BookOpen, color: 'green' },
              { step: 2, title: 'Purchase', desc: 'Secure payment', icon: Shield, color: 'cyan' },
              { step: 3, title: 'Learn', desc: 'Start immediately', icon: Play, color: 'purple' },
              { step: 4, title: 'Certify', desc: 'Get certified', icon: Award, color: 'amber' },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-[#13d8a0]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-${item.color}-900/50 rounded-lg flex items-center justify-center relative`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-white">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-white text-lg mb-4">No courses found matching your filters</p>
              <button onClick={clearFilters} className="btn-secondary">
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const priceColor = getPriceColor(course.price)
                const colors = colorClasses[priceColor]

                return (
                  <div
                    key={course.id}
                    className={`bg-gray-800 rounded-xl border-l-4 ${colors.border} overflow-hidden hover:bg-gray-750 transition-colors group`}
                  >
                    {/* Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#13d8a0]/10 text-[#13d8a0] text-xs font-medium rounded">
                            <Monitor className="w-3 h-3" />
                            E-Learning
                          </span>
                          <span className="px-2 py-1 bg-amber-900/50 text-amber-400 text-xs font-medium rounded">
                            Instant
                          </span>
                        </div>
                      </div>

                      <h3
                        className="text-lg font-semibold text-white mb-2 group-hover:text-[#13d8a0] transition-colors cursor-pointer"
                        onClick={() => setSelectedCourse(course)}
                      >
                        {course.name}
                      </h3>

                      <p className="text-sm text-white mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-white mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {course.validityPeriod}
                        </span>
                      </div>

                      {/* Learning Objectives Preview */}
                      <div className="mb-4">
                        <ul className="space-y-1">
                          {course.learningObjectives.slice(0, 2).map((obj, i) => (
                            <li key={i} className="text-xs text-white flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-[#13d8a0] mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between">
                      <div>
                        <span className={`text-2xl font-bold ${colors.text}`}>£{course.price}</span>
                      </div>
                      <Link
                        to={`/book/${course.id}?type=elearning`}
                        className={`${colors.bg} hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-1`}
                      >
                        <Play className="w-4 h-4" />
                        Enroll
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredCourses.map((course) => {
                const priceColor = getPriceColor(course.price)
                const colors = colorClasses[priceColor]

                return (
                  <div
                    key={course.id}
                    className={`bg-gray-800 rounded-xl border-l-4 ${colors.border} p-5 hover:bg-gray-750 transition-colors`}
                  >
                    <div className="flex items-start gap-6">
                      {/* Icon */}
                      <div className={`w-16 h-16 ${colors.bgLight} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Monitor className={`w-8 h-8 ${colors.text}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-[#13d8a0]/10 text-[#13d8a0] text-xs font-medium rounded">
                            E-Learning
                          </span>
                          <span className="px-2 py-0.5 bg-amber-900/50 text-amber-400 text-xs font-medium rounded">
                            Instant Access
                          </span>
                        </div>

                        <h3
                          className="text-lg font-semibold text-white mb-1 hover:text-[#13d8a0] transition-colors cursor-pointer"
                          onClick={() => setSelectedCourse(course)}
                        >
                          {course.name}
                        </h3>

                        <p className="text-sm text-white mb-3 line-clamp-1">
                          {course.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-white">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            Valid {course.validityPeriod}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            {course.certification}
                          </span>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <span className={`text-2xl font-bold ${colors.text}`}>£{course.price}</span>
                        <Link
                          to={`/book/${course.id}?type=elearning`}
                          className={`${colors.bg} hover:opacity-90 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2`}
                        >
                          <Play className="w-4 h-4" />
                          Enroll Now
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedCourse(null)} />
          <div className="relative bg-gray-800 rounded-xl border border-[#13d8a0]/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 text-white hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-[#13d8a0]/10 text-[#13d8a0] text-xs font-medium rounded flex items-center gap-1">
                <Monitor className="w-3 h-3" />
                E-Learning
              </span>
              <span className="px-2 py-1 bg-amber-900/50 text-amber-400 text-xs font-medium rounded">
                Instant Access
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">{selectedCourse.name}</h2>
            <p className="text-white mb-6">{selectedCourse.description}</p>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 text-[#13d8a0] mx-auto mb-1" />
                <p className="text-xs text-white">Duration</p>
                <p className="text-sm text-white font-medium">{selectedCourse.duration}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <Award className="w-5 h-5 text-[#13d8a0] mx-auto mb-1" />
                <p className="text-xs text-white">Valid For</p>
                <p className="text-sm text-white font-medium">{selectedCourse.validityPeriod}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <Shield className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-white">Certification</p>
                <p className="text-sm text-white font-medium">{selectedCourse.certification}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                <Smartphone className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-white">Access</p>
                <p className="text-sm text-white font-medium">12 Months</p>
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white uppercase tracking-wide mb-3">
                What You Will Learn
              </h3>
              <ul className="space-y-2">
                {selectedCourse.learningObjectives.map((obj, i) => (
                  <li key={i} className="text-sm text-white flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#13d8a0] mt-0.5 flex-shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            {/* Accreditation */}
            <div className="mb-6 p-4 bg-green-900/20 rounded-lg border border-[#13d8a0]/30">
              <p className="text-sm text-[#13d8a0]">{selectedCourse.accreditation}</p>
            </div>

            {/* Price & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div>
                <p className="text-sm text-white">Price</p>
                <p className="text-3xl font-bold text-white">£{selectedCourse.price}</p>
              </div>
              <Link
                to={`/book/${selectedCourse.id}?type=elearning`}
                className="bg-[#13d8a0] hover:bg-[#0fb88a] text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Enroll Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-8">E-Learning FAQs</h2>
          <div className="space-y-4">
            {[
              {
                q: 'How quickly can I start after purchasing?',
                a: 'Immediately! Once payment is confirmed, you will receive an email with login instructions. Create your account using 2FA and start learning within minutes.',
              },
              {
                q: 'How long do I have to complete the course?',
                a: 'You have 12 months from enrollment to complete each course. Most courses can be completed in a single sitting, but you can pause and resume at any time.',
              },
              {
                q: 'Will I receive a certificate?',
                a: 'Yes! Upon successful completion and passing the assessment, your certificate is generated automatically. You can download it immediately from your account.',
              },
              {
                q: 'Can I access courses on mobile devices?',
                a: 'Absolutely. Our e-learning platform is fully responsive and works on desktops, tablets, and smartphones.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-white text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ELearningPage
