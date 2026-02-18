import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Calculator, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle,
  ArrowRight,
  Search,
  BookOpen,
  Target
} from "lucide-react";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={countRef} className="tabular-nums font-['JetBrains_Mono']">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// Predictor Card Component
const PredictorCard = ({ id, name, description, tags, accent, status }) => {
  const accentStyles = {
    jee: { border: "border-blue-600/20", glow: "group-hover:glow-blue", text: "text-blue-500", bg: "bg-blue-600" },
    tgeapcet: { border: "border-emerald-600/20", glow: "group-hover:glow-green", text: "text-emerald-500", bg: "bg-emerald-600" },
    apeapcet: { border: "border-violet-600/20", glow: "group-hover:glow-purple", text: "text-violet-500", bg: "bg-violet-600" },
    comedk: { border: "border-orange-600/20", glow: "group-hover:glow-orange", text: "text-orange-500", bg: "bg-orange-600" },
  };

  const style = accentStyles[id] || accentStyles.jee;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link
        to={`/${id}`}
        data-testid={`predictor-card-${id}`}
        className={`group relative block overflow-hidden rounded-2xl border ${style.border} bg-zinc-900/50 p-6 hover:border-zinc-700 transition-all duration-300 ${style.glow}`}
      >
        <div className={`absolute top-0 left-0 w-full h-1 ${style.bg}`} />
        
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center`}>
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {status === "coming_soon" && (
            <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700">
              Coming Soon
            </Badge>
          )}
        </div>

        <h3 className="text-xl font-semibold text-zinc-50 mb-2 font-['Outfit']">{name}</h3>
        <p className="text-zinc-400 text-sm mb-4">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">
              {tag}
            </span>
          ))}
        </div>

        <div className={`flex items-center gap-2 ${style.text} font-medium text-sm group-hover:gap-3 transition-all`}>
          <span>Predict Now</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </motion.div>
  );
};

const HomePage = () => {
  const predictors = [
    {
      id: "jee",
      name: "JEE Main Predictor",
      description: "IITs, NITs, IIITs, GFTIs across India",
      tags: ["JoSAA Counselling", "All India"],
      accent: "#2563eb",
      status: "active"
    },
    {
      id: "tgeapcet",
      name: "TGEAPCET Predictor",
      description: "Telangana Engineering Colleges",
      tags: ["TS EAMCET", "Telangana State"],
      accent: "#059669",
      status: "active"
    },
    {
      id: "apeapcet",
      name: "APEAPCET Predictor",
      description: "Andhra Pradesh Engineering Colleges",
      tags: ["APSCHE", "AP State Counselling"],
      accent: "#7c3aed",
      status: "active"
    },
    {
      id: "comedk",
      name: "COMEDK Predictor",
      description: "Karnataka Private Engineering Colleges",
      tags: ["Karnataka", "Private Colleges"],
      accent: "#ea580c",
      status: "coming_soon"
    }
  ];

  const stats = [
    { value: 50000, suffix: "+", label: "Students Helped" },
    { value: 500, suffix: "+", label: "Colleges" },
    { value: 98, suffix: "%", label: "Accuracy" },
    { value: 100, suffix: "%", label: "Free" }
  ];

  const steps = [
    { icon: Search, title: "Select Exam", description: "Choose your entrance exam from JEE, TGEAPCET, APEAPCET or COMEDK" },
    { icon: Calculator, title: "Enter Details", description: "Input your rank, category, gender and preferences" },
    { icon: Target, title: "Get Predictions", description: "Receive Safe, Good Chance & Reach college recommendations" }
  ];

  const services = [
    { icon: TrendingUp, title: "Rank Analysis", description: "Deep analysis of your rank across categories" },
    { icon: BookOpen, title: "College Selection", description: "Expert guidance on college & branch selection" },
    { icon: Users, title: "Counselling Support", description: "Complete support throughout counselling process" },
    { icon: Award, title: "One-to-One Guidance", description: "Personalized mentoring from experts" }
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge 
              className="mb-6 px-4 py-1.5 bg-gradient-to-r from-violet-600/20 to-blue-600/20 border-violet-500/30 text-violet-300"
              data-testid="hero-badge"
            >
              <Target className="w-3 h-3 mr-2" />
              #1 College Prediction Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-zinc-50 mb-6 font-['Outfit'] tracking-tight" data-testid="hero-title">
              Find Your
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent"> Dream College</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              AI-powered college predictions for JEE, TGEAPCET, APEAPCET & COMEDK. 
              Get accurate cutoff analysis and find your perfect match.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/apeapcet">
                <Button 
                  className="gold-btn text-zinc-950 font-bold px-8 py-6 text-lg rounded-lg border-0 hover:scale-105 transition-transform"
                  data-testid="hero-cta-primary"
                >
                  Start Prediction
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="#predictors">
                <Button 
                  variant="outline" 
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white px-8 py-6 text-lg rounded-lg"
                  data-testid="hero-cta-secondary"
                >
                  View All Predictors
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-zinc-800">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8" data-testid="stats-section">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm"
              >
                <div className="text-4xl md:text-5xl font-bold text-zinc-50 mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-zinc-400 text-sm uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Predictors Section */}
      <section id="predictors" className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-zinc-800 text-zinc-300 border-zinc-700">Predictors</Badge>
            <h2 className="text-3xl md:text-5xl font-semibold text-zinc-50 mb-4 font-['Outfit']">
              Choose Your Entrance Exam
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Get personalized college predictions based on your rank and preferences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="predictors-grid">
            {predictors.map((predictor) => (
              <PredictorCard key={predictor.id} {...predictor} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 bg-zinc-900/50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-zinc-800 text-zinc-300 border-zinc-700">How It Works</Badge>
            <h2 className="text-3xl md:text-5xl font-semibold text-zinc-50 mb-4 font-['Outfit']">
              Get Predictions in 3 Simple Steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="how-it-works">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-zinc-800 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-50 mb-3 font-['Outfit']">{step.title}</h3>
                <p className="text-zinc-400 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-zinc-800 text-zinc-300 border-zinc-700">Services</Badge>
            <h2 className="text-3xl md:text-5xl font-semibold text-zinc-50 mb-4 font-['Outfit']">
              Complete Career Guidance
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="services-section">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all group"
              >
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 flex items-center justify-center group-hover:from-violet-600/30 group-hover:to-blue-600/30 transition-all">
                  <service.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-50 mb-2 font-['Outfit']">{service.title}</h3>
                <p className="text-zinc-400 text-sm">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-zinc-900/50 to-zinc-950">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-6 text-emerald-500" />
            <h2 className="text-3xl md:text-5xl font-semibold text-zinc-50 mb-6 font-['Outfit']">
              Ready to Find Your Dream College?
            </h2>
            <p className="text-zinc-400 text-lg mb-10">
              Join 50,000+ students who found their perfect college match using Edu9
            </p>
            <Link to="/apeapcet">
              <Button 
                className="gold-btn text-zinc-950 font-bold px-10 py-6 text-lg rounded-lg border-0 hover:scale-105 transition-transform"
                data-testid="cta-button"
              >
                Start Prediction Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
