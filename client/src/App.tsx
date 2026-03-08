import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { SHINOBI_DATA } from "@/hooks/use-tasks";
import { motion } from "framer-motion";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("ninja-theme") || "dark");
  const [font, setFont] = useState(localStorage.getItem("ninja-font") || "body");
  const [selectedHokage, setSelectedHokage] = useState(localStorage.getItem("ninja-selected-hokage") || "tsunade");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.className = theme === "dark" ? "dark" : "light";
    document.body.className = `font-${font}`;
    localStorage.setItem("ninja-theme", theme);
    localStorage.setItem("ninja-font", font);
  }, [theme, font]);

  useEffect(() => {
    const savedAccent = localStorage.getItem("ninja-accent-custom") || (localStorage.getItem("ninja-accent") ? SHINOBI_DATA.villages.find(v => v.id === localStorage.getItem("ninja-accent"))?.color : null);
    if (savedAccent) {
      document.documentElement.style.setProperty('--primary', savedAccent);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ninja-selected-hokage", selectedHokage);
    window.dispatchEvent(new CustomEvent("hokage-changed", { detail: selectedHokage }));
  }, [selectedHokage]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={`min-h-screen font-${font}`}>
          <Toaster />
          <Router />
          <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-3 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center border-2 border-black/20"
              data-testid="settings-toggle"
            >
              <span className="text-xl">{isSettingsOpen ? "✕" : "⚙️"}</span>
            </button>

            {isSettingsOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-neutral-900/90 backdrop-blur-xl p-4 rounded-2xl border border-primary/20 shadow-2xl flex flex-col gap-4 w-[240px]"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
                  <span className="text-xs font-black text-primary uppercase tracking-widest">Ninja Settings</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Theme</span>
                  <button 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="px-3 py-1 bg-neutral-800 text-primary rounded-lg hover:bg-neutral-700 transition-colors text-xs font-bold border border-white/5"
                    data-testid="theme-toggle"
                  >
                    {theme === "dark" ? "SHADOW" : "LIGHT"}
                  </button>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Scroll Font</span>
                  <select 
                    value={font} 
                    onChange={(e) => {
                      const newFont = e.target.value;
                      setFont(newFont);
                      document.body.className = `font-${newFont}`;
                    }}
                    className="p-2 bg-neutral-800 text-white rounded-lg text-[10px] border border-primary/30 outline-none focus:border-primary transition-all font-sans"
                    data-testid="font-select"
                  >
                    <option value="body">Standard Shinobi</option>
                    <option value="display">Bangers (Action)</option>
                    <option value="shinobi">Handwritten (Scroll)</option>
                    <option value="modern">Modern (Hidden Village)</option>
                    <option value="mono">Data Scroll (Mono)</option>
                    <option value="serif">Ancient Seal (Serif)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Leaf Overseer</span>
                  <select 
                    value={selectedHokage} 
                    onChange={(e) => setSelectedHokage(e.target.value)}
                    className="p-2 bg-neutral-800 text-white rounded-lg text-[10px] border border-primary/30 outline-none focus:border-primary font-sans"
                    data-testid="hokage-select"
                  >
                    <option value="hashirama">1st: Hashirama</option>
                    <option value="tobirama">2nd: Tobirama</option>
                    <option value="hiruzen">3rd: Hiruzen</option>
                    <option value="minato">4th: Minato</option>
                    <option value="tsunade">5th: Tsunade</option>
                    <option value="kakashi_hokage">6th: Kakashi</option>
                    <option value="naruto">7th: Naruto</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Village Chakra (Accent)</span>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {['leaf', 'mist', 'sand', 'cloud', 'rock'].map(v => (
                        <button
                          key={v}
                          onClick={() => {
                            const village = SHINOBI_DATA.villages.find(vd => vd.id === v);
                            if (village) {
                              document.documentElement.style.setProperty('--primary', village.color);
                              localStorage.setItem("ninja-accent", v);
                              localStorage.setItem("ninja-accent-custom", village.color);
                            }
                          }}
                          className="w-5 h-5 rounded-full border border-white/20 hover:scale-125 transition-transform shadow-lg"
                          style={{ 
                            backgroundColor: `hsl(${SHINOBI_DATA.villages.find(vd => vd.id === v)?.color})` 
                          }}
                          data-testid={`accent-${v}`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] text-neutral-500 font-mono">Custom Chakra Seal</span>
                      <input 
                        type="color" 
                        className="w-full h-8 bg-transparent border-none cursor-pointer rounded overflow-hidden"
                        data-testid="custom-color-picker"
                        onChange={(e) => {
                          const hex = e.target.value;
                          const r = parseInt(hex.slice(1, 3), 16) / 255;
                          const g = parseInt(hex.slice(3, 5), 16) / 255;
                          const b = parseInt(hex.slice(5, 7), 16) / 255;
                          const max = Math.max(r, g, b), min = Math.min(r, g, b);
                          let h, s, l = (max + min) / 2;
                          if (max === min) { h = s = 0; } else {
                            const d = max - min;
                            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                            switch (max) {
                              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                              case g: h = (b - r) / d + 2; break;
                              case b: h = (r - g) / d + 4; break;
                              default: h = 0; break;
                            }
                            h /= 6;
                          }
                          const hsl = `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
                          document.documentElement.style.setProperty('--primary', hsl);
                          localStorage.setItem("ninja-accent-custom", hsl);
                          localStorage.removeItem("ninja-accent");
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
