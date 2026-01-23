// Customer Credit Accounts for Purchase Order bookings

export const customerAccounts = [
  {
    id: 'acc_001',
    organisationName: 'NHS Greater Manchester',
    accountNumber: 'ACC-NHS-GM-001',
    creditLimit: 50000,
    currentBalance: 12500,
    availableCredit: 37500,
    status: 'active',
    primaryContact: {
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@gm.nhs.uk',
      phone: '0161 123 4567',
    },
    billingAddress: {
      line1: 'Finance Department',
      line2: 'NHS Greater Manchester',
      city: 'Manchester',
      postcode: 'M1 1AA',
    },
    paymentTerms: 30,
    createdAt: '2025-06-15T10:00:00Z',
    notes: 'Large NHS trust with multiple training requirements',
  },
  {
    id: 'acc_002',
    organisationName: 'Birmingham City Council - Adult Social Care',
    accountNumber: 'ACC-BCC-ASC-002',
    creditLimit: 25000,
    currentBalance: 3200,
    availableCredit: 21800,
    status: 'active',
    primaryContact: {
      name: 'James Thompson',
      email: 'j.thompson@birmingham.gov.uk',
      phone: '0121 303 9944',
    },
    billingAddress: {
      line1: 'Council House',
      line2: 'Victoria Square',
      city: 'Birmingham',
      postcode: 'B1 1BB',
    },
    paymentTerms: 30,
    createdAt: '2025-07-20T14:30:00Z',
    notes: 'Regular booking for care staff training',
  },
  {
    id: 'acc_003',
    organisationName: 'Care UK Healthcare',
    accountNumber: 'ACC-CUK-003',
    creditLimit: 75000,
    currentBalance: 28750,
    availableCredit: 46250,
    status: 'active',
    primaryContact: {
      name: 'Emma Roberts',
      email: 'emma.roberts@careuk.com',
      phone: '020 7398 5000',
    },
    billingAddress: {
      line1: 'Care UK Head Office',
      line2: '120 Leman Street',
      city: 'London',
      postcode: 'E1 8EU',
    },
    paymentTerms: 45,
    createdAt: '2025-05-10T09:15:00Z',
    notes: 'National care provider - volume discount agreed',
  },
  {
    id: 'acc_004',
    organisationName: 'Leeds Teaching Hospitals NHS Trust',
    accountNumber: 'ACC-LTHT-004',
    creditLimit: 40000,
    currentBalance: 0,
    availableCredit: 40000,
    status: 'active',
    primaryContact: {
      name: 'Dr Helen Clarke',
      email: 'helen.clarke@nhs.net',
      phone: '0113 243 3144',
    },
    billingAddress: {
      line1: 'St James University Hospital',
      line2: 'Beckett Street',
      city: 'Leeds',
      postcode: 'LS9 7TF',
    },
    paymentTerms: 30,
    createdAt: '2025-08-01T11:00:00Z',
    notes: 'Teaching hospital - academic discount applies',
  },
  {
    id: 'acc_005',
    organisationName: 'Scottish Ambulance Service',
    accountNumber: 'ACC-SAS-005',
    creditLimit: 30000,
    currentBalance: 8500,
    availableCredit: 21500,
    status: 'active',
    primaryContact: {
      name: 'Andrew MacLeod',
      email: 'andrew.macleod@scottishambulance.scot.nhs.uk',
      phone: '0131 314 0000',
    },
    billingAddress: {
      line1: 'National Headquarters',
      line2: 'Gyle Square',
      city: 'Edinburgh',
      postcode: 'EH12 9EB',
    },
    paymentTerms: 30,
    createdAt: '2025-09-05T08:45:00Z',
    notes: 'BLS and emergency response training focus',
  },
  {
    id: 'acc_006',
    organisationName: 'Barchester Healthcare',
    accountNumber: 'ACC-BAR-006',
    creditLimit: 60000,
    currentBalance: 15000,
    availableCredit: 45000,
    status: 'active',
    primaryContact: {
      name: 'Patricia Williams',
      email: 'p.williams@barchester.com',
      phone: '020 7633 5000',
    },
    billingAddress: {
      line1: 'Barchester House',
      line2: '86 St James Street',
      city: 'London',
      postcode: 'SW1A 1PL',
    },
    paymentTerms: 30,
    createdAt: '2025-04-22T16:00:00Z',
    notes: 'Care home group - mandatory training contract',
  },
  {
    id: 'acc_007',
    organisationName: 'Welsh Ambulance Services NHS Trust',
    accountNumber: 'ACC-WAST-007',
    creditLimit: 35000,
    currentBalance: 4200,
    availableCredit: 30800,
    status: 'active',
    primaryContact: {
      name: 'Rhys Evans',
      email: 'rhys.evans@wales.nhs.uk',
      phone: '01011 111 0000',
    },
    billingAddress: {
      line1: 'HQ Vantage Point House',
      line2: 'Ty Coch Way',
      city: 'Cwmbran',
      postcode: 'NP44 3XQ',
    },
    paymentTerms: 30,
    createdAt: '2025-10-10T13:20:00Z',
    notes: 'Emergency services training',
  },
  {
    id: 'acc_008',
    organisationName: 'Nuffield Health',
    accountNumber: 'ACC-NUF-008',
    creditLimit: 45000,
    currentBalance: 22000,
    availableCredit: 23000,
    status: 'suspended',
    primaryContact: {
      name: 'Michael Foster',
      email: 'm.foster@nuffieldhealth.com',
      phone: '020 7317 5700',
    },
    billingAddress: {
      line1: 'Nuffield Health HQ',
      line2: 'Epsom Gateway',
      city: 'Epsom',
      postcode: 'KT17 1BJ',
    },
    paymentTerms: 30,
    createdAt: '2025-03-18T10:30:00Z',
    notes: 'Account suspended - pending payment review',
  },
]

// Account transaction types
export const transactionTypes = {
  DEBIT: 'debit',
  CREDIT: 'credit',
  REFUND: 'refund',
}

// Mock transaction history
export const accountTransactions = [
  {
    id: 'txn_001',
    accountId: 'acc_001',
    type: 'debit',
    amount: 2500,
    bookingRef: 'MHT-ABC123',
    description: 'Basic Life Support x 10 delegates',
    createdAt: '2025-12-01T10:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'txn_002',
    accountId: 'acc_001',
    type: 'debit',
    amount: 5000,
    bookingRef: 'MHT-DEF456',
    description: 'Manual Handling x 20 delegates',
    createdAt: '2025-12-10T14:30:00Z',
    createdBy: 'System',
  },
  {
    id: 'txn_003',
    accountId: 'acc_001',
    type: 'credit',
    amount: 500,
    bookingRef: 'MHT-ABC123',
    description: 'Refund - cancelled booking',
    createdAt: '2025-12-15T09:00:00Z',
    createdBy: 'Admin User',
  },
]

// Helper functions
const STORAGE_KEY = 'miad_customer_accounts'
const TRANSACTIONS_KEY = 'miad_account_transactions'

export function loadCustomerAccounts() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customerAccounts))
  return customerAccounts
}

export function saveCustomerAccounts(accounts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

export function loadAccountTransactions() {
  const stored = localStorage.getItem(TRANSACTIONS_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(accountTransactions))
  return accountTransactions
}

export function saveAccountTransactions(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

export default customerAccounts
