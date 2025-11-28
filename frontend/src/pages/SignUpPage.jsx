import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import googleImg from "/images/googleLogo.png";

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { signup, error, isLoading } = useAuthStore();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const name = `${firstName} ${lastName}`.trim();
    
    if (!firstName || !lastName) {
      toast.error("Please enter your full name");
      return;
    }

    try {
      await signup(email, password, name);
      toast.success("Account created! Please verify your email.");
      navigate("/verify-email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error signing up");
    }
  };

  return (
    <div className="bg-white min-h-full flex items-center justify-center px-8 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8">
        {/* Title */}
        <h1 className="text-center mb-3">Create your account</h1>

        {/* Subtitle */}
        <p className="text-center text-gray-600 mb-12">
          Welcome, new user! Please sign up to continue!
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

        <form onSubmit={handleSignUp}>
          {/* Name Inputs - Side by Side */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* First Name Input */}
            <div>
              <label className="block mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                placeholder=""
                required
              />
            </div>

            {/* Last Name Input */}
            <div>
              <label className="block mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                placeholder=""
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label className="block mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder=""
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-8">
            <label className="block mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                placeholder=""
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-center mb-4">{error}</p>
          )}

          {/* Continue Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white rounded-xl py-3 hover:bg-gray-800 transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              "Continue"
            )}
          </button>
        </form>

        {/* Sign In Redirect */}
        <div className="bg-gray-200 rounded-xl py-4 text-center">
          <p>
            <span>Already have an account? </span>
            <Link to="/login">
              <button className="underline hover:text-cyan-400 transition-colors">
                Sign In here
              </button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
