import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Search,
  Plus,
  Building,
  MapPin,
  Users,
  PoundSterling,
  Calendar,
  AlertTriangle,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  loadVenues,
  saveVenues,
  createVenueAuditEntry,
  generateVenueAuditEntriesForChanges,
  getVenueStatus,
} from '../../data/venues'
import AddVenueModal from '../../components/admin/venues/AddVenueModal'
import VenueDetailModal from '../../components/admin/venues/VenueDetailModal'
import MiadLogo from '../../assets/miad-logo.svg'

function VenuesAdminPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [venues, setVenues] = useState(loadVenues)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  if (!isAdmin) {
    navigate('/login?type=admin')
    return null
  }

  // Filter venues
  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          venue.name.toLowerCase().includes(query) ||
          venue.address?.city?.toLowerCase().includes(query) ||
          venue.contactName?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      if (statusFilter !== 'all') {
        const { status } = getVenueStatus(venue.expiryDate)
        if (status !== statusFilter) return false
      }

      return true
    })
  }, [venues, searchQuery, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const now = new Date()
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    let expiring = 0
    let expired = 0
    let totalCapacity = 0

    venues.forEach((venue) => {
      const expiry = new Date(venue.expiryDate)
      if (expiry < now) expired++
      else if (expiry <= thirtyDays) expiring++
      totalCapacity += venue.maxCapacity || 0
    })

    return {
      total: venues.length,
      active: venues.length - expired,
      expiring,
      totalCapacity,
    }
  }, [venues])

  // Add new venue
  const handleAddVenue = (newVenue) => {
    const venue = {
      ...newVenue,
      id: `venue-${String(venues.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      auditLog: [
        createVenueAuditEntry('venue_created', `Venue "${newVenue.name}" created`, 'Admin'),
      ],
    }
    const updated = [...venues, venue]
    setVenues(updated)
    saveVenues(updated)
    setShowAddModal(false)
  }

  // Update venue
  const handleUpdateVenue = (updatedVenue) => {
    const originalVenue = venues.find(v => v.id === updatedVenue.id)
    const auditEntries = generateVenueAuditEntriesForChanges(originalVenue, updatedVenue, 'Admin')

    const venueWithAudit = {
      ...updatedVenue,
      auditLog: [
        ...(updatedVenue.auditLog || []),
        ...auditEntries,
      ],
    }

    const updated = venues.map((v) =>
      v.id === venueWithAudit.id ? venueWithAudit : v
    )
    setVenues(updated)
    saveVenues(updated)
    setSelectedVenue(null)
  }

  // Delete venue
  const handleDeleteVenue = (venueId) => {
    const venue = venues.find(v => v.id === venueId)

    // Instead of hard delete, we could mark as deleted with audit trail
    // For now, we'll add a deletion audit entry and remove
    const updated = venues.filter(v => v.id !== venueId)
    setVenues(updated)
    saveVenues(updated)
    setShowDeleteConfirm(null)
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
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <Link to="/admin" className="hover:text-white">Dashboard</Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-white">Venue Management</span>
                </div>
                <h1 className="text-xl font-bold text-white">Venues</h1>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Venue
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Total Venues</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Active</p>
            <p className="text-2xl font-bold text-green-400">{stats.active}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Expiring Soon</p>
            <p className="text-2xl font-bold text-amber-400">{stats.expiring}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-800/50">
            <p className="text-sm text-gray-400">Total Capacity</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.totalCapacity}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, city, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Venues Grid */}
        {filteredVenues.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-12 text-center">
            <Building className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No venues found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVenues.map((venue) => {
              const { status, color } = getVenueStatus(venue.expiryDate)

              return (
                <div
                  key={venue.id}
                  className="bg-gray-800 rounded-xl border border-purple-800/50 p-5 hover:border-purple-600 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center text-white">
                        <Building className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{venue.name}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {venue.address?.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {status === 'expiring' && (
                        <span className="p-1.5 bg-amber-900/50 rounded" title="Contract expiring soon">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          color === 'green'
                            ? 'bg-green-900/50 text-green-400'
                            : color === 'amber'
                            ? 'bg-amber-900/50 text-amber-400'
                            : 'bg-red-900/50 text-red-400'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {venue.contactPhone}
                    </p>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{venue.contactEmail}</span>
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-300">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>{venue.maxCapacity} capacity</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <PoundSterling className="w-4 h-4 text-green-400" />
                      <span>£{venue.venueFee}</span>
                    </div>
                  </div>

                  {/* Expiry */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Expires: {new Date(venue.expiryDate).toLocaleDateString('en-GB')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setSelectedVenue(venue)}
                      className="flex-1 py-2 text-sm text-purple-400 hover:bg-purple-900/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => setSelectedVenue(venue)}
                      className="flex-1 py-2 text-sm text-gray-400 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(venue)}
                      className="py-2 px-3 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Venue Modal */}
      {showAddModal && (
        <AddVenueModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddVenue}
        />
      )}

      {/* Venue Detail Modal */}
      {selectedVenue && (
        <VenueDetailModal
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
          onSave={handleUpdateVenue}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-gray-800 rounded-xl border border-red-800/50 p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2">Delete Venue</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete <span className="text-white font-medium">{showDeleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVenue(showDeleteConfirm.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VenuesAdminPage
