import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Video,
  Monitor,
  Award,
  Clock,
  Shield,
  Users,
  ChevronRight,
  Star,
  CheckCircle,
} from 'lucide-react'
import { courses, getUpcomingWebinars, courseCategories } from '../data/courses'

function HomePage() {
  const upcomingWebinars = getUpcomingWebinars().slice(0, 3)
  const featuredCourses = courses.slice(0, 4)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#13d8a0]/10 via-gray-900 to-emerald-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#13d8a0]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#13d8a0]/10 rounded-full border border-[#13d8a0]/30 mb-6">
              <Shield className="w-4 h-4 text-[#13d8a0]" />
              <span className="text-sm text-white">Trusted by 500+ NHS Trusts & Care Providers</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Professional
              <span className="text-miad">
                {' '}Healthcare Training{' '}
              </span>
              Made Simple
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Accredited courses delivered through live webinars and e-learning.
              Book instantly, learn flexibly, and receive your certificates digitally.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/courses" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                Browse Courses
                <ChevronRight className="w-5 h-5 inline ml-2" />
              </Link>
              <Link to="/elearning" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                Start E-Learning Now
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                CPD Certified
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                NHS Compliant
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Skills for Health Aligned
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Options */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">
            Choose How You Learn
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/webinars" className="card-hover group text-center">
              <div className="w-16 h-16 bg-[#13d8a0]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8 text-[#13d8a0]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Live Webinars</h3>
              <p className="text-gray-400 mb-4">
                Interactive sessions via Zoom with expert trainers. Ask questions in real-time.
              </p>
              <span className="text-[#13d8a0] font-medium flex items-center justify-center gap-1">
                View Schedule <ChevronRight className="w-4 h-4" />
              </span>
            </Link>

            <Link to="/elearning" className="card-hover group text-center">
              <div className="w-16 h-16 bg-green-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Monitor className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">E-Learning</h3>
              <p className="text-gray-400 mb-4">
                Self-paced online courses. Start immediately and learn at your convenience.
              </p>
              <span className="text-green-400 font-medium flex items-center justify-center gap-1">
                Start Learning <ChevronRight className="w-4 h-4" />
              </span>
            </Link>

            <Link to="/courses?delivery=blended" className="card-hover group text-center">
              <div className="w-16 h-16 bg-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Blended Learning</h3>
              <p className="text-gray-400 mb-4">
                Combine e-learning modules with live practical sessions for comprehensive training.
              </p>
              <span className="text-purple-400 font-medium flex items-center justify-center gap-1">
                Explore Options <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-4">Training Categories</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Comprehensive training programmes covering all aspects of healthcare professional development
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {courseCategories.map((category) => (
              <Link
                key={category.id}
                to={`/courses?category=${category.id}`}
                className="card-hover text-center py-6"
              >
                <div className="w-12 h-12 bg-[#13d8a0]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-[#13d8a0]" />
                </div>
                <h3 className="text-sm font-medium text-white">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Webinars */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Upcoming Live Webinars</h2>
            <Link to="/webinars" className="text-[#13d8a0] hover:text-[#2eeab5] font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingWebinars.map((session) => {
              const course = courses.find((c) => c.id === session.courseId)
              return (
                <div key={session.id} className="card-hover">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-[#13d8a0]/10 text-[#13d8a0] text-xs font-medium rounded">
                      Live Webinar
                    </span>
                    {session.spotsRemaining < 10 && (
                      <span className="px-2 py-1 bg-amber-900/50 text-amber-400 text-xs font-medium rounded">
                        {session.spotsRemaining} spots left
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{course?.name}</h3>

                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(session.date).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })} &bull; {session.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {session.trainer}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <span className="text-2xl font-bold text-white">£{session.price}</span>
                    <Link
                      to={`/book/${course?.id}?session=${session.id}`}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Popular Courses</h2>
            <Link to="/courses" className="text-[#13d8a0] hover:text-[#2eeab5] font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="card-hover group">
                <div className="flex items-center gap-2 mb-3">
                  {course.deliveryMethods.map((method) => (
                    <span
                      key={method}
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        method === 'elearning'
                          ? 'bg-green-900/50 text-green-400'
                          : method === 'webinar'
                          ? 'bg-[#13d8a0]/10 text-[#13d8a0]'
                          : 'bg-purple-900/50 text-purple-400'
                      }`}
                    >
                      {method === 'elearning' ? 'E-Learning' : method === 'webinar' ? 'Webinar' : 'Blended'}
                    </span>
                  ))}
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#13d8a0] transition-colors">
                  {course.name}
                </h3>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {course.validityPeriod}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-xl font-bold text-white">
                    From £{course.price}
                  </span>
                  <span className="text-[#13d8a0] font-medium">View Details</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#13d8a0]/10 to-emerald-900/30 border-t border-b border-[#13d8a0]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Training?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Browse our full course catalogue and book your training today.
            Instant e-learning access available.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/courses" className="btn-primary text-lg px-8 py-4">
              View All Courses
            </Link>
            <Link to="/contact" className="btn-secondary text-lg px-8 py-4">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#13d8a0] mb-2">500+</div>
              <div className="text-gray-400">NHS Trusts & Care Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#13d8a0] mb-2">50,000+</div>
              <div className="text-gray-400">Healthcare Professionals Trained</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#13d8a0] mb-2">98%</div>
              <div className="text-gray-400">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#13d8a0] mb-2">4.9</div>
              <div className="text-gray-400 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-current" /> Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
