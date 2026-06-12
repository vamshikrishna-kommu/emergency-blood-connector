import { Droplets, Heart } from "lucide-react";
import { NavLink } from "react-router";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                Blood<span className="text-red-400">Connect</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting blood donors with patients during emergencies. Every drop counts.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><NavLink to="/" className="hover:text-red-400">Home</NavLink></li>
              <li><NavLink to="/donors" className="hover:text-red-400">Find Donors</NavLink></li>
              <li><NavLink to="/requests" className="hover:text-red-400">Emergency Requests</NavLink></li>
              <li><NavLink to="/register" className="hover:text-red-400">Become a Donor</NavLink></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Blood Groups Supported</h4>
            <div className="flex flex-wrap gap-2">
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <span key={bg} className="bg-red-900 text-red-300 text-xs font-bold px-2 py-1 rounded-full">
                  {bg}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              📍 Hyderabad, India 2026
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © 2026 Emergency Blood Connector.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> to save lives
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
