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

export const StateCollegeCard = ({ prediction, index, userRank, accentGradient = "from-emerald-600 to-teal-600" }) => {
  const borderColors = {
    SAFE: "border-l-emerald-500",
    GOOD: "border-l-amber-500",
    REACH: "border-l-orange-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.9) }}
      className={`rounded-xl bg-[#141922] border border-zinc-800/50 overflow-hidden border-l-4 ${borderColors[prediction.chance]}`}
      data-testid={`result-card-${index}`}
    >
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white/80" />
            </div>
            <div>
              {prediction.institute_code && (
                <span className="text-zinc-500 text-xs block mb-0.5">{prediction.institute_code}</span>
              )}
              <h4 className="text-white font-semibold text-sm leading-tight">{prediction.institute}</h4>
            </div>
          </div>
          <ChanceBadge chance={prediction.chance} />
        </div>
      </div>

      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1a1f28] border border-zinc-800/40">
          <BookOpen className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <span className="text-zinc-300 text-sm">{prediction.branch}</span>
        </div>
      </div>

      {prediction.district && (
        <div className="px-5 pb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800/50 text-zinc-400 text-xs">
            <MapPin className="w-3 h-3" />
            {prediction.district}
          </div>
        </div>
      )}

      <div className="px-5 pb-5">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#1a1f28] rounded-lg p-3 text-center border border-zinc-800/40">
            <div className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-1">Opening</div>
            <div className="text-white font-bold text-base font-mono">{Math.max(0, prediction.opening_rank).toLocaleString()}</div>
          </div>
          <div className="bg-[#1a1f28] rounded-lg p-3 text-center border border-zinc-800/40">
            <div className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-1">Closing</div>
            <div className="text-white font-bold text-base font-mono">{Math.max(0, prediction.closing_rank).toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-violet-900/60 to-blue-900/60 rounded-lg p-3 text-center border border-violet-500/20">
            <div className="text-violet-300 text-[10px] font-medium uppercase tracking-wider mb-1">Your Rank</div>
            <div className="text-violet-200 font-bold text-base font-mono">{Math.max(0, userRank).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ResultsHeader = ({ predictions, formData, activeTab, setActiveTab, searchQuery, setSearchQuery, accentColor = "blue" }) => (
  <div className="p-6 rounded-2xl bg-[#141922] border border-zinc-800/50 mb-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Prediction Results</h2>
        <p className="text-zinc-400 text-sm">
          Rank <span className={`text-${accentColor}-400 font-bold`}>{parseInt(formData.rank).toLocaleString()}</span>
          {" "}&bull; {formData.category || formData.seat_type}
          {formData.gender && <> &bull; {formData.gender === "M" ? "Male" : formData.gender === "F" ? "Female" : formData.gender}</>}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-6 border-b border-zinc-800/50 mb-5" data-testid="results-tabs">
      {[
        { key: "all", label: "All Results", count: predictions.total_colleges },
        { key: "reach", label: "Reach", count: predictions.reach_count },
        { key: "good", label: "Good Chance", count: predictions.good_count },
        { key: "safe", label: "Safe", count: predictions.safe_count },
      ].map(tab => (
        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${
            activeTab === tab.key ? `border-${accentColor}-500 text-white` : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`} data-testid={`tab-${tab.key}`}>
          {tab.label}
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === tab.key ? `bg-${accentColor}-600 text-white` : "bg-zinc-800 text-zinc-400"
          }`}>{tab.count}</span>
        </button>
      ))}
    </div>

    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input placeholder="Search college or branch..."
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0f1419] border border-zinc-800 text-white pl-10 h-11 rounded-xl placeholder:text-zinc-600 text-sm focus:outline-none focus:border-zinc-600"
          data-testid="search-input" />
      </div>
    </div>
  </div>
);
