import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Lock, ArrowLeft, Crown, Loader } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export default function SubscriptionCheckoutPage() {
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Add space every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.slice(0, 2) + "/" + digits.slice(2, 4);
    }
    return digits;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "cardNumber") {
      setCardData((prev) => ({ ...prev, [name]: formatCardNumber(value) }));
    } else if (name === "expiryDate") {
      setCardData((prev) => ({ ...prev, [name]: formatExpiryDate(value) }));
    } else if (name === "cvv") {
      // Only allow digits, max 4
      const digits = value.replace(/\D/g, "").slice(0, 4);
      setCardData((prev) => ({ ...prev, [name]: digits }));
    } else {
      setCardData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expiryDate || !cardData.cvv) {
      toast.error("Please fill in all card details");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/subscription/upgrade", {
        cardNumber: cardData.cardNumber.replace(/\s/g, ""),
        cardHolder: cardData.cardHolder,
        expiryDate: cardData.expiryDate,
        cvv: cardData.cvv,
      });

      if (response.data.success) {
        toast.success("Successfully upgraded to Premium!");
        // Refresh user data
        await checkAuth();
        navigate("/subscribe");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-full py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/subscribe")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Plans</span>
        </button>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-linear-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-800" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Premium Membership</h2>
              <p className="text-gray-500 text-sm">1 month subscription</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold">$5.00</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">Billed monthly</p>
          </div>
        </div>

        {/* Payment Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Payment Details</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={cardData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Card Holder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                name="cardHolder"
                value={cardData.cardHolder}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  name="expiryDate"
                  value={cardData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Secure Payment Notice */}
            <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
              <Lock className="w-4 h-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay $5.00
                </>
              )}
            </button>
          </form>

          {/* Premium Benefits Reminder */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">You'll get:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                8 listings at a time (up from 3)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                Listings last 7 days (up from 3)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                Priority placement in search results
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                Featured seller badge
              </li>
            </ul>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Only card payments are accepted for premium subscriptions.
        </p>
      </div>
    </div>
  );
}
