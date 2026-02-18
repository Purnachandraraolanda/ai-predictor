import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Building2,
  ArrowUpDown,
  TrendingUp,
  BookOpen,
  Users,
  Award,
  FileText,
  Video,
  UserCheck,
  ClipboardCheck,
  ArrowRight
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
  
  return <span className="font-['JetBrains_Mono']">{count.toLocaleString()}</span>;
};

// Probability Badge
const ProbabilityBadge = ({ chance, probability }) => {
  const styles = {
    SAFE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    GOOD: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    REACH: "bg-red-500/10 text-red-500 border-red-500/20"
  };
  const icons = { SAFE: CheckCircle, GOOD: AlertCircle, REACH: XCircle };
  const Icon = icons[chance];
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium ${styles[chance]}`}>
      <Icon className="w-3 h-3" />
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
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

  const instituteTypes = [
    { value: "IIT", label: "IIT" },
    { value: "NIT", label: "NIT" },
    { value: "IIIT", label: "IIIT" },
    { value: "GFTI", label: "GFTI" }
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

  const handleInstituteTypeChange = (type, checked) => {
    setFormData(prev => ({
      ...prev,
      institute_types: checked 
        ? [...prev.institute_types, type]
        : prev.institute_types.filter(t => t !== type)
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
    
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const services = [
    { icon: TrendingUp, title: "Rank Analysis & Performance Review", desc: "JEE Main percentile & rank explanation, rank vs college prediction, category & quota based analysis" },
    { icon: BookOpen, title: "College & Branch Selection Guidance", desc: "IIT/NIT/IIIT/GFTI options, branch comparison, top colleges vs safe colleges planning" },
    { icon: Users, title: "JoSAA & State Counselling Support", desc: "Step-by-step registration help, choice filling strategy, mock sessions, seat allotment round guidance" },
    { icon: Award, title: "College Prediction & Safe Options", desc: "Dream/Target/Safe college lists, expected closing rank analysis, backup planning" },
    { icon: FileText, title: "Career Counselling & Future Planning", desc: "Engineering branch future scope, career paths, placement trend analysis" },
    { icon: Video, title: "Edu9 YouTube Learning Support", desc: "College review videos, counselling strategy videos, rank analysis explanations" },
    { icon: UserCheck, title: "Personal One-to-One Counselling", desc: "Individual counselling sessions, parent + student guidance, doubt clarification" },
    { icon: ClipboardCheck, title: "Admission & Documentation Assistance", desc: "Document verification checklist, fee payment guidance, reporting process" }
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 md:pt-28 md:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-500/30 px-4 py-1.5" data-testid="official-badge">
              Official JoSAA 2025 Data
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-50 mb-4 font-['Outfit']" data-testid="page-title">
              JEE Main College <span className="text-blue-500">Predictor</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Discover your perfect college match from {metadata?.stats?.iit_count || 23} IITs, {metadata?.stats?.nit_count || 32} NITs, {metadata?.stats?.iiit_count || 26} IIITs & {metadata?.stats?.gfti_count || 47} GFTIs
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12" data-testid="stats-row">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
              <div className="text-2xl font-bold text-blue-500"><AnimatedCounter end={metadata?.stats?.iit_count || 23} /></div>
              <div className="text-zinc-400 text-xs">IITs</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
              <div className="text-2xl font-bold text-blue-500"><AnimatedCounter end={metadata?.stats?.nit_count || 32} /></div>
              <div className="text-zinc-400 text-xs">NITs</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
              <div className="text-2xl font-bold text-blue-500"><AnimatedCounter end={metadata?.stats?.iiit_count || 26} /></div>
              <div className="text-zinc-400 text-xs">IIITs</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
              <div className="text-2xl font-bold text-blue-500"><AnimatedCounter end={metadata?.stats?.gfti_count || 47} /></div>
              <div className="text-zinc-400 text-xs">GFTIs</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
              <div className="text-2xl font-bold text-zinc-50"><AnimatedCounter end={metadata?.stats?.total_records || 12122} /></div>
              <div className="text-zinc-400 text-xs">Cutoff Records</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
              <div className="text-2xl font-bold text-zinc-50"><AnimatedCounter end={metadata?.stats?.total_programs || 180} /></div>
              <div className="text-zinc-400 text-xs">Programs</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
              <div className="text-2xl font-bold text-emerald-500">100%</div>
              <div className="text-zinc-400 text-xs">Free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Section */}
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm"
              >
                <h2 className="text-lg font-semibold text-zinc-50 mb-2 font-['Outfit']">Enter Your Details</h2>
                <p className="text-zinc-400 text-sm mb-6">Get personalized college predictions instantly</p>

                <div className="space-y-5">
                  {/* Rank Input */}
                  <div className="space-y-2">
                    <Label htmlFor="rank" className="text-zinc-300">JEE Rank *</Label>
                    <Input
                      id="rank"
                      type="number"
                      placeholder="Enter your JEE rank"
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 focus:border-blue-600 focus:ring-blue-600 text-zinc-100 placeholder:text-zinc-600"
                      data-testid="rank-input"
                    />
                  </div>

                  {/* Category/Seat Type Select */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Category *</Label>
                    <Select
                      value={formData.seat_type}
                      onValueChange={(value) => setFormData({ ...formData, seat_type: value })}
                    >
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 focus:border-blue-600 text-zinc-100" data-testid="category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {seatTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-zinc-100 focus:bg-zinc-800">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gender Select */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 focus:border-blue-600 text-zinc-100" data-testid="gender-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {genders.map((g) => (
                          <SelectItem key={g.value} value={g.value} className="text-zinc-100 focus:bg-zinc-800">
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Institute Types */}
                  <div className="space-y-3">
                    <Label className="text-zinc-300">Institute Type *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {instituteTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.institute_types.includes(type.value)
                              ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <Checkbox
                            checked={formData.institute_types.includes(type.value)}
                            onCheckedChange={(checked) => handleInstituteTypeChange(type.value, checked)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quota Select */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Quota *</Label>
                    <Select
                      value={formData.quota}
                      onValueChange={(value) => setFormData({ ...formData, quota: value })}
                    >
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 focus:border-blue-600 text-zinc-100" data-testid="quota-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {quotas.map((q) => (
                          <SelectItem key={q.value} value={q.value} className="text-zinc-100 focus:bg-zinc-800">
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
                    className="w-full gold-btn text-zinc-950 font-bold py-6 text-base rounded-lg border-0 hover:scale-[1.02] transition-transform disabled:opacity-50"
                    data-testid="predict-button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Predict My Colleges
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {!predictions && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    data-testid="empty-state"
                  >
                    {/* How It Works */}
                    <div className="mb-12">
                      <h2 className="text-xl font-semibold text-zinc-50 mb-2 font-['Outfit']">How It Works</h2>
                      <p className="text-zinc-400 text-sm mb-6">Get Your Predictions in 3 Steps</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { step: "01", title: "Enter Details", desc: "Your JEE rank, category & preferences" },
                          { step: "02", title: "Smart Analysis", desc: `We compare with ${metadata?.stats?.total_records || '12,122'} cutoff records` },
                          { step: "03", title: "Get Results", desc: "See Safe, Good Chance & Reach colleges" }
                        ].map((item) => (
                          <div key={item.step} className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <div className="text-blue-500 text-xs font-bold mb-2">STEP {item.step}</div>
                            <h3 className="text-zinc-50 font-semibold mb-1">{item.title}</h3>
                            <p className="text-zinc-400 text-sm">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-blue-950/30 to-zinc-900/50 border border-zinc-800 mb-12">
                      <h3 className="text-2xl font-semibold text-zinc-50 mb-2 font-['Outfit']">Ready to Find Your Dream College?</h3>
                      <p className="text-zinc-400 mb-6">Join thousands of students who found their perfect match</p>
                      <Button 
                        onClick={() => document.getElementById('rank')?.focus()}
                        className="gold-btn text-zinc-950 font-bold px-8 py-3 rounded-lg border-0"
                      >
                        Start Prediction Now
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-96"
                    data-testid="loading-state"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-zinc-800 border-t-blue-600 animate-spin" />
                      <GraduationCap className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-zinc-400 mt-6 font-medium">Analyzing {metadata?.stats?.total_records || '12,122'} cutoff records...</p>
                  </motion.div>
                )}

                {predictions && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    data-testid="results-section"
                  >
                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                        <div className="text-2xl font-bold text-zinc-50 font-['JetBrains_Mono']">{predictions.total_colleges}</div>
                        <div className="text-zinc-400 text-sm">Total Matches</div>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="text-2xl font-bold text-emerald-500 font-['JetBrains_Mono']">{predictions.safe_count}</div>
                        <div className="text-emerald-400/70 text-sm">Safe</div>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="text-2xl font-bold text-amber-500 font-['JetBrains_Mono']">{predictions.good_count}</div>
                        <div className="text-amber-400/70 text-sm">Good Chance</div>
                      </div>
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="text-2xl font-bold text-red-500 font-['JetBrains_Mono']">{predictions.reach_count}</div>
                        <div className="text-red-400/70 text-sm">Reach</div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1 mb-4" data-testid="results-tabs">
                        <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">
                          All ({predictions.total_colleges})
                        </TabsTrigger>
                        <TabsTrigger value="safe" className="flex-1 data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
                          Safe ({predictions.safe_count})
                        </TabsTrigger>
                        <TabsTrigger value="good" className="flex-1 data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400">
                          Good ({predictions.good_count})
                        </TabsTrigger>
                        <TabsTrigger value="reach" className="flex-1 data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">
                          Reach ({predictions.reach_count})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value={activeTab} className="mt-0">
                        <div className="rounded-xl border border-zinc-800 overflow-hidden">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-zinc-900/50 hover:bg-zinc-900/50 border-zinc-800">
                                  <TableHead className="text-zinc-400 font-medium">
                                    <button className="flex items-center gap-1 hover:text-zinc-200" onClick={() => handleSort('institute')}>
                                      Institute <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                  </TableHead>
                                  <TableHead className="text-zinc-400 font-medium">Program</TableHead>
                                  <TableHead className="text-zinc-400 font-medium text-center">Quota</TableHead>
                                  <TableHead className="text-zinc-400 font-medium text-right">
                                    <button className="flex items-center gap-1 hover:text-zinc-200 ml-auto" onClick={() => handleSort('opening_rank')}>
                                      Opening <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                  </TableHead>
                                  <TableHead className="text-zinc-400 font-medium text-right">
                                    <button className="flex items-center gap-1 hover:text-zinc-200 ml-auto" onClick={() => handleSort('closing_rank')}>
                                      Closing <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                  </TableHead>
                                  <TableHead className="text-zinc-400 font-medium text-center">Chance</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getFilteredPredictions().slice(0, 100).map((prediction, index) => (
                                  <motion.tr
                                    key={`${prediction.institute}-${prediction.program}-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="border-zinc-800 hover:bg-zinc-900/30"
                                    data-testid={`result-row-${index}`}
                                  >
                                    <TableCell className="font-medium">
                                      <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                          prediction.institute_type === 'IIT' ? 'bg-blue-600/20 text-blue-500' :
                                          prediction.institute_type === 'NIT' ? 'bg-emerald-600/20 text-emerald-500' :
                                          prediction.institute_type === 'IIIT' ? 'bg-violet-600/20 text-violet-500' :
                                          'bg-orange-600/20 text-orange-500'
                                        }`}>
                                          <span className="text-xs font-bold">{prediction.institute_type}</span>
                                        </div>
                                        <div>
                                          <div className="text-zinc-100 font-medium text-sm">{prediction.institute}</div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-300 text-sm max-w-[250px]">
                                      <div className="truncate" title={prediction.program}>{prediction.program}</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">{prediction.quota}</span>
                                    </TableCell>
                                    <TableCell className="text-right text-zinc-300 font-['JetBrains_Mono'] text-sm">
                                      {prediction.opening_rank.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right text-zinc-300 font-['JetBrains_Mono'] text-sm">
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
                            <div className="p-4 text-center text-zinc-500 text-sm border-t border-zinc-800">
                              Showing top 100 results out of {getFilteredPredictions().length}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-zinc-900/30">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-zinc-800 text-zinc-300 border-zinc-700">Our Services</Badge>
            <h2 className="text-3xl font-semibold text-zinc-50 mb-2 font-['Outfit']">Edu9 Career Guidance Services</h2>
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
                className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                <service.icon className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="text-zinc-50 font-semibold mb-2 text-sm">{service.title}</h3>
                <p className="text-zinc-500 text-xs">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JEEPage;
