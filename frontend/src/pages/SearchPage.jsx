import { useState } from 'react';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Mock product data
  const allProducts = [
    {
      id: 1,
      name: 'YAMAHA Rasengan Limited Edition 2018',
      type: 'Guitar',
      condition: 'Brand New',
      price: 999.99,
      image: 'electric guitar'
    },
    {
      id: 2,
      name: 'Fender Stratocaster Classic',
      type: 'Guitar',
      condition: 'Used',
      price: 450.00,
      image: 'electric guitar'
    },
    {
      id: 3,
      name: 'Yamaha Digital Piano P-125',
      type: 'Piano',
      condition: 'Brand New',
      price: 649.99,
      image: 'piano keyboard'
    },
    {
      id: 4,
      name: 'Pearl Export Drum Kit',
      type: 'Drums',
      condition: 'Used',
      price: 899.99,
      image: 'drum set'
    },
    {
      id: 5,
      name: 'Stentor Student Violin',
      type: 'Violin',
      condition: 'Brand New',
      price: 180.00,
      image: 'violin'
    },
    {
      id: 6,
      name: 'Bach Stradivarius Trumpet',
      type: 'Trumpet',
      condition: 'Brand New',
      price: 1200.00,
      image: 'trumpet'
    },
    {
      id: 7,
      name: 'Ibanez SR300E Bass Guitar',
      type: 'Bass Guitar',
      condition: 'Used',
      price: 380.00,
      image: 'bass guitar'
    },
    {
      id: 8,
      name: 'Yamaha YAS-280 Alto Saxophone',
      type: 'Saxophone',
      condition: 'Brand New',
      price: 1899.99,
      image: 'saxophone'
    },
    {
      id: 9,
      name: 'Cecilio CCO-100 Cello',
      type: 'Cello',
      condition: 'Brand New',
      price: 299.99,
      image: 'cello'
    },
    {
      id: 10,
      name: 'Gemeinhardt 2SP Flute',
      type: 'Flute',
      condition: 'Used',
      price: 220.00,
      image: 'flute'
    },
    {
      id: 11,
      name: 'Buffet E11 Clarinet',
      type: 'Clarinet',
      condition: 'Brand New',
      price: 890.00,
      image: 'clarinet'
    },
    {
      id: 12,
      name: 'Gibson Les Paul Standard',
      type: 'Guitar',
      condition: 'Brand New',
      price: 2499.99,
      image: 'electric guitar'
    }
  ];

  const instrumentTypes = [
    'All', 'Guitar', 'Piano', 'Drums', 'Violin', 'Trumpet', 
    'Bass Guitar', 'Saxophone', 'Cello', 'Flute', 'Clarinet'
  ];

  // Filter products
  const filteredProducts = allProducts.filter(product => {
    // Search query filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Type filter
    if (selectedType !== 'All' && product.type !== selectedType) {
      return false;
    }

    // Condition filter
    if (selectedCondition !== 'all' && product.condition !== selectedCondition) {
      return false;
    }

    // Price range filter
    if (priceRange === 'under65' && product.price >= 65) {
      return false;
    }
    if (priceRange === '65to230' && (product.price < 65 || product.price > 230)) {
      return false;
    }
    if (priceRange === 'over230' && product.price <= 230) {
      return false;
    }
    if (priceRange === 'custom') {
      const min = parseFloat(minPrice) || 0;
      const max = parseFloat(maxPrice) || Infinity;
      if (product.price < min || product.price > max) {
        return false;
      }
    }

    return true;
  });

  const handleSearch = () => {
    // Search is handled by the filter in real-time
    console.log('Searching for:', searchQuery);
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
                  {type}
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
                    value="Used"
                    checked={selectedCondition === 'Used'}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>Used</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="condition"
                    value="Brand New"
                    checked={selectedCondition === 'Brand New'}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>Brand New</span>
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
                    value="under65"
                    checked={priceRange === 'under65'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>Under $65.00</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="price"
                    value="65to230"
                    checked={priceRange === '65to230'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>$65.00 to $230.00</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="price"
                    value="over230"
                    checked={priceRange === 'over230'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <span>Over $230.00</span>
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
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p className="mb-2">No products found</p>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <a href="/product/test">
                  <div
                    key={product.id}
                    className="overflow-hidden transition-shadow bg-white border-2 border-gray-200 rounded-2xl hover:shadow-xl"
                  >
                    <div className="relative h-64 bg-gray-100">
                      <img
                        src={`https://source.unsplash.com/featured/400x400/?${product.image}`}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="min-h-12 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600">
                        {product.condition}
                      </p>
                      <p className="text-blue-600">
                        Price: ${product.price.toFixed(2)}
                      </p>
                      <button className="w-full py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
                        Buy It Now
                      </button>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          
          {filteredProducts.length > 0 && (
            <div className="mt-8 text-center text-gray-600">
              Showing {filteredProducts.length} of {allProducts.length} products
            </div>
          )}
        </div>
      </div>
    </div>
  );
}