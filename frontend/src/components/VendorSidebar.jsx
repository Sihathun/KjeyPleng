import svgPaths from '../imports/svg-wyxof50a7.js';

export default function VendorSidebar({ activeTab, username = 'Username', onNavigate }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Sales Dashboard',
      path: '/dashboard/sales',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.p550ea80} stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 17.99V14.99" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'list-product',
      label: 'List Product',
      path: '/dashboard/list-product',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.p2933eac0} stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M8 12H16" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M12 16V8" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'manage-product',
      label: 'Manage Product',
      path: '/dashboard/manage-product',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.p9f30e00} stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.p1fcf0e80} stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M7.49 16.52L9.34 14.67" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d={svgPaths.pcd9f0c0} stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'orders',
      label: 'Orders',
      path: '/dashboard/orders',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
          <path d="M3 4.5H21" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M3 9.5H21" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M3 14.5H21" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M3 19.5H21" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-64 min-h-screen border-r border-gray-300">
      <div className="flex flex-col items-center py-8 border-b border-gray-300">
        <div className="relative flex items-center justify-center w-32 h-32 mb-4 overflow-hidden bg-gray-300 rounded-full">
          <svg className="w-20 h-20" fill="none" viewBox="0 0 110 110">
            <path d={svgPaths.p115e3af0} fill="#292D32" fillOpacity="0.8" />
            <path d={svgPaths.p1e24cf00} fill="#292D32" fillOpacity="0.8" />
          </svg>
        </div>
        <p className="text-lg">{username}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate && onNavigate(item.path)}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-colors ${
              activeTab === item.id
                ? 'bg-blue-100 border-r-4 border-blue-500'
                : 'hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}