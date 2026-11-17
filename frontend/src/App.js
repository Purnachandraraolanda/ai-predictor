import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage";
import JEEPage from "@/pages/JEEPage";
import JeeClosingRanks from "./pages/JeeClosingRanks";
import TGEAPCETPage from "@/pages/TGEAPCETPage";
import APEAPCETPage from "@/pages/APEAPCETPage";
import COMEDKPage from "@/pages/COMEDKPage";

function App() {
  return (
    <div className="App min-h-screen bg-zinc-950">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jee" element={<JEEPage />} />
          <Route path="/jee-closing" element={<JeeClosingRanks />} />
          <Route path="/tgeapcet" element={<TGEAPCETPage />} />
          <Route path="/apeapcet" element={<APEAPCETPage />} />
          <Route path="/comedk" element={<COMEDKPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
