import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SEALS = [
  { name: "Tiger", kanji: "寅", bg: "虎" },
  { name: "Snake", kanji: "巳", bg: "蛇" },
  { name: "Ox", kanji: "丑", bg: "牛" },
  { name: "Dog", kanji: "犬", bg: "狗" },
  { name: "Ram", kanji: "未", bg: "羊" },
];

const SEAL_DURATION = 150;
const FINISH_DELAY = SEALS.length * SEAL_DURATION + 50;
const HIDE_DELAY = FINISH_DELAY + 700;

export function HandSealAnimation() {
  const [visible, setVisible] = useState(false);
  const [currentSeal, setCurrentSeal] = useState(0);
  const [showFinish, setShowFinish] = useState(false);

  useEffect(() => {
    const handle = () => {
      setVisible(true);
      setCurrentSeal(0);
      setShowFinish(false);

      SEALS.forEach((_, i) => {
        setTimeout(() => setCurrentSeal(i), i * SEAL_DURATION);
      });
      setTimeout(() => setShowFinish(true), FINISH_DELAY);
      setTimeout(() => { setVisible(false); setShowFinish(false); }, HIDE_DELAY);
    };

    window.addEventListener("task-completed", handle);
    return () => window.removeEventListener("task-completed", handle);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px]" />

          {!showFinish ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSeal}
                initial={{ scale: 0.4, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center select-none"
              >
                <span
                  className="absolute text-[160px] font-black leading-none opacity-[0.06] text-white"
                  style={{ fontFamily: "serif", top: "-40px" }}
                >
                  {SEALS[currentSeal].bg}
                </span>
                <span
                  className="text-[88px] font-black leading-none relative z-10 drop-shadow-[0_0_40px_rgba(255,120,0,0.9)]"
                  style={{ fontFamily: "serif", color: "hsl(var(--primary))" }}
                >
                  {SEALS[currentSeal].kanji}
                </span>
                <p className="text-white/50 text-[10px] font-mono uppercase tracking-[0.6em] mt-3">
                  {SEALS[currentSeal].name}
                </p>
                <div className="flex gap-1.5 mt-3">
                  {SEALS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-100 ${i <= currentSeal ? "bg-primary" : "bg-white/20"}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative z-10 text-center select-none"
            >
              <motion.p
                className="text-5xl font-display tracking-[0.15em] drop-shadow-[0_0_50px_rgba(255,120,0,1)]"
                style={{ color: "hsl(var(--primary))" }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.4, repeat: 1 }}
              >
                MISSION COMPLETE
              </motion.p>
              <p className="text-white/30 text-[10px] font-mono uppercase tracking-[0.5em] mt-3">
                Shadow Clone Dispelled
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
