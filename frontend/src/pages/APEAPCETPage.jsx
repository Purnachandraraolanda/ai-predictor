import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap, Search, Loader2, CheckCircle, AlertCircle,
  XCircle, Building, BookOpen, Database,
  ArrowRight, Sparkles, MapPin, Filter
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import ParticleBackground from "@/components/ParticleBackground";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 4)) * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
};

const ChanceBadge = ({ chance, probability }) => {
  const config = {
    SAFE: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", icon: CheckCircle, label: "Safe" },
    GOOD: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", icon: AlertCircle, label: "Good Chance" },
    REACH: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", icon: XCircle, label: "Reach" }
  };
  const c = config[chance];
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${c.bg} ${c.text} ${c.border}`}>
      <c.icon className="w-3.5 h-3.5" />
      <span>{c.label}</span>
      <span className="opacity-60">({probability}%)</span>
    </div>
  );
};

const CollegeCard = ({ prediction, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(index * 0.03, 1) }}
    className="p-5 rounded-xl bg-[#1a1f26] border border-zinc-800/50 hover:border-zinc-700 transition-all"
    data-testid={`result-card-${index}`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-semibold text-sm leading-tight">{prediction.institute || prediction.institute_code}</h4>
          {prediction.institute_code && <span className="text-zinc-500 text-xs">{prediction.institute_code}</span>}
        </div>
      </div>
      <ChanceBadge chance={prediction.chance} probability={prediction.probability} />
    </div>

    <div className="mb-3">
      <p className="text-zinc-300 text-sm font-medium">{prediction.branch}</p>
    </div>

    <div className="flex items-center gap-4 text-xs flex-wrap">
      {prediction.district && (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400">
          <MapPin className="w-3 h-3" />{prediction.district}
        </span>
      )}
      <div className="flex items-center gap-3 ml-auto">
        <div><span className="text-zinc-500">Open: </span><span className="text-zinc-300 font-mono font-medium">{prediction.opening_rank?.toLocaleString()}</span></div>
        <div className="w-px h-4 bg-zinc-700" />
        <div><span className="text-zinc-500">Close: </span><span className="text-zinc-300 font-mono font-medium">{prediction.closing_rank?.toLocaleString()}</span></div>
      </div>
    </div>
  </motion.div>
);

const APEAPCETPage = () => {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const [formData, setFormData] = useState({
    rank: "", category: "", gender: "",
    college_type: "all", district: "all", branch: "all"
  });

  const categories = [
    { value: "OC", label: "OC (Open Category)" },
    { value: "BC_A", label: "BC-A" }, { value: "BC_B", label: "BC-B" },
    { value: "BC_C", label: "BC-C" }, { value: "BC_D", label: "BC-D" },
    { value: "BC_E", label: "BC-E" },
    { value: "SC", label: "SC" }, { value: "ST", label: "ST" },
    { value: "EWS", label: "EWS" }
  ];

  const genders = [{ value: "M", label: "Male" }, { value: "F", label: "Female" }];

  const collegeTypes = [
    { value: "all", label: "All Types" },
    { value: "College", label: "Engineering College" },
    { value: "University", label: "University" }
  ];

  useEffect(() => {
    axios.get(`${API}/apeapcet/metadata`).then(r => setMetadata(r.data)).catch(console.error);
  }, []);

  const handlePredict = async () => {
    if (!formData.rank) return toast.error("Please enter your APEAPCET rank");
    if (!formData.category) return toast.error("Please select a category");
    if (!formData.gender) return toast.error("Please select a gender");

    setLoading(true);
    setPredictions(null);
    try {
      const response = await axios.post(`${API}/apeapcet/predict`, {
        rank: parseInt(formData.rank), category: formData.category, gender: formData.gender,
        college_type: formData.college_type === "all" ? null : formData.college_type,
        district: formData.district === "all" ? null : formData.district,
        branch: formData.branch === "all" ? null : formData.branch
      });
      setPredictions(response.data);
      setActiveTab("all");
      toast.success(`Found ${response.data.total_colleges} college matches!`);
    } catch (error) {
      toast.error("Failed to get predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPredictions = () => {
    if (!predictions) return [];
    if (activeTab === "safe") return predictions.predictions.filter(p => p.chance === "SAFE");
    if (activeTab === "good") return predictions.predictions.filter(p => p.chance === "GOOD");
    if (activeTab === "reach") return predictions.predictions.filter(p => p.chance === "REACH");
    return predictions.predictions;
  };

  const collegeCount = metadata?.colleges?.length || 254;
  const branchCount = metadata?.branches?.length || 70;
  const districtCount = metadata?.districts?.length || 14;
  const filtered = getFilteredPredictions();

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <header className="border-b border-zinc-800/50 sticky top-0 z-50 bg-[#0f1419]/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">APEAPCET Predictor</span>
                <span className="text-violet-400 text-xs block leading-tight">by edu9 Career Guidance</span>
              </div>
            </Link>
            <Badge className="bg-transparent border border-violet-500/50 text-violet-400 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Official APSCHE 2025 Data
            </Badge>
          </div>
        </div>
      </header>

      <section className="pt-16 pb-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { t: 20, l: 10, s: 4, c: "bg-violet-500/40", d: 0 },
            { t: 40, l: 20, s: 6, c: "bg-purple-500/40", d: 0.5 },
            { t: 32, l: 80, s: 4, c: "bg-pink-500/40", d: 1 },
          ].map((p, i) => (
            <motion.div key={i} className={`absolute rounded-full ${p.c}`}
              style={{ top: `${p.t}%`, left: `${p.l}%`, width: p.s, height: p.s }}
              animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, delay: p.d }} />
          ))}
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-6xl relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-violet-400 text-sm font-medium">Official APSCHE 2025 Data</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">APEAPCET College</span>
              <br /><span className="text-white">Predictor</span>
            </h1>

            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Discover your perfect college match from <span className="text-white font-semibold">{collegeCount}</span> institutes across Andhra Pradesh with <span className="text-white font-semibold">{branchCount}</span> branches
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            {[
              { icon: Building, count: collegeCount, label: "Colleges", color: "bg-violet-500/20", iconColor: "text-violet-400" },
              { icon: BookOpen, count: branchCount, label: "Branches", color: "bg-purple-500/20", iconColor: "text-purple-400" },
              { icon: MapPin, count: districtCount, label: "Districts", color: "bg-pink-500/20", iconColor: "text-pink-400" },
              { icon: Database, count: 43806, label: "Cutoff Records", color: "bg-rose-500/20", iconColor: "text-rose-400" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center hover:border-zinc-700 transition-all group">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <s.icon className={`w-6 h-6 ${s.iconColor}`} />
                </div>
                <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={s.count} /></div>
                <div className="text-zinc-500 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex items-center justify-center gap-6 text-sm mb-12">
            {[
              { color: "bg-emerald-500", label: "100% Free" },
              { color: "bg-blue-500", label: "Real Data" },
              { color: "bg-violet-500", label: "Instant Results" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${s.color} animate-pulse`} />
                <span className="text-zinc-400">{s.label}</span>
              </div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto p-8 rounded-3xl bg-[#1a1f26] border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
                <Search className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Enter Your Details</h2>
                <p className="text-zinc-500 text-sm">Get personalized college predictions instantly</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">APEAPCET Rank *</label>
                <Input type="number" placeholder="Enter your rank" value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="bg-[#0f1419] border-zinc-800 focus:border-violet-500 text-white h-12 rounded-xl placeholder:text-zinc-600"
                  data-testid="rank-input" />
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">Category *</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {categories.map(c => <SelectItem key={c.value} value={c.value} className="text-white focus:bg-zinc-800">{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">Gender *</label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="gender-select">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {genders.map(g => <SelectItem key={g.value} value={g.value} className="text-white focus:bg-zinc-800">{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">College Type (Optional)</label>
                <Select value={formData.college_type} onValueChange={(v) => setFormData({ ...formData, college_type: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="college-type-select"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {collegeTypes.map(t => <SelectItem key={t.value} value={t.value} className="text-white focus:bg-zinc-800">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">District (Optional)</label>
                <Select value={formData.district} onValueChange={(v) => setFormData({ ...formData, district: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="district-select">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800 max-h-60">
                    <SelectItem value="all" className="text-white focus:bg-zinc-800">All Districts</SelectItem>
                    {metadata?.districts?.map(d => <SelectItem key={d} value={d} className="text-white focus:bg-zinc-800">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">Branch (Optional)</label>
                <Select value={formData.branch} onValueChange={(v) => setFormData({ ...formData, branch: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="branch-select">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800 max-h-60">
                    <SelectItem value="all" className="text-white focus:bg-zinc-800">All Branches</SelectItem>
                    {metadata?.branches?.map(b => <SelectItem key={b} value={b} className="text-white focus:bg-zinc-800">{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handlePredict} disabled={loading || !formData.rank}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold text-base shadow-lg shadow-violet-500/20"
              data-testid="predict-button">
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Predicting...</>
                : <><Sparkles className="mr-2 h-5 w-5" />Predict My Colleges<ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </motion.div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {predictions && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { count: predictions.total_colleges, label: "Total Matches", bg: "bg-[#1a1f26]", border: "border-zinc-800/50", text: "text-white" },
                  { count: predictions.safe_count, label: "Safe", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
                  { count: predictions.good_count, label: "Good Chance", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
                  { count: predictions.reach_count, label: "Reach", bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }} className={`p-5 rounded-2xl ${s.bg} border ${s.border}`}>
                    <div className={`text-3xl font-bold ${s.text}`}>{s.count}</div>
                    <div className={`${s.text} text-sm opacity-70`}>{s.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-6 flex-wrap" data-testid="results-tabs">
                <Filter className="w-4 h-4 text-zinc-500 mr-1" />
                {[
                  { key: "all", label: `All (${predictions.total_colleges})`, active: "bg-zinc-700 text-white" },
                  { key: "safe", label: `Safe (${predictions.safe_count})`, active: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" },
                  { key: "good", label: `Good Chance (${predictions.good_count})`, active: "bg-amber-600/20 text-amber-400 border-amber-500/30" },
                  { key: "reach", label: `Reach (${predictions.reach_count})`, active: "bg-red-600/20 text-red-400 border-red-500/30" },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      activeTab === tab.key ? tab.active : "bg-[#1a1f26] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`} data-testid={`tab-${tab.key}`}
                  >{tab.label}</button>
                ))}
              </div>

              <div className="space-y-3">
                {filtered.slice(0, 100).map((p, i) => (
                  <CollegeCard key={`${p.institute}-${p.branch}-${i}`} prediction={p} index={i} />
                ))}
              </div>
              {filtered.length > 100 && (
                <div className="mt-4 p-4 text-center text-zinc-500 text-sm rounded-xl bg-[#1a1f26] border border-zinc-800/50">
                  Showing top 100 results out of {filtered.length}
                </div>
              )}
              {filtered.length === 0 && (
                <div className="p-12 text-center text-zinc-500 rounded-xl bg-[#1a1f26] border border-zinc-800/50">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No colleges found for this filter</p>
                  <p className="text-sm mt-1">Try selecting a different filter tab</p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!predictions && (
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              {[
                { step: "01", title: "Enter Details", desc: "Input your APEAPCET rank, category, and gender to get started" },
                { step: "02", title: "Smart Analysis", desc: "We compare your rank with 43,806 official cutoff records" },
                { step: "03", title: "Get Results", desc: "Receive personalized college recommendations with admission chances" }
              ].map((item, i) => (
                <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center hover:border-zinc-700 transition-all">
                  <div className="text-violet-500 text-4xl font-bold mb-3">{item.step}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-[#1a1f26] to-[#0f1419] border border-zinc-800/50">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Find Your Dream College?</h3>
              <p className="text-zinc-400 mb-6">Join thousands of students who have used our predictor to make informed decisions</p>
              <Button onClick={() => document.querySelector('[data-testid="rank-input"]')?.focus()}
                className="bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-violet-500/20">
                Start Prediction Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      <footer className="py-6 border-t border-zinc-800/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-500 text-sm">&copy; 2025 Edu9 Career Guidance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default APEAPCETPage;
