import { useState, useEffect } from 'react';
import { useProductStore } from '../../../store/productStore';
import { Loader, Package, AlertCircle, ShoppingBag, Calendar, Clock, DollarSign, User, CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersDashboardPage() {
  const { sellerOrders, fetchSellerOrders, updateOrderStatus, isLoading, error } = useProductStore();
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchSellerOrders();
  }, [fetchSellerOrders]);

  const handleStatusChange = async (order, newStatus) => {
    try {
      setUpdatingId(order.id);
      const type = order.order_type === 'rental' ? 'rental' : 'order';
      await updateOrderStatus(order.id, newStatus, type);
      toast.success('Order status updated');
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-purple-100 text-purple-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrderTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'sale':
        return 'bg-green-100 text-green-700';
      case 'rental':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusOptions = (orderType) => {
    if (orderType === 'rental') {
      return ['pending', 'active', 'completed', 'cancelled'];
    }
    return ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
  };

  // Filter orders based on status
  const filteredOrders = filterStatus === 'all' 
    ? sellerOrders 
    : sellerOrders.filter(order => order.status?.toLowerCase() === filterStatus);

  // Calculate summary stats
  const totalOrders = sellerOrders.length;
  const pendingOrders = sellerOrders.filter(o => o.status === 'pending').length;
  const completedOrders = sellerOrders.filter(o => o.status === 'completed').length;
  const totalRevenue = sellerOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

  if (isLoading && sellerOrders.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          {/* Page Header */}
          <div className="px-12 py-8">
            <h1 className="text-2xl font-semibold mb-6">Orders</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-xl font-semibold">{totalOrders}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-xl font-semibold">{pendingOrders}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-xl font-semibold">{completedOrders}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-xl font-semibold">{formatPrice(totalRevenue)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              {['all', 'pending', 'processing', 'active', 'shipped', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-600 mb-2">
                  {filterStatus === 'all' ? 'No orders yet' : `No ${filterStatus} orders`}
                </h2>
                <p className="text-gray-500">
                  {filterStatus === 'all' 
                    ? 'When customers purchase or rent your instruments, their orders will appear here.'
                    : 'Try selecting a different filter to see other orders.'}
                </p>
              </div>
            ) : (
              /* Orders Table */
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 bg-gray-100 px-6 py-4 border-b border-gray-300">
                  <div className="col-span-1">
                    <p className="text-sm font-medium">Order ID</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Customer</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Product</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-medium">Type</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-medium">Amount</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-medium">Payment</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Date</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Status</p>
                  </div>
                </div>

                {/* Table Body */}
                {filteredOrders.map((order) => (
                  <div 
                    key={`${order.order_type}-${order.id}`}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 last:border-b-0 items-center bg-white hover:bg-gray-50 transition-colors"
                  >
                    {/* Order ID */}
                    <div className="col-span-1">
                      <div className="inline-flex items-center justify-center bg-gray-200 rounded px-3 py-1">
                        <p className="text-sm font-mono">#{order.id}</p>
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        {order.customer_profile_picture ? (
                          <img 
                            src={order.customer_profile_picture} 
                            alt={order.customer_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">{order.customer_name}</p>
                          <p className="text-xs text-gray-500 truncate">{order.customer_email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Product */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        {order.product_image && (
                          <img 
                            src={order.product_image} 
                            alt={order.product_name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">{order.product_name}</p>
                          <p className="text-xs text-gray-500 capitalize">{order.product_category}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Type */}
                    <div className="col-span-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full capitalize ${getOrderTypeColor(order.order_type)}`}>
                        {order.order_type === 'rental' ? 'Rent' : 'Sale'}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="col-span-1">
                      <p className="text-sm font-semibold">{formatPrice(order.total_price)}</p>
                      {order.quantity > 1 && (
                        <p className="text-xs text-gray-500">x{order.quantity}</p>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        {order.payment_method === 'cod' ? (
                          <>
                            <Banknote className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-gray-600">COD</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-gray-600">Card</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {formatDate(order.created_at)}
                      </div>
                      {order.order_type === 'rental' && order.start_date && (
                        <p className="text-xs text-gray-500">
                          {formatDate(order.start_date)} - {formatDate(order.end_date)}
                        </p>
                      )}
                    </div>

                    {/* Status Dropdown */}
                    <div className="col-span-2">
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 cursor-pointer hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 ${getStatusColor(order.status)}`}
                        >
                          {getStatusOptions(order.order_type).map((status) => (
                            <option key={status} value={status} className="bg-white text-gray-800">
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {updatingId === order.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                              <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
