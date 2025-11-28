import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { isLoading, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending reset email");
    }
  };

  return (
    <div className="bg-white min-h-full flex items-center justify-center px-8 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8">
        {/* Title */}
        <h1 className="text-center mb-3">Forgot Password</h1>

        {!isSubmitted ? (
          <>
            {/* Subtitle */}
            <p className="text-center text-gray-600 mb-8">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-8">
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white rounded-xl py-3 hover:bg-gray-800 transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-gray-600">
                If an account exists for <strong>{email}</strong>, you will
                receive a password reset link shortly.
              </p>
            </div>
          </>
        )}

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-cyan-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
