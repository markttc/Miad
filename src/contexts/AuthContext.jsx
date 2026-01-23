import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const requestOTP = async (email) => {
    return await authService.requestOTP(email)
  }

  const verifyOTP = async (email, otp) => {
    const result = await authService.verifyOTP(email, otp)
    if (result.success) {
      setUser(result.user)
    }
    return result
  }

  const adminLogin = async (username, password) => {
    return await authService.adminLogin(username, password)
  }

  const verifyTwoFactor = async (adminId, code) => {
    const result = await authService.verifyTwoFactor(adminId, code)
    if (result.success) {
      setUser(result.user)
    }
    return result
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const updateProfile = (profileData) => {
    const success = authService.updateBookerProfile(profileData)
    if (success) {
      setUser(authService.getCurrentUser())
    }
    return success
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isBooker: user?.role === 'booker',
    requestOTP,
    verifyOTP,
    adminLogin,
    verifyTwoFactor,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
