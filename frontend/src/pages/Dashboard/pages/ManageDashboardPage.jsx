import { useState, useEffect } from 'react';
import { useProductStore } from '../../../store/productStore';
import { Edit, Trash2, Eye, EyeOff, Loader, Package, AlertCircle, RefreshCw, Clock, Star } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ManageProductPage() {
  const { myListings, fetchMyListings, updateProduct, deleteProduct, renewListing, toggleFeatured, isLoading, error } = useProductStore();
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [renewingId, setRenewingId] = useState(null);
  const [featuringId, setFeaturingId] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchMyListings();
    fetchSubscriptionStatus();
  }, [fetchMyListings]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get('/api/subscription/status');
      setIsPremium(response.data.subscription?.isPremium || false);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedData = {
      name: formData.get('name'),
      description: formData.get('description'),
      sale_price: formData.get('sale_price') ? parseFloat(formData.get('sale_price')) : null,
      rental_price: formData.get('rental_price') ? parseFloat(formData.get('rental_price')) : null,
      is_available: formData.get('is_available') === 'true',
    };
    
    try {
      await updateProduct(editingProduct.id, updatedData);
      setEditingProduct(null);
      toast.success('Product updated successfully');
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      setDeleteConfirm(null);
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      await updateProduct(product.id, { is_available: !product.is_available });
      toast.success(`Product ${product.is_available ? 'hidden' : 'listed'} successfully`);
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const handleRenew = async (productId) => {
    try {
      setRenewingId(productId);
      const response = await renewListing(productId);
      toast.success(response.message || 'Listing renewed successfully!');
    } catch (err) {
      toast.error('Failed to renew listing');
    } finally {
      setRenewingId(null);
    }
  };

  const handleToggleFeatured = async (product) => {
    if (!isPremium) {
      toast.error('Upgrade to premium to feature your listings!');
      return;
    }
    
    try {
      setFeaturingId(product.id);
      const response = await toggleFeatured(product.id);
      toast.success(response.message);
    } catch (err) {
      toast.error(err.message || 'Failed to toggle featured status');
    } finally {
      setFeaturingId(null);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getExpirationStatus = (expiresAt) => {
    if (!expiresAt) return { text: 'No expiry', color: 'text-gray-500', isExpired: false };
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffMs <= 0) {
      return { text: 'Expired', color: 'text-red-600', isExpired: true };
    } else if (diffDays <= 1) {
      return { text: `${diffHours}h left`, color: 'text-orange-600', isExpired: false };
    } else {
      return { text: `${diffDays} days left`, color: 'text-green-600', isExpired: false };
    }
  };

  if (isLoading && myListings.length === 0) {
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
            <h1 className="text-2xl font-semibold mb-8">Manage Your Listings</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {myListings.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-600 mb-2">No listings yet</h2>
                <p className="text-gray-500 mb-6">Start selling by creating your first listing</p>
                <a
                  href="/dashboard/list-product"
                  className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Create Listing
                </a>
              </div>
            ) : (
              /* Products Table */
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 bg-gray-100 px-6 py-4 border-b border-gray-300">
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Product Name</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Category</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-medium">Type</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Price</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm font-medium">Status</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Expires</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Actions</p>
                  </div>
                </div>

                {/* Table Body */}
                {myListings.map((product) => {
                  const expirationStatus = getExpirationStatus(product.expires_at);
                  return (
                  <div 
                    key={product.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 last:border-b-0 items-center"
                  >
                    {/* Product Name */}
                    <div className="col-span-2">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-gray-500 truncate">{product.brand || 'No brand'}</p>
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600 capitalize">{product.category || '-'}</span>
                    </div>

                    {/* Listing Type */}
                    <div className="col-span-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        product.listing_type === 'sale' ? 'bg-green-100 text-green-700' :
                        product.listing_type === 'rent' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {product.listing_type === 'both' ? 'Both' : product.listing_type?.charAt(0).toUpperCase() + product.listing_type?.slice(1)}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="col-span-2">
                      {product.listing_type === 'sale' && (
                        <p className="text-sm">{formatPrice(product.sale_price)}</p>
                      )}
                      {product.listing_type === 'rent' && (
                        <p className="text-sm">{formatPrice(product.rental_price)}/{product.rental_period}</p>
                      )}
                      {product.listing_type === 'both' && (
                        <div>
                          <p className="text-sm">{formatPrice(product.sale_price)} (Buy)</p>
                          <p className="text-xs text-gray-500">{formatPrice(product.rental_price)}/{product.rental_period}</p>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      {product.is_sold ? (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
                          Sold
                        </span>
                      ) : product.is_ongoing ? (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                          Ongoing
                        </span>
                      ) : product.is_available && !expirationStatus.isExpired ? (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                          Listed
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">
                          Unlisted
                        </span>
                      )}
                    </div>

                    {/* Expiration */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        <Clock className={`w-3 h-3 ${expirationStatus.color}`} />
                        <span className={`text-sm ${expirationStatus.color}`}>{expirationStatus.text}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex gap-1">
                      {/* Feature Toggle - Only for premium users */}
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        disabled={featuringId === product.id || product.is_sold || !product.is_available}
                        className={`p-2 rounded-md transition-colors ${
                          !isPremium
                            ? 'text-gray-300 cursor-not-allowed'
                            : product.is_sold || !product.is_available
                            ? 'text-gray-300 cursor-not-allowed'
                            : product.is_featured
                            ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-yellow-500'
                        }`}
                        title={
                          !isPremium 
                            ? 'Upgrade to premium to feature listings' 
                            : product.is_sold 
                            ? 'Cannot feature - product sold'
                            : !product.is_available
                            ? 'Cannot feature - product unlisted'
                            : product.is_featured 
                            ? 'Remove featured status' 
                            : 'Feature this listing'
                        }
                      >
                        <Star className={`w-4 h-4 ${product.is_featured ? 'fill-yellow-500' : ''} ${featuringId === product.id ? 'animate-pulse' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleRenew(product.id)}
                        disabled={renewingId === product.id || product.is_sold}
                        className={`p-2 rounded-md transition-colors ${
                          product.is_sold 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-green-600 hover:bg-green-50 disabled:opacity-50'
                        }`}
                        title={product.is_sold ? 'Cannot renew - product has been sold' : `Renew listing (${isPremium ? '7' : '3'} days)`}
                      >
                        <RefreshCw className={`w-4 h-4 ${renewingId === product.id ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className={`p-2 rounded-md transition-colors ${
                          product.is_sold 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title={product.is_sold ? 'Cannot change - product has been sold' : (product.is_available ? 'Hide listing' : 'Show listing')}
                        disabled={product.is_sold}
                      >
                        {product.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Edit Listing</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProduct.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingProduct.description}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                {(editingProduct.listing_type === 'sale' || editingProduct.listing_type === 'both') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Sale Price ($)</label>
                    <input
                      type="number"
                      name="sale_price"
                      step="0.01"
                      defaultValue={editingProduct.sale_price}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}
                {(editingProduct.listing_type === 'rent' || editingProduct.listing_type === 'both') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Rental Price ($/{editingProduct.rental_period})</label>
                    <input
                      type="number"
                      name="rental_price"
                      step="0.01"
                      defaultValue={editingProduct.rental_price}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="is_available"
                    defaultValue={editingProduct.is_available ? 'true' : 'false'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="true">Listed (Visible)</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h2 className="text-xl font-semibold mb-2">Delete Listing</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this listing? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}