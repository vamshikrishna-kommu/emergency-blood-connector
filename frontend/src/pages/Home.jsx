import { NavLink } from "react-router";
import { useAuth } from "../store/authStore";
import { Users, AlertTriangle, Heart, Search } from "lucide-react";

const steps = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Register as Donor",
    desc: "Create your profile with blood group, city, and availability.",
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Hospital Posts SOS",
    desc: "Hospitals or patients post emergency requests with urgency level.",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Find Matching Donors",
    desc: "Search donors by blood group and city. View availability instantly.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Donate & Save Lives",
    desc: "Eligible donors respond and rush to the hospital to donate blood.",
  },
];

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-fade-in">

      {/* Hero */}
      <section className="bg-red-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Every Drop of Blood <br />
            <span className="text-yellow-300">Saves a Life 🩸</span>
          </h1>
          <p className="text-lg text-red-100 mb-8 max-w-xl">
            Emergency Blood Connector helps hospitals and patients find verified donors nearby — fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className="bg-white text-red-600 hover:bg-red-50 font-bold px-6 py-3 rounded-lg text-center">
                  Go to Dashboard
                </NavLink>
                <NavLink to="/requests" className="bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 rounded-lg text-center border border-red-500">
                  View Emergency Requests
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/register" className="bg-white text-red-600 hover:bg-red-50 font-bold px-6 py-3 rounded-lg text-center">
                  Become a Donor
                </NavLink>
                <NavLink to="/login" className="bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 rounded-lg text-center border border-red-500">
                  Login
                </NavLink>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How It Works</h2>
            <p className="text-gray-500">4 simple steps that can save a life</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-16 bg-gray-900 text-white text-center px-4">
          <div className="text-4xl mb-4 heartbeat">🩸</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Save a Life?</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Register as a donor and help someone in their most critical moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink to="/register" className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-lg">
              Register as Donor
            </NavLink>
            <NavLink to="/register" className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-lg border border-gray-700">
              Register as Hospital
            </NavLink>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
