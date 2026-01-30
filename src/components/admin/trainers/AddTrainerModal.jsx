import { useState } from 'react'
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
  Landmark,
} from 'lucide-react'
import { deliveryPreferences } from '../../../data/trainers'

function AddTrainerModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      postcode: '',
    },
    deliveryPreference: 'both',
    workingRadius: 25,
    qualifications: [],
    billing: {
      vatRegistered: false,
      companyType: '',
      accountName: '',
      sortCode: '',
      accountNumber: '',
    },
    notes: '',
    status: 'pending',
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
    } else if (name.startsWith('billing.')) {
      const field = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        billing: { ...prev.billing, [field]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required'
    if (!formData.address.postcode.trim()) newErrors['address.postcode'] = 'Postcode is required'

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

  const DeliveryIcon = ({ type }) => {
    const icons = { digital: Video, classroom: Building, both: Layers }
    const Icon = icons[type] || Layers
    return <Icon className="w-5 h-5" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-800 rounded-2xl border border-purple-800/50 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-800/50">
          <div>
            <h2 className="text-xl font-bold text-white">Add New Trainer</h2>
            <p className="text-sm text-white mt-1">Onboard a new trainer to the platform</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.firstName ? 'border-red-500' : 'border-purple-800/50'
                    }`}
                  />
                  {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.lastName ? 'border-red-500' : 'border-purple-800/50'
                    }`}
                  />
                  {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                Contact Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.email ? 'border-red-500' : 'border-purple-800/50'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="07XXX XXXXXX"
                    className={`w-full px-3 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.phone ? 'border-red-500' : 'border-purple-800/50'
                    }`}
                  />
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                Home Address
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

            {/* Delivery Preferences */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Delivery Preference</h3>
              <div className="grid grid-cols-3 gap-3">
                {deliveryPreferences.map((pref) => (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, deliveryPreference: pref.id }))}
                    className={`p-3 rounded-lg border text-sm flex flex-col items-center gap-2 transition-colors ${
                      formData.deliveryPreference === pref.id
                        ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                        : 'border-gray-700 text-white hover:border-gray-600'
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
                <h3 className="text-sm font-medium text-white mb-3">Working Radius (miles)</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    name="workingRadius"
                    value={formData.workingRadius}
                    onChange={handleChange}
                    min="0"
                    max="150"
                    step="5"
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-white font-medium w-16 text-right">{formData.workingRadius} mi</span>
                </div>
                <p className="text-xs text-white mt-1">
                  How far the trainer is willing to travel from their home address for classroom courses
                </p>
              </div>
            )}

            {/* Billing */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-purple-400" />
                Billing Information
              </h3>

              {/* VAT Registered */}
              <div className="mb-4">
                <label className="block text-sm text-white mb-2">VAT Registered</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, billing: { ...prev.billing, vatRegistered: true } }))}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      formData.billing.vatRegistered === true
                        ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                        : 'border-gray-700 text-white hover:border-gray-600'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, billing: { ...prev.billing, vatRegistered: false } }))}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      formData.billing.vatRegistered === false
                        ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                        : 'border-gray-700 text-white hover:border-gray-600'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Company Type */}
              <div className="mb-4">
                <label className="block text-sm text-white mb-1">Company Type</label>
                <input
                  type="text"
                  name="billing.companyType"
                  value={formData.billing.companyType}
                  onChange={handleChange}
                  placeholder="e.g. Sole Trader, Limited Company, Partnership"
                  className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Bank Details */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <label className="block text-sm text-white mb-3">Bank Details</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white mb-1">Account Name</label>
                    <input
                      type="text"
                      name="billing.accountName"
                      value={formData.billing.accountName}
                      onChange={handleChange}
                      placeholder="Name on the bank account"
                      className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white mb-1">Sort Code</label>
                      <input
                        type="text"
                        name="billing.sortCode"
                        value={formData.billing.sortCode}
                        onChange={handleChange}
                        placeholder="00-00-00"
                        className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white mb-1">Account Number</label>
                      <input
                        type="text"
                        name="billing.accountNumber"
                        value={formData.billing.accountNumber}
                        onChange={handleChange}
                        placeholder="12345678"
                        className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-white mb-1">Notes (optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-900 border border-purple-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Any additional notes about the trainer..."
              />
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
              {isSubmitting ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" />
                  Add Trainer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTrainerModal
