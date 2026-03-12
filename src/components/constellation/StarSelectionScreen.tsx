import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { StarData } from "@/pages/Index";

interface StarSelectionScreenProps {
  onComplete: (stars: StarData[]) => void;
  onBack: () => void;
}

const PROMPTS = [
  "What part of you shines here?",
  "Add a word that represents you.",
  "What strength lives in this star?",
  "Name something that makes you you.",
  "What quality lights up your sky?",
  "What part of your story belongs here?",
  "What strength has carried you forward?",
  "What word describes a piece of your identity?",
  "What part of yourself are you proud of?",
  "What inner light does this star hold?",
];

const SUGGESTIONS = [
  "courage", "creative", "soft", "queer", "survivor",
  "resilient", "friend", "kind", "dreamer", "curious",
];

const FIELD_SIZE = 300;

const StarSelectionScreen = ({ onComplete, onBack }: StarSelectionScreenProps) => {
  const starPositions = useMemo(() => {
    const positions: { id: number; x: number; y: number }[] = [];
    const count = 10;
    const center = FIELD_SIZE / 2;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const radius = FIELD_SIZE * 0.28 + Math.random() * (FIELD_SIZE * 0.18);
      positions.push({
        id: i,
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius,
      });
    }
    return positions;
  }, []);

  const [labeledStars, setLabeledStars] = useState<StarData[]>([]);
  const [activeStar, setActiveStar] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);

  const handleStarTap = useCallback((id: number) => {
    if (labeledStars.length >= 6 && !labeledStars.find((s) => s.id === id)) return;
    if (labeledStars.find((s) => s.id === id)) return;
    setActiveStar(id);
    setInputValue("");
    setPromptIndex(Math.floor(Math.random() * PROMPTS.length));
  }, [labeledStars]);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || activeStar === null) return;
    const pos = starPositions.find((s) => s.id === activeStar)!;
    const newStar: StarData = { id: activeStar, x: pos.x, y: pos.y, label: inputValue.trim() };
    setLabeledStars((prev) => [...prev, newStar]);
    setActiveStar(null);
    setInputValue("");
  }, [inputValue, activeStar, starPositions]);

  const handleChip = useCallback((word: string) => {
    setInputValue(word);
  }, []);

  const isLabeled = (id: number) => labeledStars.some((s) => s.id === id);
  const canComplete = labeledStars.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center w-full max-w-sm mx-auto px-3"
    >
      {/* Header with back button */}
      <div className="w-full flex items-center mb-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 rounded-full hover:bg-muted/50 transition-colors text-foreground/70"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <p className="flex-1 text-center font-reflection text-sm text-foreground/80 text-justified pr-9">
          Tap stars to add parts of who you are.
        </p>
      </div>

      {/* Instruction box */}
      <div className="w-full mb-4 px-3 py-2.5 rounded-xl bg-card/50 border border-border/40">
        <p className="text-xs text-accent-lavender font-reflection text-justified leading-relaxed">
          Choose a star and name a strength, identity, or quality that shines in you.
        </p>
      </div>

      {/* Star field - responsive */}
      <div className="relative mx-auto" style={{ width: FIELD_SIZE, height: FIELD_SIZE }}>
        <svg width={FIELD_SIZE} height={FIELD_SIZE} className="absolute inset-0">
          {labeledStars.length > 1 &&
            labeledStars.map((star, i) => {
              if (i === 0) return null;
              const prev = labeledStars[i - 1];
              return (
                <motion.line
                  key={`line-${prev.id}-${star.id}`}
                  x1={prev.x} y1={prev.y} x2={star.x} y2={star.y}
                  className="stroke-constellation"
                  strokeWidth="1.5"
                  opacity="0.6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              );
            })}
        </svg>

        {starPositions.map((star) => {
          const labeled = isLabeled(star.id);
          const isActive = activeStar === star.id;
          const labelData = labeledStars.find((s) => s.id === star.id);

          return (
            <motion.div
              key={star.id}
              className="absolute cursor-pointer"
              style={{ left: star.x - 14, top: star.y - 14 }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleStarTap(star.id)}
            >
              <motion.div
                animate={labeled ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <svg width="28" height="28" viewBox="0 0 32 32">
                  <circle
                    cx="16" cy="16"
                    r={labeled ? 7 : 4.5}
                    className={`${
                      labeled
                        ? "fill-star-selected glow-star"
                        : isActive
                        ? "fill-star-selected"
                        : "fill-star glow-star-default"
                    }`}
                  />
                  {labeled && (
                    <circle cx="16" cy="16" r="11" fill="none" className="stroke-star-selected" strokeWidth="0.5" opacity="0.3" />
                  )}
                </svg>
              </motion.div>
              {labeled && labelData && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-star-selected whitespace-nowrap font-reflection"
                >
                  {labelData.label}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Input area */}
      <AnimatePresence>
        {activeStar !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-5 w-full"
          >
            <p className="text-xs text-accent-lavender mb-2 text-justified font-reflection">
              {PROMPTS[promptIndex]}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Type a word…"
                maxLength={20}
                className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className="bg-gradient-primary px-4 py-2 rounded-lg text-primary-foreground text-sm font-semibold disabled:opacity-40"
              >
                Add
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTIONS.map((word) => (
                <button
                  key={word}
                  onClick={() => handleChip(word)}
                  className="px-2.5 py-0.5 rounded-full text-[11px] bg-muted/60 text-foreground/70 hover:bg-secondary/30 hover:text-foreground transition-colors border border-border/50"
                >
                  {word}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete button */}
      {canComplete && activeStar === null && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(labeledStars)}
          className="mt-6 bg-gradient-primary px-8 py-2.5 rounded-full text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/30"
        >
          View My Constellation
        </motion.button>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        {labeledStars.length}/6 stars labeled
      </p>
    </motion.div>
  );
};

export default StarSelectionScreen;
