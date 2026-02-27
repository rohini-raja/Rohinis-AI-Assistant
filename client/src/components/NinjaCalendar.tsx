import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { motion } from "framer-motion";

interface NinjaCalendarProps {
  tasks: any[];
}

export function NinjaCalendar({ tasks }: NinjaCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <Card className="p-4 bg-neutral-900 border-primary/30 shadow-lg">
      <h3 className="text-lg font-display text-primary flex items-center gap-2 mb-4 uppercase">
        <Calendar className="h-5 w-5" />
        Mission Schedule
      </h3>
      
      <div className="flex items-center justify-between mb-4 px-2">
        <button 
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
          className="text-primary hover:text-white transition-colors"
        >
          ◀
        </button>
        <span className="font-display text-sm tracking-widest text-white uppercase">
          {format(currentDate, 'MMMM yyyy')}
        </span>
        <button 
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
          className="text-primary hover:text-white transition-colors"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-neutral-600">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dayTasks = tasks.filter(t => t.createdAt && isSameDay(new Date(t.createdAt), day));
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={i} 
              className={`aspect-square rounded border flex flex-col items-center justify-center relative transition-colors ${
                isToday ? 'bg-primary/20 border-primary' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <span className={`text-[10px] ${isToday ? 'text-primary font-bold' : 'text-neutral-500'}`}>
                {format(day, 'd')}
              </span>
              
              {dayTasks.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayTasks.slice(0, 3).map((_, idx) => (
                    <div key={idx} className="w-1 h-1 rounded-full bg-primary shadow-[0_0_3px_rgba(255,100,0,0.8)]" />
                  ))}
                </div>
              )}
              
              {isToday && (
                <motion.div 
                  layoutId="active-day"
                  className="absolute inset-0 border-2 border-primary/40 rounded pointer-events-none"
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      <p className="text-[9px] text-neutral-600 mt-4 text-center italic uppercase tracking-tighter">
        "A ninja must see through deception..."
      </p>
    </Card>
  );
}
