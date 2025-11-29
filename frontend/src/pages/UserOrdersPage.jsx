import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { 
  Package, 
  Loader, 
  AlertCircle, 
  ShoppingBag, 
  Calendar, 
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function UserOrdersPage() {
  const { buyerOrders, fetchBuyerOrders, isLoading, error } = useProductStore();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBuyerOrders();
  }, [fetchBuyerOrders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getProductImage = (imageData) => {
    if (!imageData) return null;
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return imageData;
    } catch {
      // If it's not valid JSON, it's probably already a URL string
      return imageData;
    }
  };

  const filteredOrders = buyerOrders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'purchases') return order.order_type === 'purchase';
    if (filter === 'rentals') return order.order_type === 'rental';
    return order.status === filter;
  });

  if (isLoading && buyerOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage your purchases and rentals</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'purchases', 'rentals', 'pending', 'processing', 'shipped', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-600 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? "You haven't made any purchases or rentals yet" 
                : `No ${filter} orders found`}
            </p>
            <Link
              to="/search"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Browse Instruments
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={`${order.order_type}-${order.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {order.product_image ? (
                        <img
                          src={getProductImage(order.product_image)}
                          alt={order.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/placeholder.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">
                            {order.product_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {order.product_brand && `${order.product_brand} • `}
                            {order.product_category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(order.total_price)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {order.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {/* Order Type Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                          order.order_type === 'rental' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {order.order_type === 'rental' ? (
                            <><Calendar className="w-3 h-3" /> Rental</>
                          ) : (
                            <><ShoppingBag className="w-3 h-3" /> Purchase</>
                          )}
                        </span>

                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>

                        {/* Date */}
                        <span className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </span>

                        {/* Expand/Collapse Icon */}
                        <div className="ml-auto">
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Seller Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Seller</h4>
                        <div className="flex items-center gap-3">
                          {order.seller_profile_picture ? (
                            <img
                              src={order.seller_profile_picture}
                              alt={order.seller_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {order.seller_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{order.seller_name}</p>
                            <p className="text-sm text-gray-500">{order.seller_email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Payment</h4>
                        <div className="flex items-center gap-2">
                          {order.payment_method === 'cod' ? (
                            <Banknote className="w-5 h-5 text-gray-500" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-gray-500" />
                          )}
                          <span className="text-gray-900">
                            {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Credit Card'}
                          </span>
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            order.payment_status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shipping_address && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
                          <p className="text-gray-900">{order.shipping_address}</p>
                        </div>
                      )}

                      {/* Rental Dates */}
                      {order.order_type === 'rental' && order.start_date && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Rental Period</h4>
                          <p className="text-gray-900">
                            {new Date(order.start_date).toLocaleDateString()} - {new Date(order.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {order.notes && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                          <p className="text-gray-900">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Order ID */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Order ID: <span className="font-mono">{order.id}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
