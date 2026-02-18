import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Clock, 
  Bell, 
  Building, 
  BookOpen, 
  MapPin, 
  Database,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

const AnimatedCounter = ({ end }) => {
  return <span>{end.toLocaleString()}</span>;
};

const COMEDKPage = () => {
  const [email, setEmail] = useState("");

  const handleNotify = () => {
    if (email && email.includes('@')) {
      toast.success("You'll be notified when COMEDK predictor launches!");
      setEmail("");
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Edu9 Career Guidance</span>
            </Link>
            <Badge className="bg-transparent border border-orange-500/50 text-orange-400 px-4 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Coming Soon
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-1 h-1 bg-orange-500/50 rounded-full animate-pulse" />
          <div className="absolute top-40 left-20 w-1.5 h-1.5 bg-amber-500/50 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
          <div className="absolute top-32 right-20 w-1 h-1 bg-yellow-500/50 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-6xl relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">Coming Soon - COMEDK 2025 Data</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">COMEDK College</span>
              <br />
              <span className="text-white">Predictor</span>
            </h1>
            
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              We're working hard to bring you accurate college predictions for <span className="text-white font-semibold">190+</span> Karnataka Private Engineering Colleges
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center opacity-60">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Building className="w-6 h-6 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={190} /></div>
              <div className="text-zinc-500 text-sm">Colleges</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center opacity-60">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={50} /></div>
              <div className="text-zinc-500 text-sm">Branches</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center opacity-60">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={30} /></div>
              <div className="text-zinc-500 text-sm">Districts</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center opacity-60">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-rose-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">2025</div>
              <div className="text-zinc-500 text-sm">Data Coming</div>
            </div>
          </div>

          {/* Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto p-8 rounded-3xl bg-[#1a1f26] border border-zinc-800/50 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
              <Clock className="w-10 h-10 text-orange-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Get Notified When We Launch</h2>
            <p className="text-zinc-400 mb-6">
              Be the first to know when COMEDK College Predictor goes live. Enter your email below.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl placeholder:text-zinc-600"
                data-testid="email-input"
              />
              <Button
                onClick={handleNotify}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
                data-testid="notify-button"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <h2 className="text-2xl font-bold text-white text-center mb-8">What to Expect</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: "Accurate Predictions", desc: "Compare your rank with thousands of official cutoff records from Karnataka colleges" },
              { title: "Safe/Good/Reach Analysis", desc: "Get clear recommendations on your admission chances for each college" },
              { title: "Filter by Branch & Location", desc: "Find colleges that match your preferred branch and location in Karnataka" }
            ].map((item, index) => (
              <div key={index} className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
                <div className="text-orange-500 text-4xl font-bold mb-3">0{index + 1}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Predictors */}
      <section className="py-16 bg-[#0a0d11]">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Try Our Other Predictors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/jee" className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 mb-4 rounded-xl bg-blue-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">JEE Main Predictor</h3>
              <p className="text-zinc-500 text-sm mb-4">IITs, NITs, IIITs & GFTIs</p>
              <span className="text-blue-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Try Now <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link to="/tgeapcet" className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 mb-4 rounded-xl bg-emerald-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">TGEAPCET Predictor</h3>
              <p className="text-zinc-500 text-sm mb-4">Telangana Engineering Colleges</p>
              <span className="text-emerald-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Try Now <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link to="/apeapcet" className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 hover:border-violet-500/50 transition-all group">
              <div className="w-12 h-12 mb-4 rounded-xl bg-violet-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">APEAPCET Predictor</h3>
              <p className="text-zinc-500 text-sm mb-4">Andhra Pradesh Engineering Colleges</p>
              <span className="text-violet-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Try Now <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-6 border-t border-zinc-800/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-500 text-sm">© 2025 Edu9 Career Guidance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default COMEDKPage;
