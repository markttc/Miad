// Customer Account Service for managing credit accounts and PO bookings

import {
  loadCustomerAccounts,
  saveCustomerAccounts,
  loadAccountTransactions,
  saveAccountTransactions,
  transactionTypes,
} from '../data/customerAccounts'

// Get all customer accounts
export function getAllCustomerAccounts() {
  return loadCustomerAccounts()
}

// Get active customer accounts only
export function getActiveCustomerAccounts() {
  const accounts = loadCustomerAccounts()
  return accounts.filter((account) => account.status === 'active')
}

// Get customer account by ID
export function getCustomerAccountById(accountId) {
  const accounts = loadCustomerAccounts()
  return accounts.find((account) => account.id === accountId) || null
}

// Get customer account by account number
export function getCustomerAccountByNumber(accountNumber) {
  const accounts = loadCustomerAccounts()
  return accounts.find((account) => account.accountNumber === accountNumber) || null
}

// Search customer accounts
export function searchCustomerAccounts(query) {
  const accounts = loadCustomerAccounts()
  const lowerQuery = query.toLowerCase()

  return accounts.filter((account) => {
    return (
      account.organisationName.toLowerCase().includes(lowerQuery) ||
      account.accountNumber.toLowerCase().includes(lowerQuery) ||
      account.primaryContact.name.toLowerCase().includes(lowerQuery) ||
      account.primaryContact.email.toLowerCase().includes(lowerQuery)
    )
  })
}

// Create new customer account
export function createCustomerAccount(accountData) {
  const accounts = loadCustomerAccounts()

  // Generate account ID and number
  const timestamp = Date.now()
  const accountNumber = `ACC-${accountData.organisationName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 4)}-${String(accounts.length + 1).padStart(3, '0')}`

  const newAccount = {
    id: `acc_${timestamp}`,
    accountNumber,
    organisationName: accountData.organisationName,
    creditLimit: accountData.creditLimit || 10000,
    currentBalance: 0,
    availableCredit: accountData.creditLimit || 10000,
    status: 'active',
    primaryContact: {
      name: accountData.contactName || '',
      email: accountData.contactEmail || '',
      phone: accountData.contactPhone || '',
    },
    billingAddress: {
      line1: accountData.addressLine1 || '',
      line2: accountData.addressLine2 || '',
      city: accountData.city || '',
      postcode: accountData.postcode || '',
    },
    paymentTerms: accountData.paymentTerms || 30,
    createdAt: new Date().toISOString(),
    notes: accountData.notes || '',
  }

  accounts.push(newAccount)
  saveCustomerAccounts(accounts)

  return newAccount
}

// Update customer account
export function updateCustomerAccount(accountId, updates) {
  const accounts = loadCustomerAccounts()
  const index = accounts.findIndex((account) => account.id === accountId)

  if (index === -1) {
    throw new Error('Account not found')
  }

  accounts[index] = {
    ...accounts[index],
    ...updates,
    // Recalculate available credit if balance or limit changed
    availableCredit: (updates.creditLimit ?? accounts[index].creditLimit) -
                     (updates.currentBalance ?? accounts[index].currentBalance),
  }

  saveCustomerAccounts(accounts)
  return accounts[index]
}

// Check if account has sufficient credit
export function checkCreditAvailability(accountId, amount) {
  const account = getCustomerAccountById(accountId)

  if (!account) {
    return { available: false, reason: 'Account not found' }
  }

  if (account.status !== 'active') {
    return { available: false, reason: 'Account is suspended' }
  }

  if (account.availableCredit < amount) {
    return {
      available: false,
      reason: `Insufficient credit. Available: £${account.availableCredit.toFixed(2)}, Required: £${amount.toFixed(2)}`,
    }
  }

  return { available: true, availableCredit: account.availableCredit }
}

// Debit account (for new bookings)
export function debitAccount(accountId, amount, bookingRef, description, adminUser = 'System') {
  const accounts = loadCustomerAccounts()
  const index = accounts.findIndex((account) => account.id === accountId)

  if (index === -1) {
    throw new Error('Account not found')
  }

  const account = accounts[index]

  if (account.status !== 'active') {
    throw new Error('Account is suspended')
  }

  if (account.availableCredit < amount) {
    throw new Error('Insufficient credit')
  }

  // Update account balance
  accounts[index] = {
    ...account,
    currentBalance: account.currentBalance + amount,
    availableCredit: account.availableCredit - amount,
  }

  saveCustomerAccounts(accounts)

  // Record transaction
  const transactions = loadAccountTransactions()
  const transaction = {
    id: `txn_${Date.now()}`,
    accountId,
    type: transactionTypes.DEBIT,
    amount,
    bookingRef,
    description,
    createdAt: new Date().toISOString(),
    createdBy: adminUser,
  }
  transactions.push(transaction)
  saveAccountTransactions(transactions)

  return { account: accounts[index], transaction }
}

// Credit account (for refunds/cancellations)
export function creditAccount(accountId, amount, bookingRef, description, adminUser = 'System') {
  const accounts = loadCustomerAccounts()
  const index = accounts.findIndex((account) => account.id === accountId)

  if (index === -1) {
    throw new Error('Account not found')
  }

  const account = accounts[index]

  // Update account balance
  accounts[index] = {
    ...account,
    currentBalance: Math.max(0, account.currentBalance - amount),
    availableCredit: account.availableCredit + amount,
  }

  saveCustomerAccounts(accounts)

  // Record transaction
  const transactions = loadAccountTransactions()
  const transaction = {
    id: `txn_${Date.now()}`,
    accountId,
    type: transactionTypes.CREDIT,
    amount,
    bookingRef,
    description,
    createdAt: new Date().toISOString(),
    createdBy: adminUser,
  }
  transactions.push(transaction)
  saveAccountTransactions(transactions)

  return { account: accounts[index], transaction }
}

// Get account transactions
export function getAccountTransactions(accountId) {
  const transactions = loadAccountTransactions()
  return transactions
    .filter((txn) => txn.accountId === accountId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// Suspend account
export function suspendAccount(accountId, reason = '') {
  return updateCustomerAccount(accountId, {
    status: 'suspended',
    notes: reason ? `Suspended: ${reason}` : 'Account suspended',
  })
}

// Reactivate account
export function reactivateAccount(accountId) {
  return updateCustomerAccount(accountId, {
    status: 'active',
  })
}

// Get account summary/stats
export function getAccountSummary(accountId) {
  const account = getCustomerAccountById(accountId)
  if (!account) return null

  const transactions = getAccountTransactions(accountId)

  const totalDebits = transactions
    .filter((t) => t.type === transactionTypes.DEBIT)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalCredits = transactions
    .filter((t) => t.type === transactionTypes.CREDIT || t.type === transactionTypes.REFUND)
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    ...account,
    totalDebits,
    totalCredits,
    transactionCount: transactions.length,
    recentTransactions: transactions.slice(0, 5),
  }
}

export default {
  getAllCustomerAccounts,
  getActiveCustomerAccounts,
  getCustomerAccountById,
  getCustomerAccountByNumber,
  searchCustomerAccounts,
  createCustomerAccount,
  updateCustomerAccount,
  checkCreditAvailability,
  debitAccount,
  creditAccount,
  getAccountTransactions,
  suspendAccount,
  reactivateAccount,
  getAccountSummary,
}
