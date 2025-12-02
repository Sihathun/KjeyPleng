import { useEffect, useState, useRef } from 'react';
import { useProductStore } from '../../../store/productStore';
import { Loader, Package, DollarSign, TrendingUp, Clock, ShoppingBag, Calendar, ChevronDown } from 'lucide-react';

export default function SalesDashboardPage() {
  const { dashboardStats, fetchDashboardStats, isLoading, error } = useProductStore();
  
  // Date range state
  const [dateRange, setDateRange] = useState('7days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [chartWidth, setChartWidth] = useState(800);
  const chartContainerRef = useRef(null);

  // Update chart width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate dates based on selected range
  const getDateRange = () => {
    const end = new Date();
    let start = new Date();
    
    switch (dateRange) {
      case '7days':
        start.setDate(end.getDate() - 6);
        break;
      case '14days':
        start.setDate(end.getDate() - 13);
        break;
      case '30days':
        start.setDate(end.getDate() - 29);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: customStartDate,
            end: customEndDate
          };
        }
        start.setDate(end.getDate() - 6);
        break;
      default:
        start.setDate(end.getDate() - 6);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    const { start, end } = getDateRange();
    fetchDashboardStats(start, end);
  }, [dateRange, customStartDate, customEndDate]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range !== 'custom') {
      setShowDatePicker(false);
    }
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setDateRange('custom');
      setShowDatePicker(false);
    }
  };

  // Default values if no data yet
  const stats = dashboardStats || {
    totalListedProducts: 0,
    totalRevenue: 0,
    totalSales: 0,
    ongoingListings: 0,
    ongoingOrders: 0,
    revenueByDay: []
  };

  // Revenue data for the chart
  const revenueData = stats.revenueByDay || [];
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);
  const totalRevenueInPeriod = revenueData.reduce((sum, d) => sum + d.revenue, 0);

  // Calculate Y-axis scale
  const getYAxisValues = () => {
    if (maxRevenue <= 0) return [0];
    const step = Math.ceil(maxRevenue / 4);
    const roundedStep = Math.ceil(step / 10) * 10 || step;
    const values = [];
    for (let i = 0; i <= 4; i++) {
      values.push(roundedStep * i);
    }
    return values.reverse();
  };

  const yAxisValues = getYAxisValues();
  const chartHeight = 200;

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

          {/* Revenue Chart */}
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
            {/* Header with date range selector */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Revenue Over Time</h2>
                <p className="text-sm text-gray-500">
                  Total in period: <span className="font-semibold text-green-600">${totalRevenueInPeriod.toFixed(2)}</span>
                </p>
              </div>
              
              {/* Date Range Selector */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  {/* Preset buttons */}
                  <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleDateRangeChange('7days')}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        dateRange === '7days' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => handleDateRangeChange('14days')}
                      className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${
                        dateRange === '14days' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      14 Days
                    </button>
                    <button
                      onClick={() => handleDateRangeChange('30days')}
                      className={`px-3 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${
                        dateRange === '30days' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      30 Days
                    </button>
                  </div>
                  
                  {/* Custom date button */}
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
                      dateRange === 'custom'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Custom
                    <ChevronDown className={`w-4 h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {/* Custom date picker dropdown */}
                {showDatePicker && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <span className="text-gray-400 mt-5">to</span>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <button
                        onClick={handleCustomDateApply}
                        className="mt-5 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Line Chart */}
            <div ref={chartContainerRef} className="relative h-80">
              {revenueData.length > 0 ? (
                (() => {
                  // Calculate chart dimensions based on container width
                  const padding = { left: 50, right: 20, top: 30, bottom: 50 };
                  const width = chartWidth;
                  const height = 300;
                  const chartAreaWidth = width - padding.left - padding.right;
                  const chartAreaHeight = height - padding.top - padding.bottom;
                  
                  // Determine how many labels to show based on data length
                  const dataLen = revenueData.length;
                  let labelInterval = 1;
                  if (dataLen > 20) labelInterval = 5;
                  else if (dataLen > 10) labelInterval = 2;
                  
                  // Format date for display (shorter format for many data points)
                  const formatDate = (dateStr, index) => {
                    if (dataLen > 14) {
                      // Show only day-month for 30+ days
                      const parts = dateStr.split('-');
                      return `${parts[0]}/${parts[1]}`;
                    }
                    return dateStr;
                  };

                  return (
                    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                      {/* Y-axis grid lines and labels */}
                      {yAxisValues.map((value, index) => {
                        const y = padding.top + (index * (chartAreaHeight / (yAxisValues.length - 1)));
                        return (
                          <g key={index}>
                            <line
                              x1={padding.left}
                              y1={y}
                              x2={width - padding.right}
                              y2={y}
                              stroke="#e5e7eb"
                              strokeWidth="1"
                              strokeDasharray="4"
                            />
                            <text
                              x={padding.left - 8}
                              y={y + 4}
                              textAnchor="end"
                              fill="#6b7280"
                              fontSize="11"
                            >
                              ${value}
                            </text>
                          </g>
                        );
                      })}

                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>

                      {/* Line path and area fill */}
                      {revenueData.length > 1 && (
                        <>
                          {/* Area fill */}
                          <path
                            d={`
                              M ${padding.left} ${padding.top + chartAreaHeight - (revenueData[0].revenue / (yAxisValues[0] || 1)) * chartAreaHeight}
                              ${revenueData.map((d, i) => {
                                const x = padding.left + (i / (dataLen - 1)) * chartAreaWidth;
                                const y = padding.top + chartAreaHeight - (d.revenue / (yAxisValues[0] || 1)) * chartAreaHeight;
                                return `L ${x} ${y}`;
                              }).join(' ')}
                              L ${padding.left + chartAreaWidth} ${padding.top + chartAreaHeight}
                              L ${padding.left} ${padding.top + chartAreaHeight}
                              Z
                            `}
                            fill="url(#revenueGradient)"
                          />
                          
                          {/* Line */}
                          <path
                            d={`
                              M ${padding.left} ${padding.top + chartAreaHeight - (revenueData[0].revenue / (yAxisValues[0] || 1)) * chartAreaHeight}
                              ${revenueData.map((d, i) => {
                                const x = padding.left + (i / (dataLen - 1)) * chartAreaWidth;
                                const y = padding.top + chartAreaHeight - (d.revenue / (yAxisValues[0] || 1)) * chartAreaHeight;
                                return `L ${x} ${y}`;
                              }).join(' ')}
                            `}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </>
                      )}

                      {/* Data points and labels */}
                      {revenueData.map((d, i) => {
                        const x = dataLen > 1 
                          ? padding.left + (i / (dataLen - 1)) * chartAreaWidth
                          : width / 2;
                        const y = padding.top + chartAreaHeight - (d.revenue / (yAxisValues[0] || 1)) * chartAreaHeight;
                        const showLabel = i % labelInterval === 0 || i === dataLen - 1;
                        
                        return (
                          <g key={i}>
                            {/* Data point */}
                            <circle
                              cx={x}
                              cy={y}
                              r={dataLen > 20 ? 3 : 5}
                              fill="#3b82f6"
                              stroke="white"
                              strokeWidth="2"
                            />
                            
                            {/* Value label - shown if revenue > 0 */}
                            {d.revenue > 0 && (
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                fill="#374151"
                                fontWeight="500"
                                fontSize="10"
                              >
                                ${d.revenue.toFixed(0)}
                              </text>
                            )}
                            
                            {/* X-axis date label - show at intervals */}
                            {showLabel && (
                              <text
                                x={x}
                                y={height - 10}
                                textAnchor="middle"
                                fill="#6b7280"
                                fontSize={dataLen > 14 ? "9" : "10"}
                              >
                                {formatDate(d.date, i)}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for the selected period
                </div>
              )}
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