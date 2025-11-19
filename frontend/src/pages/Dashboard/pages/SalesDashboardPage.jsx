export default function SalesDashboardPage() {
  // Mock dashboard data
  const dashboardData = {
    totalProducts: 12,
    totalRevenue: 450,
    totalSales: 450,
    ongoingListings: 2,
    ongoingOrders: 1,
    username: 'Username'
  };

  // Mock revenue data for the chart
  const revenueData = [
    { day: 'Mon', revenue: 50 },
    { day: 'Tue', revenue: 80 },
    { day: 'Wed', revenue: 45 },
    { day: 'Thu', revenue: 120 },
    { day: 'Fri', revenue: 75 },
    { day: 'Sat', revenue: 40 },
    { day: 'Sun', revenue: 40 }
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  return (
    <div className="min-h-screen bg-white">
      
      {/* Main Content */}
      <div className="container px-8 py-12 mx-auto">
        <h1 className="mb-8 text-2xl">Vendor's Dashboard</h1>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Stats */}
          <div className="space-y-6">
            {/* Total Listed Products */}
            <div className="p-6 bg-blue-100 rounded-2xl">
              <p className="mb-2 text-sm text-gray-700">Total listed products</p>
              <p className="text-4xl">{dashboardData.totalProducts}</p>
            </div>

            {/* Total Revenue */}
            <div className="p-6 bg-blue-100 rounded-2xl">
              <p className="mb-2 text-sm text-gray-700">Total revenue</p>
              <p className="text-4xl">${dashboardData.totalRevenue}</p>
            </div>

            {/* Total Sales */}
            <div className="p-6 bg-blue-100 rounded-2xl">
              <p className="mb-2 text-sm text-gray-700">Total sales</p>
              <p className="text-4xl">${dashboardData.totalSales}</p>
            </div>

            {/* Ongoing Listings */}
            <div className="p-6 bg-blue-100 rounded-2xl">
              <p className="mb-2 text-sm text-gray-700">Ongoing listings</p>
              <p className="text-4xl">{dashboardData.ongoingListings}</p>
            </div>

            {/* Ongoing Orders */}
            <div className="p-6 bg-blue-100 rounded-2xl">
              <p className="mb-2 text-sm text-gray-700">Ongoing orders</p>
              <p className="text-4xl">{dashboardData.ongoingOrders}</p>
            </div>
          </div>

          {/* Right Column - Revenue Chart */}
          <div>
            <h2 className="mb-6 text-xl">Revenue / Day</h2>
            <div className="relative h-96">
              {/* Y-axis line */}
              <div className="absolute left-0 w-px h-full bg-black" />
              
              {/* X-axis line */}
              <div className="absolute bottom-0 w-full h-px bg-black" />

              {/* Chart bars */}
              <div className="absolute bottom-0 left-8 right-0 flex items-end justify-around h-full gap-4 pb-1">
                {revenueData.map((data, index) => {
                  const height = (data.revenue / maxRevenue) * 100;
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 gap-2">
                      <div className="flex flex-col items-center justify-end flex-1 w-full">
                        <span className="mb-2 text-sm text-gray-600">${data.revenue}</span>
                        <div
                          className="w-full transition-all bg-blue-400 rounded-t-lg hover:bg-blue-500"
                          style={{ height: `${height}%`, minHeight: '20px' }}
                        />
                      </div>
                      <span className="text-sm">{data.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}