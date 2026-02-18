import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  GraduationCap, 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Trophy,
  Award,
  Zap,
  Circle,
  TrendingUp,
  BookOpen,
  Users,
  Target,
  FileText,
  Video,
  UserCheck,
  ClipboardCheck,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Animated Counter
const AnimatedCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  
  return <span>{count.toLocaleString()}</span>;
};

// Probability Badge
const ProbabilityBadge = ({ chance, probability }) => {
  const styles = {
    SAFE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    GOOD: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    REACH: "bg-red-500/20 text-red-400 border-red-500/30"
  };
  const icons = { SAFE: CheckCircle, GOOD: AlertCircle, REACH: XCircle };
  const Icon = icons[chance];
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${styles[chance]}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{chance}</span>
      <span className="opacity-70">({probability}%)</span>
    </div>
  );
};

const JEEPage = () => {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const [formData, setFormData] = useState({
    rank: "",
    seat_type: "OPEN",
    gender: "Gender-Neutral",
    institute_types: ["IIT", "NIT", "IIIT", "GFTI"],
    quota: "AI"
  });

  const seatTypes = [
    { value: "OPEN", label: "General" },
    { value: "EWS", label: "EWS" },
    { value: "OBC-NCL", label: "OBC-NCL" },
    { value: "SC", label: "SC" },
    { value: "ST", label: "ST" }
  ];

  const genders = [
    { value: "Gender-Neutral", label: "Gender-Neutral" },
    { value: "Female-only (including Supernumerary)", label: "Female-only (including Supernumerary)" }
  ];

  const quotas = [
    { value: "AI", label: "All India" },
    { value: "HS", label: "Home State" },
    { value: "OS", label: "Other State" }
  ];

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`${API}/jee/metadata`);
        setMetadata(response.data);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };
    fetchMetadata();
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
    if (!formData.rank) {
      toast.error("Please enter your JEE rank");
      return;
    }
    if (formData.institute_types.length === 0) {
      toast.error("Please select at least one institute type");
      return;
    }

    setLoading(true);
    setPredictions(null);

    try {
      const response = await axios.post(`${API}/jee/predict`, {
        rank: parseInt(formData.rank),
        seat_type: formData.seat_type,
        gender: formData.gender,
        institute_types: formData.institute_types,
        quota: formData.quota
      });

      setPredictions(response.data);
      setActiveTab("all");
      toast.success(`Found ${response.data.total_colleges} college matches!`);
    } catch (error) {
      console.error("Prediction failed:", error);
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
    return filtered;
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

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">JEE Predictor</span>
                <span className="text-amber-500 text-xs block">by edu9 Career Guidance</span>
              </div>
            </Link>
            <Badge className="bg-transparent border border-amber-500/50 text-amber-400 px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              JoSAA 2026
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-8 relative">
        {/* Animated dots background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-1 h-1 bg-blue-500/50 rounded-full animate-pulse" />
          <div className="absolute top-40 left-20 w-1.5 h-1.5 bg-amber-500/50 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
          <div className="absolute top-32 right-20 w-1 h-1 bg-emerald-500/50 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute top-60 right-40 w-1.5 h-1.5 bg-purple-500/50 rounded-full animate-pulse" style={{animationDelay: '1.5s'}} />
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-6xl relative">
          <div className="text-center mb-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Official JoSAA 2025 Data</span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              JEE Main College
              <br />
              <span className="text-amber-400">Predictor</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Discover your perfect college match from <span className="text-white font-semibold">{iitCount + nitCount + iiitCount + gftiCount} top institutes</span> (IITs, NITs, IIITs & GFTIs)
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={iitCount} /></div>
              <div className="text-zinc-500 text-sm">IITs</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={nitCount} /></div>
              <div className="text-zinc-500 text-sm">NITs</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={iiitCount} /></div>
              <div className="text-zinc-500 text-sm">IIITs</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-orange-500 flex items-center justify-center">
                <Circle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={gftiCount} /></div>
              <div className="text-zinc-500 text-sm">GFTIs</div>
            </div>
          </div>

          {/* Mini Stats Row */}
          <div className="flex items-center justify-center gap-8 text-sm mb-12">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-400 font-semibold">{totalRecords.toLocaleString()}</span>
              <span className="text-zinc-500">Cutoff Records</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-blue-400 font-semibold">{totalPrograms}</span>
              <span className="text-zinc-500">Programs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-rose-400 font-semibold">100%</span>
              <span className="text-zinc-500">Free</span>
            </div>
          </div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
              {/* JEE Rank */}
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                  JEE Rank *
                </label>
                <Input
                  type="number"
                  placeholder="Enter your rank"
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="bg-[#0f1419] border-zinc-800 focus:border-blue-500 text-white placeholder:text-zinc-600 h-12 rounded-xl"
                  data-testid="rank-input"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                  Category *
                </label>
                <Select value={formData.seat_type} onValueChange={(value) => setFormData({ ...formData, seat_type: value })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 focus:border-blue-500 text-white h-12 rounded-xl" data-testid="category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {seatTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-white focus:bg-zinc-800">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gender */}
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                  Gender *
                </label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 focus:border-blue-500 text-white h-12 rounded-xl" data-testid="gender-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {genders.map((g) => (
                      <SelectItem key={g.value} value={g.value} className="text-white focus:bg-zinc-800">
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Institute Type */}
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                  Institute Type *
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "IIT", color: "bg-blue-600 hover:bg-blue-700" },
                    { value: "NIT", color: "bg-emerald-600 hover:bg-emerald-700" },
                    { value: "IIIT", color: "bg-violet-600 hover:bg-violet-700" },
                    { value: "GFTI", color: "bg-rose-600 hover:bg-rose-700" }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInstituteTypeToggle(type.value)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        formData.institute_types.includes(type.value)
                          ? `${type.color} text-white`
                          : 'bg-[#0f1419] text-zinc-500 border border-zinc-800 hover:border-zinc-700'
                      }`}
                      data-testid={`institute-type-${type.value.toLowerCase()}`}
                    >
                      {type.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quota */}
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                  Quota *
                </label>
                <Select value={formData.quota} onValueChange={(value) => setFormData({ ...formData, quota: value })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 focus:border-blue-500 text-white h-12 rounded-xl" data-testid="quota-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {quotas.map((q) => (
                      <SelectItem key={q.value} value={q.value} className="text-white focus:bg-zinc-800">
                        {q.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Predict Button */}
              <Button
                onClick={handlePredict}
                disabled={loading || !formData.rank || formData.institute_types.length === 0}
                className="h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-base disabled:opacity-50"
                data-testid="predict-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Predict My Colleges
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {predictions && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-12"
          >
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">
              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-5 rounded-2xl bg-[#1a1f26] border border-zinc-800/50">
                  <div className="text-3xl font-bold text-white">{predictions.total_colleges}</div>
                  <div className="text-zinc-500 text-sm">Total Matches</div>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-3xl font-bold text-emerald-400">{predictions.safe_count}</div>
                  <div className="text-emerald-400/70 text-sm">Safe</div>
                </div>
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-3xl font-bold text-amber-400">{predictions.good_count}</div>
                  <div className="text-amber-400/70 text-sm">Good Chance</div>
                </div>
                <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <div className="text-3xl font-bold text-red-400">{predictions.reach_count}</div>
                  <div className="text-red-400/70 text-sm">Reach</div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full max-w-md mx-auto bg-[#1a1f26] border border-zinc-800/50 p-1 mb-6 rounded-xl" data-testid="results-tabs">
                  <TabsTrigger value="all" className="flex-1 rounded-lg data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
                    All ({predictions.total_colleges})
                  </TabsTrigger>
                  <TabsTrigger value="safe" className="flex-1 rounded-lg data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
                    Safe
                  </TabsTrigger>
                  <TabsTrigger value="good" className="flex-1 rounded-lg data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400">
                    Good
                  </TabsTrigger>
                  <TabsTrigger value="reach" className="flex-1 rounded-lg data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
                    Reach
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  <div className="rounded-2xl border border-zinc-800/50 overflow-hidden bg-[#1a1f26]">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#0f1419] hover:bg-[#0f1419] border-zinc-800/50">
                            <TableHead className="text-zinc-400 font-medium">Institute</TableHead>
                            <TableHead className="text-zinc-400 font-medium">Program</TableHead>
                            <TableHead className="text-zinc-400 font-medium text-center">Quota</TableHead>
                            <TableHead className="text-zinc-400 font-medium text-right">Opening</TableHead>
                            <TableHead className="text-zinc-400 font-medium text-right">Closing</TableHead>
                            <TableHead className="text-zinc-400 font-medium text-center">Chance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredPredictions().slice(0, 100).map((prediction, index) => (
                            <motion.tr
                              key={`${prediction.institute}-${prediction.program}-${index}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.02 }}
                              className="border-zinc-800/50 hover:bg-[#0f1419]/50"
                              data-testid={`result-row-${index}`}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    prediction.institute_type === 'IIT' ? 'bg-blue-600/20 text-blue-400' :
                                    prediction.institute_type === 'NIT' ? 'bg-emerald-600/20 text-emerald-400' :
                                    prediction.institute_type === 'IIIT' ? 'bg-violet-600/20 text-violet-400' :
                                    'bg-orange-600/20 text-orange-400'
                                  }`}>
                                    {prediction.institute_type}
                                  </div>
                                  <span className="text-white text-sm">{prediction.institute}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-zinc-400 text-sm max-w-[300px] truncate">
                                {prediction.program}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400">{prediction.quota}</span>
                              </TableCell>
                              <TableCell className="text-right text-zinc-300 font-mono text-sm">
                                {prediction.opening_rank.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-zinc-300 font-mono text-sm">
                                {prediction.closing_rank.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-center">
                                <ProbabilityBadge chance={prediction.chance} probability={prediction.probability} />
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {getFilteredPredictions().length > 100 && (
                      <div className="p-4 text-center text-zinc-500 text-sm border-t border-zinc-800/50">
                        Showing top 100 results out of {getFilteredPredictions().length}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
              ].map((item) => (
                <div key={item.step} className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50">
                  <div className="text-blue-500 text-xs font-bold mb-3">STEP {item.step}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-[#1a1f26] to-[#0f1419] border border-zinc-800/50">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Find Your Dream College?</h3>
              <p className="text-zinc-400 mb-6">Join thousands of students who found their perfect match</p>
              <Button 
                onClick={() => document.querySelector('[data-testid="rank-input"]')?.focus()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-3 rounded-xl"
              >
                Start Prediction Now
                <ArrowRight className="ml-2 h-4 w-4" />
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
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-5 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 hover:border-zinc-700 transition-all"
              >
                <service.icon className="w-8 h-8 text-amber-500 mb-4" />
                <h3 className="text-white font-semibold mb-2 text-sm">{service.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl">
              Book Your Counselling Session
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-800/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-500 text-sm">© 2025 Edu9 Career Guidance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default JEEPage;
