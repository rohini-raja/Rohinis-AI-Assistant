import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

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
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <select 
              value={font} 
              onChange={(e) => setFont(e.target.value)}
              className="p-2 bg-neutral-800 text-white rounded-lg text-xs border border-primary/50"
            >
              <option value="body">Standard</option>
              <option value="display">Bangers</option>
              <option value="shinobi">Shinobi</option>
              <option value="modern">Modern</option>
            </select>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
