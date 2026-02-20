import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Youtube } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap, Search, Loader2, CheckCircle, AlertCircle,
  XCircle, Trophy, Award, Zap, Circle, TrendingUp, BookOpen,
  Users, Target, FileText, Video, UserCheck, ClipboardCheck,
  ArrowRight, Sparkles, Filter, LayoutList, LayoutGrid
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import ParticleBackground from "@/components/ParticleBackground";
import { ResultsHeader } from "@/components/CollegeCard";
import Services from "@/components/homepage/Services";

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

const ChanceBadge = ({ chance }) => {
  const config = {
    SAFE: { bg: "bg-emerald-500", label: "SAFE" },
    GOOD: { bg: "bg-amber-500", label: "GOOD CHANCE" },
    REACH: { bg: "bg-orange-500", label: "REACH" }
  };
  const c = config[chance];
  return (
    <span className={`${c.bg} text-white text-xs font-bold px-3 py-1.5 rounded-lg`} data-testid={`chance-badge-${chance.toLowerCase()}`}>
      {c.label}
    </span>
  );
};

const CollegeCard = ({ prediction, index, userRank }) => {
  const borderColors = {
    SAFE: "border-l-emerald-500",
    GOOD: "border-l-amber-500",
    REACH: "border-l-orange-500"
  };
  const typeColors = {
    IIT: "bg-blue-600",
    NIT: "bg-emerald-600",
    IIIT: "bg-violet-600",
    GFTI: "bg-orange-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.9) }}
      className={`rounded-xl bg-[#141922] border border-zinc-800/50 overflow-hidden border-l-4 ${borderColors[prediction.chance]}`}
      data-testid={`result-card-${index}`}
    >
      {/* Top Section: Institute + Chance Badge */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white/80" />
            </div>
            <div>
              {prediction.institute_type && (
                <span className={`${typeColors[prediction.institute_type] || 'bg-zinc-600'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mb-1`}>
                  {prediction.institute_type}
                </span>
              )}
              <h4 className="text-white font-semibold text-sm leading-tight">{prediction.institute}</h4>
            </div>
          </div>
          <ChanceBadge chance={prediction.chance} />
        </div>
      </div>

      {/* Branch */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1a1f28] border border-zinc-800/40">
          <BookOpen className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <span className="text-zinc-300 text-sm">{prediction.program || prediction.branch}</span>
        </div>
      </div>

      {/* Rank Boxes */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#151b28] rounded-lg p-3 text-center border border-[#2a3040]">
            <div className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-1">Opening</div>
            <div className="text-white font-bold text-base font-mono">{Math.max(0, prediction.opening_rank).toLocaleString()}</div>
          </div>
          <div className="bg-[#151b28] rounded-lg p-3 text-center border border-[#2a3040]">
            <div className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-1">Closing</div>
            <div className="text-white font-bold text-base font-mono">{Math.max(0, prediction.closing_rank).toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-violet-900/50 to-blue-900/50 rounded-lg p-3 text-center border border-violet-500/20">
            <div className="text-violet-300 text-[10px] font-medium uppercase tracking-wider mb-1">Your Rank</div>
            <div className="text-violet-200 font-bold text-base font-mono">{Math.max(0, userRank).toLocaleString()}</div>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const branchDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    rank: "", seat_type: "OPEN", gender: "Gender-Neutral",
    institute_types: ["IIT", "NIT", "IIIT", "GFTI"], quota: "AI"
  });

  const seatTypes = [
    { value: "OPEN", label: "General" }, { value: "OPEN (PwD)", label: "General (PwD)" },
    { value: "OBC-NCL", label: "OBC-NCL" }, { value: "OBC-NCL (PwD)", label: "OBC-NCL (PwD)" },
    { value: "SC", label: "SC" }, { value: "SC (PwD)", label: "SC (PwD)" },
    { value: "ST", label: "ST" }, { value: "ST (PwD)", label: "ST (PwD)" },
    { value: "EWS", label: "EWS" }, { value: "EWS (PwD)", label: "EWS (PwD)" }
  ];
  const genders = [
    { value: "Gender-Neutral", label: "Gender-Neutral" },
    { value: "Female-only (including Supernumerary)", label: "Female-only (including Supernumerary)" }
  ];

  // Get available quotas based on selected institute types
  const getAvailableQuotas = () => {
    const types = formData.institute_types;
    const hasIIT = types.includes("IIT");
    const hasIIIT = types.includes("IIIT");
    const hasNIT = types.includes("NIT");
    const hasGFTI = types.includes("GFTI");

    // If only IIT and/or IIIT selected -> Only All India
    if ((hasIIT || hasIIIT) && !hasNIT && !hasGFTI) {
      return [{ value: "AI", label: "All India" }];
    }
    // If only NIT selected -> Home State and Other State
    if (hasNIT && !hasIIT && !hasIIIT && !hasGFTI) {
      return [
        { value: "HS", label: "Home State" },
        { value: "OS", label: "Other State" }
      ];
    }
    // If only GFTI selected -> All India, Home State, Other State
    if (hasGFTI && !hasIIT && !hasIIIT && !hasNIT) {
      return [
        { value: "AI", label: "All India" },
        { value: "HS", label: "Home State" },
        { value: "OS", label: "Other State" }
      ];
    }
    // Mixed selection or multiple types -> Show all options
    return [
      { value: "AI", label: "All India" },
      { value: "HS", label: "Home State" },
      { value: "OS", label: "Other State" }
    ];
  };

  const availableQuotas = getAvailableQuotas();

  // Auto-update quota when institute types change
  useEffect(() => {
    const quotaValues = availableQuotas.map(q => q.value);
    if (!quotaValues.includes(formData.quota)) {
      setFormData(prev => ({ ...prev, quota: quotaValues[0] || "AI" }));
    }
  }, [formData.institute_types]);

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
      setSearchQuery("");
      setSelectedBranches([]);
      toast.success(`Found ${response.data.total_colleges} college matches!`);
    } catch (error) {
      toast.error("Failed to get predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPredictions = () => {
    if (!predictions) return [];
    let filtered = predictions.predictions;
    if (activeTab === "safe") filtered = filtered.filter(p => p.chance === "SAFE");
    else if (activeTab === "good") filtered = filtered.filter(p => p.chance === "GOOD");
    else if (activeTab === "reach") filtered = filtered.filter(p => p.chance === "REACH");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        (p.institute || "").toLowerCase().includes(q) ||
        (p.program || "").toLowerCase().includes(q)
      );
    }
    if (selectedBranches.length > 0) {
      filtered = filtered.filter(p => selectedBranches.includes(p.program));
    }
    return filtered;
  };

  // Extract unique programs for branch filter
  const allBranches = useMemo(() => {
    if (!predictions?.predictions) return [];
    return [...new Set(predictions.predictions.map(p => p.program).filter(Boolean))].sort();
  }, [predictions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target)) setBranchDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleBranch = (branch) => {
    setSelectedBranches(prev =>
      prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]
    );
  };

  const handleReset = () => {
    setPredictions(null);
    setActiveTab("all");
    setSearchQuery("");
    setSelectedBranches([]);
    setFormData({ ...formData, rank: "" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  const quotaLabel = { AI: "All India", HS: "Home State", OS: "Other State" }[formData.quota] || formData.quota;

  return (
    <div className="min-h-screen bg-[#131820] relative">
      <ParticleBackground color="59,130,246" particleCount={55} connectionDistance={120} speed={0.3} />
      {/* Header */}
      <header className="border-b border-[#2a3040] sticky top-0 z-50 bg-[#131820]/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors" data-testid="back-btn">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </Link>
              <Link to="/" className="flex items-center gap-3">
                <motion.img
                  src="/edu9-logo.jpg"
                  alt="Edu9"
                  className="h-10 w-auto rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <div>
                  <span className="font-bold text-white text-lg">JEE Predictor</span>
                  <span className="text-amber-500 text-xs block leading-tight">by Edu9 Career Guidance</span>
                </div>
              </Link>
            </div>
            <Badge className="bg-transparent border border-amber-500/50 text-amber-400 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              JoSAA 2026
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-8 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Official JoSAA 2025 Data</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              JEE Main College<br /><span className="text-amber-400">Predictor</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Discover your perfect college match from <span className="text-white font-semibold">{iitCount + nitCount + iiitCount + gftiCount} top institutes</span> (IITs, NITs, IIITs & GFTIs)
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
            {[
              { icon: Trophy, count: iitCount, label: "IITs", color: "bg-blue-600" },
              { icon: Award, count: nitCount, label: "NITs", color: "bg-amber-500" },
              { icon: Zap, count: iiitCount, label: "IIITs", color: "bg-emerald-500" },
              { icon: Circle, count: gftiCount, label: "GFTIs", color: "bg-orange-500" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center group hover:border-zinc-700 transition-all">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={s.count} /></div>
                <div className="text-zinc-500 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex items-center justify-center gap-8 text-sm mb-12">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-emerald-400 font-semibold">{totalRecords.toLocaleString()}</span><span className="text-zinc-500">Cutoff Records</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /><span className="text-blue-400 font-semibold">{totalPrograms}</span><span className="text-zinc-500">Programs</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /><span className="text-rose-400 font-semibold">100%</span><span className="text-zinc-500">Free</span></div>
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto p-8 rounded-3xl bg-[#1a1f26] border border-zinc-800/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center"><Search className="w-5 h-5 text-blue-400" /></div>
              <div><h2 className="text-white font-semibold text-lg">Enter Your Details</h2><p className="text-zinc-500 text-sm">Get personalized college predictions instantly</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">JEE Rank *</label>
                <Input type="number" min="1" placeholder="Enter your rank" value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value.replace(/^-/, '') })}
                  className="bg-[#0f1419] border-zinc-800 focus:border-blue-500 text-white placeholder:text-zinc-600 h-12 rounded-xl" data-testid="rank-input" />
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">Category *</label>
                <Select value={formData.seat_type} onValueChange={(v) => setFormData({ ...formData, seat_type: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="category-select"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {seatTypes.map(t => <SelectItem key={t.value} value={t.value} className="text-white focus:bg-zinc-800">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">Gender *</label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="gender-select"><SelectValue /></SelectTrigger>
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
                          ? `${type.color} text-white shadow-lg` : 'bg-[#0f1419] text-zinc-500 border border-zinc-800 hover:border-zinc-700'
                      }`} data-testid={`institute-type-${type.value.toLowerCase()}`}>{type.value}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">Quota *</label>
                <Select value={formData.quota} onValueChange={(v) => setFormData({ ...formData, quota: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="quota-select"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {availableQuotas.map(q => <SelectItem key={q.value} value={q.value} className="text-white focus:bg-zinc-800">{q.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePredict} disabled={loading || !formData.rank || formData.institute_types.length === 0}
                className="h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-base shadow-lg shadow-amber-500/20"
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
            <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
              <ResultsHeader predictions={predictions} formData={formData}
                activeTab={activeTab} setActiveTab={setActiveTab}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                selectedBranches={selectedBranches} setSelectedBranches={setSelectedBranches}
                onReset={handleReset} accentColor="blue" />

              <p className="text-zinc-500 text-sm mb-4">
                Showing <span className="text-white font-semibold">{Math.min(filtered.length, 100)}</span> of {filtered.length} colleges
              </p>

              {/* College Cards */}
              <div className="space-y-4">
                {filtered.slice(0, 100).map((prediction, index) => (
                  <CollegeCard key={`${prediction.institute}-${prediction.program}-${index}`}
                    prediction={prediction} index={index} userRank={parseInt(formData.rank)} />
                ))}
              </div>
              {filtered.length > 100 && (
                <div className="mt-4 p-4 text-center text-zinc-500 text-sm rounded-xl bg-[#141922] border border-zinc-800/50">
                  Showing top 100 results out of {filtered.length}
                </div>
              )}
              {filtered.length === 0 && (
                <div className="p-12 text-center text-zinc-500 rounded-xl bg-[#141922] border border-zinc-800/50">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No colleges found</p>
                  <p className="text-sm mt-1">Try changing filters or search query</p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* How It Works */}
      {!predictions && (
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
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
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg">
                Start Prediction Now<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

    

      {/* Services Section */}
      <Services />

     {/* ================= FULL EDU9 FOOTER ================= */}
<footer className="border-t border-[#2a3040] bg-[#111720] relative z-10">
  <div className="container mx-auto px-4 md:px-6 max-w-7xl py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

      {/* Company Info */}
      <div className="md:col-span-2">
        <Link to="/" className="flex items-center gap-3 mb-4">
          <img
            src="/edu9-logo.jpg"
            alt="Edu9 Career Guidance"
            className="h-12 w-auto rounded-lg"
          />
          <div>
            <span className="font-bold text-xl text-[#f5c842]">Edu9</span>
            <span className="block text-sm text-zinc-400">
              Career Guidance
            </span>
          </div>
        </Link>

        <p className="text-zinc-400 text-sm leading-relaxed mb-4 max-w-md">
          College predictions for JEE, TGEAPCET, APEAPCET & COMEDK.
          Find your dream college with accurate cutoff analysis.
        </p>

        <p className="text-zinc-400 text-sm leading-relaxed">
          Unit No 1312, 12th Floor,<br />
          Vasavi MPM Grand,<br />
          Ameerpet, Hyderabad – 500073
        </p>

        {/* Social Icons */}
        <div className="flex gap-4 mt-4">
          <a href="#" className="text-zinc-400 hover:text-white transition">
            <Facebook size={18} />
          </a>
          <a href="#" className="text-zinc-400 hover:text-white transition">
            <Instagram size={18} />
          </a>
          <a href="#" className="text-zinc-400 hover:text-white transition">
            <Youtube size={18} />
          </a>
        </div>
      </div>

      {/* Predictors */}
      <div>
        <h4 className="font-semibold text-white mb-4">Predictors</h4>
        <ul className="space-y-2 text-sm">
          <li>
            <Link to="/jee" className="text-zinc-400 hover:text-white transition">
              JEE Main
            </Link>
          </li>
          <li>
            <Link to="/tgeapcet" className="text-zinc-400 hover:text-white transition">
              TGEAPCET
            </Link>
          </li>
          <li>
            <Link to="/apeapcet" className="text-zinc-400 hover:text-white transition">
              APEAPCET
            </Link>
          </li>
          <li>
            <Link to="/comedk" className="text-zinc-400 hover:text-white transition">
              COMEDK
            </Link>
          </li>
        </ul>
      </div>

      {/* Contact + CTA */}
      <div>
        <h4 className="font-semibold text-white mb-4">Contact</h4>
        <ul className="space-y-2 text-sm text-zinc-400 mb-6">
          <li>
            <a href="tel:9133311450" className="hover:text-white transition">
              9133311450
            </a>
          </li>
          <li>
            <a href="mailto:info@edu9.in" className="hover:text-white transition">
              info@edu9.in
            </a>
          </li>
        </ul>

        {/* CTA Section */}
        <div>
          <h3 className="text-lg font-bold mb-3 text-white">
            Get Counselling
          </h3>
          <p className="text-zinc-400 text-sm mb-4">
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
    </div>

    {/* Bottom Line */}
    <div className="border-t border-[#2a3040] mt-8 pt-8 text-center text-zinc-500 text-sm">
      &copy; {new Date().getFullYear()} Edu9 Career Guidance. All rights reserved.
    </div>
  </div>
</footer>

export default JEEPage;
