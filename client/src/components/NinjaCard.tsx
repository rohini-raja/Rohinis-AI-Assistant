import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SHINOBI_DATA } from "@/hooks/use-tasks";

interface NinjaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "scroll" | "plate";
  village?: string;
  character?: string;
}

export function NinjaCard({ children, className, variant = "default", village = "leaf", character, ...props }: NinjaCardProps) {
  const villageData = SHINOBI_DATA.villages.find(v => v.id === village) || SHINOBI_DATA.villages[0];
  const charData = SHINOBI_DATA.characters.find(c => c.id === character);

  if (variant === "scroll") {
    return (
      <div className={cn("relative my-4 group", className)} {...props}>
        {/* Scroll Top Roll */}
        <div className="h-4 bg-amber-100 border-2 border-neutral-800 rounded-full relative z-10 shadow-md flex items-center justify-center">
           <div className="w-full h-1 bg-neutral-300 opacity-50"></div>
        </div>
        
        {/* Scroll Content Body */}
        <div 
          className="bg-[#fdfbf7] mx-2 border-x-2 border-neutral-800 p-6 min-h-[100px] ninja-scroll-bg shadow-inner relative"
          style={{ borderLeftColor: `hsl(${villageData.color})`, borderRightColor: `hsl(${villageData.color})` }}
        >
          {children}
        </div>

        {/* Scroll Bottom Roll */}
        <div className="h-4 bg-amber-100 border-2 border-neutral-800 rounded-full relative z-10 shadow-md flex items-center justify-center -mt-0.5">
           <div className="w-full h-1 bg-neutral-300 opacity-50"></div>
        </div>
      </div>
    );
  }

  // Default Card (Kunai-style sharp edges)
  return (
    <div 
      className={cn(
        "bg-card text-card-foreground border-l-4 shadow-lg p-6 relative overflow-hidden transition-all duration-300",
        "before:content-[''] before:absolute before:top-0 before:right-0 before:w-0 before:h-0 before:border-t-[20px] before:border-r-[20px] before:border-t-primary before:border-r-transparent",
        className
      )} 
      style={{ borderLeftColor: `hsl(${villageData.color})` }}
      {...props}
    >
      {/* Character Watermark */}
      {character && (
        <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.05] pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-500">
           <img 
            src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character}&backgroundColor=transparent`} 
            alt={character}
            className="w-full h-full grayscale invert"
          />
        </div>
      )}
      {children}
    </div>
  );
}
