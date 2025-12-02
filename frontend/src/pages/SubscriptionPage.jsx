import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Crown, Loader, AlertTriangle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
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

  const handleDowngrade = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in first");
      navigate("/sign-in");
      return;
    }
    setShowDowngradeModal(true);
  };

  const confirmDowngrade = async () => {
    setIsDowngrading(true);
    try {
      const response = await axios.post("/api/subscription/downgrade");
      if (response.data.success) {
        toast.success("Successfully downgraded to Free Plan");
        setSubscription(response.data.subscription);
        setShowDowngradeModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to downgrade");
    } finally {
      setIsDowngrading(false);
    }
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
                  <p className="text-gray-500">No featured listing badge</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 my-8" />

              {/* Button */}
              <div className="flex justify-center">
                {isPremium ? (
                  <button 
                    onClick={handleDowngrade}
                    disabled={isDowngrading}
                    className="px-10 py-2.5 rounded-full transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDowngrading ? (
                      <span className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Downgrading...
                      </span>
                    ) : (
                      'Downgrade'
                    )}
                  </button>
                ) : (
                  <button 
                    className="px-10 py-2.5 rounded-full bg-gray-700 text-white cursor-default"
                    disabled
                  >
                    Current Plan
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Premium Plan Card */}
          <div className={`bg-white rounded-3xl shadow-lg overflow-hidden ${isPremium ? 'ring-2 ring-yellow-500' : ''}`}>
            {/* Card Header */}
            <div className="bg-linear-to-r from-yellow-400 to-yellow-500 p-6 h-28 rounded-t-3xl relative">
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
                  <p className="font-medium">1 featured listing badge</p>
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

      {/* Downgrade Confirmation Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDowngrading && setShowDowngradeModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-gray-100 to-gray-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Downgrade to Free Plan</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-gray-700 mb-4">
                Are you sure you want to downgrade? You will lose the following benefits:
              </p>
              
              <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 text-red-500 shrink-0">
                    <X className="w-full h-full" />
                  </div>
                  <p className="text-gray-600">Listing limit will decrease from <span className="font-medium">8</span> to <span className="font-medium">3</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 text-red-500 shrink-0">
                    <X className="w-full h-full" />
                  </div>
                  <p className="text-gray-600">Listings will expire after <span className="font-medium">3 days</span> instead of 7</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 text-red-500 shrink-0">
                    <X className="w-full h-full" />
                  </div>
                  <p className="text-gray-600">You will lose <span className="font-medium">priority placement</span> in search results</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 text-red-500 shrink-0">
                    <X className="w-full h-full" />
                  </div>
                  <p className="text-gray-600">You will lose the <span className="font-medium">featured listing badge</span></p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Note:</span> No refund will be provided for any remaining subscription time.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowDowngradeModal(false)}
                disabled={isDowngrading}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDowngrade}
                disabled={isDowngrading}
                className="px-5 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isDowngrading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Downgrading...
                  </>
                ) : (
                  'Yes, Downgrade'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
