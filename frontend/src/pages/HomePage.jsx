import { useState, useEffect } from "react";
import { ChevronRight, Loader, Star } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const imgElectricGuitar = "/images/imgElectricGuitar.png";
const imgViolin = "/images/imgViolin.png";
const imgPiano = "/images/imgPiano.png";
const imgGuitar = "/images/guitar.jpg";
const imgDrums = "/images/drums.jpg";
const imgStringInstruments = "/images/stringinstruments.jpg";
const imgWindInstruments = "/images/windinstruments.jpg";
const imgPianoCategory = "/images/piano.jpg";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { name: "Guitars", image: imgGuitar, category: "guitars" },
    { name: "Pianos", image: imgPianoCategory, category: "pianos" },
    { name: "Drums", image: imgDrums, category: "drums" },
    { name: "String Instruments", image: imgStringInstruments, category: "strings" },
    { name: "Wind Instruments", image: imgWindInstruments, category: "winds" },
  ];

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/products/featured");
      setFeaturedProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (product) => {
    if (product.listing_type === 'rent') {
      return `$${parseFloat(product.rental_price).toFixed(2)}/${product.rental_period || 'day'}`;
    } else if (product.listing_type === 'both') {
      return `$${parseFloat(product.sale_price).toFixed(2)}`;
    }
    return `$${parseFloat(product.sale_price).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* Hero Section */}
      <div className="relative bg-linear-to-br from-yellow-500 via-orange-400 to-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-12 mx-4 sm:mx-8 mt-4 sm:mt-8 overflow-hidden">
        <div className="relative z-10 max-w-md">
          <h2 className="mb-2 text-xl sm:text-2xl">Look for any instrument you want</h2>
          <p className="mb-6 text-orange-900 text-sm sm:text-base">find or try out an instrument</p>
          <Link to="/search">
            <button className="bg-orange-900 text-white px-6 py-2 rounded-full hover:bg-orange-800 transition-colors text-sm sm:text-base">
              Browse
            </button>
          </Link>
        </div>

        {/* Instrument Links - Hidden on mobile, shown on lg */}
        <div className="hidden lg:flex absolute right-20 top-1/2 -translate-y-1/2 gap-12">
          {/* Guitars */}
          <Link to="/search?category=guitars" className="flex flex-col items-center gap-4 group">
            <div className="w-32 h-32">
              <img src={imgElectricGuitar} alt="Guitar" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-center gap-2 text-orange-900 group-hover:opacity-75">
              <span>Guitars</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Pianos */}
          <Link to="/search?category=pianos" className="flex flex-col items-center gap-4 group">
            <div className="w-32 h-32">
              <img src={imgPiano} alt="Piano" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-center gap-2 text-orange-900 group-hover:opacity-75">
              <span>Pianos</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Violin / String Instruments */}
          <Link to="/search?category=strings" className="flex flex-col items-center gap-4 group">
            <div className="w-32 h-32">
              <img src={imgViolin} alt="Violin" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-center gap-2 text-orange-900 group-hover:opacity-75">
              <span>Strings</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Browse Categories */}
      <section className="py-8 sm:py-16 px-4 sm:px-8">

        <h2 className="text-center mb-8 sm:mb-12 text-lg sm:text-xl">Browse</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8">
          {categories.map((cat, index) => (
            <Link 
              key={index} 
              to={`/search?category=${cat.category}`}
              className="flex flex-col items-center gap-2 sm:gap-4 group"
            >
              <div className="w-24 h-24 sm:w-40 sm:h-40 lg:w-[180px] lg:h-[180px] rounded-full bg-gray-200 overflow-hidden">
                <img 
                  src={cat.image} 
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <p className="text-center text-sm sm:text-base group-hover:text-blue-500 transition-colors">{cat.name}</p>
            </Link>
          ))}

        </div>
      </section>

      {/* Popular Deals - Featured Listings from Premium Users */}
      <section className="py-8 sm:py-16 px-4 sm:px-8 bg-gray-50">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl">Popular Deals</h2>
            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
              <Star className="w-3 h-3 fill-yellow-900" />
              Featured
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm sm:text-base hidden sm:inline">Premium Listings</span>
            <Link to="/search" className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm sm:text-base">
              Browse All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No featured listings available at the moment.</p>
            <p className="text-sm mt-2">Premium members can feature their listings to appear here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group">
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div className="relative bg-white rounded-lg aspect-square flex items-center justify-center p-2 sm:p-4 border border-gray-200 group-hover:border-blue-300 group-hover:shadow-md transition-all">
                    <img 
                      src={product.image || '/images/placeholder.png'} 
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                    {/* Featured Badge */}
                    <span className="absolute top-1 left-1 sm:top-2 sm:left-2 inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-900" />
                      <span className="hidden sm:inline">Featured</span>
                    </span>
                    {/* Listing Type Badge */}
                    <span className={`absolute top-1 right-1 sm:top-2 sm:right-2 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full ${
                      product.listing_type === 'rent' ? 'bg-blue-500 text-white' :
                      product.listing_type === 'both' ? 'bg-purple-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {product.listing_type === 'both' ? 'Sale/Rent' : product.listing_type === 'rent' ? 'Rent' : 'Sale'}
                    </span>
                  </div>
                  <p className="truncate text-sm sm:text-base group-hover:text-blue-600 transition-colors">{product.name}</p>
                  <p className="font-semibold text-blue-600 text-sm sm:text-base">{formatPrice(product)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Premium Banner */}
      <div className="mx-4 sm:mx-8 my-8 sm:my-16 flex justify-center">
        <div className="bg-linear-to-r from-blue-400 to-blue-500 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center max-w-2xl w-full">
          <h2 className="mb-4 text-lg sm:text-2xl">
            <span>Become a </span>
            <span className="bg-linear-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
              premium member!
            </span>
          </h2>
          <p className="mb-6 text-sm sm:text-base">
            <span>Enjoy the benefits of discounts and </span>
            advertised listings!
          </p>
          <a href="/subscribe">
            <button className="bg-gray-800 text-white px-6 sm:px-8 py-2 rounded-full hover:bg-gray-700 transition-colors text-sm sm:text-base" href="./subscribe">
              View Plan
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
