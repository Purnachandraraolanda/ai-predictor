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
  XCircle, Trophy, Award, Zap, Circle, TrendingUp, BookOpen,
  Users, Target, FileText, Video, UserCheck, ClipboardCheck,
  ArrowRight, Sparkles, Filter
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

const CollegeCard = ({ prediction, index }) => {
  const typeColors = {
    IIT: "from-blue-600 to-blue-700",
    NIT: "from-emerald-600 to-emerald-700",
    IIIT: "from-violet-600 to-violet-700",
    GFTI: "from-orange-600 to-orange-700"
  };
  const typeBgColors = {
    IIT: "bg-blue-600/15 text-blue-400 border-blue-500/30",
    NIT: "bg-emerald-600/15 text-emerald-400 border-emerald-500/30",
    IIIT: "bg-violet-600/15 text-violet-400 border-violet-500/30",
    GFTI: "bg-orange-600/15 text-orange-400 border-orange-500/30"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 1) }}
      className="p-5 rounded-xl bg-[#1a1f26] border border-zinc-800/50 hover:border-zinc-700 transition-all group"
      data-testid={`result-card-${index}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${typeColors[prediction.institute_type] || typeColors.GFTI} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <span className="text-white text-xs font-bold">{prediction.institute_type}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-semibold text-sm leading-tight truncate">{prediction.institute}</h4>
            <span className={`inline-flex items-center text-xs px-2 py-0.5 mt-1 rounded border ${typeBgColors[prediction.institute_type] || typeBgColors.GFTI}`}>
              {prediction.institute_type}
            </span>
          </div>
        </div>
        <ChanceBadge chance={prediction.chance} probability={prediction.probability} />
      </div>

      <div className="mb-3">
        <p className="text-zinc-300 text-sm font-medium leading-snug">{prediction.program}</p>
      </div>

      <div className="flex items-center gap-4 text-xs">
        {prediction.quota && (
          <span className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400">{prediction.quota}</span>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <div>
            <span className="text-zinc-500">Open: </span>
            <span className="text-zinc-300 font-mono font-medium">{prediction.opening_rank?.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-zinc-700" />
          <div>
            <span className="text-zinc-500">Close: </span>
            <span className="text-zinc-300 font-mono font-medium">{prediction.closing_rank?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const JEEPage = () => {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const [formData, setFormData] = useState({
    rank: "", seat_type: "OPEN", gender: "Gender-Neutral",
    institute_types: ["IIT", "NIT", "IIIT", "GFTI"], quota: "AI"
  });

  const seatTypes = [
    { value: "OPEN", label: "General" }, { value: "EWS", label: "EWS" },
    { value: "OBC-NCL", label: "OBC-NCL" }, { value: "SC", label: "SC" }, { value: "ST", label: "ST" }
  ];
  const genders = [
    { value: "Gender-Neutral", label: "Gender-Neutral" },
    { value: "Female-only (including Supernumerary)", label: "Female-only (including Supernumerary)" }
  ];
  const quotas = [
    { value: "AI", label: "All India" }, { value: "HS", label: "Home State" }, { value: "OS", label: "Other State" }
  ];

  useEffect(() => {
    axios.get(`${API}/jee/metadata`).then(r => setMetadata(r.data)).catch(console.error);
  }, []);

  const handleInstituteTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      institute_types: prev.institute_types.includes(type)
        ? prev.institute_types.filter(t => t !== type)
        : [...prev.institute_types, type]
    }));
  };

  const handlePredict = async () => {
    if (!formData.rank) return toast.error("Please enter your JEE rank");
    if (formData.institute_types.length === 0) return toast.error("Please select at least one institute type");

    setLoading(true);
    setPredictions(null);
    try {
      const response = await axios.post(`${API}/jee/predict`, {
        rank: parseInt(formData.rank), seat_type: formData.seat_type,
        gender: formData.gender, institute_types: formData.institute_types, quota: formData.quota
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

  const services = [
    { icon: TrendingUp, title: "Rank Analysis & Performance Review", desc: "JEE Main percentile & rank explanation, rank vs college prediction, category & quota based analysis" },
    { icon: BookOpen, title: "College & Branch Selection Guidance", desc: "IIT/NIT/IIIT/GFTI options, branch comparison, top colleges vs safe colleges planning, career-based selection" },
    { icon: Users, title: "JoSAA & State Counselling Support", desc: "Step-by-step registration help, choice filling strategy, mock sessions, seat allotment round guidance" },
    { icon: Target, title: "College Prediction & Safe Options", desc: "Dream/Target/Safe college lists, expected closing rank analysis, backup planning, multiple counselling strategy" },
    { icon: FileText, title: "Career Counselling & Future Planning", desc: "Engineering branch future scope, career paths, placement trend analysis, higher studies vs job planning" },
    { icon: Video, title: "Edu9 YouTube Learning Support", desc: "College review videos, counselling strategy videos, rank analysis explanations, student awareness sessions" },
    { icon: UserCheck, title: "Personal One-to-One Counselling", desc: "Individual counselling sessions, parent + student guidance, doubt clarification, continuous support" },
    { icon: ClipboardCheck, title: "Admission & Documentation Assistance", desc: "Document verification checklist, fee payment guidance, reporting process, admission confirmation support" }
  ];

  const iitCount = metadata?.stats?.iit_count || 23;
  const nitCount = metadata?.stats?.nit_count || 32;
  const iiitCount = metadata?.stats?.iiit_count || 26;
  const gftiCount = metadata?.stats?.gfti_count || 47;
  const totalRecords = metadata?.stats?.total_records || 12122;
  const totalPrograms = metadata?.stats?.total_programs || 253;

  const filtered = getFilteredPredictions();

  return (
    <div className="min-h-screen bg-[#0f1419] relative">
      <ParticleBackground color="59,130,246" particleCount={55} connectionDistance={120} speed={0.3} />
      {/* Header */}
      <header className="border-b border-zinc-800/50 sticky top-0 z-50 bg-[#0f1419]/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">JEE Predictor</span>
                <span className="text-amber-500 text-xs block leading-tight">by edu9 Career Guidance</span>
              </div>
            </Link>
            <Badge className="bg-transparent border border-amber-500/50 text-amber-400 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Official JoSAA 2025 Data
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { t: 20, l: 10, s: 4, c: "bg-blue-500/40", d: 0 },
            { t: 40, l: 20, s: 6, c: "bg-amber-500/40", d: 0.5 },
            { t: 32, l: 80, s: 4, c: "bg-emerald-500/40", d: 1 },
            { t: 60, l: 60, s: 6, c: "bg-purple-500/40", d: 1.5 },
          ].map((p, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${p.c}`}
              style={{ top: `${p.t}%`, left: `${p.l}%`, width: p.s, height: p.s }}
              animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, delay: p.d }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-6xl relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Official JoSAA 2025 Data</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              JEE Main College<br />
              <span className="text-amber-400">Predictor</span>
            </h1>

            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Discover your perfect college match from <span className="text-white font-semibold">{iitCount + nitCount + iiitCount + gftiCount} top institutes</span> (IITs, NITs, IIITs & GFTIs)
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8"
          >
            {[
              { icon: Trophy, count: iitCount, label: "IITs", color: "bg-blue-600" },
              { icon: Award, count: nitCount, label: "NITs", color: "bg-amber-500" },
              { icon: Zap, count: iiitCount, label: "IIITs", color: "bg-emerald-500" },
              { icon: Circle, count: gftiCount, label: "GFTIs", color: "bg-orange-500" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center hover:border-zinc-700 transition-all group"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={s.count} /></div>
                <div className="text-zinc-500 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Mini Stats Row */}
          <div className="flex items-center justify-center gap-8 text-sm mb-12">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-semibold">{totalRecords.toLocaleString()}</span>
              <span className="text-zinc-500">Cutoff Records</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-400 font-semibold">{totalPrograms}</span>
              <span className="text-zinc-500">Programs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-rose-400 font-semibold">100%</span>
              <span className="text-zinc-500">Free</span>
            </div>
          </div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto p-8 rounded-3xl bg-[#1a1f26] border border-zinc-800/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Enter Your Details</h2>
                <p className="text-zinc-500 text-sm">Get personalized college predictions instantly</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">JEE Rank *</label>
                <Input type="number" placeholder="Enter your rank" value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="bg-[#0f1419] border-zinc-800 focus:border-blue-500 text-white placeholder:text-zinc-600 h-12 rounded-xl"
                  data-testid="rank-input" />
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">Category *</label>
                <Select value={formData.seat_type} onValueChange={(v) => setFormData({ ...formData, seat_type: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 focus:border-blue-500 text-white h-12 rounded-xl" data-testid="category-select"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {seatTypes.map(t => <SelectItem key={t.value} value={t.value} className="text-white focus:bg-zinc-800">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">Gender *</label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 focus:border-blue-500 text-white h-12 rounded-xl" data-testid="gender-select"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {genders.map(g => <SelectItem key={g.value} value={g.value} className="text-white focus:bg-zinc-800">{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">Institute Type *</label>
                <div className="flex gap-2">
                  {[
                    { value: "IIT", color: "bg-blue-600 hover:bg-blue-700" },
                    { value: "NIT", color: "bg-emerald-600 hover:bg-emerald-700" },
                    { value: "IIIT", color: "bg-violet-600 hover:bg-violet-700" },
                    { value: "GFTI", color: "bg-rose-600 hover:bg-rose-700" }
                  ].map(type => (
                    <button key={type.value} onClick={() => handleInstituteTypeToggle(type.value)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        formData.institute_types.includes(type.value)
                          ? `${type.color} text-white shadow-lg`
                          : 'bg-[#0f1419] text-zinc-500 border border-zinc-800 hover:border-zinc-700'
                      }`}
                      data-testid={`institute-type-${type.value.toLowerCase()}`}
                    >{type.value}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">Quota *</label>
                <Select value={formData.quota} onValueChange={(v) => setFormData({ ...formData, quota: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 focus:border-blue-500 text-white h-12 rounded-xl" data-testid="quota-select"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {quotas.map(q => <SelectItem key={q.value} value={q.value} className="text-white focus:bg-zinc-800">{q.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePredict} disabled={loading || !formData.rank || formData.institute_types.length === 0}
                className="h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-base disabled:opacity-50 shadow-lg shadow-amber-500/20"
                data-testid="predict-button">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Predicting...</>
                  : <><Sparkles className="mr-2 h-5 w-5" />Predict My Colleges<ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {predictions && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-12">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">
              {/* Summary Stats */}
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

              {/* Filter Tabs */}
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
                    }`}
                    data-testid={`tab-${tab.key}`}
                  >{tab.label}</button>
                ))}
              </div>

              {/* College Cards Grid */}
              <div className="space-y-3">
                {filtered.slice(0, 100).map((prediction, index) => (
                  <CollegeCard key={`${prediction.institute}-${prediction.program}-${index}`} prediction={prediction} index={index} />
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

      {/* How It Works Section */}
      {!predictions && (
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-8">
              <p className="text-zinc-500 text-sm mb-2">How It Works</p>
              <h2 className="text-2xl font-bold text-white">Get Your Predictions in 3 Steps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              {[
                { step: "01", title: "Enter Details", desc: "Your JEE rank, category & preferences" },
                { step: "02", title: "Smart Analysis", desc: `We compare with ${totalRecords.toLocaleString()} cutoff records` },
                { step: "03", title: "Get Results", desc: "See Safe, Good Chance & Reach colleges" }
              ].map((item, i) => (
                <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 hover:border-zinc-700 transition-all">
                  <div className="text-blue-500 text-xs font-bold mb-3">STEP {item.step}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-[#1a1f26] to-[#0f1419] border border-zinc-800/50">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Find Your Dream College?</h3>
              <p className="text-zinc-400 mb-6">Join thousands of students who found their perfect match</p>
              <Button onClick={() => document.querySelector('[data-testid="rank-input"]')?.focus()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-amber-500/20">
                Start Prediction Now<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-16 bg-[#0a0d11]">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-10">
            <p className="text-zinc-500 text-sm mb-2">Our Services</p>
            <h2 className="text-2xl font-bold text-white mb-2">Edu9 Career Guidance Services</h2>
            <p className="text-zinc-400">Comprehensive guidance for JEE Main aspirants at every step of their journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service, index) => (
              <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: index * 0.05 }}
                className="p-5 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 hover:border-zinc-700 transition-all group hover:-translate-y-1">
                <service.icon className="w-8 h-8 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-semibold mb-2 text-sm">{service.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20">
              Book Your Counselling Session<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-6 border-t border-zinc-800/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-500 text-sm">&copy; 2025 Edu9 Career Guidance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default JEEPage;
