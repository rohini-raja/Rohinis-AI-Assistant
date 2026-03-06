import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Timer, Coffee, Flame, RotateCcw, Volume2, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TimerMode = "SAGE" | "BREAK";

export function NinjaTimer() {
  const [mode, setMode] = useState<TimerMode>("SAGE");
  const [sageDuration, setSageDuration] = useState(parseInt(localStorage.getItem("ninja-sage-duration") || "25"));
  const [breakDuration, setBreakDuration] = useState(parseInt(localStorage.getItem("ninja-break-duration") || "5"));
  const [timeLeft, setTimeLeft] = useState(mode === "SAGE" ? sageDuration * 60 : breakDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTimeLeft(mode === "SAGE" ? sageDuration * 60 : breakDuration * 60);
  }, [sageDuration, breakDuration, mode]);

  useEffect(() => {
    localStorage.setItem("ninja-sage-duration", sageDuration.toString());
    localStorage.setItem("ninja-break-duration", breakDuration.toString());
  }, [sageDuration, breakDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Every 30 minutes (1800 seconds) of Sage Mode
          if (mode === "SAGE" && (sageDuration * 60 - newTime) % 1800 === 0 && (sageDuration * 60 - newTime) > 0) {
            const trees = JSON.parse(localStorage.getItem("ninja-forest") || "[]");
            trees.push({ 
              id: Date.now(), 
              x: Math.random() * 100, 
              y: Math.random() * 100,
              missionId: localStorage.getItem("active-mission-id") 
            });
            localStorage.setItem("ninja-forest", JSON.stringify(trees));
            toast({
              title: "Tree Planted!",
              description: "Your focus has grown a new tree in the Shinobi Forest.",
            });
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      const title = mode === "SAGE" ? "Sage Mode Complete!" : "Break Finished!";
      const description = mode === "SAGE" ? "Your chakra is replenished. Ready for a break?" : "Break is over. Time to focus, shinobi!";
      
      toast({
        title,
        description,
        className: "bg-primary text-primary-foreground border-2 border-black font-display",
      });

      // Play a kunai sound or similar if we had assets
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: description });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, toast]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const handleToggle = () => setIsActive(prev => !prev);
    window.addEventListener('toggle-ninja-timer', handleToggle);
    return () => window.removeEventListener('toggle-ninja-timer', handleToggle);
  }, []);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "SAGE" ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === "SAGE" ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className="p-4 bg-neutral-900 border-primary/30 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display text-primary flex items-center gap-2">
          {mode === "SAGE" ? <Flame className="h-5 w-5" /> : <Coffee className="h-5 w-5" />}
          {mode === "SAGE" ? "SAGE MODE" : "CHAKRA RESTORATION"}
        </h3>
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant={mode === "SAGE" ? "default" : "outline"} 
            onClick={() => switchMode("SAGE")}
            className="text-[10px] h-7 px-2"
          >
            SAGE
          </Button>
          <Button 
            size="sm" 
            variant={mode === "BREAK" ? "default" : "outline"} 
            onClick={() => switchMode("BREAK")}
            className="text-[10px] h-7 px-2"
          >
            BREAK
          </Button>
        </div>
      </div>

      <div className="text-center py-4 relative group">
        {isEditing ? (
          <div className="flex flex-col gap-2 items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">Set {mode}:</span>
              <input 
                type="number" 
                value={mode === "SAGE" ? sageDuration : breakDuration}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  if (mode === "SAGE") setSageDuration(val);
                  else setBreakDuration(val);
                }}
                className="w-16 bg-neutral-950 border border-primary/30 rounded px-2 py-1 text-white text-xl font-mono"
              />
              <span className="text-[10px] font-bold text-neutral-500 uppercase">Min</span>
            </div>
            <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setIsEditing(false)}>SAVE</Button>
          </div>
        ) : (
          <>
            <span 
              className="text-5xl font-mono font-bold text-white tracking-tighter cursor-pointer hover:text-primary transition-colors"
              onClick={() => !isActive && setIsEditing(true)}
            >
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
            <p className="text-[8px] text-neutral-600 uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to adjust time</p>
          </>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={toggleTimer} className="flex-1 bg-primary hover:bg-primary/90">
          {isActive ? "PAUSE" : "START"}
        </Button>
        <Button size="icon" variant="outline" onClick={resetTimer}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
