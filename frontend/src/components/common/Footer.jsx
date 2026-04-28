import React from "react";
import { Link } from "react-router-dom";
import {
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const LOGO_URL = "/edu9-logo.jpg";

const socialLinks = [
  {
    icon: Youtube,
    href: "https://www.youtube.com/@edu9lvgr",
    label: "YouTube",
    color: "hover:bg-red-600",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/edu9careerguide/",
    label: "Instagram",
    color: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500",
  },
  {
    icon: Facebook,
    href: "https://www.facebook.com/edu9careerguide/",
    label: "Facebook",
    color: "hover:bg-blue-600",
  },
  {
    icon: Twitter,
    href: "https://x.com/edu9careerguide",
    label: "Twitter/X",
    color: "hover:bg-black",
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-[#2a3040] bg-[#0f172a] text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img
                src={LOGO_URL}
                alt="Edu9 Career Guidance"
                className="h-14 w-auto rounded-lg"
              />
              <div>
                <span className="font-bold text-xl text-[#ffc107] font-['Outfit']">
                  Edu9
                </span>
                <span className="block text-sm text-white/60">
                  Career Guidance
                </span>
              </div>
            </Link>

            <p className="text-white/70 text-sm leading-relaxed mb-6">
              College predictions for JEE, TGEAPCET, APEAPCET & COMEDK.
              Accurate cutoff analysis and expert career guidance.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Predictors Section (From First Footer) */}
          <div>
            <h3 className="text-lg font-bold mb-6">Predictors</h3>
            <ul className="space-y-3">
              {[
                ["JEE Main", "/jee"],
                ["TGEAPCET", "/tgeapcet"],
                ["APEAPCET", "/apeapcet"],
                ["COMEDK", "/comedk"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-white/70 hover:text-[#ffc107] transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#ffc107]" />
                <a
                  href="tel:+919133311450"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  +91 9133311450
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#ffc107]" />
                <a
                  href="mailto:info@edu9.in"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  info@edu9.in
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#ffc107]" />
                <span className="text-white/70">
                  Unit No 1312, 12th Floor,<br />
                  Vasavi MPM Grand,<br />
                  Ameerpet, Hyderabad – 500073
                </span>
              </li>
            </ul>
          </div>

          {/* CTA Section */}
          <div>
            <h3 className="text-lg font-bold mb-6">Get Counselling</h3>
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

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          

            
          </div>

          {/* Disclaimer */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/40 text-xs text-center">
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;