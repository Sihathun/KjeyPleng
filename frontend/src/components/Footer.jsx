import svgPaths from "../imports/svg-vis812obmi.js";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-300 mt-auto">
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-12 md:gap-24">
          {/* About Section */}
          <div className="space-y-4">
            <Link to="/">
              <h2 className="bg-linear-to-r from-blue-500 to-black bg-clip-text text-transparent">
                <span>kjey</span>
                <span className="font-bold">Pleng</span>
              </h2>
            </Link>
            <p className="text-gray-600 leading-relaxed max-w-md">
              Welcome to KjeyPleng, the home for every music lover! Whether you're here to rent, lend, buy, or sell musical instruments, our community helps you connect, share, and keep the music alive. Let's make great sounds together!
            </p>
          </div>

          {/* Navigation Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Navigation</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link to="/search" className="text-gray-600 hover:text-gray-900 transition-colors">
                Products
              </Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link to="/subscribe" className="text-gray-600 hover:text-gray-900 transition-colors">
                Subscribe
              </Link>
            </nav>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Contact</h3>
            <div className="flex flex-col gap-3">
              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 shrink-0">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <path d={svgPaths.p159ad400} stroke="#292D32" strokeOpacity="0.75" strokeWidth="1.5" />
                    <path d={svgPaths.p54c5b00} stroke="#292D32" strokeOpacity="0.75" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className="text-gray-600">Phnom Penh</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 shrink-0">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <path d={svgPaths.pa7f1800} stroke="#292D32" strokeMiterlimit="10" strokeOpacity="0.75" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className="text-gray-600">+855 999 9999</span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 shrink-0">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <path d={svgPaths.p1b81e780} stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeOpacity="0.75" strokeWidth="1.5" />
                    <path d={svgPaths.p31dc2600} stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeOpacity="0.75" strokeWidth="1.5" />
                  </svg>
                </div>
                <a href="mailto:kjeypleng@support.com" className="text-gray-600 hover:text-gray-900 transition-colors">
                  kjeypleng@support.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.p71b6a00} stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              <path d={svgPaths.p245fb600} stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
          <span>Copyright properties owned by kjeyPleng</span>
        </div>
      </div>
    </footer>
  );
}
