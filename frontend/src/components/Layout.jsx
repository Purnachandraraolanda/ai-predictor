import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#2a3040]">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group" data-testid="logo-link">
            <motion.img
              src="/edu9-logo.jpg"
              alt="Edu9 Career Guidance"
              className="h-10 w-auto rounded-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <motion.div
              className="hidden sm:block"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="font-bold text-lg text-[#f5c842] font-['Outfit']">edu9</span>
              <span className="block text-xs text-zinc-400">Career Guidance</span>
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <motion.div key={link.href} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <Link to={link.href} data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.href ? "text-zinc-50 bg-[#252d3d]" : "text-zinc-400 hover:text-zinc-50 hover:bg-[#1e2535]"
                  }`}>{link.label}</Link>
              </motion.div>
            ))}
          </nav>

          <button className="md:hidden p-2 text-zinc-400 hover:text-zinc-50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-toggle">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden glass border-t border-[#2a3040]">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.href ? "text-zinc-50 bg-[#252d3d]" : "text-zinc-400 hover:text-zinc-50 hover:bg-[#1e2535]"
                  }`}>{link.label}</Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export const Footer = () => (
  <footer className="border-t border-[#2a3040] bg-[#111720]">
    <div className="container mx-auto px-4 md:px-6 max-w-7xl py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center gap-3 mb-4">
            <img src="/edu9-logo.jpg" alt="Edu9 Career Guidance" className="h-12 w-auto rounded-lg" />
            <div>
              <span className="font-bold text-xl text-[#f5c842] font-['Outfit']">edu9</span>
              <span className="block text-sm text-zinc-400">Career Guidance</span>
            </div>
          </Link>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md">AI-powered college predictions for JEE, TGEAPCET, APEAPCET & COMEDK. Find your dream college with accurate cutoff analysis.</p>
        </div>
        <div>
          <h4 className="font-semibold text-zinc-50 mb-4 font-['Outfit']">Predictors</h4>
          <ul className="space-y-2">
            {[["JEE Main", "/jee"], ["TGEAPCET", "/tgeapcet"], ["APEAPCET", "/apeapcet"], ["COMEDK", "/comedk"]].map(([label, href]) => (
              <li key={href}><Link to={href} className="text-zinc-400 hover:text-zinc-50 text-sm transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-zinc-50 mb-4 font-['Outfit']">Contact</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><a href="tel:9133311450" className="hover:text-zinc-50 transition-colors">9133311450</a></li>
            <li><a href="mailto:info@edu9.in" className="hover:text-zinc-50 transition-colors">info@edu9.in</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#2a3040] mt-8 pt-8 text-center text-zinc-500 text-sm">&copy; 2025 Edu9 Career Guidance. All rights reserved.</div>
    </div>
  </footer>
);
