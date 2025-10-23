import { ShoppingCart, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="w-full border-b border-black/50">
      <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="bg-linear-to-r from-blue-500 to-black bg-clip-text text-transparent">
            <span>kjey</span>
            <span className="font-bold">Pleng</span>
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8 ml-auto">
          <a href="#" className="text-black hover:opacity-75 transition-opacity">
            Home
          </a>
          <a href="#" className="text-black hover:opacity-75 transition-opacity">
            Products
          </a>
          <a href="#" className="text-black hover:opacity-75 transition-opacity">
            Vendor
          </a>
          <a href="#" className="text-black hover:opacity-75 transition-opacity">
            Dashboard
          </a>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <div className="absolute left-3 text-black/75">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search for an instrument"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cart with Badge */}
        <div className="relative">
          <button className="p-2 hover:opacity-75 transition-opacity">
            <ShoppingCart className="w-6 h-6 text-black/75" strokeWidth={1.5} />
          </button>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">0</span>
          </div>
        </div>

        {/* Login Button */}
        <button className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
          Login
        </button>
      </div>
    </nav>
  );
}
