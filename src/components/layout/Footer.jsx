import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="text-2xl font-bold mb-4">
              <span className="text-primary">K</span>ATALYST
            </div>
            <p className="text-gray-400 text-sm">
              Empowering affiliates to grow with Koders.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link to="/leads" className="hover:text-primary transition-colors">My Leads</Link></li>
              <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/guides" className="hover:text-primary transition-colors">Guides</Link></li>
              <li><Link to="/guides#rules" className="hover:text-primary transition-colors">Rules</Link></li>
              <li><a href="https://koders.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">About Koders</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="mailto:support@koders.com" className="hover:text-primary transition-colors">support@koders.com</a></li>
              <li><a href="https://koders.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">koders.com</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Katalyst by Koders. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
