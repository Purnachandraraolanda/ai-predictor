import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  Target,
  Sparkles,
  Zap,
  Star,
  ChevronRight,
} from "lucide-react";
import { Header, Footer } from "@/components/Layout";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 4)) * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={countRef} className="tabular-nums font-mono">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const FloatingParticle = ({ delay, x, y, size, color }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, backgroundColor: color }}
    animate={{
      y: [-20, 20, -20],
      opacity: [0.2, 0.6, 0.2],
      scale: [0.8, 1.2, 0.8],
    }}
    transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const PredictorCard = ({ id, name, description, tags, gradientFrom, gradientTo, icon: IconComp, stats, status, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
  >
    <Link
      to={`/${id}`}
      data-testid={`predictor-card-${id}`}
      className="group relative block overflow-hidden rounded-2xl bg-[#1a1f26] border border-zinc-800/50 hover:border-zinc-600 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
    >
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom}/5 ${gradientTo}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-5">
          <motion.div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shadow-lg`}
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <IconComp className="w-7 h-7 text-white" />
          </motion.div>
          {status === "coming_soon" ? (
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">Coming Soon</Badge>
          ) : (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 inline-block animate-pulse" />
              Live
            </Badge>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-300 transition-all">
          {name}
        </h3>
        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{description}</p>

        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
              {tag}
            </span>
          ))}
        </div>

        {stats && (
          <div className="text-xs text-zinc-500 mb-4">{stats}</div>
        )}

        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
          <span>{status === "coming_soon" ? "Coming Soon" : "Predict Now"}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  </motion.div>
);

const HomePage = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const predictors = [
    {
      id: "jee", name: "JEE Main Predictor", description: "Predict IITs, NITs, IIITs & GFTIs across India with JoSAA counselling data",
      tags: ["JoSAA 2025", "All India", "128 Institutes"], gradientFrom: "from-blue-600", gradientTo: "to-cyan-500",
      icon: GraduationCap, stats: "12,122 cutoff records | 253 programs", status: "active"
    },
    {
      id: "tgeapcet", name: "TGEAPCET Predictor", description: "Find your match from Telangana Engineering Colleges with official data",
      tags: ["TS EAMCET", "Telangana", "183 Institutes"], gradientFrom: "from-emerald-600", gradientTo: "to-teal-500",
      icon: GraduationCap, stats: "32,685 cutoff records | 24 branches", status: "active"
    },
    {
      id: "apeapcet", name: "APEAPCET Predictor", description: "Andhra Pradesh Engineering College predictions with 43,806 real records",
      tags: ["APSCHE", "AP State", "254 Colleges"], gradientFrom: "from-violet-600", gradientTo: "to-purple-500",
      icon: GraduationCap, stats: "43,806 cutoff records | 70 branches", status: "active"
    },
    {
      id: "comedk", name: "COMEDK Predictor", description: "Karnataka Private Engineering College predictions with COMEDK data",
      tags: ["Karnataka", "Private Colleges", "40 Colleges"], gradientFrom: "from-orange-600", gradientTo: "to-amber-500",
      icon: GraduationCap, stats: "2,888 cutoff records | 15 branches", status: "active"
    }
  ];

  const stats = [
    { value: 50000, suffix: "+", label: "Students Helped", icon: Users, color: "text-blue-400" },
    { value: 500, suffix: "+", label: "Colleges", icon: GraduationCap, color: "text-emerald-400" },
    { value: 98, suffix: "%", label: "Accuracy", icon: Target, color: "text-amber-400" },
    { value: 100, suffix: "%", label: "Free", icon: Zap, color: "text-rose-400" }
  ];

  const steps = [
    { icon: Search, title: "Select Exam", desc: "Choose your entrance exam from JEE, TGEAPCET, APEAPCET or COMEDK", color: "from-blue-600 to-cyan-600" },
    { icon: Calculator, title: "Enter Details", desc: "Input your rank, category, gender and preferences", color: "from-violet-600 to-purple-600" },
    { icon: Target, title: "Get Predictions", desc: "Receive Safe, Good Chance & Reach college recommendations", color: "from-emerald-600 to-teal-600" }
  ];

  const services = [
    { icon: TrendingUp, title: "Rank Analysis", desc: "Deep analysis of your rank across categories and quotas" },
    { icon: BookOpen, title: "College Selection", desc: "Expert guidance on college & branch selection strategy" },
    { icon: Users, title: "Counselling Support", desc: "Complete support throughout counselling process" },
    { icon: Award, title: "One-to-One Guidance", desc: "Personalized mentoring from education experts" }
  ];

  return (
    <div className="min-h-screen bg-[#111720] relative">
      <ParticleBackground color="139,92,246" particleCount={70} connectionDistance={130} speed={0.3} />
      <Header />

      {/* Hero Section */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/6 rounded-full blur-[100px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[80px]" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <FloatingParticle delay={0} x={10} y={20} size={4} color="rgba(139,92,246,0.3)" />
          <FloatingParticle delay={0.5} x={85} y={15} size={3} color="rgba(59,130,246,0.3)" />
          <FloatingParticle delay={1} x={20} y={60} size={5} color="rgba(16,185,129,0.2)" />
          <FloatingParticle delay={1.5} x={75} y={55} size={3} color="rgba(245,158,11,0.3)" />
          <FloatingParticle delay={2} x={50} y={30} size={4} color="rgba(236,72,153,0.2)" />
          <FloatingParticle delay={0.8} x={90} y={70} size={3} color="rgba(139,92,246,0.25)" />
          <FloatingParticle delay={1.2} x={5} y={80} size={4} color="rgba(59,130,246,0.2)" />
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Badge
                className="mb-6 px-5 py-2 bg-gradient-to-r from-violet-600/20 to-blue-600/20 border-violet-500/30 text-violet-300 text-sm"
                data-testid="hero-badge"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                #1 College Prediction Platform in India
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight"
              data-testid="hero-title"
            >
              Find Your
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Dream College
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              AI-powered college predictions for <span className="text-white font-medium">JEE, TGEAPCET, APEAPCET & COMEDK</span>.
              Get accurate cutoff analysis and find your perfect match instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/jee">
                <Button
                  className="gold-btn text-zinc-950 font-bold px-8 py-6 text-lg rounded-xl border-0 hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
                  data-testid="hero-cta-primary"
                >
                  <Sparkles className="mr-2 w-5 h-5" />
                  Start Prediction
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#predictors">
                <Button
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white px-8 py-6 text-lg rounded-xl"
                  data-testid="hero-cta-secondary"
                >
                  View All Predictors
                  <ChevronRight className="ml-1 w-5 h-5" />
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-16 border-y border-zinc-800/50 bg-[#0d1117]">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6" data-testid="stats-section">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 hover:border-zinc-700 transition-all group"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-zinc-500 text-sm uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Predictors Section */}
      <section id="predictors" className="py-24 md:py-28 bg-[#0a0d12]">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge className="mb-4 bg-zinc-800 text-zinc-300 border-zinc-700">
              <Star className="w-3 h-3 mr-1.5" />Predictors
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Choose Your Entrance Exam
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Get personalized college predictions based on your rank and preferences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="predictors-grid">
            {predictors.map((predictor, index) => (
              <PredictorCard key={predictor.id} {...predictor} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-28 bg-[#0d1117]">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge className="mb-4 bg-zinc-800 text-zinc-300 border-zinc-700">How It Works</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Get Predictions in 3 Simple Steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto" data-testid="how-it-works">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative p-8 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center hover:border-zinc-700 transition-all group"
              >
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {index + 1}
                </div>
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <step.icon className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 md:py-28 bg-[#0a0d12]">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge className="mb-4 bg-zinc-800 text-zinc-300 border-zinc-700">Services</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Complete Career Guidance
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="services-section">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 hover:border-zinc-700 transition-all group hover:-translate-y-1"
              >
                <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 flex items-center justify-center group-hover:from-violet-600/30 group-hover:to-blue-600/30 transition-all">
                  <service.icon className="w-6 h-6 text-violet-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-28 bg-gradient-to-b from-[#0d1117] to-[#0a0d12] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-6 text-emerald-500" />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Find Your Dream College?
            </h2>
            <p className="text-zinc-400 text-lg mb-10">
              Join <span className="text-white font-medium">50,000+</span> students who found their perfect college match using Edu9
            </p>
            <Link to="/jee">
              <Button
                className="gold-btn text-zinc-950 font-bold px-10 py-6 text-lg rounded-xl border-0 hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
                data-testid="cta-button"
              >
                <Sparkles className="mr-2 w-5 h-5" />
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
