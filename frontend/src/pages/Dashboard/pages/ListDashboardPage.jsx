import { useState, useEffect } from 'react';
import { useProductStore } from '../../../store/productStore';
import { useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ListProductPage() {
  const navigate = useNavigate();
  const { createProduct, fetchCategories, categories, isLoading, error } = useProductStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    condition: 'new',
    listing_type: 'sale',
    sale_price: '',
    rental_price: '',
    rental_period: 'day',
    location: '',
  });
  const [imageFiles, setImageFiles] = useState([]); // Store actual File objects
  const [imagePreviews, setImagePreviews] = useState([]); // Store preview URLs
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Store actual file objects for upload
    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previewUrls]);
  };

  const removeImage = (index) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.listing_type === 'sale' || formData.listing_type === 'both') {
      if (!formData.sale_price || parseFloat(formData.sale_price) <= 0) {
        newErrors.sale_price = 'Sale price must be greater than 0';
      }
    }
    
    if (formData.listing_type === 'rent' || formData.listing_type === 'both') {
      if (!formData.rental_price || parseFloat(formData.rental_price) <= 0) {
        newErrors.rental_price = 'Rental price must be greater than 0';
      }
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        brand: formData.brand || null,
        condition: formData.condition,
        listing_type: formData.listing_type,
        sale_price: formData.listing_type !== 'rent' ? parseFloat(formData.sale_price) : null,
        rental_price: formData.listing_type !== 'sale' ? parseFloat(formData.rental_price) : null,
        rental_period: formData.listing_type !== 'sale' ? formData.rental_period : null,
        location: formData.location,
      };
      
      // Pass both product data and image files to createProduct
      await createProduct(productData, imageFiles);
      setSuccess(true);
      toast.success('Product listed successfully!');
      
      // Clean up preview URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      
      // Reset form
      setTimeout(() => {
        navigate('/dashboard/manage-product');
      }, 2000);
      
    } catch (err) {
      toast.error(err.message || 'Failed to list product');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Product Listed Successfully!</h2>
          <p className="text-gray-600">Redirecting to manage listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="container px-8 py-12 mx-auto">
        <h1 className="mb-8 text-2xl font-semibold">List a Product</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 max-w-2xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Product Images */}
          <div>
            <label className="block mb-3 font-medium">Product Images</label>
            <div className="flex flex-wrap gap-4">
              {imagePreviews.map((image, index) => (
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
              
              <div className="relative flex items-center justify-center w-32 h-32 bg-gray-200 border-2 border-gray-300 rounded-2xl hover:bg-gray-300 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 54 54">
                  <path d="M20.25 11.25V6.75C20.25 4.5 21.375 3.375 23.625 3.375H30.375C32.625 3.375 33.75 4.5 33.75 6.75V11.25H36.5625C43.4062 11.25 45 12.8438 45 19.6875V38.8125C45 45.6562 43.4062 47.25 36.5625 47.25H17.4375C10.5938 47.25 9 45.6562 9 38.8125V19.6875C9 12.8438 10.5938 11.25 17.4375 11.25H20.25Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M27 47.25C31.1421 47.25 34.5 43.8921 34.5 39.75C34.5 35.6079 31.1421 32.25 27 32.25C22.8579 32.25 19.5 35.6079 19.5 39.75C19.5 43.8921 22.8579 47.25 27 47.25Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Upload images of your product (optional for now)</p>
          </div>

          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block mb-2 font-medium">Product Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your product name"
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-orange-400 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Category & Brand Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block mb-2 font-medium">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-orange-400 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
                <option value="guitars">Guitars</option>
                <option value="pianos">Pianos & Keyboards</option>
                <option value="drums">Drums & Percussion</option>
                <option value="strings">String Instruments</option>
                <option value="winds">Wind Instruments</option>
                <option value="brass">Brass Instruments</option>
                <option value="audio">Audio Equipment</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <p className="mt-2 text-sm text-red-500">{errors.category}</p>}
            </div>
            
            <div>
              <label htmlFor="brand" className="block mb-2 font-medium">Brand</label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Fender, Yamaha"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-orange-400"
              />
            </div>
          </div>

          {/* Product Description */}
          <div>
            <label htmlFor="description" className="block mb-2 font-medium">Product Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product in detail"
              rows={5}
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none resize-none focus:border-orange-400 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Condition */}
          <div>
            <label className="block mb-2 font-medium">Condition *</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  value="new"
                  checked={formData.condition === 'new'}
                  onChange={handleChange}
                  className="w-4 h-4 cursor-pointer accent-orange-500"
                />
                <span>Brand New</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  value="like_new"
                  checked={formData.condition === 'like_new'}
                  onChange={handleChange}
                  className="w-4 h-4 cursor-pointer accent-orange-500"
                />
                <span>Like New</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  value="good"
                  checked={formData.condition === 'good'}
                  onChange={handleChange}
                  className="w-4 h-4 cursor-pointer accent-orange-500"
                />
                <span>Good</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="condition"
                  value="fair"
                  checked={formData.condition === 'fair'}
                  onChange={handleChange}
                  className="w-4 h-4 cursor-pointer accent-orange-500"
                />
                <span>Fair</span>
              </label>
            </div>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block mb-2 font-medium">Listing Type *</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="listing_type"
                  value="sale"
                  checked={formData.listing_type === 'sale'}
                  onChange={handleChange}
                  className="w-4 h-4 cursor-pointer accent-orange-500"
                />
                <span>For Sale</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="listing_type"
                  value="rent"
                  checked={formData.listing_type === 'rent'}
                  onChange={handleChange}
                  className="w-4 h-4 cursor-pointer accent-orange-500"
                />
                <span>For Rent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="listing_type"
                  value="both"
                  checked={formData.listing_type === 'both'}
                  onChange={handleChange}
                  className="w-4 h-4 cursor-pointer accent-orange-500"
                />
                <span>Both</span>
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            {(formData.listing_type === 'sale' || formData.listing_type === 'both') && (
              <div>
                <label htmlFor="sale_price" className="block mb-2 font-medium">Sale Price ($) *</label>
                <input
                  id="sale_price"
                  name="sale_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-orange-400 ${
                    errors.sale_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.sale_price && <p className="mt-2 text-sm text-red-500">{errors.sale_price}</p>}
              </div>
            )}
            
            {(formData.listing_type === 'rent' || formData.listing_type === 'both') && (
              <>
                <div>
                  <label htmlFor="rental_price" className="block mb-2 font-medium">Rental Price ($) *</label>
                  <input
                    id="rental_price"
                    name="rental_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rental_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-orange-400 ${
                      errors.rental_price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.rental_price && <p className="mt-2 text-sm text-red-500">{errors.rental_price}</p>}
                </div>
                <div>
                  <label htmlFor="rental_period" className="block mb-2 font-medium">Rental Period</label>
                  <select
                    id="rental_period"
                    name="rental_period"
                    value={formData.rental_period}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-orange-400"
                  >
                    <option value="hour">Per Hour</option>
                    <option value="day">Per Day</option>
                    <option value="week">Per Week</option>
                    <option value="month">Per Month</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block mb-2 font-medium">Location *</label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Phnom Penh, Cambodia"
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none focus:border-orange-400 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.location && <p className="mt-2 text-sm text-red-500">{errors.location}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-12 py-3 text-white transition-all bg-orange-500 rounded-lg hover:bg-orange-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <Loader className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Listing...' : 'List Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/manage-product')}
              className="px-8 py-3 text-gray-700 transition-all border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}