import { FaFacebook, FaTwitter, FaInstagram, FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="px-5 w-full bg-gray-800 text-white mt-12">
      
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-2 py-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-4">ExSell</h3>
            <p className="text-gray-300 mb-4">
              Buy, sell, and exchange products with ease. Connect directly with sellers, negotiate prices, and find great deals.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-500">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-orange-400">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-orange-500">Home</a></li>
              <li><a href="/" className="text-gray-300 hover:text-orange-500">Browse Products</a></li>
              <li><a href="/additem" className="text-gray-300 hover:text-orange-500">Sell Something</a></li>
              <li><a href="/profile" className="text-gray-300 hover:text-orange-500">My Items</a></li>
              <li><a href="/chat" className="text-gray-300 hover:text-orange-500">Messages</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold mb-4 text-orange-400">Help</h4>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-300 hover:text-orange-500">Help Center</a></li>
              <li><a href="/safety" className="text-gray-300 hover:text-orange-500">Safety Tips</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-orange-500">Contact Us</a></li>
              <li><a href="/terms" className="text-gray-300 hover:text-orange-500">Terms</a></li>
              <li><a href="/privacy" className="text-gray-300 hover:text-orange-500">Privacy</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-400">
              © {new Date().getFullYear()} ExSell. Made in India
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Buy • Sell • Exchange • Chat
            </p>
          </div>
          
          <div className="text-sm text-gray-400">
            <span className="mr-4">📍 Coimbatore, India</span>
            <span>📧 contact@exsell.com</span>
          </div>
        </div>

      </div>

      {/* Safety Notice */}
      <div className="bg-gray-800 py-3 text-center">
        <p className="text-sm text-gray-300">
          ⚠️ Always meet in public places for safety | Verify products before purchase
        </p>
      </div>

    </footer>
  );
}