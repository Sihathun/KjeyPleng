import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, updateRentalDays, getCartTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getItemPrice = (item) => {
    if (item.orderType === 'rental') {
      return parseFloat(item.product.rental_price) * item.rentalDays * item.quantity;
    }
    return parseFloat(item.product.sale_price) * item.quantity;
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to checkout');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    
    // Simulate checkout process
    try {
      // Here you would integrate with a payment gateway
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Order placed successfully!');
      clearCart();
      navigate('/');
    } catch (error) {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container px-8 py-12 mx-auto">
          <div className="text-center py-20">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-semibold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any instruments yet.</p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Browse Instruments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-8 py-12 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold">Shopping Cart</h1>
          <Link
            to="/search"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Type</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Subtotal</div>
              <div className="col-span-1"></div>
            </div>

            {/* Cart Items List */}
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-gray-50 border border-gray-200 rounded-xl items-center"
              >
                {/* Product Info */}
                <div className="md:col-span-5 flex items-center gap-4">
                  <Link to={`/product/${item.product.id}`}>
                    <img
                      src={item.product.image || '/images/placeholder.png'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors truncate">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 capitalize">{item.product.category}</p>
                    <p className="text-sm text-gray-600">
                      {item.orderType === 'rental' 
                        ? `${formatPrice(item.product.rental_price)}/${item.product.rental_period || 'day'}`
                        : formatPrice(item.product.sale_price)
                      }
                    </p>
                  </div>
                </div>

                {/* Order Type */}
                <div className="md:col-span-2 flex md:justify-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    item.orderType === 'rental'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {item.orderType === 'rental' ? '🔄 Rent' : '💰 Buy'}
                  </span>
                </div>

                {/* Quantity / Rental Days */}
                <div className="md:col-span-2 flex flex-col items-center gap-2">
                  {item.orderType === 'rental' ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2">
                        <button
                          onClick={() => updateRentalDays(item.id, item.rentalDays - 1)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          disabled={item.rentalDays <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.rentalDays}</span>
                        <button
                          onClick={() => updateRentalDays(item.id, item.rentalDays + 1)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.rentalDays} {item.rentalDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtotal */}
                <div className="md:col-span-2 text-right">
                  <p className="font-semibold text-lg">{formatPrice(getItemPrice(item))}</p>
                </div>

                {/* Remove Button */}
                <div className="md:col-span-1 flex justify-end">
                  <button
                    onClick={() => {
                      removeFromCart(item.id);
                      toast.success('Item removed from cart');
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared');
                }}
                className="text-red-500 hover:text-red-600 transition-colors text-sm font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-6 border-b border-gray-200">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-green-600">{formatPrice(getCartTotal())}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full mt-6 py-4 bg-orange-500 text-white text-lg font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Secure checkout powered by Stripe
              </p>

              {/* Trust Badges */}
              <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-lg">🔒</span>
                  </div>
                  <span className="text-xs text-gray-500">Secure</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-lg">✓</span>
                  </div>
                  <span className="text-xs text-gray-500">Verified</span>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-lg">↩️</span>
                  </div>
                  <span className="text-xs text-gray-500">Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
