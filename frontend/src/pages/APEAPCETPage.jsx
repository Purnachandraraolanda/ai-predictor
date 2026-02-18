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
  Database,
  ArrowRight,
  Sparkles,
  MapPin,
  Users
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

const APEAPCETPage = () => {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const [formData, setFormData] = useState({
    rank: "",
    category: "OC",
    gender: "M",
    college_type: "all",
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
    { value: "SC", label: "SC" },
    { value: "ST", label: "ST" },
    { value: "EWS", label: "EWS" }
  ];

  const genders = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" }
  ];

  const collegeTypes = [
    { value: "all", label: "All Types" },
    { value: "College", label: "Engineering College" },
    { value: "University", label: "University" }
  ];

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`${API}/apeapcet/metadata`);
        setMetadata(response.data);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };
    fetchMetadata();
  }, []);

  const handlePredict = async () => {
    if (!formData.rank) {
      toast.error("Please enter your APEAPCET rank");
      return;
    }

    setLoading(true);
    setPredictions(null);

    try {
      const response = await axios.post(`${API}/apeapcet/predict`, {
        rank: parseInt(formData.rank),
        category: formData.category,
        gender: formData.gender,
        college_type: formData.college_type === "all" ? null : formData.college_type,
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

  const collegeCount = metadata?.colleges?.length || 254;
  const branchCount = metadata?.branches?.length || 70;
  const districtCount = metadata?.districts?.length || 14;

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Edu9 Career Guidance</span>
            </Link>
            <Badge className="bg-transparent border border-violet-500/50 text-violet-400 px-4 py-1.5 rounded-full">
              APEAPCET 2026
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-12 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-1 h-1 bg-violet-500/50 rounded-full animate-pulse" />
          <div className="absolute top-40 left-20 w-1.5 h-1.5 bg-purple-500/50 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
          <div className="absolute top-32 right-20 w-1 h-1 bg-pink-500/50 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-6xl relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-violet-400 text-sm font-medium">Official APSCHE 2025 Data</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">APEAPCET College</span>
              <br />
              <span className="text-white">Predictor</span>
            </h1>
            
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Discover your perfect college match from <span className="text-white font-semibold">{collegeCount}</span> institutes across Andhra Pradesh with <span className="text-white font-semibold">{branchCount}</span> branches
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Building className="w-6 h-6 text-violet-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={collegeCount} /></div>
              <div className="text-zinc-500 text-sm">Colleges</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={branchCount} /></div>
              <div className="text-zinc-500 text-sm">Branches</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-pink-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={districtCount} /></div>
              <div className="text-zinc-500 text-sm">Districts</div>
            </div>
            <div className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-rose-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter end={43806} /></div>
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
                  APEAPCET Rank *
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
                  College Type (Optional)
                </label>
                <Select value={formData.college_type} onValueChange={(v) => setFormData({ ...formData, college_type: v })}>
                  <SelectTrigger className="bg-[#0f1419] border-zinc-800 text-white h-12 rounded-xl" data-testid="college-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f26] border-zinc-800">
                    {collegeTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-white focus:bg-zinc-800">{t.label}</SelectItem>
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
                    {metadata?.branches?.slice(0, 30).map((b) => (
                      <SelectItem key={b} value={b} className="text-white focus:bg-zinc-800 text-xs">{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handlePredict}
              disabled={loading || !formData.rank}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold text-base"
              data-testid="predict-button"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Predicting...</>
              ) : (
                <><Search className="mr-2 h-5 w-5" />Predict My Colleges</>
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
                  <TabsTrigger value="all" className="flex-1 rounded-lg data-[state=active]:bg-zinc-700">All</TabsTrigger>
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
                                <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center">
                                  <GraduationCap className="w-5 h-5 text-violet-400" />
                                </div>
                                <div>
                                  <div className="text-white text-sm font-medium">{p.institute || p.institute_code}</div>
                                  <div className="text-zinc-500 text-xs">{p.institute_code}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-zinc-400 text-sm max-w-[200px] truncate">{p.branch}</TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                                <MapPin className="w-3 h-3" />{p.district}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-zinc-300 font-mono text-sm">{p.opening_rank.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-zinc-300 font-mono text-sm">{p.closing_rank.toLocaleString()}</TableCell>
                            <TableCell className="text-center"><ProbabilityBadge chance={p.chance} probability={p.probability} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                { step: "01", title: "Enter Details", desc: "Input your APEAPCET rank, category, and gender to get started" },
                { step: "02", title: "Smart Analysis", desc: "We compare your rank with 43,806 official cutoff records" },
                { step: "03", title: "Get Results", desc: "Receive personalized college recommendations with admission chances" }
              ].map((item) => (
                <div key={item.step} className="p-6 rounded-2xl bg-[#1a1f26] border border-zinc-800/50 text-center">
                  <div className="text-violet-500 text-4xl font-bold mb-3">{item.step}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-[#1a1f26] to-[#0f1419] border border-zinc-800/50">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Find Your Dream College?</h3>
              <p className="text-zinc-400 mb-6">Join thousands of students who have used our predictor to make informed decisions</p>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold px-8 py-3 rounded-xl">
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

export default APEAPCETPage;
