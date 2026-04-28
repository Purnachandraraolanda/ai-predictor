import React from 'react';
import { Youtube, Instagram, Facebook, Twitter, Phone, Mail, MapPin } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_jeecareer/artifacts/rkhrtjqg_image.png";

const socialLinks = [
  { 
    icon: Youtube, 
    href: 'https://www.youtube.com/@edu9lvgr', 
    label: 'YouTube',
    color: 'hover:bg-red-600'
  },
  { 
    icon: Instagram, 
    href: 'https://www.instagram.com/edu9careerguide/', 
    label: 'Instagram',
    color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500'
  },
  { 
    icon: Facebook, 
    href: 'https://www.facebook.com/edu9careerguide/', 
    label: 'Facebook',
    color: 'hover:bg-blue-600'
  },
  { 
    icon: Twitter, 
    href: 'https://x.com/edu9careerguide', 
    label: 'Twitter/X',
    color: 'hover:bg-black'
  }
];

const quickLinks = [
  { name: 'About JEE Main', href: '#about-jee-main' },
  { name: 'Services', href: '#services' },
  { name: 'JoSAA Process', href: '#josaa-process' },
  { name: 'Colleges', href: '#colleges' },
  { name: 'Videos', href: '#HomePage' },
];

export const Footer = () => {
  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer 
      data-testid="footer"
      className="bg-[#0f172a] text-white pt-16 pb-8"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <img 
              src={LOGO_URL} 
              alt="Edu9 Career Guidance" 
              className="h-14 w-auto mb-6"
              data-testid="footer-logo"
            />
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Expert career guidance for JEE Main and Advanced aspirants. Helping students make informed decisions about their engineering education.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 ${social.color}`}
                  aria-label={social.label}
                  data-testid={`social-link-${social.label.toLowerCase()}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/70 hover:text-[#ffc107] transition-colors duration-200 text-sm"
                    data-testid={`footer-link-${index}`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#ffc107] flex-shrink-0 mt-0.5" />
                <a 
                  href="tel:+919133311450" 
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  +91 9133311450
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#ffc107] flex-shrink-0 mt-0.5" />
                <a 
                  href="mailto:ceo@edu9.in" 
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  ceo@edu9.in
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#ffc107] flex-shrink-0 mt-0.5" />
                <span className="text-white/70 text-sm">
                   Unit No 1312, 12th Floor, <br /> Vasavi MPM Grand,<br />
                  Ameerpet, Hyderabad – 500073
                </span>
              </li>
            </ul>
          </div>

          {/* CTA Column */}
          <div>
            <h3 className="text-lg font-bold mb-6">Get Counselling</h3>
            <p className="text-white/70 text-sm mb-6">
              Ready to start your engineering journey? Book your counselling session today.
            </p>
            <button 
              onClick={() => window.open('https://bookings.edu9.in/#/2026', '_blank')}
              className="w-full bg-[#ffc107] hover:bg-[#ffca2c] text-[#1a237e] font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg text-sm"
              data-testid="footer-cta-btn"
            >
              Book Counselling
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Edu9 Career Guidance. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-white/50 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-white/50 hover:text-white text-sm transition-colors">Terms of Service</a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/40 text-xs text-center" data-testid="footer-disclaimer">
              <strong>Disclaimer:</strong> Edu9 Career Guidance is a private educational guidance platform and is NOT affiliated with NTA or JoSAA. 
              All information provided is for guidance purposes only. Official information should be verified from respective government sources.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
