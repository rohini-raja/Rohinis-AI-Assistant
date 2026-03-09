import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coffee, Flame, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TimerMode = "SAGE" | "BREAK";

const SAGE_PRESETS = [15, 25, 45, 60];
const BREAK_PRESETS = [5, 10, 15, 20];

export function NinjaTimer() {
  const [mode, setMode] = useState<TimerMode>("SAGE");
  const [sageDuration, setSageDuration] = useState(parseInt(localStorage.getItem("ninja-sage-duration") || "25"));
  const [breakDuration, setBreakDuration] = useState(parseInt(localStorage.getItem("ninja-break-duration") || "5"));
  const [timeLeft, setTimeLeft] = useState(mode === "SAGE" ? sageDuration * 60 : breakDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(mode === "SAGE" ? sageDuration * 60 : breakDuration * 60);
    }
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
          if (mode === "SAGE" && (sageDuration * 60 - newTime) % 1200 === 0 && (sageDuration * 60 - newTime) > 0) {
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
    setTimeLeft(mode === "SAGE" ? sageDuration * 60 : breakDuration * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === "SAGE" ? sageDuration * 60 : breakDuration * 60);
  };

  const selectPreset = (mins: number) => {
    if (isActive) return;
    if (mode === "SAGE") {
      setSageDuration(mins);
    } else {
      setBreakDuration(mins);
    }
  };

  const currentDuration = mode === "SAGE" ? sageDuration : breakDuration;
  const presets = mode === "SAGE" ? SAGE_PRESETS : BREAK_PRESETS;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = currentDuration * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

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
            data-testid="timer-mode-sage"
          >
            SAGE
          </Button>
          <Button 
            size="sm" 
            variant={mode === "BREAK" ? "default" : "outline"} 
            onClick={() => switchMode("BREAK")}
            className="text-[10px] h-7 px-2"
            data-testid="timer-mode-break"
          >
            BREAK
          </Button>
        </div>
      </div>

      <div className="flex justify-center gap-1 mb-3">
        {presets.map((mins) => (
          <Button
            key={mins}
            size="sm"
            variant={currentDuration === mins ? "default" : "outline"}
            onClick={() => selectPreset(mins)}
            disabled={isActive}
            className="text-[10px] h-6 px-2 min-w-[36px]"
            data-testid={`timer-preset-${mins}`}
          >
            {mins}m
          </Button>
        ))}
      </div>

      <div className="relative mb-2">
        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-center py-3 relative group">
        {isEditing ? (
          <div className="flex flex-col gap-2 items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">Set {mode}:</span>
              <input 
                type="number" 
                value={currentDuration}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(180, parseInt(e.target.value) || 1));
                  if (mode === "SAGE") setSageDuration(val);
                  else setBreakDuration(val);
                }}
                className="w-16 bg-neutral-950 border border-primary/30 rounded px-2 py-1 text-white text-xl font-mono"
                data-testid="timer-custom-input"
              />
              <span className="text-[10px] font-bold text-neutral-500 uppercase">Min</span>
            </div>
            <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setIsEditing(false)} data-testid="timer-save-custom">SAVE</Button>
          </div>
        ) : (
          <>
            <span 
              className="text-5xl font-mono font-bold text-white tracking-tighter cursor-pointer hover:text-primary transition-colors"
              onClick={() => !isActive && setIsEditing(true)}
              data-testid="timer-display"
            >
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
            <p className="text-[8px] text-neutral-600 uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to set custom time</p>
          </>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <Button onClick={toggleTimer} className="flex-1 bg-primary hover:bg-primary/90" data-testid="timer-toggle">
          {isActive ? "PAUSE" : "START"}
        </Button>
        <Button size="icon" variant="outline" onClick={resetTimer} data-testid="timer-reset">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
