import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import MiadLogo from '../../assets/miad-logo.svg'

function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-[#13d8a0]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img src={MiadLogo} alt="Miad Healthcare" className="h-7" />
            </Link>
            <p className="text-sm text-gray-300">
              Professional healthcare training and development for NHS trusts, care providers, and healthcare professionals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Training
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/elearning" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  E-Learning
                </Link>
              </li>
              <li>
                <Link to="/webinars" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  Live Webinars
                </Link>
              </li>
              <li>
                <Link to="/courses?category=mandatory" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  Mandatory Training
                </Link>
              </li>
              <li>
                <Link to="/courses?category=clinical" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  Clinical Skills
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/account" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/certificates" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  Certificates
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#13d8a0] mt-0.5" />
                <a href="mailto:training@miad.co.uk" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  training@miad.co.uk
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#13d8a0] mt-0.5" />
                <a href="tel:08001234567" className="text-gray-300 hover:text-[#13d8a0] text-sm transition-colors">
                  0800 123 4567
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#13d8a0] mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Miad Healthcare<br />
                  Training Centre<br />
                  London, UK
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} Miad Healthcare Training. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-gray-300 hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-gray-300 hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
            <Link to="/accessibility" className="text-sm text-gray-300 hover:text-gray-300 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
