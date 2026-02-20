import { Card } from "@/components/ui/card";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NinjaMelodies() {
  return (
    <Card className="p-4 bg-neutral-900 border-primary/30 shadow-lg">
      <h3 className="text-lg font-display text-primary flex items-center gap-2 mb-4">
        <Music className="h-5 w-5" />
        NINJA MELODIES
      </h3>
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-full h-24 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="text-center z-10">
            <p className="text-xs text-primary font-bold animate-pulse">CHAKRA FLOWING...</p>
            <p className="text-[10px] text-neutral-500 mt-1 uppercase">Naruto Main Theme (Lofi)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button size="icon" variant="ghost" className="text-neutral-400">
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button size="icon" className="bg-primary text-primary-foreground h-12 w-12 rounded-full shadow-[0_0_15px_rgba(255,100,0,0.3)]">
            <Play className="h-6 w-6" />
          </Button>
          <Button size="icon" variant="ghost" className="text-neutral-400">
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        <div className="w-full flex items-center gap-2 px-2">
          <Volume2 className="h-4 w-4 text-neutral-500" />
          <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div className="w-2/3 h-full bg-primary" />
          </div>
        </div>
      </div>
      
      <p className="text-[10px] text-neutral-600 mt-4 text-center italic">
        "Listen to the rhythm of the wind..."
      </p>
    </Card>
  );
}
