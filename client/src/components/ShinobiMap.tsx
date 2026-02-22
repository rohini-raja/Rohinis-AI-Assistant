import { motion } from "framer-motion";
import { SHINOBI_DATA } from "@/hooks/use-tasks";
import { MapPin, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ShinobiMapProps {
  tasks: any[];
  onVillageClick: (villageId: string) => void;
  activeVillage?: string;
}

const VILLAGE_POSITIONS: Record<string, { x: string; y: string }> = {
  leaf: { x: "50%", y: "45%" },
  sand: { x: "25%", y: "60%" },
  mist: { x: "80%", y: "50%" },
  cloud: { x: "70%", y: "20%" },
  rock: { x: "30%", y: "25%" },
};

export function ShinobiMap({ tasks, onVillageClick, activeVillage }: ShinobiMapProps) {
  return (
    <div className="relative w-full aspect-[16/9] bg-neutral-950 rounded-xl border-2 border-primary/30 overflow-hidden shadow-2xl group/map">
      {/* Map Background (Stylized) */}
      <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-[10px] font-mono text-primary/20 uppercase tracking-[0.5em] rotate-45">Great Ninja Ocean</div>
        <div className="absolute bottom-20 right-20 text-[10px] font-mono text-primary/20 uppercase tracking-[0.5em] -rotate-12">Land of Iron</div>
      </div>

      <TooltipProvider>
        {SHINOBI_DATA.villages.map((village) => {
          const pos = VILLAGE_POSITIONS[village.id] || { x: "0%", y: "0%" };
          const villageTasks = tasks.filter(t => t.village === village.id && t.status === 'pending');
          const isActive = activeVillage === village.id;

          return (
            <Tooltip key={village.id}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => onVillageClick(village.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group`}
                  style={{ left: pos.x, top: pos.y }}
                  whileHover={{ scale: 1.2 }}
                >
                  <div className="relative">
                    {/* Pulsing ring for active missions */}
                    {villageTasks.length > 0 && (
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-primary"
                      />
                    )}
                    
                    <div className={`p-2 rounded-full border-2 transition-all duration-300 ${isActive ? 'bg-primary border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-neutral-900 border-primary/50 group-hover:border-primary'}`}>
                      <MapPin className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                    </div>

                    {/* Task count badge */}
                    {villageTasks.length > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-black">
                        {villageTasks.length}
                      </div>
                    )}
                  </div>
                  
                  <span className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-display uppercase tracking-widest transition-colors ${isActive ? 'text-primary' : 'text-neutral-500 group-hover:text-primary'}`}>
                    {village.name}
                  </span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent className="bg-neutral-900 border-primary/50 text-white p-2">
                <p className="font-display text-primary">{village.name}</p>
                <p className="text-[10px] text-neutral-400">{villageTasks.length} Active Missions</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-neutral-900/80 backdrop-blur-sm p-2 rounded border border-primary/20 text-[10px] font-mono text-neutral-400">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Active Mission Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neutral-700" />
          <span>No Missions Pending</span>
        </div>
      </div>
    </div>
  );
}
