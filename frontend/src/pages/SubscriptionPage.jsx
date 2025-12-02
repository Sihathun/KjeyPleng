import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Crown, Loader } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptionStatus();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get("/api/subscription/status");
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to upgrade to premium");
      navigate("/sign-in");
      return;
    }
    navigate("/subscribe/checkout");
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-full flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isPremium = subscription?.isPremium;

  return (
    <div className="bg-white min-h-full flex items-center justify-center px-8 py-12">
      <div className="max-w-5xl w-full">
        {/* Title */}
        <h2 className="text-center text-2xl font-semibold mb-4">
          {isPremium ? "You're a Premium Member!" : "Become a premium member now!"}
        </h2>
        
        {isPremium && subscription.expiresAt && (
          <p className="text-center text-gray-600 mb-8">
            Your subscription is active until{" "}
            <span className="font-medium">
              {new Date(subscription.expiresAt).toLocaleDateString()}
            </span>
          </p>
        )}

        {subscription && (
          <p className="text-center text-gray-500 mb-8">
            Current active listings: {subscription.currentListings} / {subscription.maxListings}
          </p>
        )}

        {/* Plans Container */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan Card */}
          <div className={`bg-white rounded-3xl shadow-lg overflow-hidden ${!isPremium ? 'ring-2 ring-blue-500' : ''}`}>
            {/* Card Header */}
            <div className="bg-gray-200 p-6 h-28 rounded-t-3xl">
              <p className="text-lg font-medium">Free Plan</p>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-2xl font-bold">$0</span>
                <span className="text-sm text-gray-600">/month</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-8 space-y-6">
              {/* Features List */}
              <div className="space-y-4">
                {/* Feature 1 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5 text-green-500">
                    <Check className="w-full h-full" />
                  </div>
                  <p>3 listings at a time</p>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5 text-green-500">
                    <Check className="w-full h-full" />
                  </div>
                  <p>Listings expire after 3 days</p>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5 text-red-400">
                    <X className="w-full h-full" />
                  </div>
                  <p className="text-gray-500">No priority in search results</p>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5 text-red-400">
                    <X className="w-full h-full" />
                  </div>
                  <p className="text-gray-500">No featured badge</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 my-8" />

              {/* Button */}
              <div className="flex justify-center">
                <button 
                  className={`px-10 py-2.5 rounded-full transition-colors ${
                    !isPremium 
                      ? 'bg-gray-700 text-white cursor-default' 
                      : 'bg-gray-300 text-gray-600 cursor-default'
                  }`}
                  disabled
                >
                  {!isPremium ? 'Current Plan' : 'Free Plan'}
                </button>
              </div>
            </div>
          </div>

          {/* Premium Plan Card */}
          <div className={`bg-white rounded-3xl shadow-lg overflow-hidden ${isPremium ? 'ring-2 ring-yellow-500' : ''}`}>
            {/* Card Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 h-28 rounded-t-3xl relative">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-800" />
                <p className="text-lg font-medium text-yellow-900">Premium Member</p>
              </div>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-2xl font-bold text-yellow-900">$5</span>
                <span className="text-sm text-yellow-800">/month</span>
              </div>
              {isPremium && (
                <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                  Active
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="p-8 space-y-6">
              {/* Features List */}
              <div className="space-y-4">
                {/* Feature 1 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5 text-green-500">
                    <Check className="w-full h-full" />
                  </div>
                  <p className="font-medium">8 listings at a time</p>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5 text-green-500">
                    <Check className="w-full h-full" />
                  </div>
                  <p className="font-medium">Listings last 7 days</p>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5 text-green-500">
                    <Check className="w-full h-full" />
                  </div>
                  <p className="font-medium">Priority placement in search</p>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5 text-green-500">
                    <Check className="w-full h-full" />
                  </div>
                  <p className="font-medium">Featured seller badge</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 my-8" />

              {/* Button */}
              <div className="flex justify-center">
                {isPremium ? (
                  <button 
                    className="bg-yellow-500 text-yellow-900 px-10 py-2.5 rounded-full cursor-default font-medium"
                    disabled
                  >
                    Current Plan
                  </button>
                ) : (
                  <button 
                    onClick={handleUpgrade}
                    className="bg-blue-500 text-white px-10 py-2.5 rounded-full hover:bg-blue-600 transition-colors font-medium"
                  >
                    Upgrade Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ or Info Section */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Premium benefits apply immediately after upgrade.</p>
          <p className="mt-1">All existing listings will be extended to 7 days.</p>
        </div>
      </div>
    </div>
  );
}
