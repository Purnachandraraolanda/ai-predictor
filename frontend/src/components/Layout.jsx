import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ================= HEADER ================= */

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/jee", label: "JEE Main" },
    { href: "/tgeapcet", label: "TGEAPCET" },
    { href: "/apeapcet", label: "APEAPCET" },
    { href: "/comedk", label: "COMEDK" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#111720] border-b border-[#2a3040]">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <motion.img
              src="/edu9-logo.jpg"
              alt="Edu9 Career Guidance"
              className="h-10 w-auto rounded-lg"
              whileHover={{ scale: 1.05 }}
            />
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-[#f5c842]">
                Edu9
              </span>
              <span className="block text-xs text-zinc-400">
                Career Guidance
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.href
                    ? "text-zinc-50 bg-[#252d3d]"
                    : "text-zinc-400 hover:text-zinc-50 hover:bg-[#1e2535]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden bg-[#111720] border-t border-[#2a3040]"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    location.pathname === link.href
                      ? "text-zinc-50 bg-[#252d3d]"
                      : "text-zinc-400 hover:text-zinc-50 hover:bg-[#1e2535]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

/* ================= FOOTER ================= */

export const Footer = () => (
  <footer className="border-t border-[#2a3040] bg-[#111720] text-white mt-20">
    <div className="container mx-auto px-4 md:px-6 max-w-7xl py-12">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-3 mb-4">
            <img
              src="/edu9-logo.jpg"
              alt="Edu9 Career Guidance"
              className="h-12 rounded-lg"
            />
            <div>
              <span className="font-bold text-xl text-[#f5c842]">
                Edu9
              </span>
              <span className="block text-sm text-zinc-400">
                Career Guidance
              </span>
            </div>
          </Link>

          <p className="text-zinc-400 text-sm mb-4">
            College predictions for JEE, TGEAPCET, APEAPCET & COMEDK.
            Find your dream college with accurate cutoff analysis.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 text-zinc-400">
            <a href="https://www.youtube.com/@edu9lvgr" target="_blank" rel="noopener noreferrer">
              <Youtube className="hover:text-red-500 transition" />
            </a>
            <a href="https://www.instagram.com/edu9careerguide/" target="_blank" rel="noopener noreferrer">
              <Instagram className="hover:text-pink-500 transition" />
            </a>
            <a href="https://www.facebook.com/edu9careerguide/" target="_blank" rel="noopener noreferrer">
              <Facebook className="hover:text-blue-500 transition" />
            </a>
            <a href="https://x.com/edu9careerguide" target="_blank" rel="noopener noreferrer">
              <Twitter className="hover:text-white transition" />
            </a>
          </div>
        </div>

        {/* Predictors */}
        <div>
          <h4 className="font-semibold mb-4">Predictors</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><Link to="/jee">JEE Main</Link></li>
            <li><Link to="/tgeapcet">TGEAPCET</Link></li>
            <li><Link to="/apeapcet">APEAPCET</Link></li>
            <li><Link to="/comedk">COMEDK</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <ul className="space-y-4 text-sm text-zinc-400">

            <li className="flex items-start gap-3">
              <Phone size={16} className="text-[#f5c842]" />
              9133311450
            </li>

            <li className="flex items-start gap-3">
              <Mail size={16} className="text-[#f5c842]" />
              info@edu9.in
            </li>

            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-[#f5c842]" />
              <address className="not-italic leading-relaxed">
                Unit No 1312, 12th Floor<br />
                Vasavi MPM Grand<br />
                Ameerpet, Hyderabad – 500073
              </address>
            </li>

          </ul>
        </div>

        {/* CTA Section */}
        <div>
          <h3 className="text-lg font-bold mb-6">
            Get Counselling
          </h3>

          <p className="text-white/70 text-sm mb-6">
            Book your expert counselling session and secure your dream college.
          </p>

          <button
            onClick={() =>
              window.open("https://bookings.edu9.in/#/2026", "_blank")
            }
            className="w-full bg-[#ffc107] hover:bg-[#ffca2c] text-[#1a237e] font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg text-sm"
          >
            Book Counselling
          </button>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-[#2a3040] mt-8 pt-6 text-center text-zinc-500 text-sm">
        © {new Date().getFullYear()} Edu9 Career Guidance. All rights reserved.
      </div>

    </div>
  </footer>
);