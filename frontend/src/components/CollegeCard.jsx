import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, MapPin } from "lucide-react";

const ChanceBadge = ({ chance }) => {
  const config = {
    SAFE: { bg: "bg-emerald-500", label: "SAFE" },
    GOOD: { bg: "bg-amber-500", label: "GOOD CHANCE" },
    REACH: { bg: "bg-orange-500", label: "REACH" }
  };
  const c = config[chance];
  return (
    <span className={`${c.bg} text-white text-xs font-bold px-3 py-1.5 rounded-lg`}>
      {c.label}
    </span>
  );
};

// State predictor card - Only Closing Rank + Your Rank
export const StateCollegeCard = ({ prediction, index, userRank }) => {
  const borderColors = { SAFE: "border-l-emerald-500", GOOD: "border-l-amber-500", REACH: "border-l-orange-500" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.9) }}
      className={`rounded-xl bg-[#1a2030] border border-[#2a3040] overflow-hidden border-l-4 ${borderColors[prediction.chance]} hover:border-[#3a4050] transition-all`}
      data-testid={`result-card-${index}`}
    >
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white/80" />
            </div>
            <div>
              {prediction.institute_code && <span className="text-zinc-500 text-xs block mb-0.5">{prediction.institute_code}</span>}
              <h4 className="text-white font-semibold text-sm leading-tight">{prediction.institute}</h4>
            </div>
          </div>
          <ChanceBadge chance={prediction.chance} />
        </div>
      </div>

      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#151b28] border border-[#2a3040]">
          <BookOpen className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <span className="text-zinc-300 text-sm">{prediction.branch}</span>
        </div>
      </div>

      {prediction.district && (
        <div className="px-5 pb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1e2535] text-zinc-400 text-xs">
            <MapPin className="w-3 h-3" />{prediction.district}
          </span>
        </div>
      )}

      <div className="px-5 pb-5">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#151b28] rounded-lg p-3 text-center border border-[#2a3040]">
            <div className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-1">Closing Rank</div>
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

// Results header with filters
export const ResultsHeader = ({ predictions, formData, activeTab, setActiveTab, searchQuery, setSearchQuery, selectedBranches, setSelectedBranches, onReset, accentColor = "blue" }) => {
  const [branchDropdownOpen, setBranchDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  const allBranches = React.useMemo(() => {
    if (!predictions?.predictions) return [];
    return [...new Set(predictions.predictions.map(p => p.branch || p.program).filter(Boolean))].sort();
  }, [predictions]);

  React.useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setBranchDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleBranch = (branch) => {
    setSelectedBranches(prev => prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#1a2030] border border-[#2a3040] mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Prediction Results</h2>
          <p className="text-zinc-400 text-sm">
            Rank <span className="text-blue-400 font-bold">{parseInt(formData.rank).toLocaleString()}</span>
            {" "}&bull; {formData.category || formData.seat_type}
            {formData.gender && <> &bull; {formData.gender === "M" ? "Male" : formData.gender === "F" ? "Female" : formData.gender}</>}
          </p>
        </div>
        {onReset && (
          <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#252d3d] hover:bg-[#2d3545] text-zinc-300 text-sm font-medium transition-colors border border-[#3a4050]" data-testid="new-search-btn">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            New Search
          </button>
        )}
      </div>

      <div className="flex items-center gap-6 border-b border-[#2a3040] mb-5 overflow-x-auto" data-testid="results-tabs">
        {[
          { key: "all", label: "All Results", count: predictions.total_colleges },
          { key: "reach", label: "Reach", count: predictions.reach_count },
          { key: "good", label: "Good Chance", count: predictions.good_count },
          { key: "safe", label: "Safe", count: predictions.safe_count },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key ? "border-blue-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`} data-testid={`tab-${tab.key}`}>
            {tab.label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? "bg-blue-600 text-white" : "bg-[#252d3d] text-zinc-400"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input placeholder="Search college or branch..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131820] border border-[#2a3040] text-white pl-10 h-11 rounded-xl placeholder:text-zinc-600 text-sm focus:outline-none focus:border-blue-500/50" data-testid="search-input" />
        </div>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
            className="flex items-center gap-2 bg-[#131820] border border-[#2a3040] text-white h-11 px-4 rounded-xl text-sm hover:border-[#3a4050] transition-colors" data-testid="branch-filter-btn">
            <BookOpen className="w-4 h-4 text-zinc-500" />
            <span className="whitespace-nowrap">{selectedBranches.length === 0 ? "All Branches" : `${selectedBranches.length} Selected`}</span>
            <svg className={`w-4 h-4 text-zinc-500 transition-transform ${branchDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {branchDropdownOpen && (
            <div className="absolute top-full mt-2 right-0 w-80 max-h-72 overflow-y-auto bg-[#1e2535] border border-[#3a4050] rounded-xl shadow-2xl z-50">
              <div className="sticky top-0 bg-[#1e2535] p-2 border-b border-[#2a3040]">
                <button onClick={() => setSelectedBranches([])} className="w-full text-left px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-[#252d3d] rounded-lg">Clear All</button>
              </div>
              {allBranches.map(branch => (
                <label key={branch} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#252d3d] cursor-pointer text-sm">
                  <input type="checkbox" checked={selectedBranches.includes(branch)} onChange={() => toggleBranch(branch)} className="w-4 h-4 rounded accent-blue-500" />
                  <span className="text-zinc-300 truncate">{branch}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedBranches.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedBranches.map(b => (
            <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/15 text-blue-400 border border-blue-500/20 text-xs">
              {b.length > 35 ? b.substring(0, 35) + "..." : b}
              <button onClick={() => toggleBranch(b)} className="ml-1 hover:text-white"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Multi-select checkbox component for form fields
export const MultiSelectCheckbox = ({ label, options, selected, onChange, testId }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };

  return (
    <div className="relative" ref={ref}>
      <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2 block">{label}</label>
      <button type="button" onClick={() => setOpen(!open)} data-testid={testId}
        className="w-full flex items-center justify-between bg-[#131820] border border-[#2a3040] text-white h-12 px-4 rounded-xl text-sm hover:border-[#3a4050] transition-colors text-left">
        <span className="truncate">{selected.length === 0 ? `All ${label.replace(' *', '').replace(' (Optional)', '')}` : `${selected.length} selected`}</span>
        <svg className={`w-4 h-4 text-zinc-500 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 w-full max-h-60 overflow-y-auto bg-[#1e2535] border border-[#3a4050] rounded-xl shadow-2xl z-50">
          <div className="sticky top-0 bg-[#1e2535] p-2 border-b border-[#2a3040]">
            <button type="button" onClick={() => onChange([])} className="w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-[#252d3d] rounded-lg">Clear All</button>
          </div>
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-3 px-4 py-2 hover:bg-[#252d3d] cursor-pointer text-sm">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="w-4 h-4 rounded accent-blue-500" />
              <span className="text-zinc-300 truncate">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
