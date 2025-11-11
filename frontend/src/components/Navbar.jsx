import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  if (loading) return null;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className={`font-bold text-2xl flex items-center gap-2 transition-all hover:scale-105 ${
              scrolled ? "text-purple-600" : "text-white"
            }`}
          >
            <span className="text-3xl">📊</span>
            <span>Mini PMS</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex gap-8 items-center">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive("/dashboard")
                    ? scrolled
                      ? "bg-purple-100 text-purple-600"
                      : "bg-white/20 text-white"
                    : scrolled
                    ? "text-gray-700 hover:text-purple-600"
                    : "text-purple-100 hover:text-white"
                }`}
              >
                📊 Dashboard
              </Link>
              <Link
                to="/projects"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive("/projects")
                    ? scrolled
                      ? "bg-purple-100 text-purple-600"
                      : "bg-white/20 text-white"
                    : scrolled
                    ? "text-gray-700 hover:text-purple-600"
                    : "text-purple-100 hover:text-white"
                }`}
              >
                📁 Projects
              </Link>

              {/* Role Badge */}
              <div
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  user.role === "admin"
                    ? scrolled
                      ? "bg-amber-100 text-amber-600"
                      : "bg-amber-500/30 text-amber-200"
                    : scrolled
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-emerald-500/30 text-emerald-200"
                }`}
              >
                {user.role === "admin" ? "👑 Admin" : "👤 Member"}
              </div>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    scrolled
                      ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">{user.name}</span>
                  <span className={`transition-transform ${showMenu ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {/* Dropdown */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                      <p className="text-sm text-gray-600">Logged in as</p>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="block px-4 py-3 hover:bg-purple-50 transition"
                      onClick={() => setShowMenu(false)}
                    >
                      ⚙️ My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition border-t"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    scrolled
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-white text-purple-600 hover:bg-gray-100"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    scrolled
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-lg"
                      : "bg-gradient-to-r from-purple-400 to-indigo-500 text-white hover:shadow-lg"
                  }`}
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg ${
                  scrolled ? "text-gray-800" : "text-white"
                }`}
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
            <Link
              to="/dashboard"
              className={`block px-4 py-2 rounded-lg ${
                isActive("/dashboard")
                  ? "bg-purple-100 text-purple-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              📊 Dashboard
            </Link>
            <Link
              to="/projects"
              className={`block px-4 py-2 rounded-lg ${
                isActive("/projects")
                  ? "bg-purple-100 text-purple-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              📁 Projects
            </Link>
            <Link
              to="/profile"
              className={`block px-4 py-2 rounded-lg ${
                isActive("/profile")
                  ? "bg-purple-100 text-purple-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              ⚙️ Profile
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 border-t mt-2 pt-3"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
