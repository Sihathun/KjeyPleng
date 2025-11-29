import { useState, useEffect, useCallback } from 'react';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader, ShoppingCart, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, fetchProducts, isLoading } = useProductStore();
  const { addToCart } = useCartStore();
  const [addedItems, setAddedItems] = useState({});
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('category') || 'All');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || 'all');
  const [priceRange, setPriceRange] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const instrumentTypes = [
    'All', 'guitars', 'pianos', 'drums', 'strings', 'winds', 
    'brass', 'audio', 'accessories', 'other'
  ];

  const typeLabels = {
    'All': 'All',
    'guitars': 'Guitars',
    'pianos': 'Pianos & Keyboards',
    'drums': 'Drums & Percussion',
    'strings': 'String Instruments',
    'winds': 'Wind Instruments',
    'brass': 'Brass Instruments',
    'audio': 'Audio Equipment',
    'accessories': 'Accessories',
    'other': 'Other'
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products when filters change
  useEffect(() => {
    const filters = {};
    if (debouncedSearch) filters.search = debouncedSearch;
    if (selectedType !== 'All') filters.category = selectedType;
    if (selectedCondition !== 'all') filters.condition = selectedCondition;
    if (priceRange === 'under100') {
      filters.max_price = 100;
    } else if (priceRange === '100to500') {
      filters.min_price = 100;
      filters.max_price = 500;
    } else if (priceRange === 'over500') {
      filters.min_price = 500;
    } else if (priceRange === 'custom') {
      if (minPrice) filters.min_price = parseFloat(minPrice);
      if (maxPrice) filters.max_price = parseFloat(maxPrice);
    }
    
    fetchProducts(filters);
  }, [debouncedSearch, selectedType, selectedCondition, priceRange, minPrice, maxPrice, fetchProducts]);

  const handleSearch = () => {
    // Immediately trigger search
    setDebouncedSearch(searchQuery);
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedType !== 'All') params.set('category', selectedType);
    setSearchParams(params);
  };

  const formatPrice = (product) => {
    if (product.listing_type === 'sale' || product.listing_type === 'both') {
      return `$${parseFloat(product.sale_price).toFixed(2)}`;
    }
    if (product.listing_type === 'rent') {
      return `$${parseFloat(product.rental_price).toFixed(2)}/${product.rental_period}`;
    }
    return 'Contact for price';
  };

  const getConditionLabel = (condition) => {
    const labels = {
      'new': 'Brand New',
      'like_new': 'Like New',
      'good': 'Good',
      'fair': 'Fair'
    };
    return labels[condition] || condition;
  };

  const handleAddToCart = (e, product, orderType) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    addToCart(product, orderType, 1);
    setAddedItems({ ...addedItems, [`${product.id}-${orderType}`]: true });
    toast.success('Added to cart!');
    
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [`${product.id}-${orderType}`]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Section */}
      <div className="flex items-center justify-center gap-6 px-8 py-12 bg-gray-50">
        <div className="relative flex-1 max-w-3xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for an instrument"
            className="w-full px-16 py-4 bg-white border-2 border-gray-300 rounded-full outline-none focus:border-blue-400"
          />
          <svg 
            className="absolute w-8 h-8 transform -translate-y-1/2 left-4 top-1/2" 
            fill="none" 
            viewBox="0 0 30 30"
          >
            <path 
              d="M13.75 23.75C19.2728 23.75 23.75 19.2728 23.75 13.75C23.75 8.22715 19.2728 3.75 13.75 3.75C8.22715 3.75 3.75 8.22715 3.75 13.75C3.75 19.2728 8.22715 23.75 13.75 23.75Z" 
              stroke="black" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeOpacity="0.75"
            />
            <path 
              d="M27.5 27.5L25 25" 
              stroke="black" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeOpacity="0.75"
            />
          </svg>
        </div>
        <button
          onClick={handleSearch}
          className="px-12 py-4 text-white transition-colors bg-blue-500 rounded-full hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      <div className="container flex gap-8 px-8 py-12 mx-auto">
        {/* Sidebar */}
        <div className="w-64 space-y-8 shrink-0">
          {/* Instrument Type Filter */}
          <div className="space-y-4">
            <h3 className="pb-2 border-b-2 border-black">Instrument Type</h3>
            <div className="space-y-2">
              {instrumentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`block w-full text-left px-3 py-1.5 rounded transition-colors ${
                    selectedType === type
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {typeLabels[type] || type}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="space-y-4">
            <h3 className="pb-2 border-b-2 border-black">Condition</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="condition"
                    value="all"
                    checked={selectedCondition === 'all'}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>All</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="condition"
                    value="new"
                    checked={selectedCondition === 'new'}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>Brand New</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="condition"
                    value="like_new"
                    checked={selectedCondition === 'like_new'}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>Like New</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="condition"
                    value="good"
                    checked={selectedCondition === 'good'}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>Good</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="condition"
                    value="fair"
                    checked={selectedCondition === 'fair'}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>Fair</span>
              </label>
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-4">
            <h3 className="pb-2 border-b-2 border-black">Price</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="price"
                    value="all"
                    checked={priceRange === 'all'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>All Prices</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="price"
                    value="under100"
                    checked={priceRange === 'under100'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>Under $100</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="price"
                    value="100to500"
                    checked={priceRange === '100to500'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>$100 to $500</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="price"
                    value="over500"
                    checked={priceRange === 'over500'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>Over $500</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="price"
                    value="custom"
                    checked={priceRange === 'custom'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>Custom Range</span>
              </label>
              {priceRange === 'custom' && (
                <div className="flex items-center gap-2 pl-7">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="mb-2">No products found</p>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id}>
                  <div className="overflow-hidden transition-shadow bg-white border-2 border-gray-200 rounded-2xl hover:shadow-xl">
                    <div className="relative h-64 bg-gray-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400">
                          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {product.listing_type && (
                        <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${
                          product.listing_type === 'rent' ? 'bg-blue-500 text-white' :
                          product.listing_type === 'both' ? 'bg-purple-500 text-white' :
                          'bg-green-500 text-white'
                        }`}>
                          {product.listing_type === 'both' ? 'Sale/Rent' : product.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="font-medium min-h-12 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getConditionLabel(product.condition)} {product.brand && `• ${product.brand}`}
                      </p>
                      <p className="text-blue-600 font-semibold">
                        {formatPrice(product)}
                      </p>
                      {product.listing_type === 'both' ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => handleAddToCart(e, product, 'sale')}
                            className="flex-1 py-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600 flex items-center justify-center gap-1"
                          >
                            {addedItems[`${product.id}-sale`] ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                            {addedItems[`${product.id}-sale`] ? 'Added!' : 'Buy'}
                          </button>
                          <button 
                            onClick={(e) => handleAddToCart(e, product, 'rental')}
                            className="flex-1 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-1"
                          >
                            {addedItems[`${product.id}-rental`] ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                            {addedItems[`${product.id}-rental`] ? 'Added!' : 'Rent'}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => handleAddToCart(e, product, product.listing_type === 'rent' ? 'rental' : 'sale')}
                          className={`w-full py-2 text-white transition-colors rounded-lg flex items-center justify-center gap-1 ${
                            product.listing_type === 'rent' 
                              ? 'bg-blue-500 hover:bg-blue-600' 
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {addedItems[`${product.id}-${product.listing_type === 'rent' ? 'rental' : 'sale'}`] 
                            ? <Check className="w-4 h-4" /> 
                            : <ShoppingCart className="w-4 h-4" />
                          }
                          {addedItems[`${product.id}-${product.listing_type === 'rent' ? 'rental' : 'sale'}`] 
                            ? 'Added!' 
                            : (product.listing_type === 'rent' ? 'Rent Now' : 'Buy Now')
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {products.length > 0 && (
            <div className="mt-8 text-center text-gray-600">
              Showing {products.length} products
            </div>
          )}
        </div>
      </div>
    </div>
  );
}