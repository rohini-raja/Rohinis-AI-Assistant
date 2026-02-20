import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Timer, Coffee, Flame, RotateCcw } from "lucide-react";

type TimerMode = "SAGE" | "BREAK";

export function NinjaTimer() {
  const [mode, setMode] = useState<TimerMode>("SAGE");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: sound notification
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

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
          {mode === "SAGE" ? "SAGE MODE" : "NINJA TACTIC"}
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

      <div className="text-center py-4">
        <span className="text-5xl font-mono font-bold text-white tracking-tighter">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
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
