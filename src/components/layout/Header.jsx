import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

const Header = () => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRole(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setUserRole(data?.role || 'affiliate')
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole('affiliate')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserRole(null)
    toast.success('Logged out successfully')
    navigate('/')
  }

  const isAdmin = userRole === 'admin'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-primary">K</span>
              <span className="text-dark">ATALYST</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                {isAdmin ? (
                  // Admin Navigation
                  <>
                    <Link to="/admin/manage-leads" className="text-dark hover:text-primary transition-colors font-medium">
                      Manage Leads
                    </Link>
                    <Link to="/leaderboard" className="text-dark hover:text-primary transition-colors">
                      Leaderboard
                    </Link>
                    <Link to="/guides" className="text-dark hover:text-primary transition-colors">
                      Guides
                    </Link>
                  </>
                ) : (
                  // Affiliate Navigation
                  <>
                    <Link to="/dashboard" className="text-dark hover:text-primary transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/leads" className="text-dark hover:text-primary transition-colors">
                      My Leads
                    </Link>
                    <Link to="/leaderboard" className="text-dark hover:text-primary transition-colors">
                      Leaderboard
                    </Link>
                    <Link to="/guides" className="text-dark hover:text-primary transition-colors">
                      Guides
                    </Link>
                  </>
                )}
                
                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-dark hover:text-primary transition-colors"
                  >
                    <User size={20} />
                    <span className="text-sm">{user.email?.split('@')[0]}</span>
                    {isAdmin && (
                      <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                      {!isAdmin && (
                        <Link
                          to="/wallet"
                          className="block px-4 py-2 text-sm text-dark hover:bg-gray-50 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Wallet
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/leaderboard" className="text-dark hover:text-primary transition-colors">
                  Leaderboard
                </Link>
                <Link to="/guides" className="text-dark hover:text-primary transition-colors">
                  Guides
                </Link>
                <Link to="/login" className="text-dark hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-dark"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            {user ? (
              <>
                <div className="px-4 py-2 bg-gray-50 rounded-lg mb-3">
                  <div className="text-sm text-gray-600">Logged in as</div>
                  <div className="font-medium">{user.email}</div>
                  {isAdmin && (
                    <span className="mt-1 inline-block px-2 py-1 bg-primary text-white text-xs rounded-full">
                      Admin
                    </span>
                  )}
                </div>

                {isAdmin ? (
                  // Admin Mobile Navigation
                  <>
                    <Link 
                      to="/admin/manage-leads" 
                      className="block text-dark hover:text-primary transition-colors font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Manage Leads
                    </Link>
                    <Link 
                      to="/leaderboard" 
                      className="block text-dark hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Leaderboard
                    </Link>
                    <Link 
                      to="/guides" 
                      className="block text-dark hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Guides
                    </Link>
                  </>
                ) : (
                  // Affiliate Mobile Navigation
                  <>
                    <Link 
                      to="/dashboard" 
                      className="block text-dark hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/leads" 
                      className="block text-dark hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Leads
                    </Link>
                    <Link 
                      to="/leaderboard" 
                      className="block text-dark hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Leaderboard
                    </Link>
                    <Link 
                      to="/guides" 
                      className="block text-dark hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Guides
                    </Link>
                    <Link 
                      to="/wallet" 
                      className="block text-dark hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Wallet
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 pt-3 border-t"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/leaderboard" 
                  className="block text-dark hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
                <Link 
                  to="/guides" 
                  className="block text-dark hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Guides
                </Link>
                <Link 
                  to="/login" 
                  className="block text-dark hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block btn-primary text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
