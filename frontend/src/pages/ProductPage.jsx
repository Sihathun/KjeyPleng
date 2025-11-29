import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { Loader } from 'lucide-react';

// Helper function to get condition label
const getConditionLabel = (condition) => {
  const labels = {
    new: 'Brand New',
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
  };
  return labels[condition] || condition;
};

// Helper function to format price based on listing type
const formatPrice = (product) => {
  if (product.listing_type === 'rent') {
    return `$${parseFloat(product.rental_price).toFixed(2)}/${product.rental_period || 'day'}`;
  } else if (product.listing_type === 'both') {
    return `$${parseFloat(product.sale_price).toFixed(2)}`;
  }
  return `$${parseFloat(product.sale_price).toFixed(2)}`;
};

export default function ProductPage() {
  const { id } = useParams();
  const { currentProduct: product, fetchProduct, fetchProducts, products, isLoading, error, clearCurrentProduct } = useProductStore();
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
    
    // Cleanup on unmount
    return () => {
      clearCurrentProduct();
    };
  }, [id, fetchProduct, clearCurrentProduct]);

  // Fetch related products (same category)
  useEffect(() => {
    if (product?.category) {
      fetchProducts({ category: product.category });
    }
  }, [product?.category, fetchProducts]);

  // Get related products (exclude current product)
  const relatedProducts = products.filter(p => p.id !== product?.id).slice(0, 4);

  // Get all images (main image + additional images array)
  const getProductImages = () => {
    if (!product) return [];
    const images = [];
    if (product.image) images.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images);
    }
    return images.length > 0 ? images : ['/images/placeholder.png'];
  };

  const productImages = getProductImages();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The product you're looking for doesn't exist."}</p>
          <Link to="/search" className="text-blue-500 hover:underline">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-8 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left Side - Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="overflow-hidden bg-gray-100 border-2 border-gray-200 rounded-3xl">
              <div className="relative aspect-square">
                <img
                  src={productImages[selectedImage] || '/images/placeholder.png'}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                {/* Listing Type Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.listing_type === 'rent' 
                      ? 'bg-blue-100 text-blue-700' 
                      : product.listing_type === 'both'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {product.listing_type === 'rent' ? 'For Rent' : product.listing_type === 'both' ? 'Sale/Rent' : 'For Sale'}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-all ${
                      selectedImage === index
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            {/* Product Name */}
            <h1 className="text-3xl font-semibold">{product.name}</h1>

            {/* Brand */}
            {product.brand && (
              <p className="text-lg text-gray-600">Brand: {product.brand}</p>
            )}

            {/* Seller Info */}
            <div className="flex items-center gap-4 pb-6 border-b-2 border-gray-200">
              {product.seller_profile_picture ? (
                <img
                  src={product.seller_profile_picture}
                  alt={product.seller_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="relative flex items-center justify-center w-16 h-16 overflow-hidden bg-blue-500 rounded-full">
                  <span className="text-white text-2xl font-bold">
                    {product.seller_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-lg font-medium">{product.seller_name}</p>
                <p className="text-sm text-gray-500">Seller</p>
              </div>
            </div>

            {/* Price */}
            <div className="pb-6 border-b-2 border-gray-200">
              {product.listing_type === 'both' ? (
                <div className="space-y-2">
                  <p className="text-3xl text-green-600 font-semibold">
                    Buy: ${parseFloat(product.sale_price).toFixed(2)}
                  </p>
                  <p className="text-2xl text-blue-600">
                    Rent: ${parseFloat(product.rental_price).toFixed(2)}/{product.rental_period || 'day'}
                  </p>
                </div>
              ) : product.listing_type === 'rent' ? (
                <p className="text-4xl text-blue-600 font-semibold">
                  ${parseFloat(product.rental_price).toFixed(2)}<span className="text-xl">/{product.rental_period || 'day'}</span>
                </p>
              ) : (
                <p className="text-4xl text-green-600 font-semibold">${parseFloat(product.sale_price).toFixed(2)}</p>
              )}
            </div>

            {/* Condition, Category & Location */}
            <div className="pb-6 space-y-3 border-b-2 border-gray-200">
              <p className="text-lg text-gray-700">
                <span className="text-black font-medium">Condition:</span> {getConditionLabel(product.condition)}
              </p>
              <p className="text-lg text-gray-700">
                <span className="text-black font-medium">Category:</span> {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
              </p>
              <p className="text-lg text-gray-700">
                <span className="text-black font-medium">Location:</span> {product.location}
              </p>
            </div>

            {/* Action Buttons */}
            {product.listing_type === 'both' ? (
              <div className="flex gap-4">
                <button className="flex-1 py-4 text-xl text-white transition-all bg-green-500 rounded-xl hover:bg-green-600 hover:shadow-lg">
                  Buy Now
                </button>
                <button className="flex-1 py-4 text-xl text-white transition-all bg-blue-500 rounded-xl hover:bg-blue-600 hover:shadow-lg">
                  Rent Now
                </button>
              </div>
            ) : (
              <button className={`w-full py-4 text-xl text-white transition-all rounded-xl hover:shadow-lg ${
                product.listing_type === 'rent' 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}>
                {product.listing_type === 'rent' ? 'Rent Now' : 'Buy Now'}
              </button>
            )}
          </div>
        </div>

        {/* Product Description Section */}
        <div className="mt-16 space-y-6">
          <h2 className="pb-4 text-2xl font-semibold border-b-2 border-gray-200">Product Description</h2>
          <p className="leading-relaxed text-gray-700 whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 space-y-6">
            <h2 className="pb-4 text-2xl font-semibold border-b-2 border-gray-200">You May Also Like</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`}>
                  <div className="overflow-hidden transition-shadow bg-white border-2 border-gray-200 rounded-2xl hover:shadow-xl">
                    <div className="relative bg-gray-100 aspect-square">
                      <img
                        src={relatedProduct.image || '/images/placeholder.png'}
                        alt={relatedProduct.name}
                        className="object-cover w-full h-full"
                      />
                      {/* Listing Type Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          relatedProduct.listing_type === 'rent' 
                            ? 'bg-blue-100 text-blue-700' 
                            : relatedProduct.listing_type === 'both'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {relatedProduct.listing_type === 'rent' ? 'Rent' : relatedProduct.listing_type === 'both' ? 'Sale/Rent' : 'Sale'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-medium line-clamp-2">{relatedProduct.name}</h3>
                      <p className="text-blue-600 font-semibold">{formatPrice(relatedProduct)}</p>
                      <button className="w-full py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
