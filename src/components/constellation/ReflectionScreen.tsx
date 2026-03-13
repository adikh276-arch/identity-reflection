import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { StarData } from "@/pages/Index";

interface ReflectionScreenProps {
  stars: StarData[];
  onSave: () => void;
  onCreateAnother: () => void;
}

const ReflectionScreen = ({ stars, onSave, onCreateAnother }: ReflectionScreenProps) => {
  const { t } = useTranslation();
  const minX = Math.min(...stars.map((s) => s.x));
  const maxX = Math.max(...stars.map((s) => s.x));
  const minY = Math.min(...stars.map((s) => s.y));
  const maxY = Math.max(...stars.map((s) => s.y));
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const normalized = stars.map((s) => ({
    ...s,
    nx: 30 + ((s.x - minX) / rangeX) * 190,
    ny: 30 + ((s.y - minY) / rangeY) * 190,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex flex-col items-center px-4 text-center max-w-sm mx-auto"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="mb-6"
      >
        <svg width="260" height="260" viewBox="0 0 260 260">
          {normalized.map((star, i) => {
            if (i === 0) return null;
            const prev = normalized[i - 1];
            return (
              <motion.line
                key={`line-${i}`}
                x1={prev.nx} y1={prev.ny} x2={star.nx} y2={star.ny}
                className="stroke-constellation"
                strokeWidth="1.5" opacity="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5 + i * 0.3, duration: 0.8 }}
              />
            );
          })}
          {normalized.map((star, i) => (
            <motion.g
              key={star.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.2, type: "spring", stiffness: 150 }}
            >
              <circle cx={star.nx} cy={star.ny} r="6" className="fill-star-selected glow-star" />
              <circle cx={star.nx} cy={star.ny} r="10" fill="none" className="stroke-star-selected" strokeWidth="0.5" opacity="0.3" />
              <text
                x={star.nx} y={star.ny + 18}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-reflection"
              >
                {star.label}
              </text>
            </motion.g>
          ))}
        </svg>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="font-reflection text-base leading-relaxed text-foreground/90 mb-8 text-justified"
      >
        {t("reflection_text")}
        <br />
        <span className="text-accent-lavender">
          {t("reflection_subtext")}
        </span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="flex flex-col gap-3 w-full"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="bg-gradient-primary px-8 py-2.5 rounded-full text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/30"
        >
          {t("save_button")}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateAnother}
          className="px-8 py-2.5 rounded-full border border-secondary text-secondary font-semibold text-sm hover:bg-secondary/10 transition-colors"
        >
          {t("create_another")}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ReflectionScreen;
