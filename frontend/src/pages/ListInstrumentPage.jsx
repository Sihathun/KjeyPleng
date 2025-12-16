import { useState } from 'react';
import { useProductStore } from '../store/productStore';
import { useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'guitars', label: 'Guitars' },
  { value: 'pianos', label: 'Pianos & Keyboards' },
  { value: 'drums', label: 'Drums & Percussion' },
  { value: 'strings', label: 'String Instruments' },
  { value: 'winds', label: 'Wind Instruments' },
  { value: 'brass', label: 'Brass Instruments' },
  { value: 'audio', label: 'Audio Equipment' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

export default function ListInstrumentPage() {
  const navigate = useNavigate();
  const { createProduct, isLoading, error } = useProductStore();
  
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
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previewUrls]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
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
      
      await createProduct(productData, imageFiles);
      setSuccess(true);
      toast.success('Instrument listed successfully!');
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      
      setTimeout(() => {
        navigate('/dashboard/manage-product');
      }, 2000);
      
    } catch (err) {
      toast.error(err.message || 'Failed to list instrument');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Instrument Listed Successfully!</h2>
          <p className="text-gray-600">Redirecting to manage listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List Your Instrument</h1>
          <p className="mt-2 text-gray-600">Fill in the details below to list your instrument for sale or rent</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <label className="block mb-3 font-semibold text-gray-900">Product Images</label>
            <div className="flex flex-wrap gap-4">
              {imagePreviews.map((image, index) => (
                <div key={index} className="relative w-28 h-28 sm:w-32 sm:h-32 overflow-hidden bg-gray-100 border-2 border-gray-200 rounded-xl">
                  <img src={image} alt={`Upload ${index + 1}`} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {imageFiles.length < 5 && (
                <label className="relative flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-200 hover:border-blue-400 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="mt-1 text-xs text-gray-500">Add Photo</span>
                </label>
              )}
            </div>
            <p className="mt-3 text-sm text-gray-500">Add up to 5 photos. First image will be the cover.</p>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-gray-900 border-b pb-3">Basic Information</h2>
            
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">Product Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Fender Stratocaster Electric Guitar"
                className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors focus:border-blue-500 ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Category & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-700">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors focus:border-blue-500 ${
                    errors.category ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>
              
              <div>
                <label htmlFor="brand" className="block mb-2 text-sm font-medium text-gray-700">Brand</label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Fender, Yamaha, Gibson"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-colors focus:border-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your instrument in detail - include model, year, features, any wear or damage..."
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl outline-none resize-none transition-colors focus:border-blue-500 ${
                  errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Condition */}
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">Condition *</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'new', label: 'Brand New' },
                  { value: 'like_new', label: 'Like New' },
                  { value: 'good', label: 'Good' },
                  { value: 'fair', label: 'Fair' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`px-4 py-2 rounded-full border-2 cursor-pointer transition-all ${
                      formData.condition === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={option.value}
                      checked={formData.condition === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-700">Location *</label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Phnom Penh, Cambodia"
                className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors focus:border-blue-500 ${
                  errors.location ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="font-semibold text-gray-900 border-b pb-3">Pricing</h2>
            
            {/* Listing Type */}
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">Listing Type *</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'sale', label: 'For Sale' },
                  { value: 'rent', label: 'For Rent' },
                  { value: 'both', label: 'Both' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`px-5 py-2.5 rounded-full border-2 cursor-pointer transition-all ${
                      formData.listing_type === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="listing_type"
                      value={option.value}
                      checked={formData.listing_type === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(formData.listing_type === 'sale' || formData.listing_type === 'both') && (
                <div>
                  <label htmlFor="sale_price" className="block mb-2 text-sm font-medium text-gray-700">Sale Price ($) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      id="sale_price"
                      name="sale_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl outline-none transition-colors focus:border-blue-500 ${
                        errors.sale_price ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.sale_price && <p className="mt-1 text-sm text-red-500">{errors.sale_price}</p>}
                </div>
              )}
              
              {(formData.listing_type === 'rent' || formData.listing_type === 'both') && (
                <>
                  <div>
                    <label htmlFor="rental_price" className="block mb-2 text-sm font-medium text-gray-700">Rental Price ($) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        id="rental_price"
                        name="rental_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.rental_price}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl outline-none transition-colors focus:border-blue-500 ${
                          errors.rental_price ? 'border-red-400 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.rental_price && <p className="mt-1 text-sm text-red-500">{errors.rental_price}</p>}
                  </div>
                  <div>
                    <label htmlFor="rental_period" className="block mb-2 text-sm font-medium text-gray-700">Rental Period</label>
                    <select
                      id="rental_period"
                      name="rental_period"
                      value={formData.rental_period}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none transition-colors focus:border-blue-500"
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
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 text-gray-700 font-medium bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none px-12 py-3 text-white font-medium bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-5 h-5 animate-spin" />}
              {isLoading ? 'Listing...' : 'List Instrument'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
