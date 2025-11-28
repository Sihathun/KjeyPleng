import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Loader, DollarSign, Calendar } from "lucide-react";
import { useProductStore } from "../store/productStore";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Guitars",
  "Electric Guitars",
  "Bass Guitars",
  "Pianos",
  "Keyboards",
  "Drums",
  "Percussion",
  "Violin",
  "Viola",
  "Cello",
  "Saxophone",
  "Trumpet",
  "Flute",
  "Clarinet",
  "Ukulele",
  "Other String",
  "Other Wind",
  "Other",
];

const CONDITIONS = ["New", "Like New", "Excellent", "Good", "Fair"];

const RENTAL_PERIODS = ["Per Day", "Per Week", "Per Month"];

export default function ListInstrumentPage() {
  const navigate = useNavigate();
  const { createProduct, isLoading } = useProductStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    image: "",
    condition: "",
    location: "",
    listing_type: "sale",
    sale_price: "",
    rental_price: "",
    rental_period: "Per Day",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.description || !formData.category || !formData.image || !formData.condition || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.listing_type === "sale" && !formData.sale_price) {
      toast.error("Please enter a sale price");
      return;
    }

    if (formData.listing_type === "rent" && !formData.rental_price) {
      toast.error("Please enter a rental price");
      return;
    }

    if (formData.listing_type === "both" && (!formData.sale_price || !formData.rental_price)) {
      toast.error("Please enter both sale and rental prices");
      return;
    }

    try {
      await createProduct({
        ...formData,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        rental_price: formData.rental_price ? parseFloat(formData.rental_price) : null,
      });
      toast.success("Instrument listed successfully!");
      navigate("/dashboard/listings");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error listing instrument");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">List Your Instrument</h1>
        <p className="text-gray-600 mb-8">
          Fill in the details below to list your instrument for sale or rent
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrument Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Fender Stratocaster Electric Guitar"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., Fender, Gibson, Yamaha"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your instrument, including any notable features, history, or included accessories..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select condition</option>
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Phnom Penh, Cambodia"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-6">Image</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter a URL for your instrument image. You can use image hosting services like Imgur or Cloudinary.
              </p>
            </div>

            {formData.image && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-xl border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Listing Type & Pricing */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-6">Listing Type & Pricing</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What would you like to do? *
                </label>
                <div className="flex gap-4">
                  {[
                    { value: "sale", label: "Sell", icon: DollarSign },
                    { value: "rent", label: "Rent Out", icon: Calendar },
                    { value: "both", label: "Both", icon: null },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, listing_type: value }))}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-colors ${
                        formData.listing_type === value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {(formData.listing_type === "sale" || formData.listing_type === "both") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="sale_price"
                      value={formData.sale_price}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {(formData.listing_type === "rent" || formData.listing_type === "both") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rental Price (USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="rental_price"
                        value={formData.rental_price}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rental Period *
                    </label>
                    <select
                      name="rental_period"
                      value={formData.rental_period}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {RENTAL_PERIODS.map((period) => (
                        <option key={period} value={period}>
                          {period}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Listing...
                </>
              ) : (
                "List Instrument"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
