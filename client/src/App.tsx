import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { SHINOBI_DATA } from "@/hooks/use-tasks";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("ninja-theme") || "dark");
  const [font, setFont] = useState(localStorage.getItem("ninja-font") || "body");

  useEffect(() => {
    document.documentElement.className = theme === "dark" ? "" : "light";
    document.body.className = `font-${font}`;
    
    // Restore accent
    const savedAccent = localStorage.getItem("ninja-accent");
    const customAccent = localStorage.getItem("ninja-accent-custom");
    
    if (customAccent) {
      document.documentElement.style.setProperty('--primary', customAccent);
    } else if (savedAccent) {
      const village = SHINOBI_DATA.villages.find(vd => vd.id === savedAccent);
      if (village) {
        document.documentElement.style.setProperty('--primary', village.color);
      }
    }

    localStorage.setItem("ninja-theme", theme);
    localStorage.setItem("ninja-font", font);
  }, [theme, font]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={`min-h-screen font-${font}`}>
          <Toaster />
          <Router />
          {/* Settings Toggle Floating Button */}
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <div className="bg-neutral-900/80 backdrop-blur-md p-2 rounded-xl border border-primary/20 shadow-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4 px-1">
                <span className="text-[10px] font-bold text-primary uppercase">Appearance</span>
                <button 
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-1.5 bg-neutral-800 text-primary-foreground rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  {theme === "dark" ? "☀️" : "🌙"}
                </button>
              </div>
              
              <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-bold text-primary uppercase">Ninja Scroll Font</span>
                <select 
                  value={font} 
                  onChange={(e) => setFont(e.target.value)}
                  className="p-1.5 bg-neutral-800 text-white rounded-lg text-[10px] border border-primary/30 outline-none focus:border-primary"
                >
                  <option value="body">Standard Shinobi</option>
                  <option value="display">Bangers (Action)</option>
                  <option value="shinobi">Handwritten (Scroll)</option>
                  <option value="modern">Modern (Hidden Village)</option>
                  <option value="mono">Data Scroll (Mono)</option>
                  <option value="serif">Ancient Seal (Serif)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-bold text-primary uppercase">Village Accent</span>
                <div className="flex flex-wrap gap-1.5 max-w-[140px]">
                  {['leaf', 'mist', 'sand', 'cloud', 'rock'].map(v => (
                    <button
                      key={v}
                      onClick={() => {
                        const root = document.documentElement;
                        const village = SHINOBI_DATA.villages.find(vd => vd.id === v);
                        if (village) {
                          root.style.setProperty('--primary', village.color);
                          localStorage.setItem("ninja-accent", v);
                        }
                      }}
                      className={`w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform`}
                      style={{ 
                        backgroundColor: `hsl(${SHINOBI_DATA.villages.find(vd => vd.id === v)?.color})` 
                      }}
                    />
                  ))}
                  {/* Extra custom colors */}
                  {[
                    { id: 'purple', color: '280 80% 60%' },
                    { id: 'pink', color: '330 80% 60%' },
                    { id: 'cyan', color: '180 80% 40%' },
                    { id: 'green', color: '120 80% 40%' },
                    { id: 'gold', color: '45 90% 50%' },
                    { id: 'orange', color: '25 100% 50%' },
                    { id: 'red', color: '0 100% 50%' },
                    { id: 'blue', color: '210 100% 50%' },
                    { id: 'teal', color: '160 100% 40%' },
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        document.documentElement.style.setProperty('--primary', c.color);
                        localStorage.setItem("ninja-accent-custom", c.color);
                        localStorage.removeItem("ninja-accent");
                      }}
                      className={`w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform`}
                      style={{ backgroundColor: `hsl(${c.color})` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
