import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Settings,
  Plug,
  Mail,
  ToggleLeft,
  ToggleRight,
  LogOut,
  ChevronLeft,
  Video,
  CreditCard,
  Bell,
  MessageSquare,
  Smartphone,
  Calendar,
  Shield,
  Zap,
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  RefreshCw,
  ExternalLink,
  Key,
  Globe,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import MiadLogo from '../../assets/miad-logo.svg'

// Default configuration state
const defaultConfig = {
  integrations: {
    zoom: {
      enabled: true,
      clientId: 'zoom_client_***',
      accountId: 'zoom_account_***',
      status: 'connected',
      lastSync: '2026-01-28T09:30:00Z',
    },
    stripe: {
      enabled: true,
      publishableKey: 'pk_live_***',
      webhookConfigured: true,
      status: 'connected',
      lastSync: '2026-01-28T10:15:00Z',
    },
    googleCalendar: {
      enabled: false,
      status: 'disconnected',
    },
    microsoftTeams: {
      enabled: false,
      status: 'disconnected',
    },
    mailchimp: {
      enabled: false,
      status: 'disconnected',
    },
    slack: {
      enabled: false,
      status: 'disconnected',
    },
  },
  communications: {
    email: {
      provider: 'sendgrid',
      fromAddress: 'bookings@miadhealthcare.com',
      fromName: 'Miad Healthcare Training',
      replyTo: 'support@miadhealthcare.com',
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      fromNumber: '',
    },
    notifications: {
      bookingConfirmation: true,
      bookingReminder24h: true,
      bookingReminder1h: true,
      joiningInstructions: true,
      certificateReady: true,
      paymentReceipt: true,
      sessionCancelled: true,
      waitlistNotification: true,
    },
    templates: {
      bookingConfirmation: 'default',
      reminder: 'default',
      joiningInstructions: 'default',
    },
  },
  featureToggles: {
    elearning: {
      enabled: true,
      label: 'E-Learning Courses',
      description: 'Allow users to purchase and access e-learning content',
    },
    webinars: {
      enabled: true,
      label: 'Live Webinars',
      description: 'Enable live webinar booking and Zoom integration',
    },
    inPerson: {
      enabled: true,
      label: 'In-Person Training',
      description: 'Allow booking of face-to-face training sessions',
    },
    guestCheckout: {
      enabled: true,
      label: 'Guest Checkout',
      description: 'Allow bookings without requiring an account',
    },
    corporateAccounts: {
      enabled: true,
      label: 'Corporate Accounts',
      description: 'Enable corporate account booking and invoicing',
    },
    waitlist: {
      enabled: true,
      label: 'Waitlist',
      description: 'Allow users to join waitlist for full sessions',
    },
    certificates: {
      enabled: true,
      label: 'Digital Certificates',
      description: 'Auto-generate certificates upon course completion',
    },
    reviews: {
      enabled: false,
      label: 'Course Reviews',
      description: 'Allow attendees to leave reviews after completing courses',
    },
    multiCurrency: {
      enabled: false,
      label: 'Multi-Currency',
      description: 'Accept payments in multiple currencies',
    },
    apiAccess: {
      enabled: false,
      label: 'API Access',
      description: 'Enable REST API for third-party integrations',
    },
    bulkBookings: {
      enabled: true,
      label: 'Bulk Bookings',
      description: 'Allow booking multiple attendees in one transaction',
    },
    promoCodeso: {
      enabled: true,
      label: 'Promo Codes',
      description: 'Enable discount codes and promotional pricing',
    },
  },
}

function SystemConfigPage() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'integrations')
  const [config, setConfig] = useState(defaultConfig)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login?type=admin')
      return
    }

    // Load config from localStorage
    const savedConfig = localStorage.getItem('miad_system_config')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [isAdmin, navigate])

  useEffect(() => {
    setSearchParams({ tab: activeTab })
  }, [activeTab, setSearchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))
    localStorage.setItem('miad_system_config', JSON.stringify(config))
    setSaving(false)
    setHasChanges(false)
  }

  const updateConfig = (section, key, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const toggleFeature = (featureKey) => {
    setConfig((prev) => ({
      ...prev,
      featureToggles: {
        ...prev.featureToggles,
        [featureKey]: {
          ...prev.featureToggles[featureKey],
          enabled: !prev.featureToggles[featureKey].enabled,
        },
      },
    }))
    setHasChanges(true)
  }

  const toggleNotification = (notificationKey) => {
    setConfig((prev) => ({
      ...prev,
      communications: {
        ...prev.communications,
        notifications: {
          ...prev.communications.notifications,
          [notificationKey]: !prev.communications.notifications[notificationKey],
        },
      },
    }))
    setHasChanges(true)
  }

  if (!isAdmin) return null

  const tabs = [
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'communications', label: 'Communications', icon: Mail },
    { id: 'features', label: 'Feature Toggles', icon: ToggleLeft },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <div className="bg-gray-800 border-b border-purple-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/">
                <img src={MiadLogo} alt="Miad Healthcare" className="h-7" />
              </Link>
              <div className="border-l border-gray-700 pl-6">
                <div className="flex items-center gap-2">
                  <Link
                    to="/admin"
                    className="text-white hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                  <h1 className="text-xl font-bold text-white">System Configuration</h1>
                </div>
                <p className="text-sm text-white">Manage integrations, communications and features</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors text-sm disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                onClick={() => {
                  logout()
                  navigate('/login?type=admin')
                }}
                className="flex items-center gap-2 px-4 py-2 text-white hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-700 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-white hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'integrations' && (
          <IntegrationsTab config={config} updateConfig={updateConfig} />
        )}
        {activeTab === 'communications' && (
          <CommunicationsTab
            config={config}
            updateConfig={updateConfig}
            toggleNotification={toggleNotification}
          />
        )}
        {activeTab === 'features' && (
          <FeatureTogglesTab config={config} toggleFeature={toggleFeature} />
        )}
      </div>
    </div>
  )
}

function IntegrationsTab({ config, updateConfig }) {
  const integrations = [
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Video conferencing for live webinars',
      icon: Video,
      color: 'blue',
      fields: ['clientId', 'accountId'],
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment processing',
      icon: CreditCard,
      color: 'purple',
      fields: ['publishableKey'],
    },
    {
      id: 'googleCalendar',
      name: 'Google Calendar',
      description: 'Sync events with Google Calendar',
      icon: Calendar,
      color: 'red',
      fields: [],
    },
    {
      id: 'microsoftTeams',
      name: 'Microsoft Teams',
      description: 'Alternative video conferencing',
      icon: Users,
      color: 'blue',
      fields: [],
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing automation',
      icon: Mail,
      color: 'amber',
      fields: [],
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team notifications and alerts',
      icon: MessageSquare,
      color: 'green',
      fields: [],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon
          const integrationConfig = config.integrations[integration.id]
          const isConnected = integrationConfig?.status === 'connected'

          return (
            <div
              key={integration.id}
              className="bg-gray-800 rounded-xl border border-purple-800/50 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${integration.color}-900/50 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${integration.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                    <p className="text-sm text-white">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded text-xs">
                      <XCircle className="w-3 h-3" />
                      Disconnected
                    </span>
                  )}
                </div>
              </div>

              {isConnected && integrationConfig?.lastSync && (
                <p className="text-xs text-white mb-4">
                  Last synced: {new Date(integrationConfig.lastSync).toLocaleString('en-GB')}
                </p>
              )}

              <div className="flex items-center gap-3">
                {isConnected ? (
                  <>
                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                      <Settings className="w-4 h-4" />
                      Configure
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                      <RefreshCw className="w-4 h-4" />
                      Sync Now
                    </button>
                    <button className="px-3 py-2 text-red-400 hover:text-red-300 text-sm">
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-colors text-sm">
                    <Plug className="w-4 h-4" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* API Keys Section */}
      <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">API Keys</h3>
        </div>
        <p className="text-sm text-white mb-4">
          Manage API keys for programmatic access to the Miad platform.
        </p>
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium">Production API Key</p>
              <p className="text-xs text-white font-mono mt-1">miad_live_sk_*********************</p>
            </div>
            <button className="text-purple-400 hover:text-purple-300 text-sm">
              Regenerate
            </button>
          </div>
        </div>
        <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm">
          <ExternalLink className="w-4 h-4" />
          View API Documentation
        </button>
      </div>
    </div>
  )
}

function CommunicationsTab({ config, updateConfig, toggleNotification }) {
  const notifications = [
    { key: 'bookingConfirmation', label: 'Booking Confirmation', description: 'Sent immediately after successful booking' },
    { key: 'bookingReminder24h', label: '24-Hour Reminder', description: 'Reminder sent 24 hours before session' },
    { key: 'bookingReminder1h', label: '1-Hour Reminder', description: 'Reminder sent 1 hour before session' },
    { key: 'joiningInstructions', label: 'Joining Instructions', description: 'Zoom/venue details sent before session' },
    { key: 'certificateReady', label: 'Certificate Ready', description: 'Notification when certificate is available' },
    { key: 'paymentReceipt', label: 'Payment Receipt', description: 'Receipt sent after successful payment' },
    { key: 'sessionCancelled', label: 'Session Cancelled', description: 'Alert when a session is cancelled' },
    { key: 'waitlistNotification', label: 'Waitlist Availability', description: 'Alert when space becomes available' },
  ]

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Email Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email Provider
            </label>
            <select
              value={config.communications.email.provider}
              onChange={(e) =>
                updateConfig('communications', 'email', {
                  ...config.communications.email,
                  provider: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
              <option value="ses">Amazon SES</option>
              <option value="smtp">Custom SMTP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              From Address
            </label>
            <input
              type="email"
              value={config.communications.email.fromAddress}
              onChange={(e) =>
                updateConfig('communications', 'email', {
                  ...config.communications.email,
                  fromAddress: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              From Name
            </label>
            <input
              type="text"
              value={config.communications.email.fromName}
              onChange={(e) =>
                updateConfig('communications', 'email', {
                  ...config.communications.email,
                  fromName: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Reply-To Address
            </label>
            <input
              type="email"
              value={config.communications.email.replyTo}
              onChange={(e) =>
                updateConfig('communications', 'email', {
                  ...config.communications.email,
                  replyTo: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SMS Settings */}
      <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">SMS Notifications</h3>
          </div>
          <button
            onClick={() =>
              updateConfig('communications', 'sms', {
                ...config.communications.sms,
                enabled: !config.communications.sms.enabled,
              })
            }
            className={`relative w-12 h-6 rounded-full transition-colors ${
              config.communications.sms.enabled ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                config.communications.sms.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {config.communications.sms.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                SMS Provider
              </label>
              <select
                value={config.communications.sms.provider}
                onChange={(e) =>
                  updateConfig('communications', 'sms', {
                    ...config.communications.sms,
                    provider: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="twilio">Twilio</option>
                <option value="messagebird">MessageBird</option>
                <option value="vonage">Vonage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                From Number
              </label>
              <input
                type="text"
                value={config.communications.sms.fromNumber}
                onChange={(e) =>
                  updateConfig('communications', 'sms', {
                    ...config.communications.sms,
                    fromNumber: e.target.value,
                  })
                }
                placeholder="+44..."
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Notification Toggles */}
      <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Notification Types</h3>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.key}
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg"
            >
              <div>
                <p className="text-white font-medium">{notification.label}</p>
                <p className="text-sm text-white">{notification.description}</p>
              </div>
              <button
                onClick={() => toggleNotification(notification.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  config.communications.notifications[notification.key]
                    ? 'bg-purple-600'
                    : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    config.communications.notifications[notification.key]
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-gray-800 rounded-xl border border-purple-800/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Email Templates</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Booking Confirmation', 'Session Reminder', 'Joining Instructions'].map((template) => (
            <div
              key={template}
              className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-purple-600 cursor-pointer transition-colors"
            >
              <p className="text-white font-medium mb-1">{template}</p>
              <p className="text-xs text-white">Last edited: 15 Jan 2026</p>
              <button className="text-purple-400 hover:text-purple-300 text-sm mt-2">
                Edit Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeatureTogglesTab({ config, toggleFeature }) {
  const featureCategories = [
    {
      title: 'Course Delivery',
      features: ['elearning', 'webinars', 'inPerson'],
    },
    {
      title: 'Booking Options',
      features: ['guestCheckout', 'corporateAccounts', 'waitlist', 'bulkBookings'],
    },
    {
      title: 'Additional Features',
      features: ['certificates', 'reviews', 'promoCodeso'],
    },
    {
      title: 'Advanced',
      features: ['multiCurrency', 'apiAccess'],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-300">Caution</h3>
            <p className="text-sm text-amber-200/70 mt-1">
              Disabling features will immediately affect the user experience. Existing bookings for disabled features will remain accessible.
            </p>
          </div>
        </div>
      </div>

      {featureCategories.map((category) => (
        <div key={category.title} className="bg-gray-800 rounded-xl border border-purple-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{category.title}</h3>
          <div className="space-y-4">
            {category.features.map((featureKey) => {
              const feature = config.featureToggles[featureKey]
              if (!feature) return null

              return (
                <div
                  key={featureKey}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        feature.enabled ? 'bg-purple-900/50' : 'bg-gray-700'
                      }`}
                    >
                      {feature.enabled ? (
                        <ToggleRight className="w-5 h-5 text-purple-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{feature.label}</p>
                      <p className="text-sm text-white">{feature.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeature(featureKey)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      feature.enabled ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                        feature.enabled ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SystemConfigPage
