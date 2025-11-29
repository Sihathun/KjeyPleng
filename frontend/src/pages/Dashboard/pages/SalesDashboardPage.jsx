import { useEffect } from 'react';
import { useProductStore } from '../../../store/productStore';
import { Loader } from 'lucide-react';

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
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Main Content */}
      <div className="container px-8 py-12 mx-auto">
        <h1 className="mb-8 text-2xl font-semibold">Vendor's Dashboard</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Stats */}
          <div className="space-y-6">
            {/* Total Listed Products */}
            <div className="p-6 bg-blue-100 rounded-2xl">
              <p className="mb-2 text-sm text-gray-700">Total listed products</p>
              <p className="text-4xl font-semibold">{stats.totalListedProducts}</p>
            </div>

            {/* Total Revenue */}
            <div className="p-6 bg-green-100 rounded-2xl">
              <p className="mb-2 text-sm text-gray-700">Total revenue</p>
              <p className="text-4xl font-semibold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
            </div>

            {/* Total Sales */}
            <div className="p-6 bg-blue-100 rounded-2xl">
              <p className="mb-2 text-sm text-gray-700">Total sales</p>
              <p className="text-4xl font-semibold">${stats.totalSales.toFixed(2)}</p>
            </div>

            {/* Ongoing Listings */}
            <div className="p-6 bg-yellow-100 rounded-2xl">
              <p className="mb-2 text-sm text-gray-700">Ongoing listings</p>
              <p className="text-4xl font-semibold text-yellow-600">{stats.ongoingListings}</p>
            </div>

            {/* Ongoing Orders */}
            <div className="p-6 bg-orange-100 rounded-2xl">
              <p className="mb-2 text-sm text-gray-700">Ongoing orders</p>
              <p className="text-4xl font-semibold text-orange-600">{stats.ongoingOrders}</p>
            </div>
          </div>

          {/* Right Column - Revenue Chart */}
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h2 className="mb-6 text-xl font-semibold">Revenue / Day (Last 7 Days)</h2>
            <div className="relative h-80">
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
                          className="w-full max-w-16 transition-all bg-blue-400 rounded-t-lg hover:bg-blue-500"
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