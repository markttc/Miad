import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Mail,
  Lock,
  User,
  Shield,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { requestOTP, verifyOTP, adminLogin, verifyTwoFactor } = useAuth()

  const loginType = searchParams.get('type') || 'booker' // 'booker' or 'admin'
  const returnUrl = searchParams.get('return') || (loginType === 'admin' ? '/admin' : '/account')

  const [step, setStep] = useState('initial') // initial, otp, 2fa
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Booker state
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  // Admin state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [adminId, setAdminId] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')

  // Dev mode hints
  const [devHint, setDevHint] = useState('')

  const handleBookerSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (step === 'initial') {
        // Request OTP
        const result = await requestOTP(email)
        if (result.success) {
          setStep('otp')
          setSuccess('Check your email for the login code')
          if (result._devOtp) {
            setDevHint(`Dev mode: OTP is ${result._devOtp}`)
          }
        } else {
          setError(result.error || 'Failed to send OTP')
        }
      } else if (step === 'otp') {
        // Verify OTP
        const result = await verifyOTP(email, otp)
        if (result.success) {
          navigate(returnUrl)
        } else {
          setError(result.error || 'Invalid OTP')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (step === 'initial') {
        // Login with username/password
        const result = await adminLogin(username, password)
        if (result.success && result.requiresTwoFactor) {
          setAdminId(result.adminId)
          setStep('2fa')
          setSuccess('Enter the 2FA code sent to your device')
          if (result._devCode) {
            setDevHint(`Dev mode: 2FA code is ${result._devCode}`)
          }
        } else {
          setError(result.error || 'Login failed')
        }
      } else if (step === '2fa') {
        // Verify 2FA
        const result = await verifyTwoFactor(adminId, twoFactorCode)
        if (result.success) {
          navigate(returnUrl)
        } else {
          setError(result.error || 'Invalid 2FA code')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep('initial')
    setError('')
    setSuccess('')
    setDevHint('')
    setOtp('')
    setTwoFactorCode('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#13d8a0]">
            {loginType === 'admin' ? (
              <Shield className="w-8 h-8 text-white" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {loginType === 'admin' ? 'TTC Admin Login' : 'Access Your Account'}
          </h1>
          <p className="text-gray-300 mt-2">
            {loginType === 'admin'
              ? 'Sign in to manage courses and bookings'
              : 'View your bookings and course access'}
          </p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex gap-2 mb-6">
          <Link
            to="/login?type=booker"
            className={`flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium transition-colors ${
              loginType === 'booker'
                ? 'bg-[#13d8a0] text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            Booker Login
          </Link>
          <Link
            to="/login?type=admin"
            className={`flex-1 py-2 px-4 rounded-lg text-center text-sm font-medium transition-colors ${
              loginType === 'admin'
                ? 'bg-[#13d8a0] text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            TTC Admin
          </Link>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-lg flex items-center gap-2 text-red-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-800 rounded-lg flex items-center gap-2 text-green-300">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}
        {devHint && (
          <div className="mb-4 p-3 bg-amber-900/50 border border-amber-800 rounded-lg text-amber-300 text-sm">
            {devHint}
          </div>
        )}

        {/* Booker Login Form */}
        {loginType === 'booker' && (
          <form onSubmit={handleBookerSubmit} className="card">
            {step === 'initial' ? (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="your.email@nhs.net"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-300 mt-2">
                    We&apos;ll send a one-time login code to this email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Login Code
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-300 hover:text-white flex items-center gap-1 text-sm mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Use different email
                </button>

                <div className="mb-2 text-sm text-gray-300">
                  Enter the 6-digit code sent to:
                </div>
                <div className="mb-6 font-medium text-white">{email}</div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Login Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify & Login
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtp('')
                    setError('')
                    handleBookerSubmit({ preventDefault: () => {} })
                  }}
                  className="w-full mt-3 text-center text-sm text-[#13d8a0] hover:text-[#2eeab5]"
                >
                  Resend code
                </button>
              </>
            )}
          </form>
        )}

        {/* Admin Login Form */}
        {loginType === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="card">
            {step === 'initial' ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="w-full bg-[#13d8a0] hover:bg-[#0fb88a] text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-300 mt-4 text-center">
                  Demo: username <code className="text-[#13d8a0]">ttcadmin</code> / password <code className="text-[#13d8a0]">admin123</code>
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-300 hover:text-white flex items-center gap-1 text-sm mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </button>

                <div className="mb-6 text-center">
                  <Shield className="w-12 h-12 text-[#13d8a0] mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    Enter the 6-digit code from your authenticator
                  </p>
                </div>

                <div className="mb-6">
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || twoFactorCode.length !== 6}
                  className="w-full bg-[#13d8a0] hover:bg-[#0fb88a] text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify & Login
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-300">
          {loginType === 'booker' ? (
            <p>
              Need help? Contact{' '}
              <a href="mailto:training@miad.co.uk" className="text-[#13d8a0] hover:underline">
                training@miad.co.uk
              </a>
            </p>
          ) : (
            <p>
              Admin access issues? Contact IT support.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
