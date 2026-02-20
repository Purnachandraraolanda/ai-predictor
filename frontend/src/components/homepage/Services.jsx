import React from 'react';
import { 
  BarChart3, 
  GraduationCap, 
  FileText, 
  TrendingUp, 
  Target, 
  Youtube, 
  Phone, 
  FileCheck 
} from 'lucide-react';
import { Card } from '../ui/card';

const services = [
  {
    icon: BarChart3,
    title: 'Rank Analysis & Performance Review',
    description: 'JEE Main , Comedk , TG/AP EAPCET percentile & rank explanation, rank vs college prediction, category & quota based analysis',
    color: 'bg-blue-500'
  },
  {
    icon: GraduationCap,
    title: 'College & Branch Selection Guidance',
    description: 'IIT/NIT/IIIT/GFTI , COMEDK , AP/TG EAPCET options , branch wise comparison, top colleges vs safe colleges planning, career-based selection',
    color: 'bg-amber-500'
  },
  {
    icon: FileText,
    title: 'JoSAA , TG/AP EAPCET , COMEDK & State wise Counselling Support',
    description: 'Step-by-step registration help, choice filling strategy, mock sessions, seat allotment round guidance',
    color: 'bg-green-500'
  },
  {
    icon: TrendingUp,
    title: 'College Prediction & Safe Options',
    description: 'Dream/Target/Safe college lists, expected closing rank analysis, backup planning, multiple counselling strategy',
    color: 'bg-purple-500'
  },
  {
    icon: Target,
    title: 'Career Counselling & Future Planning',
    description: 'Engineering branch future scope, career paths, placement trend analysis, higher studies vs job planning',
    color: 'bg-red-500'
  },
  {
    icon: Youtube,
    title: 'Edu9 YouTube Learning Support',
    description: 'College review videos, counselling strategy videos, rank analysis explanations, student awareness sessions',
    color: 'bg-rose-500'
  },
  {
    icon: Phone,
    title: 'Personal One-to-One Counselling',
    description: 'Individual counselling sessions, parent + student guidance, doubt clarification, continuous support',
    color: 'bg-cyan-500'
  },
  {
    icon: FileCheck,
    title: 'Admission & Documentation Assistance',
    description: 'Document verification checklist, fee payment guidance, reporting process, admission confirmation support',
    color: 'bg-indigo-500'
  }
];

export const Services = () => {
  return (
    <section 
      id="services" 
      data-testid="services-section"
      className="py-16 md:py-24 bg-[#0d1117]"
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-2 bg-amber-500/20 text-amber-400 text-sm font-semibold rounded-full mb-4 border border-amber-500/30">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Edu9 Career Guidance <span className="text-amber-400">Services</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Comprehensive guidance for JEE Main aspirants at every step of their journey
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="group p-6 bg-[#161b22] hover:bg-[#1c2128] border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              data-testid={`service-card-${index}`}
            >
              <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-amber-400 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button 
            onClick={() => window.open('https://bookings.edu9.in/#/2026', '_blank')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5"
            data-testid="services-cta-btn"
          >
            Book Your Counselling Session
            <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
