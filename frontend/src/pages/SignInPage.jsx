import svgPaths from "../imports/svg-caoxzfvwj6";
import googleImg from "/images/googleLogo.png";

export default function SignInPage() {
  return (
    <div className="bg-white min-h-full flex items-center justify-center px-8 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8">
        {/* Title */}
        <h1 className="text-center mb-3">
          <span>Sign in to </span>
          <span className="text-cyan-400">kjey</span>
          <span>Pleng</span>
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-600 mb-12">
          Welcome! Please sign in to continue.
        </p>

        {/* Continue with Google Button */}
        <button className="w-full border border-gray-300 rounded-xl py-3 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors mb-6">
          <img src={googleImg} alt="Google" className="w-6 h-6" />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-gray-300" />
          <p className="text-gray-500">or</p>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        {/* Email Input */}
        <div className="mb-6">
          <label className="block mb-2">Email Address</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            placeholder=""
          />
        </div>

        {/* Password Input */}
        <div className="mb-8">
          <label className="block mb-2">Password</label>
          <div className="relative">
            <input
              type="password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder=""
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors">
              <div className="w-5 h-5">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                  <path d={svgPaths.p14500d00} fill="#292D32" />
                  <path d={svgPaths.pb988600} fill="#292D32" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <button className="w-full bg-black text-white rounded-xl py-3 hover:bg-gray-800 transition-colors mb-8">
          Continue
        </button>

        {/* Sign Up Redirect */}
        <div className="bg-gray-200 rounded-xl py-4 text-center">
          <p>
            <span>Don't have an account? </span>
            <a href="/signup">
                <button className="underline hover:text-cyan-400 transition-colors">
                Sign Up here
                </button>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}