import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  Video,
  Building,
  Layers,
  Award,
  AlertTriangle,
  Eye,
  Edit2,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  loadTrainers,
  saveTrainers,
  qualificationTypes,
  deliveryPreferences,
  generateAuditEntriesForChanges,
  createAuditEntry,
} from '../../data/trainers'
import AddTrainerModal from '../../components/admin/trainers/AddTrainerModal'
import TrainerDetailModal from '../../components/admin/trainers/TrainerDetailModal'
import DateTimeSlicer from '../../components/admin/DateTimeSlicer'
import MiadLogo from '../../assets/miad-logo.svg'

function TrainersAdminPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [trainers, setTrainers] = useState(loadTrainers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deliveryFilter, setDeliveryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState(null)

  if (!isAdmin) {
    navigate('/login?type=admin')
    return null
  }

  // Filter trainers
  const filteredTrainers = useMemo(() => {
    return trainers.filter((trainer) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          trainer.firstName.toLowerCase().includes(query) ||
          trainer.lastName.toLowerCase().includes(query) ||
          trainer.email.toLowerCase().includes(query) ||
          trainer.address?.city?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      if (statusFilter !== 'all' && trainer.status !== statusFilter) {
        return false
      }

      if (deliveryFilter !== 'all' && trainer.deliveryPreference !== deliveryFilter) {
        return false
      }

      // Date range filter - filter trainers with availability in the selected range
      if (dateFilter && trainer.availability) {
        const availabilityDates = Object.keys(trainer.availability)
        const hasAvailabilityInRange = availabilityDates.some((dateStr) => {
          const date = new Date(dateStr)
          return date >= dateFilter.start && date <= dateFilter.end
        })
        if (!hasAvailabilityInRange) return false
      }

      return true
    })
  }, [trainers, searchQuery, statusFilter, deliveryFilter, dateFilter])

  // Stats
  const stats = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    let expiringQuals = 0
    trainers.forEach((trainer) => {
      trainer.qualifications?.forEach((qual) => {
        const expiry = new Date(qual.expiryDate)
        if (expiry <= thirtyDaysFromNow && expiry > now) {
          expiringQuals++
        }
      })
    })

    return {
      total: trainers.length,
      active: trainers.filter((t) => t.status === 'active').length,
      pending: trainers.filter((t) => t.status === 'pending').length,
      expiringQuals,
    }
  }, [trainers])

  // Add new trainer
  const handleAddTrainer = (newTrainer) => {
    const createdAt = new Date().toISOString()
    const trainer = {
      ...newTrainer,
      id: `trainer-${String(trainers.length + 1).padStart(3, '0')}`,
      createdAt,
      auditLog: [
        createAuditEntry('trainer_created', `Trainer record created for ${newTrainer.firstName} ${newTrainer.lastName}`, 'Admin'),
      ],
    }
    const updated = [...trainers, trainer]
    setTrainers(updated)
    saveTrainers(updated)
    setShowAddModal(false)
  }

  // Update trainer
  const handleUpdateTrainer = (updatedTrainer) => {
    // Find the original trainer to compare changes
    const originalTrainer = trainers.find(t => t.id === updatedTrainer.id)

    // Generate audit entries for the changes
    const auditEntries = generateAuditEntriesForChanges(originalTrainer, updatedTrainer, 'Admin')

    // Add audit entries to the updated trainer
    const trainerWithAudit = {
      ...updatedTrainer,
      auditLog: [
        ...(updatedTrainer.auditLog || []),
        ...auditEntries,
      ],
    }

    const updated = trainers.map((t) =>
      t.id === trainerWithAudit.id ? trainerWithAudit : t
    )
    setTrainers(updated)
    saveTrainers(updated)
    setSelectedTrainer(null)
  }

  // Get delivery preference icon
  const getDeliveryIcon = (pref) => {
    const icons = { digital: Video, classroom: Building, both: Layers }
    return icons[pref] || Layers
  }

  // Check if trainer has expiring qualifications
  const hasExpiringQuals = (trainer) => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return trainer.qualifications?.some((qual) => {
      const expiry = new Date(qual.expiryDate)
      return expiry <= thirtyDaysFromNow && expiry > now
    })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-purple-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/">
                <img src={MiadLogo} alt="Miad Healthcare" className="h-7" />
              </Link>
              <div className="border-l border-gray-700 pl-6">
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                  <Link to="/admin" className="hover:text-white">Dashboard</Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-white">Trainers & Supply Chain</span>
                </div>
                <h1 className="text-xl font-bold text-white">Trainer Management</h1>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Trainer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">Total Trainers</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">Active</p>
            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-300">Expiring Certs (30d)</p>
            <p className="text-2xl font-bold text-red-400">{stats.expiringQuals}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-6">
          <Link
            to="/admin/training-register"
            className="bg-gray-800 border border-purple-800/50 rounded-lg px-4 py-3 hover:border-purple-600 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-cyan-900/50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-medium">Training Register</p>
              <p className="text-xs text-gray-300">Mark attendance & completions</p>
            </div>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="text"
              placeholder="Search by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <DateTimeSlicer onChange={setDateFilter} />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Delivery Types</option>
            <option value="digital">Digital Only</option>
            <option value="classroom">Classroom Only</option>
            <option value="both">Both</option>
          </select>
        </div>

        {/* Trainers Grid */}
        {filteredTrainers.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-12 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-300">No trainers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrainers.map((trainer) => {
              const DeliveryIcon = getDeliveryIcon(trainer.deliveryPreference)
              const deliveryPref = deliveryPreferences.find(
                (p) => p.id === trainer.deliveryPreference
              )
              const hasExpiring = hasExpiringQuals(trainer)

              return (
                <div
                  key={trainer.id}
                  className="bg-gray-800 rounded-xl border border-purple-800/50 p-5 hover:border-purple-600 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {trainer.firstName[0]}{trainer.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {trainer.firstName} {trainer.lastName}
                        </h3>
                        <p className="text-xs text-gray-300">{trainer.address?.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasExpiring && (
                        <span className="p-1.5 bg-amber-900/50 rounded" title="Expiring qualifications">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          trainer.status === 'active'
                            ? 'bg-green-900/50 text-green-400'
                            : trainer.status === 'pending'
                            ? 'bg-amber-900/50 text-amber-400'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {trainer.status}
                      </span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{trainer.email}</span>
                    </p>
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {trainer.phone}
                    </p>
                  </div>

                  {/* Delivery & Radius */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DeliveryIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">{deliveryPref?.label}</span>
                    </div>
                    {trainer.workingRadius > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <MapPin className="w-4 h-4" />
                        {trainer.workingRadius}mi
                      </div>
                    )}
                  </div>

                  {/* Qualifications */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-300 mb-2">Qualifications ({trainer.qualifications?.length || 0})</p>
                    <div className="flex flex-wrap gap-1">
                      {trainer.qualifications?.slice(0, 3).map((qual) => {
                        const qualType = qualificationTypes.find((q) => q.id === qual.typeId)
                        const isExpiring = new Date(qual.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        return (
                          <span
                            key={qual.typeId}
                            className={`px-2 py-0.5 rounded text-xs ${
                              isExpiring
                                ? 'bg-amber-900/50 text-amber-400'
                                : 'bg-purple-900/50 text-purple-300'
                            }`}
                            title={`Expires: ${new Date(qual.expiryDate).toLocaleDateString('en-GB')}`}
                          >
                            {qualType?.name.split(' ')[0] || qual.typeId}
                          </span>
                        )
                      })}
                      {trainer.qualifications?.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                          +{trainer.qualifications.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setSelectedTrainer(trainer)}
                      className="flex-1 py-2 text-sm text-purple-400 hover:bg-purple-900/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => setSelectedTrainer(trainer)}
                      className="flex-1 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Trainer Modal */}
      {showAddModal && (
        <AddTrainerModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTrainer}
        />
      )}

      {/* Trainer Detail Modal */}
      {selectedTrainer && (
        <TrainerDetailModal
          trainer={selectedTrainer}
          onClose={() => setSelectedTrainer(null)}
          onSave={handleUpdateTrainer}
        />
      )}
    </div>
  )
}

export default TrainersAdminPage
