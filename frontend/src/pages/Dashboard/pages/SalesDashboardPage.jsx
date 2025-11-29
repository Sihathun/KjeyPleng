import { useEffect } from 'react';
import { useProductStore } from '../../../store/productStore';
import { Loader, Package, DollarSign, TrendingUp, Clock, ShoppingBag } from 'lucide-react';

export default function SalesDashboardPage() {
  const { dashboardStats, fetchDashboardStats, isLoading, error } = useProductStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Default values if no data yet
  const stats = dashboardStats || {
    totalListedProducts: 0,
    totalRevenue: 0,
    totalSales: 0,
    ongoingListings: 0,
    ongoingOrders: 0,
    revenueByDay: []
  };

  // Default revenue data for the chart if empty
  const revenueData = stats.revenueByDay?.length > 0 
    ? stats.revenueByDay 
    : [
        { day: 'Mon', revenue: 0 },
        { day: 'Tue', revenue: 0 },
        { day: 'Wed', revenue: 0 },
        { day: 'Thu', revenue: 0 },
        { day: 'Fri', revenue: 0 },
        { day: 'Sat', revenue: 0 },
        { day: 'Sun', revenue: 0 }
      ];

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1); // Minimum 1 to avoid division by zero

  if (isLoading && !dashboardStats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="flex-1">
        <div className="px-12 py-8">
          <h1 className="text-2xl font-semibold mb-6">Vendor's Dashboard</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Stats Cards Row */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {/* Total Listed Products */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Listed Products</p>
                  <p className="text-xl font-semibold">{stats.totalListedProducts}</p>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xl font-semibold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Total Sales */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-xl font-semibold">${stats.totalSales.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Ongoing Listings */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Listings</p>
                  <p className="text-xl font-semibold text-yellow-600">{stats.ongoingListings}</p>
                </div>
              </div>
            </div>

            {/* Ongoing Orders */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ongoing Orders</p>
                  <p className="text-xl font-semibold text-orange-600">{stats.ongoingOrders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart Row */}
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
            <h2 className="mb-6 text-xl font-semibold">Revenue / Day (Last 7 Days)</h2>
            <div className="relative h-64">
              {/* Y-axis line */}
              <div className="absolute left-0 w-px h-full bg-gray-300" />
              
              {/* X-axis line */}
              <div className="absolute bottom-8 left-0 right-0 h-px bg-gray-300" />

              {/* Chart bars */}
              <div className="absolute bottom-8 left-8 right-0 flex items-end justify-around h-[calc(100%-2rem)] gap-2">
                {revenueData.map((data, index) => {
                  const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 gap-2">
                      <div className="flex flex-col items-center justify-end flex-1 w-full">
                        <span className="mb-2 text-sm text-gray-600 font-medium">
                          ${data.revenue.toFixed(0)}
                        </span>
                        <div
                          className="w-full max-w-16 transition-all bg-orange-400 rounded-t-lg hover:bg-orange-500"
                          style={{ 
                            height: height > 0 ? `${height}%` : '4px',
                            minHeight: '4px'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Day labels */}
              <div className="absolute bottom-0 left-8 right-0 flex justify-around">
                {revenueData.map((data, index) => (
                  <span key={index} className="text-sm text-gray-600">{data.day}</span>
                ))}
              </div>
            </div>
            
            {stats.totalRevenue === 0 && (
              <p className="text-center text-gray-500 mt-4">
                No revenue data yet. Complete some orders to see your earnings!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}