import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { seedMockBookings } from './data/mockBookings'
import {
  HomePage,
  CoursesPage,
  CourseDetailPage,
  ELearningPage,
  WebinarsPage,
  BookingPage,
} from './pages'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import {
  AdminDashboard,
  EventsPage,
  CreateEventPage,
  BookingsPage as AdminBookingsPage,
  AttendeeAuditPage,
  CoursesAdminPage,
  TrainersAdminPage,
  TrainingRegisterPage,
  VenuesAdminPage,
  SystemConfigPage,
} from './pages/admin'

// Protected route wrapper for authenticated users
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={requireAdmin ? '/login?type=admin' : '/login'} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/account" replace />
  }

  return children
}

// Admin layout wrapper (no header/footer for admin pages)
function AdminLayout({ children }) {
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/courses"
        element={
          <Layout>
            <CoursesPage />
          </Layout>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <Layout>
            <CourseDetailPage />
          </Layout>
        }
      />
      <Route
        path="/elearning"
        element={
          <Layout>
            <ELearningPage />
          </Layout>
        }
      />
      <Route
        path="/webinars"
        element={
          <Layout>
            <WebinarsPage />
          </Layout>
        }
      />
      <Route
        path="/book/:courseId"
        element={
          <Layout>
            <BookingPage />
          </Layout>
        }
      />

      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <Layout>
            <LoginPage />
          </Layout>
        }
      />

      {/* Protected booker routes */}
      <Route
        path="/account"
        element={
          <Layout>
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          </Layout>
        }
      />

      {/* Admin routes (no main layout) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <EventsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/new"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <CreateEventPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminBookingsPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings/audit"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AttendeeAuditPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <CoursesAdminPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trainers"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <TrainersAdminPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/training-register"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <TrainingRegisterPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/venues"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <VenuesAdminPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/system"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <SystemConfigPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Other placeholder routes */}
      <Route
        path="/cart"
        element={
          <Layout>
            <PlaceholderPage title="Shopping Cart" />
          </Layout>
        }
      />
      <Route
        path="/bookings"
        element={
          <Layout>
            <ProtectedRoute>
              <PlaceholderPage title="My Bookings" />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/certificates"
        element={
          <Layout>
            <ProtectedRoute>
              <PlaceholderPage title="My Certificates" />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout>
            <PlaceholderPage title="Contact Us" />
          </Layout>
        }
      />
      <Route
        path="/faq"
        element={
          <Layout>
            <PlaceholderPage title="FAQs" />
          </Layout>
        }
      />
      <Route
        path="/privacy"
        element={
          <Layout>
            <PlaceholderPage title="Privacy Policy" />
          </Layout>
        }
      />
      <Route
        path="/terms"
        element={
          <Layout>
            <PlaceholderPage title="Terms of Service" />
          </Layout>
        }
      />
      <Route
        path="/accessibility"
        element={
          <Layout>
            <PlaceholderPage title="Accessibility" />
          </Layout>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <Layout>
            <NotFoundPage />
          </Layout>
        }
      />
    </Routes>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
        <p className="text-gray-400">This page is under construction</p>
      </div>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-cyan-400 mb-4">404</h1>
        <p className="text-xl text-white mb-4">Page not found</p>
        <a href="/" className="btn-primary">
          Return Home
        </a>
      </div>
    </div>
  )
}

function App() {
  // Seed mock booking data on app initialization
  useEffect(() => {
    seedMockBookings()
  }, [])

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App
