import { useState } from 'react';

export default function ListProductPage() {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [instrumentType, setInstrumentType] = useState('');
  const [condition, setCondition] = useState('Brand New');
  const [location, setLocation] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [errors, setErrors] = useState({});

  const username = 'Username';

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setUploadedImages([...uploadedImages, ...imageUrls]);
  };

  const removeImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    
    if (!productDescription.trim()) {
      newErrors.productDescription = 'Product description is required';
    }
    
    if (!productPrice || parseFloat(productPrice) <= 0) {
      newErrors.productPrice = 'Price must be greater than 0';
    }
    
    if (!instrumentType.trim()) {
      newErrors.instrumentType = 'Instrument type is required';
    }
    
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (uploadedImages.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      alert(`Product Listed Successfully!\n\nName: ${productName}\nPrice: $${productPrice}\nType: ${instrumentType}\nCondition: ${condition}\nLocation: ${location}\nImages: ${uploadedImages.length}`);
      
      // Reset form
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setInstrumentType('');
      setCondition('Brand New');
      setLocation('');
      setUploadedImages([]);
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="container px-8 py-12 mx-auto">
        <h1 className="mb-8 text-2xl">List a product</h1>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Product Images */}
          <div>
            <label className="block mb-3">Product Images *</label>
            <div className="flex flex-wrap gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative w-32 h-32 overflow-hidden bg-gray-200 border-2 border-gray-300 rounded-2xl">
                  <img src={image} alt={`Upload ${index + 1}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <div className="relative flex items-center justify-center w-32 h-32 bg-gray-200 border-2 border-gray-300 rounded-2xl hover:bg-gray-300">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 54 54">
                  <path d="M20.25 11.25V6.75C20.25 4.5 21.375 3.375 23.625 3.375H30.375C32.625 3.375 33.75 4.5 33.75 6.75V11.25H36.5625C43.4062 11.25 45 12.8438 45 19.6875V38.8125C45 45.6562 43.4062 47.25 36.5625 47.25H17.4375C10.5938 47.25 9 45.6562 9 38.8125V19.6875C9 12.8438 10.5938 11.25 17.4375 11.25H20.25Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M20.25 24.75L24.75 29.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M33.75 24.75L24.75 33.75V29.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M27 47.25C31.1421 47.25 34.5 43.8921 34.5 39.75C34.5 35.6079 31.1421 32.25 27 32.25C22.8579 32.25 19.5 35.6079 19.5 39.75C19.5 43.8921 22.8579 47.25 27 47.25Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            {errors.images && <p className="mt-2 text-sm text-red-500">{errors.images}</p>}
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="productName" className="block mb-2">Product name *</label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter your product name"
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-blue-400 ${
                errors.productName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.productName && <p className="mt-2 text-sm text-red-500">{errors.productName}</p>}
          </div>

          {/* Product Description */}
          <div>
            <label htmlFor="productDescription" className="block mb-2">Product description *</label>
            <textarea
              id="productDescription"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Enter your product description"
              rows={6}
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none resize-none focus:border-blue-400 ${
                errors.productDescription ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.productDescription && <p className="mt-2 text-sm text-red-500">{errors.productDescription}</p>}
          </div>

          {/* Product Price */}
          <div>
            <label htmlFor="productPrice" className="block mb-2">Product Price ($) *</label>
            <input
              id="productPrice"
              type="number"
              min="0"
              step="0.01"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="> 0"
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-blue-400 ${
                errors.productPrice ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.productPrice && <p className="mt-2 text-sm text-red-500">{errors.productPrice}</p>}
          </div>

          {/* Instrument Type */}
          <div>
            <label htmlFor="instrumentType" className="block mb-2">Instrument Type *</label>
            <input
              id="instrumentType"
              type="text"
              value={instrumentType}
              onChange={(e) => setInstrumentType(e.target.value)}
              placeholder="guitar, violin, etc"
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-blue-400 ${
                errors.instrumentType ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.instrumentType && <p className="mt-2 text-sm text-red-500">{errors.instrumentType}</p>}
          </div>

          {/* Condition */}
          <div>
            <label className="block mb-2">Condition *</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  value="Brand New"
                  checked={condition === 'Brand New'}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Brand New</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  value="Used"
                  checked={condition === 'Used'}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Used</span>
              </label>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block mb-2">Location *</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Phnom Penh, Cambodia"
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-blue-400 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.location && <p className="mt-2 text-sm text-red-500">{errors.location}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-12 py-3 text-white transition-all bg-blue-500 rounded-lg hover:bg-blue-600 hover:shadow-lg"
          >
            List Product
          </button>
        </form>
      </div>
    </div>
  );
}