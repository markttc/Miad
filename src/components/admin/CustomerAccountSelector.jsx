import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Building,
  ChevronDown,
  Check,
  Plus,
  AlertCircle,
  X,
} from 'lucide-react'
import { getActiveCustomerAccounts, searchCustomerAccounts, createCustomerAccount } from '../../services/customerAccountService'

function CustomerAccountSelector({ value, onChange, requiredAmount = 0 }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [accounts, setAccounts] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newAccount, setNewAccount] = useState({
    organisationName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    creditLimit: 10000,
  })
  const dropdownRef = useRef(null)

  useEffect(() => {
    loadAccounts()
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setShowCreateForm(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadAccounts = () => {
    const activeAccounts = getActiveCustomerAccounts()
    setAccounts(activeAccounts)
  }

  const filteredAccounts = searchQuery
    ? searchCustomerAccounts(searchQuery).filter((a) => a.status === 'active')
    : accounts

  const selectedAccount = accounts.find((a) => a.id === value)

  const handleSelect = (account) => {
    onChange(account.id)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleCreateAccount = () => {
    if (!newAccount.organisationName.trim()) return

    const created = createCustomerAccount(newAccount)
    loadAccounts()
    onChange(created.id)
    setShowCreateForm(false)
    setIsOpen(false)
    setNewAccount({
      organisationName: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      creditLimit: 10000,
    })
  }

  const hasInsufficientCredit = selectedAccount && requiredAmount > 0 && selectedAccount.availableCredit < requiredAmount

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Value / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-gray-900 border rounded-lg text-left transition-colors ${
          hasInsufficientCredit
            ? 'border-red-500'
            : isOpen
            ? 'border-[#13d8a0]'
            : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        {selectedAccount ? (
          <div className="flex items-center gap-3 min-w-0">
            <Building className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-white font-medium truncate">{selectedAccount.organisationName}</div>
              <div className="text-xs text-white">
                {selectedAccount.accountNumber} • Credit: £{selectedAccount.availableCredit.toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-white">Select a customer account...</span>
        )}
        <ChevronDown className={`w-5 h-5 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Insufficient Credit Warning */}
      {hasInsufficientCredit && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>
            Insufficient credit. Available: £{selectedAccount.availableCredit.toLocaleString()},
            Required: £{requiredAmount.toLocaleString()}
          </span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accounts..."
                className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#13d8a0]"
                autoFocus
              />
            </div>
          </div>

          {/* Account List */}
          {!showCreateForm && (
            <>
              <div className="max-h-64 overflow-y-auto">
                {filteredAccounts.length === 0 ? (
                  <div className="p-4 text-center text-white">
                    No accounts found
                  </div>
                ) : (
                  filteredAccounts.map((account) => {
                    const insufficientCredit = requiredAmount > 0 && account.availableCredit < requiredAmount
                    return (
                      <button
                        key={account.id}
                        onClick={() => !insufficientCredit && handleSelect(account)}
                        disabled={insufficientCredit}
                        className={`w-full p-3 flex items-center gap-3 text-left transition-colors ${
                          insufficientCredit
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-700'
                        } ${value === account.id ? 'bg-gray-700' : ''}`}
                      >
                        <Building className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{account.organisationName}</div>
                          <div className="text-xs text-white">
                            {account.accountNumber}
                          </div>
                          <div className="text-xs mt-1">
                            <span className={insufficientCredit ? 'text-red-400' : 'text-green-400'}>
                              £{account.availableCredit.toLocaleString()} available
                            </span>
                            <span className="text-gray-600"> / £{account.creditLimit.toLocaleString()} limit</span>
                          </div>
                        </div>
                        {value === account.id && (
                          <Check className="w-5 h-5 text-[#13d8a0]" />
                        )}
                      </button>
                    )
                  })
                )}
              </div>

              {/* Create New Account Button */}
              <div className="p-3 border-t border-gray-700">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#13d8a0]/10 text-[#13d8a0] rounded-lg hover:bg-[#13d8a0]/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Account
                </button>
              </div>
            </>
          )}

          {/* Create Account Form */}
          {showCreateForm && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">New Customer Account</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 text-white hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-white mb-1">Organisation Name *</label>
                  <input
                    type="text"
                    value={newAccount.organisationName}
                    onChange={(e) => setNewAccount({ ...newAccount, organisationName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#13d8a0]"
                    placeholder="NHS Trust Name..."
                  />
                </div>

                <div>
                  <label className="block text-xs text-white mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={newAccount.contactName}
                    onChange={(e) => setNewAccount({ ...newAccount, contactName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#13d8a0]"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={newAccount.contactEmail}
                    onChange={(e) => setNewAccount({ ...newAccount, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#13d8a0]"
                    placeholder="finance@nhs.net"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white mb-1">Credit Limit (£)</label>
                  <input
                    type="number"
                    value={newAccount.creditLimit}
                    onChange={(e) => setNewAccount({ ...newAccount, creditLimit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#13d8a0]"
                    min={0}
                    step={1000}
                  />
                </div>

                <button
                  onClick={handleCreateAccount}
                  disabled={!newAccount.organisationName.trim()}
                  className="w-full mt-2 px-4 py-2 bg-[#13d8a0] text-white rounded-lg font-medium hover:bg-[#0fb88a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomerAccountSelector
