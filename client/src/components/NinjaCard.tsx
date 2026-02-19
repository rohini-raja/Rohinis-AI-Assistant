import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NinjaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "scroll" | "plate";
}

export function NinjaCard({ children, className, variant = "default", ...props }: NinjaCardProps) {
  if (variant === "scroll") {
    return (
      <div className={cn("relative my-4 group", className)} {...props}>
        {/* Scroll Top Roll */}
        <div className="h-4 bg-amber-100 border-2 border-neutral-800 rounded-full relative z-10 shadow-md flex items-center justify-center">
           <div className="w-full h-1 bg-neutral-300 opacity-50"></div>
        </div>
        
        {/* Scroll Content Body */}
        <div className="bg-[#fdfbf7] mx-2 border-x-2 border-neutral-800 p-6 min-h-[100px] ninja-scroll-bg shadow-inner relative">
          {children}
        </div>

        {/* Scroll Bottom Roll */}
        <div className="h-4 bg-amber-100 border-2 border-neutral-800 rounded-full relative z-10 shadow-md flex items-center justify-center -mt-0.5">
           <div className="w-full h-1 bg-neutral-300 opacity-50"></div>
        </div>
      </div>
    );
  }

  if (variant === "plate") {
    return (
      <div className={cn(
        "bg-neutral-800 border-4 border-neutral-600 rounded-sm p-1 shadow-lg",
        className
      )} {...props}>
        <div className="bg-neutral-900 border border-neutral-700 p-4 h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
          {children}
        </div>
      </div>
    );
  }

  // Default Card (Kunai-style sharp edges)
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card text-card-foreground border-l-4 border-primary shadow-lg p-6 relative overflow-hidden",
        "before:content-[''] before:absolute before:top-0 before:right-0 before:w-0 before:h-0 before:border-t-[20px] before:border-r-[20px] before:border-t-primary before:border-r-transparent",
        className
      )} 
      {...props}
    >
      {children}
    </motion.div>
  );
}
