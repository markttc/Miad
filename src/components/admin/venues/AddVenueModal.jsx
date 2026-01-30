import { useState } from 'react'
import {
  X,
  Save,
  MapPin,
  Phone,
  Building,
} from 'lucide-react'

function AddVenueModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    venueFee: 0,
    expiryDate: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      postcode: '',
    },
    trainerNotes: '',
    maxCapacity: 20,
    status: 'active',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Venue name is required'
    if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required'
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) newErrors.contactEmail = 'Invalid email format'
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Phone is required'
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required'
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required'
    if (!formData.address.postcode.trim()) newErrors['address.postcode'] = 'Postcode is required'
    if (formData.maxCapacity < 1) newErrors.maxCapacity = 'Capacity must be at least 1'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onSave(formData)
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-800 rounded-2xl border border-purple-800/50 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center text-white">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add New Venue</h2>
              <p className="text-sm text-gray-300 mt-1">Register a new training venue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
            {/* Venue Name */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Venue Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Manchester Conference Centre"
                className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.name ? 'border-red-500' : 'border-purple-800/50'
                }`}
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-400" />
                Contact Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.contactName ? 'border-red-500' : 'border-purple-800/50'
                    }`}
                  />
                  {errors.contactName && <p className="text-xs text-red-400 mt-1">{errors.contactName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Email *</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.contactEmail ? 'border-red-500' : 'border-purple-800/50'
                      }`}
                    />
                    {errors.contactEmail && <p className="text-xs text-red-400 mt-1">{errors.contactEmail}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.contactPhone ? 'border-red-500' : 'border-purple-800/50'
                      }`}
                    />
                    {errors.contactPhone && <p className="text-xs text-red-400 mt-1">{errors.contactPhone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Fee, Capacity, Expiry */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Venue Fee (£)</label>
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
                <label className="block text-sm text-gray-300 mb-1">Max Capacity *</label>
                <input
                  type="number"
                  name="maxCapacity"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.maxCapacity ? 'border-red-500' : 'border-purple-800/50'
                  }`}
                />
                {errors.maxCapacity && <p className="text-xs text-red-400 mt-1">{errors.maxCapacity}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.expiryDate ? 'border-red-500' : 'border-purple-800/50'
                  }`}
                />
                {errors.expiryDate && <p className="text-xs text-red-400 mt-1">{errors.expiryDate}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                Address
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  name="address.line1"
                  value={formData.address.line1}
                  onChange={handleChange}
                  placeholder="Address Line 1"
                  className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  name="address.line2"
                  value={formData.address.line2}
                  onChange={handleChange}
                  placeholder="Address Line 2 (optional)"
                  className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="City *"
                      className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors['address.city'] ? 'border-red-500' : 'border-purple-800/50'
                      }`}
                    />
                    {errors['address.city'] && <p className="text-xs text-red-400 mt-1">{errors['address.city']}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="address.postcode"
                      value={formData.address.postcode}
                      onChange={handleChange}
                      placeholder="Postcode *"
                      className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors['address.postcode'] ? 'border-red-500' : 'border-purple-800/50'
                      }`}
                    />
                    {errors['address.postcode'] && <p className="text-xs text-red-400 mt-1">{errors['address.postcode']}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Trainer Notes */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Trainer Notes (optional)</label>
              <textarea
                name="trainerNotes"
                value={formData.trainerNotes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Parking info, equipment available, access instructions..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-purple-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" />
                  Add Venue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddVenueModal
