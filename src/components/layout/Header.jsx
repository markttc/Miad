import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, User, ShoppingCart } from 'lucide-react'
import MiadLogo from '../../assets/miad-logo.svg'

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/courses', label: 'Courses' },
    { to: '/elearning', label: 'E-Learning' },
    { to: '/webinars', label: 'Live Webinars' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-[#13d8a0]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={MiadLogo} alt="Miad Healthcare" className="h-8" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#13d8a0]'
                      : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/cart"
              className="relative p-2 text-gray-300 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#13d8a0] rounded-full text-xs flex items-center justify-center text-white font-medium">
                0
              </span>
            </Link>
            <Link
              to="/account"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Account</span>
            </Link>
            <Link
              to="/courses"
              className="btn-primary text-sm px-4 py-2"
            >
              Book Training
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-[#13d8a0]/30">
          <nav className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#13d8a0]/10 text-[#13d8a0]'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-4 border-t border-gray-800">
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-300 hover:text-white"
              >
                My Account
              </Link>
              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="block mt-2 btn-primary text-center text-sm"
              >
                Book Training
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
