import { useState, useMemo } from 'react'
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Video,
  Building,
  Layers,
  Save,
  Award,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Landmark,
  History,
  Shield,
  UserPlus,
  Filter,
} from 'lucide-react'
import { deliveryPreferences, qualificationTypes, auditEventTypes } from '../../../data/trainers'
import AvailabilityCalendar from './AvailabilityCalendar'

function TrainerDetailModal({ trainer, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...trainer })
  const [activeTab, setActiveTab] = useState('details')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddQual, setShowAddQual] = useState(false)
  const [newQual, setNewQual] = useState({
    typeId: '',
    obtainedDate: '',
    expiryDate: '',
    certificateRef: '',
  })
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
      profile_update: User,
      status_change: Shield,
      availability_update: Calendar,
      qualification_added: Award,
      qualification_removed: Trash2,
      billing_update: Landmark,
      trainer_created: UserPlus,
    }
    return icons[eventType] || History
  }

  // Get color for audit event type
  const getAuditColor = (eventType) => {
    const eventInfo = auditEventTypes.find(e => e.id === eventType)
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
    } else if (name.startsWith('billing.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        billing: { ...prev.billing, [field]: value },
      }))
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

  const addQualification = () => {
    if (!newQual.typeId || !newQual.expiryDate) return
    setFormData((prev) => ({
      ...prev,
      qualifications: [...(prev.qualifications || []), newQual],
    }))
    setNewQual({ typeId: '', obtainedDate: '', expiryDate: '', certificateRef: '' })
    setShowAddQual(false)
  }

  const removeQualification = (index) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }))
  }

  const getQualStatus = (expiryDate) => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    if (expiry < now) return { status: 'expired', color: 'red' }
    if (expiry <= thirtyDays) return { status: 'expiring', color: 'amber' }
    return { status: 'valid', color: 'green' }
  }

  const DeliveryIcon = ({ type }) => {
    const icons = { digital: Video, classroom: Building, both: Layers }
    const Icon = icons[type] || Layers
    return <Icon className="w-5 h-5" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-800 rounded-2xl border border-purple-800/50 w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-800/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {trainer.firstName[0]}{trainer.lastName[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {trainer.firstName} {trainer.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    trainer.status === 'active'
                      ? 'bg-green-900/50 text-green-400'
                      : trainer.status === 'pending'
                      ? 'bg-amber-900/50 text-amber-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {trainer.status}
                </span>
                <span className="text-sm text-gray-400">{trainer.address?.city}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
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
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('qualifications')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'qualifications'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Qualifications ({formData.qualifications?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'availability'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Availability
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'billing'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Billing
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'audit'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Audit
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Home Address</label>
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

              {/* Delivery Preference */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Delivery Preference</label>
                <div className="grid grid-cols-3 gap-3">
                  {deliveryPreferences.map((pref) => (
                    <button
                      key={pref.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, deliveryPreference: pref.id }))}
                      className={`p-3 rounded-lg border text-sm flex flex-col items-center gap-2 transition-colors ${
                        formData.deliveryPreference === pref.id
                          ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                          : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <DeliveryIcon type={pref.id} />
                      {pref.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Working Radius */}
              {formData.deliveryPreference !== 'digital' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Working Radius (miles)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      name="workingRadius"
                      value={formData.workingRadius || 0}
                      onChange={handleChange}
                      min="0"
                      max="150"
                      step="5"
                      className="flex-1 accent-purple-500"
                    />
                    <span className="text-white font-medium w-16 text-right">{formData.workingRadius || 0} mi</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'qualifications' && (
            <div className="space-y-4">
              {/* Existing Qualifications */}
              {formData.qualifications?.length > 0 ? (
                <div className="space-y-3">
                  {formData.qualifications.map((qual, index) => {
                    const qualType = qualificationTypes.find((q) => q.id === qual.typeId)
                    const { status, color } = getQualStatus(qual.expiryDate)

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          color === 'red'
                            ? 'bg-red-900/20 border-red-800/50'
                            : color === 'amber'
                            ? 'bg-amber-900/20 border-amber-800/50'
                            : 'bg-gray-900/50 border-purple-800/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              color === 'red' ? 'bg-red-900/50' :
                              color === 'amber' ? 'bg-amber-900/50' : 'bg-green-900/50'
                            }`}>
                              {status === 'valid' ? (
                                <CheckCircle className={`w-5 h-5 text-${color}-400`} />
                              ) : (
                                <AlertTriangle className={`w-5 h-5 text-${color}-400`} />
                              )}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{qualType?.name || qual.typeId}</h4>
                              <p className="text-sm text-gray-400 mt-1">
                                Certificate: {qual.certificateRef || 'N/A'}
                              </p>
                              <div className="flex gap-4 mt-2 text-sm">
                                <span className="text-gray-500">
                                  Obtained: {new Date(qual.obtainedDate).toLocaleDateString('en-GB')}
                                </span>
                                <span className={`text-${color}-400`}>
                                  Expires: {new Date(qual.expiryDate).toLocaleDateString('en-GB')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeQualification(index)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No qualifications added yet</p>
                </div>
              )}

              {/* Add Qualification */}
              {showAddQual ? (
                <div className="p-4 bg-gray-900/50 rounded-lg border border-purple-800/50 space-y-3">
                  <h4 className="text-sm font-medium text-white">Add Qualification</h4>
                  <select
                    value={newQual.typeId}
                    onChange={(e) => setNewQual((prev) => ({ ...prev, typeId: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select qualification type...</option>
                    {qualificationTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Obtained Date</label>
                      <input
                        type="date"
                        value={newQual.obtainedDate}
                        onChange={(e) => setNewQual((prev) => ({ ...prev, obtainedDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={newQual.expiryDate}
                        onChange={(e) => setNewQual((prev) => ({ ...prev, expiryDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newQual.certificateRef}
                    onChange={(e) => setNewQual((prev) => ({ ...prev, certificateRef: e.target.value }))}
                    placeholder="Certificate Reference Number"
                    className="w-full px-3 py-2 bg-gray-800 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addQualification}
                      disabled={!newQual.typeId || !newQual.expiryDate}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddQual(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddQual(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-purple-600 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Qualification
                </button>
              )}
            </div>
          )}

          {activeTab === 'availability' && (
            <AvailabilityCalendar
              availability={formData.availability || {}}
              onChange={(newAvailability) =>
                setFormData((prev) => ({ ...prev, availability: newAvailability }))
              }
            />
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* VAT Registered */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">VAT Registered</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, billing: { ...prev.billing, vatRegistered: true } }))}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      formData.billing?.vatRegistered === true
                        ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, billing: { ...prev.billing, vatRegistered: false } }))}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      formData.billing?.vatRegistered === false
                        ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Company Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Company Type</label>
                <input
                  type="text"
                  name="billing.companyType"
                  value={formData.billing?.companyType || ''}
                  onChange={handleChange}
                  placeholder="e.g. Sole Trader, Limited Company, Partnership"
                  className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Bank Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-purple-400" />
                  Bank Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Account Name</label>
                    <input
                      type="text"
                      name="billing.accountName"
                      value={formData.billing?.accountName || ''}
                      onChange={handleChange}
                      placeholder="Name on the bank account"
                      className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Sort Code</label>
                      <input
                        type="text"
                        name="billing.sortCode"
                        value={formData.billing?.sortCode || ''}
                        onChange={handleChange}
                        placeholder="00-00-00"
                        className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Account Number</label>
                      <input
                        type="text"
                        name="billing.accountNumber"
                        value={formData.billing?.accountNumber || ''}
                        onChange={handleChange}
                        placeholder="12345678"
                        className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Filter className="w-4 h-4" />
                  <span>Filter by:</span>
                </div>
                <button
                  onClick={() => setAuditFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    auditFilter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All Events
                </button>
                {auditEventTypes.map((eventType) => (
                  <button
                    key={eventType.id}
                    onClick={() => setAuditFilter(eventType.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      auditFilter === eventType.id
                        ? `bg-${eventType.color}-600 text-white`
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                    const eventInfo = auditEventTypes.find(e => e.id === entry.eventType)

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
                            <span className="text-xs text-gray-500">
                              by {entry.user}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">{entry.details}</p>
                          <p className="text-xs text-gray-500 mt-1">
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
                <div className="text-center py-8 text-gray-500">
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
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
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

export default TrainerDetailModal
