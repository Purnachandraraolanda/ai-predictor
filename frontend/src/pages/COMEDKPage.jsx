import { motion } from "framer-motion";
import { Header, Footer } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const COMEDKPage = () => {
  const [email, setEmail] = useState("");

  const handleNotify = () => {
    if (email) {
      toast.success("You'll be notified when COMEDK predictor launches!");
      setEmail("");
    } else {
      toast.error("Please enter your email");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-4 md:pt-28 md:pb-6 border-b border-zinc-800">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-orange-600 flex items-center justify-center glow-orange">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-50 font-['Outfit']" data-testid="page-title">
                  COMEDK College Predictor
                </h1>
                <p className="text-zinc-400 text-sm">Karnataka Private Engineering Colleges</p>
              </div>
            </div>
            <Badge className="w-fit bg-orange-600/20 text-orange-300 border-orange-500/30 px-4 py-1.5" data-testid="coming-soon-badge">
              <Clock className="w-3 h-3 mr-2" />
              Coming Soon
            </Badge>
          </div>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="flex-1 flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto px-4"
          data-testid="coming-soon-content"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-600/5 flex items-center justify-center">
            <Clock className="w-12 h-12 text-orange-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-4 font-['Outfit']">
            COMEDK Predictor
            <span className="block text-orange-500">Coming Soon</span>
          </h2>
          
          <p className="text-zinc-400 mb-8 leading-relaxed">
            We're working hard to bring you accurate college predictions for COMEDK 2025. 
            Get notified when we launch!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-zinc-900 border-zinc-800 focus:border-orange-600 text-zinc-100 placeholder:text-zinc-600"
              data-testid="email-input"
            />
            <Button
              onClick={handleNotify}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6"
              data-testid="notify-button"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notify Me
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-2xl font-bold text-orange-500 font-['JetBrains_Mono']">190+</div>
              <div className="text-zinc-500 text-xs">Colleges</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-2xl font-bold text-orange-500 font-['JetBrains_Mono']">50+</div>
              <div className="text-zinc-500 text-xs">Branches</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="text-2xl font-bold text-orange-500 font-['JetBrains_Mono']">2025</div>
              <div className="text-zinc-500 text-xs">Data</div>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default COMEDKPage;
