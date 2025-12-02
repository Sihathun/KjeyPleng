import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, ChevronDown, Settings, Package, Crown, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const cartItemCount = getItemCount();

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get('/api/subscription/status');
          setIsPremium(response.data.subscription?.isPremium || false);
        } catch (error) {
          console.error('Error fetching subscription:', error);
        }
      } else {
        setIsPremium(false);
      }
    };
    fetchSubscription();
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <nav className="w-full border-b border-black/50">
      <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center gap-8">
        {/* Logo */}
        <Link to="/">
          <div className="flex items-center">
            <h1 className="bg-linear-to-r from-blue-500 to-black bg-clip-text text-transparent">
              <span>kjey</span>
              <span className="font-bold">Pleng</span>
            </h1>
          </div>
        </Link>
        {/* Navigation Links */}
        <div className="flex items-center gap-8 ml-auto">
          <Link to="/" className="text-black hover:opacity-75 transition-opacity">
            Home
          </Link>
          {isPremium ? (
            <Link 
              to="/subscribe" 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 rounded-full font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-sm"
            >
              <Crown className="w-4 h-4" />
              Your Plan
            </Link>
          ) : (
            <Link 
              to="/subscribe" 
              className="group flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-sm hover:shadow-md"
            >
              <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
              Subscribe
            </Link>
          )}
          <Link to="/dashboard" className="text-black hover:opacity-75 transition-opacity">
            Dashboard
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <div className="absolute left-3 text-black/75">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery('');
                }
              }}
              placeholder="Search for an instrument"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cart with Badge */}
        <Link to="/cart" className="relative">
          <button className="p-2 hover:opacity-75 transition-opacity">
            <ShoppingCart className="w-6 h-6 text-black/75" strokeWidth={1.5} />
          </button>
          {cartItemCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">{cartItemCount > 99 ? '99+' : cartItemCount}</span>
            </div>
          )}
        </Link>

        {/* User Section */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-black font-medium max-w-[120px] truncate">
                {user.name?.split(' ')[0]}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                
                <Link
                  to="/account-settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </Link>

                <Link
                  to="/my-orders"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  <span>Your Orders</span>
                </Link>

                <Link
                  to="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
