import { useState } from "react";
import { motion } from "framer-motion";
import { Header, Footer } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ExternalLink, Loader2 } from "lucide-react";

const JEEPage = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-4 md:pt-28 md:pb-6 border-b border-zinc-800">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center glow-blue">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-50 font-['Outfit']" data-testid="page-title">
                  JEE Main College Predictor
                </h1>
                <p className="text-zinc-400 text-sm">IITs, NITs, IIITs, GFTIs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 px-4 py-1.5" data-testid="official-badge">
                Official JoSAA 2025 Data
              </Badge>
              <a 
                href="https://rank-matcher.preview.emergentagent.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/30">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl py-3">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="text-zinc-400">
              <span className="text-blue-400 font-semibold">23</span> IITs
            </span>
            <span className="text-zinc-400">
              <span className="text-blue-400 font-semibold">31</span> NITs
            </span>
            <span className="text-zinc-400">
              <span className="text-blue-400 font-semibold">26</span> IIITs
            </span>
            <span className="text-zinc-400">
              <span className="text-blue-400 font-semibold">48</span> GFTIs
            </span>
            <span className="text-zinc-400">
              <span className="text-blue-400 font-semibold">11,000+</span> Cutoff Records
            </span>
          </div>
        </div>
      </div>

      {/* Iframe Section */}
      <section className="flex-1 relative">
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: loading ? 1 : 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-10"
            data-testid="loading-state"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-blue-600 animate-spin" />
              <GraduationCap className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-zinc-400 mt-4">Loading JEE Predictor...</p>
          </motion.div>
        )}
        
        <iframe
          src="https://rank-matcher.preview.emergentagent.com/"
          className="w-full h-[calc(100vh-180px)] border-0"
          title="JEE Main College Predictor"
          onLoad={() => setLoading(false)}
          data-testid="predictor-iframe"
        />
      </section>

      <Footer />
    </div>
  );
};

export default JEEPage;
