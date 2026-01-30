import { useState, useMemo } from 'react'
import {
  X,
  Save,
  MapPin,
  Phone,
  Mail,
  User,
  Users,
  PoundSterling,
  Calendar,
  FileText,
  History,
  Filter,
  Building,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react'
import { venueAuditEventTypes } from '../../../data/venues'

function VenueDetailModal({ venue, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...venue })
  const [activeTab, setActiveTab] = useState('details')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [auditFilter, setAuditFilter] = useState('all')

  // Filter audit log entries
  const filteredAuditLog = useMemo(() => {
    const auditLog = formData.auditLog || []
    if (auditFilter === 'all') {
      return auditLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    }
    return auditLog
      .filter(entry => entry.eventType === auditFilter)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [formData.auditLog, auditFilter])

  // Get icon for audit event type
  const getAuditIcon = (eventType) => {
    const icons = {
      venue_created: Plus,
      venue_updated: Edit,
      venue_deleted: Trash2,
      contact_updated: Phone,
      fee_updated: PoundSterling,
      capacity_updated: Users,
      expiry_updated: Calendar,
    }
    return icons[eventType] || History
  }

  // Get color for audit event type
  const getAuditColor = (eventType) => {
    const eventInfo = venueAuditEventTypes.find(e => e.id === eventType)
    return eventInfo?.color || 'gray'
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }))
    } else if (name === 'venueFee' || name === 'maxCapacity') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onSave(formData)
    setIsSubmitting(false)
  }

  // Check expiry status
  const getExpiryStatus = () => {
    const now = new Date()
    const expiry = new Date(formData.expiryDate)
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    if (expiry < now) return { label: 'Expired', color: 'red' }
    if (expiry <= thirtyDays) return { label: 'Expiring Soon', color: 'amber' }
    return { label: 'Active', color: 'green' }
  }

  const expiryStatus = getExpiryStatus()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-800 rounded-2xl border border-purple-800/50 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-800/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center text-white">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{venue.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    expiryStatus.color === 'green'
                      ? 'bg-green-900/50 text-green-400'
                      : expiryStatus.color === 'amber'
                      ? 'bg-amber-900/50 text-amber-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}
                >
                  {expiryStatus.label}
                </span>
                <span className="text-sm text-white">{venue.address?.city}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-white hover:text-white'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'audit'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-white hover:text-white'
            }`}
          >
            Audit
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Venue Name */}
              <div>
                <label className="block text-sm text-white mb-1">Venue Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-400" />
                  Contact Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-white mb-1">Contact Name</label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white mb-1">Email</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white mb-1">Phone</label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee and Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white mb-1">Venue Fee (£)</label>
                  <input
                    type="number"
                    name="venueFee"
                    value={formData.venueFee}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">Max Capacity</label>
                  <input
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm text-white mb-1">Contract Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  Address
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="address.line1"
                    value={formData.address?.line1 || ''}
                    onChange={handleChange}
                    placeholder="Address Line 1"
                    className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    name="address.line2"
                    value={formData.address?.line2 || ''}
                    onChange={handleChange}
                    placeholder="Address Line 2"
                    className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address?.city || ''}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      name="address.postcode"
                      value={formData.address?.postcode || ''}
                      onChange={handleChange}
                      placeholder="Postcode"
                      className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Trainer Notes */}
              <div>
                <label className="block text-sm text-white mb-1">Trainer Notes</label>
                <textarea
                  name="trainerNotes"
                  value={formData.trainerNotes || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Parking info, equipment available, access instructions..."
                  className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Filter className="w-4 h-4" />
                  <span>Filter by:</span>
                </div>
                <button
                  onClick={() => setAuditFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    auditFilter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  All Events
                </button>
                {venueAuditEventTypes.map((eventType) => (
                  <button
                    key={eventType.id}
                    onClick={() => setAuditFilter(eventType.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      auditFilter === eventType.id
                        ? `bg-${eventType.color}-600 text-white`
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {eventType.label}
                  </button>
                ))}
              </div>

              {/* Audit Log */}
              {filteredAuditLog.length > 0 ? (
                <div className="space-y-2">
                  {filteredAuditLog.map((entry) => {
                    const AuditIcon = getAuditIcon(entry.eventType)
                    const color = getAuditColor(entry.eventType)
                    const eventInfo = venueAuditEventTypes.find(e => e.id === entry.eventType)

                    return (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                      >
                        <div className={`p-2 rounded-lg bg-${color}-900/50`}>
                          <AuditIcon className={`w-4 h-4 text-${color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${color}-900/50 text-${color}-400`}>
                              {eventInfo?.label || entry.eventType}
                            </span>
                            <span className="text-xs text-white">
                              by {entry.user}
                            </span>
                          </div>
                          <p className="text-sm text-white mt-1">{entry.details}</p>
                          <p className="text-xs text-white mt-1">
                            {new Date(entry.timestamp).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-white">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No audit entries found</p>
                  {auditFilter !== 'all' && (
                    <p className="text-sm mt-1">Try selecting a different filter</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-purple-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VenueDetailModal
