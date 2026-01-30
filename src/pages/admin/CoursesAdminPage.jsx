import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Search,
  Filter,
  BookOpen,
  Edit2,
  Eye,
  EyeOff,
  Save,
  X,
  PoundSterling,
  Hash,
  Clock,
  Award,
  Video,
  Monitor,
  Building,
  Layers,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { courses as initialCourses, courseCategories, deliveryMethods } from '../../data/courses'
import DateTimeSlicer from '../../components/admin/DateTimeSlicer'
import MiadLogo from '../../assets/miad-logo.svg'

// Load course settings from localStorage or initialize with defaults
function loadCourseSettings() {
  const saved = localStorage.getItem('miad_course_settings')
  if (saved) {
    return JSON.parse(saved)
  }

  // Initialize with default settings for all courses
  const defaults = {}
  initialCourses.forEach((course) => {
    defaults[course.id] = {
      financeId: `FIN-${course.id.toUpperCase().replace(/-/g, '').slice(0, 6)}`,
      price: course.price,
      isActive: true,
    }
  })
  localStorage.setItem('miad_course_settings', JSON.stringify(defaults))
  return defaults
}

function CoursesAdminPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [courseSettings, setCourseSettings] = useState(loadCourseSettings)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)
  const [editingCourse, setEditingCourse] = useState(null)
  const [editForm, setEditForm] = useState({})

  if (!isAdmin) {
    navigate('/login?type=admin')
    return null
  }

  // Merge course data with settings
  const coursesWithSettings = useMemo(() => {
    return initialCourses.map((course) => ({
      ...course,
      ...courseSettings[course.id],
      price: courseSettings[course.id]?.price ?? course.price,
    }))
  }, [courseSettings])

  // Filter courses
  const filteredCourses = useMemo(() => {
    return coursesWithSettings.filter((course) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          course.name.toLowerCase().includes(query) ||
          course.id.toLowerCase().includes(query) ||
          courseSettings[course.id]?.financeId?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      if (categoryFilter !== 'all' && course.category !== categoryFilter) {
        return false
      }

      if (statusFilter === 'active' && !courseSettings[course.id]?.isActive) {
        return false
      }
      if (statusFilter === 'inactive' && courseSettings[course.id]?.isActive) {
        return false
      }

      // Date range filter (filter by last modified date)
      if (dateFilter && courseSettings[course.id]?.lastModified) {
        const modifiedDate = new Date(courseSettings[course.id].lastModified)
        if (modifiedDate < dateFilter.start || modifiedDate > dateFilter.end) {
          return false
        }
      }

      return true
    })
  }, [coursesWithSettings, searchQuery, categoryFilter, statusFilter, courseSettings, dateFilter])

  // Stats
  const stats = useMemo(() => ({
    total: initialCourses.length,
    active: Object.values(courseSettings).filter((s) => s.isActive).length,
    inactive: Object.values(courseSettings).filter((s) => !s.isActive).length,
    categories: courseCategories.length,
  }), [courseSettings])

  // Save settings to localStorage
  const saveSettings = (newSettings) => {
    setCourseSettings(newSettings)
    localStorage.setItem('miad_course_settings', JSON.stringify(newSettings))
  }

  // Toggle course active status
  const toggleCourseStatus = (courseId) => {
    const newSettings = {
      ...courseSettings,
      [courseId]: {
        ...courseSettings[courseId],
        isActive: !courseSettings[courseId]?.isActive,
        lastModified: new Date().toISOString(),
      },
    }
    saveSettings(newSettings)
  }

  // Start editing a course
  const startEditing = (course) => {
    setEditingCourse(course.id)
    setEditForm({
      financeId: courseSettings[course.id]?.financeId || '',
      price: courseSettings[course.id]?.price ?? course.price,
    })
  }

  // Save edit
  const saveEdit = () => {
    if (!editingCourse) return

    const newSettings = {
      ...courseSettings,
      [editingCourse]: {
        ...courseSettings[editingCourse],
        financeId: editForm.financeId,
        price: parseFloat(editForm.price) || 0,
        lastModified: new Date().toISOString(),
      },
    }
    saveSettings(newSettings)
    setEditingCourse(null)
    setEditForm({})
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingCourse(null)
    setEditForm({})
  }

  const getDeliveryIcon = (method) => {
    const icons = {
      webinar: Video,
      elearning: Monitor,
      classroom: Building,
      blended: Layers,
    }
    return icons[method] || Video
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-purple-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-6">
            <Link to="/">
              <img src={MiadLogo} alt="Miad Healthcare" className="h-7" />
            </Link>
            <div className="border-l border-gray-700 pl-6">
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                <Link to="/admin" className="hover:text-white">Dashboard</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">Course Administration</span>
              </div>
              <h1 className="text-xl font-bold text-white">Course Catalogue Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">Total Courses</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">Active</p>
            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">Inactive</p>
            <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">Categories</p>
            <p className="text-2xl font-bold text-purple-400">{stats.categories}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="text"
              placeholder="Search by name, ID, or finance code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <DateTimeSlicer onChange={setDateFilter} />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            {courseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Courses Table */}
        <div className="bg-gray-800 rounded-xl border border-purple-800/50 overflow-hidden">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-300">No courses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-300 border-b border-gray-700">
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Course</th>
                    <th className="px-4 py-3 font-medium">Finance ID</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Delivery</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredCourses.map((course) => {
                    const isEditing = editingCourse === course.id
                    const settings = courseSettings[course.id] || {}
                    const category = courseCategories.find((c) => c.id === course.category)

                    return (
                      <tr
                        key={course.id}
                        className={`hover:bg-gray-700/50 transition-colors ${
                          !settings.isActive ? 'opacity-60' : ''
                        }`}
                      >
                        {/* Status Toggle */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleCourseStatus(course.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              settings.isActive
                                ? 'bg-green-900/50 text-green-400 hover:bg-green-900/70'
                                : 'bg-red-900/50 text-red-400 hover:bg-red-900/70'
                            }`}
                            title={settings.isActive ? 'Click to deactivate' : 'Click to activate'}
                          >
                            {settings.isActive ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Course Name */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-white font-medium">{course.name}</p>
                            <p className="text-xs text-gray-300 font-mono">{course.id}</p>
                          </div>
                        </td>

                        {/* Finance ID */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.financeId}
                              onChange={(e) => setEditForm({ ...editForm, financeId: e.target.value })}
                              className="w-32 px-2 py-1 bg-gray-900 border border-purple-500 rounded text-white text-sm focus:outline-none"
                              placeholder="FIN-XXXXXX"
                            />
                          ) : (
                            <code className="text-purple-400 text-sm">
                              {settings.financeId || '-'}
                            </code>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded">
                            {category?.name || course.category}
                          </span>
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3">
                          <span className="text-gray-300 flex items-center gap-1 text-sm">
                            <Clock className="w-3.5 h-3.5 text-gray-300" />
                            {course.duration}
                          </span>
                        </td>

                        {/* Delivery Methods */}
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {course.deliveryMethods.map((method) => {
                              const Icon = getDeliveryIcon(method)
                              const methodInfo = deliveryMethods[method]
                              return (
                                <span
                                  key={method}
                                  className={`p-1.5 rounded text-xs bg-${methodInfo?.color || 'gray'}-900/50 text-${methodInfo?.color || 'gray'}-400`}
                                  title={methodInfo?.label || method}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </span>
                              )
                            })}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="relative w-24">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-sm">£</span>
                              <input
                                type="number"
                                value={editForm.price}
                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                className="w-full pl-6 pr-2 py-1 bg-gray-900 border border-purple-500 rounded text-white text-sm focus:outline-none"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          ) : (
                            <span className="text-white font-medium">
                              £{(settings.price ?? course.price).toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={saveEdit}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded transition-colors"
                                  title="Save"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEditing(course)}
                                className="p-2 text-gray-300 hover:text-purple-400 hover:bg-gray-700 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-900/50 rounded">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span>Webinar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-900/50 rounded">
              <Monitor className="w-3.5 h-3.5 text-green-400" />
            </div>
            <span>E-Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-900/50 rounded">
              <Building className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span>Classroom</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-900/50 rounded">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span>Blended</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursesAdminPage
