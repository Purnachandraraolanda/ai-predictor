import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Building2,
  MapPin,
  ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Probability Badge Component
const ProbabilityBadge = ({ chance, probability }) => {
  const styles = {
    SAFE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    GOOD: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    REACH: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  };

  const icons = {
    SAFE: CheckCircle,
    GOOD: AlertCircle,
    REACH: XCircle
  };

  const Icon = icons[chance] || AlertCircle;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium uppercase tracking-wider ${styles[chance]}`}>
      <Icon className="w-3 h-3" />
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const [formData, setFormData] = useState({
    rank: "",
    category: "",
    gender: "",
    college_type: "",
    district: "",
    branch: ""
  });

  const categories = [
    { value: "OC", label: "OC (General)" },
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
    { value: "College", label: "College" },
    { value: "University", label: "University" },
    { value: "Private", label: "Private University" }
  ];

  // Fetch metadata on mount
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
      toast.error("Please enter your rank");
      return;
    }

    setLoading(true);
    setPredictions(null);

    try {
      const response = await axios.post(`${API}/apeapcet/predict`, {
        rank: parseInt(formData.rank),
        category: formData.category,
        gender: formData.gender,
        college_type: formData.college_type || null,
        district: formData.district || null,
        branch: formData.branch || null
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
    
    if (activeTab === "safe") {
      filtered = filtered.filter(p => p.chance === "SAFE");
    } else if (activeTab === "good") {
      filtered = filtered.filter(p => p.chance === "GOOD");
    } else if (activeTab === "reach") {
      filtered = filtered.filter(p => p.chance === "REACH");
    }

    // Sort if configured
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
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

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 md:pt-28 md:pb-12 border-b border-zinc-800">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-violet-600 flex items-center justify-center glow-purple">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-50 font-['Outfit']" data-testid="page-title">
                  APEAPCET College Predictor
                </h1>
                <p className="text-zinc-400 text-sm">Andhra Pradesh Engineering Colleges</p>
              </div>
            </div>
            <Badge className="w-fit bg-violet-600/20 text-violet-300 border-violet-500/30 px-4 py-1.5" data-testid="official-badge">
              Official APSCHE 2025 Data
            </Badge>
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
                <h2 className="text-lg font-semibold text-zinc-50 mb-6 font-['Outfit'] flex items-center gap-2">
                  <Search className="w-5 h-5 text-violet-400" />
                  Enter Your Details
                </h2>

                <div className="space-y-5">
                  {/* Rank Input */}
                  <div className="space-y-2">
                    <Label htmlFor="rank" className="text-zinc-300">APEAPCET Rank *</Label>
                    <Input
                      id="rank"
                      type="number"
                      placeholder="Enter your rank"
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 focus:border-violet-600 focus:ring-violet-600 text-zinc-100 placeholder:text-zinc-600"
                      data-testid="rank-input"
                    />
                  </div>

                  {/* Category Select */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 focus:border-violet-600 text-zinc-100" data-testid="category-select">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value} className="text-zinc-100 focus:bg-zinc-800">
                            {cat.label}
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
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 focus:border-violet-600 text-zinc-100" data-testid="gender-select">
                        <SelectValue placeholder="Select gender" />
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

                  {/* College Type Select */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300">College Type</Label>
                    <Select
                      value={formData.college_type || "all"}
                      onValueChange={(value) => setFormData({ ...formData, college_type: value === "all" ? "" : value })}
                    >
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 focus:border-violet-600 text-zinc-100" data-testid="college-type-select">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {collegeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-zinc-100 focus:bg-zinc-800">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* District Select */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300">District</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => setFormData({ ...formData, district: value })}
                    >
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 focus:border-violet-600 text-zinc-100" data-testid="district-select">
                        <SelectValue placeholder="All districts" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 max-h-60">
                        <SelectItem value="" className="text-zinc-100 focus:bg-zinc-800">All Districts</SelectItem>
                        {metadata?.districts?.map((district) => (
                          <SelectItem key={district} value={district} className="text-zinc-100 focus:bg-zinc-800">
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Branch Select */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Branch Preference</Label>
                    <Select
                      value={formData.branch}
                      onValueChange={(value) => setFormData({ ...formData, branch: value })}
                    >
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 focus:border-violet-600 text-zinc-100" data-testid="branch-select">
                        <SelectValue placeholder="All branches" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 max-h-60">
                        <SelectItem value="" className="text-zinc-100 focus:bg-zinc-800">All Branches</SelectItem>
                        {metadata?.branches?.slice(0, 30).map((branch) => (
                          <SelectItem key={branch} value={branch} className="text-zinc-100 focus:bg-zinc-800 text-xs">
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Predict Button */}
                  <Button
                    onClick={handlePredict}
                    disabled={loading || !formData.rank || !formData.category || !formData.gender}
                    className="w-full gold-btn text-zinc-950 font-bold py-6 text-base rounded-lg border-0 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="flex flex-col items-center justify-center h-96 text-center"
                    data-testid="empty-state"
                  >
                    <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                      <GraduationCap className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-400 mb-2 font-['Outfit']">
                      Enter your details to get predictions
                    </h3>
                    <p className="text-zinc-500 text-sm max-w-md">
                      Fill in your APEAPCET rank, category, and gender to see your college matches
                    </p>
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
                      <div className="w-20 h-20 rounded-full border-4 border-zinc-800 border-t-violet-600 animate-spin" />
                      <GraduationCap className="w-8 h-8 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-zinc-400 mt-6 font-medium">Analyzing cutoffs...</p>
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
                      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-500 font-['JetBrains_Mono']">{predictions.good_count}</div>
                        <div className="text-blue-400/70 text-sm">Good Chance</div>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="text-2xl font-bold text-amber-500 font-['JetBrains_Mono']">{predictions.reach_count}</div>
                        <div className="text-amber-400/70 text-sm">Reach</div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1 mb-4" data-testid="results-tabs">
                        <TabsTrigger 
                          value="all" 
                          className="flex-1 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50"
                        >
                          All ({predictions.total_colleges})
                        </TabsTrigger>
                        <TabsTrigger 
                          value="safe" 
                          className="flex-1 data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400"
                        >
                          Safe ({predictions.safe_count})
                        </TabsTrigger>
                        <TabsTrigger 
                          value="good" 
                          className="flex-1 data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400"
                        >
                          Good ({predictions.good_count})
                        </TabsTrigger>
                        <TabsTrigger 
                          value="reach" 
                          className="flex-1 data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400"
                        >
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
                                    <button 
                                      className="flex items-center gap-1 hover:text-zinc-200"
                                      onClick={() => handleSort('college_name')}
                                    >
                                      College
                                      <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                  </TableHead>
                                  <TableHead className="text-zinc-400 font-medium">Branch</TableHead>
                                  <TableHead className="text-zinc-400 font-medium text-right">
                                    <button 
                                      className="flex items-center gap-1 hover:text-zinc-200 ml-auto"
                                      onClick={() => handleSort('opening_rank')}
                                    >
                                      Opening
                                      <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                  </TableHead>
                                  <TableHead className="text-zinc-400 font-medium text-right">
                                    <button 
                                      className="flex items-center gap-1 hover:text-zinc-200 ml-auto"
                                      onClick={() => handleSort('closing_rank')}
                                    >
                                      Closing
                                      <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                  </TableHead>
                                  <TableHead className="text-zinc-400 font-medium text-center">Chance</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getFilteredPredictions().slice(0, 100).map((prediction, index) => (
                                  <motion.tr
                                    key={`${prediction.college_code}-${prediction.branch}-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="border-zinc-800 hover:bg-zinc-900/30"
                                    data-testid={`result-row-${index}`}
                                  >
                                    <TableCell className="font-medium">
                                      <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                          <Building2 className="w-5 h-5 text-zinc-500" />
                                        </div>
                                        <div>
                                          <div className="text-zinc-100 font-medium text-sm">
                                            {prediction.college_name || prediction.college_code}
                                          </div>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-zinc-500 text-xs">{prediction.college_code}</span>
                                            {prediction.district && (
                                              <span className="flex items-center gap-1 text-zinc-500 text-xs">
                                                <MapPin className="w-3 h-3" />
                                                {prediction.district}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-300 text-sm max-w-[200px]">
                                      <div className="truncate" title={prediction.branch}>
                                        {prediction.branch}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right text-zinc-300 font-['JetBrains_Mono'] text-sm">
                                      {prediction.opening_rank.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right text-zinc-300 font-['JetBrains_Mono'] text-sm">
                                      {prediction.closing_rank.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <ProbabilityBadge 
                                        chance={prediction.chance} 
                                        probability={prediction.probability} 
                                      />
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

      <Footer />
    </div>
  );
};

export default APEAPCETPage;
