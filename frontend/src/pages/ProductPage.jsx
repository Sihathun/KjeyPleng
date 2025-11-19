import { useState } from 'react';

export default function ProductPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Mock product data
  const product = {
    id: 1,
    name: 'YAMAHA Rasengan Limited Edition 2018',
    price: 100.50,
    condition: 'Brand New',
    location: 'Phnom Penh',
    seller: {
      name: 'Username',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
    },
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris porta, erat ac luctus vehicula, mauris nunc posuere lectus, eu condimentum orci ipsum id ex. Nullam ultricies elit sed dolor finibus, id fermentum leo volutpat. Sed nec diam eu ex luctus suscipit. Pellentesque sit amet blandit nunc. Sed condimentum turpis ac est finibus, et accumsan dui auctor. Duis dapibus lacus at nisi dapibus, vitae fringilla justo fermentum. Nulla in nisi ipsum. Aenean nec iaculis diam. Etiam gravida, neque non consequat efficitur, lacus nibh semper ex, non faucibus lacus nisl quis sapien. Phasellus dapibus eget ante dictum pretium. Aliquam erat volutpat. Morbi aliquet dolor sed diam maximus, a vestibulum sapien lacinia. Aliquam congue euismod bibendum. Nulla vel venenatis est. Cras congue ex at arcu aliquet, vitae euismod leo porta. Pellentesque mauris erat, ullamcorper nec purus vitae, egestas elementum tortor.`,
    images: [
      'https://images.unsplash.com/photo-1617160895032-11179689e7b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGd1aXRhciUyMHN1bmJ1cnN0fGVufDF8fHx8MTc2MzAzNTYyMnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800',
      'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=800'
    ]
  };

  const handleAddToCart = () => {
    alert(`Added ${quantity} x ${product.name} to cart!`);
    // In a real app, this would dispatch to cart state/context
  };

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
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
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
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            {/* Product Name */}
            <h1 className="text-3xl">{product.name}</h1>

            {/* Seller Info */}
            <div className="flex items-center gap-4 pb-6 border-b-2 border-gray-200">
              <div className="relative flex items-center justify-center w-16 h-16 overflow-hidden bg-gray-200 rounded-full">
                <svg className="w-10 h-10 text-gray-600" fill="currentColor" viewBox="0 0 55 55">
                  <path d="M27.5 27.5C31.9183 27.5 35.5 23.9183 35.5 19.5C35.5 15.0817 31.9183 11.5 27.5 11.5C23.0817 11.5 19.5 15.0817 19.5 19.5C19.5 23.9183 23.0817 27.5 27.5 27.5Z" fillOpacity="0.8" />
                  <path d="M27.5 55C42.6878 55 55 42.6878 55 27.5C55 12.3122 42.6878 0 27.5 0C12.3122 0 0 12.3122 0 27.5C0 42.6878 12.3122 55 27.5 55ZM27.5 31.625C17.6313 31.625 9.625 38.2812 9.625 46.4375C9.625 49.1562 11.8438 51.375 14.5625 51.375H40.4375C43.1563 51.375 45.375 49.1562 45.375 46.4375C45.375 38.2812 37.3687 31.625 27.5 31.625Z" fillOpacity="0.8" />
                </svg>
              </div>
              <p className="text-lg">{product.seller.name}</p>
            </div>

            {/* Price */}
            <div className="pb-6 border-b-2 border-gray-200">
              <p className="text-4xl text-blue-600">${product.price.toFixed(2)}</p>
            </div>

            {/* Condition & Location */}
            <div className="pb-6 space-y-3 border-b-2 border-gray-200">
              <p className="text-lg text-gray-700">
                <span className="text-black">Condition:</span> {product.condition}
              </p>
              <p className="text-lg text-gray-700">
                <span className="text-black">Location:</span> {product.location}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pb-6">
              <label htmlFor="quantity" className="text-lg">Quantity:</label>
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 transition-colors hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 py-2 text-center border-x-2 border-gray-300 outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 transition-colors hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 text-xl text-white transition-all bg-blue-500 rounded-xl hover:bg-blue-600 hover:shadow-lg"
            >
              Add to Cart
            </button>

          </div>
        </div>

        {/* Product Description Section */}
        <div className="mt-16 space-y-6">
          <h2 className="pb-4 text-2xl border-b-2 border-gray-200">Product Description</h2>
          <p className="leading-relaxed text-gray-700 whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Related Products Section */}
        <div className="mt-16 space-y-6">
          <h2 className="pb-4 text-2xl border-b-2 border-gray-200">You May Also Like</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <a href="/product/test">
                <div
                  key={item}
                  className="overflow-hidden transition-shadow bg-white border-2 border-gray-200 rounded-2xl hover:shadow-xl"
                >
                  <div className="relative bg-gray-100 aspect-square">
                    <img
                      src={`https://source.unsplash.com/featured/400x400/?guitar,instrument&sig=${item}`}
                      alt={`Related product ${item}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="line-clamp-2">Guitar Model #{item}</h3>
                    <p className="text-blue-600">${(Math.random() * 1000 + 100).toFixed(2)}</p>
                    <button className="w-full py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
                      View Details
                    </button>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
