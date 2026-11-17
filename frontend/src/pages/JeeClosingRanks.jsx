import React, { useState } from 'react';
import { Header } from "@/components/Layout";
import Footer from "@/components/common/Footer";
import { ChevronDown, AlertCircle } from "lucide-react";

const JeeClosingRanks = () => {
  // Data cleaned to match your Excel (NITs, IIITs, GFTIs only)
  const rawData = [
    { category: "OPEN", quota: "GENERAL", nits: "62,338", iiits: "69,257", gftis: "1,25,271" },
    { category: "OPEN", quota: "FEMALE", nits: "77,665", iiits: "79,764", gftis: "1,14,964" },
    { category: "EWS", quota: "GENERAL", nits: "9,100", iiits: "10,042", gftis: "18,318" },
    { category: "EWS", quota: "FEMALE", nits: "11,134", iiits: "11,665", gftis: "14,265" },
    { category: "OBC-NCL", quota: "GENERAL", nits: "20,171", iiits: "22,348", gftis: "41,645" },
    { category: "OBC-NCL", quota: "FEMALE", nits: "27,737", iiits: "30,022", gftis: "41,805" },
    { category: "SC", quota: "GENERAL", nits: "10,666", iiits: "11,961", gftis: "17,647" },
    { category: "SC", quota: "FEMALE", nits: "11,912", iiits: "13,200", gftis: "15,256" },
    { category: "ST", quota: "GENERAL", nits: "3,877", iiits: "5,717", gftis: "8,388" },
    { category: "ST", quota: "FEMALE", nits: "5,180", iiits: "6,099", gftis: "7,109" },
  ];

  const [category, setCategory] = useState("OPEN");
  const [gender, setGender] = useState("GENERAL");
  const [institution, setInstitution] = useState("nits"); // Set default to NITs

  const resultRow = rawData.find(row => row.category === category && row.quota === gender);
  const finalRank = resultRow ? resultRow[institution] : "N/A";

  return (
    <div className="min-h-screen bg-[#111720] text-white">
      <Header />
      <div className="container mx-auto pt-40 pb-20 px-4 max-w-6xl">
        
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            JEE 2025 Rank Checker
          </h1>
          <p className="text-zinc-500 text-lg font-medium">Official Round 6 Closing Ranks</p>
        </div>

        {/* --- Dropdown Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Category</label>
            <div className="relative h-16">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-full bg-[#1a1f26] border border-zinc-800 text-zinc-200 px-5 rounded-2xl appearance-none focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer font-semibold transition-all hover:border-zinc-600"
              >
                <option value="OPEN">OPEN (General)</option>
                <option value="EWS">EWS</option>
                <option value="OBC-NCL">OBC-NCL</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Gender</label>
            <div className="relative h-16">
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-full bg-[#1a1f26] border border-zinc-800 text-zinc-200 px-5 rounded-2xl appearance-none focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer font-semibold transition-all hover:border-zinc-600"
              >
                <option value="GENERAL">Male / Neutral</option>
                <option value="FEMALE">Female Only</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Institution</label>
            <div className="relative h-16">
              <select 
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full h-full bg-[#1a1f26] border border-zinc-800 text-zinc-200 px-5 rounded-2xl appearance-none focus:ring-2 focus:ring-emerald-500/50 outline-none cursor-pointer font-semibold transition-all hover:border-zinc-600"
              >
                <option value="nits">NITs</option>
                <option value="iiits">IIITs</option>
                <option value="gftis">GFTIs</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* --- Result Card WITH Notes Directly Underneath --- */}
        <div className="relative min-h-[500px] flex flex-col items-center justify-center p-8 md:p-16 rounded-[3.5rem] bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-white/5 text-center shadow-2xl max-w-5xl mx-auto overflow-hidden">
          <div className="relative z-10 w-full">
            <p className="text-zinc-500 font-black mb-4 uppercase tracking-[0.4em] text-xs">Estimated Closing Rank</p>
            <h2 className="text-7xl md:text-[11rem] font-black text-white tracking-tighter leading-none mb-10 drop-shadow-2xl">
              {finalRank}
            </h2>
            
            {/* The Badge Tags */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="px-6 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-sm font-bold shadow-xl uppercase">{category}</div>
              <div className="px-6 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-sm font-bold shadow-xl uppercase">{gender}</div>
              <div className="px-6 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-sm font-bold shadow-xl uppercase">{institution}</div>
            </div>

            {/* --- Notes Section from Excel --- */}
            <div className="bg-black/20 border border-white/5 p-6 rounded-3xl max-w-3xl mx-auto text-left">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Analysis Guide</h3>
              </div>
              <ul className="space-y-3">
                <li className="text-zinc-400 text-sm leading-relaxed flex gap-3">
                  <span className="text-amber-500 font-bold shrink-0">1.</span>
                  <span>CSE & ECE may be closed in 50% of Max. rank in NITs.</span>
                </li>
                <li className="text-zinc-400 text-sm leading-relaxed flex gap-3">
                  <span className="text-amber-500 font-bold shrink-0">2.</span>
                  <span>In NITs, Home State (HS) quota closing ranks will be much lower than these ranks.</span>
                </li>
                <li className="text-zinc-400 text-sm leading-relaxed flex gap-3">
                  <span className="text-amber-500 font-bold shrink-0">3.</span>
                  <span>In IIITs only All India (AI) rank will be the criteria.</span>
                </li>
                <li className="text-zinc-400 text-sm leading-relaxed flex gap-3">
                  <span className="text-amber-500 font-bold shrink-0">4.</span>
                  <span>In IIITs maximum seats will be available in CSE & ECE only.</span>
                </li>
                <li className="text-zinc-400 text-sm leading-relaxed flex gap-3">
                  <span className="text-amber-500 font-bold shrink-0">5.</span>
                  <span>In GFTIs Other State Female Candidates will be less than these ranks.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default JeeClosingRanks;