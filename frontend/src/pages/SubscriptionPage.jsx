import svgPaths from "../imports/svg-njbgi8fdu0.js";

export default function SubscriptionPage() {
  return (
    <div className="bg-white min-h-full flex items-center justify-center px-8 py-12">
      <div className="max-w-5xl w-full">
        {/* Title */}
        <h2 className="text-center text-xl mb-12">Become a premium member now!</h2>

        {/* Plans Container */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan Card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Card Header - Fixed Height */}
            <div className="bg-gray-300 p-6 h-28 rounded-t-3xl">
              <p>Free Plan</p>
            </div>

            {/* Card Content */}
            <div className="p-8 space-y-6">
              {/* Features List */}
              <div className="space-y-4">
                {/* Feature 1 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 17 12">
                      <path
                        d={svgPaths.p7705600}
                        stroke="#292D32"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <p>Listing Limitations ( 3 Listings at a time )</p>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 17 12">
                      <path
                        d={svgPaths.p7705600}
                        stroke="#292D32"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <p>No coupons</p>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 17 12">
                      <path
                        d={svgPaths.p7705600}
                        stroke="#292D32"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <p>No ad placements for listing</p>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 17 12">
                      <path
                        d={svgPaths.p7705600}
                        stroke="#292D32"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <p>Has to renew listing every 3 days</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 my-8" />

              {/* Button - Centered and Fixed Width */}
              <div className="flex justify-center">
                <button className="bg-gray-700 text-white px-10 py-2.5 rounded-full hover:bg-gray-600 transition-colors">
                  Current Plan
                </button>
              </div>
            </div>
          </div>

          {/* Premium Plan Card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Card Header - Fixed Height */}
            <div className="bg-gray-300 p-6 h-28 rounded-t-3xl">
              <p>Premium Member</p>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span>$5/</span>
                <span className="text-sm">month</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-8 space-y-6">
              {/* Features List */}
              <div className="space-y-4">
                {/* Feature 1 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 17 12">
                      <path
                        d={svgPaths.p7705600}
                        stroke="#292D32"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <p>8 listings at a time</p>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 17 12">
                      <path
                        d={svgPaths.p7705600}
                        stroke="#292D32"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <p>Discount coupons</p>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 17 12">
                      <path
                        d={svgPaths.p7705600}
                        stroke="#292D32"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <p>Advert placement for listing</p>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 mt-0.5">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 17 12">
                      <path
                        d={svgPaths.p7705600}
                        stroke="#292D32"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <p>Has to renew listing every 10 days</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 my-8" />

              {/* Button - Centered and Fixed Width */}
              <div className="flex justify-center">
                <button className="bg-cyan-400 text-white px-10 py-2.5 rounded-full hover:bg-cyan-500 transition-colors">
                  Start Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
