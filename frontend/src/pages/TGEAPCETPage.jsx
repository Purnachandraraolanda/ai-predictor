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
  Building,
  BookOpen,
  Users,
  Database,
  ArrowRight,
  Sparkles,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

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

const TGEAPCETPage = () => {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const [formData, setFormData] = useState({
    rank: "",
    category: "OC",
    gender: "M",
    district: "all",
    branch: "all"
  });

  const categories = [
    { value: "OC", label: "OC (Open Category)" },
    { value: "BC_A", label: "BC-A" },
    { value: "BC_B", label: "BC-B" },
    { value: "BC_C", label: "BC-C" },
    { value: "BC_D", label: "BC-D" },
    { value: "BC_E", label: "BC-E" },
    { value: "SC_I", label: "SC-I" },
    { value: "SC_II", label: "SC-II" },
    { value: "SC_III", label: "SC-III" },
    { value: "ST", label: "ST" },
    { value: "EWS", label: "EWS" }
  ];

  const genders = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" }
  ];

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`${API}/tgeapcet/metadata`);
        setMetadata(response.data);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };
    fetchMetadata();
  }, []);

  const handlePredict = async () => {
    if (!formData.rank) {
      toast.error("Please enter your TGEAPCET rank");
      return;
    }

    setLoading(true);
    setPredictions(null);

    try {
      const response = await axios.post(`${API}/tgeapcet/predict`, {
        rank: parseInt(formData.rank),
        category: formData.category,
        gender: formData.gender,
        district: formData.district === "all" ? null : formData.district,
        branch: formData.branch === "all" ? null : formData.branch
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

  const stats = metadata?.stats || { university_count: 22, college_count: 179, branch_count: 50, total_records: 13744 };

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Edu9 Career Guidance</span>
            </Link>
            <Badge className="bg-transparent border border-rose-500/50 text-rose-400 px-4 py-1.5 rounded-full">
              TGEAPCET 2026
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-1 h-1 bg-emerald-500/50 rounded-full animate-pulse" />
          <div className="absolute top-40 left-[15%] w-1.5 h-1.5 bg-violet-500/50 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
          <div className="absolute top-32 right-[15%] w-1 h-1 bg-rose-500/50 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute top-60 right-[20%] w-1 h-1 bg-cyan-500/50 rounded-full animate-pulse" style={{animationDelay: '1.5s'}} />
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-6xl relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-rose-400 text-sm font-medium">Official TGEAPCET 2025 Data</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">TGEAPCET College</span>
              <br />
              <span className="text-white">Predictor</span>
            </h1>
            
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Discover your perfect college match from <span className="text-white font-semibold">{stats.college_count}</span> top institutes across Telangana with <span className="text-white font-semibold">{stats.branch_count}</span> branches
            </p>
          </div>

          {/* Stats Cards - Exact match to reference */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Building className="w-6 h-6 text-violet-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={22} /></div>
              <div className="text-zinc-500 text-sm">Universities</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={stats.college_count} /></div>
              <div className="text-zinc-500 text-sm">Engineering Colleges</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={stats.branch_count} /></div>
              <div className="text-zinc-500 text-sm">Branches</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-rose-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={stats.total_records} /></div>
              <div className="text-zinc-500 text-sm">Cutoff Records</div>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="flex items-center justify-center gap-6 text-sm mb-16">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-400">100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-zinc-400">Real Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <span className="text-zinc-400">Instant Results</span>
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-8 rounded-3xl bg-[#1a1f26] border border-zinc-800/50"
          >
            <h2 className="text-xl font-semibold text-white mb-6 text-center">Enter Your Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                  TGEAPCET Rank *
                </label>
                <Input
                  type="number"
                  placeholder="Enter your rank"
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl"
                  data-testid="rank-input"
                />
              </div>

              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                  Category *
                </label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-white focus:bg-zinc-800">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                  Gender *
                </label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="gender-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {genders.map((g) => (
                      <SelectItem key={g.value} value={g.value} className="text-white focus:bg-zinc-800">{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                  Branch (Optional)
                </label>
                <Select value={formData.branch} onValueChange={(v) => setFormData({ ...formData, branch: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="branch-select">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800 max-h-60">
                    <SelectItem value="all" className="text-white focus:bg-zinc-800">All Branches</SelectItem>
                    {metadata?.branches?.map((b) => (
                      <SelectItem key={b} value={b} className="text-white focus:bg-zinc-800">{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">
                  District (Optional)
                </label>
                <Select value={formData.district} onValueChange={(v) => setFormData({ ...formData, district: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="district-select">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800 max-h-60">
                    <SelectItem value="all" className="text-white focus:bg-zinc-800">All Districts</SelectItem>
                    {metadata?.districts?.map((d) => (
                      <SelectItem key={d} value={d} className="text-white focus:bg-zinc-800">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handlePredict}
              disabled={loading || !formData.rank}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-base"
              data-testid="predict-button"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Predicting...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" />Predict My Colleges<ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <AnimatePresence mode="wait">
        {predictions && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">
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

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full max-w-md mx-auto bg-[#1a1f26] border border-zinc-800/50 p-1 mb-6 rounded-xl">
                  <TabsTrigger value="all" className="flex-1 rounded-lg data-[state=active]:bg-zinc-700">All ({predictions.total_colleges})</TabsTrigger>
                  <TabsTrigger value="safe" className="flex-1 rounded-lg data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">Safe</TabsTrigger>
                  <TabsTrigger value="good" className="flex-1 rounded-lg data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400">Good</TabsTrigger>
                  <TabsTrigger value="reach" className="flex-1 rounded-lg data-[state=active]:bg-red-600/20 data-[state=active]:text-red-400">Reach</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  <div className="rounded-2xl border border-zinc-800/50 overflow-hidden bg-[#1a1f26]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#0f1419] border-zinc-800/50">
                          <TableHead className="text-zinc-400">Institute</TableHead>
                          <TableHead className="text-zinc-400">Branch</TableHead>
                          <TableHead className="text-zinc-400 text-center">District</TableHead>
                          <TableHead className="text-zinc-400 text-right">Opening</TableHead>
                          <TableHead className="text-zinc-400 text-right">Closing</TableHead>
                          <TableHead className="text-zinc-400 text-center">Chance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredPredictions().slice(0, 100).map((p, i) => (
                          <TableRow key={i} className="border-zinc-800/50 hover:bg-[#0f1419]/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                  <div className="text-white text-sm font-medium">{p.institute}</div>
                                  <div className="text-zinc-500 text-xs">{p.institute_code}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-zinc-400 text-sm">{p.branch}</TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                                <MapPin className="w-3 h-3" />{p.district}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-zinc-300 font-mono text-sm">{p.opening_rank?.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-zinc-300 font-mono text-sm">{p.closing_rank?.toLocaleString()}</TableCell>
                            <TableCell className="text-center"><ProbabilityBadge chance={p.chance} probability={p.probability} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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

      {/* How It Works */}
      {!predictions && (
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <h2 className="text-2xl font-bold text-white text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              {[
                { step: "01", title: "Enter Details", desc: "Input your TGEAPCET rank, category, and gender" },
                { step: "02", title: "Smart Analysis", desc: `We compare with ${stats.total_records.toLocaleString()} cutoff records` },
                { step: "03", title: "Get Results", desc: "See Safe, Good Chance & Reach colleges" }
              ].map((item) => (
                <div key={item.step} className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
                  <div className="text-emerald-500 text-4xl font-bold mb-3">{item.step}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-[#1a1f26] to-[#0f1419] border border-zinc-800/50">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Find Your Dream College?</h3>
              <p className="text-zinc-400 mb-6">Join thousands of students who found their perfect match</p>
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold px-8 py-3 rounded-xl">
                Start Prediction Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      <footer className="py-6 border-t border-zinc-800/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-zinc-500 text-sm">© 2025 Edu9 Career Guidance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TGEAPCETPage;
