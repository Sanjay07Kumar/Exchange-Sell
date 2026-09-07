import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 mt-12">

      {/* Main Footer */}
      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-extrabold text-orange-500 italic mb-3">ExSell</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Buy, sell, and exchange products with ease. Connect directly with sellers, negotiate prices, and find great deals.
            </p>
            <div className="flex gap-3">
              {[FaFacebook, FaTwitter, FaInstagram].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-all duration-200">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-bold tracking-[2px] uppercase text-orange-500 mb-4">Quick Links</p>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Browse Products", href: "/" },
                { label: "Sell Something", href: "/additem" },
                { label: "My Items", href: "/profile" },
                { label: "Messages", href: "/chat" },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-400 hover:text-orange-500 transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-xs font-bold tracking-[2px] uppercase text-orange-500 mb-4">Help</p>
            <ul className="space-y-2.5">
              {[
                { label: "Help Center", href: "/help" },
                { label: "Safety Tips", href: "/safety" },
                { label: "Contact Us", href: "/contact" },
                { label: "Terms", href: "/terms" },
                { label: "Privacy", href: "/privacy" },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-400 hover:text-orange-500 transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="border-t border-gray-800 bg-gray-800 w-full">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-center gap-2">
          <span className="text-orange-500 text-xs">⚠</span>
          <p className="text-xs text-gray-400 font-medium">
            Always meet in public places for safety · Verify products before purchase
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-900 w-full">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} <span className="font-semibold text-orange-500">ExSell</span>. Made in India · Buy · Sell · Exchange · Chat
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>📍 Coimbatore, India</span>
            <span>📧 contact@exsell.com</span>
          </div>
        </div>
      </div>

    </footer>
  );
}